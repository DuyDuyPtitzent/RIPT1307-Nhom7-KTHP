import { history } from 'umi';
import { useEffect } from 'react';

const Index: React.FC = () => {
  useEffect(() => {
    history.push('/auth/login');
  }, []);

  return null;
};

export default Index;