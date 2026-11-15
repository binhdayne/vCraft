require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { NestFactory } = require('@nestjs/core');
const { getConnectionToken } = require('@nestjs/mongoose');

process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/vcraft_test_cart_' + Date.now();
process.env.JWT_SECRET = 'test-secret-only-'.repeat(4);
process.env.NODE_ENV = 'test';

const { AppModule } = require('../dist/app.module');
const { createDatabase } = require('../scripts/database.cjs');

test('Cart Module API - Comprehensive Test Suite', async t => {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1');
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const conn = app.get(getConnectionToken());
  const db = createDatabase(conn);

  async function req(url, method = 'GET', body, token) {
    const r = await fetch(base + '/api/v1' + url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: r.status, data: await r.json().catch(() => null) };
  }

  let buyerToken;
  let artisanToken;
  let generalArtworkId;
  let customArtworkId;
  let workshopId;

  try {
    await db.users.init();
    await db.workshops.init();
    await db.products.init();
    await db.carts.init();

    // 1. Setup accounts, workshop, artworks
    await t.test('setup initial data', async () => {
      // Register Buyer
      const regBuyer = await req('/auth/register', 'POST', {
        name: 'Khách Hàng Mua Tranh',
        email: 'buyer_cart@test.local',
        password: 'Password123!',
      });
      assert.equal(regBuyer.status, 201);
      buyerToken = regBuyer.data.token;

      // Register Artisan
      const regArtisan = await req('/auth/register', 'POST', {
        name: 'Nghệ Nhân Đông Hồ',
        email: 'artisan_cart@test.local',
        password: 'Password123!',
      });
      assert.equal(regArtisan.status, 201);
      await db.users.updateOne({ email: 'artisan_cart@test.local' }, { role: 'artisan' });
      artisanToken = regArtisan.data.token;

      // Create Workshop
      const ws = await db.workshops.create({
        ownerId: regArtisan.data.id || 'owner123',
        name: 'Xưởng Tranh Dân Gian Thuận Thành',
        story: 'Làng tranh Đông Hồ cổ truyền',
        approved: true,
      });
      workshopId = String(ws._id);

      // Create General Artwork
      const artGeneral = await db.products.create({
        name: 'Hội Đu',
        category: 'Sinh hoạt',
        type: 'general',
        price: 150000,
        dimensions: '26 × 37 cm',
        images: ['/art/tranh-dong-ho-hoi-du-26x37cm.jpg'],
        published: true,
      });
      generalArtworkId = String(artGeneral._id);

      // Create Custom Artwork
      const artCustom = await db.products.create({
        name: 'Vinh Hoa Phú Quý (Bản phục chế ván cổ)',
        category: 'Chúc tụng',
        type: 'custom',
        workshopId: workshopId,
        price: 350000,
        dimensions: '37 × 52 cm',
        images: ['/art/vinh-hoa-phu-quy.jpg'],
        published: true,
      });
      customArtworkId = String(artCustom._id);

      assert.ok(generalArtworkId);
      assert.ok(customArtworkId);
    });

    // 2. Initial Empty Cart
    await t.test('GET /cart on new buyer returns empty cart', async () => {
      const res = await req('/cart', 'GET', undefined, buyerToken);
      assert.equal(res.status, 200);
      assert.equal(res.data.items.length, 0);
      assert.equal(res.data.totalItems, 0);
      assert.equal(res.data.totalQuantity, 0);
      assert.equal(res.data.hasCustomArtwork, false);
    });

    // 3. Add General Artwork to Cart
    await t.test('POST /cart/items adds general artwork with default quantity', async () => {
      const res = await req('/cart/items', 'POST', {
        productId: generalArtworkId,
        quantity: 10,
        note: 'Bồi giấy điệp 3 lớp',
      }, buyerToken);

      assert.equal(res.status, 201);
      assert.equal(res.data.items.length, 1);
      assert.equal(res.data.totalItems, 1);
      assert.equal(res.data.totalQuantity, 10);
      assert.equal(res.data.selectedQuantity, 10);
      assert.equal(res.data.hasCustomArtwork, false);

      const item = res.data.items[0];
      assert.equal(item.productId, generalArtworkId);
      assert.equal(item.artworkName, 'Hội Đu');
      assert.equal(item.type, 'general');
      assert.equal(item.quantity, 10);
      assert.equal(item.note, 'Bồi giấy điệp 3 lớp');
      assert.equal(item.selected, true);
    });

    // 4. Add Same Artwork Again -> Quantity Accumulation
    await t.test('POST /cart/items with same artwork accumulates quantity', async () => {
      const res = await req('/cart/items', 'POST', {
        productId: generalArtworkId,
        quantity: 5,
        note: 'Cập nhật ghi chú mới',
      }, buyerToken);

      assert.equal(res.status, 201);
      assert.equal(res.data.items.length, 1);
      assert.equal(res.data.totalItems, 1);
      assert.equal(res.data.totalQuantity, 15);
      assert.equal(res.data.items[0].quantity, 15);
      assert.equal(res.data.items[0].note, 'Cập nhật ghi chú mới');
    });

    // 5. Add Custom Artwork -> hasCustomArtwork & targetWorkshopId detected
    await t.test('POST /cart/items adds custom artwork and reflects custom flags', async () => {
      const res = await req('/cart/items', 'POST', {
        productId: customArtworkId,
        quantity: 20,
        note: 'Khung gỗ hương mộc lót kính',
      }, buyerToken);

      assert.equal(res.status, 201);
      assert.equal(res.data.items.length, 2);
      assert.equal(res.data.totalItems, 2);
      assert.equal(res.data.totalQuantity, 35); // 15 + 20
      assert.equal(res.data.hasCustomArtwork, true);
      assert.equal(res.data.targetWorkshopId, workshopId);

      const customItem = res.data.items.find(i => i.productId === customArtworkId);
      assert.ok(customItem);
      assert.equal(customItem.type, 'custom');
      assert.equal(customItem.workshopId, workshopId);
      assert.equal(customItem.workshopName, 'Xưởng Tranh Dân Gian Thuận Thành');
    });

    // 6. Update Cart Item (Quantity, Note, Selected checkbox)
    await t.test('PATCH /cart/items/:productId updates item attributes', async () => {
      const res = await req(`/cart/items/${generalArtworkId}`, 'PATCH', {
        quantity: 12,
        selected: false,
        note: 'Tạm thời chưa đặt bức này',
      }, buyerToken);

      assert.equal(res.status, 200);
      assert.equal(res.data.totalQuantity, 32); // 12 + 20
      assert.equal(res.data.selectedItems, 1); // Only custom artwork is selected
      assert.equal(res.data.selectedQuantity, 20);

      const genItem = res.data.items.find(i => i.productId === generalArtworkId);
      assert.equal(genItem.quantity, 12);
      assert.equal(genItem.selected, false);
      assert.equal(genItem.note, 'Tạm thời chưa đặt bức này');
    });

    // 7. Validation: Invalid Quantity & Non-existent Product
    await t.test('Validation errors for invalid input', async () => {
      // Quantity < 1
      const res1 = await req('/cart/items', 'POST', {
        productId: generalArtworkId,
        quantity: 0,
      }, buyerToken);
      assert.equal(res1.status, 400);

      // Non-existent product ID
      const fakeId = '507f1f77bcf86cd799439011';
      const res2 = await req('/cart/items', 'POST', {
        productId: fakeId,
        quantity: 5,
      }, buyerToken);
      assert.equal(res2.status, 404);
    });

    // 8. Authorization check: Non-buyer cannot use cart
    await t.test('Authorization check: artisan and guest cannot use buyer cart', async () => {
      const resArtisan = await req('/cart', 'GET', undefined, artisanToken);
      assert.equal(resArtisan.status, 403);

      const resGuest = await req('/cart', 'GET');
      assert.equal(resGuest.status, 401);
    });

    // 9. Clear only selected items
    await t.test('POST /cart/clear with onlySelected: true removes only checked items', async () => {
      // Currently custom artwork is selected (true), general artwork is selected (false)
      const res = await req('/cart/clear', 'POST', { onlySelected: true }, buyerToken);
      assert.equal(res.status, 201);
      assert.equal(res.data.items.length, 1);
      assert.equal(res.data.items[0].productId, generalArtworkId);
      assert.equal(res.data.totalItems, 1);
      assert.equal(res.data.hasCustomArtwork, false);
    });

    // 10. Delete specific item
    await t.test('DELETE /cart/items/:productId removes remaining item', async () => {
      const res = await req(`/cart/items/${generalArtworkId}`, 'DELETE', undefined, buyerToken);
      assert.equal(res.status, 200);
      assert.equal(res.data.items.length, 0);
      assert.equal(res.data.totalItems, 0);
      assert.equal(res.data.totalQuantity, 0);
    });

  } finally {
    await conn.dropDatabase().catch(() => {});
    await app.close();
  }
});
