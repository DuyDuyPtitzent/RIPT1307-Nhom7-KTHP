export default [
  // Auth routes
  {
    path: '/auth',
    routes: [
      { path: '/auth/login', component: '@/pages/Auth/Login', title: 'Đăng nhập' },
      { path: '/auth/register', component: '@/pages/Auth/Register', title: 'Đăng ký' },
      { path: '/auth/forgot-password', component: '@/pages/Auth/ForgotPassword', title: 'Quên mật khẩu' },
      { path: '/auth/reset-password', component: '@/pages/Auth/ResetPassword', title: 'Đặt lại mật khẩu' },
    ],
  },

  // Admin routes
  {
    path: '/admin/users',
    component: '@/pages/Auth/UserManagement', // Đường dẫn nên đúng với file thật
    access: 'admin',
  },

  // Redirect root to auth/login
  {
    path: '/',
    redirect: '/auth/login',
  },

  // 404 fallback
  {
    path: '*',
    component: '@/pages/NotFound',
  },
];
