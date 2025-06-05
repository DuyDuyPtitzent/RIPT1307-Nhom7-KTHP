import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useLocation, history } from 'umi';
import { resetPassword } from '../../services/auth';
import styles from '../../assets/styles/index.less';

const ResetPassword: React.FC = () => { // Component ResetPassword dùng để đặt lại mật khẩu
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    setToken(tokenFromUrl);
    if (!tokenFromUrl) {
      message.error('Token không hợp lệ');
      history.push('/auth/login');
    }
  }, [location]);

  const onFinish = async (values: any) => {
    if (!token) {
      message.error('Token không hợp lệ');
      return;
    }

    setLoading(true); // Bắt đầu quá trình đặt lại mật khẩu
    try {
      console.log('Gọi resetPassword trực tiếp trong onFinish:', { token, newPassword: values.newPassword });
      const result = await resetPassword({
        token,
        newPassword: values.newPassword,
      });
      console.log('Kết quả gọi trực tiếp resetPassword:', result);

      message.success('Đặt lại mật khẩu thành công, vui lòng đăng nhập');
      history.push('/auth/login');
    } catch (error: any) {
      console.error('Lỗi trong onFinish:', error);
      message.error(error.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>Đặt lại mật khẩu</h2>
      <Form
        name="resetPassword"
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
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
            Đặt lại mật khẩu
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

export default ResetPassword;