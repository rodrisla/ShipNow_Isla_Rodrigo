import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';

const ordersRouter = Router();

ordersRouter.get('/', orderController.getAll);
ordersRouter.get('/:id', orderController.getById);
ordersRouter.post('/', orderController.create);
ordersRouter.patch('/:id/status', orderController.updateStatus);

export default ordersRouter;
