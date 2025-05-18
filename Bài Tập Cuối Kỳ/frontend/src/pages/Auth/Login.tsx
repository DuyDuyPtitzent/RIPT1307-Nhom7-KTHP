import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useHistory } from 'umi';
import { login } from '../../services/auth';
import styles from '../../assets/styles/index.less';

const Login: React.FC = () => {
  const history = useHistory();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      const response = await login({ email: values.email, password: values.password });
      console.log('Login response:', response);

      // Lưu token và user info
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      message.success('Đăng nhập thành công');
      // Chuyển hướng đến trang cư dân
      history.push('/dashboard/residents');
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error);
      message.error(error.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>Đăng nhập</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;