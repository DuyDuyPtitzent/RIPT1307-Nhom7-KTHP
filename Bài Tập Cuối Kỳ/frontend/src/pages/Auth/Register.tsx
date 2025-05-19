import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useRequest } from 'umi';
import { history } from 'umi';
import { register } from '../../services/auth';
import styles from '../../assets/styles/index.less';

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const { run } = useRequest(register, {
    manual: true,
    onSuccess: () => {
      setLoading(false);
      message.success('Đăng ký thành công, vui lòng đăng nhập');
      history.push('/auth/login');
    },
    onError: (error: any) => {
  setLoading(false);
  const errorMsg =
    error?.response?.data?.message ||
    (error?.data?.message ?? error.message) ||
    'Đăng ký thất bại';
  message.error(errorMsg);
},


  });

 const onFinish = async (values: any) => {
  setLoading(true);
  await run({
    fullName: values.fullName,
    email: values.email,
    password: values.password,
    confirmPassword: values.confirmPassword, // Thêm dòng này
  });
};


  return (
    <div className={styles.authContainer}>
      <h2>Đăng ký</h2>
      <Form
        name="register"
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Họ tên"
          name="fullName"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
        >
          <Input />
        </Form.Item>

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
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Đăng ký
          </Button>
        </Form.Item>

        <Form.Item>
          <Button type="link" onClick={() => history.push('/auth/login')}>
            Đã có tài khoản? Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register