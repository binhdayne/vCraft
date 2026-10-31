// Real MongoDB binary with persistent local data. Development only.
const path = require('node:path');
const fs = require('node:fs');
process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(__dirname, '../.local/mongodb-binaries');
const { MongoMemoryServer } = require('mongodb-memory-server');
async function main() {
  const dbPath = path.resolve(__dirname, '../.local/mongodb-data');
  fs.mkdirSync(dbPath, { recursive: true });
  const mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1', port: 27017, dbPath, storageEngine: 'wiredTiger' } });
  console.log(`MongoDB ready: ${mongo.getUri('vcraft')}`);
  const stop = async () => { await mongo.stop({ doCleanup: false }); process.exit(0); };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}
main().catch(error => { console.error(error); process.exit(1); });
