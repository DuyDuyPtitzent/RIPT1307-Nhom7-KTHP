// import { Request, Response } from 'express';
//   import { pool } from '../config/database';

//   export const getStats = async (req: Request, res: Response) => {
//     try {
//       const [stats] = await pool.query('SELECT * FROM stats_cache');
//       res.json(stats);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Lỗi máy chủ' });
//     }
//   };

//   export const createStats = async (req: Request, res: Response) => {
//     const { type, data } = req.body;
//     if (!type || !data) {
//       return res.status(400).json({ message: 'Thiếu thông tin' });
//     }
//     try {
//       await pool.query(
//         'INSERT INTO stats_cache (type, data, created_at) VALUES (?, ?, NOW())',
//         [type, JSON.stringify(data)]
//       );
//       res.status(201).json({ message: 'Thêm thống kê thành công' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Lỗi máy chủ' });
//     }
//   };