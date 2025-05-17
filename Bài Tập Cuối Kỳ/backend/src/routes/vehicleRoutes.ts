import { Router } from 'express';
  import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicleController';
  import { authenticateToken, restrictToAdmin } from '../middlewares/authMiddleware';
  import { validateRequestBody } from '../middlewares/validateRequestBody';
  import { body } from 'express-validator';
  import { validateRequest } from '../middlewares/authMiddleware';

  const router = Router();

  router.get('/', authenticateToken, getVehicles);

  router.post(
    '/',
    validateRequestBody,
    [
      body('licensePlate').notEmpty().withMessage('Biển số là bắt buộc'),
      body('type').isIn(['car', 'motorbike']).withMessage('Loại phương tiện không hợp lệ'),
    ],
    authenticateToken,
    validateRequest,
    createVehicle
  );

  router.put(
    '/:id',
    validateRequestBody,
    [
      body('licensePlate').notEmpty().withMessage('Biển số là bắt buộc'),
      body('type').isIn(['car', 'motorbike']).withMessage('Loại phương tiện không hợp lệ'),
      body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Trạng thái không hợp lệ'),
    ],
    authenticateToken,
    restrictToAdmin,
    validateRequest,
    updateVehicle
  );

  router.delete('/:id', authenticateToken, restrictToAdmin, deleteVehicle);

  export default router;