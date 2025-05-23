// import { Router } from 'express';
// import {
//   notifyInvoiceCreated,
//   notifyInvoiceOverdue,
//   notifyPaymentConfirmed,
//   notifyVehicleCreated,
//   notifyVehicleStatusUpdated,
// } from '../controllers/notificationController';
// import { authenticateToken } from '../middlewares/authMiddleware';

// const router = Router();

// router.use((req, res, next) => {
//   console.log(`Notification request: ${req.method} ${req.path}`);
//   next();
// });

// router.post('/invoice-created', authenticateToken, notifyInvoiceCreated);
// router.post('/invoice-overdue', authenticateToken, notifyInvoiceOverdue);
// router.post('/payment-confirmed', authenticateToken, notifyPaymentConfirmed);
// router.post('/vehicle-created', authenticateToken, notifyVehicleCreated);
// router.post('/vehicle-status-updated', authenticateToken, notifyVehicleStatusUpdated);

// export default router;