import mongoose from 'mongoose';
import app from './app.js';
import { env } from './config/env.config.js';

const startServer = async () => {
  try {
    await mongoose.connect(env.mongodbUri);

    console.log('Base de datos conectada correctamente');

    app.listen(env.port, () => {
      console.log(
        `Servidor corriendo en el puerto ${env.port} (${env.nodeEnv})`
      );
    });
  } catch (error) {
    console.error(`No se pudo iniciar servidor: ${error.message}`);
    process.exit(1);
  }
};

startServer();