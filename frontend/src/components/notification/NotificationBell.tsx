import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge, IconButton, Popover, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationPanel } from './NotificationPanel';

export function NotificationBell() {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const unread = useNotificationStore((state) => state.unread);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const open = Boolean(anchor);

  return (
    <>
      <Tooltip title="订单通知">
        <IconButton
          color="inherit"
          onClick={(event) => {
            setAnchor(event.currentTarget);
            markAllRead();
            if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
          }}
        >
          <Badge color="secondary" badgeContent={unread}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover open={open} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <NotificationPanel />
      </Popover>
    </>
  );
}
