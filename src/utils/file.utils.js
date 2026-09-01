import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runtimeUploadsRoot } from '../config/multer.config.js';
import { logger } from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const toPortablePath = (filePath) =>
  filePath.split(path.sep).join('/');

export const buildFileMetadata = (file, documentType) => ({
  originalName: file.originalname,
  storedName: file.filename,
  path: toPortablePath(path.relative(projectRoot, file.path)),
  mimeType: file.mimetype,
  size: file.size,
  documentType,
  uploadedAt: new Date()
});

export const removeStoredFile = async (file) => {
  if (!file?.path) {
    return;
  }

  const filePath = path.resolve(file.path);
  const uploadsBoundary = `${path.resolve(runtimeUploadsRoot)}${path.sep}`;

  if (!filePath.startsWith(uploadsBoundary)) {
    logger.error(
      `Se rechazó la eliminación de un archivo fuera de uploads: ${filePath}`
    );
    return;
  }

  try {
    await unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.error(
        `No se pudo eliminar ${file.filename}: ${error.stack ?? error.message}`
      );
    }
  }
};
