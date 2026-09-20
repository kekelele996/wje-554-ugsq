import { PartialType } from '@nestjs/mapped-types';
import { IsEnum } from 'class-validator';
import { ServiceStatus } from '../../../constants/enums';
import { CreateServiceDto } from './create-service.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}

export class UpdateServiceStatusDto {
  @IsEnum(ServiceStatus)
  status!: ServiceStatus;
}
