import { Avatar, Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { categoryConfig } from '../../constants/categories';
import { Worker } from '../../types/worker';
import { StatusBadge } from './StatusBadge';
import { RatingStars } from './RatingStars';

export function WorkerCard({ worker, onClick }: { worker: Worker; onClick?: () => void }) {
  return (
    <Card onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default', height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={worker.avatar} sx={{ width: 56, height: 56 }}>{worker.name.slice(0, 1)}</Avatar>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{worker.name}</Typography>
              <StatusBadge value={worker.status} />
            </Stack>
            <RatingStars value={worker.rating} readOnly />
          </Box>
        </Stack>
        <Typography sx={{ mt: 2 }} color="text.secondary">{worker.experience} 年经验 · 完成 {worker.totalOrders} 单</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
          {worker.specialties.map((category) => (
            <Chip key={category} size="small" label={categoryConfig[category].label} sx={{ bgcolor: `${categoryConfig[category].color}18` }} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
