import React, { useEffect } from 'react';
import { history } from 'umi';
import { useAuth } from '@/models/auth';
import { Spin } from 'antd';
import './index.less';

const IndexPage: React.FC = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Nếu đã đăng nhập, chuyển hướng đến dashboard
        history.push('/dashboard');
      } else {
        // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
        history.push('/auth/login');
      }
    }
  }, [user, loading]);

  // Hiển thị loading trong khi kiểm tra trạng thái đăng nhập
  return (
    <div className="index-container">
      <Spin tip="Đang tải..." />
    </div>
  );
};

export default IndexPage;