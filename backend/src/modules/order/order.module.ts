import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { WorkerModule } from '../worker/worker.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [AuthModule, WorkerModule, NotificationModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}
