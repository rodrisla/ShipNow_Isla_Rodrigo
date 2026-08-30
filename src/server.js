import mongoose from 'mongoose';

import app from './app.js';
import { env } from './config/env.config.js';
import { logger } from './config/logger.js';

const startServer = async () => {
  try {
    await mongoose.connect(env.mongodbUri);

    logger.info('Conexión a MongoDB establecida correctamente');

    app.listen(env.port, () => {
      logger.info(
        `Servidor ShipNow escuchando en el puerto ${env.port} (${env.nodeEnv})`
      );
    });
  } catch (error) {
    logger.fatal(
      `No se pudo iniciar ShipNow: ${error.stack ?? error.message}`
    );

    process.exit(1);
  }
};

startServer();