import { mockService } from '../services/mock.service.js';

class MockController {
  getUsers(req, res, next) {
    try {
      const users = mockService.generateUsers(req.query.qty);

      res.status(200).json({
        status: 'success',
        data: { users }
      });
    } catch (error) {
      next(error);
    }
  }

  getOrders(req, res, next) {
    try {
      const orders = mockService.generateOrders(req.query.qty);

      res.status(200).json({
        status: 'success',
        data: { orders }
      });
    } catch (error) {
      next(error);
    }
  }

  async generateData(req, res, next) {
    try {
      const inserted = await mockService.generateData(req.body);

      res.status(201).json({
        status: 'success',
        data: { inserted }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const mockController = new MockController();