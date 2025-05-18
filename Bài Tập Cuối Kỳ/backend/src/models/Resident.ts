export interface Resident {
  id: number;
  full_name: string;
  email?: string; // Có thể null
  phone_number?: string; // Có thể null
  date_of_birth?: Date; // Có thể null nếu không bắt buộc
  gender?: 'male' | 'female' | 'other'; // ENUM
  apartment_number: string;
  address?: string;
  created_at: Date;
  created_by?: number; // Có thể null nếu người tạo bị xóa
}
