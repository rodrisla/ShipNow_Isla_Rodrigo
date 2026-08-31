import { expect } from 'chai';
import request from 'supertest';

import app from '../../src/app.js';
import { OrderModel } from '../../src/models/order.model.js';
import {
  expectErrorResponse,
  expectMongoId,
  expectSuccessResponse
} from '../helpers/assertions.js';
import { buildOrder, buildUser } from '../helpers/factories.js';

const createUser = async () => {
  const response = await request(app)
    .post('/api/users')
    .send(buildUser());

  expect(response.status).to.equal(201);

  return response.body.data.user;
};

const createOrder = async () => {
  const user = await createUser();
  const response = await request(app)
    .post('/api/orders')
    .send(buildOrder(user._id));

  expect(response.status).to.equal(201);

  return response.body.data.order;
};

describe('API de pedidos', () => {
  it('GET /api/orders devuelve los pedidos controlados', async () => {
    const createdOrder = await createOrder();

    const response = await request(app).get('/api/orders');

    expectSuccessResponse(response, 200);
    expect(response.body.data.orders).to.be.an('array').with.lengthOf(1);

    const [order] = response.body.data.orders;

    expectMongoId(order._id);
    expect(order._id).to.equal(createdOrder._id);
    expect(order.items).to.be.an('array').with.lengthOf(1);
    expect(order.user).to.be.an('object');
    expect(order.user).to.not.have.property('password');
  });

  it('POST /api/orders crea un pedido con datos válidos', async () => {
    const user = await createUser();
    const orderData = buildOrder(user._id);

    const response = await request(app)
      .post('/api/orders')
      .send(orderData);

    expectSuccessResponse(response, 201);

    const order = response.body.data.order;

    expectMongoId(order._id);
    expect(order).to.include({
      deliveryAddress: orderData.deliveryAddress,
      status: 'created',
      priority: orderData.priority
    });
    expect(order.items).to.deep.equal(orderData.items);
    expect(order.user._id).to.equal(user._id);
    expect(await OrderModel.countDocuments()).to.equal(1);
  });

  it('GET /api/orders/:id devuelve el pedido solicitado', async () => {
    const createdOrder = await createOrder();

    const response = await request(app)
      .get(`/api/orders/${createdOrder._id}`);

    expectSuccessResponse(response, 200);

    const order = response.body.data.order;

    expect(order._id).to.equal(createdOrder._id);
    expect(order.user).to.be.an('object');
    expect(order.user).to.not.have.property('password');
    expect(order.items).to.be.an('array').with.lengthOf(1);
  });

  it('PATCH /api/orders/:id/status actualiza un estado válido', async () => {
    const createdOrder = await createOrder();

    const response = await request(app)
      .patch(`/api/orders/${createdOrder._id}/status`)
      .send({ status: 'in_transit' });

    expectSuccessResponse(response, 200);
    expect(response.body.data.order.status).to.equal('in_transit');

    const persistedOrder = await OrderModel.findById(createdOrder._id);
    expect(persistedOrder.status).to.equal('in_transit');
  });

  it('POST /api/orders rechaza datos incompletos', async () => {
    const user = await createUser();
    const orderData = buildOrder(user._id);
    delete orderData.items;

    const response = await request(app)
      .post('/api/orders')
      .send(orderData);

    expectErrorResponse(response, 400, 'VALIDATION_ERROR');
    expect(response.body.message).to.equal(
      'El pedido debe incluir al menos un item'
    );
    expect(await OrderModel.countDocuments()).to.equal(0);
  });

  it('GET /api/orders/:id responde 404 si el pedido no existe', async () => {
    const response = await request(app)
      .get('/api/orders/000000000000000000000000');

    expectErrorResponse(response, 404, 'ORDER_NOT_FOUND');
    expect(response.body.message).to.equal(
      'No se encontró el pedido solicitado'
    );
  });

  it('PATCH /api/orders/:id/status rechaza un estado inválido', async () => {
    const createdOrder = await createOrder();

    const response = await request(app)
      .patch(`/api/orders/${createdOrder._id}/status`)
      .send({ status: 'on_the_way' });

    expectErrorResponse(response, 400, 'INVALID_ORDER_STATUS');
    expect(response.body.message).to.equal(
      'El estado indicado no es válido para un pedido'
    );

    const persistedOrder = await OrderModel.findById(createdOrder._id);
    expect(persistedOrder.status).to.equal('created');
  });
});
