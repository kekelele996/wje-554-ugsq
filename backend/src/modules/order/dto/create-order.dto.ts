import { IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  serviceItemId!: string;

  @IsString()
  address!: string;

  @IsString()
  addressDetail!: string;

  @IsString()
  contactPhone!: string;

  @IsDateString()
  scheduledTime!: string;

  @IsNumber()
  totalPrice!: number;
}
