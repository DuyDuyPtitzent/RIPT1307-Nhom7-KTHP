export interface Resident {
  id: number;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  apartmentNumber: string;
  address?: string;
  createdAt: string;
}

export interface CreateResidentParams {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  apartmentNumber: string;
  address?: string;
}

export interface UpdateResidentParams {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  apartmentNumber: string;
  address?: string;
}