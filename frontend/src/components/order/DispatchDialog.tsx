import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Radio,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { categoryConfig } from '../../constants/categories';
import { useOrderStore } from '../../stores/orderStore';
import { AssignBlock, ServiceOrder } from '../../types/order';
import { datetime } from '../../utils/format';
import { StatusBadge } from '../common/StatusBadge';

interface DispatchDialogProps {
  order: ServiceOrder;
  open: boolean;
  onClose: () => void;
}

interface Rejection {
  message: string;
  blocks?: AssignBlock[];
  unchanged?: { status: string; workerId: string | null };
}

function BlockReasons({ blocks }: { blocks: AssignBlock[] }) {
  return (
    <Stack spacing={0.5} sx={{ mt: 1 }}>
      {blocks.map((block) => (
        <Box key={block.code}>
          <Chip size="small" color="error" variant="outlined" label={block.message} />
          {block.conflicts?.map((conflict) => (
            <Typography key={conflict.orderId} variant="body2" color="error" sx={{ ml: 1, mt: 0.5 }}>
              冲突订单 {conflict.orderNo}（{datetime(conflict.scheduledTime)} ~ {datetime(conflict.occupiedUntil)}，{conflict.status}）
            </Typography>
          ))}
        </Box>
      ))}
    </Stack>
  );
}

export function DispatchDialog({ order, open, onClose }: DispatchDialogProps) {
  const { assignableWorkers, loadAssignableWorkers, assign } = useOrderStore();
  const [selected, setSelected] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rejection, setRejection] = useState<Rejection | null>(null);

  useEffect(() => {
    if (open) {
      setSelected('');
      setRejection(null);
      loadAssignableWorkers(order.id);
    }
  }, [open, order.id, order.updatedAt, loadAssignableWorkers]);

  const submit = async () => {
    setSubmitting(true);
    setRejection(null);
    try {
      await assign(order.id, selected);
      onClose();
    } catch (error) {
      const data = (error as { response?: { data?: { message?: string; details?: { blocks?: AssignBlock[]; order?: { status: string; workerId: string | null } } } } })
        .response?.data;
      setRejection({
        message: data?.message || '派单失败，请重试',
        blocks: data?.details?.blocks,
        unchanged: data?.details?.order ? { status: data.details.order.status, workerId: data.details.order.workerId } : undefined
      });
      await loadAssignableWorkers(order.id);
    } finally {
      setSubmitting(false);
    }
  };

  const noneEligible = assignableWorkers.length > 0 && !assignableWorkers.some((item) => item.eligible);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <span>{order.workerId ? '改派技师' : '派单'} · {order.orderNo}</span>
          <Tooltip title="刷新候选技师">
            <IconButton size="small" onClick={() => loadAssignableWorkers(order.id)}><RefreshIcon /></IconButton>
          </Tooltip>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {order.serviceItem.name}（{categoryConfig[order.serviceItem.category].label}）· 预约 {datetime(order.scheduledTime)} · 占用时长 {order.serviceItem.duration} 分钟
        </Typography>
        {rejection && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {rejection.message}
            {rejection.unchanged && '。原技师与订单状态未变更'}
            {rejection.blocks && <BlockReasons blocks={rejection.blocks} />}
          </Alert>
        )}
        {noneEligible && <Alert severity="warning" sx={{ mb: 2 }}>暂无符合派单条件的技师（需类目匹配、状态在线且时段不冲突）</Alert>}
        <List disablePadding>
          {assignableWorkers.map(({ worker, eligible, blocks }) => (
            <ListItem key={worker.id} disablePadding secondaryAction={<StatusBadge value={worker.status} />} sx={{ pr: 12 }}>
              <ListItemButton disabled={!eligible} selected={selected === worker.id} onClick={() => setSelected(worker.id)}>
                <Radio size="small" checked={selected === worker.id} disabled={!eligible} />
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography variant="subtitle1">{worker.name}</Typography>
                    {worker.specialties.map((category) => (
                      <Chip key={category} size="small" label={categoryConfig[category].label} sx={{ bgcolor: `${categoryConfig[category].color}18` }} />
                    ))}
                    <Typography variant="body2" color="text.secondary">评分 {worker.rating}</Typography>
                  </Stack>
                  {!eligible && <BlockReasons blocks={blocks} />}
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button variant="contained" disabled={!selected || submitting} onClick={submit}>
          确认{order.workerId ? '改派' : '派单'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
