import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Modal, Spin, message } from 'antd';
import { getCurrentUser } from '../../services/auth';
import { getVehicleById, updateVehicle } from '../../services/vehicles';
import { EditVehicleFormProps } from '@/services/types/vehicles';

const { Option } = Select;

interface Props extends EditVehicleFormProps {
  vehicleId: number | null; // Nhận vehicleId từ props
}

const EditVehicleForm: React.FC<Props> = ({ visible, onCancel, vehicleId }) => {
  const [form] = Form.useForm();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [vehicleData, setVehicleData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lấy thông tin user để kiểm tra quyền admin
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        console.log('Current user:', user);
        setIsAdmin(user.role === 'admin');
      } catch (error) {
        console.error('Lỗi lấy thông tin người dùng:', error);
      }
    };
    fetchUser();
  }, []);

  // Lấy dữ liệu phương tiện khi modal mở và vehicleId tồn tại
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchVehicle = async () => {
      if (!visible || !vehicleId) {
        setVehicleData(null);
        setLoading(false);
        setError(null);
        form.resetFields();
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const vehicle = await getVehicleById(vehicleId);
        console.log('Fetched vehicle in EditVehicleForm:', vehicle);
        if (!vehicle) {
          throw new Error('Dữ liệu phương tiện không hợp lệ');
        }
        setVehicleData(vehicle);
        form.setFieldsValue({
          type: vehicle.type || '',
          license_plate: vehicle.license_plate || '',
          owner_name: vehicle.owner_name || '',
          status: isAdmin ? vehicle.status : undefined,
        });
        setError(null);
      } catch (error: any) {
        console.error('Lỗi khi tải phương tiện trong EditVehicleForm:', error);
        setError(error.message || 'Lỗi khi tải thông tin phương tiện');
        setVehicleData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();

    // Timeout 7s để tránh loading mãi
    if (visible && vehicleId) {
      timeoutId = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setError('Không thể tải dữ liệu phương tiện, vui lòng thử lại');
          message.error('Không thể tải dữ liệu phương tiện, vui lòng thử lại');
        }
      }, 7000);
    }

    return () => clearTimeout(timeoutId);
  }, [visible, vehicleId, form, isAdmin]);

  const onFinish = async (values: any) => {
    if (submitting) {
      console.log('Submit đang được xử lý, bỏ qua');
      return;
    }
    if (!vehicleId) {
      console.error('Không có vehicleId:', vehicleId);
      message.error('Không có ID phương tiện để cập nhật');
      return;
    }
    setSubmitting(true);
    try {
      console.log('Submitting form with values:', values);
      await updateVehicle(vehicleId, values);
      message.success('Cập nhật phương tiện thành công');
      onCancel(); // Đóng modal sau khi cập nhật
    } catch (error: any) {
      console.error('Lỗi khi cập nhật:', error);
      message.error(error.message || 'Lỗi khi cập nhật phương tiện');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa phương tiện"
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose={true}
    >
      {loading ? (
        <Spin tip="Đang tải dữ liệu phương tiện..." />
      ) : error ? (
        <p>{error}</p>
      ) : (
        <Form form={form} layout="vertical" onFinish={onFinish} disabled={loading || submitting}>
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
          {isAdmin && (
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="pending">Chờ duyệt</Option>
                <Option value="approved">Đã duyệt</Option>
                <Option value="rejected">Bị từ chối</Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading || submitting}>
              Cập nhật
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={onCancel}>
              Hủy
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default EditVehicleForm;