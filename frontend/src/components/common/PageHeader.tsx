import { Box, Breadcrumbs, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
      <Box>
        <Breadcrumbs sx={{ mb: 0.5 }}>
          <Typography color="text.secondary">HomeService Hub</Typography>
          <Typography color="text.primary">{title}</Typography>
        </Breadcrumbs>
        <Typography variant="h4">{title}</Typography>
        {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
      </Box>
      {actions}
    </Stack>
  );
}
