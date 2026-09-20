import { UserRole } from '../constants/enums';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  nickname: string;
  phone: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
