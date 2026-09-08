import { AppError, ERROR_CODES } from '../errors/index.js';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

const parsePositiveInteger = (value, fallback, parameterName) => {
  if (value === undefined) {
    return fallback;
  }

  if (
    typeof value !== 'string' ||
    !/^[1-9]\d*$/.test(value.trim())
  ) {
    throw new AppError(
      ERROR_CODES.INVALID_PAGINATION,
      `El parámetro ${parameterName} debe ser un número entero positivo`
    );
  }

  const parsedValue = Number(value);

  if (!Number.isSafeInteger(parsedValue)) {
    throw new AppError(
      ERROR_CODES.INVALID_PAGINATION,
      `El parámetro ${parameterName} debe ser un número entero válido`
    );
  }

  return parsedValue;
};

export const parsePagination = (query = {}) => {
  const page = parsePositiveInteger(
    query.page,
    DEFAULT_PAGE,
    'page'
  );
  const requestedLimit = parsePositiveInteger(
    query.limit,
    DEFAULT_LIMIT,
    'limit'
  );
  const limit = Math.min(requestedLimit, MAX_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

export const buildPaginationMetadata = ({ page, limit, total }) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0
  };
};

export const parseEnumFilter = (
  value,
  allowedValues,
  parameterName
) => {
  if (value === undefined) {
    return undefined;
  }

  if (
    typeof value !== 'string' ||
    !allowedValues.includes(value)
  ) {
    throw new AppError(
      ERROR_CODES.INVALID_FILTER,
      `El filtro ${parameterName} no tiene un valor válido`
    );
  }

  return value;
};

export const parseBooleanFilter = (value, parameterName) => {
  if (value === undefined) {
    return undefined;
  }

  if (value !== 'true' && value !== 'false') {
    throw new AppError(
      ERROR_CODES.INVALID_FILTER,
      `El filtro ${parameterName} debe ser true o false`
    );
  }

  return value === 'true';
};
