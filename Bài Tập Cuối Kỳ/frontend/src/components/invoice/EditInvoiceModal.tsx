// components/invoice/EditInvoiceModal.tsx
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, DatePicker, Select } from 'antd';
import { useFinanceModel } from '@/models/finance';

interface EditInvoiceModalProps {
  invoiceId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({ invoiceId, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const { residents, editLoading, fetchEditInvoiceData, onFinishEditInvoice } = useFinanceModel();

  useEffect(() => {
    fetchEditInvoiceData(invoiceId, form);
  }, [invoiceId, form]);

  return (
    <Modal
      title="Chỉnh sửa hóa đơn"
      open={!!invoiceId}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={(values) => onFinishEditInvoice(invoiceId, values, residents, onSuccess, onClose)}>
        <Form.Item
          label="Cư dân"
          name="resident_id"
          rules={[{ required: true, message: 'Vui lòng chọn cư dân' }]}
        >
          <Select
            placeholder="Chọn cư dân"
            loading={editLoading}
            disabled={!!invoiceId}
          >
            {residents.map((resident) => (
              <Select.Option key={resident.id} value={resident.id}>
                {resident.full_name} (Căn hộ: {resident.apartment_number})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Kỳ thu"
          name="billing_period"
          rules={[{ required: true, message: 'Vui lòng chọn kỳ thu' }]}
        >
          <DatePicker picker="month" format="YYYY-MM" disabled={editLoading} />
        </Form.Item>
        <Form.Item
          label="Số tiền (VND)"
          name="amount"
          rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
        >
          <Input type="number" min={0} disabled={editLoading} />
        </Form.Item>
        <Form.Item
          label="Hạn thanh toán"
          name="due_date"
          rules={[{ required: true, message: 'Vui lòng chọn hạn thanh toán' }]}
        >
          <DatePicker format="YYYY-MM-DD" disabled={editLoading} />
        </Form.Item>
        <Form.Item name="status" noStyle>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={editLoading}>
            Cập nhật hóa đơn
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditInvoiceModal;