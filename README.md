# Đại Việt Một Đời

Game pixel art thế giới mở, chơi trên trình duyệt. Bạn sống một cuộc đời dưới triều Trần: sinh năm Mậu Ngọ 1258 ở làng An Phú bên sông Tô Lịch, lớn lên, chọn đường đời, rồi đứng trước đêm quân Nguyên kéo đến làng năm 1285.

Sự kiện lịch sử trong game được đối chiếu với **Đại Việt sử ký toàn thư**.

## Chơi thử

Mở `index.html` bằng trình duyệt trên máy tính. Không cần cài đặt gì.

Hoặc bật GitHub Pages cho repo này (xem bên dưới) để chơi qua đường link.

## Điều khiển

| Phím | Tác dụng |
|---|---|
| `W` `A` `S` `D` / mũi tên | Đi lại (4 hướng) |
| `Shift` | Chạy |
| `E` | Nói chuyện, tương tác |
| `1`–`9` | Chọn đáp án trong hội thoại |
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

1. Vào **Settings → Pages** của repo.
2. Ở mục **Build and deployment**, chọn **Source: Deploy from a branch**.
3. Chọn nhánh `main`, thư mục `/ (root)`, bấm **Save**.
4. Đợi khoảng một phút, game sẽ có ở `https://magicalumbrella.github.io/Game/`.

## Kỹ thuật

- Một file HTML duy nhất, JavaScript thuần, vẽ bằng Canvas.
- Toàn bộ hình ảnh pixel art được vẽ bằng code, không dùng file ảnh.
- Tiến trình lưu trong `localStorage` của trình duyệt.

## Kế hoạch

- Chương hai: cuộc kháng chiến 1285 và trận Bạch Đằng năm 1288.
