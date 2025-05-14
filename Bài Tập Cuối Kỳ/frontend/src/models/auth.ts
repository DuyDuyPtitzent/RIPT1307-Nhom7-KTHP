//Quản lý state và logic đăng ký/đăng nhậpimport { useState } from 'react';
import { login as loginAPI, register as registerAPI } from '@/services/auth';
import { LoginResponse } from '@/services/types/auth';
import { useState } from 'react';
export const useAuth = () => {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await loginAPI(email, password);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    setLoading(true);
    try {
      const response = await registerAPI(fullName, email, password, confirmPassword);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return { user, loading, login, register, logout };
};


