import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { history } from 'umi';
import { useAuth } from '@/models/auth';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import '@/assets/styles/index.less';


const Login: React.FC = () => {
  const { login } = useAuth();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
      message.success('Đăng nhập thành công');
      history.push('/dashboard');
    } catch (error: any) {
      message.error(error.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="auth-container">
      <h2>Đăng nhập</h2>
      <Form name="login" onFinish={onFinish} style={{ maxWidth: 400, margin: '0 auto' }}>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Đăng nhập
          </Button>
        </Form.Item>
        <Form.Item>
          <a href="/auth/register">Chưa có tài khoản? Đăng ký</a>
          <br />
          <a href="/auth/forgot-password">Quên mật khẩu?</a>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;