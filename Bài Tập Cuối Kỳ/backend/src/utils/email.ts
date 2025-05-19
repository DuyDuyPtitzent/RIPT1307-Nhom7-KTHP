import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465, // Use SSL for port 465, TLS for 587
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
  // Bỏ qua kiểm tra chứng chỉ trong môi trường dev
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Lỗi SMTP:', error);
  } else {
    console.log('SMTP sẵn sàng');
  }
});

export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  const mailOptions = {
    from: `"Quản lý Dân cư" <${config.SMTP_USER}>`,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error; // Ném lỗi để controller xử lý
  }
};