import { expect } from 'chai';
import request from 'supertest';

import app from '../../src/app.js';
import { expectErrorResponse } from '../helpers/assertions.js';

describe('Endpoints de soporte', () => {
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
      '/api/orders',
      '/api/mocks/generateData',
      '/logger-test'
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
});
