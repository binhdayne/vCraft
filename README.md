# vCraft Backend

Bộ khung NestJS 11 + MongoDB (Mongoose), Node.js 22 trở lên. Dựa trên đề vCraft; frontend và các luồng nghiệp vụ đầy đủ chưa được triển khai. Xem [lộ trình](docs/ROADMAP.md).

## Chạy trên Windows / VS Code

Mở vcraft.code-workspace. Dùng npm.cmd để tránh lỗi PowerShell chặn npm.ps1.

1. npm.cmd ci
2. Copy-Item .env.example .env (chỉ khi chưa có .env)
3. Terminal thứ nhất: npm.cmd run db:dev
4. Terminal thứ hai: npm.cmd run start:dev
5. Swagger: http://localhost:3000/docs
6. Health: http://localhost:3000/api/v1/health

MongoDB dev tải binary ở lần chạy đầu và lưu database trong .local/mongodb-data. Dữ liệu giữ lại sau khi dừng; không xóa thư mục này nếu cần giữ dữ liệu. Nhấn Ctrl+C ở mỗi terminal để dừng. Không chạy đồng thời db:dev và Docker trên cùng cổng 27017.

Nếu có Docker: docker compose up -d mongodb thay cho bước 3. Hoặc đặt MONGODB_URI trong .env thành URI MongoDB Atlas. Không commit .env hay thông tin đăng nhập. Cấu hình local chỉ lắng nghe 127.0.0.1 và không có xác thực MongoDB; không dùng nguyên cấu hình này cho production.

## VS Code

- F5: Debug NestJS (khởi động MongoDB trước).
- Terminal > Run Task: MongoDB: local dev hoặc NestJS: dev.
- requests.http: gọi API với extension REST Client nếu muốn.
- Extensions recommendations: MongoDB, REST Client (không bắt buộc).

## Kiểm tra

npm.cmd run typecheck
npm.cmd test

API danh sách trả về mảng rỗng khi database chưa có dữ liệu. Chỉ xưởng approved=true và sản phẩm published=true thuộc xưởng đã duyệt mới xuất hiện. Chưa có API tạo dữ liệu vì phân quyền chưa được triển khai.

## Cấu trúc

- src/modules/catalog: schema và public API xưởng/sản phẩm.
- src/modules/auth, users, batches, quotes, news, media: vị trí dành cho nghiệp vụ tiếp theo.
- src/health.controller.ts: ping MongoDB.
- .vscode: tasks, launch và settings.
- docs/requirements.md: nội dung đề, bỏ ảnh nhúng.

Repo Git được tạo local. Chưa có remote GitHub. Khi cần đưa lên GitHub, tạo repo trống rồi thêm origin và push nhánh main.

Tài liệu: https://docs.nestjs.com/techniques/mongodb và https://docs.nestjs.com/openapi/introduction
