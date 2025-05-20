import React, { useEffect, useState } from 'react';
import { Descriptions, Button, message } from 'antd';
import { useHistory, useParams } from 'umi';
import { getMaterialById } from '../../services/materials';
import styles from '../../assets/styles/index.less';

const MaterialDetails: React.FC = () => {
  const [material, setMaterial] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const data = await getMaterialById(parseInt(id));
        setMaterial(data);
      } catch (error: any) {
        message.error(error.message || 'Không thể tải thông tin vật tư');
      }
    };
    fetchMaterial();
  }, [id]);

  if (!material) return <div>Đang tải...</div>;

  return (
    <div className={styles.authContainer}>
      <h2>Chi tiết vật tư</h2>
      <Descriptions bordered>
        <Descriptions.Item label="ID">{material.id}</Descriptions.Item>
        <Descriptions.Item label="Tên vật tư">{material.name}</Descriptions.Item>
        <Descriptions.Item label="Số lượng tồn kho">{material.quantity}</Descriptions.Item>
        <Descriptions.Item label="Ngưỡng tồn kho thấp">{material.lowStockThreshold}</Descriptions.Item>
        <Descriptions.Item label="Người quản lý">{material.managedBy || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{new Date(material.createdAt).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Ngày cập nhật">{material.updatedAt ? new Date(material.updatedAt).toLocaleString() : 'N/A'}</Descriptions.Item>
      </Descriptions>
      <Button style={{ marginTop: 16 }} onClick={() => history.push('/dashboard/materials')}>
        Quay lại
      </Button>
    </div>
  );
};

export default MaterialDetails;