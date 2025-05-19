import React, { useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, message } from 'antd';
import moment from 'moment';
import { getResidentById, updateResident } from '@/services/residents';

interface Props {
  residentId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const ResidentEditForm: React.FC<Props> = ({ residentId, onSuccess, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchResident = async () => {
      try {
        const resident = await getResidentById(residentId);
        form.setFieldsValue({
          fullName: resident.full_name,
          email: resident.email,
          phoneNumber: resident.phone_number,
          dateOfBirth: resident.date_of_birth ? moment(resident.date_of_birth) : null,
          gender: resident.gender,
          apartmentNumber: resident.apartment_number,
          address: resident.address,
        });
      } catch (error: any) {
        message.error(error.message || 'Không thể tải thông tin cư dân');
      }
    };
    fetchResident();
  }, [residentId, form]);

  const onFinish = async (values: any) => {
    try {
      await updateResident(residentId, {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
        gender: values.gender,
        apartmentNumber: values.apartmentNumber,
        address: values.address,
      });
      message.success('Cập nhật cư dân thành công');
      onSuccess(); // đóng modal + reload lại danh sách
    } catch (error: any) {
      message.error(error.message || 'Cập nhật cư dân thất bại');
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
          Lưu thay đổi
        </Button>
        <Button onClick={onCancel} block style={{ marginTop: 8 }}>
          Hủy
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ResidentEditForm;
