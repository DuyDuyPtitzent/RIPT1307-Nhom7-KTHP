import request from '../utils/request';
import { CreateMaterialParams, UpdateMaterialParams } from './types/materials';

export async function getMaterials(params?: { search?: string; manager?: string }) {
  const res = await request('/api/materials', {
    method: 'GET',
    params,
  });
  console.log('getMaterials response:', res);
  return res;
}

export async function getMaterialById(id: number) {
  const res = await request(`/api/materials/${id}`, {
    method: 'GET',
  });
  console.log('getMaterialById response:', res);
  return res;
}

export async function createMaterial(params: CreateMaterialParams) {
  const res = await request('/api/materials', {
    method: 'POST',
    data: params,
  });
  console.log('createMaterial response:', res);
  return res;
}

export async function updateMaterial(id: number, params: UpdateMaterialParams) {
  const res = await request(`/api/materials/${id}`, {
    method: 'PUT',
    data: params,
  });
  console.log('updateMaterial response:', res);
  return res;
}

export async function deleteMaterial(id: number) {
  const res = await request(`/api/materials/${id}`, {
    method: 'DELETE',
  });
  console.log('deleteMaterial response:', res);
  return res;
}