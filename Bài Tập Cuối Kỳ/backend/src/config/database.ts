import { createPool, Pool } from 'mysql2/promise';
import { config } from './env';

export const pool: Pool = createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
pool.getConnection().then(conn => {
  console.log('Kết nối MySQL thành công');
  conn.release();
}).catch(err => {
  console.error('Lỗi kết nối MySQL:', err);
});