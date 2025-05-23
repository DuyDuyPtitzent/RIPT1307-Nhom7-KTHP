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