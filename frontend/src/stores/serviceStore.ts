import { create } from 'zustand';
import { serviceApi } from '../api/service';
import { ServiceCategory, ServiceStatus } from '../constants/enums';
import { ServiceItem } from '../types/service';

interface ServiceState {
  services: ServiceItem[];
  loadServices: (params?: { category?: ServiceCategory; status?: ServiceStatus }) => Promise<void>;
  updateStatus: (id: string, status: ServiceStatus) => Promise<void>;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  loadServices: async (params) => set({ services: await serviceApi.list(params) }),
  updateStatus: async (id, status) => {
    const updated = await serviceApi.updateStatus(id, status);
    set({ services: get().services.map((item) => (item.id === id ? updated : item)) });
  }
}));
