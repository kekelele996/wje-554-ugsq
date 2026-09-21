import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, UserRole, WorkerStatus } from '../../constants/enums';
import { orders, services, users, workers } from '../demo-data';
import { NotificationService } from '../notification/notification.service';
import { WorkerEntity } from '../worker/entities/worker.entity';
import { WorkerService } from '../worker/worker.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { DispatchCandidates, DispatchConflict } from './entities/dispatch.entity';
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

// 允许派单/改派的订单状态：待派单、已派单、已接单（技师未出发前仍可改派）
const dispatchableStatuses = [OrderStatus.PENDING, OrderStatus.ASSIGNED, OrderStatus.ACCEPTED];

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

  dispatchCandidates(user: { sub: string; role: UserRole }, id: string): DispatchCandidates {
    if (user.role !== UserRole.ADMIN) throw new ForbiddenException('仅 Admin 可查看派单候选');
    const order = this.mustFind(id);
    const service = services.find((item) => item.id === order.serviceItemId);
    const slot = this.orderSlot(order);
    return {
      order: {
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        category: service?.category,
        duration: service?.duration ?? 0,
        scheduledTime: order.scheduledTime,
        occupiedUntil: slot.endIso,
        workerId: order.workerId
      },
      candidates: workers.map((worker) => {
        const conflicts = this.collectDispatchConflicts(order, worker);
        return {
          worker,
          eligible: conflicts.length === 0,
          reasons: conflicts.map((item) => item.reason),
          conflicts
        };
      })
    };
  }

  assign(user: { sub: string; role: UserRole }, id: string, workerId: string) {
    if (user.role !== UserRole.ADMIN) throw new ForbiddenException('仅 Admin 可派单');
    const order = this.mustFind(id);
    if (!dispatchableStatuses.includes(order.status)) {
      throw new BadRequestException(`订单当前状态为 ${order.status}，不可派单或改派`);
    }
    const worker = workers.find((item) => item.id === workerId);
    if (!worker) throw new NotFoundException('技师不存在');
    if (order.workerId === worker.id) throw new BadRequestException('订单已派给该技师，无需重复派单');

    // 派单门禁：类目匹配、技师在线、时段不重叠，任一不满足则整体拒绝
    const conflicts = this.collectDispatchConflicts(order, worker);
    if (conflicts.length) {
      throw new ConflictException({
        message: `派单失败：${conflicts.map((item) => item.reason).join('；')}`,
        conflicts
      });
    }

    // 校验全部通过后一次性落库；保存失败时恢复快照，原技师与订单状态保持不动
    const previousWorkerId = order.workerId;
    const snapshot = { workerId: order.workerId, status: order.status, updatedAt: order.updatedAt };
    try {
      order.workerId = worker.id;
      if (order.status === OrderStatus.PENDING) order.status = OrderStatus.ASSIGNED;
      order.updatedAt = new Date().toISOString();
      this.saveOrder(order);
    } catch (error) {
      Object.assign(order, snapshot);
      throw error;
    }

    this.notifyAssignment(order, worker, previousWorkerId);
    return this.hydrate(order);
  }

  updateStatus(user: { sub: string; role: UserRole }, id: string, status: OrderStatus, workerId?: string) {
    const order = this.mustFind(id);
    if (!transitions[order.status].includes(status)) throw new BadRequestException(`订单不能从 ${order.status} 流转到 ${status}`);
    if (status === OrderStatus.ASSIGNED) {
      // 派单统一走门禁校验，不再回退到默认技师
      if (!workerId) throw new BadRequestException('派单必须指定技师');
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
    const workerUserId = workers.find((item) => item.id === order.workerId)?.userId;
    this.notification.notify({
      type: status === OrderStatus.ON_THE_WAY ? 'order:worker_arriving' : 'order:status_changed',
      title: '订单状态更新',
      message: `${order.orderNo} 已更新为 ${status}`,
      orderId: order.id,
      userIds: [order.customerId, workerUserId || ''].filter(Boolean)
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

  private collectDispatchConflicts(order: OrderEntity, worker: WorkerEntity): DispatchConflict[] {
    const conflicts: DispatchConflict[] = [];
    const service = services.find((item) => item.id === order.serviceItemId);
    if (worker.status !== WorkerStatus.ONLINE) {
      conflicts.push({
        type: 'WORKER_NOT_ONLINE',
        reason: `技师「${worker.name}」当前状态为 ${worker.status}，仅在线技师可派单`,
        workerId: worker.id,
        workerName: worker.name
      });
    }
    if (service && !worker.specialties.includes(service.category)) {
      conflicts.push({
        type: 'CATEGORY_MISMATCH',
        reason: `技师「${worker.name}」擅长类目不包含 ${service.category}`,
        workerId: worker.id,
        workerName: worker.name
      });
    }
    // 时段占用 = 预约时间 + 服务时长；未取消、未评价的订单之间不得重叠
    const slot = this.orderSlot(order);
    for (const other of orders) {
      if (other.id === order.id || other.workerId !== worker.id) continue;
      if (other.status === OrderStatus.CANCELLED || other.status === OrderStatus.RATED) continue;
      const occupied = this.orderSlot(other);
      if (slot.start < occupied.end && occupied.start < slot.end) {
        conflicts.push({
          type: 'TIME_OVERLAP',
          reason: `与订单 ${other.orderNo} 的技师时段重叠`,
          workerId: worker.id,
          workerName: worker.name,
          orderId: other.id,
          orderNo: other.orderNo,
          scheduledTime: other.scheduledTime,
          occupiedUntil: occupied.endIso
        });
      }
    }
    return conflicts;
  }

  private orderSlot(order: OrderEntity) {
    const service = services.find((item) => item.id === order.serviceItemId);
    const start = new Date(order.scheduledTime).getTime();
    const end = start + (service?.duration ?? 0) * 60_000;
    return { start, end, endIso: new Date(end).toISOString() };
  }

  private saveOrder(order: OrderEntity) {
    // 演示环境为内存存储；真实实现中此处为数据库写入，失败时由调用方回滚快照
    const index = orders.findIndex((item) => item.id === order.id);
    if (index < 0) throw new NotFoundException('订单不存在，保存失败');
    orders[index] = order;
  }

  private notifyAssignment(order: OrderEntity, worker: WorkerEntity, previousWorkerId?: string) {
    const reassigned = Boolean(previousWorkerId && previousWorkerId !== worker.id);
    const scheduled = order.scheduledTime.slice(0, 16).replace('T', ' ');
    this.notification.notify({
      type: 'order:status_changed',
      title: reassigned ? '订单改派通知' : '订单派单通知',
      message: `订单 ${order.orderNo} 已${reassigned ? '改' : ''}派给技师 ${worker.name}`,
      orderId: order.id,
      userIds: [order.customerId]
    });
    this.notification.notify({
      type: 'order:new_assignment',
      title: '新派单通知',
      message: `订单 ${order.orderNo} 已派给您，预约时间 ${scheduled}`,
      orderId: order.id,
      userIds: [worker.userId]
    });
    if (reassigned) {
      const previous = workers.find((item) => item.id === previousWorkerId);
      if (previous) {
        this.notification.notify({
          type: 'order:status_changed',
          title: '订单改派通知',
          message: `订单 ${order.orderNo} 已改派给技师 ${worker.name}，您不再负责该订单`,
          orderId: order.id,
          userIds: [previous.userId]
        });
      }
    }
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
