import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { env } from './env.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDirectory = path.resolve(__dirname, '../../logs');

const loggerLevels = {
  fatal: 0,
  error: 1,
  warning: 2,
  info: 3,
  http: 4,
  debug: 5
};

const loggerColors = {
  fatal: 'bold red',
  error: 'red',
  warning: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(loggerColors);

const lineFormat = winston.format.printf(
  ({ timestamp, level, message, stack }) =>
    `${timestamp} [${level}] ${stack ?? message}`
);

const consoleFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  lineFormat
);

const fileFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  lineFormat
);

const transports = [
  new winston.transports.Console({
    format: consoleFormat
  })
];

if (!env.isProduction) {
  await mkdir(logsDirectory, { recursive: true });

  transports.push(
    new DailyRotateFile({
      dirname: logsDirectory,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
      format: fileFormat
    })
  );
}

const logger = winston.createLogger({
  levels: loggerLevels,
  level: env.logLevel,
  transports
});

export { logger };
