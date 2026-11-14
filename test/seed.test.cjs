require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const path = require('node:path');
const mongoose = require('mongoose');
const { compare } = require('bcryptjs');
const { createDatabase } = require('../scripts/database.cjs');

const execFileAsync = promisify(execFile);
const root = path.resolve(__dirname, '..');

test('demo seed creates related data, preserves edits on rerun and refuses production', { timeout: 30000 }, async () => {
  const databaseName = `vcraft_test_seed_${Date.now()}`;
  const uri = `mongodb://127.0.0.1:27017/${databaseName}`;
  const connection = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 }).asPromise();
  const db = createDatabase(connection);
  const runSeed = (environment = 'test') => execFileAsync(process.execPath, ['scripts/seed.cjs'], {
    cwd: root,
    env: { ...process.env, NODE_ENV: environment, MONGODB_URI: uri },
    windowsHide: true,
  });
  const counts = async () => Object.fromEntries(await Promise.all(
    Object.entries(db).map(async ([name, model]) => [name, await model.countDocuments()]),
  ));

  try {
    await runSeed();
    const expected = { users: 5, workshops: 3, products: 6, workshopProducts: 0, batches: 3, quotes: 1, news: 3 };
    assert.deepEqual(await counts(), expected);
    const buyer = await db.users.findOne({ email: 'buyer@vcraft.local' }).select('+passwordHash');
    assert.equal(buyer.role, 'buyer');
    assert.equal(await compare('DongHo@2026!', buyer.passwordHash), true);
    assert.equal(await db.workshops.countDocuments({ approved: true }), 3);
    const batches = await db.batches.find();
    assert.ok(batches.every(batch => batch.events.length === 4));
    for (const batch of batches) {
      assert.ok(await db.products.exists({ _id: batch.productId, workshopId: batch.workshopId }));
    }
    const quote = await db.quotes.findOne();
    assert.equal(quote.buyerId, String(buyer._id));
    assert.equal(quote.quantity, 200);
    assert.equal(quote.bids.length, 2);

    await db.users.updateOne({ _id: buyer._id }, { $set: { active: false, name: 'Changed locally' } });
    await db.quotes.updateOne({ _id: quote._id }, { $set: { status: 'delivered', version: 7 } });
    await runSeed();
    assert.deepEqual(await counts(), expected);
    const unchangedBuyer = await db.users.findById(buyer._id).select('+passwordHash');
    assert.equal(unchangedBuyer.active, false);
    assert.equal(unchangedBuyer.name, 'Changed locally');
    assert.equal(unchangedBuyer.passwordHash, buyer.passwordHash);
    const unchangedQuote = await db.quotes.findById(quote._id);
    assert.equal(unchangedQuote.status, 'delivered');
    assert.equal(unchangedQuote.version, 7);

    await assert.rejects(runSeed('production'), error => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /Demo seed is disabled in production/);
      return true;
    });
    assert.deepEqual(await counts(), expected);
  } finally {
    assert.match(connection.name, /^vcraft_test_seed_\d+$/);
    await connection.dropDatabase();
    await connection.close();
  }
});
