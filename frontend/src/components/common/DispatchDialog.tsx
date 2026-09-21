import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  Radio,
  Stack,
  Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { orderApi } from '../../api/order';
import { categoryConfig } from '../../constants/categories';
import { useOrderStore } from '../../stores/orderStore';
import { DispatchCandidates, DispatchConflict, ServiceOrder } from '../../types/order';
import { datetime } from '../../utils/format';
import { StatusBadge } from './StatusBadge';

interface DispatchDialogProps {
  order: ServiceOrder | null;
  open: boolean;
  onClose: () => void;
}

function extractConflicts(error: unknown): DispatchConflict[] {
  const details = (error as { response?: { data?: { details?: { conflicts?: unknown } } } })?.response?.data?.details;
  return Array.isArray(details?.conflicts) ? (details.conflicts as DispatchConflict[]) : [];
}

export function DispatchDialog({ order, open, onClose }: DispatchDialogProps) {
  const assign = useOrderStore((state) => state.assign);
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState<DispatchCandidates | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [workerId, setWorkerId] = useState('');
  const [failedConflicts, setFailedConflicts] = useState<DispatchConflict[]>([]);

  const load = useCallback(async () => {
    if (!order) return;
    setLoading(true);
    try {
      setData(await orderApi.dispatchCandidates(order.id));
    } finally {
      setLoading(false);
    }
  }, [order]);

  useEffect(() => {
    if (open && order) {
      setWorkerId('');
      setFailedConflicts([]);
      load();
    }
  }, [open, order, load]);

  const submit = async () => {
    if (!order || !workerId) return;
    setSubmitting(true);
    setFailedConflicts([]);
    try {
      await assign(order.id, workerId);
      enqueueSnackbar('派单成功，已通知客户与技师', { variant: 'success' });
      onClose();
    } catch (error) {
      // 接口拒绝时展示冲突对象与原因，并重新拉取候选保持与接口一致
      setFailedConflicts(extractConflicts(error));
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const currentWorkerId = data?.order.workerId;

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <span>{currentWorkerId ? '改派技师' : '派单'} · {order?.orderNo}</span>
          <IconButton size="small" onClick={load} disabled={loading || submitting} title="刷新候选">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {data && (
          <Alert severity="info" sx={{ mb: 2 }}>
            预约 {datetime(data.order.scheduledTime)}，服务时长 {data.order.duration} 分钟，时段占用至 {datetime(data.order.occupiedUntil)}。
            仅可派给类目匹配且在线的技师，未取消、未评价订单的技师时段不得重叠。
          </Alert>
        )}
        {failedConflicts.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>派单被拒绝，原技师与订单状态保持不变：</Typography>
            {failedConflicts.map((conflict, index) => (
              <Typography key={index} variant="body2">
                · {conflict.reason}
                {conflict.orderNo && `（冲突订单 ${conflict.orderNo}：${datetime(conflict.scheduledTime || '')} ~ ${datetime(conflict.occupiedUntil || '')}）`}
              </Typography>
            ))}
          </Alert>
        )}
        {loading && <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}><CircularProgress size={28} /></Box>}
        {!loading && data && (
          <List disablePadding>
            {data.candidates.map(({ worker, eligible, reasons, conflicts }) => {
              const isCurrent = worker.id === currentWorkerId;
              const selectable = eligible && !isCurrent;
              return (
                <ListItem
                  key={worker.id}
                  disableGutters
                  sx={{ alignItems: 'flex-start', opacity: selectable ? 1 : 0.75, cursor: selectable ? 'pointer' : 'default' }}
                  onClick={() => selectable && setWorkerId(worker.id)}
                >
                  <Radio size="small" checked={workerId === worker.id} disabled={!selectable} sx={{ mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography fontWeight={600}>{worker.name}</Typography>
                      <StatusBadge value={worker.status} />
                      {isCurrent && <Chip size="small" color="primary" variant="outlined" label="当前技师" />}
                      <Typography variant="body2" color="text.secondary">评分 {worker.rating} · 累计 {worker.totalOrders} 单</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                      {worker.specialties.map((category) => (
                        <Chip key={category} size="small" variant="outlined" label={categoryConfig[category].label} />
                      ))}
                    </Stack>
                    {!eligible && (
                      <Box sx={{ mt: 0.5 }}>
                        {reasons.map((reason, index) => (
                          <Typography key={index} variant="body2" color="error">· {reason}</Typography>
                        ))}
                        {conflicts.filter((conflict) => conflict.orderNo).map((conflict, index) => (
                          <Typography key={index} variant="body2" color="error">
                            · 冲突对象：订单 {conflict.orderNo}（{datetime(conflict.scheduledTime || '')} ~ {datetime(conflict.occupiedUntil || '')}）
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>取消</Button>
        <Button variant="contained" onClick={submit} disabled={!workerId || submitting || loading}>
          {submitting ? '派单中…' : '确认派单'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
