import { create } from 'zustand';
import { orderApi } from '../api/order';
import { OrderStatus } from '../constants/enums';
import { ServiceOrder } from '../types/order';

interface OrderState {
  orders: ServiceOrder[];
  current?: ServiceOrder;
  loadOrders: (params?: { status?: OrderStatus }) => Promise<void>;
  loadOrder: (id: string) => Promise<void>;
  updateStatus: (id: string, status: OrderStatus, workerId?: string) => Promise<void>;
  cancel: (id: string, reason: string) => Promise<void>;
  rate: (id: string, rating: number, comment: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loadOrders: async (params) => set({ orders: await orderApi.list(params) }),
  loadOrder: async (id) => set({ current: await orderApi.detail(id) }),
  updateStatus: async (id, status, workerId) => {
    const updated = await orderApi.updateStatus(id, { status, workerId });
    set({
      current: updated,
      orders: get().orders.map((order) => (order.id === id ? updated : order))
    });
  },
  cancel: async (id, reason) => {
    const updated = await orderApi.cancel(id, reason);
    set({ current: updated, orders: get().orders.map((order) => (order.id === id ? updated : order)) });
  },
  rate: async (id, rating, comment) => {
    const updated = await orderApi.rate(id, { rating, comment });
    set({ current: updated, orders: get().orders.map((order) => (order.id === id ? updated : order)) });
  }
}));
