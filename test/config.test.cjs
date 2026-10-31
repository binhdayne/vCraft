const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateEnvironment } = require('../dist/config');
test('defaults connect to local MongoDB and bind loopback', () => {
  const config = validateEnvironment({JWT_SECRET:'a'.repeat(48)});
  assert.equal(config.PORT, 3000);
  assert.equal(config.HOST, '127.0.0.1');
  assert.equal(config.MONGODB_URI, 'mongodb://127.0.0.1:27017/vcraft');
});
test('invalid ports and database schemes fail early', () => {
  for (const PORT of ['abc', 0, 65536, 1.5]) assert.throws(() => validateEnvironment({ PORT, JWT_SECRET:'a'.repeat(48) }));
  assert.throws(() => validateEnvironment({ MONGODB_URI: 'https://localhost' }));
});

test('rejects missing authentication secret',()=>assert.throws(()=>validateEnvironment({})));
