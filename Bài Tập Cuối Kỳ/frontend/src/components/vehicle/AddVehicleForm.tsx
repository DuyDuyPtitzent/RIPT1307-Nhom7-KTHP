import React, { useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { getCurrentUser } from '../../services/auth';
import useVehicleModel from '../../models/vehicles';

const { Option } = Select;

interface AddVehicleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddVehicleForm: React.FC<AddVehicleFormProps> = ({ onSuccess, onCancel }) => {
  const { handleCreate, loading } = useVehicleModel();
  const [form] = Form.useForm();
  const [residentId, setResidentId] = React.useState<number | undefined>();
  const [isResident, setIsResident] = React.useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        console.log('User data in AddVehicleForm:', user);
        if ((user.role === 'resident' || user.role === 'user') && user.resident_id != null && user.resident_id > 0) {
          setResidentId(user.resident_id);
          setIsResident(true);
          form.setFieldsValue({ owner_name: user.full_name || '' });
        } else {
          const errorMsg = user.role !== 'resident' && user.role !== 'user'
            ? 'Chỉ cư dân có thể đăng ký phương tiện'
            : 'Tài khoản của bạn chưa được liên kết với thông tin cư dân. Vui lòng liên hệ quản trị viên.';
          message.error(errorMsg);
        }
      } catch (error: any) {
        console.error('Lỗi lấy thông tin user:', error);
        message.error('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
      }
    };
    fetchUser();
  }, [form]);

  const onFinish = async (values: any) => {
    if (!residentId) {
      message.error('Không thể đăng ký: Thiếu thông tin cư dân. Vui lòng liên hệ quản trị viên.');
      return;
    }
    try {
      const vehicleData = { ...values, resident_id: residentId };
      console.log('Submitting vehicle data:', vehicleData);
      await handleCreate(vehicleData);
      form.resetFields();
      message.success('Đăng ký phương tiện thành công');
      onSuccess();
    } catch (error: any) {
      console.error('Lỗi khi thêm phương tiện:', error);
      message.error(error.response?.data?.message || 'Lỗi khi đăng ký phương tiện');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} disabled={loading || !isResident}>
      <Form.Item
        name="type"
        label="Loại phương tiện"
        rules={[{ required: true, message: 'Vui lòng chọn loại phương tiện' }]}
      >
        <Select placeholder="Chọn loại phương tiện">
          <Option value="car">Ô tô</Option>
          <Option value="motorcycle">Xe máy</Option>
          <Option value="bicycle">Xe đạp</Option>
          <Option value="other">Khác</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="license_plate"
        label="Biển số xe"
        rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}
      >
        <Input placeholder="Nhập biển số xe" />
      </Form.Item>
      <Form.Item
        name="owner_name"
        label="Chủ sở hữu"
        rules={[{ required: true, message: 'Vui lòng nhập tên chủ sở hữu' }]}
      >
        <Input placeholder="Nhập tên chủ sở hữu" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} disabled={loading || !isResident}>
          Đăng ký
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={onCancel}>
          Hủy
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddVehicleForm;