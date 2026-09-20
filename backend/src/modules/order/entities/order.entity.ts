import { OrderStatus } from '../../../constants/enums';
import { UserEntity } from '../../auth/auth.service';
import { ServiceEntity } from '../../service/entities/service.entity';
import { WorkerEntity } from '../../worker/entities/worker.entity';

export interface OrderEntity {
  id: string;
  orderNo: string;
  serviceItemId: string;
  customerId: string;
  workerId?: string;
  address: string;
  addressDetail: string;
  contactPhone: string;
  scheduledTime: string;
  status: OrderStatus;
  totalPrice: number;
  actualDuration?: number;
  rating?: number;
  comment?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  serviceItem?: ServiceEntity;
  customer?: UserEntity;
  worker?: WorkerEntity;
}
