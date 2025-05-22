import request from '../utils/request';
import { LoginParams, RegisterParams, ForgotPasswordParams, ResetPasswordParams, UpdatePasswordParams,UpdateUserPasswordParams } from './types/auth';

export async function login(params: LoginParams) {
  const res = await request('/api/auth/login', {
    method: 'POST',
    data: params,
    skipErrorHandler: true,
  });

  if (res && res.message && !res.token) {
    // Có message lỗi, không có token => lỗi
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

    // Nếu response có status là 'error' hoặc không có gì => ném lỗi
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

export async function getCurrentUser() {
  const res = await request('/api/auth/me', {
    method: 'GET',
  });
  console.log('getCurrentUser response:', res);
  return res;
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