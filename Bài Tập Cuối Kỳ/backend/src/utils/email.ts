import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
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
    from: '"Quản lý Dân cư" <Duydvdhtb172005@gmail.com>',
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};