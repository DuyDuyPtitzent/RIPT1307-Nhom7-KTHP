// import React, { useState, useEffect } from 'react';
// import { Table, Button, Modal, Form, Input, message } from 'antd';
// import { updateUserPassword, getAllUsers } from '@/services/auth';
// import styles from '../assets/styles/index.less';

// const UserManagement: React.FC = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedUser, setSelectedUser] = useState<{ id: number; fullName: string } | null>(null);
//   const [form] = Form.useForm();

//   // Lấy danh sách người dùng khi trang được tải
//   useEffect(() => {
//     const fetchUsers = async () => {
//       setLoading(true);
//       try {
//         const response = await getAllUsers();
//         console.log('getAllUsers response:', response);
//         setUsers(response);
//       } catch (error: any) {
//         console.error('Lỗi khi lấy danh sách người dùng:', error);
//         message.error('Không thể tải danh sách người dùng');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUsers();
//   }, []);

//   // Mở modal đổi mật khẩu
//   const showChangePasswordModal = (user: { id: number; fullName: string }) => {
//     setSelectedUser(user);
//     setModalVisible(true);
//   };

//   // Xử lý submit form đổi mật khẩu
//   const handleChangePassword = async (values: any) => {
//     if (!selectedUser) return;

//     setLoading(true);
//     try {
//       await updateUserPassword(selectedUser.id, { newPassword: values.newPassword });
//       message.success(`Mật khẩu của ${selectedUser.fullName} đã được cập nhật`);
//       form.resetFields();
//       setModalVisible(false);
//       setSelectedUser(null);
//     } catch (error: any) {
//       console.error('Lỗi khi cập nhật mật khẩu:', error);
//       message.error(error.message || 'Cập nhật mật khẩu thất bại');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Cột của bảng người dùng
//   const columns = [
//     {
//       title: 'Họ tên',
//       dataIndex: 'fullName',
//       key: 'fullName',
//     },
//     {
//       title: 'Email',
//       dataIndex: 'email',
//       key: 'email',
//     },
//     {
//       title: 'Vai trò',
//       dataIndex: 'role',
//       key: 'role',
//       render: (role: string) => (role === 'admin' ? 'Quản trị viên' : 'Người dùng'),
//     },
//     {
//       title: 'Hành động',
//       key: 'action',
//       render: (_: any, record: { id: number; fullName: string }) => (
//         <Button type="primary" onClick={() => showChangePasswordModal(record)}>
//           Đổi mật khẩu
//         </Button>
//       ),
//     },
//   ];

//   return (
//     <div className={styles.authContainer}>
//       <h2>Quản lý người dùng</h2>
//       <Table
//         columns={columns}
//         dataSource={users}
//         rowKey="id"
//         loading={loading}
//         pagination={{ pageSize: 10 }}
//       />
//       <Modal
//         title={selectedUser ? `Đổi mật khẩu cho ${selectedUser.fullName}` : 'Đổi mật khẩu'}
//         visible={modalVisible}
//         onCancel={() => {
//           setModalVisible(false);
//           setSelectedUser(null);
//           form.resetFields();
//         }}
//         footer={null}
//       >
//         <Form form={form} layout="vertical" onFinish={handleChangePassword}>
//           <Form.Item
//             label="Mật khẩu mới"
//             name="newPassword"
//             rules={[
//               { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
//               { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
//             ]}
//           >
//             <Input.Password />
//           </Form.Item>
//           <Form.Item
//             label="Xác nhận mật khẩu"
//             name="confirmPassword"
//             dependencies={['newPassword']}
//             rules={[
//               { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
//               ({ getFieldValue }) => ({
//                 validator(_, value) {
//                   if (!value || getFieldValue('newPassword') === value) {
//                     return Promise.resolve();
//                   }
//                   return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
//                 },
//               }),
//             ]}
//           >
//             <Input.Password />
//           </Form.Item>
//           <Form.Item>
//             <Button type="primary" htmlType="submit" loading={loading} block>
//               Cập nhật mật khẩu
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default UserManagement;