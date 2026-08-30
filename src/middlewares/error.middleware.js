import { AppError, ERROR_CODES } from '../errors/index.js';

const getValidationMessage = (error) => {
  const messages = Object.values(error.errors ?? {})
    .map((validationError) => validationError.message)
    .filter(Boolean);

  return messages.length > 0 ? messages.join(', ') : undefined;
};

const mapToAppError = (error) => {
  if (error.name === 'CastError') {
    if (error.path === '_id' || error.kind === 'ObjectId') {
      return new AppError(ERROR_CODES.INVALID_ID);
    }

    return new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      `El valor enviado para ${error.path} no es válido`
    );
  }

  if (error.code === 11000) {
    if (error.keyPattern?.email || error.keyValue?.email) {
      return new AppError(ERROR_CODES.USER_ALREADY_EXISTS);
    }

    return new AppError(ERROR_CODES.DUPLICATE_RESOURCE);
  }

  if (error.name === 'ValidationError') {
    return new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      getValidationMessage(error)
    );
  }

  return new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR, undefined, error);
};

export const notFoundHandler = (req, _res, next) => {
  next(
    new AppError(
      ERROR_CODES.ROUTE_NOT_FOUND,
      `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    )
  );
};

export const errorHandler = (error, _req, res, _next) => {
  const appError =
    error instanceof AppError ? error : mapToAppError(error);

  if (appError.statusCode >= 500) {
    console.error(appError.cause ?? error);
  }

  return res.status(appError.statusCode).json({
    status: 'error',
    error: appError.code,
    message: appError.message
  });
};
