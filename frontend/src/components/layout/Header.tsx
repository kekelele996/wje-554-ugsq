import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material';
import { useAuthStore } from '../../stores/authStore';
import { NotificationBell } from '../notification/NotificationBell';

export function Header({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuthStore();
  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={onMenu} sx={{ mr: 2, display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 800 }}>HomeService Hub</Typography>
        {user && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{user.nickname} · {user.role}</Typography>
            <NotificationBell />
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>退出</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
