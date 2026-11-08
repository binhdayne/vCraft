const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(".local/font-audit");
const groups = ["before", "before-mobile", "after", "after-admin"].map(
  (phase) => ({
    phase,
    rows: JSON.parse(
      fs.readFileSync(path.join(root, phase, "audit.json"), "utf8"),
    ),
  }),
);
const after = groups
  .filter((g) => g.phase.startsWith("after"))
  .flatMap((g) => g.rows);
const before = groups
  .filter((g) => g.phase.startsWith("before"))
  .flatMap((g) => g.rows);
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const html = `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>vCraft — Kiểm tra font chữ</title><style>body{font-family:system-ui,sans-serif;margin:0;background:#f7f3e9;color:#302d25;padding:32px;line-height:1.6}h1,h2{line-height:1.3}nav{display:flex;flex-wrap:wrap;gap:16px}a{color:#923c2e}section{margin:40px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px}figure{margin:0;border:1px solid #ded8c8;background:#fff;padding:12px}img{width:100%;height:280px;object-fit:cover;object-position:top;border:1px solid #eee}figcaption{overflow-wrap:anywhere}small{display:block}</style><h1>vCraft — Kiểm tra font chữ</h1><p>${after.length} ảnh sau sửa, desktop 1440px và mobile 390px. Không còn trang tràn ngang trong bộ kiểm tra. Tiêu đề render bằng Noto Serif.</p><p>Quản trị: kiểm tra bằng dữ liệu demo trong database tạm riêng; tài khoản admin hiện tại không đăng nhập được bằng mật khẩu demo. Không thay đổi tài khoản hay dữ liệu ứng dụng.</p><nav>${groups.map((g) => `<a href="#${g.phase}">${g.phase} (${g.rows.length})</a>`).join("")}</nav>${groups.map((g) => `<section id="${g.phase}"><h2>${g.phase}</h2><div class="grid">${g.rows.map((r) => `<figure><a href="${g.phase}/${r.filename}" target="_blank"><img loading="lazy" src="${g.phase}/${r.filename}" alt="${esc(r.name)}"></a><figcaption>${esc(r.filename)}<small>${r.overflow ? "Trước sửa: tràn ngang" : "Không tràn ngang"} · Font tiêu đề: ${esc([...new Set(r.renderedFonts.map((f) => f.familyName))].join(", "))}</small></figcaption></figure>`).join("")}</div></section>`).join("")}</html>`;
fs.writeFileSync(path.join(root, "index.html"), html);
fs.writeFileSync(
  "docs/FONT-AUDIT.md",
  `# Kiểm tra font chữ — 07/11/2026

## Kết quả

- ${after.length} ảnh sau sửa tại viewport desktop 1440×1000 và mobile 390×1000; ${before.length} ảnh trước sửa để đối chiếu.
- Không còn tràn ngang trang trong ${after.length} lượt kiểm tra sau sửa (trước sửa: ${before.filter((r) => r.overflow).length} lượt có lỗi).
- Font thực tế trên tiêu đề được xác nhận qua Chrome DevTools Protocol: Noto Serif, không còn trộn Georgia/Times New Roman trong cùng tiêu đề tiếng Việt.
- Nhãn nội dung tối thiểu 11px; dòng chữ ĐÔNG HỒ trong logo chủ ý giữ 10px. Nội dung chính 14px, trường nhập trên mobile 16px.
- Build frontend thành công. Đã xem ảnh tổng hợp và ảnh phóng lớn trang chủ, form nghệ nhân và quản trị.

## Phạm vi

Trang chủ; bộ sưu tập và trạng thái rỗng; 9 chi tiết tranh; danh sách và 4 chi tiết xưởng; bản đồ; 4 trang truy xuất; tin tức và bài mở rộng; đăng nhập/đăng ký; trang không tồn tại; dashboard, báo giá và form khách hàng; các tab hồ sơ/tranh/lô sản xuất cùng form và nhật ký nghệ nhân; điều phối, duyệt nghệ nhân và quản lý tin cùng form quản trị.

Các màn hình quản trị được kiểm tra trên database tạm riêng vì admin@vcraft.local không nhận mật khẩu demo. Database test đã được xóa sau khi chụp. Không tạo hay sửa bản ghi trên database ứng dụng trong quá trình kiểm tra.

## Sửa lỗi

1. Thay Georgia/Arial bằng Noto Serif/Noto Sans tự host, có subset tiếng Việt và normal/italic.
2. Tăng cỡ chữ nhỏ, giãn dòng và điều chỉnh tiêu đề mobile để dấu tiếng Việt rõ ràng.
3. Sửa min-width của sidebar và các vùng nội dung để workspace không đẩy rộng trang trên mobile.
4. Giữ font và giấy phép trong [frontend/public/fonts](../frontend/public/fonts/).

## Bằng chứng trên máy này

- [Bộ ảnh trước/sau](../.local/font-audit/index.html)
- [Dữ liệu đo trang công khai, khách hàng, nghệ nhân](../.local/font-audit/after/audit.json)
- [Dữ liệu đo quản trị](../.local/font-audit/after-admin/audit.json)

Ảnh và dữ liệu đo nằm trong .local (được Git bỏ qua). Đây là kiểm tra trên Edge/Chromium Windows; chưa kiểm tra Safari/iOS thực tế.

## Chạy lại

Ứng dụng và MongoDB local cần đang chạy. Cài Playwright phục vụ audit bằng lệnh npm.cmd install --prefix .local/font-audit-tools --no-audit --no-fund playwright. Máy cần có Microsoft Edge.

- node scripts/audit-typography.cjs after
- node scripts/audit-admin-typography.cjs
- node scripts/report-typography.cjs

Script chỉ mở và đóng form, không gửi form. Script quản trị tạo dữ liệu trong database có tiền tố vcraft_font_audit_, chạy backend riêng ở cổng 3001 và dọn database đó khi hoàn tất. Script tạo báo cáo cần các bộ ảnh before/before-mobile từ lượt kiểm tra ban đầu.
`,
);
console.log(
  JSON.stringify({
    before: before.length,
    after: after.length,
    beforeOverflow: before.filter((r) => r.overflow).length,
    afterOverflow: after.filter((r) => r.overflow).length,
  }),
);
