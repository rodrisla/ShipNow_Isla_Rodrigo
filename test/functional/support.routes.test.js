import { expect } from 'chai';
import request from 'supertest';

import app from '../../src/app.js';
import { expectErrorResponse } from '../helpers/assertions.js';

describe('Endpoints de soporte', () => {
  it('GET /health informa el estado sin exponer datos sensibles', async () => {
    const response = await request(app).get('/health');

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.data).to.include({
      service: 'ShipNow API',
      api: 'up',
      environment: 'test'
    });
    expect(response.body.data.uptime).to.be.a('number').and.at.least(0);
    expect(new Date(response.body.data.timestamp).toISOString()).to.equal(
      response.body.data.timestamp
    );

    const serializedResponse = JSON.stringify(response.body);

    for (const sensitiveField of [
      'MONGODB_URI',
      'mongodbUri',
      'password',
      'secret'
    ]) {
      expect(serializedResponse).to.not.include(sensitiveField);
    }
  });

  it('GET /logger-test ejecuta todos los niveles del logger', async () => {
    const response = await request(app).get('/logger-test');

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      status: 'success',
      message: 'Todos los niveles del logger fueron ejecutados'
    });
  });

  it('GET /api/docs expone Swagger UI con la especificación real', async () => {
    const uiResponse = await request(app).get('/api/docs/');

    expect(uiResponse.status).to.equal(200);
    expect(uiResponse.headers['content-type']).to.match(/text\/html/);
    expect(uiResponse.text).to.include('Swagger UI');

    const specResponse = await request(app)
      .get('/api/docs/swagger-ui-init.js');

    expect(specResponse.status).to.equal(200);

    for (const fragment of [
      'ShipNow API',
      '/api/users',
      '/api/users/{id}/documents',
      '/api/deliveries/{id}/receipts',
      '/api/orders',
      '/api/mocks/generateData',
      '/logger-test',
      'multipart/form-data',
      'FileMetadata'
    ]) {
      expect(specResponse.text).to.include(fragment);
    }
  });

  it('responde con el error uniforme para una ruta inexistente', async () => {
    const response = await request(app)
      .get('/api/ruta-que-no-existe');

    expectErrorResponse(response, 404, 'ROUTE_NOT_FOUND');
    expect(response.body.message).to.equal(
      'Ruta no encontrada: GET /api/ruta-que-no-existe'
    );
  });

  it('rechaza cuerpos JSON que superan los 100 KB', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'a'.repeat(110 * 1024) });

    expectErrorResponse(response, 413, 'PAYLOAD_TOO_LARGE');
  });
});
