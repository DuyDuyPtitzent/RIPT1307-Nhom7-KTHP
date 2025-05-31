import request from '../utils/request';
import { CreateResidentParams, UpdateResidentParams } from './types/residents';

export async function getResidents(params?: { search?: string; apartment?: string }) {
  const res = await request('/api/residents', {
    method: 'GET',
    params,
  });
  console.log('getResidents response:', res);
  return res;
}

export async function getResidentById(id: number) {
  const res = await request(`/api/residents/${id}`, {
    method: 'GET',
  });
  console.log('getResidentById response:', res);
  return res;
}

export async function createResident(params: CreateResidentParams) {
  const res = await request('/api/residents', {
    method: 'POST',
    data: params,
  });
  console.log('createResident response:', res);
  return res;
}

export async function updateResident(id: number, params: UpdateResidentParams) {
  const res = await request(`/api/residents/${id}`, {
    method: 'PUT',
    data: params,
  });
  console.log('updateResident response:', res);
  return res;
}

export async function deleteResident(id: number) {
  const res = await request(`/api/residents/${id}`, {
    method: 'DELETE',
  });
  console.log('deleteResident response:', res);
  return res;
}