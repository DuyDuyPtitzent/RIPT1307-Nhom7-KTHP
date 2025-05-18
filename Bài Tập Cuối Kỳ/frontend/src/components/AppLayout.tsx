import React from 'react';
import { Layout, Menu } from 'antd';
import { useHistory, useLocation } from 'umi';
import styles from '../components/AppLayout.less';

const { Header, Content, Footer } = Layout;

const AppLayout: React.FC = ({ children }) => {
  const history = useHistory();
  const location = useLocation();

  const menuItems = [
    { key: '/dashboard/residents', label: 'Dân cư' },
    { key: '/admin/users', label: 'Quản lý người dùng' }, // Chỉ admin
  ];

  return (
    <Layout className={styles.authContainer}>
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => history.push(key)}
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