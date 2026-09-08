import { PRODUCT_STATUS } from '../constants/index.js';
import { productRepository } from '../repositories/product.repository.js';
import { AppError, ERROR_CODES } from '../errors/index.js';
import {
  buildPaginationMetadata,
  parseEnumFilter,
  parsePagination
} from '../utils/list-query.utils.js';

const getProductStatus = (stock) => {
  return Number(stock) > 0
    ? PRODUCT_STATUS.AVAILABLE
    : PRODUCT_STATUS.OUT_OF_STOCK;
};

class ProductService {
  async getAll(query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const status = parseEnumFilter(
      query.status,
      Object.values(PRODUCT_STATUS),
      'status'
    );
    const filter = {};

    if (status !== undefined) {
      filter.status = status;
    }

    const { products, total } = await productRepository.getAll({
      filter,
      skip,
      limit
    });

    return {
      products,
      pagination: buildPaginationMetadata({ page, limit, total })
    };
  }

  async getAvailable(query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const { products, total } = await productRepository.getAll({
      filter: { status: PRODUCT_STATUS.AVAILABLE },
      skip,
      limit
    });

    return {
      products,
      pagination: buildPaginationMetadata({ page, limit, total })
    };
  }

  async getById(id) {
    const product = await productRepository.getById(id);

    if (!product) {
      throw new AppError(ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    return product;
  }

  async create(productData) {
    const stock = productData.stock ?? 0;

    return productRepository.create({
      ...productData,
      status: getProductStatus(stock),
    });
  }

  async updateById(id, productData) {
    const currentProduct = await productRepository.getById(id);

    if (!currentProduct) {
      throw new AppError(ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    const nextStock =
      productData.stock === undefined
        ? currentProduct.stock
        : productData.stock;

    const updatedProduct = await productRepository.updateById(id, {
      ...productData,
      status: getProductStatus(nextStock),
    });

    if (!updatedProduct) {
      throw new AppError(ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    return updatedProduct;
  }

  async deleteById(id) {
    const deletedProduct = await productRepository.deleteById(id);

    if (!deletedProduct) {
      throw new AppError(ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    return deletedProduct;
  }
}

export const productService = new ProductService();
