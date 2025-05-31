import request from '../utils/request';
import { VehicleParams, Vehicle } from './types/vehicles';

export async function getVehicles(params?: {
  search?: string;
  type?: string;
  status?: string;
  residentId?: number;
}): Promise<Vehicle[]> {
  try {
    const res = await request('/api/vehicles', {
      method: 'GET',
      params,
    });
    console.log('getVehicles response:', res);
    return res.data || res;
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách phương tiện:', error);
    throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách phương tiện');
  }
}

export async function getVehicleById(id: number): Promise<Vehicle> {
  try {
    const res = await request(`/api/vehicles/${id}`, {
      method: 'GET',
    });
    console.log('getVehicleById response:', res);
    console.log('getVehicleById returning:', res.data || res);
    return res.data || res;
  } catch (error: any) {
    console.error('Lỗi khi lấy phương tiện:', error);
    throw new Error(error.response?.data?.message || 'Lỗi khi lấy thông tin phương tiện');
  }
}

export async function createVehicle(params: VehicleParams): Promise<Vehicle> {
  try {
    const res = await request('/api/vehicles', {
      method: 'POST',
      data: params,
    });
    console.log('createVehicle response:', res);
    return res.data || res;
  } catch (error: any) {
    console.error('Lỗi khi tạo phương tiện:', error);
    throw new Error(error.response?.data?.message || 'Lỗi khi tạo phương tiện');
  }
}

export async function updateVehicle(id: number, params: Partial<VehicleParams>): Promise<{ message: string }> {
  try {
    const res = await request(`/api/vehicles/${id}`, {
      method: 'PUT',
      data: params,
    });
    console.log('updateVehicle response:', res);
    return res.data || res;
  } catch (error: any) {
    console.error('Lỗi khi cập nhật phương tiện:', error);
    throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật phương tiện');
  }
}

export async function deleteVehicle(id: number): Promise<{ message: string }> {
  try {
    const res = await request(`/api/vehicles/${id}`, {
      method: 'DELETE',
    });
    console.log('deleteVehicle response:', res);
    return res.data || res;
  } catch (error: any) {
    console.error('Lỗi khi xóa phương tiện:', error);
    throw new Error(error.response?.data?.message || 'Lỗi khi xóa phương tiện');
  }
}

export async function approveVehicle(id: number): Promise<{ message: string }> {
  try {
    const res = await request(`/api/vehicles/${id}/approve`, {
      method: 'PUT',
    });
    console.log('approveVehicle response:', res);
    return res.data || res;
  } catch (error: any) {
    console.error('Lỗi khi duyệt phương tiện:', error);
    throw new Error(error.response?.data?.message || 'Lỗi khi duyệt phương tiện');
  }
}

export async function rejectVehicle(id: number): Promise<{ message: string }> {
  try {
    const res = await request(`/api/vehicles/${id}/reject`, {
      method: 'PUT',
    });
    console.log('rejectVehicle response:', res);
    return res.data || res;
  } catch (error: any) {
    console.error('Lỗi khi từ chối phương tiện:', error);
    throw new Error(error.response?.data?.message || 'Lỗi khi từ chối phương tiện');
  }
}