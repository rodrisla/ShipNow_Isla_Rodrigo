import { USER_ROLES } from '../../constants/index.js';
import { AppError, ERROR_CODES } from '../../errors/index.js';
import { generateMockDeliveries } from '../deliveries.mock.js';
import { generateMockOrders } from '../orders.mock.js';
import { generateMockProducts } from '../products.mock.js';
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
      ERROR_CODES.INVALID_MOCK_AMOUNT,
      'La cantidad debe ser un número entero entre 1 y 100'
    );
  }

  return quantity;
};

const getDataQuantities = (body) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError(
      ERROR_CODES.INVALID_MOCK_DATA,
      'El body debe ser un objeto JSON'
    );
  }

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
      ERROR_CODES.INVALID_MOCK_DATA,
      'users, orders y deliveries deben ser números enteros entre 0 y 100'
    );
  }

  if (users === 0 && orders === 0 && deliveries === 0) {
    throw new AppError(
      ERROR_CODES.INVALID_MOCK_DATA,
      'Debe generarse al menos un registro'
    );
  }

  if (orders > 0 && users === 0) {
    throw new AppError(
      ERROR_CODES.INVALID_MOCK_DATA,
      'Para generar pedidos también deben generarse usuarios'
    );
  }

  if (deliveries > 0 && orders === 0) {
    throw new AppError(
      ERROR_CODES.INVALID_MOCK_DATA,
      'Para generar entregas también deben generarse pedidos'
    );
  }

  if (deliveries > orders) {
    throw new AppError(
      ERROR_CODES.INVALID_MOCK_DATA,
      'La cantidad de entregas no puede superar la cantidad de pedidos'
    );
  }

  if (deliveries > 0 && users < 2) {
    throw new AppError(
      ERROR_CODES.INVALID_MOCK_DATA,
      'Para generar entregas se necesitan al menos dos usuarios'
    );
  }

  return { users, orders, deliveries };
};

const removePasswords = (users) =>
  users.map(({ password, ...user }) => user);

const getSaveToDatabase = (saveToDatabase) => {
  if (saveToDatabase === undefined) {
    return false;
  }

  if (typeof saveToDatabase !== 'boolean') {
    throw new AppError(
      ERROR_CODES.INVALID_MOCK_DATA,
      'saveToDatabase debe ser un valor booleano'
    );
  }

  return saveToDatabase;
};

const insertMockData = async (insertOperation) => {
  try {
    return await insertOperation();
  } catch (error) {
    throw new AppError(ERROR_CODES.MOCK_GENERATION_ERROR, undefined, error);
  }
};

class MockService {
  generateUsers(qty) {
    const quantity = getQuantity(qty);
    const users = generateMockUsers(quantity);

    return removePasswords(users);
  }

  generateOrders(qty) {
    const quantity = getQuantity(qty);
    const customers = generateMockUsers(quantity, USER_ROLES.CUSTOMER);

    const customerIds = customers.map((customer) => customer._id);

    return generateMockOrders(quantity, customerIds);
  }

  async generateProducts(body = {}) {
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      throw new AppError(
        ERROR_CODES.INVALID_MOCK_DATA,
        'El body debe ser un objeto JSON'
      );
    }

    const quantity = getQuantity(body.count);
    const saveToDatabase = getSaveToDatabase(body.saveToDatabase);
    const products = generateMockProducts(quantity);

    if (!saveToDatabase) {
      return {
        products,
        savedToDatabase: false
      };
    }

    const createdProducts = await insertMockData(() =>
      mockRepository.insertProducts(products)
    );

    return {
      products: createdProducts,
      savedToDatabase: true
    };
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

    const createdUsers = await insertMockData(() =>
      mockRepository.insertUsers(mockUsers)
    );

    const customers = createdUsers.filter(
      (user) => user.role === USER_ROLES.CUSTOMER
    );

    const drivers = createdUsers.filter(
      (user) => user.role === USER_ROLES.DRIVER
    );

    const customerIds = customers.map((customer) => customer._id);
    const driverIds = drivers.map((driver) => driver._id);

    const mockOrders = generateMockOrders(quantities.orders, customerIds);

    const createdOrders =
      quantities.orders > 0
        ? await insertMockData(() => mockRepository.insertOrders(mockOrders))
        : [];

    const mockDeliveries = generateMockDeliveries(
      quantities.deliveries,
      createdOrders,
      driverIds
    );

    const createdDeliveries =
      quantities.deliveries > 0
        ? await insertMockData(() =>
            mockRepository.insertDeliveries(mockDeliveries)
          )
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
