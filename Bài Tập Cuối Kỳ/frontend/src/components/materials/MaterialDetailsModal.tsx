// components/materials/MaterialDetailsModal.tsx

import React, { useEffect, useState } from 'react';
import { Descriptions, Modal, message } from 'antd';
import { getMaterialById } from '../../services/materials';

interface Props {
  materialId: number;
  open: boolean;
  onClose: () => void;
}

const MaterialDetailsModal: React.FC<Props> = ({ materialId, open, onClose }) => {
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && materialId) {
      fetchMaterial();
    }
  }, [materialId, open]);

  const fetchMaterial = async () => {
    setLoading(true);
    try {
      const data = await getMaterialById(materialId);
      setMaterial(data);
    } catch (error: any) {
      message.error(error.message || 'Không thể tải thông tin vật tư');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chi tiết vật tư"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      {loading || !material ? (
        <div>Đang tải...</div>
      ) : (
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="ID">{material.id}</Descriptions.Item>
          <Descriptions.Item label="Tên vật tư">{material.name}</Descriptions.Item>
          <Descriptions.Item label="Số lượng tồn kho">{material.quantity}</Descriptions.Item>
          <Descriptions.Item label="Ngưỡng tồn kho thấp">{material.low_stock_threshold}</Descriptions.Item>
          <Descriptions.Item label="Người quản lý">{material.managed_by || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{new Date(material.created_at).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">{material.updated_at ? new Date(material.updated_at).toLocaleString() : 'N/A'}</Descriptions.Item>

        </Descriptions>
      )}
    </Modal>
  );
};

export default MaterialDetailsModal;
