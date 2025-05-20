import React, { useEffect } from 'react';
import { Form, Input, Button, message, InputNumber } from 'antd';
import { getMaterialById, updateMaterial } from '../../services/materials';

interface EditMaterialFormProps {
  materialId: number;
  onSuccess: () => void;
}

const EditMaterialForm: React.FC<EditMaterialFormProps> = ({ materialId, onSuccess }) => {
  const [form] = Form.useForm();

  useEffect(() => {
  const fetchMaterial = async () => {
    try {
      const material = await getMaterialById(materialId);
      // Chuyển đổi tên field từ API sang camelCase
      form.setFieldsValue({
        name: material.name,
        quantity: material.quantity,
        lowStockThreshold: material.low_stock_threshold, // ⚠️ đổi tên key cho đúng
      });
    } catch (error: any) {
      message.error(error.message || 'Không thể tải thông tin vật tư');
    }
  };
  fetchMaterial();
}, [materialId, form]);


  const onFinish = async (values: any) => {
    try {
      await updateMaterial(materialId, {
        name: values.name,
        quantity: values.quantity,
        lowStockThreshold: values.lowStockThreshold,
      });
      message.success('Cập nhật vật tư thành công');
      onSuccess(); // Gọi hàm callback sau khi cập nhật thành công
    } catch (error: any) {
      message.error(error.message || 'Cập nhật vật tư thất bại');
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
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Cập nhật vật tư
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditMaterialForm;
