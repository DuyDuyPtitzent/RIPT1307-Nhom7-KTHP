import dotenv from 'dotenv';

dotenv.config();

export const config = {
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'duan',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.ethereal.email',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || 'your_ethereal_email',
  SMTP_PASS: process.env.SMTP_PASS || 'your_ethereal_password',
  PORT: parseInt(process.env.PORT || '5000', 10),
};