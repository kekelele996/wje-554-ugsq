import { IsEnum, IsString } from 'class-validator';
import { UserRole } from '../../../constants/enums';

export class RegisterDto {
  @IsString()
  username!: string;

  @IsString()
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  nickname!: string;

  @IsString()
  phone!: string;
}
