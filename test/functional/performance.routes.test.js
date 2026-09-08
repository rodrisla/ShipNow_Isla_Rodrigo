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
import { buildOrder, buildUser } from '../helpers/factories.js';

const expectPagination = (pagination, expected) => {
  expect(pagination).to.deep.equal(expected);
};

describe('Performance de listados', () => {
  it('pagina y filtra usuarios sin exponer contraseñas', async () => {
    await UserModel.create([
      buildUser({ email: 'cliente1@shipnow.test' }),
      buildUser({ email: 'cliente2@shipnow.test' }),
      buildUser({
        email: 'cliente.inactivo@shipnow.test',
        active: false
      }),
      buildUser({
        email: 'conductor@shipnow.test',
        role: 'driver'
      })
    ]);

    const response = await request(app)
      .get('/api/users')
      .query({ page: 1, limit: 1, role: 'customer', active: true });

    expectSuccessResponse(response, 200);
    expect(response.body.data.users).to.have.lengthOf(1);
    expect(response.body.data.users[0]).to.not.have.property('password');
    expectPagination(response.body.data.pagination, {
      page: 1,
      limit: 1,
      total: 2,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false
    });
  });

  it('pagina pedidos aplicando estado y prioridad en MongoDB', async () => {
    const user = await UserModel.create(
      buildUser({ email: 'pedidos@shipnow.test' })
    );

    await OrderModel.create([
      buildOrder(user._id, {
        deliveryAddress: 'Dirección 1',
        status: 'created',
        priority: 'high'
      }),
      buildOrder(user._id, {
        deliveryAddress: 'Dirección 2',
        status: 'created',
        priority: 'high'
      }),
      buildOrder(user._id, {
        deliveryAddress: 'Dirección 3',
        status: 'delivered',
        priority: 'normal'
      })
    ]);

    const response = await request(app)
      .get('/api/orders')
      .query({ page: 2, limit: 1, status: 'created', priority: 'high' });

    expectSuccessResponse(response, 200);
    expect(response.body.data.orders).to.have.lengthOf(1);
    expect(response.body.data.orders[0].user).to.not.have.property(
      'password'
    );
    expectPagination(response.body.data.pagination, {
      page: 2,
      limit: 1,
      total: 2,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true
    });
  });

  it('pagina entregas filtradas por estado', async () => {
    const driver = await UserModel.create(
      buildUser({
        email: 'entregas@shipnow.test',
        role: 'driver'
      })
    );
    const order = await OrderModel.create(buildOrder(driver._id));

    await DeliveryModel.create([
      { order: order._id, driver: driver._id, status: 'pending' },
      { order: order._id, driver: driver._id, status: 'pending' },
      { order: order._id, driver: driver._id, status: 'delivered' }
    ]);

    const response = await request(app)
      .get('/api/deliveries')
      .query({ page: 1, limit: 1, status: 'pending' });

    expectSuccessResponse(response, 200);
    expect(response.body.data.deliveries).to.have.lengthOf(1);
    expectPagination(response.body.data.pagination, {
      page: 1,
      limit: 1,
      total: 2,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false
    });
  });

  it('filtra productos disponibles antes de paginarlos', async () => {
    await ProductModel.create([
      { name: 'Producto 1', price: 100, stock: 2, status: 'AVAILABLE' },
      { name: 'Producto 2', price: 200, stock: 3, status: 'AVAILABLE' },
      {
        name: 'Producto agotado',
        price: 300,
        stock: 0,
        status: 'OUT_OF_STOCK'
      }
    ]);

    const response = await request(app)
      .get('/api/products/available')
      .query({ page: 2, limit: 1 });

    expectSuccessResponse(response, 200);
    expect(response.body.data.products).to.have.lengthOf(1);
    expect(response.body.data.products[0].status).to.equal('AVAILABLE');
    expectPagination(response.body.data.pagination, {
      page: 2,
      limit: 1,
      total: 2,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true
    });
  });

  it('aplica un límite máximo de 100 resultados', async () => {
    const response = await request(app)
      .get('/api/users')
      .query({ limit: 1000 });

    expectSuccessResponse(response, 200);
    expect(response.body.data.pagination.limit).to.equal(100);
  });

  it('rechaza parámetros de paginación inválidos', async () => {
    const response = await request(app)
      .get('/api/users')
      .query({ page: 0 });

    expectErrorResponse(response, 400, 'INVALID_PAGINATION');
  });

  it('rechaza filtros que no pertenecen al dominio', async () => {
    const response = await request(app)
      .get('/api/orders')
      .query({ status: 'inventado' });

    expectErrorResponse(response, 400, 'INVALID_FILTER');
  });
});
