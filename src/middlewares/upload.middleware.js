import multer from 'multer';

import {
  deliveryReceiptUploader,
  userDocumentUploader
} from '../config/multer.config.js';
import { AppError, ERROR_CODES } from '../errors/index.js';

const mapUploadError = (error, expectedField) => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return new AppError(ERROR_CODES.FILE_TOO_LARGE);
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return new AppError(
        ERROR_CODES.INVALID_FILE_FIELD,
        `El campo de archivo debe llamarse "${expectedField}"`
      );
    }
  }

  return new AppError(ERROR_CODES.FILE_STORAGE_ERROR, undefined, error);
};

const createSingleFileUpload = (uploader, fieldName) => {
  const upload = uploader.single(fieldName);

  return (req, res, next) => {
    upload(req, res, (error) => {
      if (error) {
        return next(mapUploadError(error, fieldName));
      }

      if (!req.file) {
        return next(
          new AppError(
            ERROR_CODES.FILE_REQUIRED,
            `Se debe adjuntar un archivo en el campo "${fieldName}"`
          )
        );
      }

      return next();
    });
  };
};

export const uploadUserDocument = createSingleFileUpload(
  userDocumentUploader,
  'document'
);

export const uploadDeliveryReceipt = createSingleFileUpload(
  deliveryReceiptUploader,
  'receipt'
);
