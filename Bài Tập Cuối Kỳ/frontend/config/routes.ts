export default [
  { path: '/auth/login', component: '@/pages/Auth/Login' },
  { path: '/auth/register', component: '@/pages/Auth/Register' },
  { path: '/auth/forgot-password', component: '@/pages/Auth/ForgotPassword' },
  { path: '/auth/reset-password', component: '@/pages/Auth/ResetPassword' },
  {
  path: '/dashboard',
  component: '@/components/AppLayout',
  routes: [
    { path: '/dashboard/residents', component: '@/pages/Dashboard/Residents', access: 'user' },
    { path: '/dashboard/residents/add', component: '@/pages/Residents/AddResident', access: 'admin' },
    { path: '/dashboard/residents/edit/:id', component: '@/pages/Residents/EditResident', access: 'admin' },
    { path: '/dashboard/residents/details/:id', component: '@/pages/Residents/ResidentDetails', access: 'user' },
  ],
},
  { path: '/admin/users', component: '@/pages/Auth/UserManagement', access: 'admin' },
  { path: '/', redirect: '/dashboard/residents' },
  { path: '*', component: '@/pages/NotFound' },
];