import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { ServiceCategory } from '../../../constants/enums';

export class CreateServiceDto {
  @IsString()
  name!: string;

  @IsEnum(ServiceCategory)
  category!: ServiceCategory;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsString()
  unit!: string;

  @IsNumber()
  @Min(1)
  duration!: number;
}
