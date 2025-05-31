// src/services/types/finance.ts

export interface Invoice {
  id: number;
  resident_id: number;
  resident_name: string;
  apartment_number: string;
  billing_period: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  due_date: string;
  created_at: string;
  updated_at?: string;
  
  // Thêm các trường chi tiết đã có trong backend
  invoice_number?: string | null; // CÓ THỂ LÀ NULL TỪ DB
  number_of_people?: number | null;
  room_price?: number | null;
  electricity_start?: number | null;
  electricity_end?: number | null;
  electricity_rate?: number | null;
  water_start?: number | null;
  water_end?: number | null;
  water_rate?: number | null;
  internet_fee?: number | null;
  service_fee_per_person?: number | null;
}

export interface CreateInvoiceParams {
  resident_id: number;
  resident_name: string;
  apartment_number: string;
  billing_period: string;
  amount: number;
  due_date: string;
  status?: 'paid' | 'unpaid' | 'overdue'; // Thêm trường status để khớp với InvoiceFormData

  // Thêm các trường chi tiết cần gửi đi
  invoice_number?: string;
  number_of_people?: number;
  room_price?: number;
  electricity_start?: number;
  electricity_end?: number;
  electricity_rate?: number;
  water_start?: number;
  water_end?: number;
  water_rate?: number;
  internet_fee?: number;
  service_fee_per_person?: number;
}

export interface UpdateInvoiceParams {
  resident_id: number;
  resident_name: string;
  apartment_number: string;
  billing_period: string;
  amount: number;
  due_date: string;
  status?: 'paid' | 'unpaid' | 'overdue';

  // Thêm các trường chi tiết cần cập nhật
  invoice_number?: string;
  number_of_people?: number;
  room_price?: number;
  electricity_start?: number;
  electricity_end?: number;
  electricity_rate?: number;
  water_start?: number;
  water_end?: number;
  water_rate?: number;
  internet_fee?: number;
  service_fee_per_person?: number;
}

export interface Resident {
  id: number;
  name: string;
  apartment: string;
  email?: string;
  full_name?: string; // Có thể cần thêm nếu backend trả về full_name
  apartment_number?: string; // Có thể cần thêm nếu backend trả về apartment_number
}

export interface InvoiceFormData {
  invoiceNumber: string;
  residentId: number | null;
  resident_name: string;
  apartment_number: string;
  month: string;
  numberOfPeople: number;
  roomPrice: number;
  electricityStart: number;
  electricityEnd: number;
  electricityRate: number;
  waterStart: number;
  waterEnd: number;
  waterRate: number;
  internetFee: number;
  serviceFeePerPerson: number;
  paymentStatus: 'paid' | 'unpaid'; // Thay đổi từ 'paid' | 'unpaid' sang 'paid' | 'unpaid' | 'overdue' nếu bạn muốn form cũng có thể set 'overdue'
  dueDate: string;
}