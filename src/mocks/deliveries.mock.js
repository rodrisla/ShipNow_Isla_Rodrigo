import { fakerES } from '@faker-js/faker';
import { DELIVERY_STATUS, ORDER_STATUS } from '../constants/index.js';

const getDeliveryStatus = (orderStatus) => {
  if (orderStatus === ORDER_STATUS.ASSIGNED) {
    return DELIVERY_STATUS.ASSIGNED;
  }

  if (orderStatus === ORDER_STATUS.PICKED_UP) {
    return DELIVERY_STATUS.PICKED_UP;
  }

  if (orderStatus === ORDER_STATUS.IN_TRANSIT) {
    return DELIVERY_STATUS.IN_TRANSIT;
  }

  if (orderStatus === ORDER_STATUS.DELIVERED) {
    return DELIVERY_STATUS.DELIVERED;
  }

  if (orderStatus === ORDER_STATUS.CANCELLED) {
    return DELIVERY_STATUS.CANCELLED;
  }

  return DELIVERY_STATUS.PENDING;
};

export const generateMockDelivery = (order, driverIds) => {
  const status = getDeliveryStatus(order.status);
  const requiresDriver =
    status !== DELIVERY_STATUS.PENDING &&
    status !== DELIVERY_STATUS.CANCELLED;

  return {
    order: order._id,
    driver: requiresDriver
      ? fakerES.helpers.arrayElement(driverIds)
      : null,
    status
  };
};

export const generateMockDeliveries = (quantity, orders, driverIds) =>
  orders
    .slice(0, quantity)
    .map((order) => generateMockDelivery(order, driverIds));