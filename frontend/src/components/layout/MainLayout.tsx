import { Box, Container, CssBaseline, Drawer } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useWebSocket } from '../../hooks/useWebSocket';

const drawerWidth = 248;

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  useWebSocket();
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <Header onMenu={() => setMobileOpen(true)} />
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}>
          <Sidebar />
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, bgcolor: 'background.paper' } }} open>
          <Sidebar />
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, pt: 10 }}>
        <Container maxWidth="xl">
          <Outlet />
          <Footer />
        </Container>
      </Box>
    </Box>
  );
}
