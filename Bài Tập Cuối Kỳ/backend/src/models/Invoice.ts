export interface Invoice {
  id: number;
  resident_id: number;
  full_name: string;
  apartment_number: string;
  billing_period: string; // Tháng/Kỳ thu, ví dụ: "2025-05"
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue'; // Trạng thái thanh toán
  due_date: Date; // Ngày đến hạn
  created_at: Date;
  updated_at?: Date;
}