import React, { useState, useEffect } from 'react';
import { Form, Button, message, DatePicker, Select } from 'antd';
import { useHistory } from 'umi';
import { createInvoice } from '../../services/finance';
import { getResidents } from '../../services/residents';
import { InputNumber } from 'antd';

const AddInvoice: React.FC = () => {
  const [form] = Form.useForm();
  const [residents, setResidents] = useState<any[]>([]);
  const history = useHistory();

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const residentsData = await getResidents();
        setResidents(residentsData || []);
      } catch (error) {
        message.error('Không thể tải danh sách cư dân');
      }
    };
    fetchResidents();
  }, []);

  const onFinish = async (values: any) => {
    try {
      const selectedResident = residents.find((r) => r.id === Number(values.residentId));
      if (!selectedResident) {
        message.error('Không tìm thấy cư dân');
        return;
      }

      const billingPeriod = values.billingPeriod?.format('YYYY-MM');
      const dueDate = values.dueDate?.format('YYYY-MM-DD');

      if (!billingPeriod) {
        message.error('Vui lòng chọn kỳ thu');
        return;
      }
      if (!dueDate) {
        message.error('Vui lòng chọn hạn thanh toán');
        return;
      }

      await createInvoice({
        resident_id: Number(values.residentId),
        resident_name: selectedResident.full_name,
        apartment_number: selectedResident.apartment_number,
        billing_period: billingPeriod,
        amount: Number(values.amount),
        due_date: dueDate,
      });

      message.success('Thêm hóa đơn thành công');
      history.push('/dashboard/finance', { refresh: true });
    } catch (error: any) {
      console.error('Lỗi khi thêm hóa đơn:', error);
      message.error(error.response?.data?.message || 'Thêm hóa đơn thất bại');
    }
  };

  return (
    <div className="authContainer">
      <h2>Thêm hóa đơn mới</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Cư dân"
          name="residentId"
          rules={[{ required: true, message: 'Vui lòng chọn cư dân' }]}
        >
          <Select placeholder="Chọn cư dân">
            {residents.map((resident) => (
              <Select.Option key={resident.id} value={resident.id}>
                {resident.full_name} (Căn hộ: {resident.apartment_number})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Kỳ thu"
          name="billingPeriod"
          rules={[{ required: true, message: 'Vui lòng chọn kỳ thu' }]}
        >
          <DatePicker picker="month" format="YYYY-MM" />
        </Form.Item>
        <Form.Item
          label="Số tiền (VND)"
          name="amount"
          rules={[
            { required: true, message: 'Vui lòng nhập số tiền' },
            { type: 'number', min: 0, message: 'Số tiền phải lớn hơn hoặc bằng 0' },
          ]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label="Hạn thanh toán"
          name="dueDate"
          rules={[{ required: true, message: 'Vui lòng chọn hạn thanh toán' }]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Thêm hóa đơn
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddInvoice;