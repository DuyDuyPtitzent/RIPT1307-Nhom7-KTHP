// import { Request, Response } from 'express';
// import { pool } from '../config/database';
// import { sendEmail } from '../utils/email';

// export const notifyInvoiceCreated = async (req: Request, res: Response) => {
//   const { resident_id, billing_period, amount, due_date, apartment_number } = req.body;
//   try {
//     const [residents] = await pool.query('SELECT email, full_name, apartment_number FROM residents WHERE id = ?', [resident_id]);
//     if ((residents as any[]).length === 0) {
//       return res.status(404).json({ message: 'Không tìm thấy cư dân' });
//     }

//     const resident = (residents as any[])[0];
//     const dueDate = new Date(due_date);
//     const isOverdue = dueDate < new Date();
//     await sendEmail(
//       resident.email,
//       isOverdue ? 'Cảnh báo hóa đơn quá hạn' : 'Thông báo hóa đơn mới',
//       isOverdue
//         ? `Kính gửi ${resident.full_name},\n\nHóa đơn mới cho căn hộ ${apartment_number} đã quá hạn.\nKỳ thu: ${billing_period}\nSố tiền: ${amount.toLocaleString('vi-VN')} VND\nHạn thanh toán: ${dueDate.toLocaleDateString('vi-VN')}\nVui lòng thanh toán ngay lập tức.\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
//         : `Kính gửi ${resident.full_name},\n\nHóa đơn mới đã được tạo cho căn hộ ${apartment_number}.\nKỳ thu: ${billing_period}\nSố tiền: ${amount.toLocaleString('vi-VN')} VND\nHạn thanh toán: ${dueDate.toLocaleDateString('vi-VN')}\nVui lòng thanh toán đúng hạn.\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
//     );
//     console.log(`Sending email to ${resident.email} for /invoice-created`);
//     res.json({ message: 'Gửi thông báo hóa đơn mới thành công' });
//   } catch (error) {
//     console.error('Lỗi trong notifyInvoiceCreated:', error);
//     res.status(500).json({ message: 'Lỗi máy chủ khi gửi thông báo' });
//   }
// };

// export const notifyInvoiceOverdue = async (req: Request, res: Response) => {
//   const { resident_id, billing_period, amount, due_date, apartment_number } = req.body;
//   try {
//     const [residents] = await pool.query('SELECT email, full_name, apartment_number FROM residents WHERE id = ?', [resident_id]);
//     if ((residents as any[]).length === 0) {
//       return res.status(404).json({ message: 'Không tìm thấy cư dân' });
//     }

//     const resident = (residents as any[])[0];
//     const dueDate = new Date(due_date);
//     await sendEmail(
//       resident.email,
//       'Cảnh báo hóa đơn quá hạn',
//       `Kính gửi ${resident.full_name},\n\nHóa đơn cho căn hộ ${apartment_number} đã quá hạn.\nKỳ thu: ${billing_period}\nSố tiền: ${amount.toLocaleString('vi-VN')} VND\nHạn thanh toán: ${dueDate.toLocaleDateString('vi-VN')}\nVui lòng thanh toán ngay lập tức.\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
//     );
//     console.log(`Sending email to ${resident.email} for /invoice-overdue`);

//     const [admins] = await pool.query('SELECT email, username FROM users WHERE role = ?', ['admin']);
//     for (const admin of admins as any[]) {
//       try {
//         await sendEmail(
//           admin.email,
//           'Thông báo hóa đơn quá hạn',
//           `Kính gửi ${admin.username || 'Quản trị viên'},\n\nHóa đơn của cư dân ${resident.full_name} (căn hộ ${apartment_number}, kỳ thu ${billing_period}) với số tiền ${amount.toLocaleString('vi-VN')} VND đã quá hạn thanh toán.\n\nTrân trọng,\nHệ thống Quản lý Dân cư`
//         );
//         console.log(`Sending email to ${admin.email} for /invoice-overdue`);
//       } catch (adminError) {
//         console.error(`Lỗi gửi email cho admin ${admin.email}:`, adminError);
//       }
//     }

//     res.json({ message: 'Gửi thông báo hóa đơn quá hạn thành công' });
//   } catch (error) {
//     console.error('Lỗi trong notifyInvoiceOverdue:', error);
//     res.status(500).json({ message: 'Lỗi máy chủ khi gửi thông báo' });
//   }
// };

// export const notifyPaymentConfirmed = async (req: Request, res: Response) => {
//   const { resident_id, billing_period, amount, apartment_number } = req.body;
//   try {
//     const [residents] = await pool.query('SELECT email, full_name, apartment_number FROM residents WHERE id = ?', [resident_id]);
//     if ((residents as any[]).length === 0) {
//       return res.status(404).json({ message: 'Không tìm thấy cư dân' });
//     }

//     const resident = (residents as any[])[0];
//     await sendEmail(
//       resident.email,
//       'Xác nhận thanh toán',
//       `Kính gửi ${resident.full_name},\n\nHóa đơn cho căn hộ ${apartment_number}, kỳ thu ${billing_period} với số tiền ${amount.toLocaleString('vi-VN')} VND đã được thanh toán thành công.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
//     );
//     console.log(`Sending email to ${resident.email} for /payment-confirmed`);
//     res.json({ message: 'Gửi thông báo xác nhận thanh toán thành công' });
//   } catch (error) {
//     console.error('Lỗi trong notifyPaymentConfirmed:', error);
//     res.status(500).json({ message: 'Lỗi máy chủ khi gửi thông báo' });
//   }
// };

// export const notifyVehicleCreated = async (req: Request, res: Response) => {
//   const { resident_id, type, license_plate, owner_name, apartment_number } = req.body;
//   try {
//     const [residents] = await pool.query('SELECT email, full_name FROM residents WHERE id = ?', [resident_id]);
//     if ((residents as any[]).length === 0) {
//       return res.status(404).json({ message: 'Không tìm thấy cư dân' });
//     }

//     const resident = (residents as any[])[0];
//     await sendEmail(
//       resident.email,
//       'Xác nhận đăng ký phương tiện',
//       `Kính gửi ${resident.full_name},\n\nYêu cầu đăng ký phương tiện của bạn (loại: ${type}, biển số: ${license_plate}) cho căn hộ ${apartment_number} đã được gửi. Vui lòng chờ quản lý duyệt.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
//     );
//     console.log(`Sending email to ${resident.email} for /vehicle-created`);

//     const [admins] = await pool.query('SELECT email, username FROM users WHERE role = ?', ['admin']);
//     for (const admin of admins as any[]) {
//       try {
//         await sendEmail(
//           admin.email,
//           'Thông báo đăng ký phương tiện mới',
//           `Kính gửi ${admin.username || 'Quản trị viên'},\n\nCư dân ${resident.full_name} (căn hộ ${apartment_number}) đã đăng ký phương tiện mới (loại: ${type}, biển số: ${license_plate}). Vui lòng kiểm tra và duyệt.\n\nTrân trọng,\nHệ thống Quản lý Dân cư`
//         );
//         console.log(`Sending email to ${admin.email} for /vehicle-created`);
//       } catch (adminError) {
//         console.error(`Lỗi gửi email cho admin ${admin.email}:`, adminError);
//       }
//     }

//     res.json({ message: 'Gửi thông báo đăng ký phương tiện thành công' });
//   } catch (error) {
//     console.error('Lỗi trong notifyVehicleCreated:', error);
//     res.status(500).json({ message: 'Lỗi máy chủ khi gửi thông báo' });
//   }
// };

// export const notifyVehicleStatusUpdated = async (req: Request, res: Response) => {
//   const { resident_id, vehicle_id, status, apartment_number } = req.body;
//   try {
//     const [residents] = await pool.query('SELECT email, full_name FROM residents WHERE id = ?', [resident_id]);
//     if ((residents as any[]).length === 0) {
//       return res.status(404).json({ message: 'Không tìm thấy cư dân' });
//     }

//     const resident = (residents as any[])[0];
//     const statusText = status === 'approved' ? 'được duyệt' : 'bị từ chối';
//     await sendEmail(
//       resident.email,
//       `Thông báo trạng thái phương tiện`,
//       `Kính gửi ${resident.full_name},\n\nYêu cầu đăng ký phương tiện (ID: ${vehicle_id}) cho căn hộ ${apartment_number} đã ${statusText}.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
//     );
//     console.log(`Sending email to ${resident.email} for /vehicle-status-updated`);
//     res.json({ message: 'Gửi thông báo cập nhật trạng thái phương tiện thành công' });
//   } catch (error) {
//     console.error('Lỗi trong notifyVehicleStatusUpdated:', error);
//     res.status(500).json({ message: 'Lỗi máy chủ khi gửi thông báo' });
//   }
// };