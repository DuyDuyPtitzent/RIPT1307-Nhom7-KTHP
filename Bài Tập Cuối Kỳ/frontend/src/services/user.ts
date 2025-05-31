import request from '../utils/request';
import { UserProfile, Account, PasswordForm, ExtendForm, ToggleExtension } from './types/user';

export const getProfile = async (): Promise<UserProfile> => {
  const response = await request.get('/api/users/profile');
  return response;
};

export const updateAvatar = async (formData: FormData): Promise<{ message: string; avatar: string }> => {
  const response = await request('/api/users/avatar', {
    method: 'PUT',
    requestType: 'form',
    data: formData,
  });
  return response;
};

export const changePassword = async (data: PasswordForm): Promise<{ message: string }> => {
  const response = await request('/api/users/change-password', {
    method: 'PUT',
    requestType: 'json',
    data,
  });
  return response;
};


export const extendRental = async (data: ExtendForm): Promise<{ message: string; newDuration: number }> => {
  const response = await request('/api/users/extend-rental', {
    method: 'POST',
    requestType: 'json',
    data,  // gói data ở đây
  });
  return response;
};


export const getAllAccounts = async (): Promise<Account[]> => {
  const response = await request.get('/api/users/all');
  return response;
};
export const toggleExtensionPermission = async (data: ToggleExtension) => {
  const response = await request('/api/users/toggle-extension', {
    method: 'PUT',
    requestType: 'json',
    data,
  });
  return response;
};

