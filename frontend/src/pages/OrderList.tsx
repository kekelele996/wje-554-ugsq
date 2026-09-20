import { Box, Card, CardContent, Grid, MenuItem, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrderStatus, UserRole } from '../constants/enums';
import { OrderStatusFlow } from '../components/common/OrderStatusFlow';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { useOrderStore } from '../stores/orderStore';
import { useAuthStore } from '../stores/authStore';
import { datetime, money } from '../utils/format';

export function OrderList() {
  const role = useAuthStore((state) => state.user?.role);
  const { orders, loadOrders } = useOrderStore();
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [workerTab, setWorkerTab] = useState(0);

  useEffect(() => {
    loadOrders(status ? { status } : undefined);
  }, [loadOrders, status]);

  const visible = role === UserRole.WORKER && workerTab === 0
    ? orders.filter((order) => [OrderStatus.ASSIGNED].includes(order.status))
    : role === UserRole.WORKER
      ? orders.filter((order) => ![OrderStatus.ASSIGNED, OrderStatus.CANCELLED, OrderStatus.RATED].includes(order.status))
      : orders;

  return (
    <>
      <PageHeader
        title="订单中心"
        subtitle={role === UserRole.ADMIN ? '全部订单筛选与调度' : role === UserRole.WORKER ? '待接订单与进行中订单' : '我的订单进度'}
        actions={<TextField select size="small" label="状态" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | '')} sx={{ minWidth: 160 }}>
          <MenuItem value="">全部</MenuItem>
          {Object.values(OrderStatus).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>}
      />
      {role === UserRole.WORKER && <Tabs value={workerTab} onChange={(_, next) => setWorkerTab(next)} sx={{ mb: 2 }}><Tab label="待接订单" /><Tab label="进行中" /></Tabs>}
      {!visible.length && <EmptyState title="暂无订单" />}
      <Grid container spacing={2}>
        {visible.map((order) => (
          <Grid item xs={12} lg={6} key={order.id}>
            <Card component={Link} to={`/orders/${order.id}`} sx={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{order.orderNo}</Typography>
                  <StatusBadge value={order.status} />
                </Stack>
                <Typography sx={{ mt: 1 }}>{order.serviceItem.name} · {money(order.totalPrice)}</Typography>
                <Typography color="text.secondary">{order.address}{order.addressDetail} · {datetime(order.scheduledTime)}</Typography>
                <Typography color="text.secondary">技师：{order.worker?.name || '待派单'} · 客户：{order.customer.nickname}</Typography>
                <Box sx={{ mt: 2, overflowX: 'auto' }}><OrderStatusFlow status={order.status} compact /></Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
