import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';
import { ServiceCategory } from '../../../constants/enums';

export class CreateWorkerDto {
  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsArray()
  @IsEnum(ServiceCategory, { each: true })
  specialties!: ServiceCategory[];

  @IsString()
  bio!: string;

  @IsNumber()
  experience!: number;

  @IsString()
  idCardNo!: string;
}
