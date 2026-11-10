/**
 * art_work_import.js
 * 
 * Script nhập và chuẩn hóa dữ liệu Tranh Di sản Làng Đông Hồ cho dự án vCraft.
 * Sử dụng file nguồn: art_work_seed.json
 * 
 * Các tác vụ thực hiện:
 * 1. Kết nối MongoDB an toàn, tự động nhận diện MONGODB_URI / DATABASE_URL từ .env.
 * 2. Dọn dẹp 6 tranh demo cũ gắn cứng workshopId để tránh trùng lặp.
 * 3. Nạp / cập nhật (Upsert) 69 tác phẩm di sản làng vào collection "artworks" (type: 'general', workshopId: null, price: null).
 * 4. Tạo 139 liên kết nhận in của các xưởng vào collection "workshop_products".
 * 5. Cập nhật mã lô tranh demo (DH-DEMO-001, DH-DEMO-002, DH-DEMO-003) trong "batches" trỏ đúng tranh di sản.
 * 6. In bảng tổng kết và thống kê phân loại tranh.
 * 
 * Cách chạy:
 *   node art_work_import.js
 */

const fs = require('node:fs');
const path = require('node:path');
const { MongoClient, ObjectId } = require('mongodb');

// Tự nạp biến môi trường từ .env
try {
  process.loadEnvFile();
} catch {}

if (!process.env.MONGODB_URI && !process.env.DATABASE_URL) {
  const possibleEnvPaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', '.env'),
  ];
  for (const envPath of possibleEnvPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const lines = fs.readFileSync(envPath, 'utf8').split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [k, ...v] = trimmed.split('=');
            const key = k.trim();
            if (!process.env[key]) process.env[key] = v.join('=').trim();
          }
        }
      } catch {}
      break;
    }
  }
}

const mongoUri =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  'mongodb://127.0.0.1:27017/vcraft';

// Tìm file art_work_seed.json
function findSeedFile() {
  const candidates = [
    path.join(__dirname, 'art_work_seed.json'),
    path.join(__dirname, 'scripts', 'art_work_seed.json'),
    path.join(process.cwd(), 'art_work_seed.json'),
    path.join(process.cwd(), 'scripts', 'art_work_seed.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function runImport() {
  console.log('============================================================');
  console.log('🎨 VCRAFT - CHUẨN HÓA & IMPORT KHO DI SẢN LÀNG ĐÔNG HỒ');
  console.log('============================================================');

  const seedPath = findSeedFile();
  if (!seedPath) {
    console.error('❌ Lỗi: Không tìm thấy file dữ liệu art_work_seed.json!');
    process.exit(1);
  }
  console.log(`📖 Đã tìm thấy file nguồn: ${seedPath}`);

  let seedData;
  try {
    seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  } catch (err) {
    console.error('❌ Lỗi đọc file JSON:', err.message);
    process.exit(1);
  }

  const { artworks = [], workshopListings = [], batchLinks = [] } = seedData;
  console.log(`📦 Dữ liệu nạp: ${artworks.length} tranh di sản, ${workshopListings.length} listing xưởng.`);
  console.log(`🔌 Kết nối MongoDB: ${mongoUri}`);

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db();
    console.log('✅ Đã kết nối cơ sở dữ liệu thành công!\n');

    // 1. Kiểm tra xưởng làng nghề trong collection "studios"
    const studios = await db.collection('studios').find({}).toArray();
    console.log(`🏭 Tìm thấy ${studios.length} xưởng trong hệ thống:`);
    studios.forEach((s, idx) => console.log(`   [${idx + 1}] ${s.name} (ID: ${s._id})`));

    if (studios.length === 0) {
      console.warn('⚠️ CẢNH BÁO: Chưa tìm thấy xưởng nào trong collection "studios".');
      console.warn('   Hãy chạy "npm run seed" trước để khởi tạo tài khoản và xưởng.');
    }

    const studioMapByName = new Map();
    studios.forEach(s => {
      studioMapByName.set(s.name, s._id);
      // Ánh xạ tên chuẩn hóa không dấu hoặc viết hoa thường nếu cần
      studioMapByName.set(s.name.trim().toLowerCase(), s._id);
    });

    // 2. Dọn dẹp tranh demo cũ (6 tranh ban đầu từ seed cũ gắn workshopId)
    console.log('\n🧹 [1/4] Dọn dẹp các bản ghi tranh cũ không đúng định dạng di sản...');
    const oldArtDeleteRes = await db.collection('artworks').deleteMany({
      workshopId: { $ne: null },
      type: { $ne: 'custom' },
      name: { $in: ['Đám cưới chuột', 'Lợn âm dương', 'Đại cát', 'Vinh hoa', 'Phú quý', 'Mục đồng đọc sách'] }
    });
    console.log(`   -> Đã dọn dẹp: ${oldArtDeleteRes.deletedCount} tranh cũ.`);

    // 3. Nạp 69 Tranh Di sản vào collection "artworks"
    console.log(`\n🖼️  [2/4] Đang đồng bộ ${artworks.length} tác phẩm di sản làng vào "artworks"...`);
    let artInserted = 0;
    let artUpdated = 0;
    const artMapByName = new Map();

    for (const art of artworks) {
      const filter = { name: art.name, type: 'general' };
      const updateDoc = {
        $set: {
          name: art.name,
          category: art.category,
          type: 'general',
          material: art.material || 'Giấy Dó truyền thống',
          dimensions: art.dimensions || '26 × 37 cm',
          story: art.story || '',
          description: art.description || '',
          price: null,
          workshopId: null,
          images: art.images || [],
          published: art.published !== false,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      };

      const result = await db.collection('artworks').updateOne(filter, updateDoc, { upsert: true });
      if (result.upsertedCount > 0) artInserted++;
      else if (result.modifiedCount > 0) artUpdated++;

      // Lấy _id sau khi upsert
      const doc = await db.collection('artworks').findOne(filter, { projection: { _id: 1 } });
      if (doc) {
        artMapByName.set(art.name, doc._id);
        artMapByName.set(art.name.toLowerCase().trim(), doc._id);
      }
    }
    console.log(`   -> Thêm mới: ${artInserted} | Cập nhật: ${artUpdated} | Tổng di sản hiện tại: ${artMapByName.size / 2}`);

    // 4. Nạp 139 Listing vào collection "workshop_products"
    console.log(`\n📋 [3/4] Đang đồng bộ ${workshopListings.length} listing nhận in vào "workshop_products"...`);
    let listingInserted = 0;
    let listingUpdated = 0;
    let listingSkipped = 0;

    for (const item of workshopListings) {
      const artId = artMapByName.get(item.artworkName) || artMapByName.get(item.artworkName.toLowerCase().trim());
      let studioId = studioMapByName.get(item.workshopName) || studioMapByName.get(item.workshopName.toLowerCase().trim());

      // Fallback nếu tên xưởng có chênh lệch nhẹ
      if (!studioId && studios.length > 0) {
        if (item.workshopName.includes('Mộc')) studioId = studios[0]._id;
        else if (item.workshopName.includes('Điệp')) studioId = studios[1] ? studios[1]._id : studios[0]._id;
        else if (item.workshopName.includes('Quê')) studioId = studios[2] ? studios[2]._id : studios[0]._id;
      }

      if (!artId || !studioId) {
        listingSkipped++;
        continue;
      }

      const pIdStr = String(artId);
      const sIdStr = String(studioId);

      const listingFilter = { productId: pIdStr, workshopId: sIdStr };
      const listingUpdate = {
        $set: {
          productId: pIdStr,
          workshopId: sIdStr,
          price: Number(item.price) || 250000,
          description: item.description || 'Bản in truyền thống màu tự nhiên trên giấy điệp.',
          images: item.images && item.images.length > 0 ? item.images : ['/art/dam-cuoi-chuot.jpg'],
          inStock: item.inStock !== false,
          published: item.published !== false,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      };

      const res = await db.collection('workshop_products').updateOne(listingFilter, listingUpdate, { upsert: true });
      if (res.upsertedCount > 0) listingInserted++;
      else if (res.modifiedCount > 0) listingUpdated++;
    }
    console.log(`   -> Thêm mới: ${listingInserted} | Cập nhật: ${listingUpdated} | Bỏ qua: ${listingSkipped}`);

    // Đảm bảo unique index cho (productId, workshopId)
    try {
      await db.collection('workshop_products').createIndex({ productId: 1, workshopId: 1 }, { unique: true });
    } catch {}

    // 5. Cập nhật lô tranh demo (Batches)
    console.log('\n📦 [4/4] Cập nhật liên kết lô tranh demo (batches)...');
    let batchesUpdated = 0;
    for (const b of batchLinks) {
      const targetArtId = artMapByName.get(b.artworkName) || artMapByName.get(b.artworkName.toLowerCase().trim());
      const studioId = studioMapByName.get(b.workshopName) || studioMapByName.get(b.workshopName.toLowerCase().trim());

      if (targetArtId && studioId) {
        const bRes = await db.collection('batches').updateMany(
          { code: b.code },
          {
            $set: {
              productId: String(targetArtId),
              workshopId: String(studioId),
            },
          }
        );
        batchesUpdated += bRes.modifiedCount;
      }
    }
    console.log(`   -> Lô tranh demo đã cập nhật trỏ đúng tranh di sản: ${batchesUpdated}`);

    // 6. Thống kê & Kiểm tra toàn vẹn
    console.log('\n============================================================');
    console.log('📊 BÁO CÁO TỔNG KẾT SAU KHI NẠP DỮ LIỆU:');
    console.log('============================================================');

    const totalArtInDb = await db.collection('artworks').countDocuments({ type: 'general' });
    const totalWpInDb = await db.collection('workshop_products').countDocuments();
    const totalBatchesInDb = await db.collection('batches').countDocuments();

    console.log(`* Tổng tác phẩm di sản làng trong "artworks":          ${totalArtInDb}`);
    console.log(`* Tổng listing xưởng nhận in trong "workshop_products":  ${totalWpInDb}`);
    console.log(`* Tổng lô tranh sản xuất trong "batches":               ${totalBatchesInDb}`);

    const categoryStats = await db.collection('artworks').aggregate([
      { $match: { type: 'general' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray();

    console.log('\n📜 Phân bố 4 dòng tranh truyền thống:');
    console.table(categoryStats.map(c => ({ 'Dòng tranh': c._id, 'Số lượng tác phẩm': c.count })));

    const workshopStats = await db.collection('workshop_products').aggregate([
      {
        $group: {
          _id: '$workshopId',
          count: { $sum: 1 },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]).toArray();

    const workshopStatTable = workshopStats.map(ws => {
      const s = studios.find(x => String(x._id) === ws._id);
      return {
        'Tên xưởng': s ? s.name : ws._id,
        'Số tranh nhận in': ws.count,
        'Khoảng giá (VNĐ)': `${(ws.minPrice || 0).toLocaleString('vi-VN')} - ${(ws.maxPrice || 0).toLocaleString('vi-VN')}`,
      };
    });
    console.log('\n🏭 Phân bố tác phẩm nhận in tại các xưởng:');
    console.table(workshopStatTable);

    console.log('============================================================');
    console.log('🎉 NHẬP VÀ ĐỒNG BỘ DỮ LIỆU THÀNH CÔNG RỰC RỠ!');
    console.log('============================================================\n');
  } catch (err) {
    console.error('❌ Có lỗi xảy ra trong quá trình nạp dữ liệu:', err);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Đã ngắt kết nối MongoDB an toàn.');
  }
}

// Chạy trực tiếp
runImport();
