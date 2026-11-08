# Kiểm tra font chữ — 07/11/2026

## Kết quả

- 96 ảnh sau sửa tại viewport desktop 1440×1000 và mobile 390×1000; 84 ảnh trước sửa để đối chiếu.
- Không còn tràn ngang trang trong 96 lượt kiểm tra sau sửa (trước sửa: 10 lượt có lỗi).
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
