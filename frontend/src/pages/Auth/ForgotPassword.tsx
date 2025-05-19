import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { history } from 'umi';
import { forgotPassword } from '../../services/auth';
import styles from '../../assets/styles/index.less';

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      console.log('Gọi forgotPassword trực tiếp trong onFinish:', values);
      const result = await forgotPassword({ email: values.email });
      console.log('Kết quả gọi trực tiếp forgotPassword:', result);

      message.success('Yêu cầu đặt lại mật khẩu đã được gửi, vui lòng kiểm tra email');
      history.push('/auth/login');
    } catch (error: any) {
      console.error('Lỗi trong onFinish:', error);
      message.error(error.message || 'Gửi yêu cầu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>Quên mật khẩu</h2>
      <Form
        name="forgotPassword"
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Gửi yêu cầu
          </Button>
        </Form.Item>

        <Form.Item>
          <Button type="link" onClick={() => history.push('/auth/login')}>
            Quay lại đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPassword;