import { useEffect } from 'react';
import { storage } from '../utils/storage';
import { useNotificationStore } from '../stores/notificationStore';

export const useWebSocket = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    const token = storage.getToken();
    if (!token) return;
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:38304/notifications'}?token=${token}`;
    const socket = new WebSocket(wsUrl);
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      addNotification(payload);
    };
    return () => socket.close();
  }, [addNotification]);
};
