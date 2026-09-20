import { List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../stores/notificationStore';
import { datetime } from '../../utils/format';

export function NotificationPanel() {
  const navigate = useNavigate();
  const notifications = useNotificationStore((state) => state.notifications);
  if (!notifications.length) return <Typography sx={{ p: 2, width: 280 }}>暂无通知</Typography>;
  return (
    <List sx={{ width: 340, maxHeight: 420, overflow: 'auto' }}>
      {notifications.map((item) => (
        <ListItemButton key={item.id} onClick={() => item.orderId && navigate(`/orders/${item.orderId}`)}>
          <ListItemText primary={item.title} secondary={`${item.message} · ${datetime(item.createdAt)}`} />
        </ListItemButton>
      ))}
    </List>
  );
}
