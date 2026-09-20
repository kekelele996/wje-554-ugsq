import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3">404</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>页面不存在</Typography>
        <Button component={Link} to="/" variant="contained">返回首页</Button>
      </Box>
    </Box>
  );
}
