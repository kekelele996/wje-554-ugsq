import { UserRole } from '../constants/enums';
import { AuthResponse, User } from '../types/auth';
import { request } from './request';

export const authApi = {
  login: (payload: { username: string; password: string }) => request.post<unknown, AuthResponse>('/auth/login', payload),
  register: (payload: { username: string; password: string; role: UserRole; nickname: string; phone: string }) =>
    request.post<unknown, AuthResponse>('/auth/register', payload),
  profile: () => request.get<unknown, User>('/auth/profile')
};
