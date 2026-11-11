# Hoạt họa cho trang truy xuất

- `dam-cuoi-chuot.mp4`: clip minh họa 12 giây, lặp, không có âm thanh, H.264/MP4, 1120 × 630 px.
- `dam-cuoi-chuot-poster.svg`: hình chờ của clip.
- Đồ họa vector được vẽ riêng cho vCraft, lấy cảm hứng từ đề tài Đám cưới chuột. Không phải tư liệu sản xuất của xưởng hay video do chủ tài khoản tải lên.
- Nguồn hình và chuyển động: `scripts/media/mouse-wedding-scene.mjs`. Clip được dựng từ các khung SVG bằng Canvas và MediaRecorder.

Danh sách ghép tác phẩm với video nằm tại `frontend/src/trace-media/artwork-films.mjs`. Để thêm clip cho tranh khác, đặt file tại thư mục này rồi thêm mục chứa `names` (tên đã bỏ dấu, viết thường), `src`, `type`, `poster` và `duration`.

Đây là cấu hình trình bày ở frontend. Chức năng tạo lô và dữ liệu trong database không được thay đổi. Hoạt họa không có khung thẻ hoặc thanh điều khiển video; màu nền clip khớp với phần nội dung xung quanh.

Video được tải và tự phát tắt tiếng khi cuộn tới, lặp liên tục; tự dừng khi rời vùng xem hoặc ẩn tab, tiếp tục khi quay lại. Nút tạm dừng nhỏ và nút tạm dừng chuyển động của trang vẫn dùng được. Khi thiết bị yêu cầu giảm chuyển động, chỉ phát sau thao tác người xem.
