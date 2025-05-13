export interface User {
  id: number;
  full_name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  reset_token?: string | null;
  reset_token_expiry?: Date | null;
  created_at: Date;
}