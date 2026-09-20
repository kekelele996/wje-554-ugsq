import { IsBoolean } from 'class-validator';

export class ReviewWorkerDto {
  @IsBoolean()
  approved!: boolean;
}
