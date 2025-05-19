import React, { useState, useEffect } from 'react';
import { Table, Button, Input, message, Row, Col, Tag } from 'antd';
import { useHistory } from 'umi';
import { getMaterials, deleteMaterial } from '../../services/materials';
import TableActions from '../../components/TableActions';

import { getCurrentUser } from '../../services/auth';

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [manager, setManager] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const fetchUserAndMaterials = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        if (user.role !== 'admin') {
          message.error('Bạn không có quyền truy cập');
          history.push('/dashboard/residents');
          return;
        }
        setIsAdmin(true);

        const materialsData = await getMaterials({ search, manager });
        setMaterials(materialsData || []);
      } catch (error: any) {
        message.error(error.message || 'Không thể tải danh sách vật tư');
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndMaterials();
  }, [search, manager, history]);

  const handleDelete = async (id: number) => {
    try {
      await deleteMaterial(id);
      message.success('Xóa vật tư thành công');
      setMaterials(materials.filter((m: any) => m.id !== id));
    } catch (error: any) {
      message.error(error.message || 'Xóa vật tư thất bại');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: any) => (
        <span>
          {quantity}{' '}
          {quantity <= record.lowStockThreshold && (
            <Tag color="red">Tồn kho thấp</Tag>
          )}
        </span>
      ),
    },
    {
      title: 'Người quản lý',
      dataIndex: 'managedBy',
      key: 'managedBy',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <TableActions
          onView={() => history.push(`/materials/details/${record.id}`)}
          onEdit={() => history.push(`/materials/edit/${record.id}`)}
          onDelete={() => handleDelete(record.id)}
          isAdmin={isAdmin}
        />
      ),
    },
  ];

  return (
    <div className="authContainer">
      <h2>Quản lý vật tư</h2>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Tìm theo tên vật tư"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col span={8}>
          <Input
            placeholder="Tìm theo người quản lý"
            value={manager}
            onChange={(e) => setManager(e.target.value)}
          />
        </Col>
        {isAdmin && (
          <Col span={8}>
            <Button type="primary" onClick={() => history.push('/materials/add')}>
              Thêm vật tư
            </Button>
          </Col>
        )}
      </Row>
      <Table
        columns={columns}
        dataSource={materials}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Materials;