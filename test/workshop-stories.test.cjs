const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const fs = require('node:fs/promises');
const path = require('node:path');
const { MongoClient, ObjectId } = require('mongodb');
const { workshopBooks, serializeWorkshopBook } = require('../scripts/data/workshop-stories.cjs');
const execFileAsync = promisify(execFile), root = path.resolve(__dirname, '..');

test('workshop book pagination preserves complete prose and recognizes plain stories without interpreting HTML', async () => {
  const { parseWorkshopStory, buildStoryPages, getWorkshopStoryExcerpt } = await import('../frontend/src/workshops/story-book.mjs');
  for (const entry of workshopBooks) {
    const source = serializeWorkshopBook(entry), book = parseWorkshopStory(source, entry.name);
    assert.ok(source.length > 7500 && source.length <= 10000);
    assert.equal(book.title, entry.title); assert.equal(book.fictional, true);
    assert.equal(book.chapters.length, 8);
    assert.equal(getWorkshopStoryExcerpt(source), entry.introduction);
    assert.ok(getWorkshopStoryExcerpt(source, 115).length <= 116);
    assert.deepEqual(book.chapters.flatMap(chapter => chapter.paragraphs), entry.chapters.flatMap(chapter => chapter.paragraphs));
    for (const size of [480, 720]) {
      const { pages, chapters } = buildStoryPages(book, size);
      assert.equal(chapters.length, 8);
      assert.ok(chapters.every(chapter => pages[chapter.page].chapterIndex === chapter.index));
      const flattened = pages.filter(page => page.type === 'chapter').flatMap(page => page.paragraphs).join(' ').replace(/\s+/g, ' ');
      assert.equal(flattened, entry.chapters.flatMap(chapter => chapter.paragraphs).join(' ').replace(/\s+/g, ' '));
      assert.ok(pages.filter(page => page.type === 'chapter').every(page => page.paragraphs.join('\n\n').length <= size));
    }
  }
  const literal = 'Một câu chuyện của xưởng.\n\n<script>alert(1)</script>';
  const plain = parseWorkshopStory(literal, 'Xưởng thật');
  assert.equal(getWorkshopStoryExcerpt(literal), literal);
  assert.equal(plain.fictional, false); assert.equal(plain.chapters.length, 1);
  assert.deepEqual(plain.chapters[0].paragraphs, ['Một câu chuyện của xưởng.', '<script>alert(1)</script>']);
  const long = 'Một đoạn rất dài cần chia trang. '.repeat(400);
  const longPages = buildStoryPages(parseWorkshopStory(long), 480).pages.filter(page => page.type === 'chapter');
  assert.equal(longPages.flatMap(page => page.paragraphs).join(' ').replace(/\s+/g, ' ').trim(), long.trim());
});

test('story import only updates the three demo workshops, backs up edits, preserves custom data and is idempotent', { timeout: 30000 }, async () => {
  const name = 'vcraft_test_stories_' + Date.now(), uri = 'mongodb://127.0.0.1:27017/' + name;
  const client = await new MongoClient(uri).connect(), db = client.db();
  const backups = new Set();
  const run = async (args = [], environment = 'test') => {
    const result = await execFileAsync(process.execPath, ['scripts/seed-workshop-stories.cjs', ...args], { cwd: root, env: { ...process.env, NODE_ENV: environment, MONGODB_URI: uri }, windowsHide: true });
    const backup = result.stdout.match(/Previous stories saved to (.+)/)?.[1]?.trim();
    if (backup) backups.add(path.resolve(root, backup));
    return result;
  };
  try {
    const ids = [];
    for (let i = 0; i < workshopBooks.length; i++) {
      const entry = workshopBooks[i], ownerId = new ObjectId(), studioId = new ObjectId(); ids.push(studioId);
      await db.collection('accounts').insertOne({ _id: ownerId, email: entry.ownerEmail, role: 'artisan' });
      await db.collection('studios').insertOne({ _id: studioId, ownerId: String(ownerId), name: entry.name, story: i === 2 ? 'Câu chuyện do chủ xưởng tự viết.' : 'Hồ sơ minh họa cho đồ án vCraft. Truyện cũ.', images: ['/uploads/my-cover.webp'], certificates: ['/art/dai-cat.jpg'], approved: true, latitude: 21, longitude: 106 });
    }
    const other = await db.collection('studios').insertOne({ name: 'Xưởng khác', story: 'Giữ nguyên', images: [] });
    const original = await db.collection('studios').find().toArray();
    await run(['--dry-run']); assert.deepEqual(await db.collection('studios').find().toArray(), original);
    await run();
    let data = await db.collection('studios').find().toArray();
    assert.equal(data.find(s => s._id.equals(ids[0])).story, serializeWorkshopBook(workshopBooks[0]));
    assert.equal(data.find(s => s._id.equals(ids[2])).story, original[2].story);
    assert.equal(backups.size, 1);
    const backup = JSON.parse(await fs.readFile([...backups][0])); assert.equal(backup.workshops.length, 2);
    assert.ok(backup.workshops.every(s => s.story.startsWith('Hồ sơ minh họa')));
    await db.collection('studios').updateOne({ _id: ids[0] }, { $set: { story: 'Chủ xưởng sửa sau khi nạp.' } });
    await run(); assert.equal((await db.collection('studios').findOne({ _id: ids[0] })).story, 'Chủ xưởng sửa sau khi nạp.');
    await run(['--replace']);
    data = await db.collection('studios').find().toArray();
    for (let i = 0; i < 3; i++) {
      const saved = data.find(s => s._id.equals(ids[i]));
      assert.equal(saved.story, serializeWorkshopBook(workshopBooks[i]));
      const { story, updatedAt, ...rest } = saved, { story: oldStory, ...oldRest } = original[i];
      assert.deepEqual(rest, oldRest);
    }
    assert.deepEqual(await db.collection('studios').findOne({ _id: other.insertedId }), original[3]);
    await run(['--replace']); assert.deepEqual(await db.collection('studios').find().toArray(), data);
    await assert.rejects(run(['--replace'], 'production'), error => error.code === 1 && /disabled in production/.test(error.stderr));
    assert.deepEqual(await db.collection('studios').find().toArray(), data);
  } finally {
    assert.match(db.databaseName, /^vcraft_test_stories_\d+$/); await db.dropDatabase(); await client.close();
    for (const file of backups) {
      assert.equal(path.dirname(file), path.join(root, '.local/backups'));
      await fs.unlink(file);
    }
  }
});
