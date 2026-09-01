import { logger } from '../config/logger.js';
import { USER_DOCUMENT_TYPES } from '../constants/index.js';
import { AppError, ERROR_CODES } from '../errors/index.js';
import { userRepository } from '../repositories/user.repository.js';
import {
  buildFileMetadata,
  removeStoredFile
} from '../utils/file.utils.js';

const normalizeEmail = (email) => {
  return typeof email === 'string'
    ? email.trim().toLowerCase()
    : email;
};

const hidePassword = (user) => {
  const userObject =
    typeof user.toObject === 'function'
      ? user.toObject()
      : { ...user };

  delete userObject.password;

  return userObject;
};

class UserService {
  async getAll() {
    const users = await userRepository.getAll();

    return users.map(hidePassword);
  }

  async getById(id) {
    const user = await userRepository.getById(id);

    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND);
    }

    return hidePassword(user);
  }

  async create(userData) {
    const email = normalizeEmail(userData.email);

    if (email !== undefined) {
      const existingUser = await userRepository.getByEmail(email);

      if (existingUser) {
        throw new AppError(ERROR_CODES.USER_ALREADY_EXISTS);
      }
    }

    const createdUser = await userRepository.create({
      ...userData,
      email
    });

    return hidePassword(createdUser);
  }

  async addDocument(id, file, documentType) {
    try {
      if (!file) {
        throw new AppError(ERROR_CODES.FILE_REQUIRED);
      }

      if (
        !Object.values(USER_DOCUMENT_TYPES).includes(documentType)
      ) {
        throw new AppError(ERROR_CODES.INVALID_DOCUMENT_TYPE);
      }

      const metadata = buildFileMetadata(file, documentType);
      const user = await userRepository.addDocument(id, metadata);

      if (!user) {
        throw new AppError(ERROR_CODES.USER_NOT_FOUND);
      }

      logger.info(
        `Documento ${metadata.storedName} asociado al usuario ${user._id}`
      );

      return hidePassword(user);
    } catch (error) {
      await removeStoredFile(file);
      throw error;
    }
  }

  async updateById(id, userData) {
    const currentUser = await userRepository.getById(id);

    if (!currentUser) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND);
    }

    const updateData = { ...userData };

    if (userData.email !== undefined) {
      const email = normalizeEmail(userData.email);
      const existingUser = await userRepository.getByEmail(email);

      if (
        existingUser &&
        existingUser._id.toString() !== id
      ) {
        throw new AppError(ERROR_CODES.USER_ALREADY_EXISTS);
      }

      updateData.email = email;
    }

    const updatedUser = await userRepository.updateById(id, updateData);

    if (!updatedUser) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND);
    }

    return hidePassword(updatedUser);
  }

  async deleteById(id) {
    const deletedUser = await userRepository.deleteById(id);

    if (!deletedUser) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND);
    }

    return hidePassword(deletedUser);
  }
}

export const userService = new UserService();