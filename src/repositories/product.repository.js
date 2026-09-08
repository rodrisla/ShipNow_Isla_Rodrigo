import { ProductModel } from '../models/product.model.js';

class ProductRepository {
  async getAll({ filter = {}, skip = 0, limit = 10 } = {}) {
    const [products, total] = await Promise.all([
      ProductModel.find(filter)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductModel.countDocuments(filter)
    ]);

    return { products, total };
  }

  async getById(id) {
    return ProductModel.findById(id);
  }

  async create(productData) {
    return ProductModel.create(productData);
  }

  async updateById(id, productData) {
    return ProductModel.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true
    });
  }

  async deleteById(id) {
    return ProductModel.findByIdAndDelete(id);
  }
}

export const productRepository = new ProductRepository();
