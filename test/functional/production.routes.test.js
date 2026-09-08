import { spawnSync } from 'node:child_process';

import { expect } from 'chai';

describe('Política de endpoints en producción', () => {
  it('restringe mocks y logger-test, pero mantiene health y Swagger', () => {
    const script = `
      import request from 'supertest';
      const { default: app } = await import('./src/app.js');
      const loggerTest = await request(app).get('/logger-test');
      const mocks = await request(app).get('/api/mocks/mockingusers?qty=1');
      const health = await request(app).get('/health');
      const swagger = await request(app).get('/api/docs/');
      process.stdout.write(JSON.stringify({
        loggerTest: loggerTest.status,
        mocks: mocks.status,
        health: health.status,
        swagger: swagger.status
      }));
    `;
    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '--eval', script],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PORT: '8080',
          MONGODB_URI: 'mongodb://localhost:27017/shipnow',
          NODE_ENV: 'production',
          LOG_LEVEL: 'fatal'
        },
        encoding: 'utf8'
      }
    );

    expect(result.status, result.stderr).to.equal(0);
    expect(JSON.parse(result.stdout)).to.deep.equal({
      loggerTest: 404,
      mocks: 404,
      health: 200,
      swagger: 200
    });
  });
});
