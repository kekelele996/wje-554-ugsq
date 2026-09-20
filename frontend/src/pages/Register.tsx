import { Box, Button, Container, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../constants/enums';
import { useAuthStore } from '../stores/authStore';

export function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [form, setForm] = useState({ username: '', password: '', role: UserRole.CUSTOMER, nickname: '', phone: '' });

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4">创建账号</Typography>
          <Stack spacing={2} sx={{ mt: 3 }}>
            <TextField label="用户名" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <TextField label="密码" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <TextField select label="角色" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
              <MenuItem value={UserRole.CUSTOMER}>Customer</MenuItem>
              <MenuItem value={UserRole.WORKER}>Worker</MenuItem>
            </TextField>
            <TextField label="昵称" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
            <TextField label="手机号" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Button variant="contained" size="large" onClick={async () => { await register(form); navigate('/'); }}>注册并登录</Button>
            <Button component={Link} to="/login">返回登录</Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
