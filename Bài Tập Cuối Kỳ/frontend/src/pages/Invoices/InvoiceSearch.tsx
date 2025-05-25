// import React from 'react';
// import { Input, Select, Row, Col } from 'antd';

// const { Option } = Select;

// interface InvoiceSearchProps {
//   search: string;
//   period: string;
//   status: string;
//   onSearchChange: (value: string) => void;
//   onPeriodChange: (value: string) => void;
//   onStatusChange: (value: string) => void;
// }

// const InvoiceSearch: React.FC<InvoiceSearchProps> = ({
//   search,
//   period,
//   status,
//   onSearchChange,
//   onPeriodChange,
//   onStatusChange,
// }) => {
//   return (
//     <Row gutter={16}>
//       <Col span={8}>
//         <Input
//           placeholder="Tìm theo tên cư dân hoặc căn hộ"
//           value={search}
//           onChange={(e) => onSearchChange(e.target.value)}
//         />
//       </Col>
//       <Col span={8}>
//         <Input
//           placeholder="Kỳ thu (YYYY-MM)"
//           value={period}
//           onChange={(e) => onPeriodChange(e.target.value)}
//         />
//       </Col>
//       <Col span={8}>
//         <Select
//           style={{ width: '100%' }}
//           placeholder="Trạng thái"
//           value={status}
//           onChange={onStatusChange}
//           allowClear
//         >
//           <Option value="PAID">Đã thanh toán</Option>
//           <Option value="UNPAID">Chưa thanh toán</Option>
//           <Option value="OVERDUE">Quá hạn</Option>
//         </Select>
//       </Col>
//     </Row>
//   );
// };

// export default InvoiceSearch;