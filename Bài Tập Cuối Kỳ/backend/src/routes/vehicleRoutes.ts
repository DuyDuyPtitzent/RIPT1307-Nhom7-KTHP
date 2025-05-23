import { Router } from 'express';
import { body } from 'express-validator';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  approveVehicle,
  rejectVehicle,
} from '../controllers/vehicleController';
import { authenticateToken, restrictToAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getVehicles);
router.get('/:id', authenticateToken, getVehicleById);
router.post(
  '/',
  authenticateToken,
  [
    body('type').isIn(['car', 'motorcycle', 'bicycle', 'other']).withMessage('Loại phương tiện không hợp lệ'),
    body('license_plate').notEmpty().withMessage('Biển số xe không được để trống'),
    body('owner_name').notEmpty().withMessage('Tên chủ sở hữu không được để trống'),
  ],
  createVehicle
);
router.put(
  '/:id',
  authenticateToken,
  [
    body('type').optional().isIn(['car', 'motorcycle', 'bicycle', 'other']).withMessage('Loại phương tiện không hợp lệ'),
    body('license_plate').optional().notEmpty().withMessage('Biển số xe không được để trống'),
    body('owner_name').optional().notEmpty().withMessage('Tên chủ sở hữu không được để trống'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Trạng thái không hợp lệ'),
  ],
  updateVehicle
);
router.delete('/:id', authenticateToken, restrictToAdmin, deleteVehicle);
router.put('/:id/approve', authenticateToken, restrictToAdmin, approveVehicle);
router.put('/:id/reject', authenticateToken, restrictToAdmin, rejectVehicle);

export default router;