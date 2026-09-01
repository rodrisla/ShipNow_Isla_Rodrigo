import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.test', override: true, quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DATABASE_NAME = 'shipnow_test';
const TEST_UPLOADS_DIRECTORY = path.resolve(__dirname, '../uploads/test');

const getDatabaseName = (uri = '') => {
  const withoutQuery = uri.split('?')[0];

  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
};

const validateTestEnvironment = () => {
  const databaseName = getDatabaseName(process.env.MONGODB_URI);

  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Los tests requieren NODE_ENV=test');
  }

  if (databaseName !== TEST_DATABASE_NAME) {
    throw new Error(
      'La base de datos de testing debe llamarse shipnow_test'
    );
  }
};

const clearTestDatabase = async () => {
  const collections = Object.values(mongoose.connection.collections);

  await Promise.all(
    collections.map((collection) => collection.deleteMany({}))
  );
};

const clearTestUploads = async () => {
  await rm(TEST_UPLOADS_DIRECTORY, { recursive: true, force: true });
};

export const mochaHooks = {
  async beforeAll() {
    this.timeout(15000);
    validateTestEnvironment();

    await mongoose.connect(process.env.MONGODB_URI);

    const connectedDatabase = mongoose.connection.db.databaseName;

    if (connectedDatabase !== TEST_DATABASE_NAME) {
      await mongoose.disconnect();

      throw new Error(
        'Se rechazó una conexión distinta de shipnow_test'
      );
    }
  },

  async beforeEach() {
    await Promise.all([
      clearTestDatabase(),
      clearTestUploads()
    ]);
  },

  async afterAll() {
    await clearTestUploads();

    if (mongoose.connection.readyState !== 0) {
      await clearTestDatabase();
      await mongoose.disconnect();
    }
  }
};
