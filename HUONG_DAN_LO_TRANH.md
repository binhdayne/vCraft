# Hoàn thành lô tranh và tạo landing page

## Quy trình cho chủ xưởng

1. Đăng nhập tài khoản nghệ nhân, mở **Không gian làm việc → Yêu cầu báo giá** và chọn đơn được phân bổ.
2. Nhấn **Bắt đầu sản xuất phần việc**. Khi đã làm xong, nhấn **Báo hoàn thành phần việc**.
3. Điền form **Hoàn thành lô & tạo landing page**:

   | Thông tin | Cách cung cấp |
   | --- | --- |
   | Tên xưởng, số lượng | Hệ thống lấy từ xưởng đăng nhập và phần việc được phân bổ; không nhập lại. |
   | Tác phẩm | Đơn có danh sách tranh: chọn tác phẩm đại diện từ đơn; toàn bộ tranh và số lượng được lưu theo lô. Đơn cũ chưa có danh sách: chọn tranh công khai của xưởng hoặc tranh di sản đang nhận in, cùng phân loại với đơn. |
   | Câu chuyện lô tranh | Nội dung riêng về nguyên liệu, cách làm, người thực hiện và thành phẩm của lô này. |
   | Ảnh thành phẩm | Tải lên ít nhất một ảnh; ảnh đầu tiên làm ảnh chính của landing page. |
   | Câu chuyện người làm nghề | Gợi ý từ hồ sơ xưởng; có thể sửa riêng cho lô, không thay đổi hồ sơ xưởng. |
   | Nhật ký sản xuất | Từ 2 đến 30 mốc, theo thứ tự từ ngày đầu đến thành phẩm. Mỗi mốc có tên, ngày, mô tả và ít nhất một ảnh. |

4. Nhấn **Hoàn thành & xuất bản trang**. Hệ thống xác nhận hoàn thành phần việc và tạo lô, mã lô, landing page, QR của lô.
5. Mở **Xem landing page của lô** hoặc **Tải mã QR của lô** ngay trong đơn hàng. Mọi bản tranh của cùng phần lô dùng chung QR.

Đơn nhiều tác phẩm theo luồng mới giao cho một xưởng thực hiện trọn gói. Landing page lưu đủ danh sách tranh và số lượng từng loại; ảnh, câu chuyện và nhật ký thuộc toàn bộ lô. Tác phẩm đại diện dùng ở phần mở đầu và góc hoạt họa. Các đơn cũ từng chia cho nhiều xưởng vẫn có trang riêng cho phần lô của từng xưởng. Khách hàng xác nhận nhận đủ hàng khi các phần việc đều hoàn thành. Một phần việc chỉ tạo một trang; gửi lại thao tác không tạo thêm lô.

## Ảnh, ngày và hoạt họa

- Ảnh thành phẩm và ảnh công đoạn phải do chính tài khoản xưởng tải lên hệ thống. Không dùng ảnh của tài khoản khác hoặc ảnh tư liệu `/art/` làm bằng chứng cho lô mới.
- Ngày công đoạn không được ở tương lai và phải tăng dần; các công đoạn cùng ngày được chấp nhận. Phải đợi ảnh tải xong trước khi gửi form.
- Tác phẩm có hoạt họa sẵn, hiện là **Đám cưới chuột**, được gắn phim tự động. Các tác phẩm khác dùng ảnh thành phẩm ở góc thưởng tranh. Không bắt buộc cung cấp video.
- QR được cung cấp ở trang quản lý và chi tiết đơn; landing page tiếp tục tập trung vào câu chuyện, nhật ký và hình ảnh.

## Quản lý sau khi tạo

Mở **Lô tranh & nhật ký → Chỉnh sửa landing page** để cập nhật câu chuyện, ảnh thành phẩm, câu chuyện người làm nghề, các mốc và trạng thái công khai. Mã lô, số lượng, đường dẫn và QR giữ nguyên. Khi ẩn trang, khách không mở được landing page và QR đến khi công khai lại.

Các phần việc đã hoàn thành bằng phiên bản cũ nhưng chưa có trang sẽ hiện **Tạo landing page cho lô đã hoàn thành** trong đơn gốc, kể cả khi đơn đã giao. Các lô minh họa cũ vẫn đọc được.

Tên tác phẩm, tên xưởng, câu chuyện người làm nghề và ảnh thành phẩm được lưu riêng theo lô lúc tạo. Việc sửa nội dung danh mục tranh không viết lại câu chuyện lô đã hoàn thành. Xưởng vẫn cần được BQL duyệt để trang được truy cập công khai.

## Chia sẻ QR

Đường dẫn QR dùng `PUBLIC_URL` của backend. Khi chạy local là `http://localhost:5173`; để quét bằng điện thoại hoặc chia sẻ cho khách, cấu hình địa chỉ triển khai hoặc địa chỉ LAN truy cập được và khởi động lại backend.

## Kiểm tra kỹ thuật

`POST /api/v1/quotes/:id/production` với `action: "ready"` yêu cầu thêm `landingPage` gồm `productId`, `story`, `workshopStory`, `coverImages`, `events`. Số lượng và xưởng do backend xác định. Kết quả lưu `batchId` vào phân bổ của xưởng; link công khai vẫn là `/#/trace/:batchId`.

Backend dùng phiên bản đơn hàng để chống cập nhật đồng thời. Trang chỉ công khai khi đơn đã ghi nhận hoàn thành và liên kết đúng lô, kể cả khi MongoDB chạy độc lập không có transaction.

Kiểm tra tích hợp bằng `npm.cmd run test:e2e` với MongoDB local đang chạy. Bộ kiểm tra dùng database test riêng và xóa sau khi hoàn tất, không sửa dữ liệu ứng dụng.
