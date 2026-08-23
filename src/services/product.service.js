import { PRODUCT_STATUS } from '../constants/index.js';
import { productRepository } from '../repositories/product.repository.js';
import { AppError } from '../utils/index.js';

const getProductStatus = (stock) => {
  return Number(stock) > 0
    ? PRODUCT_STATUS.AVAILABLE
    : PRODUCT_STATUS.OUT_OF_STOCK;
};

class ProductService {
  async getAll() {
    return productRepository.getAll();
  }

  async getAvailable() {
    const products = await productRepository.getAll();

    return products.filter(
      (product) => product.status === PRODUCT_STATUS.AVAILABLE
    );
  }

  async getById(id) {
    const product = await productRepository.getById(id);

    if (!product) {
      throw new AppError('Producto no encontrado', 404);
    }

    return product;
  }

  async create(productData) {
    const stock = productData.stock ?? 0;

    return productRepository.create({
      ...productData,
      status: getProductStatus(stock)
    });
  }

  async updateById(id, productData) {
    const currentProduct = await productRepository.getById(id);

    if (!currentProduct) {
      throw new AppError('Producto no encontrado', 404);
    }

    const nextStock =
      productData.stock === undefined
        ? currentProduct.stock
        : productData.stock;

    const updatedProduct = await productRepository.updateById(id, {
      ...productData,
      status: getProductStatus(nextStock)
    });

    if (!updatedProduct) {
      throw new AppError('Producto no encontrado', 404);
    }

    return updatedProduct;
  }

  async deleteById(id) {
    const deletedProduct = await productRepository.deleteById(id);

    if (!deletedProduct) {
      throw new AppError('Producto no encontrado', 404);
    }

    return deletedProduct;
  }
}

export const productService = new ProductService();