export interface Invoice {
  id: number;
  resident_id: number;
  resident_name: string;
  apartment_number: string;
  billing_period: string;
  amount: number;
  status: string;
  due_date: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateInvoiceParams {
  resident_id: number;
  resident_name: string;
  apartment_number: string;
  billing_period: string;
  amount: number;
  due_date: string;
}

export interface UpdateInvoiceParams {
  resident_id: number;
  resident_name: string;
  apartment_number: string;
  billing_period: string;
  amount: number;
  due_date: string;
  status?: 'PAID' | 'UNPAID' | 'OVERDUE';
}