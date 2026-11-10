# Bản đồ làng nghề và liên kết ảnh vệ tinh

[VillageMap.jsx](../frontend/src/VillageMap.jsx) hiển thị danh sách xưởng, bộ lọc, xưởng đang chọn và nút xem ảnh vệ tinh. [LeafletVillageCanvas.jsx](../frontend/src/maps/LeafletVillageCanvas.jsx) hiển thị nền OpenStreetMap, ghim và popup. API `/api/v1/workshops` cung cấp tọa độ và dữ liệu xưởng.

## Giới hạn xem

- Tâm ban đầu: `21.0616, 106.0822`, zoom 16.
- Zoom từ **16 đến 19**, không thu nhỏ ra toàn thế giới.
- Giới hạn vùng: tây nam `21.052, 106.070`, đông bắc `21.072, 106.094`, khoảng 2,2 × 2,5 km.
- `maxBoundsViscosity=1` giới hạn kéo. Khi khung thay đổi kích thước, zoom tối thiểu được điều chỉnh nếu cần để giữ trong vùng làng.
- Chọn xưởng sẽ đưa bản đồ tới vị trí đó ở zoom 17; chọn lại cùng xưởng cũng đưa bản đồ về đúng vị trí.
- Lọc xưởng đang mở chỉ cập nhật ghim, giữ nguyên khung nhìn.

Tọa độ hiện tại là dữ liệu demo của một làng nghề Đông Hồ; vùng giới hạn không phải ranh giới hành chính.

## Vị trí của tôi và xưởng gần nhất

- Nút **Vị trí của tôi** gọi `navigator.geolocation.getCurrentPosition` sau khi người dùng bấm và cấp quyền. [Trình duyệt yêu cầu quyền vị trí và secure context](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition); [localhost được hỗ trợ khi phát triển](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts).
- Hook [useUserLocation.js](../frontend/src/maps/useUserLocation.js) lấy vị trí một lần, timeout 12 giây và chấp nhận bản ghi vị trí gần nhất trong 60 giây. Có thông báo riêng cho từ chối quyền, vị trí không khả dụng và timeout. Cập nhật bằng nút trên giao diện, không theo dõi liên tục.
- Khoảng cách dùng Haversine, đơn vị mét. Danh sách sắp xếp gần trước; xưởng gần nhất chỉ xét các xưởng đang hiển thị sau bộ lọc. Đây là khoảng cách đường thẳng ước tính; Google Maps tính lộ trình khi người dùng mở chỉ đường.
- Nếu người dùng ở trong vùng làng, bản đồ có chấm xanh và vòng tròn độ chính xác. Nếu ở ngoài, giữ giới hạn bản đồ quanh làng và vẫn tính khoảng cách/chỉ đường từ vị trí thật.
- **Bỏ vị trí của tôi** xóa vị trí khỏi trạng thái giao diện và gỡ chấm xanh. Rời trang cũng bỏ trạng thái này; callback đến muộn sẽ bị bỏ qua. Ứng dụng không lưu tọa độ vào database hoặc localStorage.

## Chỉ đường Google Maps

Liên kết chỉ đường có ở thẻ xưởng gần nhất, xưởng đã chọn và popup của ghim. URL dùng `https://www.google.com/maps/dir/?api=1&destination=LAT,LNG&dir_action=navigate`; nếu đã định vị, thêm `origin=LAT,LNG` theo [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started).

Nếu người dùng không cấp quyền, nút chỉ đường vẫn mở được: Google Maps cho chọn điểm xuất phát. Tọa độ xuất phát được đưa vào URL khi người dùng đã định vị và bấm mở chỉ đường. Không cần Google API key.

## Xem ảnh vệ tinh Google Maps

Nút **Xem ảnh vệ tinh trên Google Maps** có trong popup của ghim và phần xưởng đã chọn. Liên kết mở tab mới với `api=1`, `map_action=map`, `center=latitude,longitude`, `zoom=19`, `basemap=satellite` theo [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started).

Không cần API key. Bản đồ trong vCraft vẫn là Leaflet; ảnh vệ tinh Google được xem trên website/ứng dụng Google Maps bên ngoài. Ứng dụng không nạp Google Maps JavaScript API hoặc cửa sổ ảnh vệ tinh nhúng. Xem [hướng dẫn sử dụng](../HUONG_DAN_GOOGLE_MAPS.md).

## Ảnh xưởng do chủ tài khoản tải lên

Chủ xưởng vào **Không gian làm việc → Hồ sơ xưởng → Chỉnh sửa → Ảnh xưởng (hiển thị trên bản đồ)**, thêm ảnh rồi **Lưu thay đổi**. Tối đa 8 ảnh JPEG/PNG/WebP, 8 MB mỗi ảnh. Khi đang tải ảnh, nút lưu tạm khóa; ảnh được tối ưu thành WebP tối đa 1600 px. Ảnh chứng nhận là mục riêng, không hiển thị trong popup.

Popup của xưởng đã được duyệt hiển thị ảnh đã lưu, số thứ tự và nút chuyển ảnh. Bấm ảnh để mở bản lớn trong tab mới. Nếu chưa có ảnh, hiện thông báo; nếu tải ảnh lỗi, có nút thử lại và vẫn chuyển sang ảnh khác được.

API upload lưu người tải lên trong collection `mediaassets` (`MediaAsset`: `url`, `ownerId`). API công khai `/workshops` và `/workshops/:id` bổ sung `ownerPhotos`, chỉ gồm URL hiện có trong `images` của xưởng và có bản ghi upload thuộc đúng `ownerId` của xưởng đó. API sửa hồ sơ chỉ cho tài khoản chủ xưởng cập nhật xưởng của mình, đồng thời từ chối URL upload mới thuộc tài khoản khác hoặc không có thông tin người tải lên.

Các ảnh minh họa `/art/*` và ảnh upload cũ chưa có thông tin người tải lên vẫn giữ trong hồ sơ, nhưng không được gắn nhãn ảnh do chủ xưởng đăng trong popup. Chủ xưởng cần tải lại ảnh cũ nếu muốn đưa vào popup; không suy đoán quyền sở hữu từ tên file. Ảnh chỉ xuất hiện sau khi lưu hồ sơ; xóa khỏi hồ sơ rồi lưu cũng gỡ khỏi popup. Nhãn này xác định tài khoản đăng ảnh, không xác minh nội dung ảnh là địa điểm thực tế.

## Nguồn nền và xử lý lỗi

1. Nguồn chính: `https://tile.openstreetmap.org/{z}/{x}/{y}.png` theo [chính sách OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/).
2. Khi tải lỗi hoặc không có tile trong 8 giây, chuyển sang [nền Humanitarian của OSM France](https://wiki.openstreetmap.org/wiki/FR:Serveurs/tile.openstreetmap.fr#Fond_de_carte_%22Humanitaire%22).
3. Nếu cả hai nguồn lỗi, hiển thị thông báo và nút **Thử tải lại**. Danh sách xưởng và liên kết vệ tinh vẫn dùng được.

Ghi công nguồn đang dùng xuất hiện ở góc bản đồ. Không tải trước toàn bộ làng hoặc lưu tile vào repo. Popup tạo tên/địa chỉ bằng `textContent`, không chèn HTML từ dữ liệu xưởng.

Helmet trong [src/main.ts](../src/main.ts) cho phép ảnh từ đúng các nguồn nền và gửi Referer bằng `strict-origin-when-cross-origin`. Script vẫn chỉ tải từ nguồn nội bộ; không cần `unsafe-eval`, script Google hoặc iframe Google để mở liên kết bên ngoài.

## Chẩn đoán nền trống

Nếu danh sách và ghim vẫn xuất hiện, kiểm tra các yêu cầu ảnh trong Network, thay vì chỉ kiểm tra API xưởng.

```powershell
Resolve-DnsName tile.openstreetmap.org
Resolve-DnsName a.tile.openstreetmap.fr
```

Trên máy phát triển ngày 08/11/2026, tên miền nền OpenStreetMap chính được phân giải về loopback, Chrome báo `ERR_CONNECTION_REFUSED`. Nguồn OSM France tải được nền. Ứng dụng dùng nguồn dự phòng; không thay đổi cấu hình mạng của máy.

## Kiểm tra

- Mở `/#/ban-do`, kiểm tra nền, 3 ghim, popup và link hồ sơ xưởng.
- Nút vệ tinh ở popup/thanh thông tin phải trỏ tới đúng tọa độ, zoom 19, chế độ satellite, tab mới.
- Không có request tới Google SDK khi tải trang.
- Thu nhỏ/kéo không rời khu làng; bộ lọc giữ nguyên mức zoom.
- Kiểm tra desktop/mobile và cả Vite cổng 5173 lẫn bản build cổng 3000.
- Khi chặn cả hai nguồn ảnh, vẫn chọn được xưởng và dùng liên kết vệ tinh; bỏ chặn rồi thử lại phải tải được nền.
- Trước khi bấm Vị trí của tôi không có yêu cầu định vị. Kiểm tra cấp quyền, từ chối quyền, lỗi và timeout.
- Kiểm tra xưởng gần nhất, lọc xưởng đang mở, điểm xuất phát/đích của liên kết chỉ đường, bỏ vị trí và trường hợp người dùng ở ngoài làng.
- Đăng nhập chủ xưởng, tải và lưu 2 ảnh trong hồ sơ. Khách mở ghim phải xem được đúng ảnh, chuyển qua lại và bấm mở ảnh lớn trên desktop/mobile; xóa ảnh rồi lưu phải cập nhật popup khi tải lại trang.
- Ảnh minh họa và ảnh chỉ mới upload chưa lưu vào hồ sơ không hiện trong popup. Kiểm tra lỗi tải ảnh và nút thử lại. Tài khoản xưởng khác không được nhận URL đó làm ảnh của mình.

Unit test [maps.test.cjs](../test/maps.test.cjs) kiểm tra URL vệ tinh/chỉ đường, phép tính khoảng cách, tọa độ không hợp lệ và thứ tự xưởng gần nhất. Kiểm tra trình duyệt sử dụng vị trí giả lập, gồm cả vị trí trong/ngoài làng và từ chối quyền. Vị trí thực tế phụ thuộc thiết bị và quyền của trình duyệt.

Các tùy chọn giới hạn của bản đồ được mô tả trong [tài liệu Leaflet 1.9.4](https://leafletjs.com/reference-1.9.4.html).
