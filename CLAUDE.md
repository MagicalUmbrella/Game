# CLAUDE.md — Đại Việt Một Đời

Ngữ cảnh dự án cho Claude Code. Đọc file này trước khi sửa game.

## Dự án là gì

Game pixel art thế giới mở chạy trên trình duyệt máy tính. Người chơi sống một đời dưới triều Trần: sinh năm Mậu Ngọ 1258 ở làng An Phú (hư cấu) bên sông Tô Lịch, ngoại thành Thăng Long. Lớn lên, chọn đường đời, đến chương một kết thúc ở đêm quân Nguyên kéo đến làng, tháng giêng năm 1285.

- **Chủ dự án:** sinh viên Việt Nam, giao tiếp bằng **tiếng Việt**. Mọi chữ trong game và mọi trả lời đều bằng tiếng Việt có dấu đầy đủ.
- **Trạng thái:** chương một hoàn chỉnh và chơi được. Chương hai (kháng chiến 1285 → trận Bạch Đằng 1288) chưa làm.
- **Chơi:** mở `index.html` bằng trình duyệt, hoặc qua GitHub Pages `https://magicalumbrella.github.io/Game/`.

## Nguyên tắc bắt buộc

1. **Sự kiện lịch sử phải theo Đại Việt sử ký toàn thư.** Chủ dự án có bản PDF Toàn thư (không nằm trong repo). Khi thêm hay sửa sự kiện, đối chiếu với sách. Không bịa chi tiết lịch sử. Chuyện chỉ có trong truyền thuyết thì đã bỏ: ví dụ chuyện Phạm Ngũ Lão bị giáo đâm vào đùi, và bài Hịch tướng sĩ không có trong phần Toàn thư đã đọc. Mỗi sự kiện lịch sử có một dòng `src(...)` tóm tắt điều Toàn thư chép, viết lại bằng lời mình, không chép nguyên văn bản dịch.
2. **Nhân vật và tình huống hư cấu phải ghi rõ là hư cấu** (README có mục này): làng An Phú, gia đình nhân vật, Cò, Thảo, bé Sen, thầy đồ Chu, bà Tư, cụ lý trưởng, lão võ sư Hoàng.
3. **Mọi lựa chọn phải có hậu quả** về sau, ít nhất hiện trong phần "Biên niên đời bạn" ở màn kết (`endChapter`). Đây là yêu cầu cốt lõi của chủ dự án.
4. **Phong cách pixel art vẽ bằng code.** Không dùng file ảnh. Tile 16×16 px, phóng to ×3 (`Z=3`). Sprite có viền đậm, tạo bằng hàm `outline()`.
5. **Nhân vật chỉ đi 4 hướng, không đi chéo.** Giữ hai phím thì theo phím bấm sau cùng (`lastAxis`).
6. **Một file duy nhất** `index.html`, JavaScript thuần, không build, không thư viện. Font từ Google Fonts (Alegreya SC, Be Vietnam Pro), có font dự phòng.
7. Khi sửa xong, chạy kiểm tra (xem dưới), rồi commit với trailer theo cấu hình phiên.

## Cấu trúc `index.html`

Toàn bộ code nằm trong một IIFE. Các phần đánh dấu bằng comment `/* ===== tên ===== */`, theo thứ tự:

| Phần | Nội dung |
|---|---|
| CSS | Giao diện HUD kiểu sơn mài viền đồng, cạnh vuông, bóng cứng. Chỉ một giao diện tối, có chủ đích. |
| constants | `TS=16`, `Z=3`, `T=48`, bản đồ `W=96 × H=72` ô. Mã ô: `G` cỏ, `WA` sông Tô Lịch (xanh), `WR` sông Hồng (nâu phù sa), `FI` ruộng, `PA` đường đất, `TR` cây, `MO` núi, `WL` tường thành, `SA` cát, `BR` cầu, `ST` đá lát, `GA` cổng thành. Hàm `canchi(năm)` tính can chi. |
| pixel helpers | `mk`, `shade`, `Hs` (hash cố định theo tọa độ), `outline`, `disc`, `flip`. |
| map | `buildMap()` sinh bản đồ bằng RNG có seed 1258, nên bản đồ luôn giống nhau. Có `BUILDINGS`, `DECOR`, `SIGNS`, `TREES`. `bsolid` đánh dấu ô bị chặn bởi nhà, decor, biển. |
| ground bake | `ground(mùa)` vẽ sẵn toàn bộ nền ra một canvas cho mỗi mùa (cache). |
| sprites | `personSprite(look, hướng, khung)`, trâu, cây, cây đa, giếng, thuyền, biển, nhà (`buildingSprite`, `roofPx` mái đầu đao). Mọi sprite được cache. |
| state | `S` là trạng thái game (lưu vào `localStorage` key `dvmd-save`). `MG` là minigame đang chạy hoặc `null`. `NPCS` có `show()` và `at()` cho vị trí động. `npcOn(n)` quyết định NPC có hiện không. |
| UI | `say()` mở hội thoại, `showModal()` xếp hàng modal (`modalQueue`), `toast()`, `floatAt()`, `renderHUD()`, `setKeys()` đổi dòng hướng dẫn phím. |
| dialogs | `talkX()` cho từng NPC, `doorAction()`, `chooseFocus()` + `fastForward()` để thời gian trôi nhanh, câu cá, làm đồng, toàn bộ cơ chế con trâu. |
| time & events | `advanceOne()` sang mùa; `EVENTS` là danh sách sự kiện `{id, y: năm, s: mùa 0–3, mg?, run}`; `eventCuoi`, `choosePath`, `setPath`. |
| minigame | Lụt 1270 (`startFlood`), kỳ thi 1275 (`QBANK`, `startExam`), tập trận 1283 (`startTraining`). |
| cao trào | Đêm tháng giêng 1285: `startClimax`, `clUpdate`, `finishClimax`, `endChapter` (biên niên). |
| intro | Màn tiêu đề, đặt tên, lễ thôi nôi, `startPlay(fromSave)`. |
| input & physics | Bàn phím, va chạm (`solidAt`, `canStand`), `update(dt)`, `findTarget()` tìm thứ để tương tác bằng E. |
| render | `render()` vẽ nền → vết chân trâu → danh sách sprite sắp theo y → nhãn → hiệu ứng mùa → HUD minigame → bản đồ nhỏ. |

### Giao diện minigame (`MG`)

Minigame là một object gắn vào `MG`, có thể có các hàm:
- `update(dt)`: gọi mỗi khung khi không có modal hay hội thoại.
- `findTarget()`: thay hoàn toàn tương tác E thông thường.
- `draw(list)`: thêm sprite vào danh sách vẽ.
- `post()`: phủ lớp màu sau sprite (mưa, bóng đêm có lỗ sáng).
- `hud()`: vẽ thanh trạng thái trên cùng.
- `key(k)`: bắt phím khi đang chơi (Space đánh, Q đuốc).
- `modalKey(k)`, `tick(dt)`: cho minigame chạy trong modal (tập trận).
- `speedMul()`: hệ số tốc độ người chơi.
- `hideNPC`: ẩn NPC thường.

Khi bắt đầu, thêm class `mg` vào `body` (đẩy toast xuống). Khi kết thúc: `MG=null; setKeys(); body.classList.remove('mg'); S.pending=null`.

Sự kiện có `mg:true` ghi `S.pending` để nếu người chơi tải lại trang giữa chừng, `resumePending()` chạy lại sự kiện đó.

## Trạng thái `S` (các trường quan trọng)

- `year`, `season` (0 Xuân … 3 Đông), `age()` = `year − 1258`. Bắt đầu chơi năm 1264, lúc 6 tuổi.
- `suc` (Sức, 4 mỗi mùa), `van`, `vo`, `duc`, `tien` (quan).
- `path`: `'van' | 'vo' | 'nong'`, chọn năm 1274.
- `rel.co`, `rel.thao`: mức thân thiết.
- `cha`, `thay`: còn sống hay không. `co`: `'village' | 'army'`. `thao`: `'none' | 'wife' | 'co' | 'gone'`. `married`, `child`.
- `flags`: hậu quả các lựa chọn, gồm `lang` (uy tín với làng), `de`, `dieu`, `exam`, `train`, `daumua`, `tang`, `tolich`, `duyet`, `dh`, `rival`, `coStay`, `nguKnows`, `vay`, `cuoiCo`.
- `buffalo`: `{x, y, st: 'pen'|'lost'|'run'|'follow', tracks, bolts, stop}`.
- `ev`: sự kiện đã xảy ra. `quests`: `hoc`, `trau`, `ca`, `sach`, `lua`.
- `toi`: món bốc lúc thôi nôi. `res`: kết quả màn cao trào.

`loadSave()` bù các trường thiếu cho bản lưu cũ. **Khi thêm trường mới vào `newState`, nhớ xử lý bản lưu cũ.**

## Mạch truyện chương một

| Năm (mùa) | Sự kiện | Loại |
|---|---|---|
| 1258 | Sinh ra, đặt tên | Toàn thư + hư cấu |
| 1259 | Lễ thôi nôi | Hư cấu |
| 1264 | Bắt đầu chơi, 6 tuổi | |
| 1265+ | Nhiệm vụ con trâu (từ 7 tuổi) | Hư cấu |
| 1266 Hạ | Cò rủ trốn học thả diều | Hư cấu |
| 1270 Xuân/Thu | 12 tuổi được vào kinh; lụt (minigame đắp đê) | Toàn thư |
| 1271 Đông | Đại Nguyên | Toàn thư |
| 1272 Xuân/Hạ | Đại Việt sử ký; Thảo về làng | Toàn thư / hư cấu |
| 1274 Xuân/Đông | Chọn đường đời; người Tống ở Nhai Tuân | / Toàn thư |
| 1275 Xuân | Khoa thi (đường văn chơi trắc nghiệm) | Toàn thư |
| 1276 Xuân | Hội xuân: Cò thú nhận thương Thảo | Hư cấu |
| 1278 | Đậu mùa (cha sống hay mất); tin Phạm Ngũ Lão; Nhân Tông lên ngôi | Toàn thư |
| 1279 Xuân | Cưới xin (ai lấy Thảo) | Hư cấu |
| 1281 | Bé Sen ra đời; thầy Chu mất | Hư cấu |
| 1282 Thu/Đông | Toa Đô; Bình Than, quả cam; Cò muốn theo Quốc Toản | Toàn thư + hư cấu |
| 1283 Đông | Quốc công tiết chế (đường võ chơi tập trận) | Toàn thư |
| 1284 | Vét sông Tô Lịch; duyệt binh Đông Bộ Đầu; Diên Hồng | Toàn thư |
| 1285 Xuân | Cao trào: đêm giặc đến làng → kết chương | Toàn thư + hư cấu |

### Hậu quả nối vào màn cao trào

- Đồng minh: Cò (nếu còn ở làng), trai làng (`flags.de==='saved'`, `flags.lang>=6`, đường nông; trừ đi nếu nói "hòa" ở Diên Hồng), quân Phạm Ngũ Lão đến khi còn 45 giây (nếu đã gặp anh Ngũ).
- Không vét sông Tô Lịch thì giặc lội qua chỗ nông. Giữ thóc thì thêm một bao phải cứu.
- Đường võ thêm máu và sát thương; tập trận xuất sắc thêm máu. Đường văn có đuốc nghi binh (đỗ thì thêm một cây). Đường nông vác thóc nhanh.
- Người bị giặc bắt đi được nhắc ở phần mở đầu chương hai.

## Kiểm tra

Có sẵn Playwright (Python) + Chromium. Cách làm đã dùng:

1. Tạo bản sao để test, thay dòng `titleScreen();` cuối file bằng `titleScreen();window.__dv={get S(){return S},get MG(){return MG},advance,startFlood,startClimax,startExam,startTraining,...};` để điều khiển trạng thái từ ngoài. **Không commit hook này vào `index.html`.**
2. Bắt `pageerror`, chụp màn hình và tự xem lại ảnh.
3. Các bài test đã viết: chạy hết game với lựa chọn ngẫu nhiên (3 lượt, không lỗi); BFS kiểm tra mọi NPC, cửa nhà, biển, chỗ đê vỡ, nơi trú ẩn, chỗ giấu trâu đều đi tới được; kiểm tra không đi chéo; kiểm tra trâu giật mình chạy.
4. Kiểm tra cú pháp nhanh: tách phần `<script>` ra file rồi `node --check`.

## Lỗi đã sửa (đừng để tái phát)

- Rừng bị cây chặn kín: đã mở đường mòn (`road(...)` trong `buildMap`). Thêm vùng mới thì kiểm tra lại bằng BFS.
- Sông Tô Lịch không nối với sông Hồng: dải cát của sông Hồng từng đè lên nước Tô Lịch.
- Con trâu hiện sẵn trong rừng từ năm 6 tuổi: giờ ở chuồng cạnh ruộng cho đến khi cha giao việc.
- Thời gian trôi nhanh chạy xuyên qua sự kiện: vòng lặp phải dừng khi `modalOpen`, không phải khi `modalQueue.length`.

## Hướng phát triển tiếp

- **Chương hai (1285–1288):** cứu người bị bắt; Chương Dương, Hàm Tử, giải phóng Thăng Long (1285); cuộc kháng chiến lần ba; **trận Bạch Đằng 1288** với cơ chế canh thủy triều, cắm cọc (ý tưởng gốc của chủ dự án). Đối chiếu Toàn thư năm Ất Dậu 1285 đến Mậu Tý 1288 trước khi viết.
- Cân bằng độ khó (tốc độ nước lũ, lượng giặc) cần người chơi thật thử.
- Có thể tách file khi game lớn hơn (ví dụ `src/` + script ghép), nhưng hiện tại giữ một file để GitHub Pages chạy thẳng.
