# Kiến trúc backend

Backend tổ chức theo [feature modules của NestJS](https://docs.nestjs.com/modules). [AppModule](../src/app.module.ts) cấu hình môi trường và nhập các module chức năng; không chứa nghiệp vụ.

## Ranh giới trách nhiệm

| Thành phần | Trách nhiệm |
| --- | --- |
| Controller | Route, HTTP decorators, guard, nhận đầu vào và gọi service; phản hồi PNG QR được thiết lập tại controller |
| Service | Phân quyền nghiệp vụ, kiểm tra dữ liệu, truy vấn model, xử lý trạng thái và cập nhật đồng thời |
| DTO/schema Zod | Hợp đồng đầu vào, strict object, giới hạn, coercion và kiểu TypeScript suy ra từ schema |
| Mongoose schema | Cấu trúc lưu trữ, index, default và timestamp |
| AuthGuard | Kiểm tra JWT và tài khoản còn hoạt động; gắn Actor vào request |
| CurrentUser | Đưa Actor đã xác thực vào controller; service không nhận Express request/response |
| DatabaseModule | Tạo kết nối và đăng ký model một lần; các feature nhập module này để dùng `@InjectModel` |

Giữ Zod hiện có để bảo toàn quy tắc validation, thông báo lỗi, coercion và thứ tự kiểm tra quyền. Đầu vào chưa được kiểm tra có kiểu `unknown`; service gọi `parse` với schema trong thư mục DTO trước khi sử dụng dữ liệu. Không thêm global ValidationPipe có thể thay đổi hợp đồng API.

## Các chức năng

| Module | Phạm vi |
| --- | --- |
| [auth](../src/modules/auth/) | Đăng ký, đăng nhập, JWT, tài khoản hiện tại, guard và kiểu Actor |
| [admin](../src/modules/admin/) | Tạo nghệ nhân/xưởng, duyệt xưởng và quản lý trạng thái tài khoản |
| [catalog](../src/modules/catalog/) | Tra cứu xưởng/sản phẩm, hồ sơ xưởng và sản phẩm của nghệ nhân |
| [batches](../src/modules/batches/) | Lô sản xuất, nhật ký, truy xuất công khai và QR |
| [quotes](../src/modules/quotes/) | Yêu cầu báo giá, chào giá, phân bổ, sản xuất, giao hàng và optimistic concurrency |
| [news](../src/modules/news/) | Tin công khai và CRUD của quản trị viên |
| [media](../src/modules/media/) | Kiểm tra ảnh, tối ưu WebP và lưu file |
| [health](../src/modules/health/) | Kiểm tra kết nối database |

[users/schemas](../src/modules/users/schemas/) chứa schema tài khoản dùng chung; các API liên quan tài khoản thuộc auth/admin, nên không tạo UsersController hoặc UsersService rỗng.

## Lưu trữ và tương thích

[Registry model](../src/database/models.ts) nhập schema từ từng chức năng. Giữ nguyên model `Account`, `Studio`, `Artwork`, `Batch`, `Quotation`, `Bulletin` và cơ chế đặt tên collection mặc định của Mongoose. Index, default, timestamps và cấu trúc subdocument không thay đổi; không cần migrate database cho lần refactor này.

AuthModule export guard, JwtModule và DatabaseModule để Nest giải quyết dependency của guard khi dùng trong các module khác. Không dùng `forwardRef` hay module nghiệp vụ global.

[Helper database](../scripts/database.cjs) dùng cùng registry cho seed và E2E; ứng dụng không phụ thuộc helper này. E2E khởi tạo AppModule thật, dùng database riêng và kiểm tra HTTP, quyền truy cập, ảnh, QR cùng cạnh tranh cập nhật báo giá.

## Thêm tính năng

1. Tạo thư mục chức năng với controller, service và module.
2. Đặt schema đầu vào trong `dto/`, schema lưu trữ trong `schemas/`.
3. Đăng ký model mới trong registry và inject model vào service; chỉ export provider mà module khác cần dùng.
4. Nhập feature module trong AppModule; giữ controller chỉ xử lý HTTP.
5. Thêm kiểm thử hành vi vào bộ E2E hoặc unit test phù hợp, rồi chạy typecheck/build/test.
