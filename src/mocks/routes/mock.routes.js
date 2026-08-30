import { Router } from 'express';
import { mockController } from '../controllers/mock.controller.js';

const mocksRouter = Router();

mocksRouter.get('/mockingusers', mockController.getUsers);
mocksRouter.get('/mockingorders', mockController.getOrders);
mocksRouter.post('/generate-products', mockController.generateProducts);
mocksRouter.post('/generateData', mockController.generateData);

export default mocksRouter;