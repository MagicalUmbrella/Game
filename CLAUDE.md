# CLAUDE.md — Đại Việt Một Đời

Ngữ cảnh dự án cho Claude Code. Đọc file này trước khi sửa game.

## Dự án là gì

Game pixel art thế giới mở chạy trên trình duyệt máy tính. Người chơi sống một đời dưới triều Trần: sinh năm Mậu Ngọ 1258 ở làng An Phú (hư cấu) bên sông Tô Lịch, ngoại thành Thăng Long. Lớn lên, chọn đường đời, đến chương một kết thúc ở đêm quân Nguyên kéo đến làng, tháng giêng năm 1285.

- **Chủ dự án:** sinh viên Việt Nam, giao tiếp bằng **tiếng Việt**. Mọi chữ trong game và mọi trả lời đều bằng tiếng Việt có dấu đầy đủ.
- **Trạng thái:** chương một hoàn chỉnh và chơi được. Chương hai (kháng chiến 1285 → trận Bạch Đằng 1288) chưa làm.
- **Chơi:** `npm install` rồi `npm run dev` (http://localhost:5173), hoặc qua GitHub Pages `https://magicalumbrella.github.io/Game/` (workflow tự build và đưa lên khi push vào `main`).
- **Quy mô:** chủ dự án muốn đây là dự án lớn, phát triển lâu dài. Tổ chức code cho dễ mở rộng.

## Nguyên tắc bắt buộc

1. **Sự kiện lịch sử phải theo Đại Việt sử ký toàn thư.** Chủ dự án có bản PDF Toàn thư (không nằm trong repo). Khi thêm hay sửa sự kiện, đối chiếu với sách. Không bịa chi tiết lịch sử. Chuyện chỉ có trong truyền thuyết thì đã bỏ: ví dụ chuyện Phạm Ngũ Lão bị giáo đâm vào đùi, và bài Hịch tướng sĩ không có trong phần Toàn thư đã đọc. Mỗi sự kiện lịch sử có một dòng `src(...)` tóm tắt điều Toàn thư chép, viết lại bằng lời mình, không chép nguyên văn bản dịch.
2. **Nhân vật và tình huống hư cấu phải ghi rõ là hư cấu** (README có mục này): làng An Phú, gia đình nhân vật, Cò, Thảo, bé Sen, thầy đồ Chu, bà Tư, cụ lý trưởng, lão võ sư Hoàng.
3. **Mọi lựa chọn phải có hậu quả** về sau, ít nhất hiện trong phần "Biên niên đời bạn" ở màn kết (`endChapter`). Đây là yêu cầu cốt lõi của chủ dự án.
4. **Phong cách pixel art vẽ bằng code.** Không dùng file ảnh. Tile 16×16 px, phóng to ×3 (`Z=3`). Sprite có viền đậm, tạo bằng hàm `outline()`.
5. **Nhân vật chỉ đi 4 hướng, không đi chéo.** Giữ hai phím thì theo phím bấm sau cùng (`lastAxis`).
6. **JavaScript thuần chia module trong `src/`, đóng gói bằng Vite.** Mỗi mảng lớn một file; phần mới (ví dụ chương hai, minigame mới) thì tạo file mới, đừng nhồi vào file có sẵn. Thêm thư viện npm chỉ khi thật cần và nói rõ lý do. Font từ Google Fonts (Alegreya SC, Be Vietnam Pro), có font dự phòng.
7. Khi sửa xong, chạy kiểm tra (xem dưới), rồi commit với trailer theo cấu hình phiên.

## Cấu trúc mã nguồn

```
index.html            khung HTML (canvas, HUD, hội thoại, modal), nạp src/main.js
src/main.js           khởi động: vòng lặp vẽ, màn tiêu đề, hook test (chỉ có ở --mode test)
src/style.css         giao diện HUD
src/*.js              mỗi file một phần, xem bảng dưới
src/minigames/*.js    lụt 1270, kỳ thi 1275, tập trận 1283
tests/playtest.py     test Playwright
.claude/agents/       agent game-tester
.github/workflows/    build, test, triển khai GitHub Pages
```

Mỗi file mở đầu bằng comment `/* ===== tên ===== */`. Các module import lẫn nhau (có vòng tròn). Hàm khai báo bằng `function` dùng được trong vòng tròn; còn `const`/`let` thì **đừng đọc giá trị của module khác ngay lúc nạp file** (ngoài hàm), có thể gặp lỗi TDZ.

`S` và `MG` khai báo trong `state.js`. Module khác chỉ đọc được, muốn gán thì gọi `setS(v)`, `setMG(v)` (quy tắc của ES module: không gán được biến import). Tương tự, biến `let` nào cần gán từ module khác thì thêm hàm `setX`.

| File | Nội dung |
|---|---|
| `style.css` | Giao diện HUD kiểu sơn mài viền đồng, cạnh vuông, bóng cứng. Chỉ một giao diện tối, có chủ đích. |
| `constants.js` | `TS=16`, `Z=3`, `T=48`, bản đồ `W=96 × H=72` ô. Mã ô: `G` cỏ, `WA` sông Tô Lịch (xanh), `WR` sông Hồng (nâu phù sa), `FI` ruộng, `PA` đường đất, `TR` cây, `MO` núi, `WL` tường thành, `SA` cát, `BR` cầu, `ST` đá lát, `GA` cổng thành. Hàm `canchi(năm)` tính can chi. |
| `pixel.js` | `mk`, `shade`, `Hs` (hash cố định theo tọa độ), `outline`, `disc`, `flip`. |
| `map.js` | `buildMap()` sinh bản đồ bằng RNG có seed 1258, nên bản đồ luôn giống nhau. Có `BUILDINGS`, `DECOR`, `SIGNS`, `TREES`. `bsolid` đánh dấu ô bị chặn bởi nhà, decor, biển. |
| `ground.js` | `ground(mùa)` vẽ sẵn toàn bộ nền ra một canvas cho mỗi mùa (cache). |
| `sprites.js` | Trâu, cây, cây đa, giếng, thuyền, biển, nhà (`buildingSprite`, `roofPx` mái đầu đao). Mọi sprite được cache. Chuyển tiếp `personSprite` từ `person.js`. |
| `person.js` | `personSprite(look, hướng, khung)`: người ghép từ mẫu điểm ảnh viết bằng chữ (đầu, thân, tay, chân; búi tó, khăn vấn, nón lá, khăn đỏ, râu, mũ trụ giặc). `look`: `shirt`, `hair` (`man`, `kid`, `old`, `woman`, `oldwoman`, `monk`), `kid`, `long`, `band`, `hat`, `spear`, `helm`, `plume`. Xem cả bảng bằng `python3 tests/sprite_sheet.py ảnh.png --scale 6 --only "Mẹ,Giặc"`. |
| `state.js` | `S` là trạng thái game (lưu vào `localStorage` key `dvmd-save`). `MG` là minigame đang chạy hoặc `null`. `NPCS` có `show()` và `at()` cho vị trí động. `npcOn(n)` quyết định NPC có hiện không. |
| `ui.js` | `say()` mở hội thoại, `showModal()` xếp hàng modal (`modalQueue`), `toast()`, `floatAt()`, `renderHUD()`, `setKeys()` đổi dòng hướng dẫn phím. |
| `dialogs.js` | `talkX()` cho từng NPC, `doorAction()`, `chooseFocus()` + `fastForward()` để thời gian trôi nhanh, câu cá, làm đồng, toàn bộ cơ chế con trâu. |
| `events.js` | `advanceOne()` sang mùa; `EVENTS` là danh sách sự kiện `{id, y: năm, s: mùa 0–3, mg?, run}`; `eventCuoi`, `choosePath`, `setPath`. |
| `minigames/` | Lụt 1270 (`startFlood`), kỳ thi 1275 (`QBANK`, `startExam`), tập trận 1283 (`startTraining`). `daily.js`: việc hằng ngày chơi trong modal 5–15 giây: tập viết nhớ nét (`startWriting`), luyện võ canh nhịp (`startDrill`), làm đồng bấm theo nhịp (`startField`), câu cá canh phao (`startFishing`); luôn có nút "Làm qua loa". `dailyReward(base,q)`: khá = mức cũ, giỏi +1, kém hoặc qua loa −1. |
| `pathfind.js` | `gridPath`, `nextStep`: tìm đường BFS cho người do máy điều khiển (giặc, người cùng đánh) để không đi xuyên sông, cây, nhà. |
| `life.js` | Chuyện đời thường (hư cấu): `LIFE` gồm 23 chuyện nhỏ theo tuổi, mùa (bắt dế, cháy xóm, năm hạn, cho vay…). `maybeLife()` sau mỗi lần sang mùa không có sự kiện lịch sử, cứ khoảng 1–2 mùa một chuyện. Lựa chọn ghi `S.life[id]`, có hậu quả và dòng trong mục "Những chuyện nhỏ" ở màn kết (`lifeChronicle`). Thêm chuyện mới: mỗi khóa kết quả phải có dòng `chron`. |
| `chains.js` | Chuỗi nhiệm vụ (hư cấu), mỗi mùa một bước, có hạn chót: dạy Cò biết chữ (10–14 tuổi, 3 buổi), mái nhà bà Tư cùng Thảo (1272–1278, chặt 3 bó tre ở chỗ `tre` trong `explore.js` rồi lợp mái), chép sách cho thầy Chu (Văn 20, trước khi thầy mất). `S.chains[id]={st,n,last}`, st: `off`, `on`, `done`, `no` (từ chối), `fail` (quá hạn). Mỗi kết cục có dòng biên niên (`chainChronicle`). |
| `explore.js` | Khám phá: `SPOTS` gồm 9 chỗ hay rải khắp bản đồ (gốc tre có hũ tiền, bụi lá thuốc, hang dế, bia đá ở chùa, kiếm gỉ, thuyền nan bãi sông Hồng, tổ chim, sỏi trắng, ông lái đò kể chuyện Đông Bộ Đầu). Lấp lánh khi lại gần (`exploreDraw`), bấm E (`exploreTarget`). Đồ nhặt được dùng ở chỗ khác: lá thuốc (trâu ốm, cha ốm), dế chọi (tặng Cò), kiếm gỉ (thợ rèn rèn lại 3 quan), sỏi trắng (tặng Thảo). `S.found[id]`. Thêm chỗ mới: chạy `npm test`, bài BFS kiểm tra tới được. |
| `stats.js` | Mốc chỉ số và tác dụng: `traiFromDuc`, `followFast`, `voHp`, `voDmg`, `voFast`, `DUC_FF_CAP`; bảng chỉ số `showStats()` (phím C). Đổi mốc thì sửa ở đây, đêm 1285 và bảng chỉ số cùng đọc. |
| `prep.js` | Lo trước ngày giặc đến (thu 1282 → hết 1284, hư cấu): `PREP` gồm dựng lán (cụ lý, 12 quan), rèn giáo cho trai làng (thợ rèn, 10), cất bớt thóc vào rừng (cha hoặc mẹ, 6). `prepChoice`, `prepClimax`, `prepChronicle`. |
| `climax.js` | Đêm tháng giêng 1285: `startClimax`, `clUpdate`, `finishClimax`, `endChapter` (biên niên). |
| `intro.js` | Màn tiêu đề, đặt tên, lễ thôi nôi, `startPlay(fromSave)`. |
| `input.js` | Bàn phím, va chạm (`solidAt`, `canStand`), `update(dt)`, `findTarget()` tìm thứ để tương tác bằng E. |
| `render.js` | `render()` vẽ nền → vết chân trâu → danh sách sprite sắp theo y → nhãn → hiệu ứng mùa → HUD minigame → bản đồ nhỏ. |

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

Khi bắt đầu, thêm class `mg` vào `body` (đẩy toast xuống). Khi kết thúc: `setMG(null); setKeys(); body.classList.remove('mg'); S.pending=null` (trong `state.js` thì gán `MG=null` trực tiếp).

Sự kiện có `mg:true` ghi `S.pending` để nếu người chơi tải lại trang giữa chừng, `resumePending()` chạy lại sự kiện đó.

## Trạng thái `S` (các trường quan trọng)

- `year`, `season` (0 Xuân … 3 Đông), `age()` = `year − 1258`. Bắt đầu chơi năm 1264, lúc 6 tuổi.
- `suc` (Sức, 4 mỗi mùa), `van`, `vo`, `duc`, `tien` (quan). **Đức gộp cả uy tín với làng** (trước đây là `flags.lang` ẩn): giúp làng, lo việc chung thì tăng; bỏ mặc làng, nói "hòa" thì giảm (`gain('duc', âm)`). `ducMerged`: bản lưu cũ đã quy `flags.lang` sang Đức (×3) chưa.
- `path`: `'van' | 'vo' | 'nong'`, chọn năm 1274.
- `rel.co`, `rel.thao`: mức thân thiết.
- `cha`, `thay`: còn sống hay không. `co`: `'village' | 'army'`. `thao`: `'none' | 'wife' | 'co' | 'gone'`. `married`, `child`.
- `flags`: hậu quả các lựa chọn, gồm `de`, `dieu`, `exam`, `train`, `daumua`, `tang`, `tolich`, `duyet`, `dh`, `rival`, `coStay`, `nguKnows`, `vay`, `cuoiCo`, `lan`, `giao`, `catThoc`.
- `paper`, `tonic`: mùa này đã mua giấy bút, thuốc bổ chưa (mỗi mùa một lần, đặt lại trong `advanceOne`).
- `buffalo`: `{x, y, st: 'pen'|'lost'|'run'|'follow', tracks, bolts, stop}`.
- `ev`: sự kiện đã xảy ra. `quests`: `hoc`, `trau`, `ca`, `sach`, `lua`.
- `toi`: món bốc lúc thôi nôi. `res`: kết quả màn cao trào.
- `found`: chỗ đã khám phá. `chains`: tiến độ chuỗi nhiệm vụ.
- `life`: kết quả chuyện đời thường; `lifeWait`: số mùa nghỉ trước chuyện kế; `trauYeu`: trâu yếu đến hết năm này (làm đồng bớt 1 quan); `vayYear`: năm cho hàng xóm vay.

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
| 1282 Thu/Đông | Toa Đô (mở việc "Lo trước ngày giặc đến"); Bình Than, quả cam; Cò muốn theo Quốc Toản | Toàn thư + hư cấu |
| 1283 Đông | Quốc công tiết chế (đường võ chơi tập trận) | Toàn thư |
| 1284 | Vét sông Tô Lịch; duyệt binh Đông Bộ Đầu; Diên Hồng | Toàn thư |
| 1285 Xuân | Cao trào: đêm giặc đến làng → kết chương | Toàn thư + hư cấu |
| mọi năm | Chuyện đời thường xen giữa (`life.js`), quãng trống dài nhất 6 mùa | Hư cấu |

### Hậu quả nối vào màn cao trào

- Đồng minh: Cò (nếu còn ở làng); trai làng theo Đức (20/40/60 → 1/2/3 người), thêm một nếu giữ được đê 1270, một nếu đường nông, bớt một nếu nói "hòa" ở Diên Hồng, tối đa 4; quân Phạm Ngũ Lão đến khi còn 45 giây (nếu đã gặp anh Ngũ). Đức 60 thì dân làng đi theo nhanh hơn.
- Bạn vào rừng thì giặc thôi đuổi bạn; không còn ai ngoài rừng thì giặc đi lục lọi các chỗ trong làng (`LOOT` trong `climax.js`), không đứng chờ ở bìa rừng.
- Giặc và người cùng đánh đi theo đường thật (`src/pathfind.js`). Đã vét sông Tô Lịch thì giặc chỉ qua được bằng cầu; không vét thì giặc lội qua sông (chậm một nửa) và có thêm chỗ xuất hiện ở bờ bắc. Giữ thóc thì thêm một bao phải cứu.
- Võ cho mọi đường: 25 thêm 1 máu, 50 đánh mạnh hơn, 75 thêm 1 máu và ra đòn nhanh hơn. Đường võ thêm 2 máu và sát thương; tập trận xuất sắc thêm máu. Đường nông vác thóc nhanh, thêm một trai làng.
- **Đường văn** (người có chữ, mưu trí, không giỏi đánh): bấm E với dân làng là **chỉ đường**, người ấy tự tìm lối vào rừng (chậm hơn khi được dẫn, giặc gặp trên đường vẫn bắt được). **Đuốc nghi binh** (Q): 2 cây, cứ 25 Văn thêm một cây (tối đa 5), đỗ Thái học sinh thêm một cây, mỗi cây cháy 10 giây. Hằng số `SELF_SPEED`, `TORCH_T`, hàm `torches()` ở đầu `src/climax.js`.
- **Ngã xuống** (hết máu): người đang đi theo bạn bị bắt nếu không có đồng minh đỡ; người chưa dẫn hoặc đang tự đi thì kẹt lại trong làng (thoát nạn, nhà bị đốt), không bị bắt.
- Lo trước (`prep.js`): dựng lán thì bà Tư, bé Sen ở sẵn trong rừng; rèn giáo thì trai làng thêm 1 máu, đánh mạnh gấp đôi, cầm giáo; cất thóc thì một bao thóc giấu sẵn.
- Người bị giặc bắt đi được nhắc ở phần mở đầu chương hai.

## Kiểm tra

**Gọi agent `game-tester` (`.claude/agents/game-tester.md`) sau mỗi lần sửa game.** Hoặc tự chạy:

1. `npm run build`: bắt lỗi cú pháp và lỗi import.
2. `npm test` (khoảng 20 giây): build bản test (`vite build --mode test` → `dist-test/`, có hook `window.__dv` khai báo cuối `src/main.js`) rồi chạy `tests/playtest.py`. Cần `pip install playwright`. Chromium có sẵn trong `/opt/pw-browsers`, script tự tìm, đừng chạy `playwright install`. Các phần:
   - **Cân bằng điểm:** đến lớp phải gấp ít nhất 3 lần tự học, tự học không vượt trần.
   - **Cơ chế** (`tests/checks.js`): BFS từ nhà tới mọi NPC (nhiều năm, nhiều nhánh truyện), cửa nhà, biển, chuồng trâu, đống đất và chỗ đê vỡ, người và thóc năm 1285, rừng trú ẩn, chỗ giấu trâu; giữ hai phím không đi chéo; trâu lạc để lại dấu chân, chạy lại gần thì trâu giật mình, đi chậm thì nắm được thừng.
   - **Bot dịch chuyển** (`tests/bots.js`): đặt nhân vật cạnh mục tiêu rồi gọi tương tác của minigame. Dùng trong lượt chơi ngẫu nhiên; có bài riêng kiểm tra thắng/thua lụt, cứu đủ/bỏ dở đêm 1285 và kết quả hiện trong biên niên.
   - **Độ khó** (`tests/bots.js`): bot bấm phím thật (gửi KeyboardEvent, đi theo đường BFS) chơi lụt 1270 và đêm 1285 với ba mức tay nghề (giỏi: chạy, không chần chừ; khá; kém) và vài kiểu nhân vật, in bảng. Bot gọi `__dv.step(dt)` từng nhịp nên chạy nhanh hơn thời gian thật. Test chỉ báo lỗi khi bot giỏi với nhân vật mạnh nhất vẫn thua; còn lại là số liệu để cân bằng. `--no-bots` để bỏ phần này.
   - **Chạy thật** vài giây đi lại, lụt, đêm giặc để kiểm tra phần vẽ; **chơi ngẫu nhiên** hết chương 3 lượt; bắt mọi `pageerror`.
   - `Math.random` trong trang có seed (`--seed`), nên kết quả gần như lặp lại được.
3. Xem lại ảnh chụp (`--shots DIR`).
4. Cần điều khiển thêm hàm nào từ test thì thêm vào `window.__dv` trong `src/main.js`. Hook chỉ có trong bản test, bản phát hành tự loại bỏ. Thêm minigame mới thì viết thêm bot cho nó trong `tests/bots.js`.

### Cân bằng điểm

- Việc hằng ngày là màn chơi ngắn (`minigames/daily.js`); các con số dưới đây là mức chơi khá, giỏi thì +1, kém hoặc làm qua loa thì −1.
- Đến lớp thầy đồ: +2 Văn mỗi Sức (+1 nếu đã biếu Tứ thư). Võ sư: +2 Võ (+3 đường võ, +1 có kiếm). Quốc học viện +3, Giảng võ đường +4. Một mùa dùng hết Sức được 8 điểm trở lên.
- "Chọn việc chính" ở nhà là tự học, tự luyện: +1 mỗi mùa (+2 nếu đúng đường), **có trần** 25 (45 nếu đúng đường), mùa đang dở chỉ tính theo Sức còn lại. Muốn Văn 55 (loại 2 đáp án khi thi) hay Võ cao thì phải đến lớp.
- "Lo việc làng" ở nhà: +2 Đức mỗi mùa, trần `DUC_FF_CAP` = 40. Đức 60 phải giúp làng thật (cụ lý +3 Đức mỗi Sức) và qua các sự kiện.
- Giấy bút (+2 Văn, 3 quan) và thuốc bổ (+2 Sức, 5 quan) mỗi mùa chỉ mua được một lần, để tiền không thay được việc học. `FF_RATE`, `FF_CAP` ở `src/dialogs.js`; đổi thì chạy lại `npm test`.

## Lỗi đã sửa (đừng để tái phát)

- Rừng bị cây chặn kín: đã mở đường mòn (`road(...)` trong `buildMap`). Thêm vùng mới thì kiểm tra lại bằng BFS.
- Sông Tô Lịch không nối với sông Hồng: dải cát của sông Hồng từng đè lên nước Tô Lịch.
- Con trâu hiện sẵn trong rừng từ năm 6 tuổi: giờ ở chuồng cạnh ruộng cho đến khi cha giao việc.
- Thời gian trôi nhanh chạy xuyên qua sự kiện: vòng lặp phải dừng khi `modalOpen`, không phải khi `modalQueue.length`.
- Giặc đêm 1285 từng đi thẳng xuyên sông, cây, nhà; điểm xuất hiện bờ bắc từng rơi vào ô cây, tường thành. Test `terrain` trong `tests/checks.js` canh lỗi này.
- Màn kết 1285 từng ghi "Không bỏ lại ai" cả khi có người bị bắt.
- Giặc từng đứng dàn hàng ở bìa rừng khi bạn đã vào rừng (vẫn coi bạn là mục tiêu mà không vào được). Test `noCamping` canh lỗi này.
- Đường văn từng gần như luôn ngã xuống ở đêm 1285 (chỉ có 2–3 cây đuốc 7 giây, điểm Văn vô dụng), và ngã xuống khi không có đồng minh từng làm mất hết người chưa cứu. Bảng độ khó trong `npm test` canh lại việc này.

## Hướng phát triển tiếp

- **Chương hai (1285–1288):** cứu người bị bắt; Chương Dương, Hàm Tử, giải phóng Thăng Long (1285); cuộc kháng chiến lần ba; **trận Bạch Đằng 1288** với cơ chế canh thủy triều, cắm cọc (ý tưởng gốc của chủ dự án). Đối chiếu Toàn thư năm Ất Dậu 1285 đến Mậu Tý 1288 trước khi viết.
- Cân bằng độ khó (tốc độ nước lũ, lượng giặc) cần người chơi thật thử.
- Chương hai nên nằm trong thư mục riêng (ví dụ `src/chapter2/`), tách dữ liệu sự kiện khỏi logic.
