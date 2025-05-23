import { useEffect } from 'react';
import { history } from 'umi';

const Logout = () => {
  useEffect(() => {
    localStorage.removeItem('token'); // hoặc token/session bạn dùng
    history.replace('/auth/login'); // quay về login
  }, []);

  return <div>Đang đăng xuất...</div>;
};

export default Logout;
