/**
 * artwork_seed.js
 * 
 * Script chuẩn hóa & nạp dữ liệu tranh Đông Hồ vào MongoDB:
 * 1. Upsert 85 tác phẩm di sản làng vào collection "artworks" (type: 'general', workshopId: null, price: null).
 * 2. Tự động chuyển đổi 6 tranh demo cũ thành listing trong collection "workshop_products" cho 3 xưởng demo.
 * 3. Cập nhật trường productId của 3 lô sản xuất demo (DH-DEMO-001, 002, 003) trỏ sang tranh di sản chuẩn.
 * 4. Dọn dẹp tranh cũ trùng lặp để danh mục Master Catalog đạt chuẩn 85 tranh di sản duy nhất.
 * 
 * Chạy lệnh: node scripts/artwork_seed.js
 */

const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');

// Tự động nạp file .env nếu có
try {
  process.loadEnvFile();
} catch {}

if (!process.env.MONGODB_URI) {
  const envPath = path.join(__dirname, '..', '.env');
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
  }
}

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vcraft';
const readyDataFile = path.join(__dirname, 'artworks_ready.json');
const rawDataFile = path.join(__dirname, 'artworks.json');

// Bảng ánh xạ 6 tranh demo cũ -> 6 tranh di sản chuẩn mới
const MIGRATION_MAPPING = [
  {
    oldName: 'Đám cưới chuột',
    targetName: 'Đám Cưới Chuột',
    studioIndex: 0,
    defaultPrice: 280000,
    defaultImage: '/art/tranh-dong-ho-dam-cuoi-chuot-26x37.jpg',
    batchCode: 'DH-DEMO-001',
  },
  {
    oldName: 'Lợn âm dương',
    targetName: 'Đàn Lợn Âm Dương',
    studioIndex: 1,
    defaultPrice: 220000,
    defaultImage: '/art/tranh-dong-ho-dan-lon-am-duong-26x37cm.jpg',
    batchCode: 'DH-DEMO-002',
  },
  {
    oldName: 'Đại cát',
    targetName: 'Gà Đại Cát',
    studioIndex: 2,
    defaultPrice: 190000,
    defaultImage: '/art/tranh-giay-dong-ho-ga-dai-cat-26x37.jpg',
    batchCode: 'DH-DEMO-003',
  },
  {
    oldName: 'Vinh hoa',
    targetName: 'Vinh Hoa Em Bé Ôm Gà',
    studioIndex: 0,
    defaultPrice: 240000,
    defaultImage: '/art/tranh-giay-dong-ho-vinh-hoa-em-be-om-ga-26x37.jpg',
  },
  {
    oldName: 'Phú quý',
    targetName: 'Phú Quý Em Bé Ôm Vịt',
    studioIndex: 1,
    defaultPrice: 240000,
    defaultImage: '/art/tranh-giay-dong-ho-phu-quy-em-be-om-vit-26x37.jpg',
  },
  {
    oldName: 'Mục đồng đọc sách',
    targetName: 'Hiếu Học Chăn Trâu Đọc Sách',
    studioIndex: 2,
    defaultPrice: 260000,
    defaultImage: '/art/tranh-giay-dong-ho-hieu-hoc-chan-trau-doc-sach-26x37.jpg',
  },
];

async function ensureDataFile() {
  if (!fs.existsSync(readyDataFile)) {
    if (fs.existsSync(rawDataFile)) {
      console.log('🔄 Đang tự động chạy clean-artworks để tạo artworks_ready.json...');
      require('./clean-artworks.cjs');
    } else {
      console.error(`❌ Không tìm thấy file dữ liệu: ${readyDataFile} hoặc ${rawDataFile}`);
      process.exit(1);
    }
  }
}

async function runSeed() {
  await ensureDataFile();

  const raw = fs.readFileSync(readyDataFile, 'utf8');
  const artworks = JSON.parse(raw);
  console.log(`\n============================================================`);
  console.log(`📦 Bắt đầu quy trình nạp & di chuyển dữ liệu Tranh Đông Hồ`);
  console.log(`📖 Đọc được ${artworks.length} tác phẩm chuẩn từ artworks_ready.json`);
  console.log(`🔌 Kết nối MongoDB: ${mongoUri}`);
  console.log(`============================================================\n`);

  const conn = await mongoose.createConnection(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  }).asPromise();

  try {
    console.log('✅ Kết nối MongoDB thành công!\n');

    // 1. Khởi tạo Schemas Mongoose tương thích với hệ thống
    const artworkSchema = new mongoose.Schema(
      {
        name: { type: String, required: true, index: true },
        category: { type: String, required: true, index: true },
        type: { type: String, enum: ['general', 'custom'], default: 'general', index: true },
        material: { type: String, default: 'Giấy Dó truyền thống' },
        dimensions: String,
        story: { type: String, default: '' },
        description: { type: String, default: '' },
        price: { type: Number, default: null },
        images: [String],
        workshopId: { type: String, default: null, index: true },
        published: { type: Boolean, default: true, index: true },
      },
      { timestamps: true, strict: false }
    );

    const workshopProductSchema = new mongoose.Schema(
      {
        productId: { type: String, required: true, index: true },
        workshopId: { type: String, required: true, index: true },
        price: { type: Number, required: true, min: 0 },
        description: { type: String, default: '' },
        images: { type: [String], default: [] },
        inStock: { type: Boolean, default: true },
        published: { type: Boolean, default: true, index: true },
      },
      { timestamps: true, strict: false }
    );
    workshopProductSchema.index({ productId: 1, workshopId: 1 }, { unique: true });

    const batchSchema = new mongoose.Schema(
      {
        code: String,
        productId: String,
        workshopId: String,
      },
      { timestamps: true, strict: false }
    );

    const studioSchema = new mongoose.Schema(
      {
        name: String,
        ownerId: String,
        approved: Boolean,
      },
      { timestamps: true, strict: false }
    );

    const Artwork = conn.model('Artwork', artworkSchema, 'artworks');
    const WorkshopProduct = conn.model('WorkshopProduct', workshopProductSchema, 'workshop_products');
    const Batch = conn.model('Batch', batchSchema, 'batches');
    const Studio = conn.model('Studio', studioSchema, 'studios');

    // 2. Bước 1: Nạp 85 tranh di sản vào collection "artworks"
    console.log(`🚀 [Bước 1/3] Đang nạp ${artworks.length} tranh di sản vào "artworks"...`);
    let inserted = 0;
    let updated = 0;

    for (const art of artworks) {
      const res = await Artwork.updateOne(
        { name: art.name, type: 'general' },
        {
          $set: {
            name: art.name,
            category: art.category,
            type: 'general',
            material: art.material || 'Giấy Dó truyền thống',
            dimensions: art.dimensions,
            story: art.story || '',
            description: art.description || '',
            price: null,
            workshopId: null,
            images: art.images,
            published: true,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      if (res.upsertedCount > 0) inserted++;
      else updated++;
    }
    console.log(`   -> Tạo mới: ${inserted} | Cập nhật: ${updated}`);

    // 3. Bước 2: Di chuyển 6 tranh cũ sang "workshop_products" & cập nhật "batches"
    console.log(`\n🔄 [Bước 2/3] Đang chuyển đổi 6 tranh cũ thành Listing xưởng và liên kết Batches...`);
    const studios = await Studio.find().sort({ _id: 1 }).lean();
    let migratedListings = 0;
    let updatedBatches = 0;
    let deletedOldArtworks = 0;

    for (const mapItem of MIGRATION_MAPPING) {
      // Tìm tranh di sản chuẩn tương ứng
      const targetArt = await Artwork.findOne({ name: mapItem.targetName, type: 'general' });
      if (!targetArt) {
        console.warn(`⚠️ Không tìm thấy tranh di sản mục tiêu: "${mapItem.targetName}"`);
        continue;
      }

      // Tìm tranh cũ (nếu còn tồn tại trong DB với workshopId)
      const oldArt = await Artwork.findOne({
        name: mapItem.oldName,
        workshopId: { $ne: null },
      });

      // Xác định xưởng nhận in
      let workshopId = oldArt ? String(oldArt.workshopId) : null;
      if (!workshopId && studios.length > mapItem.studioIndex) {
        workshopId = String(studios[mapItem.studioIndex]._id);
      }

      if (workshopId) {
        const listingPrice = oldArt?.price || mapItem.defaultPrice;
        const listingDesc = oldArt?.description || 'Bản in truyền thống màu tự nhiên trên giấy điệp.';
        const listingImages = oldArt?.images?.length ? oldArt.images : [mapItem.defaultImage];

        await WorkshopProduct.updateOne(
          { productId: String(targetArt._id), workshopId },
          {
            $set: {
              productId: String(targetArt._id),
              workshopId,
              price: listingPrice,
              description: listingDesc,
              images: listingImages,
              inStock: true,
              published: true,
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true }
        );
        migratedListings++;

        // Cập nhật lô sản xuất liên quan nếu có
        if (oldArt) {
          const batchUpdate = await Batch.updateMany(
            { productId: String(oldArt._id) },
            { $set: { productId: String(targetArt._id), workshopId } }
          );
          updatedBatches += batchUpdate.modifiedCount;

          // Xóa tranh demo cũ để tránh trùng lặp
          await Artwork.deleteOne({ _id: oldArt._id });
          deletedOldArtworks++;
        } else if (mapItem.batchCode) {
          // Trường hợp database chưa có liên kết, đảm bảo batchCode trỏ đúng targetArt
          const batchUpdate = await Batch.updateMany(
            { code: mapItem.batchCode },
            { $set: { productId: String(targetArt._id), workshopId } }
          );
          updatedBatches += batchUpdate.modifiedCount;
        }
      }
    }

    console.log(`   -> Listing xưởng đã tạo trong workshop_products: ${migratedListings}`);
    console.log(`   -> Lô sản xuất (batches) đã cập nhật liên kết: ${updatedBatches}`);
    console.log(`   -> Tranh demo cũ đã dọn dẹp khỏi artworks:      ${deletedOldArtworks}`);

    // 4. Bước 3: Thống kê & Kiểm tra toàn vẹn
    console.log(`\n📊 [Bước 3/3] Báo cáo tổng kết dữ liệu trong Database:`);
    const totalArtworks = await Artwork.countDocuments();
    const totalGeneral = await Artwork.countDocuments({ type: 'general' });
    const totalCustom = await Artwork.countDocuments({ type: 'custom' });
    const totalListings = await WorkshopProduct.countDocuments();
    const totalBatches = await Batch.countDocuments();

    console.log(`   * Tổng số tranh trong collection "artworks":          ${totalArtworks}`);
    console.log(`     - Tranh di sản chung (type: 'general'):            ${totalGeneral}`);
    console.log(`     - Tranh độc bản xưởng (type: 'custom'):             ${totalCustom}`);
    console.log(`   * Tổng listing xưởng trong "workshop_products":      ${totalListings}`);
    console.log(`   * Tổng số lô sản xuất trong "batches":               ${totalBatches}`);

    const categoryStats = await Artwork.aggregate([
      { $match: { type: 'general' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log('\n📜 Thống kê 85 tranh di sản theo 4 dòng tranh truyền thống:');
    console.table(
      categoryStats.map((c) => ({
        'Dòng tranh': c._id,
        'Số lượng tranh': c.count,
      }))
    );

    console.log('============================================================');
    console.log('🎉 QUY TRÌNH NẠP DỮ LIỆU ĐÃ HOÀN TẤT THÀNH CÔNG RỰC RỠ!');
    console.log('============================================================\n');
  } finally {
    await conn.close();
    console.log('🔌 Đã đóng kết nối Database an toàn.');
  }
}

// Chạy trực tiếp
runSeed().catch((err) => {
  console.error('❌ Lỗi khi thực thi seed:', err);
  process.exit(1);
});
