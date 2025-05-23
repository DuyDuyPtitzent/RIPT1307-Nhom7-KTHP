export interface Vehicle {
  id: number;
  resident_id: number;
  type: 'car' | 'motorcycle' | 'bicycle' | 'other';
  license_plate: string;
  owner_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
}