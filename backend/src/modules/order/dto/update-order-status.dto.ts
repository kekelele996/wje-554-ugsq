import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../../../constants/enums';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @IsOptional()
  @IsString()
  workerId?: string;
}

export class RateOrderDto {
  rating!: number;
  comment!: string;
}

export class CancelOrderDto {
  cancelReason!: string;
}
