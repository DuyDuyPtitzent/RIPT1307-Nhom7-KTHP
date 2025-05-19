import React, { useEffect, useState } from 'react';
import { Descriptions, Button, message } from 'antd';
import { useHistory, useParams } from 'umi';
import { getResidentById } from '../../services/residents';
import styles from '@/assets/styles/ResidentDetails.less'; // ✅ Import đúng file .less

const ResidentDetails: React.FC = () => {
  const [resident, setResident] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  useEffect(() => {
    const fetchResident = async () => {
      try {
        const data = await getResidentById(parseInt(id));
        setResident(data);
      } catch (error: any) {
        message.error(error.message || 'Không thể tải thông tin cư dân');
      }
    };
    fetchResident();
  }, [id]);

  if (!resident) return <div>Đang tải...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Chi tiết cư dân</h2>
      <Descriptions bordered>
        <Descriptions.Item label="ID">{resident.id}</Descriptions.Item>
        <Descriptions.Item label="Họ tên">{resident.full_name}</Descriptions.Item>
        <Descriptions.Item label="Email">{resident.email || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{resident.phone_number || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">{resident.date_of_birth ? new Date(resident.date_of_birth).toLocaleDateString() : 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Giới tính">{resident.gender === 'male' ? 'Nam' : resident.gender === 'female' ? 'Nữ' : 'Khác'}</Descriptions.Item>
        <Descriptions.Item label="Số căn hộ">{resident.apartment_number}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">{resident.address || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
  {resident.created_at ? new Date(resident.created_at).toLocaleString() : 'N/A'}
</Descriptions.Item>
        </Descriptions>

      <Button className={styles.backButton} onClick={() => history.push('/dashboard/residents')}>
        Quay lại
      </Button>
    </div>
  );
};

export default ResidentDetails;
