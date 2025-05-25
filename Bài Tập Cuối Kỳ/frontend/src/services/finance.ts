import request from '../utils/request';
import { CreateInvoiceParams, UpdateInvoiceParams } from './types/finance';

export async function getInvoices(params?: {
  search?: string;
  period?: string;
  status?: string;
  residentId?: number;
}): Promise<any[]> {
  const res = await request('/api/finance', {
    method: 'GET',
    params,
  });
  console.log('getInvoices response:', res);
  return res;
}

export async function getInvoiceById(id: number): Promise<any> {
  const res = await request(`/api/finance/${id}`, {
    method: 'GET',
  });
  console.log('getInvoiceById response:', res);
  return res;
}

export async function createInvoice(params: CreateInvoiceParams): Promise<any> {
  const res = await request('/api/finance', {
    method: 'POST',
    data: params,
  });
  console.log('createInvoice response:', res);
  return res;
}

export async function updateInvoice(id: number, params: UpdateInvoiceParams): Promise<any> {
  const res = await request(`/api/finance/${id}`, {
    method: 'PUT',
    data: params,
  });
  console.log('updateInvoice response:', res);
  return res;
}

export async function deleteInvoice(id: number): Promise<any> {
  const res = await request(`/api/finance/${id}`, {
    method: 'DELETE',
  });
  console.log('deleteInvoice response:', res);
  return res;
}

export async function getRevenueStats(params?: {
  startDate?: string;
  endDate?: string;
  period?: 'month' | 'quarter' | 'year';
}): Promise<{
  paid: { period: string; total_revenue: number }[];
  unpaid: { period: string; total_revenue: number }[];
  overdue: { period: string; total_revenue: number }[];
}> {
  const res = await request('/api/finance/stats/revenue', {
    method: 'GET',
    params: { ...params, period: params?.period },
  });
  console.log('getRevenueStats response:', res);
  return res;
}

export async function getOverdueInvoices(): Promise<any> {
  
  const res = await request('/api/finance/check-overdue', {
    method: 'POST',
  });
  console.log('getOverdueInvoices response:', res);
  return res;
}

export async function confirmPayment(id: number): Promise<any> {
  const res = await request(`/api/finance/${id}/confirm-payment`, {
    method: 'PUT',
  });
  console.log('confirmPayment response:', res);
  return res;
}