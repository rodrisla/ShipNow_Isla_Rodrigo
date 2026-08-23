import { productService } from '../services/product.service.js';

class ProductController {
  async getAll(req, res, next) {
    try {
      const products = await productService.getAll();

      return res.status(200).json({
        status: 'success',
        data: { products }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailable(req, res, next) {
    try {
      const products = await productService.getAvailable();

      return res.status(200).json({
        status: 'success',
        data: { products }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getById(req.params.id);

      return res.status(200).json({
        status: 'success',
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const product = await productService.create(req.body);

      return res.status(201).json({
        status: 'success',
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateById(req, res, next) {
    try {
      const product = await productService.updateById(
        req.params.id,
        req.body
      );

      return res.status(200).json({
        status: 'success',
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteById(req, res, next) {
    try {
      await productService.deleteById(req.params.id);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();