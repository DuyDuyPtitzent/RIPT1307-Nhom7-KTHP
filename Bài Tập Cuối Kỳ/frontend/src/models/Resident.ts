import { useState } from 'react';
import { message } from 'antd';
import { getResidents, deleteResident } from '@/services/residents';
import { getCurrentUser } from '@/services/auth';

export const useResidentsModel = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [apartment, setApartment] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editResidentId, setEditResidentId] = useState<number | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);

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

  const handleDelete = async (id: number) => {
    try {
      await deleteResident(id);
      message.success('Xóa cư dân thành công');
      setResidents((prev) => prev.filter((r: any) => r.id !== id));
    } catch (error: any) {
      message.error(error.message || 'Xóa cư dân thất bại');
    }
  };

  return {
    residents,
    loading,
    search,
    apartment,
    isAdmin,
    editResidentId,
    addModalVisible,

    setSearch,
    setApartment,
    setEditResidentId,
    setAddModalVisible,

    fetchUserAndResidents,
    handleDelete,
  };
};
