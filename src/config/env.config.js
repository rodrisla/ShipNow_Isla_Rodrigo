import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = ['PORT', 'MONGODB_URI', 'NODE_ENV'];

const missingVariables = requiredVariables.filter((variable) => {
  const value = process.env[variable];

  return !value || value.trim() === '';
});

if (missingVariables.length > 0) {
  throw new Error(
    `Faltan variables de entorno obligatorias: ${missingVariables.join(', ')}`
  );
}

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error('La variable PORT debe ser un número entero válido');
}

export const env = Object.freeze({
  port,
  mongodbUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV
});