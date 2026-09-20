import { Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';
import { categoryConfig } from '../../constants/categories';
import { ServiceItem } from '../../types/service';
import { money } from '../../utils/format';
import { StatusBadge } from './StatusBadge';

export function ServiceCard({ service, onClick }: { service: ServiceItem; onClick?: () => void }) {
  const config = categoryConfig[service.category];
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip label={config.label} size="small" sx={{ bgcolor: `${config.color}1f`, color: config.color, fontWeight: 700 }} />
            <StatusBadge value={service.status} />
          </Stack>
          <Typography variant="h6" sx={{ mt: 2 }}>{service.name}</Typography>
          <Typography color="text.secondary" sx={{ minHeight: 48 }}>{service.description}</Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="end" sx={{ mt: 2 }}>
            <Typography variant="h5" color="primary">{money(service.basePrice)}<Typography component="span" variant="body2">/{service.unit}</Typography></Typography>
            <Typography variant="body2" color="text.secondary">{service.duration} 分钟</Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
