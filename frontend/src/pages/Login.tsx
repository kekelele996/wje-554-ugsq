import { Box, Button, Container, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4">HomeService Hub</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>登录后进入家政服务调度台</Typography>
          <Stack spacing={2}>
            <TextField label="用户名" value={username} onChange={(event) => setUsername(event.target.value)} />
            <TextField label="密码" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <TextField select label="演示账号" value={username} onChange={(event) => setUsername(event.target.value)}>
              <MenuItem value="admin">Admin · admin/admin123</MenuItem>
              <MenuItem value="customer">Customer · customer/customer123</MenuItem>
              <MenuItem value="worker">Worker · worker/worker123</MenuItem>
            </TextField>
            <Button variant="contained" size="large" onClick={async () => { await login(username, password); navigate('/'); }}>登录</Button>
            <Button component={Link} to="/register">注册客户/技师账号</Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
