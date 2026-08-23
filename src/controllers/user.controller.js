import { userService } from '../services/user.service.js';

class UserController {
  async getAll(req, res, next) {
    try {
      const users = await userService.getAll();

      return res.status(200).json({
        status: 'success',
        data: { users }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getById(req.params.id);

      return res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const user = await userService.create(req.body);

      return res.status(201).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateById(req, res, next) {
    try {
      const user = await userService.updateById(
        req.params.id,
        req.body
      );

      return res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteById(req, res, next) {
    try {
      await userService.deleteById(req.params.id);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();