import { create } from 'zustand';
import { authApi } from '../api/auth';
import { UserRole } from '../constants/enums';
import { AuthResponse, User } from '../types/auth';
import { storage } from '../utils/storage';

interface AuthState {
  user?: User;
  token?: string;
  bootstrapped: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: { username: string; password: string; role: UserRole; nickname: string; phone: string }) => Promise<void>;
  profile: () => Promise<void>;
  logout: () => void;
  setAuth: (auth: AuthResponse) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: storage.getToken() || undefined,
  bootstrapped: false,
  setAuth: (auth) => {
    storage.setToken(auth.token);
    set({ token: auth.token, user: auth.user, bootstrapped: true });
  },
  login: async (username, password) => {
    const auth = await authApi.login({ username, password });
    storage.setToken(auth.token);
    set({ token: auth.token, user: auth.user, bootstrapped: true });
  },
  register: async (payload) => {
    const auth = await authApi.register(payload);
    storage.setToken(auth.token);
    set({ token: auth.token, user: auth.user, bootstrapped: true });
  },
  profile: async () => {
    const token = storage.getToken();
    if (!token) {
      set({ bootstrapped: true });
      return;
    }
    const user = await authApi.profile();
    set({ user, token, bootstrapped: true });
  },
  logout: () => {
    storage.clearToken();
    set({ token: undefined, user: undefined, bootstrapped: true });
  }
}));
