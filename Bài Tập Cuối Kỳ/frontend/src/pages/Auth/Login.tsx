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
    const response = await login({
      email: values.email,
      password: values.password,
    });

    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    message.success('Đăng nhập thành công');
    history.push('/dashboard/residents');
  } catch (error: any) {
  console.error('Lỗi đăng nhập:', error);
  const errMsg =
    error.response?.data?.message || // lấy message backend trả về
    error.message || // lỗi JS hoặc lỗi mạng
    'Đăng nhập thất bại';
  message.error(errMsg);
}

};

  // Xử lý lỗi đăng nhập
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