# Hướng dẫn setup và dữ liệu mẫu vCraft

Tài liệu dành cho thành viên mới chạy dự án từ repo. Các lệnh bên dưới dùng **PowerShell trên Windows**, chạy tại thư mục gốc có `package.json`. Trên macOS/Linux, dùng `npm` thay cho `npm.cmd`; các bước cấu hình `.env` vẫn tương tự.

## 1. Mục tiêu trong hai ngày

| Thời điểm | Công việc | Điều kiện hoàn thành |
| --- | --- | --- |
| Ngày 1 | Sửa lệnh chạy dự án, cấu hình môi trường, khởi động MongoDB, backend và web | Cài được bằng `npm.cmd ci`; `npm.cmd run dev` chạy được; health trả về database đã kết nối; web tải được API |
| Ngày 2 | Nạp và kiểm tra dữ liệu mẫu, chạy lại trên máy thành viên khác | Đăng nhập đủ vai trò; xem được tranh, xưởng, bản đồ, QR và báo giá mẫu; seed lại không tạo trùng; có biên bản kiểm tra máy thứ hai |

Máy thứ hai phải clone và setup độc lập. Kiểm tra trên máy hiện tại chưa thay thế được bước này.

## 2. Ngày 1 — chuẩn bị và chạy dự án

### 2.1. Công cụ cần có

- Git để clone repo.
- Node.js **22 trở lên**, kèm npm. Kiểm tra phiên bản thực tế trước khi bắt đầu.
- VS Code hoặc IDE đang dùng, với hai terminal cho MongoDB và ứng dụng.
- Kết nối Internet khi cài dependency và khi MongoDB dev tải binary lần đầu. Bản đồ dùng Leaflet/OpenStreetMap; nút xem vệ tinh mở Google Maps ở tab mới, không cần API key.

Không cần cài MongoDB riêng khi dùng `db:dev`: script tải và chạy MongoDB thật, lưu dữ liệu trên máy. Có thể dùng MongoDB đã cài sẵn theo mục 2.4.

```powershell
git --version
node --version
npm.cmd --version
```

### 2.2. Lấy source và cài dependency

Nếu chưa có repo:

```powershell
git clone https://github.com/binhdayne/vCraft.git
Set-Location vCraft
```

Nếu đã có repo, mở terminal ngay thư mục repo đang dùng. Không cần clone thêm.

```powershell
npm.cmd ci
npm.cmd run setup
```

`npm ci` cài theo `package-lock.json`. Chỉ cài một lần ở root, không chạy thêm `npm install` trong `frontend/`. Khi dependency của repo thay đổi, chạy lại `npm.cmd ci` sau khi dừng ứng dụng.

`setup` tạo `.env` từ `.env.example` và sinh `JWT_SECRET` ngẫu nhiên. Nếu `.env` đã có, lệnh giữ nguyên file; hãy kiểm tra lại các giá trị sau trong IDE:

| Biến | Giá trị khi chạy local | Ý nghĩa |
| --- | --- | --- |
| `NODE_ENV` | `development` | Cho phép chạy công cụ phát triển và seed demo |
| `HOST` | `127.0.0.1` | Địa chỉ backend trên máy |
| `PORT` | `3000` | Cổng backend |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/vcraft` | MongoDB và database ứng dụng |
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:3000` | Các origin frontend được phép gọi API trực tiếp |
| `PUBLIC_URL` | `http://localhost:5173` | Địa chỉ web được ghi vào mã QR khi phát triển |
| `JWT_SECRET` | Chuỗi ngẫu nhiên do `setup` sinh, tối thiểu 32 ký tự | Khóa ký token đăng nhập |

Với `.env` cũ, sửa `PUBLIC_URL` sang cổng **5173** để QR mở đúng Vite. Các biến đã đặt ở môi trường terminal được ưu tiên hơn `.env`; nếu vừa thử cấu hình khác, mở terminal mới trước khi chạy lại.

### 2.3. Khởi động MongoDB dev — terminal 1

```powershell
npm.cmd run db:dev
```

Đợi thông báo:

```text
MongoDB ready: mongodb://127.0.0.1:27017/vcraft
```

Giữ terminal này mở. Lần đầu có thể phải chờ tải binary. Script dùng cổng cố định **27017**; nếu cổng bị chiếm, script báo lỗi và không tự chuyển sang cổng khác.

- Binary MongoDB: `.local/mongodb-binaries/`.
- Dữ liệu MongoDB: `.local/mongodb-data/`.
- Ảnh tải lên từ ứng dụng: `.local/uploads/`.

Các thư mục này nằm trong `.gitignore`. Dừng bằng `Ctrl+C` và chờ tiến trình kết thúc; dữ liệu vẫn được giữ lại. Mỗi máy có database riêng.

### 2.4. Nếu đã có MongoDB riêng

Nếu MongoDB của máy đã chạy tại `127.0.0.1:27017`, giữ `MONGODB_URI` như bảng trên và **bỏ qua `db:dev`**. Không chạy hai MongoDB trên cùng cổng.

Nếu dùng cổng/database khác, sửa `MONGODB_URI` trong `.env` rồi khởi động lại backend. `dev` và `seed` đọc URI này. Riêng bộ E2E hiện cần MongoDB local trên **27017** và dùng database test riêng.

### 2.5. Chạy backend và web — terminal 2

Sau khi MongoDB sẵn sàng, mở terminal khác tại root:

```powershell
npm.cmd run dev
```

Lệnh kiểm tra cấu hình, cổng backend, cổng web và kết nối MongoDB trước khi chạy NestJS ở chế độ watch cùng Vite. Chưa cần build frontend để chạy chế độ này. Đợi Nest báo khởi động thành công và Vite báo địa chỉ web.

| Thành phần | Địa chỉ mặc định | Dấu hiệu hoạt động |
| --- | --- | --- |
| Web React/Vite | <http://localhost:5173> | Hiện trang chủ; trước khi seed có thể chưa có sản phẩm |
| Backend NestJS | <http://localhost:3000/api/v1/health> | Trả về `status: ok`, `database: connected` |
| Swagger | <http://localhost:3000/docs> | Hiện danh sách API |
| API qua proxy Vite | <http://localhost:5173/api/v1/health> | Trả về cùng kết quả health của backend |

Vite chuyển `/api`, `/art`, `/uploads` sang backend. Khi đổi `PORT` trong `.env`, proxy cũng dùng cổng đó sau khi khởi động lại. Cổng web cố định 5173; nếu bị chiếm, Vite báo lỗi.

Kiểm tra từ terminal thứ ba hoặc sau khi tạm mở terminal kiểm tra:

```powershell
Invoke-RestMethod http://localhost:3000/api/v1/health
Invoke-RestMethod http://localhost:5173/api/v1/health
```

Kết quả mong đợi cho cả hai:

```text
status database
------ --------
ok     connected
```

`Ctrl+C` ở terminal 2 dừng cả backend và Vite. MongoDB ở terminal 1 tiếp tục chạy đến khi bạn dừng riêng.

Nếu Windows hiện `Terminate batch job (Y/N)?`, nhập `Y` rồi Enter để kết thúc lệnh npm.

### 2.6. Chạy riêng từng thành phần hoặc xem bản build

Để phát triển từng phần, mở các terminal riêng sau khi MongoDB đã chạy:

```powershell
# Terminal backend
npm.cmd run start:dev
```

```powershell
# Terminal frontend
npm.cmd run web:dev
```

Để xem bản build do NestJS phục vụ tại cổng 3000: dừng `dev`, đổi `PUBLIC_URL=http://localhost:3000` trong `.env`, rồi chạy:

```powershell
npm.cmd run build
npm.cmd start
```

Mở <http://localhost:3000>. MongoDB vẫn phải chạy. Khi quay lại phát triển bằng Vite, trả `PUBLIC_URL` về `http://localhost:5173`. Chỉ sửa frontend ở chế độ build thì cần build lại để thấy thay đổi.

## 3. Ngày 2 — nạp và kiểm tra dữ liệu mẫu

### 3.1. Chạy seed

Giữ MongoDB chạy. Nên dừng `dev` trước khi seed vì lệnh seed build lại thư mục backend `dist/`.

```powershell
npm.cmd run seed
npm.cmd run dev
```

`preseed` tự build backend trước khi seed, nên không cần nhớ chạy build thủ công. Script kết nối `MONGODB_URI` trong `.env` và từ chối chạy khi `NODE_ENV=production`.

Trên database trống, dữ liệu mẫu gồm:

| Loại dữ liệu | Số lượng | Nội dung |
| --- | --- | --- |
| Tài khoản | 5 | 1 admin, 1 buyer, 3 artisan đang hoạt động |
| Xưởng đã duyệt | 3 | Xưởng Nét Mộc, Xưởng Sắc Điệp, Xưởng Hồn Quê; có tọa độ và lịch tham quan |
| Tranh công khai | 6 | Đám cưới chuột, Lợn âm dương, Đại cát, Vinh hoa, Phú quý, Mục đồng đọc sách |
| Lô sản xuất | 3 | `DH-DEMO-001` đến `DH-DEMO-003`; mỗi lô 100 bản, có 4 mốc nhật ký |
| Tin công khai | 3 | Tin làng nghề, thông báo và sự kiện minh họa |
| Yêu cầu báo giá | 1 | Đơn 200 bản, trạng thái `bidding`, có 2 chào giá mẫu |

Seed dùng cơ chế chỉ thêm bản ghi chưa có, giữ bản ghi đã tồn tại. Chạy lại không đặt lại mật khẩu, không khôi phục trạng thái đơn đã demo và không xóa dữ liệu bạn tạo thêm. Vì vậy số lượng trong bảng là số lượng trên database mới.

### 3.2. Tài khoản đăng nhập

Mở <http://localhost:5173/#/dang-nhap>. Mật khẩu chung của các tài khoản mới do seed tạo: **`DongHo@2026!`**.

| Email | Vai trò | Dùng để kiểm tra |
| --- | --- | --- |
| `admin@vcraft.local` | Ban quản lý | Quản lý tài khoản, duyệt xưởng, tin tức, đề xuất phân bổ đơn |
| `buyer@vcraft.local` | Khách hàng | Tạo yêu cầu, chấp nhận chào giá và xác nhận nhận hàng |
| `artisan@vcraft.local` | Nghệ nhân — Xưởng Nét Mộc | Hồ sơ xưởng, tranh, nhật ký, chào giá và sản xuất |
| `artisan2@vcraft.local` | Nghệ nhân — Xưởng Sắc Điệp | Tham gia đơn được chia cho hai xưởng |
| `artisan3@vcraft.local` | Nghệ nhân — Xưởng Hồn Quê | Hồ sơ xưởng thứ ba, bổ sung chào giá |

Đăng xuất trước khi đổi vai trò hoặc dùng các cửa sổ trình duyệt riêng. Nếu tài khoản demo đã tồn tại và đã đổi mật khẩu/vô hiệu hóa, seed không ghi đè thay đổi đó.

### 3.3. Kiểm tra dữ liệu công khai

Khi ứng dụng đang chạy:

```powershell
$apiBase = 'http://localhost:5173/api/v1'
$workshops = @(Invoke-RestMethod "$apiBase/workshops")
$products = Invoke-RestMethod "$apiBase/products"
$news = @(Invoke-RestMethod "$apiBase/news")
[PSCustomObject]@{
    Workshops = $workshops.Count
    Products = $products.total
    News = $news.Count
}
```

Trên database mới, kết quả lần lượt là **3, 6, 3**. Trên web, kiểm tra thêm:

1. **Bộ sưu tập**: có 6 tranh, có ảnh và giá; mở được chi tiết tranh.
2. **Nghệ nhân & xưởng**: có 3 xưởng, mở được hồ sơ và danh sách tranh.
3. **Bản đồ làng nghề**: có 3 ghim; nhấn ghim xem thông tin, thấy trạng thái mở tham quan.
4. **Chi tiết Đám cưới chuột** → **Hành trình từng lô tranh**: mở `DH-DEMO-001`, thấy 4 mốc và mã QR.
5. **Chuyện làng**: có 3 tin với ảnh minh họa.

QR chứa `PUBLIC_URL` của máy đang chạy. Để kiểm tra trên cùng máy, mở trang truy xuất và tải/xem mã QR. Điện thoại quét URL có `localhost` sẽ trỏ về chính điện thoại; việc truy cập qua mạng LAN cần cấu hình địa chỉ mạng riêng và không phải tiêu chí setup local này.

### 3.4. Thử luồng báo giá mẫu

1. Đăng nhập `buyer@vcraft.local`, vào không gian làm việc, mở **Bộ tranh quà tặng văn hóa · đơn demo**.
2. Kiểm tra đơn 200 bản và 2 chào giá. Phân bổ **100 bản cho Nét Mộc**, **100 bản cho Sắc Điệp**, rồi chấp nhận.
3. Đăng nhập từng nghệ nhân tương ứng: chọn **Bắt đầu sản xuất phần việc**, sau đó **Báo hoàn thành phần việc**.
4. Đăng nhập lại buyer, chọn **Xác nhận đã nhận đủ hàng**. Đơn chuyển sang đã giao.
5. Đăng nhập admin để kiểm tra màn hình quản trị và đơn vừa xử lý.

Luồng này thay đổi đơn mẫu. Muốn chạy lại, tạo yêu cầu mới bằng tài khoản buyer; chạy seed lại sẽ giữ nguyên đơn đã giao. Không cần xóa database để thử tiếp.

### 3.5. Kiểm tra seed lại và chạy bộ kiểm thử

Dừng `dev`, giữ MongoDB chạy, rồi thực hiện:

```powershell
npm.cmd run seed
npm.cmd run typecheck
npm.cmd test
npm.cmd run test:e2e
npm.cmd run build
```

- Seed lần hai phải thành công; khởi động lại `dev` và kiểm tra số bản ghi mẫu không tăng nếu không tự thêm dữ liệu.
- `typecheck` kiểm tra TypeScript; `test` build và kiểm tra cấu hình; `build` build backend và frontend.
- `test:e2e` tự build backend và kiểm tra phân quyền, ảnh, QR, báo giá, phân bổ, trạng thái sản xuất và seed chạy lặp lại. Bộ test dùng database riêng tên `vcraft_test_<timestamp>` và `vcraft_test_seed_<timestamp>` trên MongoDB local 27017, xóa database test sau khi hoàn tất.
- Không chạy build/test trong lúc Nest watch đang ghi cùng `dist/`; dừng `dev` trước, chạy lại sau khi kiểm tra xong.

## 4. Kiểm tra trên máy thành viên khác

Sau khi các thay đổi setup đã được đưa lên branch của nhóm, thành viên thứ hai clone đúng branch/commit cần kiểm tra. Chỉ chuyển source qua Git; mỗi máy tự cài dependency, tạo `.env` và seed database.

Thực hiện lần lượt mục 2 và 3 trên máy đó. Hai máy nên dùng cùng phiên bản Node/npm để dễ đối chiếu lỗi. Ghi lại thông tin sau:

```powershell
git rev-parse --short HEAD
node --version
npm.cmd --version
```

### Mẫu biên bản kiểm tra

Sao chép bảng này vào biên bản của nhóm và điền theo kết quả thực tế. Ô chưa kiểm tra để trống, không đánh dấu hoàn thành thay cho người kiểm tra.

| Thông tin | Kết quả |
| --- | --- |
| Người kiểm tra / máy / hệ điều hành | |
| Ngày kiểm tra | |
| Branch / commit | |
| Node / npm | |
| MongoDB dev hoặc MongoDB có sẵn | |

| Hạng mục | Đạt / lỗi | Ghi chú hoặc minh chứng |
| --- | --- | --- |
| `npm.cmd ci` trên clone mới | | |
| `setup` tạo `.env`; chạy lại giữ nguyên file | | |
| MongoDB báo ready, health báo connected | | |
| `dev` mở được web 5173 và Swagger 3000 | | |
| API qua Vite hoạt động | | |
| Seed có 5 tài khoản, 3 xưởng, 6 tranh, 3 lô, 3 tin, 1 đơn trên database mới | | |
| Đăng nhập đúng 3 vai trò | | |
| Có ảnh, bản đồ, nhật ký và QR | | |
| Hoàn thành thử luồng báo giá hai xưởng | | |
| Seed lần hai không tạo trùng hoặc đặt lại đơn | | |
| Typecheck, test, E2E và build thành công | | |
| Dừng/chạy lại, dữ liệu vẫn còn | | |
| `Ctrl+C` dừng cả API và Vite, chạy lại được | | |

Minh chứng nên gồm kết quả terminal, ảnh trang bộ sưu tập, trang QR, các vai trò và đơn đã giao. Chỉ xác nhận hoàn thành Ngày 2 khi có kết quả từ máy thành viên thứ hai.

## 5. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| PowerShell chặn `npm.ps1` | Dùng `npm.cmd` đúng như hướng dẫn |
| `npm ci` báo package và lockfile không đồng bộ | Kiểm tra đang dùng đúng branch và có cả `package.json` lẫn `package-lock.json` mới; người sửa dependency cần cập nhật lockfile rồi commit cùng nhau |
| Không tìm thấy `.env` | Chạy `npm.cmd run setup` ở root |
| `JWT_SECRET must contain at least 32 characters` | Kiểm tra `.env` cũ, đặt secret đủ dài; `setup` không ghi đè file đã có |
| `Cannot connect to MongoDB` / `ECONNREFUSED` | Kiểm tra terminal MongoDB, chờ `MongoDB ready`, kiểm tra `MONGODB_URI` đúng host/cổng |
| MongoDB tải binary lâu hoặc lỗi mạng | Giữ kết nối Internet, kiểm tra proxy/quyền truy cập mạng; có thể dùng MongoDB đã cài riêng theo mục 2.4 |
| MongoDB lỗi cổng 27017 hoặc thư mục dữ liệu đang dùng | Kiểm tra có MongoDB dev/service khác đang chạy; chỉ giữ một instance. Dùng URI của service đang có hoặc dừng đúng tiến trình do bạn mở |
| Backend/web báo cổng 3000/5173 bị chiếm | Dừng phiên ứng dụng cũ bằng `Ctrl+C`. Nếu đổi cổng API trong `.env`, khởi động lại `dev`; web vẫn dùng 5173 |
| Web 5173 có giao diện nhưng API lỗi | Mở health của cả 3000 và 5173; kiểm tra log Nest, MongoDB và proxy. Dùng backend PORT mới nếu đã đổi cấu hình |
| Cổng 3000 trả 404 trang chủ | Với chế độ dev, mở 5173. Muốn mở 3000 thì build cả frontend theo mục 2.6 |
| Không có tranh hoặc không đăng nhập được tài khoản demo | Chạy seed trên đúng `MONGODB_URI`; kiểm tra trạng thái tài khoản đã có trước đó |
| QR trỏ sai cổng | Sửa `PUBLIC_URL` theo chế độ chạy rồi khởi động lại backend |
| Ảnh nền bản đồ không tải | Ứng dụng tự thử OSM France dự phòng; nếu vẫn lỗi, dùng nút Thử tải lại, kiểm tra DNS/mạng và API xưởng; xem [chẩn đoán bản đồ](docs/MAP.md) |
| Định vị không hoạt động | Bấm Vị trí của tôi và cấp quyền trong trình duyệt; dùng HTTPS hoặc localhost, kiểm tra định vị thiết bị. Nút chỉ đường vẫn mở Google Maps để chọn điểm xuất phát khi không cấp quyền |
| E2E không kết nối được DB | Chạy MongoDB local cổng 27017; E2E không lấy URI database ứng dụng từ `.env` |

Xem tiến trình đang nghe trên các cổng cần dùng:

```powershell
Get-NetTCPConnection -State Listen |
    Where-Object { $_.LocalPort -in 27017, 3000, 5173 } |
    Select-Object LocalAddress, LocalPort, OwningProcess
```

Sau khi dừng toàn bộ lệnh chạy, kiểm tra thay đổi source bằng `git status --short`. `.env`, binary, dữ liệu MongoDB và file build không được đưa lên Git. Những thay đổi setup cần chia sẻ gồm script, cấu hình, lockfile và tài liệu trong repo.

## 6. Kết quả đã kiểm tra trên máy hiện tại — 07/11/2026

Môi trường: Windows, Node.js `22.14.0`, npm `10.9.2`, dùng MongoDB đã cài trên máy tại `127.0.0.1:27017`.

| Kiểm tra | Kết quả |
| --- | --- |
| Cài bằng `npm.cmd ci` sau khi sửa lockfile | Thành công |
| `setup` tạo secret riêng cho mỗi môi trường và giữ `.env` có sẵn | Đạt |
| `npm.cmd run seed` trên database ứng dụng | Thành công, có đủ dữ liệu mẫu |
| Typecheck, kiểm thử cấu hình và build cả backend/frontend | Đạt; 3 kiểm thử cấu hình qua |
| `npm.cmd run test:e2e` | 12 kiểm thử qua, gồm seed không tạo trùng, giữ thay đổi và chặn production |
| Web, Swagger, health trực tiếp và health qua Vite | Đạt |
| Đăng nhập 5 tài khoản, đọc 3 xưởng, 6 tranh, 3 tin, 3 lô/4 mốc, ảnh và QR | Đạt qua HTTP/API |
| Đổi cổng API sang 3101, kiểm tra proxy Vite | Đạt |
| `Ctrl+C` hoặc một tiến trình dừng | API và Vite đều dừng, giải phóng cổng |
| MongoDB không kết nối được / cổng MongoDB đã có service | Báo lỗi rõ ràng, không tự đổi cổng |

Build frontend hiện có cảnh báo bundle JavaScript lớn hơn 500 kB; build vẫn thành công.

Lần tải binary của MongoDB dev gặp lỗi DNS tới `fastdl.mongodb.org`; kiểm tra seed và E2E ở trên dùng MongoDB có sẵn. Chưa xác nhận lần tải/khởi động MongoDB dev trên máy mới, hiển thị bản đồ trong trình duyệt và kết quả trên máy thành viên thứ hai. Dùng checklist mục 4 để hoàn tất các bước đó.
