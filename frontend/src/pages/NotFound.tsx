import React from 'react';
import { Button, Result } from 'antd';
import { history } from 'umi';

const NotFound: React.FC = () => {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Xin lỗi, trang bạn truy cập không tồn tại."
      extra={
        <Button type="primary" onClick={() => history.push('/')}>
          Về trang chủ
        </Button>
      }
    />
  );
};

export default NotFound;