import { fakerES } from '@faker-js/faker';
import { DELIVERY_PRIORITY, ORDER_STATUS } from '../constants/index.js';

export const generateMockOrder = (customerId) => ({
  user: customerId,
  deliveryAddress: fakerES.location.streetAddress(),
  items: Array.from(
    { length: fakerES.number.int({ min: 1, max: 4 }) },
    () => ({
      name: fakerES.commerce.productName(),
      quantity: fakerES.number.int({ min: 1, max: 5 }),
      price: fakerES.number.int({ min: 1000, max: 1000000 })
    })
  ),
  status: fakerES.helpers.arrayElement(Object.values(ORDER_STATUS)),
  priority: fakerES.helpers.arrayElement(Object.values(DELIVERY_PRIORITY))
});

export const generateMockOrders = (quantity, customerIds) =>
  Array.from({ length: quantity }, () => {
    const customerId = fakerES.helpers.arrayElement(customerIds);

    return generateMockOrder(customerId);
  });