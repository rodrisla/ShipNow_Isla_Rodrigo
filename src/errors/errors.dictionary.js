import { ERROR_CODES } from './error-codes.js';

export const ERRORS_DICTIONARY = Object.freeze({
  [ERROR_CODES.PRODUCT_NOT_FOUND]: {
    statusCode: 404,
    message: 'No se encontró el producto solicitado'
  },
  [ERROR_CODES.USER_NOT_FOUND]: {
    statusCode: 404,
    message: 'No se encontró el usuario solicitado'
  },
  [ERROR_CODES.USER_ALREADY_EXISTS]: {
    statusCode: 409,
    message: 'El email ya está registrado'
  },
  [ERROR_CODES.ORDER_NOT_FOUND]: {
    statusCode: 404,
    message: 'No se encontró el pedido solicitado'
  },
  [ERROR_CODES.DELIVERY_NOT_FOUND]: {
    statusCode: 404,
    message: 'No se encontró la entrega solicitada'
  },
  [ERROR_CODES.INVALID_ORDER_STATUS]: {
    statusCode: 400,
    message: 'El estado indicado no es válido para un pedido'
  },
  [ERROR_CODES.INVALID_DELIVERY_STATUS]: {
    statusCode: 400,
    message: 'El estado indicado no es válido para una entrega'
  },
  [ERROR_CODES.FILE_REQUIRED]: {
    statusCode: 400,
    message: 'Se debe adjuntar un archivo'
  },
  [ERROR_CODES.INVALID_FILE_TYPE]: {
    statusCode: 400,
    message: 'El tipo de archivo no está permitido'
  },
  [ERROR_CODES.FILE_TOO_LARGE]: {
    statusCode: 413,
    message: 'El archivo supera el tamaño máximo permitido'
  },
  [ERROR_CODES.INVALID_FILE_FIELD]: {
    statusCode: 400,
    message: 'El campo utilizado para adjuntar el archivo no es válido'
  },
  [ERROR_CODES.INVALID_DOCUMENT_TYPE]: {
    statusCode: 400,
    message: 'El tipo de documento indicado no es válido'
  },
  [ERROR_CODES.FILE_STORAGE_ERROR]: {
    statusCode: 500,
    message: 'No se pudo guardar el archivo'
  },
  [ERROR_CODES.INVALID_MOCK_AMOUNT]: {
    statusCode: 400,
    message: 'La cantidad de datos a generar no es válida'
  },
  [ERROR_CODES.INVALID_MOCK_DATA]: {
    statusCode: 400,
    message: 'Los datos enviados para generar mocks no son válidos'
  },
  [ERROR_CODES.MOCK_GENERATION_ERROR]: {
    statusCode: 500,
    message: 'No se pudieron generar o guardar los datos de prueba'
  },
  [ERROR_CODES.INVALID_ID]: {
    statusCode: 400,
    message: 'El identificador proporcionado no es válido'
  },
  [ERROR_CODES.VALIDATION_ERROR]: {
    statusCode: 400,
    message: 'Los datos enviados no son válidos'
  },
  [ERROR_CODES.DUPLICATE_RESOURCE]: {
    statusCode: 409,
    message: 'Ya existe un registro con esos datos'
  },
  [ERROR_CODES.ROUTE_NOT_FOUND]: {
    statusCode: 404,
    message: 'La ruta solicitada no existe'
  },
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: {
    statusCode: 500,
    message: 'Error interno del servidor'
  }
});