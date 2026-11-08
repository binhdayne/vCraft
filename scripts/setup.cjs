const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');

if (Number(process.versions.node.split('.')[0]) < 22) {
  console.error('Setup requires Node.js 22 or newer.');
  process.exitCode = 1;
} else if (fs.existsSync(envPath)) {
  console.log('Existing .env preserved. Check its MongoDB connection and JWT_SECRET before starting.');
} else {
  const example = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
  const contents = example.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${randomBytes(48).toString('hex')}`);
  fs.writeFileSync(envPath, contents, { flag: 'wx', mode: 0o600 });
  console.log('Created .env with a random JWT_SECRET.');
}

if (!process.exitCode) {
  console.log('Next: npm run db:dev (terminal 1), npm run seed, then npm run dev (terminal 2).');
}
