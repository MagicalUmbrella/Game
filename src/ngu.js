/* ================= anh Ngũ (Phạm Ngũ Lão lúc trẻ) ================= */
/* Toàn thư (mục năm 1320) chép Phạm Ngũ Lão người làng Phù Ủng, lúc hơn hai mươi tuổi được Hưng Đạo Vương thấy có
   kỳ tài, gả con gái nuôi cho, nhận làm gia thần; ông thích đọc sách, ngâm thơ, có chí lớn. Mọi lần gặp gỡ, lời nói
   của anh với nhân vật là hư cấu.
   Mạch gặp gỡ trong chương một:
   - 1272–1277: "Chàng trai đọc sách" đứng bên đường lên kinh (NPC 'ngu' ở state.js). Việc cần làm 'ngu': ngồi nghe anh
     ba lần, mỗi năm một lần (S.nguN, S.nguY), trước hết năm 1277. Chưa gặp lần nào thì thanh thông báo nhắc (nguHint).
   - 1278 hạ (sự kiện 'ngu'): tin anh được Hưng Đạo Vương thu nhận; game cho biết tên thật. Nghe anh đủ ba lần thì có
     thêm một câu riêng (nguNews).
   - 1283 đông (tập trận, đường võ): đã gặp thì anh cưỡi ngựa tới với mọi mức điểm, lời theo điểm (training.js).
   - 1284 thu (duyệt binh Đông Bộ Đầu): ai chưa gặp lại anh ở bãi tập (đường văn, nông; đường võ chưa gặp) có việc
     'nguDB': gặp Phạm Ngũ Lão ở bãi sông dưới chân đê ngoài tường đông kinh thành (NPC 'ngutuong'), tới hết năm 1284.
   - 1285: đã gặp thì quân Phạm Ngũ Lão tới làng (climax.js); lời thông báo nhắc lần gặp gần nhất (nguRecall).
   S.flags.nguKnows: anh đã gặp lại bạn khi đã là tướng (bãi tập 1283 hoặc bến 1284). */
import {S,age} from './state.js';
import {gain,renderHUD,say,startQuest,doneQuest,toast} from './ui.js';
import {voice} from './loi.js';

export const NGU_TALKS=3;
const src=t=>`<p class="src">Toàn thư chép: ${t}</p>`;

/* gọi mỗi lần sang mùa (advanceOne): mở, đóng các việc cần làm của mạch này */
export function nguSeason(){
  if(S.year>=1272&&S.year<=1277&&!S.quests.ngu)startQuest('ngu');
  if(S.year>=1278&&S.quests.ngu==='active'){delete S.quests.ngu;renderHUD()}            // anh đã đi theo Hưng Đạo Vương
  if(S.year>=1285&&S.quests.nguDB==='active'){delete S.quests.nguDB;renderHUD()}
}
export const nguQuestHint=()=>S.nguN?(S.nguY===S.year?`Đã ngồi nghe anh ${S.nguN}/${NGU_TALKS} lần. Năm nay gặp rồi, sang năm ghé lại.`:`Đã ngồi nghe anh ${S.nguN}/${NGU_TALKS} lần. Mỗi năm ghé một lần, trước khi hết năm 1277. Anh đứng dưới gốc cây bên đường lên kinh, phía đông bắc làng.`)
  :'Có anh chàng lạ mặt hay đứng đọc sách dưới gốc cây bên đường lên kinh, phía đông bắc làng. Ghé xem anh đọc gì.';

/* ---------- 1272–1277: bên đường ---------- */
const TALK=[
  {text:'Một chàng trai to khỏe đứng tựa gốc cây bên vệ đường đọc sách, thỉnh thoảng lại ngâm nga mấy câu thơ. Anh tên Ngũ, người làng Phù Ủng. Anh bảo làm trai mà chưa lập được công danh thì còn thẹn lắm.',
    label:'Ngồi nghe anh bàn chuyện binh pháp',fn:()=>{gain('vo',2);gain('van',1);toast('Anh Ngũ vẽ thế trận lên mặt đất bằng một que tre. Bạn thấy trong lòng sục sôi.',4600)}},
  {text:'Anh Ngũ đang đọc chuyện Gia Cát Vũ hầu nước Thục: "Một người áo vải ở lều tranh, ba lần được mời mới chịu ra giúp nước. Cậu bảo, nếu chẳng ai đến mời thì sao?"',
    label:'"Thì mình tự mài cho sắc, anh ạ."',fn:()=>{gain('van',1);gain('vo',1);toast('Anh Ngũ cười lớn: "Phải! Gươm sắc thì tự khắc có người cần."',4600)}},
  {text:'Anh Ngũ gấp sách lại, nhìn về phía kinh thành rất lâu: "Ta sắp đi xa. Nghe nói Hưng Đạo Vương trọng người có tài. Làm trai mà chưa trả xong nợ công danh thì ăn không ngon, ngủ không yên."',
    label:'Chúc anh lên đường',fn:()=>{gain('vo',1);gain('duc',1);toast('Anh Ngũ vỗ vai bạn: "Mai kia nước có việc, ta sẽ nhớ cậu trai này."',5000)}},
];
export function talkNgu(){const n=S.nguN||0;S.nguMet=true;
  if(n<NGU_TALKS&&S.nguY!==S.year){const c=TALK[n];
    return say('Chàng trai đọc sách',c.text,[{label:c.label,fn:()=>{S.nguMet=true;S.nguN=n+1;S.nguY=S.year;c.fn();if(S.nguN>=NGU_TALKS&&S.quests.ngu==='active')doneQuest('ngu');renderHUD()}}])}
  say('Chàng trai đọc sách','Anh Ngũ ngẩng lên khỏi trang sách: "'+voice('ngu')+'"')}

/* ---------- 1278: tin về anh Ngũ (events.js) ---------- */
export function nguNews(){const n=S.nguN||0;
  return`<p>Anh Ngũ người Phù Ủng không còn đứng đọc sách bên đường nữa. Người ta kể, Hưng Đạo Vương gặp anh, thấy có kỳ tài, đem con gái nuôi gả cho, nhận làm gia thần và dạy bảo thêm.</p>`+
    (n>=NGU_TALKS?'<p>Bạn nhớ lần cuối ngồi bên gốc cây, anh gấp sách lại nhìn về phía kinh thành mà nói chuyện nợ công danh. Hóa ra anh đã biết mình sẽ đi đâu.</p>':n?'<p>Bạn nhớ lại mấy buổi ngồi nghe anh bàn binh pháp bên đường.</p>':'')+
    `<p>Đời sau biết anh với tên <b>Phạm Ngũ Lão</b>.</p>${src('Ngũ Lão người làng Phù Ủng, lúc hơn hai mươi tuổi được Hưng Đạo Vương thấy là có kỳ tài, gả con gái nuôi cho, nhận làm gia thần.')}`}

/* ---------- 1284: bến Đông Bộ Đầu ---------- */
export const NGU_DB={x:79.5,y:29.6};
export function nguDuyet(){if(S.nguMet&&!S.flags.nguKnows)startQuest('nguDB')}
export const nguDBOn=()=>S.quests.nguDB==='active'&&S.year===1284;
export function talkNguTuong(){
  if(S.quests.nguDB!=='active')return say('Phạm Ngũ Lão','Giặc sang, ta sẽ tìm làng cậu.');
  say('Phạm Ngũ Lão',`(Giáp trụ sáng loáng, anh nhận ra bạn ngay.) "Cậu trai bên gốc cây năm nào! ${age()>=26?'Giờ ra dáng người lớn rồi.':''} ${S.path==='van'?'Nghe nói cậu theo đường chữ nghĩa. Giữ nước cần cả người cầm bút.':S.path==='nong'?'Cậu ở nhà làm ruộng à? Quân không có thóc thì đánh bằng gì. Đừng coi nhẹ mình.':'Hương binh làng nào cũng đang ráo riết luyện.'}"`,
    [{label:'"Giặc sang, làng em trông cả vào quân ta."',fn:()=>{S.flags.nguKnows=true;S.nguDB=true;doneQuest('nguDB');gain('tieng',1);
      say('Phạm Ngũ Lão','"Làng An Phú bên sông Tô Lịch, phải không? Giặc mà sang, ta sẽ tìm làng cậu."')}}])}

/* ---------- 1285: lời thông báo khi quân tới (climax.js) ---------- */
export const nguRecall=()=>S.nguDB?'Quân Phạm Ngũ Lão tràn vào làng! Ông giữ lời hứa ở bến Đông Bộ Đầu năm ngoái!':S.flags.nguKnows?'Quân Phạm Ngũ Lão tràn vào làng! Ông nhận ra bạn từ buổi tập trận năm nào!':'Một đội quân áo đỏ tràn vào làng. Người đi đầu chính là anh Ngũ từng đứng đọc sách bên đường năm xưa!';
export function nguChronicle(){if(!S.nguMet)return'';const n=S.nguN||1;
  return`Bạn từng ${n>=NGU_TALKS?'ba năm liền ghé':'ngồi'} nghe anh Ngũ bàn binh pháp bên đường${S.nguDB?', gặp lại ông ở bến Đông Bộ Đầu năm 1284':S.flags.nguKnows?', gặp lại ông ở bãi tập năm 1283':''}. Đêm giặc đến, Phạm Ngũ Lão dẫn quân tới.`}
