# Xem vệ tinh và chỉ đường trên Google Maps — không cần API key

vCraft dùng **Leaflet/OpenStreetMap** làm bản đồ chính. Google Maps được mở bằng liên kết ở tab mới để xem ảnh vệ tinh của xưởng đã chọn. Không cần Demo Key, API key, Google Cloud project hoặc cấu hình billing cho chức năng này.

## Cách sử dụng

1. Mở [bản đồ local](http://localhost:5173/#/ban-do).
2. Bấm ghim hoặc chọn một xưởng trong danh sách.
3. Bấm **Xem ảnh vệ tinh trên Google Maps** ở popup của ghim hoặc phần thông tin xưởng.
4. Google Maps mở ở tab mới với tâm là latitude/longitude của xưởng, chế độ vệ tinh và zoom 19.
5. Đóng tab Google Maps để quay lại bản đồ trong vCraft; vị trí và bộ lọc hiện tại vẫn được giữ.

Trên điện thoại, Google có thể mở liên kết bằng ứng dụng Google Maps nếu đã cài.

## Định vị và tìm xưởng gần nhất

1. Trong bản đồ vCraft, bấm **Vị trí của tôi** rồi cho phép trình duyệt truy cập vị trí.
2. Danh sách được sắp xếp gần trước. Thẻ **Gần bạn nhất trong danh sách** cho biết xưởng gần nhất trong nhóm đang hiển thị; bộ lọc đang đón khách cũng áp dụng cho kết quả này.
3. Bấm **Chỉ đường đến xưởng gần nhất** hoặc nút chỉ đường của một xưởng bất kỳ để mở Google Maps với đúng điểm xuất phát và điểm đến.
4. Dùng **Cập nhật vị trí của tôi** khi cần lấy lại vị trí, hoặc **Bỏ vị trí của tôi** để xóa vị trí khỏi giao diện.

Khoảng cách trong vCraft là đường thẳng ước tính. Google Maps tính lộ trình thực tế. Độ chính xác phụ thuộc thiết bị và được hiển thị khi trình duyệt cung cấp. Khi đang ở xa làng, bản đồ vẫn giữ phạm vi làng, nhưng liên kết chỉ đường vẫn dùng vị trí xuất phát đã xác định.

Nếu không cấp quyền, bạn vẫn có thể bấm **Chỉ đường đến xưởng** rồi chọn điểm xuất phát trên Google Maps. Định vị hoạt động trên HTTPS hoặc localhost; khi mở bằng địa chỉ IP qua HTTP, trình duyệt có thể không cho truy cập vị trí.

## Ảnh chụp xưởng trong popup

1. Đăng nhập bằng tài khoản nghệ nhân sở hữu xưởng.
2. Vào **Không gian làm việc → Hồ sơ xưởng → Chỉnh sửa**.
3. Trong **Ảnh xưởng (hiển thị trên bản đồ)**, bấm **Thêm ảnh**. Chọn tối đa 8 ảnh JPEG, PNG hoặc WebP; tối đa 8 MB/ảnh. Có thể xóa ảnh cũ để thay ảnh mới.
4. Đợi tải ảnh xong rồi bấm **Lưu thay đổi**. Với xưởng đã được duyệt, khách mở bản đồ và bấm ghim sẽ xem được ảnh, chuyển ảnh bằng hai nút mũi tên và bấm ảnh để xem lớn.

Ảnh chứng nhận không đưa vào popup. Ảnh minh họa có sẵn và ảnh upload từ phiên bản cũ chưa ghi nhận người tải lên không được xem là ảnh do chủ xưởng đăng; chủ xưởng có thể tải lại ảnh của mình. Xưởng chưa có ảnh sẽ hiện thông báo. Nút vệ tinh và chỉ đường Google Maps vẫn nằm dưới ảnh.

## Cách hoạt động của liên kết vệ tinh

Ứng dụng dùng [Google Maps URLs chính thức](https://developers.google.com/maps/documentation/urls/get-started), hỗ trợ mở bản đồ mà không cần API key:

```text
https://www.google.com/maps/@?api=1&map_action=map&center=LATITUDE,LONGITUDE&zoom=19&basemap=satellite
```

Liên kết được tạo từ tọa độ xưởng qua [map-settings.mjs](frontend/src/maps/map-settings.mjs), không tìm bằng tên xưởng demo. Đây là tab Google Maps bên ngoài, không phải ảnh Google nhúng trong vCraft.

## Cấu hình dự án

Chạy dự án như hướng dẫn [HUONG_DAN_SETUP.md](HUONG_DAN_SETUP.md). Không cần biến `VITE_GOOGLE_MAPS_API_KEY` hoặc bật Google Maps JavaScript API. Nếu đã thêm biến này trong `.env`, phiên bản hiện tại không sử dụng nó.

Giới hạn thu nhỏ trong vCraft vẫn quanh làng nghề: zoom 16–19 và phạm vi khoảng 2,2 × 2,5 km. Tab Google Maps bên ngoài có bộ điều khiển và giới hạn riêng.

## Khi không xem được

- Nếu nền Leaflet trống: ứng dụng thử nguồn OSM France dự phòng; dùng nút Thử tải lại khi cả hai nguồn lỗi. Xem [chẩn đoán bản đồ](docs/MAP.md).
- Nếu Google Maps không mở: kiểm tra kết nối tới Google hoặc trình duyệt có chặn tab mới không.
- Nếu vị trí không đúng nơi mong muốn: đối chiếu tọa độ trong database. Tên xưởng và tọa độ hiện tại là dữ liệu demo, không xác nhận địa chỉ thực.
