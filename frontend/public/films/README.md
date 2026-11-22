# Hoạt họa cho trang truy xuất

- `dam-cuoi-chuot.mp4`: clip minh họa 12 giây, lặp, không có âm thanh, H.264/MP4, 1120 × 630 px.
- `dam-cuoi-chuot-poster.svg`: hình chờ của clip.
- Thư viện hiện có **20 mẫu**. Ngoài Đám cưới chuột ở trên, 19 clip sau đều **12 giây, 1280 × 720 px, 30 fps, H.264/MP4, không âm thanh**, có poster SVG riêng:

  | Clip | Cảnh và chuyển động |
  | --- | --- |
  | `ga-dai-cat.mp4` | Gà đại cát: đầu nghiêng, mỏ hé, cánh và đuôi đung đưa, chớp mắt; hoa cúc và bướm. |
  | `lon-am-duong.mp4` | Lợn mẹ và năm lợn con: nhịp chân, đầu, tai, đuôi và chớp mắt; cây ráy lay nhẹ. |
  | `vinh-hoa.mp4` | Em bé ôm gà: đầu và thân đung đưa, chớp mắt; gà cử động, cúc và bướm. |
  | `phu-quy.mp4` | Em bé ôm vịt: đung đưa và chớp mắt; cổ/cánh vịt, hoa sen, bướm và gợn nước. |
  | `muc-dong-doc-sach.mp4` | Cậu bé trên lưng trâu đọc và lật sách; chân, đầu, tai, đuôi trâu cử động; tán lá và chuồn chuồn. |
  | `chan-trau-thoi-sao.mp4` | Cậu bé nhịp ngón tay trên sáo dưới tán lá sen; trâu nhịp chân, tai và đuôi. |
  | `chan-trau-tha-dieu.mp4` | Cánh diều nghiêng, đuôi diều bay và dây cong theo gió; cậu bé và trâu đung đưa. |
  | `nhan-nghia.mp4` | Em bé ôm cóc: nhịp thở, chớp mắt và cử động chân cóc; hoa sen và bướm. |
  | `le-tri.mp4` | Em bé ôm rùa: đầu, chân và mắt rùa chuyển động; mai rùa có hoa văn nhiều lớp. |
  | `ly-ngu-vong-nguyet.mp4` | Cá chép lớn và cá nhỏ quẫy đuôi, lay vây; gợn nước và ánh trăng phản chiếu. |
  | `chim-cong-thai-binh.mp4` | Chim công nghiêng đầu, nhịp cánh; từng lớp lông đuôi, hoa và bướm lay nhẹ. |
  | `hung-dua.mp4` | Người trèo dừa thả quả vào vạt áo người hứng; tàu lá, giỏ dừa, trẻ nhỏ và bướm. |
  | `hoi-du.mp4` | Đôi trai gái đung đưa trên đu tre; vạt áo, người xem vỗ tay, cờ hội. |
  | `hoi-keo-co.mp4` | Hai đội kéo co nhịp người và chân, tay nắm dây; dải lụa đỏ, khăn và cờ chuyển động. |
  | `hat-quan-ho.mp4` | Liền anh, liền chị đưa quạt; thuyền trôi nhẹ giữa hoa sen, nón quai thao và áo tứ thân. |
  | `mua-rong.mp4` | Thân rồng uốn lượn theo sào, hàm và râu lay; người múa, người đánh trống, đèn lồng và cờ. |
  | `ga-dan.mp4` | Gà mẹ cúi đầu, nhịp cánh và đuôi; sáu gà con bước, mổ thóc và chớp mắt. |
  | `ca-dan.mp4` | Cá lớn và ba cá nhỏ bơi, quẫy đuôi và lay vây; hoa lá sen, bọt nước và gợn sóng. |
  | `uy-tran-son-ha.mp4` | Hổ chớp mắt, nghiêng đầu, ve vẩy đuôi và nhịp thở; chân, vằn, râu, khóm trúc và cỏ. |

- Đồ họa vector được vẽ riêng cho vCraft, lấy cảm hứng từ các đề tài tranh dân gian tương ứng. Không phải tư liệu sản xuất của xưởng hay video do chủ tài khoản tải lên.
- Nguồn hình và chuyển động: `scripts/media/mouse-wedding-scene.mjs`. Clip được dựng từ các khung SVG bằng Canvas và MediaRecorder.
- Nguồn: `scripts/media/artwork-scenes.mjs` liệt kê các cảnh; hình nền và nét vẽ dùng chung ở `folk-art.mjs`. Các cảnh được dựng trong `rooster-scene.mjs`, `pigs-scene.mjs`, `blessings-scene.mjs`, `scholar-scene.mjs`, `pastoral-scenes.mjs`, `virtues-scenes.mjs`, `carp-scene.mjs`, `peacock-scene.mjs`. Tám cảnh mới có nguồn tại `coconut-scene.mjs`, `village-festivals.mjs`, `dragon-dance-scene.mjs`, `hen-scene.mjs`, `fish-family-scene.mjs`, `tiger-scene.mjs`, dùng các nét vẽ chung tại `festival-art.mjs`. Hình nền, nhân vật và chi tiết phụ đều được dựng bằng mã, không tải video từ bên thứ ba. Tham khảo bố cục từ các ảnh tranh đã có trong `public/art/`; tham khảo ý nghĩa đề tài tại [Ủy ban Nhà nước về người Việt Nam ở nước ngoài](https://scov.gov.vn/cong-tac-doi-ngoai/ngoai-giao-van-hoa/tim-hieu-net-doc-dao-cua-tranh-dong-ho-di-san-van-hoa-can-bao-ve-khan-cap.html).

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

Nhận tên có dấu/không dấu, dấu gạch nối và hậu tố kích thước. Có các tên rút gọn: Đại cát, Vinh hoa, Phú quý, Mục đồng, Nhân nghĩa, Lễ trí. Các tên rút gọn chỉ ghép khi đúng tên. Ba đề tài mục đồng **đọc sách / thổi sáo / thả diều** có clip riêng; bốn đề tài **Vinh hoa / Phú quý / Nhân nghĩa / Lễ trí** cũng ghép riêng theo đúng con vật. **Múa rồng** là cảnh người múa; không tự ghép cảnh này cho tranh **Chuột múa rồng**. Các mẫu chưa có clip tiếp tục hiển thị ảnh thành phẩm.

Video được tải và tự phát tắt tiếng khi cuộn tới, lặp liên tục; tự dừng khi rời vùng xem hoặc ẩn tab, tiếp tục khi quay lại. Nút tạm dừng nhỏ và nút tạm dừng chuyển động của trang vẫn dùng được. Khi thiết bị yêu cầu giảm chuyển động, chỉ phát sau thao tác người xem.
