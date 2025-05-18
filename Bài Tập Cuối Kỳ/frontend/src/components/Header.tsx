import React from 'react';
import { Menu } from 'antd';
import { useSelector, history } from 'umi';

const Header: React.FC = () => {
  const auth = useSelector((state: any) => state.auth);

  const menuItems = [
    ...(auth.user?.role === 'admin'
      ? [
          { key: 'dashboard-overview', label: 'Tổng quan', onClick: () => history.push('/dashboard-overview') },
          { key: 'dashboard-residents', label: 'Cư dân', onClick: () => history.push('/dashboard-residents') },
          { key: 'dashboard-inventory', label: 'Vật tư', onClick: () => history.push('/dashboard-inventory') },
          { key: 'dashboard-finance', label: 'Tài chính', onClick: () => history.push('/dashboard-finance') },
          { key: 'dashboard-vehicles', label: 'Phương tiện', onClick: () => history.push('/dashboard-vehicles') },
          { key: 'dashboard-statistics', label: 'Thống kê', onClick: () => history.push('/dashboard-statistics') },
        ]
      : [])
  ];

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      items={menuItems}
      selectedKeys={[history.location.pathname.split('/')[1]]}
    />
  );
};

export default Header;
