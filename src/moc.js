/* ================= cảnh nhỏ khi lên mốc chỉ số ================= */
/* Hư cấu. Mỗi khi Văn, Võ, Đức, Tiếng vượt một mốc trong STATS (stats.js), người trong làng phản ứng: thầy khen,
   trai làng thách, cụ xã nhờ việc… để người chơi thấy mình giỏi lên ngay lúc ấy, không phải đợi tới đêm 1285.
   gain() (ui.js) gọi mocCross(k, cũ, mới); cảnh xếp hàng trong S.mocQ và hiện khi không có màn chơi, khung nào đang
   mở (mocFlush, gọi mỗi nhịp từ input.js). Mỗi mốc chỉ hiện một lần (S.mocSeen). Một vài cảnh có lựa chọn nhỏ. */
import {S,MG,age} from './state.js';
import {gain,modalOpen,dialogOpen,showModal,toast} from './ui.js';
import {STATS} from './stats.js';

const pick=a=>a[Math.floor(Math.random()*a.length)];
/* cảnh theo mốc: who (người nói), say (lời), choices (tùy chọn) */
const MOC={
  van20:{who:'Mẹ',say:'Con đọc được cả câu đối dán ở cửa đình rồi đấy à? Bố con đi khoe khắp xóm.'},
  van25:{who:'Bà Tư',say:'Tết sắp đến rồi. Cháu viết giúp bà đôi câu đối dán cửa được không? Bà không có tiền trả đâu.',choices:()=>[
    {label:'Viết tặng bà',note:'+1 Đức',fn:()=>{gain('duc',1);toast('Bà Tư dán đôi câu đối lên cửa, cứ đứng ngắm mãi.',4200)}},
    {label:'Ra chợ viết câu đối thuê',note:'+2 quan',fn:()=>{gain('tien',2);toast('Bạn ngồi viết câu đối thuê ở góc chợ cả buổi.',4200)}}]},
  van30:{who:'Sư cụ',say:'Tấm bia đá sau chùa chữ đã mờ, cả làng không ai đọc nổi. Con thử đọc xem nào.',choices:()=>[
    {label:'Ngồi đọc tấm bia',note:'+1 Tiếng',fn:()=>{gain('tieng',1);toast('Bạn đọc to từng chữ trên bia. Mấy cụ ngồi nghe, gật gù.',4200)}}]},
  van35:{who:'Thầy đồ Chu',say:'Văn của trò đã có ý, có lời. Đi thi được rồi đấy.',when:()=>S.thay},
  van50:{who:'Cụ xã',say:'Nghe nói chữ cháu giờ hơn cả ông đồ. Làng có việc giấy tờ muốn nhờ, lúc nào rảnh ghé đình ta bàn.'},
  van55:{who:'Học quan',say:'Bài của anh hôm nay ta đem đọc cho cả lớp nghe.',when:()=>S.path==='van'},
  vo20:{who:'Lão võ sư Hoàng',say:'Đứng tấn vững rồi. Cầm lấy cây côn này, từ nay tập côn pháp.'},
  vo25:{who:'Trai xóm Đông',say:'Nghe nói mày tập võ ở chỗ lão Hoàng. Ra bờ ao vật tay với tao một keo xem nào!',choices:()=>[
    {label:'Nhận lời',note:'thắng thì thêm Tiếng',fn:()=>{if(Math.random()<.35+S.vo/100){gain('tieng',2);toast('Bạn bẻ tay nó xuống mặt chiếu. Cả bọn trai xóm Đông im re.',4600)}else toast('Nó khỏe hơn bạn tưởng. Thua keo này, năm sau gặp lại.',4200)}},
    {label:'Cười trừ, bỏ đi',fn:()=>toast('Bạn cười trừ. Võ không phải để khoe.',3600)}]},
  vo40:{who:'Bà cụ đầu xóm',say:'Nước suối lên rồi, bà già lội không nổi. Cháu cõng bà qua với.',choices:()=>[
    {label:'Cõng bà qua suối',note:'+1 Đức',fn:()=>{gain('duc',1);toast('Bạn cõng bà cụ qua suối nhẹ như không. Từ nay ai già yếu cũng nhờ được bạn.',4600)}}]},
  vo50:{who:'Bác thợ rèn',say:'Cổ tay này cầm kiếm thật được rồi. Lúc nào cần, ghé lò ta.'},
  vo60:{who:'Lão võ sư Hoàng',say:'Ta già rồi. Trò có muốn đứng ra dạy trai làng không? Võ mà truyền đi được thì làng mới vững.'},
  vo75:{who:'Võ quan',say:'Tên anh là gì? Ta sẽ nhớ mặt.',when:()=>S.path==='vo'},
  duc25:{who:'Mẹ',say:'Nhà có việc gì mẹ cũng muốn hỏi con trước. Con nói gì mẹ cũng tin.'},
  duc45:{who:'Ông lái đò',say:'Ta đi xa mấy hôm. Chỗ tiền này cậu giữ hộ ta, ta chỉ tin cậu thôi.',choices:()=>[
    {label:'Nhận giữ hộ',fn:()=>toast('Bạn cất gói tiền dưới bàn thờ, chờ ông lái đò về.',4200)}]},
  duc60:{who:'Sư cụ',say:'Lòng con vững rồi. Sau này có lúc phải đứng ra chịu thay người khác, con sẽ không lùi.'},
  tieng20:{who:'Trai làng',say:'Mai làng đắp lại đường, anh ra cùng bọn em nhé. Có anh thì bọn em làm hăng hơn.'},
  tieng40:{who:'Cụ xã',say:'Làng có việc gì lớn, các cụ đều nhắc tên cháu.'},
  tieng60:{who:'Cụ xã',say:'Lễ hội năm nay, mời cháu ngồi chiếu trên ở đình. Trai làng ai cũng nghe cháu.'},
};

/* gọi từ gain(): vượt mốc nào thì xếp cảnh ấy */
export function mocCross(k,a,b){if(b<=a||!['van','vo','duc','tieng'].includes(k))return;const st=STATS.find(x=>x.k===k);if(!st)return;
  const seen=S.mocSeen||(S.mocSeen={}),q=S.mocQ||(S.mocQ=[]);
  for(const [m,t] of st.marks)if(a<m&&b>=m&&!seen[k+m]&&MOC[k+m]){seen[k+m]=1;q.push({k,m,t})}}
/* hiện cảnh đang chờ khi rảnh (không màn chơi, không khung nào mở) */
export function mocFlush(){if(MG||modalOpen||dialogOpen||!S||S.ended||!S.mocQ||!S.mocQ.length)return;
  const {k,m,t}=S.mocQ.shift(),c=MOC[k+m];if(!c||(c.when&&!c.when()))return;
  const name=STATS.find(x=>x.k===k).name;
  showModal({kicker:`${name} ${m}`,title:c.who,body:`<p>"${c.say}"</p><p class="note">${t}.</p>`,choices:c.choices?c.choices():undefined})}
