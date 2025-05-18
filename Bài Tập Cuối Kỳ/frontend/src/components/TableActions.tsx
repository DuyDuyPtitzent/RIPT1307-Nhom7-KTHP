import React from 'react';
import { Button, Popconfirm } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface TableActionsProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}

const TableActions: React.FC<TableActionsProps> = ({ onView, onEdit, onDelete, isAdmin }) => {
  return (
    <div>
      <Button icon={<EyeOutlined />} onClick={onView} style={{ marginRight: 8 }}>
        Xem
      </Button>
      {isAdmin && (
        <>
          <Button icon={<EditOutlined />} onClick={onEdit} style={{ marginRight: 8 }}>
            Sửa
          </Button>
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={onDelete}>
            <Button icon={<DeleteOutlined />} danger>
              Xóa
            </Button>
          </Popconfirm>
        </>
      )}
    </div>
  );
};

export default TableActions;