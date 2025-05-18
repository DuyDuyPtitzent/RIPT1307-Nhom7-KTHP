import React, { useState, useEffect } from 'react';
import { Table, Button, Input, message, Row, Col } from 'antd';
import { useHistory } from 'umi';
import { getResidents, deleteResident } from '../../services/residents';
import TableActions from '../../components/TableActions';
import { getCurrentUser } from '../../services/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Residents: React.FC = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [apartment, setApartment] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const fetchUserAndResidents = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        setIsAdmin(user.role === 'admin');

        const residentsData = await getResidents({ search, apartment });
        setResidents(residentsData || []);
      } catch (error: any) {
        message.error(error.message || 'Không thể tải danh sách cư dân');
        setResidents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndResidents();
  }, [search, apartment]);

  const handleDelete = async (id: number) => {
    try {
      await deleteResident(id);
      message.success('Xóa cư dân thành công');
      setResidents(residents.filter((r: any) => r.id !== id));
    } catch (error: any) {
      message.error(error.message || 'Xóa cư dân thất bại');
    }
  };

  const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Họ tên',
    dataIndex: 'full_name',   // sửa thành snake_case
    key: 'full_name',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'phone_number',  // sửa thành snake_case
    key: 'phone_number',
  },
  {
    title: 'Số căn hộ',
    dataIndex: 'apartment_number', // sửa thành snake_case
    key: 'apartment_number',
  },
  {
    title: 'Thao tác',
    key: 'action',
    render: (_: any, record: any) => (
      <TableActions
        onView={() => history.push(`/dashboard/residents/details/${record.id}`)}
        onEdit={() => history.push(`/dashboard/residents/edit/${record.id}`)}
        onDelete={() => handleDelete(record.id)}
        isAdmin={isAdmin}
      />
    ),
  },
];


  return (
    <>
      <Header />
      <div style={{ padding: '24px', minHeight: 'calc(100vh - 128px)' }}>
        <h2>Quản lý dân cư</h2>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder="Tìm theo tên, email, số điện thoại"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col span={8}>
            <Input
              placeholder="Tìm theo số căn hộ"
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
            />
          </Col>
          {isAdmin && (
            <Col span={8}>
              <Button
                type="primary"
                onClick={() => history.push('/dashboard/residents/add')}
              >
                Thêm cư dân
              </Button>
            </Col>
          )}
        </Row>
        <Table
          columns={columns}
          dataSource={residents}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
     
    </>
  );
};

export default Residents;
