const { MongoClient } = require('mongodb');
const fs = require('node:fs/promises');
const path = require('node:path');
const { workshopBooks, serializeWorkshopBook } = require('./data/workshop-stories.cjs');

async function seedWorkshopStories() {
  try { process.loadEnvFile(path.resolve(__dirname, '../.env')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (process.env.NODE_ENV === 'production') throw new Error('Demo workshop stories are disabled in production');
  const options = process.argv.slice(2);
  if (options.some(option => !['--replace', '--dry-run'].includes(option))) throw new Error('Options: --dry-run, --replace');
  const replace = options.includes('--replace'), dryRun = options.includes('--dry-run');
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vcraft', { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  try {
    const db = client.db(), changes = [], summary = [];
    for (const book of workshopBooks) {
      const story = serializeWorkshopBook(book);
      if (story.length > 10000 || book.chapters.length !== 8) throw new Error('Invalid demo book: ' + book.name);
      const owner = await db.collection('accounts').findOne({ email: book.ownerEmail, role: 'artisan' }, { projection: { _id: 1 } });
      const studio = owner && await db.collection('studios').findOne({ ownerId: String(owner._id), name: book.name });
      if (!studio) throw new Error('Missing expected demo workshop: ' + book.name + '. Run npm run seed first.');
      const isOriginalDemo = /^Hồ sơ minh họa cho đồ án vCraft\./.test(studio.story || '');
      const same = studio.story === story;
      const status = same ? 'unchanged' : !replace && studio.story && !isOriginalDemo ? 'preserved (custom story)' : 'update';
      summary.push({ name: book.name, id: String(studio._id), chapters: book.chapters.length, characters: story.length, status });
      if (status === 'update') changes.push({ studio, story });
    }
    // Preflight all three workshops before writing anything; keep the previous stories.
    if (changes.length && !dryRun) {
      const backupDir = path.resolve(__dirname, '../.local/backups');
      await fs.mkdir(backupDir, { recursive: true });
      const backupPath = path.join(backupDir, `workshop-stories-${Date.now()}.json`);
      await fs.writeFile(backupPath, JSON.stringify({ database: db.databaseName, createdAt: new Date().toISOString(), workshops: changes.map(({ studio }) => ({ _id: String(studio._id), name: studio.name, story: studio.story || '', updatedAt: studio.updatedAt })) }, null, 2));
      console.log('Previous stories saved to ' + path.relative(process.cwd(), backupPath));
      for (const { studio, story } of changes) {
        const result = await db.collection('studios').updateOne({ _id: studio._id, story: studio.story }, { $set: { story, updatedAt: new Date() } });
        if (result.matchedCount !== 1) throw new Error('Workshop story changed during import: ' + studio.name);
      }
    }
    console.log(JSON.stringify({ dryRun, updated: dryRun ? 0 : changes.length, workshops: summary }, null, 2));
  } finally { await client.close(); }
}

if (require.main === module) seedWorkshopStories().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { seedWorkshopStories };
