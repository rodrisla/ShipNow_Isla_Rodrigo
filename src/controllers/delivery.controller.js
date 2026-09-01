import { deliveryService } from '../services/delivery.service.js';

class DeliveryController {
  async getAll(req, res, next) {
    try {
      const deliveries = await deliveryService.getAll();

      return res.status(200).json({
        status: 'success',
        data: { deliveries }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const delivery = await deliveryService.getById(req.params.id);

      return res.status(200).json({
        status: 'success',
        data: { delivery }
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const delivery = await deliveryService.create(req.body);

      return res.status(201).json({
        status: 'success',
        data: { delivery }
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadReceipt(req, res, next) {
    try {
      const delivery = await deliveryService.addReceipt(
        req.params.id,
        req.file
      );

      return res.status(201).json({
        status: 'success',
        data: { delivery }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const delivery = await deliveryService.updateStatus(
        req.params.id,
        req.body?.status
      );

      return res.status(200).json({
        status: 'success',
        data: { delivery }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const deliveryController = new DeliveryController();
