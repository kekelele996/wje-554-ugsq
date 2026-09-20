import { create } from 'zustand';
import { workerApi } from '../api/worker';
import { ServiceCategory, WorkerStatus } from '../constants/enums';
import { Worker } from '../types/worker';

interface WorkerState {
  workers: Worker[];
  selected?: Worker;
  loadWorkers: (params?: { status?: WorkerStatus; category?: ServiceCategory }) => Promise<void>;
  loadWorker: (id: string) => Promise<void>;
  review: (id: string, approved: boolean) => Promise<void>;
}

export const useWorkerStore = create<WorkerState>((set, get) => ({
  workers: [],
  loadWorkers: async (params) => set({ workers: await workerApi.list(params) }),
  loadWorker: async (id) => set({ selected: await workerApi.detail(id) }),
  review: async (id, approved) => {
    const updated = await workerApi.review(id, approved);
    set({ selected: updated, workers: get().workers.map((worker) => (worker.id === id ? updated : worker)) });
  }
}));
