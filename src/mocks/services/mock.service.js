import { USER_ROLES } from '../../constants/index.js';
import { AppError } from '../../utils/index.js';
import { generateMockDeliveries } from '../deliveries.mock.js';
import { generateMockOrders } from '../orders.mock.js';
import { generateMockUsers } from '../users.mock.js';
import { mockRepository } from '../repositories/mock.repository.js';

const DEFAULT_QUANTITY = 10;
const MAX_QUANTITY = 100;

const getQuantity = (qty) => {
  const quantity = Number(qty ?? DEFAULT_QUANTITY);

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_QUANTITY
  ) {
    throw new AppError(
      'La cantidad debe ser un número entero entre 1 y 100',
      400
    );
  }

  return quantity;
};

const getDataQuantities = (body) => {
  const { users, orders, deliveries } = body;
  const quantities = [users, orders, deliveries];

  const hasInvalidQuantity = quantities.some(
    (quantity) =>
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      quantity > MAX_QUANTITY
  );

  if (hasInvalidQuantity) {
    throw new AppError(
      'users, orders y deliveries deben ser números enteros entre 0 y 100',
      400
    );
  }

  if (users === 0 && orders === 0 && deliveries === 0) {
    throw new AppError('Debe generarse al menos un registro', 400);
  }

  if (orders > 0 && users === 0) {
    throw new AppError(
      'Para generar pedidos también deben generarse usuarios',
      400
    );
  }

  if (deliveries > 0 && orders === 0) {
    throw new AppError(
      'Para generar entregas también deben generarse pedidos',
      400
    );
  }

  if (deliveries > orders) {
    throw new AppError(
      'La cantidad de entregas no puede superar la cantidad de pedidos',
      400
    );
  }

  if (deliveries > 0 && users < 2) {
    throw new AppError(
      'Para generar entregas se necesitan al menos dos usuarios',
      400
    );
  }

  return { users, orders, deliveries };
};

const removePasswords = (users) =>
  users.map(({ password, ...user }) => user);

class MockService {
  generateUsers(qty) {
    const quantity = getQuantity(qty);
    const users = generateMockUsers(quantity);

    return removePasswords(users);
  }

  generateOrders(qty) {
    const quantity = getQuantity(qty);
    const customers = generateMockUsers(
      quantity,
      USER_ROLES.CUSTOMER
    );

    const customerIds = customers.map((customer) => customer._id);

    return generateMockOrders(quantity, customerIds);
  }

  async generateData(body = {}) {
    const quantities = getDataQuantities(body);
    const mockUsers = generateMockUsers(quantities.users);

    if (quantities.orders > 0) {
      mockUsers[0].role = USER_ROLES.CUSTOMER;
    }

    if (quantities.deliveries > 0) {
      mockUsers[1].role = USER_ROLES.DRIVER;
    }

    const createdUsers = await mockRepository.insertUsers(mockUsers);

    const customers = createdUsers.filter(
      (user) => user.role === USER_ROLES.CUSTOMER
    );

    const drivers = createdUsers.filter(
      (user) => user.role === USER_ROLES.DRIVER
    );

    const customerIds = customers.map((customer) => customer._id);
    const driverIds = drivers.map((driver) => driver._id);

    const mockOrders = generateMockOrders(
      quantities.orders,
      customerIds
    );

    const createdOrders =
      quantities.orders > 0
        ? await mockRepository.insertOrders(mockOrders)
        : [];

    const mockDeliveries = generateMockDeliveries(
      quantities.deliveries,
      createdOrders,
      driverIds
    );

    const createdDeliveries =
      quantities.deliveries > 0
        ? await mockRepository.insertDeliveries(mockDeliveries)
        : [];

    return {
      users: createdUsers.length,
      customers: customers.length,
      drivers: drivers.length,
      orders: createdOrders.length,
      deliveries: createdDeliveries.length
    };
  }
}

export const mockService = new MockService();