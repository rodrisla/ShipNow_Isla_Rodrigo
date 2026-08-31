import { expect } from 'chai';
import request from 'supertest';

import app from '../../src/app.js';
import { DeliveryModel } from '../../src/models/delivery.model.js';
import { OrderModel } from '../../src/models/order.model.js';
import { ProductModel } from '../../src/models/product.model.js';
import { UserModel } from '../../src/models/user.model.js';
import {
  expectErrorResponse,
  expectSuccessResponse
} from '../helpers/assertions.js';

describe('API de mocks', () => {
  it('GET /api/mocks/mockingusers genera usuarios sin guardarlos', async () => {
    const response = await request(app)
      .get('/api/mocks/mockingusers?qty=2');

    expectSuccessResponse(response, 200);
    expect(response.body.data.users).to.be.an('array').with.lengthOf(2);

    for (const user of response.body.data.users) {
      expect(user).to.include.all.keys('name', 'email', 'role', 'active');
      expect(user).to.not.have.property('password');
    }

    expect(await UserModel.countDocuments()).to.equal(0);
  });

  it('GET /api/mocks/mockingorders genera pedidos completos', async () => {
    const response = await request(app)
      .get('/api/mocks/mockingorders?qty=2');

    expectSuccessResponse(response, 200);
    expect(response.body.data.orders).to.be.an('array').with.lengthOf(2);

    for (const order of response.body.data.orders) {
      expect(order).to.include.all.keys(
        'user',
        'deliveryAddress',
        'items',
        'status',
        'priority'
      );
      expect(order.items).to.be.an('array').and.not.be.empty;
    }

    expect(await OrderModel.countDocuments()).to.equal(0);
  });

  it('POST /api/mocks/generate-products genera sin persistir', async () => {
    const response = await request(app)
      .post('/api/mocks/generate-products')
      .send({ count: 2, saveToDatabase: false });

    expectSuccessResponse(response, 200);
    expect(response.body.data.savedToDatabase).to.equal(false);
    expect(response.body.data.products).to.be.an('array').with.lengthOf(2);

    for (const product of response.body.data.products) {
      expect(product).to.include.all.keys(
        'name',
        'description',
        'price',
        'stock',
        'status'
      );
    }

    expect(await ProductModel.countDocuments()).to.equal(0);
  });

  it('POST /api/mocks/generateData inserta relaciones controladas', async () => {
    const response = await request(app)
      .post('/api/mocks/generateData')
      .send({ users: 2, orders: 1, deliveries: 1 });

    expectSuccessResponse(response, 201);
    expect(response.body.data.inserted).to.deep.equal({
      users: 2,
      customers: 1,
      drivers: 1,
      orders: 1,
      deliveries: 1
    });

    expect(await UserModel.countDocuments()).to.equal(2);
    expect(await OrderModel.countDocuments()).to.equal(1);
    expect(await DeliveryModel.countDocuments()).to.equal(1);
  });

  it('rechaza una cantidad inválida de usuarios mock', async () => {
    const response = await request(app)
      .get('/api/mocks/mockingusers?qty=-1');

    expectErrorResponse(response, 400, 'INVALID_MOCK_AMOUNT');
    expect(response.body.message).to.equal(
      'La cantidad debe ser un número entero entre 1 y 100'
    );
  });

  it('rechaza pedidos mock sin usuarios relacionados', async () => {
    const response = await request(app)
      .post('/api/mocks/generateData')
      .send({ users: 0, orders: 1, deliveries: 0 });

    expectErrorResponse(response, 400, 'INVALID_MOCK_DATA');
    expect(response.body.message).to.equal(
      'Para generar pedidos también deben generarse usuarios'
    );

    expect(await UserModel.countDocuments()).to.equal(0);
    expect(await OrderModel.countDocuments()).to.equal(0);
    expect(await DeliveryModel.countDocuments()).to.equal(0);
  });
});
