import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

test('HTTP middleware shares the application logger and preserves header redaction', () => {
  const loggerUrl = new URL('../src/lib/logger.ts', import.meta.url).href;
  const fixture = `
    import { createServer, get } from 'node:http';
    import pinoHttp from 'pino-http';
    const { logger } = await import(${JSON.stringify(loggerUrl)});
    logger.info({
      req: { headers: { authorization: 'fixture-auth-secret', cookie: 'fixture-cookie-secret' } },
      res: { headers: { 'set-cookie': 'fixture-session-secret' } }
    }, 'redaction fixture');
    const middleware = pinoHttp({ logger });
    const server = createServer((request, response) => {
      middleware(request, response);
      response.end('ok');
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      await new Promise((resolve, reject) => {
        get({ hostname: '127.0.0.1', port: server.address().port, path: '/', agent: false }, response => {
          response.resume();
          response.on('end', resolve);
          response.on('error', reject);
        }).on('error', reject);
      });
    } finally {
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
    await new Promise((resolve, reject) => logger.flush(error => error ? reject(error) : resolve()));
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', fixture], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    env: { ...process.env, NODE_ENV: 'production', LOG_LEVEL: 'info' },
    encoding: 'utf8',
    timeout: 15_000,
  });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  const records = result.stdout.trim().split('\n').map(line => JSON.parse(line));
  const redacted = records.find(record => record.msg === 'redaction fixture');
  assert.equal(redacted?.req.headers.authorization, '[Redacted]');
  assert.equal(redacted?.req.headers.cookie, '[Redacted]');
  assert.equal(redacted?.res.headers['set-cookie'], '[Redacted]');
  assert.doesNotMatch(result.stdout, /fixture-(?:auth|cookie|session)-secret/);
  const request = records.find(record => record.msg === 'request completed');
  assert.equal(request?.res.statusCode, 200);
});
