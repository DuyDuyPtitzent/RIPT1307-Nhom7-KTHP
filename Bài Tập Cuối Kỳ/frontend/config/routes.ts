export default [
  	
 {
		path: '/Dashboard/Residents',
		name: 'Dân cư',
		component: './Dashboard/Residents',
		icon: 'EnvironmentOutlined',
	},{
		path: '/dashboard/finance',
		name: 'Tài Chính',
		component: './Dashboard/Finance',
		icon: 'DollarOutlined',
	},{
		path: '/dashboard/vehicless',
		name: 'Phương Tiện',
		component: './Dashboard/Vehicles',
		icon: 'AppstoreOutlined',
	},{
		path: '/dashboard/materials',
		name: 'Vật Tư',
		component: './Dashboard/Materials',
    icon: 'ToolOutlined',
	},{
		path: '/logout',
		name: 'Đăng xuất',
		component: './Auth/Logout',
    icon: 'LogoutOutlined',
    
	},{
        path: '/profile',
        component: './Profile/UserProfile',
        //access: 'user', // Cả user và admin đều có thể truy cập
        name: 'Tài khoản',
        icon: 'UserOutlined'},
  



  // Public Auth Pages
  { path: '/auth/login', component: '@/pages/Auth/Login', layout: false },
  { path: '/auth/register', component: '@/pages/Auth/Register', layout: false },
  { path: '/auth/forgot-password', component: '@/pages/Auth/ForgotPassword', layout: false },
  { path: '/auth/reset-password', component: '@/pages/Auth/ResetPassword', layout: false },

  // Protected Dashboard Routes
  {
    routes: [
      {path: '/dashboard/residents',component: '@/pages/Dashboard/Residents',access: 'user',},
      { path: '/dashboard/materials',component: '@/pages/Dashboard/Materials', access: 'admin' },
      { path: '/dashboard/finance', component: '@/pages/Dashboard/Finance', access: 'user' },
//{ path: '/dashboard/Overdue', component: '@/pages/Dashboard/OverdueManagement', access: 'admin' },
    //  { path: '/materials/details/:id',component: '@/pages/Materials/MaterialDetails',access: 'admin' },
      {path: '/dashboard/residents/details/:id',component: '@/pages/Residents/ResidentDetails',access: 'user',},
      // { path: '/invoices/details/:id', component: '@/pages/Invoices/InvoiceDetails', access: 'user' },
       { path: '/dashboard/invoices/add', component: '@/pages/Invoices/AddInvoice', access: 'admin' },
        { path: '/dashboard/vehicles', component: '@/pages/Dashboard/Vehicles', access: 'user' },
    
   
  

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
