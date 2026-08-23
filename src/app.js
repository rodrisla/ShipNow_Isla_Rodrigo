import express from 'express';

import productsRouter from './routes/products.routes.js';
import usersRouter from './routes/users.routes.js';
import {errorHandler,notFoundHandler} from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ShipNow funcionando'
  });
});

app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;