import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UserRole } from '../../constants/enums';
import { users, workers } from '../demo-data';
import { RegisterDto } from './dto/register.dto';

export interface UserEntity {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  nickname: string;
  phone: string;
  avatar?: string;
  createdAt: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async login(username: string, password: string) {
    const user = users.find((item) => item.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('用户名或密码错误');
    return this.sign(user);
  }

  async register(dto: RegisterDto) {
    const user: UserEntity = {
      id: crypto.randomUUID(),
      username: dto.username,
      password: bcrypt.hashSync(dto.password, 8),
      role: dto.role,
      nickname: dto.nickname,
      phone: dto.phone,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    if (dto.role === UserRole.WORKER) {
      workers.push({
        id: crypto.randomUUID(),
        userId: user.id,
        name: dto.nickname,
        phone: dto.phone,
        specialties: [],
        rating: 5,
        totalOrders: 0,
        status: 'PENDING_REVIEW' as never,
        bio: '新注册技师，等待平台审核。',
        experience: 0,
        idCardNo: '待补充',
        createdAt: user.createdAt
      });
    }
    return this.sign(user);
  }

  profile(userId: string) {
    return this.publicUser(this.mustFind(userId));
  }

  mustFind(userId: string) {
    const user = users.find((item) => item.id === userId);
    if (!user) throw new UnauthorizedException('用户不存在');
    return user;
  }

  publicUser(user: UserEntity) {
    const { password: _password, ...safe } = user;
    return safe;
  }

  private sign(user: UserEntity) {
    const token = this.jwt.sign({ sub: user.id, username: user.username, role: user.role });
    return { token, user: this.publicUser(user) };
  }
}
