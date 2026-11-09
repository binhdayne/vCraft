/**
 * clean-artworks.cjs
 * Chuẩn hóa 85 tác phẩm tranh Đông Hồ từ scripts/artworks.json
 * Xuất ra: scripts/artworks_ready.json
 */
const fs = require('node:fs');
const path = require('node:path');

const rawPath = path.join(__dirname, 'artworks.json');
const outPath = path.join(__dirname, 'artworks_ready.json');
const artDir = path.join(__dirname, '..', 'public', 'art');

const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

// Bộ quy tắc phân loại 4 dòng tranh truyền thống Đông Hồ
function classifyCategory(cleanName, story) {
  const text = (cleanName + ' ' + story).toLowerCase();

  // 1. Dòng tranh Lịch sử & Dân gian / Thần phật
  if (
    /bà triệu|hai bà trưng|ngô quyền|đinh tiên hoàng|thánh gióng|vinh quy bái tổ|táo quân|thổ công/i.test(cleanName)
  ) {
    return 'Lịch sử & dân gian';
  }

  // 2. Dòng tranh Tứ quý / Tố nữ
  if (/tố nữ|tứ quý|tứ bình|bốn mùa|sen vịt/i.test(cleanName)) {
    return 'Tứ quý';
  }

  // 3. Dòng tranh Sinh hoạt / Phong tục / Trào phúng
  if (
    /đám cưới chuột|chuột múa rồng|đánh ghen|hứng dừa|chăn trâu|thầy đồ cóc|trê cóc|hội đu|đấu vật|kéo co|bịt mắt bắt dê|chọi trâu|múa lân|múa rồng|hát quan họ|chợ quê|gái làng hồ|bà nguyệt|nhà nông|nông nhàn|thu hoạch|làm ruộng|bách mẫu dư điền|mèo bên cây cau|chim lồng|mã giám/i.test(
      cleanName
    )
  ) {
    return 'Sinh hoạt';
  }

  // 4. Dòng tranh Chúc tụng (Mặc định cho các tranh may mắn, phúc lộc, con giáp, em bé)
  if (
    /gà|lợn|heo|cá đàn|cá chậu|lý ngư|vinh hoa|phú quý|tiến tài|tiến lộc|thần tài|phúc lộc|đinh tài|tam dương|mã đáo|khỉ|hổ|thiên hạ thái bình|tứ linh|em bé ôm|nhân nghĩa|lễ trí/i.test(
      cleanName
    )
  ) {
    return 'Chúc tụng';
  }

  // Fallback dựa trên story
  if (/chúc tụng|cầu may|tết|phúc lộc|tài lộc/i.test(story)) return 'Chúc tụng';
  if (/lịch sử|đánh giặc|tướng|vua/i.test(story)) return 'Lịch sử & dân gian';

  return 'Sinh hoạt';
}

// Bóc tách kích thước từ tên tranh hoặc link ảnh
function extractDimensions(rawName, imageUrl) {
  // Tìm dạng 26cm x 37cm hoặc 26x37 trong tên
  const nameMatch = rawName.match(/(\d+)\s*(?:cm)?\s*[xX*]\s*(\d+)\s*(?:cm)?/);
  if (nameMatch) {
    return `${nameMatch[1]} × ${nameMatch[2]} cm`;
  }
  // Nếu tên không có, tìm trong image url (vd: ...-26x37.jpg)
  const urlMatch = imageUrl.match(/(\d+)[xX](\d+)/);
  if (urlMatch) {
    return `${urlMatch[1]} × ${urlMatch[2]} cm`;
  }
  return '26 × 37 cm';
}

// Làm sạch tên tranh
function cleanArtworkName(rawName) {
  let name = rawName;
  // Bỏ tiền tố
  name = name.replace(/^(Tranh Giấy Đông Hồ|Tranh Giấy Đông|Tranh Đông Hồ)\s+/i, '');
  // Bỏ hậu tố kích thước
  name = name.replace(/\s*\d+\s*(?:cm)?\s*[xX*]\s*\d+\s*(?:cm)?.*$/i, '');
  // Bỏ dấu gạch ngang ở cuối nếu có
  name = name.replace(/\s*-\s*$/, '');
  return name.trim();
}

// Trích xuất đoạn tóm tắt ngắn từ story
function extractDescription(story) {
  if (!story) return 'Tác phẩm tranh dân gian Đông Hồ truyền thống.';
  // Lấy đoạn đầu tiên có độ dài hợp lý
  const paragraphs = story.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, ' ').trim()).filter((p) => p.length > 20);
  if (paragraphs.length > 0) {
    const first = paragraphs[0];
    return first.length > 300 ? first.slice(0, 297) + '…' : first;
  }
  return story.slice(0, 200).trim() + '…';
}

const cleanedList = [];
const seenNames = new Map();

for (const item of rawData) {
  const cleanName = cleanArtworkName(item.name);
  const dimensions = extractDimensions(item.name, item.image_url || '');
  const category = classifyCategory(cleanName, item.story || '');
  const description = extractDescription(item.story);

  // Chuẩn hóa đường dẫn ảnh
  let imgPath = item.image_url || '';
  if (!imgPath.startsWith('/art/')) {
    imgPath = '/art/' + path.basename(imgPath);
  }

  // Kiểm tra file ảnh có tồn tại trên đĩa không
  const diskFile = path.join(artDir, path.basename(imgPath));
  const hasImage = fs.existsSync(diskFile);

  // Nếu tranh trùng tên (khác khổ kích thước), bổ sung thông số để phân biệt
  let finalName = cleanName;
  if (seenNames.has(cleanName)) {
    const count = seenNames.get(cleanName) + 1;
    seenNames.set(cleanName, count);
    finalName = `${cleanName} (Khổ ${dimensions.replace(/\s*cm/, '')})`;
  } else {
    seenNames.set(cleanName, 1);
  }

  cleanedList.push({
    name: finalName,
    category,
    type: 'general', // Tranh di sản chung của làng Đông Hồ
    material: 'Giấy Dó truyền thống',
    dimensions,
    story: (item.story || '').trim(),
    description,
    price: null, // Tranh general không gán giá cứng, giá do từng xưởng niêm yết
    images: [imgPath],
    workshopId: null, // Thuộc di sản chung, không gán xưởng độc quyền
    published: true,
  });
}

fs.writeFileSync(outPath, JSON.stringify(cleanedList, null, 2), 'utf8');

console.log(`✅ Đã chuẩn hóa thành công ${cleanedList.length} tác phẩm tranh Đông Hồ!`);
console.log(`📁 File kết quả: ${outPath}`);

// Thống kê phân loại
const stats = {};
cleanedList.forEach((c) => (stats[c.category] = (stats[c.category] || 0) + 1));
console.log('📊 Thống kê theo 4 dòng tranh truyền thống:');
console.table(stats);
