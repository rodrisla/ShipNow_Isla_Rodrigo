import { Router } from 'express';
import { deliveryController } from '../controllers/delivery.controller.js';

const deliveriesRouter = Router();

deliveriesRouter.get('/', deliveryController.getAll);
deliveriesRouter.get('/:id', deliveryController.getById);
deliveriesRouter.post('/', deliveryController.create);
deliveriesRouter.patch('/:id/status', deliveryController.updateStatus);

export default deliveriesRouter;
