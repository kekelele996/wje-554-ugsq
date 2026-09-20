import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderStatus, UserRole } from '../../constants/enums';
import { orders, services, users, workers } from '../demo-data';
import { NotificationService } from '../notification/notification.service';
import { WorkerService } from '../worker/worker.service';
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
      if (user.role !== UserRole.ADMIN) throw new ForbiddenException('仅 Admin 可派单');
      order.workerId = workerId || this.workerService.firstOnline().id;
    } else if ([OrderStatus.ACCEPTED, OrderStatus.ON_THE_WAY, OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED].includes(status)) {
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
      type: status === OrderStatus.ASSIGNED ? 'order:new_assignment' : status === OrderStatus.ON_THE_WAY ? 'order:worker_arriving' : 'order:status_changed',
      title: '订单状态更新',
      message: `${order.orderNo} 已更新为 ${status}`,
      orderId: order.id,
      userIds: [order.customerId, order.workerId || ''].filter(Boolean)
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
