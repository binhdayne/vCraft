# Phạm vi vCraft

Repo hiện là bộ khung backend, chưa phải toàn bộ bài tập lớn.

## Đã có
- NestJS, TypeScript strict, MongoDB/Mongoose, cấu hình môi trường.
- Health kiểm tra database thật; Swagger; API đọc xưởng đã duyệt và sản phẩm đã công khai.
- Schema xưởng có tọa độ, lịch mở tham quan, câu chuyện và ảnh.
- Cấu hình VS Code, MongoDB local lưu dữ liệu, Docker Compose tùy chọn.

## Cần triển khai tiếp theo đề
1. Auth/users: JWT, mật khẩu băm, vai trò Buyer/Artisan/Admin; admin cấp và duyệt tài khoản nghệ nhân; kiểm tra quyền sở hữu.
2. CRUD hồ sơ xưởng, sản phẩm, phân loại, chứng nhận; chỉ chủ sở hữu hoặc admin được sửa.
3. Batches: lô sản phẩm, các mốc thời gian và ảnh; mã QR trỏ tới trang truy xuất công khai.
4. Quotes: draft -> sent -> bidding -> accepted -> in_production -> delivered. Cập nhật có điều kiện theo trạng thái/version để tránh hai yêu cầu đồng thời. Phân bổ đơn cho nhiều hộ; transaction cần replica set.
5. News: quản trị nội dung cộng đồng.
6. Media: kiểm tra định dạng, giới hạn số lượng/kích thước, resize ảnh và lưu trữ.
7. Frontend riêng: bản đồ Leaflet, triển lãm hình ảnh, trang truy xuất QR.
8. Test phân quyền, chào giá đồng thời, tổng số lượng phân bổ và các chuyển trạng thái không hợp lệ.

Không mở API ghi công khai trước khi có xác thực và phân quyền. MongoDB local hiện là standalone, chỉ phục vụ phát triển.
