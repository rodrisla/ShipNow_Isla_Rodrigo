export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Error interno del servidor';

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'El identificador proporcionado no es válido';
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(', ');
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = 'Ya existe un registro con esos datos';
  }

  if (statusCode >= 500) {
    console.error(error);
    message = 'Error interno del servidor';
  }

  return res.status(statusCode).json({
    status: 'error',
    message
  });
};