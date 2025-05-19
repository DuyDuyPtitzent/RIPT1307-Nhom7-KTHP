export interface Vehicle {
    id: number;
    license_plate: string;
    type: 'car' | 'motorbike';
    owner_id: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: Date;
  }