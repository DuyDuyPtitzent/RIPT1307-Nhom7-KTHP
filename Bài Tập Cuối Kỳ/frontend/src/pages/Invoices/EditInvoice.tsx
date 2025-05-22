import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, DatePicker, Select } from 'antd';
import { useHistory, useParams } from 'umi';
import { getInvoiceById, updateInvoice } from '../../services/finance';
import { getResidents } from '../../services/residents';
import styles from '../../assets/styles/index.less';
import moment from 'moment';

const EditInvoice: React.FC = () => {
  const [form] = Form.useForm();
  const [residents, setResidents] = useState<any[]>([]);
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const invoice = await getInvoiceById(parseInt(id));
        form.setFieldsValue({
          ...invoice,
          billing_period: moment(invoice.billing_period, 'YYYY-MM'),
          due_date: moment(invoice.due_date, 'YYYY-MM-DD'),
        });

        const residentsData = await getResidents();
        setResidents(residentsData || []);
      } catch (error: any) {
        message.error(error.message || 'Không thể tải thông tin hóa đơn');
      }
    };
    fetchData();
  }, [id, form]);

  const onFinish = async (values: any) => {
    try {
      const selectedResident = residents.find((r) => r.id === values.resident_id);
      await updateInvoice(parseInt(id), {
        resident_id: values.resident_id,
        resident_name: selectedResident.fullName,
        apartment_number: selectedResident.apartmentNumber,
        billing_period: values.billing_period.format('YYYY-MM'),
        amount: values.amount,
        due_date: values.due_date.format('YYYY-MM-DD'),
      });
      message.success('Cập nhật hóa đơn thành công');
      history.push('/dashboard/finance');
    } catch (error: any) {
      message.error(error.message || 'Cập nhật hóa đơn thất bại');
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>Chỉnh sửa hóa đơn</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Cư dân"
          name="resident_id"
          rules={[{ required: true, message: 'Vui lòng chọn cư dân' }]}
        >
          <Select placeholder="Chọn cư dân">
            {residents.map((resident) => (
              <Select.Option key={resident.id} value={resident.id}>
                {resident.fullName} (Căn hộ: {resident.apartmentNumber})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Kỳ thu"
          name="billing_period"
          rules={[{ required: true, message: 'Vui lòng chọn kỳ thu' }]}
        >
          <DatePicker picker="month" format="YYYY-MM" />
        </Form.Item>
        <Form.Item
          label="Số tiền (VND)"
          name="amount"
          rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
        >
          <Input type="number" min={0} />
        </Form.Item>
        <Form.Item
          label="Hạn thanh toán"
          name="due_date"
          rules={[{ required: true, message: 'Vui lòng chọn hạn thanh toán' }]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Cập nhật hóa đơn
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditInvoice;