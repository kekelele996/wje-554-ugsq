import { ServiceCategory, WorkerStatus } from '../constants/enums';

export interface Worker {
  id: string;
  userId: string;
  name: string;
  phone: string;
  avatar?: string;
  specialties: ServiceCategory[];
  rating: number;
  totalOrders: number;
  status: WorkerStatus;
  bio: string;
  experience: number;
  idCardNo: string;
  createdAt: string;
}
