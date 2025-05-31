export interface RentalInfo {
  startDate: string;
  endDate: string;
  durationMonths: number;
  remainingDays: number;
  isExpired: boolean;
}

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  avatar: string | null;
  role: 'user' | 'admin';
  extensionEnabled: boolean;
  rentalInfo: RentalInfo | null;
  createdAt: string;
}

export interface Account {
  id: number;
  fullName: string;
  email: string;
  avatar: string | null;
  role: 'user' | 'admin';
  extensionEnabled: boolean;
  rentalInfo: RentalInfo | null;
  createdAt: string;
}

export interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ExtendForm {
  months: number;
}

export interface ToggleExtension {
  userId: number;
  enabled: boolean;
}