import { Step, StepLabel, Stepper } from '@mui/material';
import { OrderStatus } from '../../constants/enums';

const flow = [
  OrderStatus.PENDING,
  OrderStatus.ASSIGNED,
  OrderStatus.ACCEPTED,
  OrderStatus.ON_THE_WAY,
  OrderStatus.IN_PROGRESS,
  OrderStatus.COMPLETED,
  OrderStatus.RATED
];

const labels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '待派单',
  [OrderStatus.ASSIGNED]: '已派单',
  [OrderStatus.ACCEPTED]: '已接单',
  [OrderStatus.ON_THE_WAY]: '出发',
  [OrderStatus.IN_PROGRESS]: '服务中',
  [OrderStatus.COMPLETED]: '完工',
  [OrderStatus.RATED]: '评价',
  [OrderStatus.CANCELLED]: '取消'
};

export function OrderStatusFlow({ status, compact = false }: { status: OrderStatus; compact?: boolean }) {
  if (status === OrderStatus.CANCELLED) {
    return <Stepper activeStep={0}><Step><StepLabel error>已取消</StepLabel></Step></Stepper>;
  }
  return (
    <Stepper activeStep={flow.indexOf(status)} alternativeLabel={!compact}>
      {flow.map((item) => (
        <Step key={item}>
          <StepLabel>{labels[item]}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
