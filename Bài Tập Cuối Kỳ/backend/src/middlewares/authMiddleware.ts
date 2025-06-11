import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string; resident_id?: number };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => { 
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Yêu cầu access token' });
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => { 
  if (err) {
    return res.status(403).json({ message: 'Token không hợp lệ' });
  }

  // Đảm bảo gán đủ resident_id nếu có
  req.user = user as { id: number; email: string; role: string; resident_id?: number };
  next();
});

};

// Thêm mới: Kiểm tra role admin
export const restrictToAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin được phép truy cập' });
  }
  next();
};