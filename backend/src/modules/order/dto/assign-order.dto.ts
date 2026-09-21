import { IsString } from 'class-validator';

export class AssignOrderDto {
  @IsString()
  workerId!: string;
}
