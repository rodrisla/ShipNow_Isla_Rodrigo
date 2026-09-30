import { expect } from 'chai';
import request from 'supertest';

import app from '../../src/app.js';
import { DeliveryModel } from '../../src/models/delivery.model.js';
import {
  expectErrorResponse,
  expectMongoId,
  expectSuccessResponse
} from '../helpers/assertions.js';
import {
  buildDelivery,
  buildOrder,
  buildUser
} from '../helpers/factories.js';

const NON_EXISTENT_ID = '000000000000000000000000';

const createUser = async (overrides = {}) => {
  const response = await request(app)
    .post('/api/users')
    .send(buildUser(overrides));

  expect(response.status).to.equal(201);

  return response.body.data.user;
};

const createOrder = async (userId) => {
  const response = await request(app)
    .post('/api/orders')
    .send(buildOrder(userId));

  expect(response.status).to.equal(201);

  return response.body.data.order;
};

const createDelivery = async () => {
  const customer = await createUser();
  const driver = await createUser({
    name: 'Repartidor Test',
    email: 'repartidor.test@shipnow.test',
    role: 'driver'
  });
  const order = await createOrder(customer._id);
  const response = await request(app)
    .post('/api/deliveries')
    .send(buildDelivery(order._id, driver._id));

  expect(response.status).to.equal(201);

  return response.body.data.delivery;
};

describe('API de entregas y tracking', () => {
  it('POST /api/deliveries crea una entrega con tracking', async () => {
    const customer = await createUser();
    const driver = await createUser({
      name: 'Repartidor Test',
      email: 'repartidor.test@shipnow.test',
      role: 'driver'
    });
    const order = await createOrder(customer._id);

    const response = await request(app)
      .post('/api/deliveries')
      .send(buildDelivery(order._id, driver._id));

    expectSuccessResponse(response, 201);

    const delivery = response.body.data.delivery;

    expectMongoId(delivery._id);
    expect(delivery.trackingCode).to.match(/^SHP-[A-F0-9]{12}$/);
    expect(delivery.status).to.equal('pending');
    expect(delivery.order._id).to.equal(order._id);
    expect(delivery.driver._id).to.equal(driver._id);
    expect(delivery.driver).to.not.have.property('password');
    expect(await DeliveryModel.countDocuments()).to.equal(1);
  });

  it('GET /api/deliveries/:id devuelve la entrega solicitada', async () => {
    const createdDelivery = await createDelivery();

    const response = await request(app)
      .get(`/api/deliveries/${createdDelivery._id}`);

    expectSuccessResponse(response, 200);
    expect(response.body.data.delivery._id).to.equal(createdDelivery._id);
    expect(response.body.data.delivery.trackingCode).to.equal(
      createdDelivery.trackingCode
    );
  });

  it('GET /api/deliveries/tracking/:code permite seguir una entrega', async () => {
    const createdDelivery = await createDelivery();

    const response = await request(app).get(
      `/api/deliveries/tracking/${createdDelivery.trackingCode.toLowerCase()}`
    );

    expectSuccessResponse(response, 200);
    expect(response.body.data.delivery._id).to.equal(createdDelivery._id);
    expect(response.body.data.delivery.trackingCode).to.equal(
      createdDelivery.trackingCode
    );
  });

  it('PATCH /api/deliveries/:id/status actualiza el envío', async () => {
    const createdDelivery = await createDelivery();

    const response = await request(app)
      .patch(`/api/deliveries/${createdDelivery._id}/status`)
      .send({ status: 'in_transit' });

    expectSuccessResponse(response, 200);
    expect(response.body.data.delivery.status).to.equal('in_transit');

    const persistedDelivery = await DeliveryModel.findById(
      createdDelivery._id
    );

    expect(persistedDelivery.status).to.equal('in_transit');
  });

  it('DELETE /api/deliveries/:id elimina una entrega', async () => {
    const createdDelivery = await createDelivery();

    const response = await request(app).delete(
      `/api/deliveries/${createdDelivery._id}`
    );

    expect(response.status).to.equal(204);
    expect(response.body).to.be.empty;
    expect(await DeliveryModel.findById(createdDelivery._id)).to.be.null;
  });

  it('POST /api/deliveries rechaza un pedido inexistente', async () => {
    const response = await request(app)
      .post('/api/deliveries')
      .send({ order: NON_EXISTENT_ID });

    expectErrorResponse(response, 404, 'ORDER_NOT_FOUND');
    expect(await DeliveryModel.countDocuments()).to.equal(0);
  });

  it('PATCH /api/deliveries/:id/status rechaza un estado inválido', async () => {
    const createdDelivery = await createDelivery();

    const response = await request(app)
      .patch(`/api/deliveries/${createdDelivery._id}/status`)
      .send({ status: 'lost_in_space' });

    expectErrorResponse(response, 400, 'INVALID_DELIVERY_STATUS');

    const persistedDelivery = await DeliveryModel.findById(
      createdDelivery._id
    );

    expect(persistedDelivery.status).to.equal('pending');
  });

  it('GET tracking rechaza un código con formato inválido', async () => {
    const response = await request(app).get(
      '/api/deliveries/tracking/codigo-invalido'
    );

    expectErrorResponse(response, 400, 'INVALID_TRACKING_CODE');
  });
});
