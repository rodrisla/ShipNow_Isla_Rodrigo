import { spawnSync } from 'node:child_process';

import { expect } from 'chai';

const importEnvironmentConfig = (overrides) => {
  return spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      "await import('./src/config/env.config.js')"
    ],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: '8080',
        MONGODB_URI: 'mongodb://localhost:27017/shipnow',
        NODE_ENV: 'production',
        LOG_LEVEL: 'info',
        ...overrides
      },
      encoding: 'utf8'
    }
  );
};

describe('Configuración por entorno', () => {
  it('falla al inicio cuando falta una variable crítica', () => {
    const result = importEnvironmentConfig({ MONGODB_URI: '' });

    expect(result.status).to.not.equal(0);
    expect(result.stderr).to.include(
      'Faltan variables de entorno obligatorias: MONGODB_URI'
    );
  });

  it('rechaza un entorno de ejecución inválido', () => {
    const result = importEnvironmentConfig({ NODE_ENV: 'staging' });

    expect(result.status).to.not.equal(0);
    expect(result.stderr).to.include(
      'NODE_ENV debe ser development, test o production'
    );
  });

  it('rechaza un nivel de logs inválido', () => {
    const result = importEnvironmentConfig({ LOG_LEVEL: 'verbose' });

    expect(result.status).to.not.equal(0);
    expect(result.stderr).to.include('LOG_LEVEL debe ser uno de');
  });
});
