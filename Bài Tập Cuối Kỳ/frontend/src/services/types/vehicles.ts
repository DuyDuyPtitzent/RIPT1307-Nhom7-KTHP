export interface VehicleParams {
  type: 'car' | 'motorcycle' | 'bicycle' | 'other';
  license_plate: string;
  owner_name: string;
  resident_id?: number;
}

export interface Vehicle {
  id: number;
  resident_id: number;
  type: 'car' | 'motorcycle' | 'bicycle' | 'other';
  license_plate: string;
  owner_name: string;
  status: 'pending' | 'approved' | 'rejected';
  apartment_number: string;
  created_at: string;
  updated_at: string;
}
export interface EditVehicleFormProps {
  visible: boolean;
  onCancel: () => void;
}

