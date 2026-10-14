# CLAUDE.md — Đại Việt Một Đời

Ngữ cảnh dự án cho Claude Code. Đọc file này trước khi sửa game.

## Dự án là gì

Game pixel art thế giới mở chạy trên trình duyệt máy tính. Người chơi sống một đời dưới triều Trần: sinh năm Mậu Ngọ 1258 ở làng An Phú (hư cấu) bên sông Tô Lịch, ngoại thành Thăng Long. Lớn lên, chọn đường đời, đến chương một kết thúc ở đêm quân Nguyên kéo đến làng, tháng giêng năm 1285.

- **Chủ dự án:** sinh viên Việt Nam, giao tiếp bằng **tiếng Việt**. Mọi chữ trong game và mọi trả lời đều bằng tiếng Việt có dấu đầy đủ.
- **Trạng thái:** chương một hoàn chỉnh và chơi được. Chương hai (kháng chiến 1285 → trận Bạch Đằng 1288) chưa làm.
- **Chơi:** `npm install` rồi `npm run dev` (http://localhost:5173), hoặc qua GitHub Pages `https://magicalumbrella.github.io/Game/` (workflow tự build và đưa lên khi push vào `main`).
- **Quy mô:** chủ dự án muốn đây là dự án lớn, phát triển lâu dài. Tổ chức code cho dễ mở rộng.

## Nguyên tắc bắt buộc

1. **Sự kiện lịch sử phải theo Đại Việt sử ký toàn thư.** Bản PDF Toàn thư nằm ở gốc repo: `Dai-viet-su-ki-toan-thu.pdf` (2546 trang, bản dịch tiếng Việt). Đọc bằng `pdftotext -layout Dai-viet-su-ki-toan-thu.pdf /tmp/tt.txt` rồi tìm theo năm dạng `[1285]` (đời Trần Thánh Tông, Nhân Tông nằm khoảng dòng 10500–12500). Khi thêm hay sửa sự kiện, đối chiếu với sách. Không bịa chi tiết lịch sử. Chuyện chỉ có trong truyền thuyết thì đã bỏ, ví dụ chuyện Phạm Ngũ Lão bị giáo đâm vào đùi (Toàn thư không chép). Bài Hịch tướng sĩ thì Toàn thư có chép, ở mục năm 1300 khi Hưng Đạo Vương mất; tiểu sử, bài thơ Thuật hoài ("Hoành sáo giang sơn…") của Phạm Ngũ Lão ở mục năm 1320. Giữ đúng chữ của bản dịch này. Mỗi sự kiện lịch sử có một dòng `src(...)` tóm tắt điều Toàn thư chép, viết lại bằng lời mình, không chép nguyên văn bản dịch.
2. **Nhân vật và tình huống hư cấu phải ghi rõ là hư cấu** (README có mục này): làng An Phú, gia đình nhân vật, Cò, Thảo, bé Sen, thầy đồ Chu, bà Tư, cụ lý trưởng, lão võ sư Hoàng.
3. **Mọi lựa chọn phải có hậu quả** về sau, ít nhất hiện trong phần "Biên niên đời bạn" ở màn kết (`endChapter`). Đây là yêu cầu cốt lõi của chủ dự án.
4. **Phong cách pixel art.** Tile 16×16 px, phóng to ×3 (`Z=3`), viền đậm. Cảnh vật, đồ vật vẽ bằng code (viền bằng `outline()`). **Người** theo mẫu chủ dự án chọn (pixel thô, đầu to, viền đen dày, màu tươi phẳng, mắt vuông 2×2): vẽ bằng script `tools/ve_nguoi.py` ra ảnh `src/assets/nguoi.png`, game đọc ảnh này (chủ dự án đã đồng ý dùng file ảnh; sửa được bằng Aseprite, Piskel, nhưng chạy lại script sẽ ghi đè).
5. **Mọi nhân vật chỉ đi 4 hướng, không đi chéo**, cả người chơi lẫn NPC, giặc, dân làng, đồng minh, con trâu. Người chơi giữ hai phím thì theo phím bấm sau cùng (`lastAxis`). Người do máy điều khiển đi bằng `step4` (`pathfind.js`), đừng cộng thẳng theo vector chéo.
6. **JavaScript thuần chia module trong `src/`, đóng gói bằng Vite.** Mỗi mảng lớn một file; phần mới (ví dụ chương hai, minigame mới) thì tạo file mới, đừng nhồi vào file có sẵn. Thêm thư viện npm chỉ khi thật cần và nói rõ lý do. Font từ Google Fonts (Alegreya SC, Be Vietnam Pro), có font dự phòng.
7. Khi sửa xong, chạy kiểm tra (xem dưới), rồi commit với trailer theo cấu hình phiên.

## Cấu trúc mã nguồn

```
index.html            khung HTML (canvas, HUD, hội thoại, modal), nạp src/main.js
src/main.js           khởi động: vòng lặp vẽ, màn tiêu đề, hook test (chỉ có ở --mode test)
src/style.css         giao diện HUD
src/*.js              mỗi file một phần, xem bảng dưới
src/minigames/*.js    lụt 1270, kỳ thi 1275, tập trận 1283
src/assets/           nguoi.png + nguoi.json: ảnh mọi nhân vật (do tools/ve_nguoi.py sinh ra)
tools/ve_nguoi.py     vẽ sprite người (Python + PIL)
tests/playtest.py     test Playwright
.claude/agents/       agent game-tester
.github/workflows/    build, test, triển khai GitHub Pages
```

Mỗi file mở đầu bằng comment `/* ===== tên ===== */`. Các module import lẫn nhau (có vòng tròn). Hàm khai báo bằng `function` dùng được trong vòng tròn; còn `const`/`let` thì **đừng đọc giá trị của module khác ngay lúc nạp file** (ngoài hàm), có thể gặp lỗi TDZ.

`S` và `MG` khai báo trong `state.js`. Module khác chỉ đọc được, muốn gán thì gọi `setS(v)`, `setMG(v)` (quy tắc của ES module: không gán được biến import). Tương tự, biến `let` nào cần gán từ module khác thì thêm hàm `setX`.

| File | Nội dung |
|---|---|
| `style.css` | Giao diện HUD kiểu sơn mài viền đồng, cạnh vuông, bóng cứng, đinh đồng ở bốn góc khung (`.panel::before`), dải hồi văn ở mép trên khung lớn, thông báo kiểu giấy dó. Chỉ một giao diện tối, có chủ đích. |
| `icons.js` | Biểu tượng pixel vẽ bằng code (mẫu chữ): Văn cuộn sách, Võ kiếm, Đức hoa sen, tiền đồng xu, Sức bát cơm, tim, bốn mùa. `ico(tên, cỡ)` trả về thẻ `<img>`. `chips(ghi chú)` đổi "+2 Văn", "−1 Sức" thành nhãn màu có biểu tượng. |
| `portrait.js` | `portrait(tên người nói)`: chân dung cắt từ sprite, cho khung hội thoại. `banner(mùa)`: tranh phong cảnh pixel theo mùa ở đầu khung sự kiện (modal có dòng đầu bắt đầu bằng tên mùa). |
| `constants.js` | `TS=16`, `Z=3`, `T=48`, bản đồ thế giới `W=480 × H=240` ô (`W0×H0` = 96×72 là phần bản đồ gốc ở góc tây bắc, sinh bằng RNG). Mã ô: `G` cỏ, `WA` sông Tô Lịch (xanh), `WR` sông Hồng (nâu phù sa), `FI` ruộng, `PA` đường đất, `TR` cây, `MO` núi, `WL` tường thành, `SA` cát, `BR` cầu, `ST` đá lát, `GA` cổng thành, `DK` đê, `BI` biển. Hàm `canchi(năm)` tính can chi. |
| `pixel.js` | `mk`, `shade`, `Hs` (hash cố định theo tọa độ), `outline`, `disc`, `flip`. |
| `map.js` | `buildMap()` sinh bản đồ bằng RNG có seed 1258, nên bản đồ luôn giống nhau. Đê sông Hồng (ô `DK`, rộng 2 ô, đi lại được) chạy dọc bờ tây, cách mép bãi một ô; chỗ sông Tô Lịch chảy qua là cống (ô `BR` ghi trong `CULVERT`, đi lại như cầu). Có `BUILDINGS`, `DECOR`, `SIGNS`, `TREES`. `bsolid` đánh dấu ô bị chặn bởi nhà, decor, biển. Chỉ sinh phần gốc (vòng lặp giới hạn `W0`, `H0` để chuỗi RNG không đổi), rồi gọi `buildWorld` (`world.js`) cho phần còn lại và gộp nhà, giếng, biển của các vùng khác vào `BUILDINGS`, `DECOR`, `SIGNS`. `TREES` loại 4 là sú vẹt (ven Bạch Đằng, bờ biển). |
| `world.js` | **Bản đồ thế giới** (không import module nào ngoài `constants.js`). Sông: `hongX(y)` sông Hồng (phần gốc giữ công thức cũ, xuống dưới trôi về đông nam), `RIVERS` (nhánh sang đông tới Bình Than, hai sông phía bắc, Thái Bình, một sông nối Hồng với Thái Bình, Kinh Thầy → Bạch Đằng), `coastX` bờ biển, đảo Vân Đồn. `buildWorld(api)` sinh địa hình: đồng bằng nhiều ruộng, ao; đồi Chí Linh, núi Phả Lại, núi đá vôi gần Bạch Đằng; đường sá; 32 làng hư cấu (`WBUILD`, `WDECOR`), chùa; biển địa danh `WSIGNS` (chỉ ghi vị trí theo chú thích bản dịch Toàn thư, không kể trước sự việc); `PLACES` (nhãn trên bản đồ M); `FERRIES` (bến đò, bấm E sang bờ kia). Trong phần gốc chỉ được sửa bờ đông sông Hồng (`okSet`). **Vùng**: `REGIONS` (`anphu`, `gialam`, `phianam`, `hamtu`, `vankiep`, `bachdang`; `ch` là chương mở), `regionId(x,y)`, `locked(S,x,y)`, `openRegion(S,id)` ghi vào `S.regions`. Chương một chỉ mở `anphu`. `?mo=het` trên địa chỉ trang mở mọi vùng (để xem). `CAMP`, `THUY`: chỗ doanh trại, thủy trại. |
| `trai.js` | **Doanh trại quân Nguyên ở Gia Lâm** (bố cục hư cấu): rào cọc ba cổng (`GATES`), chòi canh (`TOWERS`), trướng Ô Mã Nhi (`CMD`), lều tướng (`GENS`), lều lính, ba chuồng tù (`PENS`, chuồng chính `PEN` ngay trước trướng), chỗ tra hỏi (`TORTURE`), bãi ngựa (`HORSE`, ngựa vẽ bằng code), lò rèn (`FORGE`, đe, giá giáo), kho lương (`GRAN`, bao thóc, xe), nồi nấu; thủy trại có cầu tàu, thuyền chiến neo (`SHIPS`), hàng cọc. `campUp()`: trại dựng từ đêm 1285 (`S.res`) hoặc đang trong cảnh bị giải. `campSolid(x,y)` chặn đi lại (input.js dùng chung), `drawCamp(list)` vẽ phần thấy trên màn hình, `campFolk()` lính tuần, thợ rèn, lính gác (vị trí theo đồng hồ). Chương hai dùng lại được (trốn trại, đốt kho lương, cứu người ở các chuồng). |
| `ground.js` | Nền vẽ **theo mảnh** `CH=32` ô: `groundChunk(mùa,cx,cy)` (cache LRU `CACHE` mảnh), `drawGround` vẽ các mảnh đang thấy, vẽ trước các mảnh quanh đó lúc rảnh (`bake` là generator, mỗi lần chạy 6 ms nên không khựng; mảnh cần thấy ngay thì vẽ một mạch, khoảng 0,1–0,15 giây). `prewarm` cho màn tiêu đề. `distTo` tính trong mảnh có lề `MG=3` ô nên ghép mảnh không lộ đường nối. `overview(mùa)`: ảnh một điểm ảnh mỗi ô cho bản đồ nhỏ và bản đồ M. Tô từng điểm ảnh bằng nhiễu mịn (`vn`, `fbm`): cỏ loang, bờ đất ẩm sát nước, ranh giới cỏ với đường, cát lượn theo nhiễu; nước sâu nông theo khoảng cách tới bờ (`distTo`), bọt ven bờ, vệt sóng; ruộng có bờ (cứ 6 ô một bờ dọc), lúa theo mùa; núi có vách, vết nứt. Chi tiết đặt lên trên (`details`): khóm cỏ, hoa, đá, sỏi, sen bèo ven sông Tô Lịch, cầu, cổng. Không đổi ô nào của bản đồ.
| `sprites.js` | Trâu, giếng, thuyền, biển, nhà (`buildingSprite`; `roofPx`: mái rơm tô từng sợi, mép tua, nóc buộc lạt, mái ngói âm dương, đầu đao; `wallPx`: vách trát đất, cột gỗ, xà, nền đá; cửa mành tre). Mọi sprite được cache. Chuyển tiếp `personSprite` (person.js) và cây (scenery.js). |
| `scenery.js` | Cây (`treeSprite(mùa, loại)`: 0 cây tán, 1 bụi tre, 2 cau, 3 chuối; `banyanSprite`), tán lá tô bằng `leafBall`. Rừng phía tây chủ yếu cây tán và tre (loại chọn trong `TREES` ở `map.js`). Bạn đứng sau cây thì cây mờ đi (`render.js`). Đồ vật `PROPS`: đống rơm, chum nước cạnh nhà (vật cản, ghi `bsolid`), bụi cây (ngoài khu làng), lau sậy ven sông Tô Lịch (chỉ để nhìn). |
| `walls.js` | Tường thành vẽ thành vật dựng đứng (`WALLS`, `wallSprite`), cao 12 điểm ảnh: đoạn ngang có lối đi lát đá, lỗ châu mai phía ngoài, vách gạch; đoạn dọc có lỗ châu mai phía ngoài; cổng có vòm và cửa gỗ, cổng nam có lầu mái ngói (`TOWERS`, `towerSprite`). Va chạm vẫn theo ô `WL`, `GA`. |
| `person.js` | Đọc sprite người từ `src/assets/nguoi.png` (`loadPeople()`, `main.js` chờ nạp xong mới vẽ). `personSprite(look, hướng, khung)`: `look = {id, kid?}`, `id` là mã nhân vật trong `nguoi.json` (`ban_be`, `ban_nong`, `ban_van`, `ban_vo`, `co_be`, `co`, `co_do`, `thao`, `me`, `me_gia`, `cha`, `cha_gia`, `batu`, `sen`, `thay`, `vosu`, `su`, `ly`, `hsach`, `hren`, `tong`, `dan1`, `gom`, `linh`, `quan`, `hocquan`, `voquan`, `ngu`, `ngu_tuong`, `trai`, `trai_giao`, `giac`, `giac_ky`); khung `0–2` là bước đi, `'a0'` vung lên, `'a1'` chém (người có vũ khí). Hướng phải lật từ trái. `isKid(look)`: trẻ con (nhãn tên thấp hơn). `npcLook(n)` trong `state.js`: Cò lớn lên, theo quân thì buộc khăn đỏ; cha mẹ già đi từ 1280. Ô 32×40, chân ở (16, 37). Nhãn tên cao 2 ô (trẻ con 1,55). |
| `tools/ve_nguoi.py` | Vẽ mọi nhân vật từ mẫu điểm ảnh viết bằng chữ (tóc, mũ nón, mặt, râu, thân áo, chân, vũ khí), tự thêm viền đen, xuất `nguoi.png` (mỗi hàng một nhân vật, 15 khung: 3 bước × 3 hướng + 2 khung chém × 3 hướng) và `nguoi.json`. Mỗi nhân vật chính một kiểu tóc, áo riêng (bảng `PEOPLE`). Thêm nhân vật: thêm một dòng vào `PEOPLE`, chạy `python3 tools/ve_nguoi.py` (`--xem a.png --to 5` để xem phóng to), rồi dùng `look:{id:'…'}`. Xem trong trình duyệt: `python3 tests/sprite_sheet.py ảnh.png --scale 4 --only "Mẹ,Giặc"`. |
| `state.js` | `S` là trạng thái game (lưu vào `localStorage` key `dvmd-save`). `MG` là minigame đang chạy hoặc `null`. `NPCS` có `show()` và `at()` cho vị trí động. `npcOn(n)` quyết định NPC có hiện không. |
| `ui.js` | Khung "Việc cần làm" chỉ hiện việc đang làm, thu gọn được (bấm tiêu đề hoặc phím J). `floatAt` xếp lệch dòng khi nhiều chữ nổi cùng chỗ. `say()` mở hội thoại (chân dung, thẻ tên, chữ hiện dần), `showModal()` xếp hàng modal (`modalQueue`), `toast()`, `floatAt()`, `renderHUD()`, `setKeys()` đổi dòng hướng dẫn phím. |
| `dialogs.js` | `talkX()` cho từng NPC, `doorAction()`, `chooseFocus()` + `fastForward()` để thời gian trôi nhanh, câu cá, làm đồng, toàn bộ cơ chế con trâu. |
| `events.js` | `advanceOne()` sang mùa; `EVENTS` là danh sách sự kiện `{id, y: năm, s: mùa 0–3, mg?, run}`; `eventCuoi`, `choosePath`, `setPath`. |
| `minigames/` | Lụt 1270 (`startFlood`), kỳ thi 1275 (`QBANK`, `startExam`), tập trận 1283 (`startTraining`). `daily.js`: việc hằng ngày chơi trong modal 5–15 giây: tập viết nhớ nét (`startWriting`), luyện võ canh nhịp (`startDrill`), làm đồng bấm theo nhịp (`startField`), câu cá canh phao (`startFishing`); luôn có nút "Làm qua loa". `dailyReward(base,q)`: khá = mức cũ, giỏi +1, kém hoặc qua loa −1. |
| `pathfind.js` | `gridPath`, `nextStep`: tìm đường BFS cho người do máy điều khiển (giặc, người cùng đánh, Cò ở màn lụt) để không đi xuyên sông, cây, nhà. `step4(o,tx,ty,m)`: bước đi 4 hướng, đi hết một trục rồi mới rẽ (giữ `o.axis`), trả về `[dx,dy]`. Bị đánh bật cũng theo trục trội (`axisDir` trong `climax.js`). BFS chỉ tìm trong khung bao điểm đầu, đích thêm `PAD` ô (bản đồ lớn). Đêm 1285 giặc, người cùng đánh chỉ đi trong vùng An Phú (`inHome` ở `climax.js`). |
| `life.js` | Chuyện đời thường (hư cấu): `LIFE` gồm 29 chuyện nhỏ theo tuổi, mùa (bắt dế, cháy xóm, năm hạn, cho vay…). `maybeLife()` sau mỗi lần sang mùa không có sự kiện lịch sử, cứ khoảng 1–2 mùa một chuyện. Lựa chọn ghi `S.life[id]`, có hậu quả và dòng trong mục "Những chuyện nhỏ" ở màn kết (`lifeChronicle`). Thêm chuyện mới: mỗi khóa kết quả phải có dòng `chron`. |
| `chains.js` | Chuỗi nhiệm vụ (hư cấu), mỗi mùa một bước, có hạn chót: dạy Cò biết chữ (10–14 tuổi, 3 buổi), mái nhà bà Tư cùng Thảo (1272–1278, chặt 3 bó tre ở bụi tre bất kỳ (`TREES` loại 1, bụi gần nhất lấp lánh; xử lý trong `exploreTarget`, `exploreDraw`) rồi lợp mái), chép sách cho thầy Chu (Văn 20, trước khi thầy mất). `S.chains[id]={st,n,last}`, st: `off`, `on`, `done`, `no` (từ chối), `fail` (quá hạn). Mỗi kết cục có dòng biên niên (`chainChronicle`). |
| `explore.js` | Khám phá: `SPOTS` gồm 9 chỗ hay rải khắp bản đồ (gốc tre có hũ tiền, bụi lá thuốc, hang dế, bia đá ở chùa, kiếm gỉ, thuyền nan bãi sông Hồng, tổ chim, sỏi trắng, ông lái đò kể chuyện Đông Bộ Đầu). Lấp lánh khi lại gần (`exploreDraw`), bấm E (`exploreTarget`). Đồ nhặt được dùng ở chỗ khác: lá thuốc (trâu ốm, cha ốm), dế chọi (tặng Cò), kiếm gỉ (thợ rèn rèn lại 3 quan), sỏi trắng (tặng Thảo). `S.found[id]`. Thêm chỗ mới: chạy `npm test`, bài BFS kiểm tra tới được. |
| `stats.js` | Mốc chỉ số và tác dụng: `traiFromDuc`, `followFast`, `voHp`, `voDmg`, `voFast`, `DUC_FF_CAP`; bảng chỉ số `showStats()` (phím C). Đổi mốc thì sửa ở đây, đêm 1285 và bảng chỉ số cùng đọc. |
| `prep.js` | Lo trước ngày giặc đến (thu 1282 → hết 1284, hư cấu): `PREP` gồm dựng lán (cụ lý, 12 quan), rèn giáo cho trai làng (thợ rèn, 10), cất bớt thóc vào rừng (cha hoặc mẹ, 6). `prepChoice`, `prepClimax`, `prepChronicle`. |
| `climax.js` | Đêm tháng giêng 1285, chia **ba hồi** (`ACT2`, `ACT3`, xem mục dưới): `startClimax`, `clUpdate`, lửa (`ignite`, `BURN`, `fireAt`, `MG.blockAt` cho `input.js`), tên đầu toán (`startAct3`, `bossUpdate`, `trick`, `surrender`), lời nói trên đầu nhân vật (`say`, `leadLine`, `allyLine`, vẽ trong `bubbles`), băng chữ tên hồi, rung màn hình (`MG.shake`, `render.js`), bản đồ nhỏ (`clMini` qua `MG.mini`), `finishClimax` (bị bắt thì chuyển sang `startEscort` ở `camp.js`), `endChapter` (biên niên). Động tác chém: bạn, người cùng đánh, giặc có `swing` đếm ngược (0,24 giây; giặc 0,3 khi đánh trúng), vẽ khung vung lên `'a0'` rồi chém `'a1'`, kèm vệt sáng `slashFx`. |
| `camp.js` | Khi bị bắt (hư cấu, trừ chi tiết ghi `src`): `startEscort(res)` là MG `'escort'`: bị trói dắt qua làng cháy, ra bến Đông Bộ Đầu (cờ lớn của giặc), sang sông (màn tối, lên thủy trại `LANDING`), đi đường bộ sâu vào doanh trại tới chuồng tù (`PEN`). Đứng yên thì bị lôi đi, tụt xa thì bị giật dây. Rồi `startCamp()` là MG `'camp'`: kiểm hình xăm "Sát Thát", Đỗ Khắc Chung vào trại Ô Mã Nhi (hình `o_ma_nhi`, `khac_chung`; lời đối đáp là mảng `TALK`, có `src`), lựa chọn khi sứ giả đi qua chuồng (`S.capt.seen` hoặc `S.capt.map` +3 Văn), trời sáng → `endChapter`. Bố cục trại ở `trai.js`. Chỉ chờ thì cả hai cảnh khoảng 130 giây. **`BRANCH`** (khóa theo `how`: `fight`, `trick`, `surrender`, `down`) là chỗ để thêm cảnh riêng cho từng cách bị bắt (chủ dự án sẽ nghĩ sau); hiện chỉ có câu mở đầu `lead`. |
| `intro.js` | Màn tiêu đề, đặt tên, lễ thôi nôi, `startPlay(fromSave)`. |
| `input.js` | Bàn phím, va chạm (`solidAt`, `canStand`: thêm vùng chưa mở trừ khi `MG.roam`, rào lều doanh trại `campSolid`), `update(dt)` (chạm ranh vùng khóa thì nhắc bằng toast; đổi vùng thì vẽ lại tên vùng trên bảng trạng thái), `findTarget()` tìm thứ để tương tác bằng E (có bến đò khi cả hai bờ đã mở). Phím M mở bản đồ thế giới. |
| `render.js` | `render()` vẽ nền (theo mảnh) → vết chân trâu → danh sách sprite sắp theo y → nhãn → hiệu ứng mùa → HUD minigame → bản đồ nhỏ → bản đồ thế giới. Cây, đồ vật, nhà, biển chia theo ô lưới 16 ô (`near`) để mỗi khung chỉ duyệt thứ gần màn hình. Bản đồ nhỏ là cửa sổ 128×72 ô quanh người chơi, vùng chưa mở tô tối (`lockLayer`). `drawWorldMap` (phím M, body có class `wm` để ẩn HUD). Doanh trại được vẽ ở đây khi `campUp()` mà không có cảnh bị giải. |

### Giao diện minigame (`MG`)

Minigame là một object gắn vào `MG`, có thể có các hàm:
- `update(dt)`: gọi mỗi khung khi không có modal hay hội thoại.
- `findTarget()`: thay hoàn toàn tương tác E thông thường.
- `draw(list)`: thêm sprite vào danh sách vẽ.
- `post()`: phủ lớp màu sau sprite (mưa, bóng đêm có lỗ sáng).
- `hud()`: vẽ thanh trạng thái trên cùng.
- `key(k)`: bắt phím khi đang chơi (Space đánh, Q đuốc).
- `modalKey(k)`, `tick(dt)`: cho minigame chạy trong modal (tập trận).
- `cam()`: trả `[x, y]` để camera nhìn chỗ khác thay vì theo người chơi (cảnh trại giặc).
- `hideProp(p)`: ẩn bụi, đá… (`PROPS`) ở chỗ minigame cần trống.
- `roam`: bỏ qua khóa vùng (cảnh bị giải sang Gia Lâm).
- `speedMul()`: hệ số tốc độ người chơi.
- `hideNPC`: ẩn NPC thường; `hide: ['co']`: chỉ ẩn vài NPC (màn lụt có Cò riêng chạy vác bao, `M.co`).

Khi bắt đầu, thêm class `mg` vào `body` (đẩy toast xuống). Khi kết thúc: `setMG(null); setKeys(); body.classList.remove('mg'); S.pending=null` (trong `state.js` thì gán `MG=null` trực tiếp).

Sự kiện có `mg:true` ghi `S.pending` để nếu người chơi tải lại trang giữa chừng, `resumePending()` chạy lại sự kiện đó.

## Trạng thái `S` (các trường quan trọng)

- `year`, `season` (0 Xuân … 3 Đông), `age()` = `year − 1258`. Bắt đầu chơi năm 1264, lúc 6 tuổi.
- `suc` (Sức, 4 mỗi mùa), `van`, `vo`, `duc`, `tien` (quan). **Đức gộp cả uy tín với làng** (trước đây là `flags.lang` ẩn): giúp làng, lo việc chung thì tăng; bỏ mặc làng, nói "hòa" thì giảm (`gain('duc', âm)`). `ducMerged`: bản lưu cũ đã quy `flags.lang` sang Đức (×3) chưa.
- `path`: `'van' | 'vo' | 'nong'`, chọn năm 1274.
- `rel.co`, `rel.thao`: mức thân thiết.
- `cha`, `thay`: còn sống hay không. `co`: `'village' | 'army'`. `thao`: `'none' | 'wife' | 'co' | 'gone'`. `married`, `child`.
- `flags`: hậu quả các lựa chọn, gồm `de`, `dieu`, `exam`, `train`, `daumua`, `tang`, `tolich`, `duyet`, `dh`, `rival`, `coStay`, `nguKnows`, `vay`, `cuoiCo`, `lan`, `giao`, `catThoc`.
- `regions`: các vùng bản đồ đã mở ngoài An Phú (`openRegion` trong `world.js`). Bản lưu cũ không có thì coi là chưa mở vùng nào.
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
| 1285 Xuân | Cao trào ba hồi: đêm giặc đến làng, tên đầu toán, có thể bị bắt (cảnh trại giặc, Đỗ Khắc Chung) → kết chương | Toàn thư + hư cấu |
| mọi năm | Chuyện đời thường xen giữa (`life.js`), quãng trống dài nhất 6 mùa | Hư cấu |

### Hậu quả nối vào màn cao trào

- **Ba hồi** (đồng hồ 150 giây đếm ngược, hằng số đầu `src/climax.js`):
  - *Hồi 1 · Trống làng* (150 → 125): giặc tụ dần ở bờ bắc sông Tô Lịch quanh đống lửa (tối đa 4, `st:'stage'`), chưa sang sông; bạn sang tận nơi thì chúng xông ra. HUD ghi "giặc tụ N", bản đồ nhỏ chấm đỏ. Đưa hết mọi người vào rừng sớm thì sang hồi 2 ngay.
  - *Hồi 2 · Làng cháy* (125 → 45): tù và rúc, toán đứng chờ lần lượt ào qua cầu (`e.wake`), giặc tiếp tục kéo đến. Cứ 13 giây một nóc nhà bốc cháy (`BURN`: nha2, nha1, batu, home, truong, vo); ô đất trước cửa nhà cháy thành lửa chặn lối 30 giây. Lửa chỉ đặt vào ô nào **không cắt đường vào rừng** của bạn, người còn ngoài làng, bao thóc (`stillReachable`), không đặt sát chỗ ai đang đứng. Test `acts` canh việc này.
  - *Hồi 3 · Tên đầu toán* (từ 45, hoặc 12 giây sau khi đã đưa hết mọi người vào rừng): bạn hồi 1 máu; tù và gọi toán cướp rút (giặc đang có đều chạy về, không thêm giặc mới); cu Tí nhà bên kẹt trong xóm. Tên đầu toán (8 máu, hình `giac_dau`) bắt người gần nhất còn ngoài rừng làm con tin; không còn ai thì hắn lôi sẵn cu Tí. Hắn giải con tin ra sân đình (`DINH`), kèm 1 lính canh (đường võ 2). Hạ hắn thì con tin được thả; bấm E cạnh hắn thì hỏi **đổi mình lấy con tin** (bị bắt, con tin vào rừng) hoặc, đường văn một lần, **lừa hắn** là quân Trần đã vây làng (`trickChance`: 35% + Văn/100 + 10% nếu đỗ, tối đa 90%; hỏng thì **bị bắt** ngay, `how:'trick'`). Hết máu khi tên đầu toán còn đứng thì cũng **bị bắt** (`how:'fight'`), dù còn người cùng đánh. Trời sáng mà con tin còn trong tay hắn thì người ấy bị bắt đi. Kết thúc sớm ('done') chỉ khi hắn đã chết hoặc không giữ con tin.
- Đồng minh: Cò (nếu còn ở làng); trai làng theo Đức (20/40/60 → 1/2/3 người), thêm một nếu giữ được đê 1270, một nếu đường nông, bớt một nếu nói "hòa" ở Diên Hồng, tối đa 4. Đã gặp anh Ngũ: còn 80 giây thì nghe tù và quân ta (hy vọng), còn 30 giây thì quân Phạm Ngũ Lão tới **đánh** giặc (không làm giặc bỏ chạy ngay), để tên đầu toán cho bạn. Chưa gặp: không ai đến, có người nói "Chỉ còn chúng ta thôi". Đức 60 thì dân làng đi theo nhanh hơn.
- **Lời nói trên đầu nhân vật** nhắc lại đời bạn: Cò nhắc chuyện thả diều hoặc chuyện bị bỏ đứng ngoài ngõ lúc ăn mừng đỗ đạt; trai làng nhắc năm giữ đê; cụ lý nhắc câu "hòa" ở Diên Hồng; cha nhắc năm đậu mùa. Thêm câu mới thì sửa `leadLine`, `allyLine`.
- Bạn vào rừng thì giặc thôi đuổi bạn; không còn ai ngoài rừng thì giặc đi lục lọi các chỗ trong làng (`LOOT` trong `climax.js`), không đứng chờ ở bìa rừng.
- Giặc và người cùng đánh đi theo đường thật (`src/pathfind.js`). Đã vét sông Tô Lịch thì giặc chỉ qua được bằng cầu; không vét thì giặc lội qua sông (chậm một nửa) và có thêm chỗ xuất hiện ở bờ bắc. Giữ thóc thì thêm một bao phải cứu.
- Võ cho mọi đường: 25 thêm 1 máu, 50 đánh mạnh hơn, 75 thêm 1 máu và ra đòn nhanh hơn. Đường võ thêm 2 máu và sát thương; tập trận xuất sắc thêm máu. Đường nông vác thóc nhanh, thêm một trai làng.
- **Đường văn** (người có chữ, mưu trí, không giỏi đánh): bấm E với dân làng là **chỉ đường**, người ấy tự tìm lối vào rừng (chậm hơn khi được dẫn, giặc gặp trên đường vẫn bắt được). **Đuốc nghi binh** (Q): 2 cây, cứ 25 Văn thêm một cây (tối đa 5), đỗ Thái học sinh thêm một cây, mỗi cây cháy 10 giây. Hằng số `SELF_SPEED`, `TORCH_T`, hàm `torches()` ở đầu `src/climax.js`.
- **Ngã xuống** (hết máu, không đánh tên đầu toán): còn người cùng đánh đứng được thì bạn được kéo vào rừng ('down'). Không còn ai thì **bạn bị bắt** ('captured'), người đang đi theo bạn bị bắt cùng; người chưa dẫn hoặc đang tự đi thì kẹt lại trong làng (thoát nạn, nhà bị đốt).
- **Bị bắt** ('captured' hoặc 'surrender'): ghi `S.capt = {how, for, seen?, map?}` cho chương hai. `how` là `'fight' | 'trick' | 'surrender' | 'down'`. Sau đêm là cảnh bị giải sang trại giặc bờ đông (`camp.js`, chơi được, xem bảng module). `S.res` thêm `how`, `burnt` (nhà bị đốt), `lostWho` (người bị bắt cùng). Biên niên và câu mở đầu chương hai đổi theo.
- Lo trước (`prep.js`): dựng lán thì bà Tư, bé Sen ở sẵn trong rừng; rèn giáo thì trai làng thêm 1 máu, đánh mạnh gấp đôi, cầm giáo; cất thóc thì một bao thóc giấu sẵn.
- Người bị giặc bắt đi được nhắc ở phần mở đầu chương hai. `S.res` có thêm `boss` ('killed' | 'tricked' | 'surrender' | 'took' | 'alive'), `hostage`, `ti`, `captured`.

## Kiểm tra

**Gọi agent `game-tester` (`.claude/agents/game-tester.md`) sau mỗi lần sửa game.** Sửa đồ họa, câu chữ, sự kiện thì gọi thêm agent `nguoi-choi-thu` (`.claude/agents/nguoi-choi-thu.md`): chạy `tests/tham_quan.py` chụp ảnh mọi vùng theo 4 mùa, hội thoại từng NPC, từng khung sự kiện của một lượt chơi, đêm 1285 (kèm `chu.jsonl` chứa toàn bộ chữ), rồi xem bằng mắt và báo lỗi đồ họa, chính tả, câu chữ, nhịp truyện. Hoặc tự chạy:

1. `npm run build`: bắt lỗi cú pháp và lỗi import.
2. `npm test` (khoảng 20 giây): build bản test (`vite build --mode test` → `dist-test/`, có hook `window.__dv` khai báo cuối `src/main.js`) rồi chạy `tests/playtest.py`. Cần `pip install playwright`. Chromium có sẵn trong `/opt/pw-browsers`, script tự tìm, đừng chạy `playwright install`. Các phần:
   - **Cân bằng điểm:** đến lớp phải gấp ít nhất 3 lần tự học, tự học không vượt trần.
   - **Cơ chế** (`tests/checks.js`): BFS từ nhà tới mọi NPC (nhiều năm, nhiều nhánh truyện), cửa nhà, biển, chuồng trâu, đống đất và chỗ đê vỡ, người và thóc năm 1285, rừng trú ẩn, chỗ giấu trâu; giữ hai phím không đi chéo; trâu lạc để lại dấu chân, chạy lại gần thì trâu giật mình, đi chậm thì nắm được thừng. `world`: kích thước bản đồ khớp `checks.js`; chương một BFS không lan ra ngoài An Phú, đi xuống phía nam bị chặn và có lời nhắc; mở hết vùng thì đi bộ cộng đò tới mọi biển địa danh, đầu đò, cổng trại; trong trại từ cổng tây tới được chuồng tù, trướng, cổng đông, cổng nam; vẽ một mảnh nền không quá 1,5 giây. `captivity`: thua tên đầu toán hay lừa hỏng thì bị bắt (đúng `how`), cảnh giải sang trại và trong trại chạy hết, người chơi không kẹt, biên niên đúng (khoảng 110 giây).
   - **Bot dịch chuyển** (`tests/bots.js`): đặt nhân vật cạnh mục tiêu rồi gọi tương tác của minigame. Dùng trong lượt chơi ngẫu nhiên; có bài riêng kiểm tra thắng/thua lụt, cứu đủ/bỏ dở đêm 1285 và kết quả hiện trong biên niên.
   - **Độ khó** (`tests/bots.js`): bot bấm phím thật (gửi KeyboardEvent, đi theo đường BFS) chơi lụt 1270 và đêm 1285 với ba mức tay nghề (giỏi: chạy, không chần chừ; khá; kém) và vài kiểu nhân vật, in bảng. Bot gọi `__dv.step(dt)` từng nhịp nên chạy nhanh hơn thời gian thật. Test chỉ báo lỗi khi bot giỏi với nhân vật mạnh nhất vẫn thua (đêm 1285: có lượt ngã xuống, hoặc từ hai lượt trở lên mất hai người; một lượt xấu là dao động thời gian, bỏ qua); còn lại là số liệu để cân bằng. `--no-bots` để bỏ phần này.
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
- Đánh nhau đêm 1285: giặc từng đứng chồng lên nhau (62% thời gian khi có đuốc) và kẹt đứng im quanh đuốc cắm sát rừng; bấm Space hay chém trượt vì phải quay mặt trước. Nay giặc dàn quanh đuốc, chỗ lục lọi (`around`), tự đẩy nhau ra (`separate`), kẹt thì tìm đường lại; đuốc cắm trong rừng không dụ được ai; đánh thì tự quay mặt về giặc gần nhất. Test `combat` canh lỗi này.
- Dân đang đi theo bạn từng bị giặc đang đánh bạn tiện tay bắt mất khi chạm vào (14 lần trong 6 lượt bot). Nay người đi theo chỉ bị bắt bởi tên đang nhắm vào chính người đó (`e.tgt`), giặc vừa bị chém thì choáng 0,8 giây (`e.stun`), dân đi theo thấy giặc gần thì dừng và lùi ra. Test `combat` đếm số lần này.
- Nhân vật nhìn nghiêng từng như bị gù (thân dày, lưng phình sau gáy, đầu chìa ra trước): `slim()` trong `tools/ve_nguoi.py` làm thân nghiêng mỏng lại phía lưng. Ria mép từng dính vào mắt thành mặt nạ: ria đặt ở hàng miệng, chừa một hàng da dưới mắt.
- Cánh hoa, lá rơi từng dính vào camera khi đi lại và rơi theo tốc độ khung hình; nay gắn với cảnh, tính theo giây.
- Ba hồi đêm 1285: `BURN[M.burnI++]` đặt trong callback `find` từng làm chỉ số nhảy cóc, chỉ một nhà cháy; tên đầu toán từng đứng cách sân đình nửa ô mà không bao giờ "tới nơi" (ngưỡng tới nơi phải lớn hơn ngưỡng dừng bước); lựa chọn đổi mình từng đọc con tin lúc bấm phím (có thể đã được thả, lỗi null), nay giữ con tin lúc hiện lựa chọn. Đứng cạnh tên đầu toán mà bấm E dẫn người từng có thể lỡ tay đầu hàng: nay đổi mình phải xác nhận trong hộp hỏi.
- Đường văn từng gần như luôn ngã xuống ở đêm 1285 (chỉ có 2–3 cây đuốc 7 giây, điểm Văn vô dụng), và ngã xuống khi không có đồng minh từng làm mất hết người chưa cứu. Bảng độ khó trong `npm test` canh lại việc này.

- Bản đồ thế giới: vẽ cả nền một lần từng làm khựng hình (mỗi mảnh 0,1 giây, xếp hàng 36 mảnh); nay vẽ trước chia nhỏ 6 ms một lần. Lời nhắc chạm ranh vùng từng không hiện trong 5 giây đầu (đồng hồ `performance.now()` bắt đầu từ 0, nên mốc chờ đặt `-1e9`).

## Hướng phát triển tiếp

- **Chương hai (1285–1288):** cứu người bị bắt; Chương Dương, Hàm Tử, giải phóng Thăng Long (1285); cuộc kháng chiến lần ba; **trận Bạch Đằng 1288** với cơ chế canh thủy triều, cắm cọc (ý tưởng gốc của chủ dự án). Đối chiếu Toàn thư năm Ất Dậu 1285 đến Mậu Tý 1288 trước khi viết.
- Cân bằng độ khó (tốc độ nước lũ, lượng giặc) cần người chơi thật thử.
- Mở vùng khi truyện tới: `openRegion(S,'gialam')`… (xem `REGIONS` trong `world.js`); đặt NPC, sự kiện vào các làng, bến đã có sẵn trên bản đồ. Doanh trại Gia Lâm (`trai.js`) có sẵn chuồng tù, kho lương, bãi ngựa cho các nhiệm vụ trốn trại, cứu người.
- Chương hai nên nằm trong thư mục riêng (ví dụ `src/chapter2/`), tách dữ liệu sự kiện khỏi logic.
