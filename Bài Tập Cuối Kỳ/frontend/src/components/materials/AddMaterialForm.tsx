// components/materials/AddMaterialForm.tsx
import React from 'react';
import { Form, Input, Button, message, InputNumber } from 'antd';
import { createMaterial } from '../../services/materials';

interface AddMaterialFormProps {
  onSuccess: () => void;
}

const AddMaterialForm: React.FC<AddMaterialFormProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      await createMaterial({
        name: values.name,
        quantity: values.quantity,
        lowStockThreshold: values.lowStockThreshold,
      });
      message.success('Thêm vật tư thành công');
      form.resetFields(); // Xóa dữ liệu form sau khi thêm
      onSuccess(); // callback để cha xử lý
    } catch (error: any) {
      message.error(error.message || 'Thêm vật tư thất bại');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Tên vật tư"
        name="name"
        rules={[{ required: true, message: 'Vui lòng nhập tên vật tư' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Số lượng tồn kho"
        name="quantity"
        rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        label="Ngưỡng tồn kho thấp"
        name="lowStockThreshold"
        rules={[{ required: true, message: 'Vui lòng nhập ngưỡng tồn kho' }]}
      >
        <InputNumber min={1} style={{ width: '100%' }}  />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Thêm vật tư
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddMaterialForm;
