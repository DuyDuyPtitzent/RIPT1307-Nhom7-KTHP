import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const CustomFooter: React.FC = () => {
  return (
    <Footer style={{ textAlign: 'center' }}>
      Hệ thống Quản lý Dân cư ©2025
    </Footer>
  );
};

export default CustomFooter;