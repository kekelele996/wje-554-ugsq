import { Box, Typography } from '@mui/material';

export function Footer() {
  return (
    <Box component="footer" sx={{ py: 3, color: 'text.secondary' }}>
      <Typography variant="body2">HomeService Hub · 家政与本地生活服务平台</Typography>
    </Box>
  );
}
