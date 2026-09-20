import { OrderStatus } from '../constants/enums';
import { ServiceItem } from './service';
import { User } from './auth';
import { Worker } from './worker';

export interface ServiceOrder {
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
  serviceItem: ServiceItem;
  customer: User;
  worker?: Worker;
}
