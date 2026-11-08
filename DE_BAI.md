# vCraft

**Bài tập lớn INT3306 - Phát triển ứng dụng web, Fall 2026**

> Tinh hoa làng nghề, muôn phương lan tỏa

## 1. Hướng dẫn thực hiện

- Thực hiện theo nhóm (team) 3 sinh viên.
- Tự do lựa chọn công nghệ, framework, library cho cả frontend và backend.
- Trình bày sản phẩm tại buổi thi vấn đáp (demo trực tiếp, không cần slide, doc) theo lịch thi của Nhà trường.

## 2. Mô tả tổng quan

**vCraft** là một nền tảng web được thiết kế riêng cho Ban quản lý (BQL) của một làng nghề truyền thống. Thay vì chỉ bán lẻ, hệ thống tập trung vào việc tạo ra một "Triển lãm số". Mỗi hộ gia đình/nghệ nhân có một không gian riêng để kể câu chuyện làm nghề, trưng bày sản phẩm độc bản, và minh bạch hóa quy trình sản xuất (Truy xuất nguồn gốc). Hệ thống cũng giúp BQL phân bổ các đơn hàng lớn (mua buôn) cho nhiều hộ gia đình cùng thực hiện.

**Nghề: Nhóm sinh viên tự chọn**, ví dụ gốm Bát Tràng, lụa Vạn Phúc, tranh Đông Hồ, hoa Tây Tựu, hương Thủy Xuân, tương bần Yên Nhân, nước mắm Phú Quốc, thổ cẩm Khmer…

## 3. Chức năng cho từng vai trò nghiệp vụ

Hệ thống gồm 3 vai trò chính:

### Hộ gia đình / Nghệ nhân (Artisan)

- Quản lý Hồ sơ xưởng (Profile): Lịch sử gia đình, hình ảnh xưởng sản xuất, chứng nhận chất lượng.
- Đăng tải sản phẩm: Không chỉ có giá bán, mà phải có Nhật ký sản xuất (Ví dụ với Gốm: Ngày nhào đất → Ngày vuốt → Ngày nung → Thành phẩm).
- Nhận và phản hồi/chào giá các "Yêu cầu báo giá" (Quote Requests) từ khách mua sỉ.

### Khách hàng (Buyer / Tourist)

- Xem danh mục sản phẩm theo Hộ gia đình hoặc theo Phân loại.
- Xem Bản đồ làng nghề (Interactive Map) để biết xưởng nào đang mở cửa cho khách vào tham quan/trải nghiệm.
- Tạo "Yêu cầu báo giá" (VD: Cần đặt 5.000 chiếc cốc in logo Trường Đại học Công nghệ trong 1 tháng), hệ thống sẽ gửi yêu cầu này đến các hộ gia đình phù hợp để họ vào chào giá (Bidding).

### Quản trị viên (Admin - Chủ tịch xã / Hội làng nghề)

- Kiểm duyệt và cấp tài khoản cho các hộ gia đình (đảm bảo đúng người trong làng, tránh hàng nhái trà trộn).
- Quản lý tin tức cộng đồng (Thông báo giá nguyên vật liệu, lịch cúp điện, chính sách hỗ trợ).

## 4. Yêu cầu kỹ thuật

### 4.1. Nhật ký Sản xuất & Truy xuất Nguồn gốc

- Ứng dụng lưu trữ được Quy trình vòng đời của một (lô) sản phẩm (Mỗi lô sản phẩm có 1 mảng các mốc thời gian và hình ảnh chứng minh).
- Frontend hoặc Backend tự động sinh ra một **Mã QR** cho mỗi lô sản phẩm. Khi khách hàng quét mã này, web sẽ hiển thị một trang Landing Page kể lại toàn bộ câu chuyện và quy trình làm ra lô sản phẩm đó từ ngày đầu tiên. Các sản phẩm cùng lô sẽ cùng QR code của lô.

### 4.2. Luồng Yêu cầu Báo giá và Điều phối đơn

- Ứng dụng xử lý luồng Báo giá (Quotation State Machine): Draft Request → Sent to Artisans → Artisans Bidding (Các hộ đưa ra mức giá và thời gian hoàn thành) → Buyer Accepted → In Production → Delivered.
- Luồng nghiệp vụ này đòi hỏi logic khóa bản ghi và cập nhật trạng thái phức tạp hơn mua bán thông thường.

### 4.3. Tích hợp Bản đồ số Làng nghề

- Frontend yêu cầu tích hợp API Bản đồ (Google Maps API hoặc thư viện mã nguồn mở [Leaflet](https://leafletjs.com), …).
- Trên bản đồ phải hiển thị các "Ghim" (Pins) tương ứng với tọa độ (Latitude, Longitude) của các xưởng. Người dùng có thể click vào Pin để xem popup thông tin vắn tắt của hộ gia đình đó.

### 4.4. Trải nghiệm Giao diện và Đa phương tiện

- Vì là sản phẩm thủ công mỹ nghệ, giao diện phải thiết kế đẹp, tập trung vào hình ảnh (Image-centric).
- Đòi hỏi kỹ năng xử lý Upload nhiều ảnh, tối ưu hóa kích thước ảnh (Image Optimization/Resizing) ở Backend để web không bị chậm khi tải danh sách hàng trăm sản phẩm.

— Hết —
