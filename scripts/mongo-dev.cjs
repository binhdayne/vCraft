// Real MongoDB binary with persistent local data. Development only.
const path = require('node:path');
const fs = require('node:fs');
const net = require('node:net');
process.env.MONGOMS_DOWNLOAD_DIR ||= path.resolve(__dirname, '../.local/mongodb-binaries');
const { MongoMemoryServer } = require('mongodb-memory-server');
async function main() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) process.loadEnvFile(envPath);
  if (process.env.NODE_ENV === 'production') throw new Error('Local MongoDB is for development only');
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', error => reject(new Error(`Port 27017 is unavailable (${error.code}). If MongoDB is already running, use it and skip db:dev.`)));
    server.listen(27017, '127.0.0.1', () => server.close(resolve));
  });
  const dbPath = path.resolve(__dirname, '../.local/mongodb-data');
  fs.mkdirSync(dbPath, { recursive: true });
  const mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1', port: 27017, portGeneration: false, dbPath, storageEngine: 'wiredTiger' } });
  console.log(`MongoDB ready: ${mongo.getUri('vcraft')}`);
  const stop = async () => { await mongo.stop({ doCleanup: false }); process.exit(0); };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}
main().catch(error => { console.error('MongoDB startup failed:', error.message); process.exit(1); });
