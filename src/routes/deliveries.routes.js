import { Router } from 'express';
import { deliveryController } from '../controllers/delivery.controller.js';
import { uploadDeliveryReceipt } from '../middlewares/upload.middleware.js';

const deliveriesRouter = Router();

deliveriesRouter.get('/', deliveryController.getAll);
deliveriesRouter.get(
  '/tracking/:trackingCode',
  deliveryController.getByTrackingCode
);
deliveriesRouter.get('/:id', deliveryController.getById);
deliveriesRouter.post('/', deliveryController.create);
deliveriesRouter.post(
  '/:id/receipts',
  uploadDeliveryReceipt,
  deliveryController.uploadReceipt
);
deliveriesRouter.patch('/:id/status', deliveryController.updateStatus);
deliveriesRouter.delete('/:id', deliveryController.deleteById);

export default deliveriesRouter;
