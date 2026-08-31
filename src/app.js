import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.config.js';
import { logger } from './config/logger.js';
import { swaggerSpec } from './config/swagger.config.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { httpLogger } from './middlewares/http-logger.middleware.js';
import deliveriesRouter from './routes/deliveries.routes.js';
import mocksRouter from './mocks/routes/mock.routes.js';
import ordersRouter from './routes/orders.routes.js';
import productsRouter from './routes/products.routes.js';
import usersRouter from './routes/users.routes.js';

const app = express();

app.use(httpLogger);
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ShipNow funcionando'
  });
});

app.get('/logger-test', (_req, res) => {
  logger.debug('Prueba del logger: nivel debug');
  logger.http('Prueba del logger: nivel http');
  logger.info('Prueba del logger: nivel info');
  logger.warning('Prueba del logger: nivel warning');
  logger.error('Prueba del logger: nivel error');
  logger.fatal('Prueba del logger: nivel fatal');

  res.status(200).json({
    status: 'success',
    message: 'Todos los niveles del logger fueron ejecutados'
  });
});

if (['development', 'test'].includes(env.nodeEnv)) {
  app.use('/api/mocks', mocksRouter);
}

app.use('/api/deliveries', deliveriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;