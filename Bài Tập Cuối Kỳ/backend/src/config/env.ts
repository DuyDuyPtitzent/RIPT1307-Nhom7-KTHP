import dotenv from 'dotenv';

dotenv.config();

export const config = {
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'duan',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER || 'Duydvdhtb172005@gmail.com',
  SMTP_PASS: process.env.SMTP_PASS || 'mnuq eoqd fqll zewp',
};