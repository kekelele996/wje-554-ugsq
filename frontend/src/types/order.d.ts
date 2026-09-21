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

export interface AssignableWorker {
  worker: Worker;
  eligible: boolean;
  blocks: AssignBlock[];
}
