import { ServiceCategory, ServiceStatus } from '../constants/enums';
import { ServiceItem } from '../types/service';
import { request } from './request';

export const serviceApi = {
  list: (params?: { category?: ServiceCategory; status?: ServiceStatus }) => request.get<unknown, ServiceItem[]>('/services', { params }),
  detail: (id: string) => request.get<unknown, ServiceItem>(`/services/${id}`),
  create: (payload: Partial<ServiceItem>) => request.post<unknown, ServiceItem>('/services', payload),
  update: (id: string, payload: Partial<ServiceItem>) => request.put<unknown, ServiceItem>(`/services/${id}`, payload),
  updateStatus: (id: string, status: ServiceStatus) => request.patch<unknown, ServiceItem>(`/services/${id}/status`, { status })
};
