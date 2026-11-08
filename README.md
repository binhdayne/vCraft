# vCraft

Ứng dụng làng nghề Đông Hồ: backend NestJS 11 + MongoDB, frontend React + Vite. Yêu cầu Node.js 22 trở lên.

## Chạy local trên Windows

Hướng dẫn đầy đủ cho **Ngày 1: setup** và **Ngày 2: dữ liệu mẫu, kiểm tra máy khác** nằm trong [HUONG_DAN_SETUP.md](HUONG_DAN_SETUP.md), gồm cấu hình MongoDB, tài khoản demo, xử lý lỗi và biên bản kiểm tra.

Lần đầu, chạy tại thư mục gốc repo:

```powershell
npm.cmd ci
npm.cmd run setup
```

Terminal 1 — khởi động MongoDB và giữ terminal mở:

```powershell
npm.cmd run db:dev
```

Đợi `MongoDB ready`, sau đó tại terminal 2:

```powershell
npm.cmd run seed
npm.cmd run dev
```

Mở [web phát triển](http://localhost:5173), [Swagger](http://localhost:3000/docs) hoặc [health](http://localhost:3000/api/v1/health). `dev` chạy NestJS và Vite cùng lúc; `Ctrl+C` dừng cả hai. Các lần sau chỉ cần chạy MongoDB và `dev`.

`setup` tạo `.env` với JWT secret ngẫu nhiên, giữ nguyên `.env` đã có. Nếu dùng `.env` cũ, đặt `PUBLIC_URL=http://localhost:5173` để QR mở đúng web phát triển. Muốn xem bản build tại cổng 3000, đặt lại `PUBLIC_URL=http://localhost:3000`, chạy `npm.cmd run build` rồi `npm.cmd start`.

MongoDB dev lưu dữ liệu tại `.local/mongodb-data`; dữ liệu giữ lại sau khi dừng. Không chạy hai instance trên cổng 27017. Có thể dùng MongoDB riêng qua `MONGODB_URI` và bỏ qua `db:dev`. Không commit `.env`.

Bản đồ chính dùng Leaflet/OpenStreetMap, giữ giới hạn zoom quanh làng và tự thử nguồn OSM France khi nền chính tải lỗi. Chọn ghim/xưởng rồi bấm **Xem ảnh vệ tinh trên Google Maps** để mở đúng vị trí ở chế độ vệ tinh, zoom 19, trong tab mới. Không cần Google API key; xem [hướng dẫn xem vệ tinh](HUONG_DAN_GOOGLE_MAPS.md).

Nút **Vị trí của tôi** xin quyền định vị, sắp xếp xưởng theo khoảng cách đường thẳng và gợi ý xưởng gần nhất trong danh sách đang lọc. Nút **Chỉ đường** mở Google Maps với điểm xuất phát đã xác định; vị trí chỉ dùng trong phiên trang đang mở.

Popup bản đồ có thư viện ảnh do chủ tài khoản xưởng tải lên: chuyển ảnh và bấm xem lớn. Chủ xưởng thêm ảnh ở **Hồ sơ xưởng → Chỉnh sửa → Ảnh xưởng**, rồi lưu; ảnh hiện công khai khi xưởng đã được duyệt. Ảnh minh họa mẫu không được gắn nhãn ảnh do chủ xưởng đăng. Xem [chi tiết ảnh xưởng](docs/MAP.md#ảnh-xưởng-do-chủ-tài-khoản-tải-lên).

`seed` tự build backend trước khi nạp 5 tài khoản, 3 xưởng, 6 tranh, 3 lô, 3 tin và 1 yêu cầu báo giá. Script giữ bản ghi hiện có và từ chối chạy trong production. Mật khẩu demo: `DongHo@2026!`; danh sách email và cách kiểm tra có trong hướng dẫn.

## Cấu trúc NestJS

- [src/app.module.ts](src/app.module.ts): ghép các feature module.
- [src/config/](src/config/): kiểm tra biến môi trường.
- [src/database/](src/database/): kết nối MongoDB, đăng ký và export Mongoose model.
- [src/common/](src/common/): validation dùng chung, kiểm tra quyền và decorator người dùng hiện tại.
- [src/modules/](src/modules/): mỗi chức năng có module, controller, service; DTO và schema nằm cạnh chức năng sử dụng.
- [frontend/](frontend/): ứng dụng React, tách khỏi backend.
- [test/](test/): kiểm thử cấu hình và nghiệp vụ E2E.

Xem [kiến trúc và quy ước mở rộng](docs/ARCHITECTURE.md).

## Kiểm tra

`npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run test:e2e`, `npm.cmd run build`.

`test:e2e` tự build backend, cần MongoDB local tại cổng 27017, tạo database `vcraft_test_<timestamp>` riêng và xóa database test sau khi hoàn tất. Không sử dụng database ứng dụng.

Các luồng hiện có: đăng ký/đăng nhập, quản trị tài khoản và duyệt xưởng, sản phẩm, lô tranh và QR truy xuất, báo giá/phân bổ/sản xuất/giao hàng, tin tức và tải ảnh.
