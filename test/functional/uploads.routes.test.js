import { access, readdir } from 'node:fs/promises';
import path from 'node:path';

import { expect } from 'chai';
import request from 'supertest';

import app from '../../src/app.js';
import {
  MAX_FILE_SIZE,
  runtimeUploadsRoot
} from '../../src/config/multer.config.js';
import { DeliveryModel } from '../../src/models/delivery.model.js';
import { OrderModel } from '../../src/models/order.model.js';
import { UserModel } from '../../src/models/user.model.js';
import {
  expectErrorResponse,
  expectMongoId,
  expectSuccessResponse
} from '../helpers/assertions.js';
import { buildOrder, buildUser } from '../helpers/factories.js';

const NON_EXISTENT_ID = '000000000000000000000000';
const PROJECT_ROOT = path.resolve(runtimeUploadsRoot, '../..');
const PDF_BUFFER = Buffer.from(
  '%PDF-1.4\nDocumento funcional de ShipNow\n%%EOF'
);
const PNG_BUFFER = Buffer.from('Comprobante PNG de ShipNow');

const countStoredFiles = async (directory = runtimeUploadsRoot) => {
  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return 0;
    }

    throw error;
  }

  const counts = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? countStoredFiles(path.join(directory, entry.name))
        : 1
    )
  );

  return counts.reduce((total, count) => total + count, 0);
};

const expectFileMetadata = (metadata, expected) => {
  expect(metadata).to.have.all.keys(
    'originalName',
    'storedName',
    'path',
    'mimeType',
    'size',
    'documentType',
    'uploadedAt'
  );
  expect(metadata).to.include({
    originalName: expected.originalName,
    mimeType: expected.mimeType,
    size: expected.size,
    documentType: expected.documentType
  });
  expect(metadata.storedName).to.match(expected.storedNamePattern);
  expect(metadata.path).to.match(expected.pathPattern);
  expect(Date.parse(metadata.uploadedAt)).to.not.be.NaN;
};

const createUser = async (overrides = {}) => {
  return UserModel.create(buildUser(overrides));
};

const createDelivery = async () => {
  const customer = await createUser();
  const driver = await createUser({
    name: 'Repartidor Test',
    email: 'repartidor.test@shipnow.test',
    role: 'driver'
  });
  const order = await OrderModel.create(buildOrder(customer._id));

  return DeliveryModel.create({
    order: order._id,
    driver: driver._id
  });
};

describe('Carga de documentos y comprobantes', () => {
  it('carga un documento y guarda solo sus metadatos en el usuario', async () => {
    const user = await createUser();
    const response = await request(app)
      .post(`/api/users/${user._id}/documents`)
      .field('documentType', 'dni')
      .attach('document', PDF_BUFFER, {
        filename: 'dni-usuario.pdf',
        contentType: 'application/pdf'
      });

    expectSuccessResponse(response, 201);

    const updatedUser = response.body.data.user;

    expectMongoId(updatedUser._id);
    expect(updatedUser).to.not.have.property('password');
    expect(updatedUser.documents).to.be.an('array').with.lengthOf(1);

    const [metadata] = updatedUser.documents;

    expectFileMetadata(metadata, {
      originalName: 'dni-usuario.pdf',
      mimeType: 'application/pdf',
      size: PDF_BUFFER.length,
      documentType: 'dni',
      storedNamePattern: /^[0-9]+-[a-f0-9-]+\.pdf$/,
      pathPattern: /^uploads\/test\/users\/documents\//
    });

    await access(path.resolve(PROJECT_ROOT, metadata.path));

    const persistedUser = await UserModel.findById(user._id).lean();

    expect(persistedUser.documents).to.have.lengthOf(1);
    expect(persistedUser.documents[0]).to.not.have.any.keys(
      'buffer',
      'data',
      'content'
    );
    expect(await countStoredFiles()).to.equal(1);
  });

  it('rechaza un documento cuando falta el archivo', async () => {
    const user = await createUser();
    const response = await request(app)
      .post(`/api/users/${user._id}/documents`)
      .field('documentType', 'dni');

    expectErrorResponse(response, 400, 'FILE_REQUIRED');
    expect((await UserModel.findById(user._id)).documents).to.be.empty;
    expect(await countStoredFiles()).to.equal(0);
  });

  it('rechaza un tipo de documento inválido y elimina el archivo', async () => {
    const user = await createUser();
    const response = await request(app)
      .post(`/api/users/${user._id}/documents`)
      .field('documentType', 'pasaporte')
      .attach('document', PDF_BUFFER, {
        filename: 'pasaporte.pdf',
        contentType: 'application/pdf'
      });

    expectErrorResponse(response, 400, 'INVALID_DOCUMENT_TYPE');
    expect((await UserModel.findById(user._id)).documents).to.be.empty;
    expect(await countStoredFiles()).to.equal(0);
  });

  it('rechaza un tipo de archivo no permitido', async () => {
    const user = await createUser();
    const response = await request(app)
      .post(`/api/users/${user._id}/documents`)
      .field('documentType', 'dni')
      .attach('document', Buffer.from('archivo de texto'), {
        filename: 'documento.txt',
        contentType: 'text/plain'
      });

    expectErrorResponse(response, 400, 'INVALID_FILE_TYPE');
    expect((await UserModel.findById(user._id)).documents).to.be.empty;
    expect(await countStoredFiles()).to.equal(0);
  });

  it('rechaza un archivo que supera el tamaño máximo', async () => {
    const user = await createUser();
    const oversizedFile = Buffer.alloc(MAX_FILE_SIZE + 1);
    const response = await request(app)
      .post(`/api/users/${user._id}/documents`)
      .field('documentType', 'dni')
      .attach('document', oversizedFile, {
        filename: 'documento-grande.pdf',
        contentType: 'application/pdf'
      });

    expectErrorResponse(response, 413, 'FILE_TOO_LARGE');
    expect((await UserModel.findById(user._id)).documents).to.be.empty;
    expect(await countStoredFiles()).to.equal(0);
  });

  it('rechaza un nombre de campo multipart incorrecto', async () => {
    const user = await createUser();
    const response = await request(app)
      .post(`/api/users/${user._id}/documents`)
      .field('documentType', 'dni')
      .attach('file', PDF_BUFFER, {
        filename: 'dni-usuario.pdf',
        contentType: 'application/pdf'
      });

    expectErrorResponse(response, 400, 'INVALID_FILE_FIELD');
    expect((await UserModel.findById(user._id)).documents).to.be.empty;
    expect(await countStoredFiles()).to.equal(0);
  });

  it('elimina el documento si el usuario no existe', async () => {
    const response = await request(app)
      .post(`/api/users/${NON_EXISTENT_ID}/documents`)
      .field('documentType', 'dni')
      .attach('document', PDF_BUFFER, {
        filename: 'dni-inexistente.pdf',
        contentType: 'application/pdf'
      });

    expectErrorResponse(response, 404, 'USER_NOT_FOUND');
    expect(await countStoredFiles()).to.equal(0);
  });

  it('carga un comprobante y lo asocia a una entrega', async () => {
    const delivery = await createDelivery();
    const response = await request(app)
      .post(`/api/deliveries/${delivery._id}/receipts`)
      .attach('receipt', PNG_BUFFER, {
        filename: 'comprobante-entrega.png',
        contentType: 'image/png'
      });

    expectSuccessResponse(response, 201);

    const updatedDelivery = response.body.data.delivery;

    expectMongoId(updatedDelivery._id);
    expect(updatedDelivery.receipts).to.be.an('array').with.lengthOf(1);

    const [metadata] = updatedDelivery.receipts;

    expectFileMetadata(metadata, {
      originalName: 'comprobante-entrega.png',
      mimeType: 'image/png',
      size: PNG_BUFFER.length,
      documentType: 'delivery_receipt',
      storedNamePattern: /^[0-9]+-[a-f0-9-]+\.png$/,
      pathPattern: /^uploads\/test\/deliveries\/receipts\//
    });

    await access(path.resolve(PROJECT_ROOT, metadata.path));

    const persistedDelivery = await DeliveryModel.findById(
      delivery._id
    ).lean();

    expect(persistedDelivery.receipts).to.have.lengthOf(1);
    expect(persistedDelivery.receipts[0]).to.not.have.any.keys(
      'buffer',
      'data',
      'content'
    );
    expect(await countStoredFiles()).to.equal(1);
  });

  it('elimina el comprobante si la entrega no existe', async () => {
    const response = await request(app)
      .post(`/api/deliveries/${NON_EXISTENT_ID}/receipts`)
      .attach('receipt', PNG_BUFFER, {
        filename: 'comprobante-inexistente.png',
        contentType: 'image/png'
      });

    expectErrorResponse(response, 404, 'DELIVERY_NOT_FOUND');
    expect(await countStoredFiles()).to.equal(0);
  });
});
