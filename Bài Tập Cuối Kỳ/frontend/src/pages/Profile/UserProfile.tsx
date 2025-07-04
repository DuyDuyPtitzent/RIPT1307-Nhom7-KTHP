import React, { useEffect } from 'react';
import { User, Camera, Lock, Calendar, Settings, Users, XCircle } from 'lucide-react';
import { message, Layout, Spin, Card, Avatar, Tabs, Form, Input, Select, Button, Table, Tag, Switch } from 'antd';
import { Account } from '@/services/types/user';
import { ROLES, config } from '../../utils/constants';
import { useProfileModel } from '@/models/profile';

const { Content } = Layout;
const { TabPane } = Tabs;

const AccountPage: React.FC = () => {
  // Dùng model
  const {
    userData, setUserData,
    allAccounts, setAllAccounts,
    loading, setLoading,
    activeTab, setActiveTab,
    passwordFormAnt,
    extendFormAnt,
    avatarPreview,
    avatarInputRef,
    avatarKey,
    userRole, setUserRole,
    handleAvatarChange,
    handlePasswordChange,
    handleExtendRental,// Hàm gia hạn thời gian ở trọ
    handleToggleExtensionPermission,// Hàm bật/tắt quyền gia hạn
    monthsSelected, setMonthsSelected, 
  } = useProfileModel();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy thông tin user từ token
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          setUserRole(decoded.role);
        }

        // Lấy profile
        const profileResponse = await import('@/services/user').then(s => s.getProfile());
        setUserData(profileResponse);

        // Cập nhật giá trị form mật khẩu và gia hạn về trạng thái ban đầu
        passwordFormAnt.setFieldsValue({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        extendFormAnt.setFieldsValue({ 
          months: 1,
        });

        // Lấy danh sách tài khoản nếu là admin
        if (userRole === ROLES.ADMIN) {
          const accountsResponse = await import('@/services/user').then(s => s.getAllAccounts());
          setAllAccounts(accountsResponse); 
        }
      } catch (error) {
        message.error('Lỗi khi tải dữ liệu tài khoản');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  
  }, [userRole]);

  // Cấu hình các cột cho bảng quản lý tài khoản (chỉ admin thấy)
  const accountManagementColumns = [
    {
      title: 'Người dùng',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: Account) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar style={{ backgroundColor: '#87d068', marginRight: 8 }}>{text.substring(0, 1)}</Avatar>
          <div>
            <div>{text}</div>
            <div style={{ fontSize: '0.8em', color: '#888' }}>{record.email}</div> 
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: 'user' | 'admin') => ( 
        <Tag color={role === ROLES.ADMIN ? 'geekblue' : 'green'}>{role === ROLES.ADMIN ? 'Quản trị viên' : 'Khách hàng'}</Tag> 
      ),
    },
    {
      title: 'Thời gian ở trọ',
      dataIndex: 'rentalInfo',
      key: 'rentalInfo',
      render: (rentalInfo: Account['rentalInfo']) =>
        rentalInfo ? (
          <Tag color={rentalInfo.isExpired ? 'red' : rentalInfo.remainingDays <= 30 ? 'orange' : 'blue'}>
            {rentalInfo.isExpired 
              ? `Hết hạn ${Math.abs(rentalInfo.remainingDays)} ngày` 
              : `Còn ${rentalInfo.remainingDays} ngày`}
          </Tag>
        ) : (
          <Tag>Chưa có</Tag>
        ),
    },
    {
      title: 'Quyền gia hạn',
      dataIndex: 'extensionEnabled',
      key: 'extensionEnabled',
      render: (enabled: boolean, record: Account) =>
        record.role === 'user' ? (  // Chỉ hiển thị cho người dùng
          <Tag color={enabled ? 'success' : 'error'}> 
            {enabled ? 'Được phép' : 'Không được phép'}
          </Tag>
        ) : null, 
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (text: string, record: Account) =>
        record.role === 'user' ? ( 
          <Switch
            checkedChildren="Tắt gia hạn"
            unCheckedChildren="Bật gia hạn"
            checked={record.extensionEnabled} 
            onChange={(checked) => handleToggleExtensionPermission(record.id, checked)} 
          />
        ) : null,
    },
  ];

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" tip="Đang tải..." />
      </Layout>
    );
  }

  return (
    <Layout style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Content>
        {/* Header */}
        <Card style={{ marginBottom: 24, borderRadius: 8, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'relative', marginRight: 16 }}>
                <Avatar
                  size={64}
                  src={userData?.avatar ? `${config.API_URL}/${userData.avatar}` : undefined} 
                  icon={!userData?.avatar ? <User /> : undefined}
                  style={{ backgroundColor: userData?.avatar ? '' : '#87d068' }}
                >
                  {!userData?.avatar && (userData?.fullName?.substring(0, 1) || 'U')} 
                </Avatar>
                {avatarPreview && (
                  <Spin
                    size="small"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(255,255,255,0.7)',
                      borderRadius: '50%',
                      padding: 4,
                    }}
                  />
                )}
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.8em' }}>{userData?.fullName}</h1>
                <p style={{ color: '#888', margin: '4px 0' }}>{userData?.email}</p>
                <Tag color={userData?.role === ROLES.ADMIN ? 'geekblue' : 'green'}> 
                  {userData?.role === ROLES.ADMIN ? 'Quản trị viên' : 'Khách hàng'}
                </Tag>
              </div>
            </div>
            <div style={{ color: '#888' }}>
              <p>Tham gia từ: {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p> 
            </div>
          </div>
        </Card>

        {/* Điều hướng  */}
        <Card style={{ marginBottom: 24, borderRadius: 8, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as 'profile' | 'rental' | 'management')}>
            <TabPane
              tab={
                <span>
                  <User size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                  Thông tin cá nhân
                </span>
              }
              key="profile"
            />
            {userData?.role === ROLES.USER && (
              <TabPane
                tab={
                  <span>
                    <Calendar size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                    Thời gian ở trọ
                  </span>
                }
                key="rental" 
              />
            )}
            {userData?.role === ROLES.ADMIN && (
              <TabPane
                tab={
                  <span>
                    <Users size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                    Quản lý tài khoản
                  </span>
                }
                key="management" 
              />
            )}
          </Tabs>
        </Card>

        {/* Nội dung các tab */}
        <div>
          {activeTab === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {/* Cập nhật ảnh đại diện */}
              <Card title={<><Camera size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Ảnh đại diện</>} bordered={false} style={{ borderRadius: 8, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar
                    key={avatarKey}
                    size={128}
                    src={avatarPreview || (userData?.avatar ? `${config.API_URL}/${userData.avatar}` : undefined)}
                    icon={!avatarPreview && !userData?.avatar ? <User size={64} /> : undefined}
                    style={{ marginBottom: 16, backgroundColor: avatarPreview || userData?.avatar ? '' : '#87d068' }}
                  >
                    {(!avatarPreview && !userData?.avatar) && (userData?.fullName?.substring(0, 1) || 'U')}
                  </Avatar>
                  <Button type="primary" icon={<Camera size={16} />} onClick={() => avatarInputRef.current?.click()}>
                    Chọn ảnh mới
                  </Button>
                  <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                  <p style={{ marginTop: 8, color: '#888' }}>Chấp nhận: JPG, PNG. Tối đa 5MB</p>
                </div>
              </Card>

              {/* Đổi mật khẩu - Chỉ dành cho người dùng */}
              {userData?.role === ROLES.USER && (
                <Card title={<><Lock size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Đổi mật khẩu</>} bordered={false} style={{ borderRadius: 8, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                  <Form
                    form={passwordFormAnt} 
                    layout="vertical"
                    onFinish={handlePasswordChange} 
                  >
                    <Form.Item
                      label="Mật khẩu hiện tại"
                      name="currentPassword"
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item
                      label="Mật khẩu mới"
                      name="newPassword"
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }, { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item
                      label="Xác nhận mật khẩu mới"
                      name="confirmPassword"
                      dependencies={['newPassword']} 
                      rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                        ({ getFieldValue }) => ({ 
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Đổi mật khẩu
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              )}

              {/* Thông tin tài khoản */}
              <Card title={<><Settings size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Thông tin tài khoản</>} bordered={false} style={{ borderRadius: 8, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <p><strong>ID tài khoản:</strong> #{userData?.id}</p>
                <p><strong>Họ tên:</strong> {userData?.fullName}</p>
                <p><strong>Email:</strong> {userData?.email}</p>
                <p>
                  <strong>Vai trò:</strong>{' '}
                  <Tag color={userData?.role === ROLES.ADMIN ? 'geekblue' : 'green'}> 
                    {userData?.role === ROLES.ADMIN ? 'Quản trị viên' : 'Khách hàng'}
                  </Tag>
                </p>
                {userData?.role === ROLES.USER && (
                  <p>
                    <strong>Quyền gia hạn:</strong>{' '}
                    <Tag color={userData?.extensionEnabled ? 'success' : 'error'}>
                      {userData?.extensionEnabled ? 'Được phép' : 'Không được phép'}
                    </Tag>
                  </p>
                )}
              </Card>
            </div>
          )}

          {/* Quản lý thời gian ở trọ - Chỉ dành cho người dùng */}
          {activeTab === 'rental' && userData?.role === ROLES.USER && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {/* Thông tin thời gian ở trọ hiện tại */}
              <Card title={<><Calendar size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Thời gian ở trọ hiện tại</>} bordered={false} style={{ borderRadius: 8, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                {userData?.rentalInfo ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
                      <Card size="small" style={{ textAlign: 'center', flex: 1, margin: '0 8px', borderColor: '#d9d9d9' }}>
                        <p style={{ margin: 0, fontSize: '0.9em', color: '#888' }}>Ngày bắt đầu</p>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>
                          {new Date(userData.rentalInfo.startDate).toLocaleDateString('vi-VN')} 
                        </p>
                      </Card>
                      <Card size="small" style={{ textAlign: 'center', flex: 1, margin: '0 8px', borderColor: '#d9d9d9' }}>
                        <p style={{ margin: 0, fontSize: '0.9em', color: '#888' }}>Ngày kết thúc</p>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>
                          {new Date(userData.rentalInfo.endDate).toLocaleDateString('vi-VN')}
                        </p>
                      </Card>
                    </div>
                    <p><strong>Thời gian thuê:</strong> {userData.rentalInfo.durationMonths} tháng</p>
                    <p>
                      <strong>Trạng thái:</strong>{' '}
                      <Tag color={userData.rentalInfo.isExpired ? 'red' : userData.rentalInfo.remainingDays <= 30 ? 'orange' : 'blue'}>
                        {userData.rentalInfo.isExpired
                          ? `Đã hết hạn ${Math.abs(userData.rentalInfo.remainingDays)} ngày`
                          : `Còn lại ${userData.rentalInfo.remainingDays} ngày`}
                      </Tag>
                    </p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#888' }}>
                    <Calendar size={48} style={{ marginBottom: 16 }} />
                    <p>Chưa có thông tin thời gian ở trọ</p>
                  </div>
                )}
              </Card>

              {/* Gia hạn thời gian ở trọ */}
              <Card title={<><Calendar size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Gia hạn thời gian ở trọ</>} bordered={false} style={{ borderRadius: 8, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                {userData?.extensionEnabled ? ( 
                  <Form
                    form={extendFormAnt}
                    layout="vertical"
                    onFinish={handleExtendRental}
                    initialValues={{ months: 1 }}
                  >
                    <Form.Item
                      label="Số tháng muốn gia hạn"
                      name="months"
                      rules={[{ required: true, message: 'Vui lòng chọn số tháng muốn gia hạn!' }]}
                    >
                      <Select
                        value={monthsSelected}
                        onChange={(value) => {
                          extendFormAnt.setFieldsValue({ months: value });
                          setMonthsSelected(value); 
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                          <Select.Option key={month} value={month}>
                            {month} tháng
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Card size="small" title="Thông tin gia hạn:" style={{ marginBottom: 16, borderColor: '#d9d9d9' }}>
                      <p style={{ margin: 0 }}>
                        • Thời gian hiện tại: {userData?.rentalInfo?.durationMonths || 0} tháng
                      </p>
                      <p style={{ margin: 0 }}>
                        • Sau khi gia hạn: {(userData?.rentalInfo?.durationMonths || 0) + (monthsSelected || 0)} tháng
                      </p>
                    </Card>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Gia hạn {monthsSelected || 1} tháng
                      </Button>
                    </Form.Item>
                  </Form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#888' }}>
                    <XCircle size={48} style={{ marginBottom: 16, color: '#ff4d4f' }} />
                    <h3 style={{ color: '#ff4d4f' }}>Chưa được cấp quyền gia hạn</h3>
                    <p>Vui lòng liên hệ quản trị viên để được cấp quyền gia hạn thời gian ở trọ.</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Quản lý tài khoản - Chỉ dành cho admin */}
          {activeTab === 'management' && userData?.role === ROLES.ADMIN && (
            <Card title={<><Users size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Quản lý tài khoản người dùng</>} bordered={false} style={{ borderRadius: 8, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <Table
                dataSource={allAccounts}
                columns={accountManagementColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
              />
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default AccountPage;