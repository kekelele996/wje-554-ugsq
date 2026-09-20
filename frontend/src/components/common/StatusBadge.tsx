import { Chip } from '@mui/material';
import { OrderStatus, ServiceStatus, WorkerStatus } from '../../constants/enums';

const labels: Record<string, string> = {
  [OrderStatus.PENDING]: '待派单',
  [OrderStatus.ASSIGNED]: '已派单',
  [OrderStatus.ACCEPTED]: '已接单',
  [OrderStatus.ON_THE_WAY]: '出发中',
  [OrderStatus.IN_PROGRESS]: '服务中',
  [OrderStatus.COMPLETED]: '已完工',
  [OrderStatus.RATED]: '已评价',
  [OrderStatus.CANCELLED]: '已取消',
  [WorkerStatus.ONLINE]: '在线',
  [WorkerStatus.BUSY]: '忙碌',
  [WorkerStatus.OFFLINE]: '离线',
  [WorkerStatus.PENDING_REVIEW]: '审核中',
  [ServiceStatus.ACTIVE]: '上架',
  [ServiceStatus.INACTIVE]: '下架'
};

const colors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'> = {
  [OrderStatus.CANCELLED]: 'error',
  [OrderStatus.RATED]: 'success',
  [OrderStatus.COMPLETED]: 'success',
  [OrderStatus.IN_PROGRESS]: 'primary',
  [OrderStatus.ON_THE_WAY]: 'info',
  [OrderStatus.PENDING]: 'warning',
  [WorkerStatus.ONLINE]: 'success',
  [WorkerStatus.BUSY]: 'warning',
  [WorkerStatus.OFFLINE]: 'default',
  [WorkerStatus.PENDING_REVIEW]: 'info',
  [ServiceStatus.ACTIVE]: 'success',
  [ServiceStatus.INACTIVE]: 'default'
};

export function StatusBadge({ value }: { value: string }) {
  return <Chip size="small" color={colors[value] || 'default'} label={labels[value] || value} />;
}
