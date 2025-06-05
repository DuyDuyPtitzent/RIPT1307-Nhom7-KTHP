export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  resident_id?: number | null; 
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string; // 'user' | 'admin'
}

export interface ForgotPasswordParams {
  email: string;
}

export interface ResetPasswordParams {
  token: string;
  newPassword: string;
}

export interface UpdatePasswordParams {
  currentPassword: string;
  newPassword: string;
}
export interface UpdateUserPasswordParams {
  newPassword: string;
}

// Moved AuthModelType interface here
import { Effect, Reducer } from 'umi';

export interface AuthModelType {
  namespace: 'auth';
  state: AuthState;
  effects: {
    fetchCurrentUser: Effect;
  };
  reducers: {
    setUser: Reducer<AuthState>;
    clearUser: Reducer<AuthState>;
  };
}