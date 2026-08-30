import { fakerES } from '@faker-js/faker';
import { PRODUCT_STATUS } from '../constants/index.js';

export const generateMockProduct = () => {
  const stock = fakerES.number.int({ min: 0, max: 100 });

  return {
    name: fakerES.commerce.productName(),
    description: fakerES.commerce.productDescription(),
    price: fakerES.number.int({ min: 1000, max: 1000000 }),
    stock,
    status:
      stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK
  };
};

export const generateMockProducts = (quantity) =>
  Array.from({ length: quantity }, generateMockProduct);