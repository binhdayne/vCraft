const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');
const mongoose = require('mongoose');

const root = path.resolve(__dirname, '..');
const children = new Set();
let stopping = false;

async function stop(code) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  await Promise.all([...children].map(child => new Promise(resolve => {
    if (!child.pid) return resolve();
    if (process.platform === 'win32') {
      // Nest watch starts another Node process; stop the whole owned process tree.
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
        stdio: 'ignore', windowsHide: true,
      });
      killer.once('error', resolve);
      killer.once('exit', resolve);
    } else {
      try { process.kill(-child.pid, 'SIGTERM'); } catch { return resolve(); }
      const timer = setTimeout(() => {
        try { process.kill(-child.pid, 'SIGKILL'); } catch {}
        resolve();
      }, 3000);
      child.once('exit', () => { clearTimeout(timer); resolve(); });
    }
  })));
}

function start(name, entry, args) {
  const child = spawn(process.execPath, [path.join(root, entry), ...args], {
    cwd: root,
    stdio: ['ignore', 'inherit', 'inherit'],
    detached: process.platform !== 'win32',
    windowsHide: true,
  });
  children.add(child);
  child.once('error', error => {
    console.error(`${name} failed: ${error.message}`);
    void stop(1);
  });
  child.once('exit', (code, signal) => {
    if (!stopping) {
      console.error(`${name} stopped (${signal || code}); stopping the other service.`);
      void stop(code || 1);
    }
  });
}

function checkPort(port, host) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', error => reject(new Error(
      `Cannot use ${host}:${port} (${error.code}). Stop the existing service or change the configuration.`,
    )));
    server.listen(port, host, () => server.close(resolve));
  });
}

async function main() {
  if (!fs.existsSync(path.join(root, '.env'))) {
    throw new Error('Missing .env. Run npm run setup first.');
  }
  process.loadEnvFile(path.join(root, '.env'));
  if (process.env.NODE_ENV === 'production') throw new Error('The dev command is for development only.');
  if ((process.env.JWT_SECRET || '').length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.');
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT in .env.');
  await checkPort(port, process.env.HOST || '127.0.0.1');
  await checkPort(5173, '127.0.0.1');
  const connection = mongoose.createConnection(
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vcraft',
    { serverSelectionTimeoutMS: 5000 },
  );
  try {
    await connection.asPromise();
    await connection.db.admin().ping();
  } catch {
    throw new Error('Cannot connect to MongoDB. Start npm run db:dev in another terminal, or check MONGODB_URI in .env.');
  } finally {
    await connection.close();
  }
  if (stopping) return;
  console.log(`Starting API on port ${port} and web at http://localhost:5173. Press Ctrl+C to stop both.`);
  start('API', 'node_modules/@nestjs/cli/bin/nest.js', ['start', '--watch']);
  start('Web', 'node_modules/vite/bin/vite.js', ['--config', 'frontend/vite.config.mjs', '--configLoader', 'native']);
}

process.once('SIGINT', () => { void stop(0); });
process.once('SIGTERM', () => { void stop(0); });
main().catch(error => {
  console.error(`Development startup failed: ${error.message}`);
  void stop(1);
});
