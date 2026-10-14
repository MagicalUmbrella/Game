# Đại Việt Một Đời

Game pixel art thế giới mở, chơi trên trình duyệt. Bạn sống một cuộc đời dưới triều Trần: sinh năm Mậu Ngọ 1258 ở làng An Phú bên sông Tô Lịch, lớn lên, chọn đường đời, rồi đứng trước đêm quân Nguyên kéo đến làng năm 1285.

Sự kiện lịch sử trong game được đối chiếu với **Đại Việt sử ký toàn thư**.

## Chơi thử

Chơi qua GitHub Pages: `https://magicalumbrella.github.io/Game/`.

Chạy trên máy (cần [Node.js](https://nodejs.org) 20 trở lên):

```bash
npm install
npm run dev      # mở http://localhost:5173, sửa code là trang tự tải lại
```

Mở thẳng `index.html` bằng cách bấm đúp không chạy được nữa, vì game đã tách thành nhiều module.

## Điều khiển

| Phím | Tác dụng |
|---|---|
| `W` `A` `S` `D` / mũi tên | Đi lại (4 hướng) |
| `Shift` | Chạy |
| `E` | Nói chuyện, tương tác |
| `1`–`9` | Chọn đáp án trong hội thoại |
| `C` | Bảng chỉ số: mỗi chỉ số đang ở mốc nào, mốc tiếp theo có tác dụng gì |
| `Esc` | Đóng hội thoại |
| `Space` | Đánh (màn cao trào) |
| `Q` | Cắm đuốc nghi binh (màn cao trào, đường văn) |

Game cần bàn phím, nên chơi trên máy tính.

## Nội dung chương một (1258–1285)

- **Tuổi thơ:** lễ thôi nôi, học chữ với thầy đồ, luyện võ, làm ruộng, câu cá. Nhiệm vụ tìm con trâu lạc bằng cách lần theo dấu chân trong rừng.
- **Chọn đường đời năm 16 tuổi:** văn (Quốc học viện), võ (hương binh, Giảng võ đường) hoặc nông.
- **Minigame:** đắp đê trong trận lụt năm 1270, kỳ thi năm 1275, tập trận năm 1283.
- **Tuyến truyện cá nhân:** tình bạn với Cò, chuyện với Thảo (cháu bà Tư), cha mẹ, thầy đồ Chu, anh Ngũ người Phù Ủng.
- **Cao trào:** đêm tháng giêng năm 1285, dẫn dân làng và thóc gạo vào rừng trước khi trời sáng.
- **Mọi lựa chọn đều có hậu quả.** Màn kết có phần "Biên niên đời bạn" liệt kê lại các lựa chọn và hệ quả.

## Sự kiện lịch sử (theo Toàn thư)

| Năm | Sự kiện |
|---|---|
| 1258 | Phá giặc ở Đông Bộ Đầu; Trần Thánh Tông lên ngôi; gió to làm rơi đỉnh tháp Báo Thiên |
| 1270 | Nước to, phố kinh đô phải đi bằng thuyền |
| 1271 | Mông Cổ đặt quốc hiệu Đại Nguyên |
| 1272 | Lê Văn Hưu soạn xong Đại Việt sử ký |
| 1274 | Người Tống sang quy phụ, ở phường Nhai Tuân |
| 1275 | Khoa thi, Đào Tiêu đỗ Trạng nguyên |
| 1278 | Dịch đậu mùa; Trần Nhân Tông lên ngôi |
| 1282 | Tin Toa Đô đem quân; Hội nghị Bình Than |
| 1283 | Hưng Đạo Vương làm Quốc công tiết chế |
| 1284 | Vét sông Tô Lịch; duyệt binh Đông Bộ Đầu; Hội nghị Diên Hồng |
| 1285 | Quân Nguyên đánh Vạn Kiếp, Gia Lâm; quân ta thích chữ "Sát Thát" |

Làng An Phú, gia đình nhân vật, Cò, Thảo, thầy đồ Chu, bà Tư và các tình huống cá nhân là hư cấu.

## Bật GitHub Pages

Workflow `.github/workflows/deploy.yml` tự build, chạy test rồi đưa game lên Pages mỗi lần push vào `main`. Chỉ cần bật một lần:

1. Vào **Settings → Pages** của repo.
2. Ở mục **Build and deployment**, chọn **Source: GitHub Actions**.
3. Push vào `main` (hoặc chạy lại workflow trong tab **Actions**). Game sẽ có ở `https://magicalumbrella.github.io/Game/`.

## Kỹ thuật

- JavaScript thuần chia thành ES module trong `src/`, đóng gói bằng [Vite](https://vite.dev). Vẽ bằng Canvas.
- Hình ảnh pixel art vẽ bằng code; riêng nhân vật vẽ bằng script `tools/ve_nguoi.py` ra ảnh `src/assets/nguoi.png`.
- Tiến trình lưu trong `localStorage` của trình duyệt.

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy thử trên máy, tự tải lại khi sửa code |
| `npm run build` | Build bản phát hành vào `dist/` |
| `npm run preview` | Xem bản đã build |
| `npm test` | Build bản test rồi chạy `tests/playtest.py` (cần `pip install playwright`) |

## Kế hoạch

- Chương hai: cuộc kháng chiến 1285 và trận Bạch Đằng năm 1288.
