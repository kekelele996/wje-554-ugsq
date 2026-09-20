import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';

@Module({
  imports: [AuthModule],
  providers: [NotificationGateway, NotificationService],
  exports: [NotificationService]
})
export class NotificationModule {}
