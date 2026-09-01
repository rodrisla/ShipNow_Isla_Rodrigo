import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { uploadUserDocument } from '../middlewares/upload.middleware.js';

const usersRouter = Router();

usersRouter.get('/', userController.getAll);
usersRouter.get('/:id', userController.getById);
usersRouter.post('/', userController.create);
usersRouter.post(
  '/:id/documents',
  uploadUserDocument,
  userController.uploadDocument
);
usersRouter.put('/:id', userController.updateById);
usersRouter.delete('/:id', userController.deleteById);

export default usersRouter;