import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, message, DatePicker, Select } from 'antd';
import { getInvoiceById, updateInvoice } from '../../services/finance';
import { getResidents } from '../../services/residents';
import moment from 'moment';

interface EditInvoiceModalProps {
  invoiceId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({ invoiceId, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!invoiceId) return;
      setLoading(true);
      try {
        const invoice = await getInvoiceById(invoiceId);
        form.setFieldsValue({
          ...invoice,
          billing_period: moment(invoice.billing_period, 'YYYY-MM'),
          due_date: moment(invoice.due_date, 'YYYY-MM-DD'),
        });

        const residentsData = await getResidents();
        setResidents(residentsData || []);
      } catch (error: any) {
        message.error(error.message || 'Không thể tải thông tin hóa đơn');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [invoiceId, form]);

  const onFinish = async (values: any) => {
    if (!invoiceId) return;
    setLoading(true);
    try {
      const selectedResident = residents.find((r) => r.id === values.resident_id);
      await updateInvoice(invoiceId, {
        resident_id: values.resident_id,
        resident_name: selectedResident.fullName,
        apartment_number: selectedResident.apartmentNumber,
        billing_period: values.billing_period.format('YYYY-MM'),
        amount: values.amount,
        due_date: values.due_date.format('YYYY-MM-DD'),
      });
      message.success('Cập nhật hóa đơn thành công');
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.message || 'Cập nhật hóa đơn thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa hóa đơn"
      open={!!invoiceId}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Cư dân"
          name="resident_id"
          rules={[{ required: true, message: 'Vui lòng chọn cư dân' }]}
        >
          <Select placeholder="Chọn cư dân" loading={loading}>
            {residents.map((resident) => (
              <Select.Option key={resident.id} value={resident.id}>
                {resident.fullName} (Căn hộ: {resident.apartment_number})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Kỳ thu"
          name="billing_period"
          rules={[{ required: true, message: 'Vui lòng chọn kỳ thu' }]}
        >
          <DatePicker picker="month" format="YYYY-MM" disabled={loading} />
        </Form.Item>
        <Form.Item
          label="Số tiền (VND)"
          name="amount"
          rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
        >
          <Input type="number" min={0} disabled={loading} />
        </Form.Item>
        <Form.Item
          label="Hạn thanh toán"
          name="due_date"
          rules={[{ required: true, message: 'Vui lòng chọn hạn thanh toán' }]}
        >
          <DatePicker format="YYYY-MM-DD" disabled={loading} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Cập nhật hóa đơn
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditInvoiceModal;