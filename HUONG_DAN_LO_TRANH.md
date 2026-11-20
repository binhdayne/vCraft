# Hoàn thành lô tranh và tạo landing page

## Quy trình cho chủ xưởng

1. Đăng nhập tài khoản nghệ nhân, mở **Không gian làm việc → Yêu cầu báo giá** và chọn đơn được phân bổ.
2. Nhấn **Bắt đầu sản xuất toàn bộ lô**. Trong đơn đang sản xuất sẽ xuất hiện mục **Nhật ký sản xuất**.
3. Nhấn **Ghi nhật ký sản xuất**, ghi tên công đoạn, ngày, mô tả và tải ảnh thực tế khi làm đến từng bước. Nhấn **Lưu nháp nhật ký** để lưu vào hệ thống. Có thể lưu khi chưa chọn tác phẩm, chưa có ảnh thành phẩm hoặc các mốc còn thiếu thông tin.
4. Đợi dòng **Đã lưu nháp lúc…** rồi đóng form. Lần sau, mở lại đơn và chọn **Tiếp tục ghi nhật ký** để viết tiếp. Nút lưu giữ form mở để có thể lưu nhiều lần trong lúc làm; mỗi lần lưu cập nhật thời gian lưu gần nhất.
5. Khi làm xong, cập nhật tiến độ từng tác phẩm thành **Xong** (nếu đơn có danh sách tranh), rồi nhấn **Báo hoàn thành lô tranh**. Form **Hoàn thành lô & tạo landing page** tự lấy lại nội dung nháp đã lưu. Kiểm tra và bổ sung đủ:

   | Thông tin | Cách cung cấp |
   | --- | --- |
   | Tên xưởng, số lượng | Hệ thống lấy từ xưởng đăng nhập và phần việc được phân bổ; không nhập lại. |
   | Tác phẩm | Đơn có danh sách tranh: chọn tác phẩm đại diện từ đơn; toàn bộ tranh và số lượng được lưu theo lô. Đơn cũ chưa có danh sách: chọn tranh công khai của xưởng hoặc tranh di sản đang nhận in, cùng phân loại với đơn. |
   | Câu chuyện lô tranh | Nội dung riêng về nguyên liệu, cách làm, người thực hiện và thành phẩm của lô này. |
   | Ảnh thành phẩm | Tải lên ít nhất một ảnh; ảnh đầu tiên làm ảnh chính của landing page. |
   | Câu chuyện người làm nghề | Gợi ý từ hồ sơ xưởng; có thể sửa riêng cho lô, không thay đổi hồ sơ xưởng. |
   | Nhật ký sản xuất | Từ 2 đến 30 mốc, theo thứ tự từ ngày đầu đến thành phẩm. Mỗi mốc có tên, ngày, mô tả và ít nhất một ảnh. |

6. Nhấn **Hoàn thành & xuất bản trang**. Hệ thống xác nhận hoàn thành phần việc và tạo lô, mã lô, landing page, QR của lô.
7. Mở **Xem landing page của lô** (tab mới) hoặc **Tải mã QR của lô** ngay trong đơn hàng. Mọi bản tranh của cùng phần lô dùng chung QR.

## Lưu nháp trong khi sản xuất

- Bản nháp thuộc phần việc của xưởng trong đơn hàng và được lưu vào MongoDB, có thể tiếp tục sau khi tải lại trang hoặc đăng nhập trên máy khác bằng cùng tài khoản xưởng.
- Chỉ tài khoản sở hữu xưởng được phân bổ phần việc đọc và sửa bản nháp của mình. Khách hàng, xưởng khác và BQL không nhận nội dung nháp qua API đơn hàng.
- Lưu nháp chưa tạo lô tranh, landing page hay QR, không đổi trạng thái phần việc và không gửi thông báo cho khách. Nội dung chỉ trở thành trang công khai sau khi xác nhận hoàn thành thành công.
- Đây là lưu thủ công: cần nhấn **Lưu nháp nhật ký** trước khi rời trang. Nếu đóng form hoặc tải lại trang khi có thay đổi chưa lưu, trình duyệt sẽ nhắc xác nhận.
- Có thể lưu từ 0 đến 30 mốc, kể cả mốc chưa có tên, ngày, mô tả hay ảnh. Ngày đã nhập phải hợp lệ, không ở tương lai; ảnh đã chọn phải do chính tài khoản xưởng tải lên. Các yêu cầu đầy đủ và thứ tự ngày được kiểm tra lại khi xuất bản.
- Khi ảnh đang tải hoặc dữ liệu đang lưu, nút lưu và đóng bị khóa. Đợi hoàn tất trước khi thao tác tiếp.
- Nếu đơn được cập nhật ở tab hoặc máy khác, hệ thống báo xung đột và tải phiên bản đơn mới; nội dung đang nhập vẫn giữ trong form để kiểm tra rồi lưu lại. Nếu cả hai nơi cùng sửa nhật ký, đối chiếu trước khi lưu lại để tránh ghi đè bản vừa lưu ở nơi kia.
- Sau khi hoàn thành, sửa nội dung đã xuất bản tại **Lô tranh & nhật ký → Chỉnh sửa landing page**.

Khách hàng và chủ xưởng cũng nhận thông báo hoàn thành tại biểu tượng chuông cạnh tài khoản. Ngay trong thông báo có thể mở landing page ở tab mới, xem QR tại chỗ hoặc tải QR PNG. Các cập nhật chào giá, bắt đầu sản xuất và xác nhận nhận hàng cũng xuất hiện tại đây; trạng thái đã đọc được lưu riêng theo tài khoản.

Đơn nhiều tác phẩm theo luồng mới giao cho một xưởng thực hiện trọn gói. Landing page lưu đủ danh sách tranh và số lượng từng loại; ảnh, câu chuyện và nhật ký thuộc toàn bộ lô. Tác phẩm đại diện dùng ở phần mở đầu và góc hoạt họa. Các đơn cũ từng chia cho nhiều xưởng vẫn có trang riêng cho phần lô của từng xưởng. Khách hàng xác nhận nhận đủ hàng khi các phần việc đều hoàn thành. Một phần việc chỉ tạo một trang; gửi lại thao tác không tạo thêm lô.

## Ảnh, ngày và hoạt họa

- Ảnh thành phẩm và ảnh công đoạn phải do chính tài khoản xưởng tải lên hệ thống. Không dùng ảnh của tài khoản khác hoặc ảnh tư liệu `/art/` làm bằng chứng cho lô mới.
- Ngày công đoạn không được ở tương lai và phải tăng dần; các công đoạn cùng ngày được chấp nhận. Phải đợi ảnh tải xong trước khi gửi form.
- Các tác phẩm có hoạt họa sẵn gồm **Đám cưới chuột, Gà đại cát, Đàn lợn âm dương, Vinh hoa – Em bé ôm gà, Phú quý – Em bé ôm vịt, Mục đồng đọc sách / Hiếu học chăn trâu đọc sách**. Trang tự ghép phim theo tác phẩm đại diện của lô; không cần nhập hoặc tải video. Những mẫu còn lại tiếp tục dùng ảnh thành phẩm ở góc thưởng tranh. Có thể xem thử sáu clip tại `/films/xem-thu.html`.
- QR được cung cấp ở trang quản lý và chi tiết đơn; landing page tiếp tục tập trung vào câu chuyện, nhật ký và hình ảnh.

## Quản lý sau khi tạo

Landing page là trang kể chuyện độc lập, không có thanh điều hướng, tài khoản, giỏ hàng hay footer của hệ thống. Phần mở đầu có dấu mộc và nét mực xuất hiện; phần kết có vòng hoa văn chuyển động và nút đọc lại. Có thể tạm dừng chuyển động; cài đặt giảm chuyển động của thiết bị cũng được tôn trọng. Truy cập bằng link cũ hoặc quét QR vẫn mở đúng trang này, không cần đăng nhập. Các link ghé thăm xưởng/bộ sưu tập mở tab khác.

Mở **Lô tranh & nhật ký → Chỉnh sửa landing page** để cập nhật câu chuyện, ảnh thành phẩm, câu chuyện người làm nghề, các mốc và trạng thái công khai. Mã lô, số lượng, đường dẫn và QR giữ nguyên. Khi ẩn trang, khách không mở được landing page và QR đến khi công khai lại.

Các phần việc đã hoàn thành bằng phiên bản cũ nhưng chưa có trang sẽ hiện **Tạo landing page cho lô đã hoàn thành** trong đơn gốc, kể cả khi đơn đã giao. Các lô minh họa cũ vẫn đọc được.

Tên tác phẩm, tên xưởng, câu chuyện người làm nghề và ảnh thành phẩm được lưu riêng theo lô lúc tạo. Việc sửa nội dung danh mục tranh không viết lại câu chuyện lô đã hoàn thành. Xưởng vẫn cần được BQL duyệt để trang được truy cập công khai.

## Chia sẻ QR

Đường dẫn QR dùng `PUBLIC_URL` của backend. Khi chạy local là `http://localhost:5173`; để quét bằng điện thoại hoặc chia sẻ cho khách, cấu hình địa chỉ triển khai hoặc địa chỉ LAN truy cập được và khởi động lại backend.

## Kiểm tra kỹ thuật

`PATCH /api/v1/quotes/:id/production-journal` nhận `{ version, journal }`, trong đó `journal` gồm `productId`, `story`, `workshopStory`, `coverImages`, `events`. Các nội dung có thể còn trống. API chỉ cho xưởng lưu khi phần việc đang sản xuất; lưu vào `allocations[].journalDraft`, ghi `savedAt` và tăng `version` của đơn. Không thêm lịch sử công khai hay tạo lô ở bước này.

`POST /api/v1/quotes/:id/production` với `action: "ready"` nhận `landingPage` gồm các trường trên; nếu không truyền, backend dùng bản nháp đã lưu. Cả hai cách đều phải qua kiểm tra đầy đủ trước khi tạo trang. Giao diện luôn mở form để chủ xưởng kiểm tra và xác nhận lại. Số lượng và xưởng do backend xác định. Kết quả lưu `batchId` vào phân bổ của xưởng; link công khai vẫn là `/#/trace/:batchId`.

Backend dùng phiên bản đơn hàng để chống cập nhật đồng thời. Trang chỉ công khai khi đơn đã ghi nhận hoàn thành và liên kết đúng lô, kể cả khi MongoDB chạy độc lập không có transaction.

Kiểm tra tích hợp bằng `npm.cmd run test:e2e` với MongoDB local đang chạy. Bộ kiểm tra dùng database test riêng và xóa sau khi hoàn tất, không sửa dữ liệu ứng dụng.
