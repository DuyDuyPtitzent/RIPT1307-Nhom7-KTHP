export interface Invoice {
  id: number;
  resident_id: number;
  resident_name: string;
  apartment_number: string;
  billing_period: string; // Tháng/Kỳ thu, ví dụ: "2025-05"
  amount: number // Số tiền hóa đơn
  status: 'paid' | 'unpaid' | 'overdue'; // Trạng thái thanh toán
  due_date: Date; // Ngày đến hạn
  created_at: Date;
  updated_at?: Date;

  // Các trường chi tiết mới được thêm vào từ Form
  invoice_number?: string; // Số hóa đơn tự động tạo
  number_of_people?: number; // Số người trong căn hộ
  room_price?: number; // Giá phòng
  electricity_start?: number; // Số điện đầu
  electricity_end?: number; // Số điện cuối
  electricity_rate?: number; // Giá điện
  water_start?: number; // Số nước đầu
  water_end?: number; // Số nước cuối
  water_rate?: number; // Giá nước
  internet_fee?: number; // Phí internet
  service_fee_per_person?: number; // Phí dịch vụ mỗi người
}
