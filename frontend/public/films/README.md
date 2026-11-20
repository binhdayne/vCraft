# Hoạt họa cho trang truy xuất

- `dam-cuoi-chuot.mp4`: clip minh họa 12 giây, lặp, không có âm thanh, H.264/MP4, 1120 × 630 px.
- `dam-cuoi-chuot-poster.svg`: hình chờ của clip.
- Năm clip mới, mỗi clip **12 giây, 1280 × 720 px, 30 fps, H.264/MP4, không âm thanh**, có poster SVG riêng:

  | Clip | Cảnh và chuyển động |
  | --- | --- |
  | `ga-dai-cat.mp4` | Gà đại cát: đầu nghiêng, mỏ hé, cánh và đuôi đung đưa, chớp mắt; hoa cúc và bướm. |
  | `lon-am-duong.mp4` | Lợn mẹ và năm lợn con: nhịp chân, đầu, tai, đuôi và chớp mắt; cây ráy lay nhẹ. |
  | `vinh-hoa.mp4` | Em bé ôm gà: đầu và thân đung đưa, chớp mắt; gà cử động, cúc và bướm. |
  | `phu-quy.mp4` | Em bé ôm vịt: đung đưa và chớp mắt; cổ/cánh vịt, hoa sen, bướm và gợn nước. |
  | `muc-dong-doc-sach.mp4` | Cậu bé trên lưng trâu đọc và lật sách; chân, đầu, tai, đuôi trâu cử động; tán lá và chuồn chuồn. |

- Đồ họa vector được vẽ riêng cho vCraft, lấy cảm hứng từ các đề tài tranh dân gian tương ứng. Không phải tư liệu sản xuất của xưởng hay video do chủ tài khoản tải lên.
- Nguồn hình và chuyển động: `scripts/media/mouse-wedding-scene.mjs`. Clip được dựng từ các khung SVG bằng Canvas và MediaRecorder.
- Nguồn của năm clip mới: `scripts/media/artwork-scenes.mjs`, `folk-art.mjs`, `rooster-scene.mjs`, `pigs-scene.mjs`, `blessings-scene.mjs`, `scholar-scene.mjs`. Hình nền, nhân vật và chi tiết phụ đều được dựng bằng mã, không tải video từ bên thứ ba. Tham khảo bố cục từ các ảnh tranh đã có trong `public/art/`; tham khảo ý nghĩa đề tài tại [Ủy ban Nhà nước về người Việt Nam ở nước ngoài](https://scov.gov.vn/cong-tac-doi-ngoai/ngoai-giao-van-hoa/tim-hieu-net-doc-dao-cua-tranh-dong-ho-di-san-van-hoa-can-bao-ve-khan-cap.html).

Xem thử tất cả clip tại **`/films/xem-thu.html`**. Đây là trang xem hoạt họa riêng, không cần tạo lô hoặc sửa dữ liệu để thử.

## Dựng lại clip mới

Máy cần Node.js và Chrome. Nếu chưa có Playwright dùng cho công cụ dựng, cài riêng (không thêm dependency cho ứng dụng):

```powershell
npm.cmd install --prefix .local/media-tools --no-save playwright
node scripts/render-artwork-films.mjs
```

Có thể chỉ dựng một clip, ví dụ `node scripts/render-artwork-films.mjs phu-quy`. Mỗi lần dựng ghi lại cả MP4 và poster SVG. Thời lượng và nhịp chuyển động được thiết kế để lặp sau 12 giây.

## Ghép tác phẩm trên landing page

Danh sách ghép tác phẩm với video nằm tại `frontend/src/trace-media/artwork-films.mjs`. Để thêm clip cho tranh khác, đặt file tại thư mục này rồi thêm mục chứa `names` (tên đã bỏ dấu, viết thường), `src`, `type`, `poster` và `duration`.

Đây là cấu hình trình bày ở frontend. Chức năng tạo lô và dữ liệu trong database không được thay đổi. Hoạt họa không có khung thẻ hoặc thanh điều khiển video; màu nền clip khớp với phần nội dung xung quanh.

Nhận tên có dấu/không dấu, dấu gạch nối và hậu tố kích thước. Có các tên rút gọn cũ: Đại cát, Vinh hoa, Phú quý, Mục đồng. Các tên rút gọn chỉ ghép khi đúng tên; ví dụ **Mục đồng thổi sáo** không bị ghép nhầm sang cảnh đọc sách. Các mẫu chưa có clip tiếp tục hiển thị ảnh thành phẩm.

Video được tải và tự phát tắt tiếng khi cuộn tới, lặp liên tục; tự dừng khi rời vùng xem hoặc ẩn tab, tiếp tục khi quay lại. Nút tạm dừng nhỏ và nút tạm dừng chuyển động của trang vẫn dùng được. Khi thiết bị yêu cầu giảm chuyển động, chỉ phát sau thao tác người xem.
