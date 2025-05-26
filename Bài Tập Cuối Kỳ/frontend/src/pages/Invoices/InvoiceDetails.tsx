// import React from 'react';
// import { Modal, Descriptions, Button } from 'antd';

// interface Invoice {
//   id: number;
//   resident_name: string;
//   apartment_number: string;
//   billing_period: string;
//   amount: number;
//   status: string;
//   due_date: string;
//   created_at: string;
//   updated_at?: string;
// }

// interface InvoiceDetailsModalProps {
//   invoice: Invoice | null;
//   onClose: () => void;
// }

// const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ invoice, onClose }) => {
//   return (
//     <Modal
//       title="Chi tiết hóa đơn"
//       open={!!invoice}
//       onCancel={onClose}
//       footer={[
//         <Button key="back" onClick={onClose}>
//           Quay lại
//         </Button>,
//       ]}
//     >
//       {invoice && (
//         <Descriptions bordered>
//           <Descriptions.Item label="ID">{invoice.id}</Descriptions.Item>
//           <Descriptions.Item label="Cư dân">{invoice.resident_name}</Descriptions.Item>
//           <Descriptions.Item label="Căn hộ">{invoice.apartment_number}</Descriptions.Item>
//           <Descriptions.Item label="Kỳ thu">{invoice.billing_period}</Descriptions.Item>
//           <Descriptions.Item label="Số tiền">{invoice.amount.toLocaleString()} VND</Descriptions.Item>
//           <Descriptions.Item label="Trạng thái">{invoice.status}</Descriptions.Item>
//           <Descriptions.Item label="Hạn thanh toán">{new Date(invoice.due_date).toLocaleDateString()}</Descriptions.Item>
//           <Descriptions.Item label="Ngày tạo">{new Date(invoice.created_at).toLocaleString()}</Descriptions.Item>
//           <Descriptions.Item label="Ngày cập nhật">{invoice.updated_at ? new Date(invoice.updated_at).toLocaleString() : 'N/A'}</Descriptions.Item>
//         </Descriptions>
//       )}
//     </Modal>
//   );
// };

// export default InvoiceDetailsModal;