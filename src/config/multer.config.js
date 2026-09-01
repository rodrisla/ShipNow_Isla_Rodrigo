import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

import { AppError, ERROR_CODES } from '../errors/index.js';
import { env } from './env.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const uploadsRoot = path.join(projectRoot, 'uploads');
const runtimeUploadsRoot =
  env.nodeEnv === 'test'
    ? path.join(uploadsRoot, 'test')
    : uploadsRoot;

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = Object.freeze({
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
});

const fileFilter = (_req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ALLOWED_FILE_TYPES[file.mimetype];

  if (!allowedExtensions?.includes(extension)) {
    return callback(new AppError(ERROR_CODES.INVALID_FILE_TYPE));
  }

  return callback(null, true);
};

const createStorage = (subdirectory) =>
  multer.diskStorage({
    destination: (_req, _file, callback) => {
      const directory = path.join(runtimeUploadsRoot, subdirectory);

      try {
        mkdirSync(directory, { recursive: true });
        callback(null, directory);
      } catch (error) {
        callback(error);
      }
    },
    filename: (_req, file, callback) => {
      const [extension] = ALLOWED_FILE_TYPES[file.mimetype];
      const generatedName = `${Date.now()}-${randomUUID()}${extension}`;

      callback(null, generatedName);
    }
  });

const createUploader = (subdirectory) =>
  multer({
    storage: createStorage(subdirectory),
    fileFilter,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 1
    }
  });

export const userDocumentUploader = createUploader(
  path.join('users', 'documents')
);

export const deliveryReceiptUploader = createUploader(
  path.join('deliveries', 'receipts')
);

export { uploadsRoot, runtimeUploadsRoot };
