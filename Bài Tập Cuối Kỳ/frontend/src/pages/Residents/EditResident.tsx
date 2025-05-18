import React, { useEffect } from 'react';
import { Form, Input, Button, message, DatePicker, Select } from 'antd';
import { useHistory, useParams } from 'umi';
import { getResidentById, updateResident } from '../../services/residents';
import styles from '../../assets/styles/index.less';
import moment from 'moment';

const EditResident: React.FC = () => {
  const [form] = Form.useForm();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
  const fetchResident = async () => {
    try {
      const resident = await getResidentById(parseInt(id));
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
}, [id, form]);

  const onFinish = async (values: any) => {
    try {
      await updateResident(parseInt(id), {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
        gender: values.gender,
        apartmentNumber: values.apartmentNumber,
        address: values.address,
      });
      message.success('Cập nhật cư dân thành công');
      history.push('/dashboard/residents');
    } catch (error: any) {
      message.error(error.message || 'Cập nhật cư dân thất bại');
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>Chỉnh sửa cư dân</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Họ tên"
          name="fullName"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
        >
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
        <Form.Item
          label="Số căn hộ"
          name="apartmentNumber"
          rules={[{ required: true, message: 'Vui lòng nhập số căn hộ' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Địa chỉ" name="address">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Cập nhật cư dân
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditResident;