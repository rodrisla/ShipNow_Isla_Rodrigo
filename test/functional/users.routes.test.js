import { expect } from 'chai';
import request from 'supertest';

import app from '../../src/app.js';
import { UserModel } from '../../src/models/user.model.js';
import {
  expectErrorResponse,
  expectMongoId,
  expectSuccessResponse
} from '../helpers/assertions.js';
import { buildUser } from '../helpers/factories.js';

describe('API de usuarios', () => {
  it('GET /api/users devuelve usuarios controlados sin contraseñas', async () => {
    const userData = buildUser();
    await UserModel.create(userData);

    const response = await request(app).get('/api/users');

    expectSuccessResponse(response, 200);
    expect(response.body.data.users).to.be.an('array').with.lengthOf(1);

    const [user] = response.body.data.users;

    expectMongoId(user._id);
    expect(user).to.include({
      name: userData.name,
      email: userData.email,
      role: userData.role,
      active: true
    });
    expect(user).to.not.have.property('password');
  });

  it('POST /api/users crea un usuario válido', async () => {
    const userData = buildUser();

    const response = await request(app)
      .post('/api/users')
      .send(userData);

    expectSuccessResponse(response, 201);

    const user = response.body.data.user;

    expectMongoId(user._id);
    expect(user).to.include({
      name: userData.name,
      email: userData.email,
      role: userData.role,
      active: true
    });
    expect(user).to.not.have.property('password');
    expect(await UserModel.countDocuments()).to.equal(1);
  });

  it('POST /api/users rechaza datos incompletos', async () => {
    const userData = buildUser();
    delete userData.password;

    const response = await request(app)
      .post('/api/users')
      .send(userData);

    expectErrorResponse(response, 400, 'VALIDATION_ERROR');
    expect(response.body.message).to.equal(
      'La contraseña es obligatoria'
    );
    expect(await UserModel.countDocuments()).to.equal(0);
  });
});
