export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  DASHBOARD_OVERVIEW: '/dashboard-overview',
  PROFILE: '/profile/user',
  ADMIN_USER_MANAGEMENT: '/admin/users',
};

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'current_user',
};

export const config = {
  API_URL: 'http://localhost:5000',
};

export const ADMIN_ROUTES = [
  ROUTES.ADMIN_USER_MANAGEMENT,
];
