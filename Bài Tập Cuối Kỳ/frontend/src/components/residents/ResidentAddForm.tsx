import React from 'react';
import { Form, Input, Button, message, DatePicker, Select } from 'antd';
import { createResident } from '../../services/residents';


interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

const ResidentAddForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      await createResident({
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
        gender: values.gender,
        apartmentNumber: values.apartmentNumber,
        address: values.address,
      });
      message.success('Thêm cư dân thành công');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      message.error(error.message || 'Thêm cư dân thất bại');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item label="Họ tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Số điện thoại" name="phoneNumber">
        <Input />
      </Form.Item>
      <Form.Item label="Ngày sinh" name="dateOfBirth">
        <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="Giới tính" name="gender">
        <Select>
          <Select.Option value="male">Nam</Select.Option>
          <Select.Option value="female">Nữ</Select.Option>
          <Select.Option value="other">Khác</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="Số căn hộ" name="apartmentNumber" rules={[{ required: true, message: 'Vui lòng nhập số căn hộ' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Địa chỉ" name="address">
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Thêm cư dân
        </Button>
        <Button style={{ marginTop: 8 }} onClick={onCancel} block>
          Hủy
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ResidentAddForm;
