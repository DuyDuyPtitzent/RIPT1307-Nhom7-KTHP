import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { history } from 'umi';
import { login } from '../../services/auth';
import styles from '../../assets/styles/index.less';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Tạm thời bỏ useRequest vì gây lỗi
  /*
  const { run } = useRequest(login, {
    manual: true,
    onSuccess: (result) => {
      setLoading(false);
      console.log('Login result raw (onSuccess):', result);
      console.log('result.token:', result?.token);
      console.log('result.user:', result?.user);
      console.log('result.data:', result?.data);
      console.log('result.data?.token:', result?.data?.token);
      console.log('result.data?.user:', result?.data?.user);

      const token = result?.token || result?.data?.token;
      const user = result?.user || result?.data?.user;

      if (!token || !user) {
        message.error('Phản hồi đăng nhập không hợp lệ');
        console.error('Token hoặc user không tồn tại:', { token, user });
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      message.success('Đăng nhập thành công');

      if (user.role === 'admin') {
        history.push('/dashboard-overview');
      } else {
        history.push('/profile/user');
      }
    },
    onError: (error: any) => {
      setLoading(false);
      console.error('Login error:', error);
      message.error(error.message || 'Đăng nhập thất bại');
    },
  });
  */

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      console.log('Gọi login trực tiếp trong onFinish:', values);
      const result = await login(values);
      console.log('Kết quả gọi trực tiếp login:', result);

      const token = result?.token;
      const user = result?.user;

      if (!token || !user) {
        message.error('Phản hồi đăng nhập không hợp lệ');
        console.error('Token hoặc user không tồn tại:', { token, user });
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      message.success('Đăng nhập thành công');

      if (user.role === 'admin') {
        history.push('/dashboard-overview');
      } else {
        history.push('/profile/user');
      }
    } catch (error: any) {
      console.error('Lỗi trong onFinish:', error);
      message.error(error.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>Đăng nhập</h2>
      <Form
        name="login"
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

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Đăng nhập
          </Button>
        </Form.Item>

        <Form.Item>
          <Button type="link" onClick={() => history.push('/auth/forgot-password')}>
            Quên mật khẩu?
          </Button>
          <Button type="link" onClick={() => history.push('/auth/register')}>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;