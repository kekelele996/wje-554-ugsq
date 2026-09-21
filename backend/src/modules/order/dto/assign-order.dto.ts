import { IsNotEmpty, IsString } from 'class-validator';

export class AssignOrderDto {
  @IsString()
  @IsNotEmpty({ message: '派单必须指定技师' })
  workerId!: string;
}
