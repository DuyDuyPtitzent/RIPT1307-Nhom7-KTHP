import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import { useHistory, useLocation } from 'umi';
import {
  IdcardOutlined,
  EnvironmentOutlined,
  LogoutOutlined,
  ToolOutlined,
  DollarOutlined, // Thêm icon cho tài chính
} from '@ant-design/icons';
import styles from './AppLayout.less';
import { getCurrentUser } from '../services/auth';

const { Header, Content } = Layout;

const AppLayout: React.FC = ({ children }) => {
  const history = useHistory();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setIsAdmin(user.role === 'admin');
      } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    history.push('/auth/login');
  };

  const menuItems = [
    { key: '/dashboard/residents', label: 'Dân cư', icon: <EnvironmentOutlined /> },
    { key: '/dashboard/finance', label: 'Tài chính', icon: <DollarOutlined /> }, // Thêm icon
    { key: '/dashboard/vehicles', label: 'Phương tiện', icon: <IdcardOutlined /> },
    ...(isAdmin
      ? [
          { key: '/dashboard/materials', label: 'Vật tư', icon: <ToolOutlined /> },
        ]
      : []),
    { key: 'profile', label: 'Hồ sơ', icon: <IdcardOutlined /> },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined /> },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'profile') {
      history.push('/profile/user');
    } else {
      history.push(key);
    }
  };

  return (
    <Layout className={styles.authContainer}>
      <Header>
        <Menu
          mode="horizontal"
          theme="dark"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Header>
      <Content style={{ padding: '24px', minHeight: '80vh' }}>{children}</Content>
    </Layout>
  );
};

export default AppLayout;