import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';

const productsRouter = Router();

productsRouter.get('/available', productController.getAvailable);
productsRouter.get('/', productController.getAll);
productsRouter.get('/:id', productController.getById);
productsRouter.post('/', productController.create);
productsRouter.put('/:id', productController.updateById);
productsRouter.delete('/:id', productController.deleteById);

export default productsRouter;