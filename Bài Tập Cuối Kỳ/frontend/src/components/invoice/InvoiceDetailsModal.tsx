// src/components/InvoiceDetailModal.tsx

import React from 'react';
import { Descriptions, Modal } from 'antd';

interface InvoiceDetailModalProps {
  visible: boolean;
  onClose: () => void;
  invoice: any;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ visible, onClose, invoice }) => {
  if (!invoice) return null;

  return (
    <Modal
      title="Chi tiết hóa đơn"
      open={visible}
      onCancel={onClose}
      onOk={onClose}
      width={800}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="ID">{invoice.id}</Descriptions.Item>
        <Descriptions.Item label="Cư dân">{invoice.resident_name}</Descriptions.Item>
        <Descriptions.Item label="Căn hộ">{invoice.apartment_number}</Descriptions.Item>
        <Descriptions.Item label="Kỳ thu">{invoice.billing_period}</Descriptions.Item>
        <Descriptions.Item label="Số tiền">{(invoice.amount / 100).toLocaleString('vi-VN')} VND</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">{invoice.status}</Descriptions.Item>
        <Descriptions.Item label="Hạn thanh toán">{new Date(invoice.due_date).toLocaleDateString()}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{new Date(invoice.created_at).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Ngày cập nhật">{invoice.updated_at ? new Date(invoice.updated_at).toLocaleString() : 'N/A'}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default InvoiceDetailModal;
