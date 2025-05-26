import request from '../utils/request';
import { LoginParams, RegisterParams, ForgotPasswordParams, ResetPasswordParams, UpdatePasswordParams, UpdateUserPasswordParams } from './types/auth';

interface User {
  id: number;
  email: string;
  role: string;
  resident_id?: number;
  full_name?: string;
}

export async function login(params: LoginParams) {
  const res = await request('/api/auth/login', {
    method: 'POST',
    data: params,
    skipErrorHandler: true,
  });

  if (res && res.message && !res.token) {
    throw new Error(res.message);
  }

  return res;
}

export async function register(params: RegisterParams) {
  try {
    const res = await request('/api/auth/register', {
      method: 'POST',
      data: params,
      skipErrorHandler: true,
    });

    if (!res || res?.status === 'error' || res?.message === 'Email đã được đăng ký') {
      throw new Error(res?.message || 'Đăng ký thất bại');
    }

    return res;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      'Đăng ký thất bại';
    throw new Error(message);
  }
}

export async function forgotPassword(params: ForgotPasswordParams) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    data: params,
  });
}

export async function resetPassword(params: ResetPasswordParams) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    data: params,
  });
}

export async function getCurrentUser(): Promise<User> {
  try {
    const res = await request('/api/auth/me', {
      method: 'GET',
    });
    console.log('getCurrentUser response:', res);

    if (!res || typeof res !== 'object') {
      throw new Error('Phản hồi từ API không hợp lệ');
    }

    const user: User = {
      id: res.id,
      email: res.email,
      role: res.role,
      resident_id: res.resident_id,
      full_name: res.fullName || res.full_name,
    };

    if ((user.role === 'resident' || user.role === 'user') && (user.resident_id == null || user.resident_id <= 0)) {
      console.warn('Cư dân thiếu resident_id hợp lệ:', res);
    }

    return user;
  } catch (error: any) {
    console.error('Lỗi trong getCurrentUser:', error);
    throw new Error(error.message || 'Không thể lấy thông tin người dùng');
  }
}

export async function updatePassword(params: UpdatePasswordParams) {
  return request('/api/auth/password', {
    method: 'PUT',
    data: params,
  });
}

export async function updateUserPassword(id: number, params: UpdateUserPasswordParams) {
  const res = await request(`/api/auth/users/${id}/password`, {
    method: 'PUT',
    data: params,
    skipErrorHandler: true,
  });
  console.log('updateUserPassword response raw:', res);
  return res;
}