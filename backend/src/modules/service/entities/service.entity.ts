import { ServiceCategory, ServiceStatus } from '../../../constants/enums';

export interface ServiceEntity {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  basePrice: number;
  unit: string;
  duration: number;
  status: ServiceStatus;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}
