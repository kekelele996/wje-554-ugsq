import { ForbiddenException, Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { OrderStatus, UserRole, WorkerStatus } from '../../constants/enums';
import { orders, services, users, workers } from '../demo-data';
import { NotificationService } from '../notification/notification.service';
import { WorkerService } from '../worker/worker.service';
import { WorkerEntity } from '../worker/entities/worker.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from './entities/order.entity';

const transitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
  [OrderStatus.ASSIGNED]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
  [OrderStatus.ACCEPTED]: [OrderStatus.ON_THE_WAY, OrderStatus.CANCELLED],
  [OrderStatus.ON_THE_WAY]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [OrderStatus.RATED],
  [OrderStatus.RATED]: [],
  [OrderStatus.CANCELLED]: []
};

export type AssignBlockCode = 'WORKER_NOT_ONLINE' | 'CATEGORY_MISMATCH' | 'TIME_CONFLICT';

export interface AssignConflict {
  orderId: string;
  orderNo: string;
  status: OrderStatus;
  scheduledTime: string;
  occupiedUntil: string;
}

export interface AssignBlock {
  code: AssignBlockCode;
  message: string;
  conflicts?: AssignConflict[];
}

@Injectable()
export class OrderService {
  constructor(private readonly workerService: WorkerService, private readonly notification: NotificationService) {}

  list(user: { sub: string; role: UserRole }, status?: OrderStatus) {
    return orders.filter((order) => {
      if (status && order.status !== status) return false;
      if (user.role === UserRole.ADMIN) return true;
      if (user.role === UserRole.CUSTOMER) return order.customerId === user.sub;
      const worker = this.workerService.findByUserId(user.sub);
      return worker ? order.workerId === worker.id : false;
    }).map((order) => this.hydrate(order));
  }

  detail(user: { sub: string; role: UserRole }, id: string) {
    const order = this.mustFind(id);
    if (!this.canAccess(user, order)) throw new ForbiddenException('无权查看该订单');
    return this.hydrate(order);
  }

  create(user: { sub: string; role: UserRole }, dto: CreateOrderDto) {
    if (user.role !== UserRole.CUSTOMER) throw new ForbiddenException('仅 Customer 可下单');
    const service = services.find((item) => item.id === dto.serviceItemId);
    if (!service) throw new NotFoundException('服务项目不存在');
    const order: OrderEntity = {
      id: crypto.randomUUID(),
      orderNo: `HS-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(orders.length + 1).padStart(4, '0')}`,
      serviceItemId: dto.serviceItemId,
      customerId: user.sub,
      address: dto.address,
      addressDetail: dto.addressDetail,
      contactPhone: dto.contactPhone,
      scheduledTime: dto.scheduledTime,
      status: OrderStatus.PENDING,
      totalPrice: dto.totalPrice || service.basePrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    orders.unshift(order);
    service.orderCount += 1;
    this.notification.notify({ type: 'order:status_changed', title: '新订单待派单', message: order.orderNo, orderId: order.id });
    return this.hydrate(order);
  }

  updateStatus(user: { sub: string; role: UserRole }, id: string, status: OrderStatus, workerId?: string) {
    const order = this.mustFind(id);
    if (!transitions[order.status].includes(status)) throw new BadRequestException(`订单不能从 ${order.status} 流转到 ${status}`);
    if (status === OrderStatus.ASSIGNED) {
      return this.assign(user, id, workerId);
    }
    if ([OrderStatus.ACCEPTED, OrderStatus.ON_THE_WAY, OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED].includes(status)) {
      const worker = this.workerService.findByUserId(user.sub);
      if (user.role !== UserRole.WORKER || !worker || worker.id !== order.workerId) throw new ForbiddenException('仅订单技师可更新该状态');
      if (status === OrderStatus.COMPLETED) {
        order.actualDuration = 96;
        worker.totalOrders += 1;
      }
    }
    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.notification.notify({
      type: status === OrderStatus.ON_THE_WAY ? 'order:worker_arriving' : 'order:status_changed',
      title: '订单状态更新',
      message: `${order.orderNo} 已更新为 ${status}`,
      orderId: order.id,
      userIds: [order.customerId, order.workerId || ''].filter(Boolean)
    });
    return this.hydrate(order);
  }

  /** 派单门禁：列出某订单可派给的技师及被拦截原因（Admin 派单/改派列表） */
  assignableWorkers(user: { sub: string; role: UserRole }, id: string) {
    if (user.role !== UserRole.ADMIN) throw new ForbiddenException('仅 Admin 可查看可派单技师');
    const order = this.mustFind(id);
    return workers.map((worker) => {
      const blocks = this.assignBlocks(order, worker);
      return { worker, eligible: blocks.length === 0, blocks };
    });
  }

  /**
   * 派单/改派（仅 Admin）。先完成全部门禁校验再落库：
   * 目标不合规、时段冲突或保存失败时，原技师与订单状态保持不动。
   */
  assign(user: { sub: string; role: UserRole }, id: string, workerId?: string) {
    if (user.role !== UserRole.ADMIN) throw new ForbiddenException('仅 Admin 可派单');
    const order = this.mustFind(id);
    if (![OrderStatus.PENDING, OrderStatus.ASSIGNED].includes(order.status)) {
      throw new BadRequestException(`订单状态为 ${order.status}，不可派单/改派`);
    }
    let targetId = workerId;
    if (!targetId) {
      const candidate = workers.find((worker) => this.assignBlocks(order, worker).length === 0);
      if (!candidate) throw new BadRequestException('当前没有符合派单条件的在线技师');
      targetId = candidate.id;
    }
    const worker = workers.find((item) => item.id === targetId);
    if (!worker) throw new NotFoundException('技师不存在');
    const blocks = this.assignBlocks(order, worker);
    if (blocks.length) {
      throw new ConflictException({
        message: `派单被拦截：${blocks.map((block) => block.message).join('；')}`,
        reason: blocks[0].code,
        blocks,
        order: { id: order.id, orderNo: order.orderNo, status: order.status, workerId: order.workerId ?? null }
      });
    }
    const previousWorker = workers.find((item) => item.id === order.workerId);
    order.workerId = worker.id;
    order.status = OrderStatus.ASSIGNED;
    order.updatedAt = new Date().toISOString();
    const isReassign = Boolean(previousWorker && previousWorker.id !== worker.id);
    this.notification.notify({
      type: 'order:status_changed',
      title: isReassign ? '订单已改派' : '订单已派单',
      message: `订单 ${order.orderNo} 已${isReassign ? '改派' : '派单'}给技师 ${worker.name}`,
      orderId: order.id,
      userIds: [order.customerId]
    });
    if (isReassign && previousWorker) {
      this.notification.notify({
        type: 'order:status_changed',
        title: '订单已改派',
        message: `订单 ${order.orderNo} 已改派给其他技师`,
        orderId: order.id,
        userIds: [previousWorker.userId]
      });
    }
    this.notification.notify({
      type: 'order:new_assignment',
      title: isReassign ? '改派订单通知' : '新派单通知',
      message: `订单 ${order.orderNo} 已分配给你，请及时接单`,
      orderId: order.id,
      userIds: [worker.userId]
    });
    return this.hydrate(order);
  }

  rate(user: { sub: string; role: UserRole }, id: string, rating: number, comment: string) {
    const order = this.mustFind(id);
    if (user.role !== UserRole.CUSTOMER || order.customerId !== user.sub) throw new ForbiddenException('仅订单客户可评价');
    if (order.status !== OrderStatus.COMPLETED) throw new BadRequestException('仅已完工订单可评价');
    order.rating = rating;
    order.comment = comment;
    order.status = OrderStatus.RATED;
    order.updatedAt = new Date().toISOString();
    return this.hydrate(order);
  }

  cancel(user: { sub: string; role: UserRole }, id: string, reason: string) {
    const order = this.mustFind(id);
    if (![UserRole.ADMIN, UserRole.CUSTOMER].includes(user.role) || (user.role === UserRole.CUSTOMER && order.customerId !== user.sub)) {
      throw new ForbiddenException('无权取消该订单');
    }
    if (order.status === OrderStatus.RATED) throw new BadRequestException('已评价订单不能取消');
    order.status = OrderStatus.CANCELLED;
    order.cancelReason = reason;
    order.updatedAt = new Date().toISOString();
    return this.hydrate(order);
  }

  /** 派单门禁校验：类目匹配 + 状态在线 + 时段不冲突，返回全部拦截原因（空数组表示可派单） */
  private assignBlocks(order: OrderEntity, worker: WorkerEntity): AssignBlock[] {
    const blocks: AssignBlock[] = [];
    const service = services.find((item) => item.id === order.serviceItemId);
    if (worker.status !== WorkerStatus.ONLINE) {
      blocks.push({ code: 'WORKER_NOT_ONLINE', message: `技师状态为 ${worker.status}，仅在线技师可接单` });
    }
    if (service && !worker.specialties.includes(service.category)) {
      blocks.push({ code: 'CATEGORY_MISMATCH', message: `技师擅长类目不含 ${service.category}` });
    }
    const window = this.occupiedWindow(order);
    const conflicts = orders
      .filter((item) => item.id !== order.id && item.workerId === worker.id && this.occupiesWorker(item))
      .filter((item) => {
        const other = this.occupiedWindow(item);
        return window.start < other.end && other.start < window.end;
      })
      .map((item) => ({
        orderId: item.id,
        orderNo: item.orderNo,
        status: item.status,
        scheduledTime: item.scheduledTime,
        occupiedUntil: new Date(this.occupiedWindow(item).end).toISOString()
      }));
    if (conflicts.length) {
      blocks.push({ code: 'TIME_CONFLICT', message: `与 ${conflicts.length} 个未取消、未评价订单时段冲突`, conflicts });
    }
    return blocks;
  }

  /** 未取消、未评价的订单会占用技师时段 */
  private occupiesWorker(order: OrderEntity) {
    return order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.RATED;
  }

  /** 订单占用技师时段：[预约时间, 预约时间 + 服务时长] */
  private occupiedWindow(order: OrderEntity) {
    const service = services.find((item) => item.id === order.serviceItemId);
    const start = new Date(order.scheduledTime).getTime();
    const durationMinutes = service?.duration ?? 0;
    return { start, end: start + durationMinutes * 60_000 };
  }

  private mustFind(id: string) {
    const order = orders.find((item) => item.id === id);
    if (!order) throw new NotFoundException('订单不存在');
    return order;
  }

  private canAccess(user: { sub: string; role: UserRole }, order: OrderEntity) {
    if (user.role === UserRole.ADMIN) return true;
    if (user.role === UserRole.CUSTOMER) return order.customerId === user.sub;
    const worker = this.workerService.findByUserId(user.sub);
    return worker?.id === order.workerId;
  }

  private hydrate(order: OrderEntity) {
    return {
      ...order,
      serviceItem: services.find((service) => service.id === order.serviceItemId),
      customer: users.find((customer) => customer.id === order.customerId),
      worker: workers.find((worker) => worker.id === order.workerId)
    };
  }
}
