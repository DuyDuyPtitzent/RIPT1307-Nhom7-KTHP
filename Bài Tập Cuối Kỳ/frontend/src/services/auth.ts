import request from '@/utils/request';
import { API_BASE_URL } from '@/services/constants';
import { LoginResponse, RegisterResponse } from '@/services/types/auth';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await request(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    data: { email, password },
  });
  return response;
};

export const register = async (
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<RegisterResponse> => {
  const response = await request(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    data: { fullName, email, password, confirmPassword },
  });
  return response;
};