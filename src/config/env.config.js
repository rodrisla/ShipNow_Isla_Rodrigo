import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const requiredVariables = ['PORT', 'MONGODB_URI', 'NODE_ENV'];
const allowedEnvironments = ['development', 'test', 'production'];
const allowedLogLevels = [
  'fatal',
  'error',
  'warning',
  'info',
  'http',
  'debug'
];
const defaultLogLevels = Object.freeze({
  development: 'debug',
  test: 'fatal',
  production: 'info'
});

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

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error(
    'La variable PORT debe ser un número entero entre 1 y 65535'
  );
}

const nodeEnv = process.env.NODE_ENV.trim().toLowerCase();

if (!allowedEnvironments.includes(nodeEnv)) {
  throw new Error(
    'La variable NODE_ENV debe ser development, test o production'
  );
}

const mongodbUri = process.env.MONGODB_URI.trim();

if (!/^mongodb(\+srv)?:\/\//.test(mongodbUri)) {
  throw new Error(
    'La variable MONGODB_URI debe contener una URI válida de MongoDB'
  );
}

const logLevel = (
  process.env.LOG_LEVEL ?? defaultLogLevels[nodeEnv]
).trim().toLowerCase();

if (!allowedLogLevels.includes(logLevel)) {
  throw new Error(
    `La variable LOG_LEVEL debe ser uno de: ${allowedLogLevels.join(', ')}`
  );
}

export const env = Object.freeze({
  port,
  mongodbUri,
  nodeEnv,
  logLevel,
  isProduction: nodeEnv === 'production'
});
