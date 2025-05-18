import React from 'react';
import { Layout, Menu } from 'antd';
import { useHistory, useLocation } from 'umi';
import { IdcardOutlined, TeamOutlined, EnvironmentOutlined, LogoutOutlined } from '@ant-design/icons';
import styles from '../components/AppLayout.less';

const { Header, Content, Footer } = Layout;

const AppLayout: React.FC = ({ children }) => {
  const history = useHistory();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token'); // ✅ Xóa token
    history.push('/auth/login');// ✅ Chuyển sang trang đăng nhập
  };

  const menuItems = [
    { key: '/dashboard/residents', label: 'Dân cư', icon: <EnvironmentOutlined /> },
    { key: '/admin/users', label: 'Quản lý người dùng', icon: <TeamOutlined /> },
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
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick} // ✅ Gắn xử lý click tùy theo key
        />
      </Header>
      <Content style={{ padding: '24px', minHeight: '80vh' }}>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Hệ thống Quản lý Dân cư ©2025
      </Footer>
    </Layout>
  );
};

export default AppLayout;
