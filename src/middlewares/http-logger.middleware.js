import { logger } from '../config/logger.js';

export const httpLogger = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const duration =
      Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    logger.http(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration.toFixed(2)} ms`
    );
  });

  next();
};
