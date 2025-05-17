import React from 'react';
import { Layout } from 'antd';
import { useSelector, history } from 'umi';
import Header from './Header';
import Footer from './Footer';
import styles from './AppLayout.less';

const { Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const auth = useSelector((state: any) => state.auth);

  if (!auth.isAuthenticated) {
    history.push('/auth/login');
    return null;
  }

  return (
    <Layout className={styles.layout}>
      <Header />
      <Content className={styles.content}>
        <div className={styles.contentInner}>{children}</div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default AppLayout;
