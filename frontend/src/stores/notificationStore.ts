import { create } from 'zustand';

export interface AppNotification {
  id: string;
  type: 'order:status_changed' | 'order:new_assignment' | 'order:worker_arriving';
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unread: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unread: 0,
  addNotification: (notification) => {
    const next: AppNotification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date().toISOString()
    };
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(next.title, { body: next.message });
    }
    set({ notifications: [next, ...get().notifications].slice(0, 20), unread: get().unread + 1 });
  },
  markAllRead: () => set({ unread: 0, notifications: get().notifications.map((item) => ({ ...item, read: true })) })
}));
