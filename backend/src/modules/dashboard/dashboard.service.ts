import { Injectable } from '@nestjs/common';
import { orders, services, workers } from '../demo-data';
import { OrderStatus } from '../../constants/enums';

@Injectable()
export class DashboardService {
  stats() {
    return {
      serviceCount: services.length,
      workerCount: workers.length,
      orderCount: orders.length,
      pendingOrders: orders.filter((order) => order.status === OrderStatus.PENDING).length,
      revenue: orders.reduce((sum, order) => sum + order.totalPrice, 0)
    };
  }

  workerStats(id: string) {
    const done = orders.filter((order) => order.workerId === id && [OrderStatus.COMPLETED, OrderStatus.RATED].includes(order.status));
    return {
      completedOrders: done.length,
      averageDuration: done.length ? Math.round(done.reduce((sum, order) => sum + (order.actualDuration || 90), 0) / done.length) : 0,
      ratingDistribution: [1, 2, 3, 4, 5].map((score) => ({ score, count: done.filter((order) => order.rating === score).length }))
    };
  }
}
