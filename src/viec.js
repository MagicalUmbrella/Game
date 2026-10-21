/* ================= việc cần làm ================= */
/* Khung "Việc cần làm" (ui.js) luôn có việc để làm: ngoài các việc đã nhận (QUESTS), gợi ý những việc làm được
   ngay mùa này theo tình trạng của bạn: còn Sức thì học, luyện ở đâu; chưa ăn cơm; nghề đang học dở; mốc chỉ số
   sắp tới; bạn bè; chỗ chưa khám phá; hết Sức thì về ngủ. Mỗi gợi ý ghi rõ đến đâu, gặp ai. */
import {vatOpen} from './minigames/vat.js';
import {MG,S,age} from './state.js';
import {STATS,sucMax,statCap} from './stats.js';
import {NGHE,knows} from './nghe.js';
import {foundCount,spotTotal} from './explore.js';
import {RUONG_MAX,ruongCost,vanFailOpen} from './chuc.js';

const now=()=>S.year*4+S.season;
export function suggestions(){
  const a=age(),out=[],add=(title,hint)=>out.push({title,hint});
  if(MG||S.ended||S.ch===2)return out;   // chương hai đi theo cảnh, chưa có việc tự do; đang trong màn chơi riêng (lụt, đêm giặc, bị giải…): khung chỉ hiện việc đã nhận
  if(S.suc<=0){add('Hết Sức mùa này','Bấm N để về nhà ngủ, sang mùa mới. Hoặc ở cửa nhà chọn việc chính cho thời gian trôi nhanh.');return out}
  if(!S.ate&&S.suc<sucMax())add('Ăn cơm mẹ nấu','Về nhà gặp mẹ.');
  // học, luyện chính
  // chỉ số đã chạm trần tuổi này (statCap) thì thôi gợi ý học, luyện; sang năm trần lên thì gợi ý lại
  const room=k=>(S[k]||0)<statCap(k);
  if(S.path==='van'){if(room('van'))add('Học ở Quốc học viện',`Gặp Học quan trong kinh thành (phía bắc, qua cổng thành).`)}
  else if(S.path==='vo'){if(room('vo'))add('Luyện ở Giảng võ đường',`Gặp Võ quan trong kinh thành, phía đông.`)}
  else if(S.path==='nong')add('Làm đồng',`Ra ruộng nhà mình phía nam làng, đứng trên ruộng bấm E.`);
  else{if(S.thay&&S.quests.hoc!=='active'&&room('van'))add('Học chữ ở trường làng',`Gặp thầy đồ Chu ở trường làng, phía nam đình.`);   // mẹ đã giao việc "Đến trường làng" thì khỏi gợi ý trùng
    if(a>=8&&room('vo'))add('Luyện võ ở sân võ','Gặp lão võ sư Hoàng ở sân võ, phía đông bắc làng.')}
  // thăng tiến (chuc.js)
  const c=S.career||{};
  if(vanFailOpen())add('Trượt thi rồi, đi đường nào?','Về nhà bấm E ở cửa: ở lại Quốc học viện, về làng dạy học, hoặc làm lại viên ở huyện.');
  if(S.path==='van'&&c.van==='day')add(S.thay?'Phụ thầy Chu dạy trẻ':'Dạy trẻ ở trường làng',`Vào trường làng (phía nam đình) bấm E. Đã dạy ${c.hoctro||0} buổi.`);
  if(S.path==='van'&&c.van==='lai')add('Lên huyện làm việc','Ở nhà bấm E ở cửa.');
  if(S.path==='nong'&&a>=16&&(c.ruong||2)<RUONG_MAX&&c.mua!==now()&&S.tien>=ruongCost())add('Mua thêm ruộng',`Gặp cụ xã: ${ruongCost()} quan một thửa.`);
  if(vatOpen())add('Hội xuân: sới vật ở đình','Vào cửa đình bấm E. Mỗi năm được vào sới một keo.');
  // nghề đang học dở, mùa này còn học được
  const ngheNext={ren:()=>a>=14&&S.renAt!==now()&&'Phụ bác thợ rèn quai búa (lò rèn trong kinh thành), mỗi mùa một lần.',
    cheo:()=>a>=12&&S.cheoAt!==now()&&'Gặp ông lái đò ở bến sông Hồng, phía đông làng, cầm chèo một chuyến.',
    thuoc:()=>a>=12&&S.chua!==now()&&'Hỏi sư cụ ở chùa làng (phía tây bắc) cách dùng cây thuốc, hoặc hái lá thuốc trong rừng.'};
  // nghề: chỉ một dòng, nghề gần xong nhất, đặt cuối khung (tiến độ mọi nghề xem ở bảng phím C)
  let ng=null;
  for(const id of Object.keys(ngheNext)){const p=(S.nghe||{})[id]||0;if(p>0&&!knows(id)){const h=ngheNext[id]();if(h&&(!ng||p/NGHE[id].need>ng.r))ng={r:p/NGHE[id].need,t:`Học nghề ${NGHE[id].name.toLowerCase()} (${p}/${NGHE[id].need})`,h}}}
  if(!ng&&a>=12&&!((S.nghe||{}).cheo)&&S.cheoAt!==now())ng={t:'Ra bến đò sông Hồng',h:'Ông lái đò ngồi ở bến dưới chân đê, phía đông làng. Xin ông cho cầm chèo một chuyến.'};
  // mốc chỉ số sắp tới
  for(const st of STATS){if(st.k==='the')continue;const v=S[st.k],nx=st.marks.find(([m])=>v<m);if(nx&&nx[0]-v<=6&&nx[0]<=statCap(st.k))add(`Sắp tới mốc ${st.name} ${nx[0]}`,`Còn ${nx[0]-v} nữa: ${nx[1].charAt(0).toLowerCase()+nx[1].slice(1)}.`)}
  // bạn bè
  if(S.ev.thao&&S.thao==='none'&&!S.thaoHelped&&a>=12)add('Gánh nước giúp Thảo','Thảo ở nhà bà Tư, cạnh nhà mình.');
  if(S.co==='village'&&!S.coPlayed&&a<26)add(a<14?'Đi chơi với Cò':'Ngồi uống nước với Cò','Cò hay ở quanh gốc đa đầu làng.');
  // khám phá
  const left=spotTotal()-foundCount();if(a>=8&&left>0)add('Khám phá quanh làng',`Còn ${left} nơi chưa tới. Thấy lấp lánh thì lại gần bấm E.`);
  if(ng)add(ng.t,ng.h);
  return out}
