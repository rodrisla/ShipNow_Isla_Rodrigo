import { logger } from '../config/logger.js';
import {
  DELIVERY_PRIORITY,
  ORDER_STATUS
} from '../constants/index.js';
import { AppError, ERROR_CODES } from '../errors/index.js';
import { orderRepository } from '../repositories/order.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import {
  buildPaginationMetadata,
  parseEnumFilter,
  parsePagination
} from '../utils/list-query.utils.js';

class OrderService {
  async getAll(query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const status = parseEnumFilter(
      query.status,
      Object.values(ORDER_STATUS),
      'status'
    );
    const priority = parseEnumFilter(
      query.priority,
      Object.values(DELIVERY_PRIORITY),
      'priority'
    );
    const filter = {};

    if (status !== undefined) {
      filter.status = status;
    }

    if (priority !== undefined) {
      filter.priority = priority;
    }

    const { orders, total } = await orderRepository.getAll({
      filter,
      skip,
      limit
    });

    return {
      orders,
      pagination: buildPaginationMetadata({ page, limit, total })
    };
  }

  async getById(id) {
    const order = await orderRepository.getById(id);

    if (!order) {
      throw new AppError(ERROR_CODES.ORDER_NOT_FOUND);
    }

    return order;
  }

  async create(orderData) {
    if (
      orderData === null ||
      typeof orderData !== 'object' ||
      Array.isArray(orderData)
    ) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        'El body debe ser un objeto JSON'
      );
    }

    if (orderData.user) {
      const user = await userRepository.getById(orderData.user);

      if (!user) {
        throw new AppError(ERROR_CODES.USER_NOT_FOUND);
      }
    }

    const order = await orderRepository.create(orderData);

    logger.info(`Pedido ${order._id} creado correctamente`);

    return order;
  }

  async updateStatus(id, status) {
    if (!Object.values(ORDER_STATUS).includes(status)) {
      throw new AppError(ERROR_CODES.INVALID_ORDER_STATUS);
    }

    const order = await orderRepository.updateStatus(id, status);

    if (!order) {
      throw new AppError(ERROR_CODES.ORDER_NOT_FOUND);
    }

    logger.info(`Pedido ${order._id} actualizado al estado ${status}`);

    return order;
  }
}

export const orderService = new OrderService();
