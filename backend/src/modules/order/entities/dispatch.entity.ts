import { OrderStatus, ServiceCategory } from '../../../constants/enums';
import { WorkerEntity } from '../../worker/entities/worker.entity';

export type DispatchConflictType = 'WORKER_NOT_ONLINE' | 'CATEGORY_MISMATCH' | 'TIME_OVERLAP';

export interface DispatchConflict {
  type: DispatchConflictType;
  reason: string;
  workerId: string;
  workerName: string;
  orderId?: string;
  orderNo?: string;
  scheduledTime?: string;
  occupiedUntil?: string;
}

export interface DispatchCandidate {
  worker: WorkerEntity;
  eligible: boolean;
  reasons: string[];
  conflicts: DispatchConflict[];
}

export interface DispatchCandidates {
  order: {
    id: string;
    orderNo: string;
    status: OrderStatus;
    category?: ServiceCategory;
    duration: number;
    scheduledTime: string;
    occupiedUntil: string;
    workerId?: string;
  };
  candidates: DispatchCandidate[];
}
