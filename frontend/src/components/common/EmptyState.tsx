import InboxIcon from '@mui/icons-material/Inbox';
import { Stack, Typography } from '@mui/material';

export function EmptyState({ title = '暂无数据', description }: { title?: string; description?: string }) {
  return (
    <Stack alignItems="center" spacing={1.5} sx={{ py: 8, color: 'text.secondary' }}>
      <InboxIcon fontSize="large" />
      <Typography variant="h6">{title}</Typography>
      {description && <Typography>{description}</Typography>}
    </Stack>
  );
}
