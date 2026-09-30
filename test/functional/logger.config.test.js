import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { expect } from 'chai';

import { logger } from '../../src/config/logger.js';

const hasConsoleTransport = (nodeEnv) => {
  const script = `
    const { logger } = await import('./src/config/logger.js');
    const hasConsole = logger.transports.some(
      (transport) => transport.name === 'console'
    );
    process.stdout.write(JSON.stringify({ hasConsole }));
    logger.close();
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
        NODE_ENV: nodeEnv,
        LOG_LEVEL: 'info'
      },
      encoding: 'utf8'
    }
  );

  expect(result.status, result.stderr).to.equal(0);

  return JSON.parse(result.stdout).hasConsole;
};

describe('Configuración del logger', () => {
  it('registra errores y actividad general en archivos separados', () => {
    const filenames = logger.transports
      .map((transport) => transport.filename)
      .filter(Boolean)
      .map((filename) => path.basename(filename));

    expect(filenames).to.include.members([
      'error.log',
      'combined.log'
    ]);
  });

  it('utiliza la consola solamente en development', () => {
    expect(hasConsoleTransport('development')).to.equal(true);
    expect(hasConsoleTransport('test')).to.equal(false);
    expect(hasConsoleTransport('production')).to.equal(false);
  });
});
