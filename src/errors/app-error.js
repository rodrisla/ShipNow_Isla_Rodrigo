import { ERROR_CODES } from './error-codes.js';
import { ERRORS_DICTIONARY } from './errors.dictionary.js';

export class AppError extends Error {
  constructor(code, customMessage, cause) {
    const resolvedCode = ERRORS_DICTIONARY[code]
      ? code
      : ERROR_CODES.INTERNAL_SERVER_ERROR;
    const errorDefinition = ERRORS_DICTIONARY[resolvedCode];

    super(customMessage ?? errorDefinition.message);

    this.name = 'AppError';
    this.code = resolvedCode;
    this.statusCode = errorDefinition.statusCode;

    if (cause) {
      this.cause = cause;
    }

    Error.captureStackTrace?.(this, AppError);
  }
}