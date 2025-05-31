// import React, { useState, useEffect } from 'react';
// import { Table, Button, message, Tabs, Input } from 'antd';
// import { useHistory } from 'umi';
// import { getUsers, deleteUser } from '../../services/user';
// import { getInvoices } from '../../services/finance';
// import styles from '../../assets/styles/index.less';
// import TableActions from '../../components/TableActions';

// const { TabPane } = Tabs;
// const { Search } = Input;

// const UserManagement: React.FC = () => {
//   const [users, setUsers] = useState([]);
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedUser, setSelectedUser] = useState<any>(null);
//   const history = useHistory();

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const usersData = await getUsers();
//       setUsers(usersData || []);
//     } catch (error: any) {
//       message.error(error.message || 'Không thể tải danh sách người dùng');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchInvoices = async (residentId: number) => {
//     try {
//       const invoicesData = await getInvoices({ residentId });
//       setInvoices(invoicesData || []);
//     } catch (error: any) {
//       message.error(error.message || 'Không thể tải danh sách hóa đơn');
//     }
//   };

//   const handleDelete = async (id: number) => {
//     try {
//       await deleteUser(id);
//       message.success('Xóa người dùng thành công');
//       setUsers(users.filter((u: any) => u.id !== id));
//     } catch (error: any) {
//       message.error(error.message || 'Xóa người dùng thất bại');
//     }
//   };

//   const userColumns = [
//     { title: 'ID', dataIndex: 'id', key: 'id' },
//     { title: 'Tên', dataIndex: 'fullName', key: 'fullName' },
//     { title: 'Email', dataIndex: 'email', key: 'email' },
//     { title: 'Vai trò', dataIndex: 'role', key: 'role' },
//     {
//       title: 'Thao tác',
//       key: 'action',
//       render: (_: any, record: any) => (
//         <TableActions
//           onView={() => {
//             setSelectedUser(record);
//             if (record.resident_id) {
//               fetchInvoices(record.resident_id);
//             }
//           }}
//           onEdit={() => history.push(`/admin/users/edit/${record.id}`)}
//           onDelete={() => handleDelete(record.id)}
//         />
//       ),
//     },
//   ];

//   const invoiceColumns = [
//     { title: 'ID', dataIndex: 'id', key: 'id' },
//     { title: 'Kỳ thu', dataIndex: 'billing_period', key: 'billing_period' },
//     {
//       title: 'Số tiền',
//       dataIndex: 'amount',
//       key: 'amount',
//       render: (amount: number) => `${amount.toLocaleString()} VND`,
//     },
//     {
//       title: 'Trạng thái',
//       dataIndex: 'status',
//       key: 'status',
//       render: (status: string) => {
//         const color = status === 'PAID' ? 'green' : status === 'OVERDUE' ? 'red' : 'orange';
//         return <span style={{ color }}>{status}</span>;
//       },
//     },
//     {
//       title: 'Hạn thanh toán',
//       dataIndex: 'due_date',
//       key: 'due_date',
//       render: (date: string) => new Date(date).toLocaleDateString(),
//     },
//     {
//       title: 'Thao tác',
//       key: 'action',
//       render: (_: any, record: any) => (
//         <TableActions
//           onView={() => history.push(`/invoices/details/${record.id}`)}
//           onEdit={() => history.push(`/invoices/edit/${record.id}`)}
//         />
//       ),
//     },
//   ];

//   return (
//     <div className={styles.authContainer}>
//       <h2>Quản lý người dùng</h2>
//       <Search
//         placeholder="Tìm kiếm người dùng"
//         onSearch={(value) => fetchUsers()} // Cập nhật logic tìm kiếm nếu cần
//         style={{ marginBottom: 16 }}
//       />
//       <Table
//         columns={userColumns}
//         dataSource={users}
//         rowKey="id"
//         loading={loading}
//         pagination={{ pageSize: 10 }}
//       />
//       {selectedUser && (
//         <Tabs defaultActiveKey="1" style={{ marginTop: 16 }}>
//           <TabPane tab="Thông tin người dùng" key="1">
//             <p>Tên: {selectedUser.fullName}</p>
//             <p>Email: {selectedUser.email}</p>
//             <p>Vai trò: {selectedUser.role}</p>
//             <p>ID cư dân: {selectedUser.resident_id || 'N/A'}</p>
//           </TabPane>
//           {selectedUser.resident_id && (
//             <TabPane tab="Hóa đơn tài chính" key="2">
//               <Table
//                 columns={invoiceColumns}
//                 dataSource={invoices}
//                 rowKey="id"
//                 pagination={{ pageSize: 10 }}
//               />
//             </TabPane>
//           )}
//         </Tabs>
//       )}
//     </div>
//   );
// };

// export default UserManagement;