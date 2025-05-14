export interface LoginResponse {
  token: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: 'user' | 'admin';
  };
}

export interface RegisterResponse {
  message: string;
}