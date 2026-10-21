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
| `M` | Bản đồ thế giới |
| `J` | Thu gọn, mở khung Việc cần làm |
| `N` | Về nhà ngủ, sang mùa mới |
| `A` `D` luân phiên, `Space` | Đấu vật ở sới hội xuân |
| `A` `D` luân phiên, `W` `S` | Chèo đò sông Hồng (chèo, lái ngược hay xuôi dòng) |
| `Esc` | Đóng hội thoại |
| `Space` | Đánh (màn cao trào) |
| `Q` | Cắm đuốc nghi binh (màn cao trào, đường văn) |
| `E` cạnh tên đầu toán | Đổi mình lấy con tin, hoặc lừa hắn (đường văn) |

Game cần bàn phím, nên chơi trên máy tính.

## Nội dung chương một (1258–1285)

- **Tuổi thơ:** lễ thôi nôi, học chữ với thầy đồ, luyện võ, làm ruộng, câu cá. Nhiệm vụ tìm con trâu lạc bằng cách lần theo dấu chân trong rừng.
- **Chọn đường đời năm 16 tuổi:** văn (Quốc học viện), võ (hương binh, Giảng võ đường) hoặc nông.
- **Minigame:** đắp đê trong trận lụt năm 1270, kỳ thi năm 1275, tập trận năm 1283.
- **Tuyến truyện cá nhân:** tình bạn với Cò, chuyện với Thảo (cháu bà Tư), cha mẹ, thầy đồ Chu, anh Ngũ người Phù Ủng.
- **Cao trào ba hồi:** đêm tháng giêng năm 1285. Hồi một giặc tụ bên kia sông; hồi hai giặc tràn vào, làng cháy, lửa chặn lối; hồi ba tên đầu toán bắt người làm con tin ở sân đình. Bạn có thể hạ hắn, lừa hắn (đường văn), hoặc đổi mình lấy con tin. Đánh thua hắn, lừa hỏng, ngã xuống mà không ai đỡ, hoặc đổi mình, thì bạn **bị bắt**: bị trói dắt qua làng cháy, ra bến Đông Bộ Đầu, ngồi thuyền giặc qua sông Hồng lên thủy trại, rồi bị giải sâu vào doanh trại quân Nguyên ở Gia Lâm và chứng kiến đêm ở trại cho đến khi trời sáng. Chương hai sẽ bắt đầu từ đó.
- **Bản đồ thế giới liền một mảnh** (phím `M`) chứa đất cho mọi chương: Thăng Long và làng An Phú; Gia Lâm bên kia sông Hồng; xuôi sông Hồng là Chương Dương, Tây Kết, Hàm Tử, sông Thiên Mạc, Long Hưng, Thiên Trường; phía đông là Vạn Kiếp, núi Phả Lại, Bình Than, sông Bạch Đằng, Yên Hưng, Vân Đồn ngoài biển. Khoảng cách đã thu nhỏ, không đúng tỉ lệ. Vùng nào truyện chưa tới thì chưa vào được: chương một chỉ đi lại quanh làng và kinh thành.
- **Doanh trại quân Nguyên ở Gia Lâm** (dựng từ đêm tháng giêng 1285): rào cọc, chòi canh, trướng Ô Mã Nhi, lều tướng, ba dãy chuồng tù, chỗ tra hỏi, bãi ngựa, kho lương, lò rèn; thủy trại có thuyền chiến neo ở bờ sông.
- **Chỉ số:** Văn, Võ, Đức (lòng mình), Tiếng (uy tín với làng), Thể trạng (sức khỏe, quyết định mỗi mùa có 3–5 Sức). Đức và Tiếng tách nhau: làm điều đúng mà không ai thấy thì được Đức, việc cho làng mà người ta thấy thì được Tiếng; có lựa chọn được cái này mất cái kia. Mốc chỉ số mở ra việc làm được (viết đơn cho làng, cõng người, luyện trai làng thành đội, chỉ đường cho người nhà, nhận đòn thay người khác). Phím `C` xem bảng chỉ số.
- **Nghề**, học qua việc làm: bơi lội, chèo thuyền, thuốc nam, cưỡi ngựa, rèn. Phải làm cho khéo mới tính: quai búa đúng nhịp, nhớ đúng cây thuốc, cầm chèo đưa khách qua sông Hồng rồi quay về. Mỗi nghề có tác dụng ngay trong chương một và là chỗ dựa cho chương hai.
- **Màn chơi giữa game:** năm dịch đậu mùa 1278 chạy chữa cho cha (hái lá thuốc, sắc thuốc, cứu cả đứa nhỏ nhà bên nếu kịp); năm 1280 mỗi đường đời một màn riêng: nhà nông bắt sâu cứu lúa, người đi học tìm chứng cứ vạch tờ văn tự giả, hương binh đuổi toán cướp trâu ra bãi sông; hội xuân có sới vật ở đình, thắng ba đô thành đô vật của làng.
- **Người trong làng có giọng riêng:** mẹ hay lo ăn mặc, nói ca dao; cha ít lời, nói chuyện trời đất ruộng nương; thầy Chu dẫn Luận ngữ; lão võ sư cộc lốc; bà Tư nhớ ông nhà; Cò bông lơn. Lời đổi theo tuổi, theo mùa, và nhắc lại chuyện cũ bạn đã làm.
- **Lên mốc chỉ số thì có chuyện:** thầy khen, bà Tư nhờ viết câu đối, trai xóm Đông thách vật tay, cụ xã nhờ việc… thấy mình giỏi lên ngay lúc ấy.
- **Đỡ lặp:** còn nhiều Sức thì làm hết một lần; phím `N` về nhà ngủ từ bất cứ đâu.
- **Thăng tiến** (danh vị hiện dưới tên trên bảng trạng thái): đường văn đỗ thì thành Thái học sinh; trượt thi thì chọn ở lại Quốc học viện, về làng phụ thầy Chu dạy trẻ (thầy mất thì thành thầy đồ làng), hoặc làm lại viên ở huyện; năm 1283 có thể bỏ bút theo kiếm. Đường võ đứng đầu buổi tập trận 1283 (hoặc đạt mà có Võ 50, Tiếng 30) thì lên đội trưởng hương binh. Đường nông mua thêm ruộng (2 → 6 thửa), làm đồng và mùa gặt được thêm tiền. Năm 1283 làng chọn người coi việc làng thay cụ xã. Mỗi nấc đều đổi đêm 1285 (thêm trai làng, dân đi theo nhanh, dựng lán rẻ) và có dòng trong biên niên.
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

Làng An Phú, gia đình nhân vật, Cò, Thảo, thầy đồ Chu, bà Tư, ông Cả Lợi, ông lái đò, chị Lụa và các tình huống cá nhân là hư cấu. Chức việc của nhân vật (trợ giáo, thầy đồ, lại viên ở huyện, đội trưởng hương binh, xã chính) và việc làng chọn người năm 1283 là hư cấu; chỉ lệ đặt xã quan (1242) và thi lại viên (1261) là theo Toàn thư. Người coi việc làng gọi là "cụ xã" (xã chính, theo lệ đặt xã quan năm 1242), không dùng chữ "lý trưởng" vì đó là tên chức đời sau. Tên đầu toán giặc, cu Tí nhà bên, chuyện làng An Phú bị đốt đêm 12 tháng giêng là hư cấu; việc nhân vật bị bắt và có mặt trong trại Ô Mã Nhi lúc Đỗ Khắc Chung đến là hư cấu, còn lời đối đáp của Đỗ Khắc Chung theo Toàn thư (mục tháng giêng năm 1285, viết lại bằng lời thường). Đường giải tù, bố cục doanh trại và thủy trại ở Gia Lâm, người làng bên bị nhốt cùng là hư cấu; Toàn thư chỉ chép giặc đánh vào Gia Lâm, Vũ Ninh, Đông Ngàn ngày 12 tháng giêng năm 1285. Trên bản đồ thế giới, các làng ở những vùng khác là hư cấu; vị trí địa danh theo chú thích của bản dịch Toàn thư, khoảng cách đã thu nhỏ; cờ lớn của giặc dựng ở bến Đông Bộ Đầu và việc giặc thấy chữ "Sát Thát" thì giận dữ là theo Toàn thư. Chương hai: việc trốn khỏi trại giặc, ông Bảy, chị Nhài làng Đông, cảnh tản cư, ông Đoàn và đội dân binh là hư cấu; tin Trần Kiện hàng giặc, Trần Bình Trọng bị bắt ở bãi Đà Mạc (tháng 2 năm 1285) theo Toàn thư. Cảnh nhân vật gặp anh Ngũ (Phạm Ngũ Lão lúc trẻ) bên đường đi Phù Ủng là hư cấu. Toàn thư (mục năm 1320, khi ông mất) chép ông người làng Phù Ủng, rất thích đọc sách, thích ngâm thơ, hơn hai mươi tuổi được Hưng Đạo Vương thấy có kỳ tài; câu thơ "Hoành sáo giang sơn cáp kỷ thu" game dẫn theo đúng bản Toàn thư ấy.

## Bật GitHub Pages

Workflow `.github/workflows/deploy.yml` tự build, chạy test rồi đưa game lên Pages mỗi lần push vào `main`. Chỉ cần bật một lần:

1. Vào **Settings → Pages** của repo.
2. Ở mục **Build and deployment**, chọn **Source: GitHub Actions**.
3. Push vào `main` (hoặc chạy lại workflow trong tab **Actions**). Game sẽ có ở `https://magicalumbrella.github.io/Game/`.

## Kỹ thuật

- JavaScript thuần chia thành ES module trong `src/`, đóng gói bằng [Vite](https://vite.dev). Vẽ bằng Canvas.
- Hình ảnh pixel art vẽ bằng code; riêng nhân vật vẽ bằng script `tools/ve_nguoi.py` ra ảnh `src/assets/nguoi.png`.
- Tiến trình lưu trong `localStorage` của trình duyệt.
- Bản đồ thế giới 480 × 240 ô, nền vẽ theo từng mảnh 32 × 32 ô lúc cần (vẽ trước các mảnh quanh chỗ đang đứng khi máy rảnh). Thêm `?mo=het` vào địa chỉ trang để mở mọi vùng khi muốn xem bản đồ.

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy thử trên máy, tự tải lại khi sửa code |
| `npm run build` | Build bản phát hành vào `dist/` |
| `npm run preview` | Xem bản đã build |
| `npm test` | Build bản test rồi chạy `tests/playtest.py` (cần `pip install playwright`) |

## Kế hoạch

- Chương hai: cuộc kháng chiến 1285 và trận Bạch Đằng năm 1288.
