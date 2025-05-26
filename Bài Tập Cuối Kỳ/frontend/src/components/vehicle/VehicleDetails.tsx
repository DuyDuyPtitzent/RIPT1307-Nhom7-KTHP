import React, { useEffect, useState } from 'react';
import { Descriptions, Button } from 'antd';
import { useHistory, useParams } from 'umi';
import { getVehicleById } from '../../services/vehicles';

const VehicleDetails: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<any>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const data = await getVehicleById(Number(id));
        setVehicle(data);
      } catch (error) {
        console.error('Lỗi lấy thông tin phương tiện:', error);
      }
    };
    fetchVehicle();
  }, [id]);

  if (!vehicle) return <div>Đang tải...</div>;

  return (
    <div>
      <Descriptions title="Chi tiết phương tiện" bordered>
        <Descriptions.Item label="ID">{vehicle.id}</Descriptions.Item>
        <Descriptions.Item label="Loại phương tiện">{vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}</Descriptions.Item>
        <Descriptions.Item label="Biển số xe">{vehicle.license_plate}</Descriptions.Item>
        <Descriptions.Item label="Chủ sở hữu">{vehicle.owner_name}</Descriptions.Item>
        <Descriptions.Item label="Căn hộ">{vehicle.apartment_number}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">{vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}</Descriptions.Item>
        <Descriptions.Item label="Ngày đăng ký">{new Date(vehicle.created_at).toLocaleDateString('vi-VN')}</Descriptions.Item>
      </Descriptions>
      <Button style={{ marginTop: 16 }} onClick={() => history.push('/dashboard/vehicles')}>
        Quay lại
      </Button>
    </div>
  );
};

export default VehicleDetails;