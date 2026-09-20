import HomeIcon from '@mui/icons-material/Home';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EngineeringIcon from '@mui/icons-material/Engineering';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import { List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserRole } from '../../constants/enums';
import { useAuthStore } from '../../stores/authStore';

const nav = [
  { label: '首页', path: '/', icon: HomeIcon },
  { label: '订单中心', path: '/orders', icon: ReceiptLongIcon },
  { label: '技师管理', path: '/workers', icon: EngineeringIcon, roles: [UserRole.ADMIN] },
  { label: '服务管理', path: '/services', icon: RoomServiceIcon, roles: [UserRole.ADMIN] }
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useAuthStore((state) => state.user?.role);
  return (
    <>
      <Toolbar />
      <List sx={{ px: 1 }}>
        {nav.filter((item) => !item.roles || (role && item.roles.includes(role))).map((item) => {
          const Icon = item.icon;
          return (
            <ListItemButton key={item.path} selected={location.pathname === item.path} onClick={() => navigate(item.path)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon><Icon /></ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </>
  );
}
