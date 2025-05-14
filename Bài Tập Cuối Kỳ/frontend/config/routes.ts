export default [
  // Auth routes
  {
    path: '/auth',
    routes: [
      { path: '/auth/login', component: '@/pages/Auth/Login', title: 'Đăng nhập' },
      { path: '/auth/register', component: '@/pages/Auth/Register', title: 'Đăng ký' },
    ],
  },
  // Dashboard (giả định, cần tạo file nếu dùng)
  
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