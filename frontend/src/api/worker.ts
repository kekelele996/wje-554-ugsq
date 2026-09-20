import { ServiceCategory, WorkerStatus } from '../constants/enums';
import { Worker } from '../types/worker';
import { request } from './request';

export const workerApi = {
  list: (params?: { status?: WorkerStatus; category?: ServiceCategory }) => request.get<unknown, Worker[]>('/workers', { params }),
  detail: (id: string) => request.get<unknown, Worker>(`/workers/${id}`),
  updateStatus: (id: string, status: WorkerStatus) => request.patch<unknown, Worker>(`/workers/${id}/status`, { status }),
  review: (id: string, approved: boolean) => request.patch<unknown, Worker>(`/workers/${id}/review`, { approved })
};
