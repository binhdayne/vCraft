# vCraft

Ứng dụng làng nghề Đông Hồ: backend NestJS 11 + MongoDB, frontend React + Vite. Yêu cầu Node.js 22 trở lên.

## Chạy local trên Windows

1. Chạy `npm.cmd ci`.
2. Chạy `Copy-Item .env.example .env` nếu chưa có .env; cấu hình JWT_SECRET ít nhất 32 ký tự.
3. Terminal thứ nhất: `npm.cmd run db:dev`.
4. Chạy `npm.cmd run build` để build backend và frontend.
5. Terminal thứ hai: `npm.cmd run start:dev`.
6. Mở [ứng dụng](http://localhost:3000), [Swagger](http://localhost:3000/docs) hoặc [health](http://localhost:3000/api/v1/health).

Khi phát triển giao diện, chạy thêm `npm.cmd run web:dev`. Backend phục vụ bản frontend đã build; chạy lại `npm.cmd run build:web` để cập nhật bản này.

MongoDB dev lưu dữ liệu tại .local/mongodb-data; dữ liệu giữ lại sau khi dừng. Không chạy hai instance MongoDB cùng thư mục dữ liệu/cổng 27017. Có thể dùng MongoDB riêng qua MONGODB_URI. Không commit .env.

`npm.cmd run seed` tạo dữ liệu demo sau khi build backend. Script giữ bản ghi hiện có và không cho chạy trong production.

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

E2E cần MongoDB local tại cổng 27017, tạo database vcraft_test_<timestamp> riêng và xóa database test sau khi hoàn tất. Không sử dụng database ứng dụng.

Các luồng hiện có: đăng ký/đăng nhập, quản trị tài khoản và duyệt xưởng, sản phẩm, lô tranh và QR truy xuất, báo giá/phân bổ/sản xuất/giao hàng, tin tức và tải ảnh.
