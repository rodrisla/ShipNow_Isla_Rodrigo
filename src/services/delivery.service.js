import { logger } from '../config/logger.js';
import {
  DELIVERY_DOCUMENT_TYPES,
  DELIVERY_STATUS
} from '../constants/index.js';
import { AppError, ERROR_CODES } from '../errors/index.js';
import { deliveryRepository } from '../repositories/delivery.repository.js';
import { orderRepository } from '../repositories/order.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import {
  buildFileMetadata,
  removeStoredFile
} from '../utils/file.utils.js';
import {
  buildPaginationMetadata,
  parseEnumFilter,
  parsePagination
} from '../utils/list-query.utils.js';

class DeliveryService {
  async getAll(query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const status = parseEnumFilter(
      query.status,
      Object.values(DELIVERY_STATUS),
      'status'
    );
    const filter = {};

    if (status !== undefined) {
      filter.status = status;
    }

    const { deliveries, total } = await deliveryRepository.getAll({
      filter,
      skip,
      limit
    });

    return {
      deliveries,
      pagination: buildPaginationMetadata({ page, limit, total })
    };
  }

  async getById(id) {
    const delivery = await deliveryRepository.getById(id);

    if (!delivery) {
      throw new AppError(ERROR_CODES.DELIVERY_NOT_FOUND);
    }

    return delivery;
  }

  async create(deliveryData) {
    if (
      deliveryData === null ||
      typeof deliveryData !== 'object' ||
      Array.isArray(deliveryData)
    ) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        'El body debe ser un objeto JSON'
      );
    }

    if (deliveryData.order) {
      const order = await orderRepository.getById(deliveryData.order);

      if (!order) {
        throw new AppError(ERROR_CODES.ORDER_NOT_FOUND);
      }
    }

    if (deliveryData.driver) {
      const driver = await userRepository.getById(deliveryData.driver);

      if (!driver) {
        throw new AppError(ERROR_CODES.USER_NOT_FOUND);
      }
    }

    const delivery = await deliveryRepository.create(deliveryData);

    logger.info(`Entrega ${delivery._id} creada correctamente`);

    return delivery;
  }

  async addReceipt(id, file) {
    try {
      if (!file) {
        throw new AppError(ERROR_CODES.FILE_REQUIRED);
      }

      const documentType = DELIVERY_DOCUMENT_TYPES.RECEIPT;
      const metadata = buildFileMetadata(file, documentType);
      const delivery = await deliveryRepository.addReceipt(id, metadata);

      if (!delivery) {
        throw new AppError(ERROR_CODES.DELIVERY_NOT_FOUND);
      }

      logger.info(
        `Comprobante ${metadata.storedName} asociado a la entrega ${delivery._id}`
      );

      return delivery;
    } catch (error) {
      await removeStoredFile(file);
      throw error;
    }
  }

  async updateStatus(id, status) {
    if (!Object.values(DELIVERY_STATUS).includes(status)) {
      throw new AppError(ERROR_CODES.INVALID_DELIVERY_STATUS);
    }

    const delivery = await deliveryRepository.updateStatus(id, status);

    if (!delivery) {
      throw new AppError(ERROR_CODES.DELIVERY_NOT_FOUND);
    }

    logger.info(
      `Entrega ${delivery._id} actualizada al estado ${status}`
    );

    return delivery;
  }
}

export const deliveryService = new DeliveryService();
