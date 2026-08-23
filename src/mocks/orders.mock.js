import { fakerES } from '@faker-js/faker';
import { DELIVERY_PRIORITY, ORDER_STATUS } from '../constants/index.js';

export const generateMockOrder = (customerId) => ({
  user: customerId,
  deliveryAddress: fakerES.location.streetAddress(),
  status: fakerES.helpers.arrayElement(Object.values(ORDER_STATUS)),
  priority: fakerES.helpers.arrayElement(Object.values(DELIVERY_PRIORITY))
});

export const generateMockOrders = (quantity, customerIds) =>
  Array.from({ length: quantity }, () => {
    const customerId = fakerES.helpers.arrayElement(customerIds);

    return generateMockOrder(customerId);
  });