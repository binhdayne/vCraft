# Thông báo trong hệ thống

Khách hàng và nghệ nhân có chuông thông báo ở thanh đầu trang, giữa giỏ hàng và tài khoản. Có số chưa đọc, bộ lọc tất cả/chưa đọc, đọc từng tin, đọc tất cả và tải thêm tin cũ. Tin tự cập nhật khi quay lại tab, sau thao tác đơn hàng trong cùng trang và mỗi 20 giây khi tab đang hiển thị.

## Nội dung

- Yêu cầu đặt tranh đã gửi: khách thấy xác nhận, các xưởng nhận yêu cầu thấy yêu cầu mới.
- Chào giá: khách nhận cập nhật; xưởng thấy xác nhận chào giá của mình.
- Chấp nhận đơn: khách và xưởng được chọn nhận thông báo.
- Bắt đầu sản xuất, hoàn thành lô, xác nhận nhận đủ hàng.
- Tin BQL đang công khai; tin nháp hoặc đã xóa không xuất hiện.

Thông báo hoàn thành lô có **Xem đơn**, **Landing page** (tab mới), **Xem QR** (hiện ngay trong khung), và biểu tượng tải QR PNG. Nút truy xuất/QR chỉ hiện khi lô được liên kết đúng đơn, đang công khai và xưởng còn được duyệt. Ẩn lô sẽ thay các nút này bằng thông tin trang chưa công khai.

## Lưu trữ và phân quyền

Nguồn thông báo là nhật ký đã lưu của `Quotation` và các `Bulletin` đang công khai. Không gửi thông báo trước khi cập nhật trạng thái thành công; không cần tạo lại hay sửa các đơn cũ. Các cập nhật sản xuất mới lưu thêm `eventType`, `workshopId`, `batchId` vào lịch sử; dữ liệu cũ được nhận diện từ trạng thái và mốc hoàn thành.

Collection `notificationreads` lưu `recipientId`, khóa thông báo và `readAt`, với khóa duy nhất `(recipientId, key)`. Đánh dấu đã đọc ở một tài khoản không ảnh hưởng tài khoản khác. Khách chỉ xem đơn của mình; xưởng chỉ xem các mốc liên quan đến xưởng, không nhận tiến độ/chào giá của xưởng cạnh tranh.

Landing page độc lập không tải thông báo hoặc thông tin tài khoản.

## API

Tất cả endpoint cần đăng nhập:

| Endpoint | Nội dung |
| --- | --- |
| `GET /api/v1/notifications?page=1&limit=20&unreadOnly=false` | Danh sách, tổng số chưa đọc và `hasMore`. Tối đa 50 tin/trang. |
| `PATCH /api/v1/notifications/:key/read` | Đọc một thông báo đang được tài khoản nhìn thấy. |
| `PATCH /api/v1/notifications/read-all` | Đọc toàn bộ thông báo hiện có của tài khoản, không đánh dấu các tin đến sau. |

Không nhận `recipientId` từ client. Người dùng không được đánh dấu thông báo đơn hàng của tài khoản khác. API không trả thông tin người nhận hàng, địa chỉ hay phân bổ/chào giá trong dữ liệu thông báo.

Kiểm tra trong `test/e2e.test.cjs`: phân quyền, QR/landing page, dữ liệu cũ, đọc đồng thời không trùng, phân trang, chưa đọc riêng từng tài khoản, tin BQL và dữ liệu nháp. Chạy `npm.cmd run test:e2e` với MongoDB local; database test được tạo riêng và xóa sau khi chạy.
