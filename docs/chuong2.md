# Chương hai: Giữ nước (1285–1288), dàn ý cốt truyện

Bản nháp để bàn với chủ dự án, chưa phải đặc tả kỹ thuật. Các mốc lịch sử có ghi dòng Toàn thư (số dòng trong `/tmp/tt.txt` sau khi chạy `pdftotext -layout`). Mọi người, việc quanh mốc ấy mà không ghi Toàn thư là **hư cấu**.

Nhân vật 27 tuổi lúc mở chương, 30 tuổi lúc kết. Vai trong cả chương là **dân binh**, người làng theo quân. Không phải tướng, nhưng có mặt ở những chỗ lớn. Toàn thư chép trận Chương Dương có "dân binh các lộ" đánh cùng quan quân (dòng ~11978), nên vai này đúng sử.

---

## Mạch chung

| Phần | Thời gian | Chuyện chính | Màn chơi chính |
|---|---|---|---|
| Mở | xuân 1285 (ngay sau đêm cháy làng) | Hai lối mở theo kết cục chương 1 | Trốn trại Gia Lâm, hoặc dẫn dân lánh nạn |
| 1 | xuân → hạ 1285 | Theo dân binh, đường tới Chương Dương | Chèo thuyền đêm, trinh sát, trận Chương Dương |
| 2 | hạ 1285 | Giặc tan: Tây Kết, Vạn Kiếp, vua về kinh | Đuổi giặc, cảnh vua về |
| 3 | 1286 → thu 1287 | Giữa hai cuộc chiến: dựng lại làng, chuẩn bị | Việc làng, lo trước (như `prep.js`) |
| 4 | cuối 1287 → đầu 1288 | Giặc sang lần ba, Vân Đồn | Màn đường biển, thuyền lương |
| 5 | tháng 3 năm 1288 | Bạch Đằng | Đóng cọc, canh thủy triều, nhử địch, đánh |
| Kết | 1288 | Biên niên chương hai, mở chương ba | |

---

## Mở chương: hai lối vào theo kết cục đêm 1285

Đọc `S.res`, `S.capt`, `S.res.lostWho`, `S.res.burnt` từ chương một.

### Lối A: bị bắt (`S.capt` có giá trị)
Bạn tỉnh dậy trong chuồng tù trại giặc Gia Lâm (`trai.js`), trời gần sáng. Nối tiếp thẳng cảnh `camp.js`.

**Màn trốn trại** (hư cấu):
- Lẻn qua lính tuần có tầm nhìn (đuốc soi), chui rào cọc, tránh chòi canh.
- Cứu người làng bị bắt cùng (`lostWho`, `capt.for`). Mỗi người theo sau làm bạn chậm đi, phải chọn cứu ai trước.
- Việc phụ, tùy chọn:
  - Đốt kho lương (`GRAN`): giặc đói, phần 2 dễ hơn, nhưng lửa làm cả trại tỉnh.
  - Thả ngựa ở bãi ngựa (`HORSE`): biết cưỡi ngựa thì chạy nhanh hơn.
- Đường thoát:
  - Cổng tây, theo đường bộ.
  - Biết bơi hoặc biết chèo: lội hoặc lấy thuyền qua sông Hồng.
  - Ở chương 1 đã gọi to tên khi sứ giả đi qua (`capt.seen`): có người của triều đình chờ ở bờ bên kia.
  - Đã ghi nhớ đường trong trại (`capt.map`): thấy lối tắt.
- Cách bị bắt (`capt.how`) đổi câu mở đầu và thái độ người trong chuồng:
  - `trick` (lừa hỏng): giặc canh bạn kỹ hơn.
  - `surrender` (đổi mình lấy con tin): người được cứu kể lại cho cả làng, Tiếng tăng.

### Lối B: thoát được
Sáng ra, làng còn khói. Bạn dẫn dân lánh vào rừng sâu rồi đi tiếp tới chỗ đông người hơn (hư cấu).
- Nhà nào cháy (`burnt`) thì nhà đó phải ở nhờ.
- Người bị bắt đi (`lostWho`) trở thành **mục tiêu xuyên chương**: dò tin ở trại Gia Lâm, đến phần 2 mới cứu được, khi giặc tan.
- Có lán dựng trước (`flags.lan`) thì đỡ đói. Có thóc cất trước (`catThoc`) thì đem góp cho quân.

Hai lối gặp nhau ở cùng một chỗ: **làng tản cư gặp toán dân binh** của một vị chỉ huy hư cấu. Toàn thư có chép tên Nguyễn Khả Lạp, Nguyễn Truyền đem dân binh các lộ, nhưng không kể chi tiết nên chỉ nhắc tên, không cho nói lời bịa.

---

## Phần 1: Theo dân binh (xuân → hạ 1285)

**Bối cảnh Toàn thư** (dòng ~11800–11900):
- Tháng giêng: giặc đánh Vạn Kiếp, Phả Lại, rồi Gia Lâm, Đông Ngàn; dựng cờ lớn ở Đông Bộ Đầu.
- Tháng 2: Trần Kiện đem quân hàng giặc. Trần Bình Trọng đánh nhau với giặc ở bãi Đà Mạc rồi chết.
- Tháng 3: hai vua bỏ thuyền đi bộ, vượt biển vào Thanh Hóa. Toa Đô từ phương nam đánh ra.

**Chuyện (hư cấu, trên nền sử):**
1. **Tin dữ đến dần.** Không dồn một lúc, mỗi tin một cảnh nhỏ: có người hàng giặc (Trần Kiện), có người chết không hàng (Trần Bình Trọng). Dân binh bàn tán, có người muốn bỏ về, có người muốn đi theo vua.
   - Lựa chọn: giữ chân người muốn bỏ về (cần Tiếng), hay để họ về lo cho nhà (Đức).
2. **Nhiệm vụ dân binh**, chọn hai trong ba theo đường đời và nghề:
   - **Đường văn:** dò tin. Lẻn vào làng bị chiếm hỏi chuyện, ghi lại số thuyền, số quân. Văn cao thì ghi đúng hơn, biết cưỡi ngựa thì ước được kỵ binh.
   - **Đường võ:** đánh toán giặc đi cướp lương lẻ. Màn đánh nhỏ giống đêm 1285 nhưng ở làng khác.
   - **Đường nông:** chở lương, giấu thuyền trong lau sậy. Biết chèo thì đi được đêm.
3. **Cò:**
   - Cò đã theo quân (`S.co==='army'`): Cò ở trong quân Hoài Văn hầu Quốc Toản. Toàn thư chép Quốc Toản đánh ở Tây Kết, Chương Dương. Bạn gặp lại Cò trước trận.
   - Cò ở làng: Cò đi cùng bạn trong dân binh.
4. **Anh Ngũ / Phạm Ngũ Lão:** đã gặp ở chương 1 (`nguMet`) thì có một lần thấy ông từ xa, đi trong đoàn quân của Hưng Đạo Vương. Không bịa trận ông đánh khi Toàn thư không chép.

### Trận Chương Dương (tháng 5 năm 1285)
Toàn thư chép Quang Khải, Quốc Toản, Trần Thông, Nguyễn Khả Lạp, Nguyễn Truyền đem dân binh các lộ đánh bại giặc ở Kinh Thành, Chương Dương; Thoát Hoan chạy qua sông Lô (dòng ~11978).

**Màn chơi:**
- **Đêm trước:** chèo thuyền chở dân binh xuôi sông. Dùng lại cơ chế chèo đò `cheo.js`, giờ thuyền lớn hơn, phải đi im (không đốt đuốc), tránh thuyền canh của giặc.
- **Rạng sáng:** đổ bộ lên bến Chương Dương. Màn đánh trên bến, đông người hai bên.
  - Mục tiêu không phải giết hết, mà **giữ một đoạn bến** cho thuyền sau cập.
  - Đồng đội: trai làng theo bạn từ chương 1 (số người theo Tiếng, rèn giáo, luyện đội).
- **Kết trận:** thấy kinh thành từ xa. Câu thơ của Trần Quang Khải ("Đoạt sáo Chương Dương độ…", Toàn thư dòng ~12035) để dành tới lúc vua về kinh ở phần 2.

---

## Phần 2: Giặc tan (hạ 1285)

**Toàn thư** (dòng ~11985–12040):
- Toa Đô, Ô Mã Nhi từ biển đánh vào sông Thiên Mạc.
- Ta đánh ở Tây Kết, chém Toa Đô; Ô Mã Nhi trốn bằng một chiếc thuyền.
- Hưng Đạo Vương đánh Thoát Hoan ở Vạn Kiếp; tỳ tướng giấu Thoát Hoan vào một đồ đồng mà chạy.
- Tháng 6: hai vua về kinh, Quang Khải làm thơ.

**Chuyện:**
1. **Trại Gia Lâm bỏ hoang.** Giặc rút chạy, bạn quay lại trại tìm người làng bị bắt (lối B), hoặc tìm người còn kẹt lại (lối A).
   - Mỗi người trong `lostWho` có một số phận: cứu được, đã bị giải đi xa (nhắc lại ở chương 3), hoặc đã mất.
   - Số phận phụ thuộc việc làm ở phần 1: dò tin đúng chỗ thì cứu được nhiều hơn.
2. **Đuổi giặc ở Vạn Kiếp** (tùy chọn, đường võ): đứng trên bờ sông thấy thuyền giặc chạy, bắn tên, cản đường. Chỉ nghe kể chuyện Thoát Hoan chui đồ đồng qua lời người khác.
3. **Vua về kinh:** dân đứng hai bên đường; bài thơ Quang Khải.
   - Người theo giặc bị xét. Mở đầu chủ đề "hòm biểu xin hàng" cho chương 3: ông Cả Lợi có giấu gì không?

---

## Phần 3: Giữa hai cuộc chiến (1286 → thu 1287)

Quay lại lối chơi đời thường của chương 1, theo mùa, nhưng làng đã khác.

- **Dựng lại làng:**
  - Nhà cháy (`burnt`) phải dựng lại: chặt tre, lợp mái (dùng lại cơ chế mái nhà bà Tư).
  - Người mất có đám giỗ.
- **Gia đình:** cha mẹ (nếu còn), Thảo, bé Sen lớn. Thêm chuyện đời thường mới vào `life.js` cho tuổi 28–29.
- **Thăng tiến** (`chuc.js`) tiếp theo:
  - Đội trưởng dân binh thành chức trong quân.
  - Xã chính phải lo việc làng sau chiến tranh.
  - Đường văn: khoa thi sau chiến tranh, chỉ làm nếu Toàn thư có chép khoa thi những năm này.
- **Tin xấu từ phương bắc:** Toàn thư chép nhà Nguyên sai Trương Văn Hổ chở lương bằng đường biển, đặt hành tỉnh do Áo Lỗ Xích, Ô Mã Nhi coi (dòng ~12095).
- **Lo trước lần ba** (giống `prep.js`): giấu lương, rèn khí giới, đóng thuyền, luyện đội. Tiền và Sức có hạn nên phải chọn.
- **Cò và Thảo:** chuyện riêng tiếp theo những gì đã xảy ra ở chương 1.

---

## Phần 4: Giặc sang lần ba, Vân Đồn (cuối 1287 → đầu 1288)

**Toàn thư** (dòng ~12100–12170):
- Tháng 12 năm 1287: Thoát Hoan, Ô Mã Nhi đánh vào Vạn Kiếp rồi xuôi đông.
- Thủy quân giặc đánh vào Vân Đồn. Trần Khánh Dư đánh thua lần đầu, bị xiềng giải về, xin khất vài ngày lập công, rồi đánh tan đoàn thuyền vận tải, bắt được rất nhiều lương.
- Tháng giêng năm 1288: Ô Mã Nhi đánh phủ Long Hưng.

**Chuyện:**
1. **Lần này làng đã quen giặc.** Đêm giặc sang ngắn hơn đêm 1285, và người chơi thấy rõ thành quả việc lo trước ở phần 3.
2. **Đi Vân Đồn**: bạn theo một đoàn thuyền ra phía biển (hư cấu). Biết chèo là điều kiện bắt buộc, chưa biết thì đi cùng người chèo.
   - Chứng kiến Khánh Dư lập công: thuyền nhỏ đánh đoàn thuyền lương nặng.
   - **Màn chơi:** thuyền nhỏ áp sát thuyền lương trong sương, móc dây, cướp lương hoặc đốt thuyền. Nước triều ảnh hưởng tốc độ, chuẩn bị cho Bạch Đằng.
3. **Lương giặc mất, giặc đói.** Toàn thư ghi "năm này vết thương không thảm như năm trước", nên làng đỡ khổ hơn năm 1285.

---

## Phần 5: Bạch Đằng (tháng 3 năm 1288)

**Toàn thư** (dòng ~12198–12215): Hưng Đạo Vương cho đóng cọc ở sông Bạch Đằng, phủ cỏ lên trên. Lúc triều lên, cho quân khiêu chiến rồi giả thua chạy; giặc đuổi theo. Triều xuống, thuyền giặc vướng cọc hết. Nguyễn Khoái bắt sống Áo Lỗ Xích; quân mai phục hai bờ đánh ra; thuyền lương của Văn Hổ mắc cọc đắm gần hết. Bắt được 400 chiếc thuyền; Đỗ Hành bắt được Ô Mã Nhi.

**Màn chơi** (ý tưởng gốc của chủ dự án), bốn pha theo đồng hồ thủy triều:

1. **Đóng cọc** (mấy ngày trước trận, chơi theo lượt hoặc theo thời gian):
   - Bản đồ khúc sông Bạch Đằng (vùng `bachdang`, đã có sú vẹt, núi đá vôi).
   - Có số cọc giới hạn; chỉ đóng được lúc nước ròng, nước lên thì phải dừng.
   - Đóng ở chỗ nước sâu vừa: nông quá thì lúc triều cao cọc lộ, sâu quá thì không đóng được.
   - Phủ cỏ cho kín. Cọc lộ thì giặc thấy, lúc trận sẽ đi vòng.
   - Nghề rèn: bịt sắt đầu cọc nhanh hơn. Đường nông: chặt gỗ nhanh hơn.
2. **Nhử địch** (triều lên): bạn trên một thuyền nhỏ khiêu chiến, giả thua, chạy ngược dòng qua bãi cọc. Chạy nhanh quá thì giặc không đuổi, chậm quá thì bị bắt kịp.
3. **Nước rút:** đồng hồ thủy triều trên màn hình. Giữ giặc trong bãi cọc tới lúc nước xuống. Thuyền giặc vướng cọc, nghiêng, mắc cạn.
4. **Đánh:** quân mai phục hai bờ xông ra, đánh trên thuyền mắc cạn, bắt tướng giặc.
   - Trận thắng là chắc chắn theo sử. Người chơi chỉ quyết định **phần của mình**: bắt được bao nhiêu thuyền, cứu được ai, có ai trong làng mất trong trận không.

**Kết quả trận** tính theo số cọc đặt đúng chỗ, nhử khéo hay không, và đồng đội còn bao nhiêu. Toàn bộ ghi vào biên niên.

---

## Kết chương hai

- Biên niên chương hai: trốn trại hay dẫn dân, ai được cứu, Chương Dương, Vân Đồn, Bạch Đằng, làng dựng lại ra sao.
- Mở chương ba (1289): hòm biểu xin hàng (Toàn thư, dòng ~12356). Ông Cả Lợi, hoặc người khác trong làng, có tên trong đó không?

---

## Hậu quả chương một dùng ở chương hai

| Từ chương một | Dùng ở đâu |
|---|---|
| `S.capt` (`how`, `seen`, `map`, `shield`, `trust`) | Lối A trốn trại: đường thoát, thái độ bạn tù |
| `res.lostWho`, `burnt` | Người phải cứu, nhà phải dựng lại |
| `S.co` (`village` / `army`) | Cò đi cùng hay gặp lại trong quân Quốc Toản |
| `S.thao`, `married`, `child` | Gia đình phải lo, ai chờ ở nhà |
| Nghề bơi, chèo, ngựa, rèn, thuốc nam | Đường thoát, chèo đêm, Vân Đồn, đóng cọc, chữa thương |
| `career` (đội trưởng, xã chính, lại viên…) | Vai trong dân binh |
| Tiếng, số trai làng theo | Đồng đội ở Chương Dương, Bạch Đằng |
| `nguMet`, `nguKnows` | Thấy Phạm Ngũ Lão trong quân |
| `prep` (lán, giáo, thóc) | Ăn ở lúc tản cư, lương góp quân |

## Cơ chế mới cần làm

- Màn lẻn trốn: lính tuần có tầm nhìn, bóng tối, đuốc.
- Thuyền lớn nhiều người chèo, đi im, thuyền canh (mở rộng `cheo.js`, `thuyen.js`).
- Đồng hồ thủy triều, mực nước theo giờ, cọc lộ hay chìm.
- Đóng cọc trên bản đồ sông.
- Đánh trên thuyền, trên bãi bến (mở rộng cơ chế đánh của `climax.js`).
- Mở vùng `gialam`, `hamtu`, `vankiep`, `bachdang` (đã có trong `world.js`).

Code để trong `src/chapter2/`, tách dữ liệu sự kiện khỏi logic.

## Chủ dự án đã chốt (15/10/2026)

1. **Người chơi đánh trực tiếp.** Muốn cảnh chiến tranh thật mãn nhãn, chiến trường thật sự hàng vạn quân, ở một hoặc nhiều trận.
2. **Phần 3 (giữa hai cuộc chiến) làm gọn.**
3. **Vân Đồn: nghĩ hướng khác cho người không biết chèo** (không khóa màn, không chỉ ngồi xem).
4. **Người làng có thể chết**, kể cả trong trận lớn.
5. **Giọng chương:** cần những cảnh kịch tính, buồn, chiến tranh mất mát, mà qua đó tôn lên sự huy hoàng của nhân vật và của cuộc giữ nước.

Các mục dưới đây cụ thể hóa năm điều trên, thay các chỗ tương ứng ở trên khi hai bên lệch nhau.

---

## Chiến trường lớn (hàng vạn quân)

### Ba trận lớn, mỗi trận một kiểu
| Trận | Kiểu | Quy mô cảm nhận | Người chơi |
|---|---|---|---|
| **Chương Dương** (tháng 5 năm 1285) | Đổ bộ, đánh bến, rồi tràn lên bộ | Hàng nghìn thuyền nhỏ trên sông, hai bờ đầy quân | Trong đợt thuyền đầu, giữ bến rồi tiến lên |
| **Tây Kết** (hạ 1285) | Đánh thủy bộ, đuổi Toa Đô | Thuyền giặc dàn dài trên sông, ta mai phục hai bờ | Tầm vừa, như màn chuyển giữa hai trận lớn |
| **Bạch Đằng** (tháng 3 năm 1288) | Trận lớn nhất: cọc, triều, mai phục, bốn trăm thuyền | Cả khúc sông kín thuyền, núi đá, hai bờ rừng | Từ đóng cọc tới lao lên thuyền giặc mắc cạn |

Trận Tây Kết có thể bớt hoặc chỉ kể qua, nếu hai trận kia đã đủ nặng.

### Làm sao có "hàng vạn quân" trong game điểm ảnh chạy trên trình duyệt
Không mô phỏng từng người như đêm 1285 (vài chục người là máy đã nặng). Dùng ba lớp:

1. **Lớp gần** (quanh người chơi, khoảng 30–60 người): người thật như `climax.js`, có máu, đánh, tìm đường, vây.
2. **Lớp giữa** (vài trăm người trong tầm màn hình): **khối quân**. Mỗi khối là một đội 20–50 người vẽ thành hàng, cùng tiến, cùng lùi, cùng đánh với khối đối diện. Tính thắng thua theo sức khối, không theo từng người. Người trong khối vẫn có bước chân, vung giáo (khung hình lấy từ `nguoi.png`), lâu lâu có người ngã. Khối thua thì vỡ ra thành người chạy lẻ.
3. **Lớp xa** (cả chiến trường, hàng vạn): **vẽ nền động**. Biển cờ, rừng giáo, khói, lửa trên thuyền, hàng chấm người đổ trên đồi, tiếng trống. Chỉ để nhìn, không tính.

Kèm theo:
- **Máy quay:** đầu trận kéo rộng, lia qua toàn cảnh (giống màn tiêu đề) rồi mới hạ xuống chỗ người chơi. Đến khoảnh khắc lớn (cờ ta cắm lên bến, thuyền giặc vướng cọc) thì máy lia ra lại vài giây.
- **Âm thanh** nếu có thêm sau: trống trận, tù và, tiếng hò. Hiện game chưa có tiếng nên ghi nhận, làm sau.
- **Bản đồ nhỏ** hiện chiến tuyến hai màu, chỗ ta đang thắng, chỗ đang vỡ.

### Người chơi làm gì giữa trận lớn
Không phải đánh hết quân giặc. Mỗi trận chia **3–4 nhịp**, mỗi nhịp một việc rõ:
- **Chương Dương:**
  1. Đêm: chèo thuyền im lặng, tránh thuyền canh.
  2. Rạng sáng: lên bến, giữ đầu cầu cho đợt thuyền sau.
  3. Chiến tuyến bên trái sắp vỡ: dẫn trai làng sang chặn.
  4. Cắm cờ trên gò, quân ta tràn lên, giặc chạy về phía sông Lô.
- **Bạch Đằng:** bốn pha (đóng cọc, nhử, nước rút, đánh) như phần 5, thêm nhịp **cứu người rơi xuống nước** và **lên thuyền tướng giặc**.

Người chơi gánh một khúc chiến tuyến. Đánh tốt thì khúc ấy thắng nhanh, đồng đội ít người ngã. Đánh kém thì vẫn thắng trận (theo sử) nhưng làng mất nhiều người hơn, và biên niên ghi lại.

### Kỹ thuật
- Khối quân là mảng số liệu: vị trí, hướng, sức, kiểu (giáo, cung, kỵ, thuyền). Vẽ theo lô, không tạo đối tượng cho từng người xa.
- Cần đo hiệu năng: giữ 60 khung hình mỗi giây trên máy bình thường. Viết test hiệu năng giống bài "vẽ một mảnh nền không quá 1,5 giây".
- File riêng: `src/chapter2/chientruong.js` (khối quân, chiến tuyến), `src/chapter2/chuongduong.js`, `src/chapter2/bachdang.js`.

---

## Phần 3 làm gọn

Bỏ lối chơi theo mùa. Thay bằng **4–5 cảnh nối nhau**, mỗi cảnh một lựa chọn, đi qua hai năm 1286–1287:
1. **Dựng lại nhà** (nhà cháy, nếu có): một màn ngắn chặt tre, lợp mái cùng hàng xóm.
2. **Giỗ đầu** người mất năm 1285. Cảnh buồn, ai còn sống đứng quanh mâm cơm.
3. **Một chuyện gia đình**, theo chương một: Thảo, bé Sen, cha mẹ, hoặc Cò về làng hay ở lại quân.
4. **Thăng tiến**: một lựa chọn duy nhất theo đường đời.
5. **Lo trước lần ba**: chọn hai trong bốn việc (giấu lương, rèn khí giới, đóng thuyền, luyện đội), không đủ tiền làm hết.

Mỗi cảnh có một dòng biên niên.

---

## Vân Đồn cho người không biết chèo

Ai biết chèo thì **cầm lái thuyền xung kích** như đã viết ở phần 4. Ai không biết chèo thì có vai khác, theo đường đời, không kém phần quan trọng:

| Vai | Ai làm | Việc |
|---|---|---|
| **Trinh sát chợ Vân Đồn** | Đường văn | Vân Đồn là bến buôn, dân ở đó mặc đồ như khách buôn phương bắc (Toàn thư dòng ~12162). Đội nón khách buôn lẫn vào chợ, nghe ngóng thuyền lương tới lúc nào, bao nhiêu chiếc. Lỡ lời là bị lộ. |
| **Đốt lửa hiệu trên đảo** | Đường nông, hoặc ai cũng được | Leo núi đá ven biển, canh buồm thuyền lương trong sương, đốt lửa đúng lúc để thuyền ta xuất kích. Đốt sớm thì giặc biết, đốt muộn thì lỡ. |
| **Đánh giáp lá cà khi áp mạn** | Đường võ | Đứng mũi thuyền, người khác chèo. Áp mạn thì nhảy sang thuyền lương, mở đường, chặt dây buồm. |
| **Lặn cắt neo** | Ai biết bơi | Đêm trước, bơi ra cắt neo thuyền giặc đậu ven đảo cho chúng trôi dạt. |

Người chơi được chọn một vai hợp với mình. Mỗi vai đổi kết quả trận (bắt được bao nhiêu lương) và có dòng biên niên riêng.

---

## Giọng chương: buồn, kịch tính, rồi huy hoàng

Chương hai không chỉ là thắng. Mỗi chiến thắng phải có giá, để lúc huy hoàng thì người chơi thấy mình đã trả đủ giá ấy.

### Những cảnh mất mát (người làng có thể chết)
Ai chết **phụ thuộc vào cách chơi**, không viết sẵn một người chắc chắn chết. Mỗi trận lớn có một danh sách "người có thể ngã": trai làng theo bạn, Cò, cha (nếu còn và đã già yếu, lúc tản cư), một người trong chuồng tù.
- **Trai làng ngã ở Chương Dương:** lời trăng trối nhắc lại chương một (năm giữ đê, buổi luyện đội). Biên niên ghi tên.
- **Cò** (nếu theo quân Quốc Toản): có thể ngã ở một trận. Chỉ ngã khi người chơi để khúc chiến tuyến của mình vỡ. Cảnh cuối Cò nhắc chuyện thả diều năm 8 tuổi. Đây là cảnh buồn nhất chương, nên chỉ xảy ra khi người chơi thật sự thua ở nhịp ấy, không bắt buộc.
- **Người chết trong trại** (lối A): người không cứu kịp.
- **Cha** (nếu đã yếu sau năm đậu mùa): mất trên đường tản cư, cảnh chôn vội bên bờ ruộng.
- **Giỗ đầu** ở phần 3 gom tất cả người đã mất về một mâm cơm.

### Những cảnh kịch tính
- **Trốn trại:** đuốc lính quét qua, bạn nín thở sau đống bao thóc.
- **Tin Trần Bình Trọng:** dân binh im lặng quanh đống lửa; có người đứng dậy nói "thà chết như ông ấy" (hư cấu, không bịa lời Trần Bình Trọng).
- **Đêm trước Chương Dương:** thuyền trôi trong sương, nghe tiếng giặc nói chuyện trên thuyền canh sát bên.
- **Khánh Dư bị xiềng** (Toàn thư): bạn thấy ông bị giải đi rồi xin khất ba ngày, rồi thắng. Một bài học về đứng dậy sau thất bại.
- **Bạch Đằng, nước chưa rút:** thuyền giặc sắp vượt qua bãi cọc, đồng hồ thủy triều chạy chậm. Phải giữ thêm vài phút.

### Những khoảnh khắc huy hoàng (tôn nhân vật)
- **Cắm cờ trên gò Chương Dương:** máy quay lia ra, hàng nghìn dân binh hò reo, tên bạn được gọi.
- **Vua về kinh:** dân đứng hai bên đường, bạn đứng trong hàng dân binh. Nếu công lớn thì có viên quan dừng lại hỏi tên. Bài thơ Trần Quang Khải hiện chữ.
- **Bạch Đằng, nước rút:** từ thuyền nhỏ nhìn cả khúc sông thuyền giặc nghiêng đổ. Toàn thư chép nước sông đỏ ngầu, bắt được bốn trăm thuyền, bắt Ô Mã Nhi.
- **Về làng:** trẻ con chạy ra đón, mâm cơm có người, có chỗ trống của người không về. Vui và buồn cùng lúc là cảnh kết chương.

### Bạn là người lập công (chủ dự án chốt cách A, 15/10/2026)
Người chơi phải là **người lập công lớn**, nhưng bằng những việc sử không chép tên, không ghi đè lên người có tên trong Toàn thư (bắt Ô Mã Nhi là Đỗ Hành, bắt Áo Lỗ Xích là Nguyễn Khoái). Công của bạn là hư cấu, ghi rõ hư cấu, và đứng cạnh công các tướng chứ không thay.

**Chương Dương:**
- Bạn dẫn đợt thuyền đầu vào bến, mở đường cho cả đoàn dân binh.
- Bạn giữ khúc chiến tuyến sắp vỡ.
- Bạn cắm lá cờ đầu tiên trên gò.

**Tây Kết:** bạn phát hiện chỗ thuyền Toa Đô đậu nhờ dò tin hoặc nhờ thuộc sông, và báo kịp cho quân mai phục. Toàn thư chép Toa Đô bị chém ở Tây Kết, không chép ai chém, nên không gán việc chém cho bạn.

**Vân Đồn:** tin của bạn (chợ, lửa hiệu, cắt neo) là thứ giúp Trần Khánh Dư đánh trúng đoàn thuyền lương.

**Bạch Đằng**, công lớn nhất:
- Bạn tìm ra chỗ đóng cọc hiểm nhất, nhờ hồi nhỏ chèo đò thuộc con nước (`nghe.cheo`), hoặc nhờ ông lái đò dặn.
- Bạn chỉ huy chiếc thuyền nhử. Thuyền giặc đuổi theo bạn mà vướng cọc.
- Bạn cứu Nguyễn Khoái khi ông bị vây trên thuyền giặc, ngay trước lúc ông bắt sống Áo Lỗ Xích.
- Bạn dồn thuyền Ô Mã Nhi vào chỗ Đỗ Hành ập tới bắt.
- Bạn bắt sống một tướng giặc hư cấu (đặt tên riêng, ghi rõ hư cấu) và cắm cờ trên thuyền chỉ huy của hắn.

**Câu kết trận:** "Sử sách chép tên các tướng. Làng An Phú nhớ tên bạn." Biên niên liệt kê từng công của bạn.

Đánh kém thì công nhỏ đi (ví dụ không cứu kịp Nguyễn Khoái thì ông vẫn tự thoát và vẫn bắt Áo Lỗ Xích, đúng sử, chỉ là không có bạn). Đánh giỏi thì đủ công.
