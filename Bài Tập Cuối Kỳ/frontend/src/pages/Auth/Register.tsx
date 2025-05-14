import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { history } from 'umi';
import { useAuth } from '@/models/auth';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import '@/assets/styles/index.less';


const Register: React.FC = () => {
  const { register } = useAuth();

  const onFinish = async (values: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      await register(values.fullName, values.email, values.password, values.confirmPassword);
      message.success('Đăng ký thành công');
      history.push('/auth/login');
    } catch (error: any) {
      message.error(error.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="auth-container">
      <h2>Đăng ký</h2>
      <Form name="register" onFinish={onFinish} style={{ maxWidth: 400, margin: '0 auto' }}>
        <Form.Item
          name="fullName"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Họ tên" />
        </Form.Item>
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
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Đăng ký
          </Button>
        </Form.Item>
        <Form.Item>
          <a href="/auth/login">Đã có tài khoản? Đăng nhập</a>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;