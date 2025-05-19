export default [
  // Public Auth Pages
  { path: '/auth/login', component: '@/pages/Auth/Login', layout: false },
  { path: '/auth/register', component: '@/pages/Auth/Register', layout: false },
  { path: '/auth/forgot-password', component: '@/pages/Auth/ForgotPassword', layout: false },
  { path: '/auth/reset-password', component: '@/pages/Auth/ResetPassword', layout: false },

  // Protected Dashboard Routes
  {
    path: '/dashboard',
    component: '@/components/AppLayout',
    routes: [
      {
        path: '/dashboard/residents',
        component: '@/pages/Dashboard/Residents',
        access: 'user',
      },
    { path: '/dashboard/materials',
       component: '@/pages/Dashboard/Materials', 
       access: 'admin' },
        { path: '/materials/details/:id',
           component: '@/pages/Materials/MaterialDetails',
            access: 'admin' },
      {
        path: '/dashboard/residents/details/:id',
        component: '@/pages/Residents/ResidentDetails',
        access: 'user',
      },
    ],
  },

  // User management (admin only)
  {
    path: '/admin/users',
    component: '@/pages/Auth/UserManagement',
    access: 'admin',
  },

  // Redirect root to dashboard
  { path: '/', redirect: '/dashboard/residents' },

  // Catch-all 404
  { path: '*', component: '@/pages/NotFound' },
];
