/* ================= việc cần làm ================= */
/* Khung "Việc cần làm" (ui.js) luôn có việc để làm: ngoài các việc đã nhận (QUESTS), gợi ý những việc làm được
   ngay mùa này theo tình trạng của bạn: còn Sức thì học, luyện ở đâu; chưa ăn cơm; nghề đang học dở; mốc chỉ số
   sắp tới; bạn bè; chỗ chưa khám phá; hết Sức thì về ngủ. Mỗi gợi ý ghi rõ đến đâu, gặp ai. */
import {MG,S,age} from './state.js';
import {STATS,sucMax} from './stats.js';
import {NGHE,knows} from './nghe.js';
import {foundCount,spotTotal} from './explore.js';

const now=()=>S.year*4+S.season;
export function suggestions(){
  const a=age(),out=[],add=(title,hint)=>out.push({title,hint});
  if(MG||S.ended)return out;   // đang trong màn chơi riêng (lụt, đêm giặc, bị giải…): khung chỉ hiện việc đã nhận
  if(S.suc<=0){add('Hết Sức mùa này','Về nhà, bấm E ở cửa để ngủ sang mùa mới, hoặc chọn việc chính cho thời gian trôi nhanh.');return out}
  if(!S.ate&&S.suc<sucMax())add('Ăn cơm mẹ nấu','Về nhà gặp mẹ: thêm 1 Sức, người khỏe lên.');
  // học, luyện chính
  if(S.path==='van')add('Học ở Quốc học viện',`Gặp Học quan trong kinh thành (phía bắc, qua cổng thành). Mỗi buổi −1 Sức, +3 Văn. Còn ${S.suc} Sức.`);
  else if(S.path==='vo')add('Luyện ở Giảng võ đường',`Gặp Võ quan trong kinh thành, phía đông. Mỗi buổi −1 Sức, +4 Võ, học cưỡi ngựa. Còn ${S.suc} Sức.`);
  else if(S.path==='nong')add('Làm đồng',`Ra ruộng nhà mình phía nam làng, đứng trên ruộng bấm E. Còn ${S.suc} Sức.`);
  else{if(S.thay)add('Học chữ ở trường làng',`Gặp thầy đồ Chu ở trường làng, phía nam đình. Mỗi buổi −1 Sức, +Văn. Còn ${S.suc} Sức.`);
    if(a>=8)add('Luyện võ ở sân võ','Gặp lão võ sư Hoàng ở sân võ, phía đông bắc làng. Mỗi buổi −1 Sức, +Võ.')}
  // nghề đang học dở, mùa này còn học được
  const ngheNext={ren:()=>a>=14&&S.renAt!==now()&&'Phụ bác thợ rèn quai búa (lò rèn trong kinh thành), mỗi mùa một lần.',
    cheo:()=>a>=12&&S.found&&S.found.do!=null&&S.cheoAt!==now()&&'Giúp ông lái đò ở bến sông Tô Lịch chèo đò, mỗi mùa một lần.',
    thuoc:()=>a>=12&&S.chua!==now()&&'Hỏi sư cụ ở chùa làng (phía tây bắc) cách dùng cây thuốc, hoặc hái lá thuốc trong rừng.'};
  for(const id of Object.keys(ngheNext)){const p=(S.nghe||{})[id]||0;if(p>0&&!knows(id)){const h=ngheNext[id]();if(h)add(`Học nghề ${NGHE[id].name.toLowerCase()} (${p}/${NGHE[id].need})`,h)}}
  // mốc chỉ số sắp tới
  for(const st of STATS){if(st.k==='the')continue;const v=S[st.k],nx=st.marks.find(([m])=>v<m);if(nx&&nx[0]-v<=6)add(`Sắp tới mốc ${st.name} ${nx[0]}`,`Còn ${nx[0]-v} nữa: ${nx[1].charAt(0).toLowerCase()+nx[1].slice(1)}.`)}
  // bạn bè
  if(S.ev.thao&&S.thao==='none'&&!S.thaoHelped&&a>=12)add('Gánh nước giúp Thảo','Thảo ở nhà bà Tư, cạnh nhà mình. Thân thiết hơn.');
  if(S.co==='village'&&!S.coPlayed&&a<26)add(a<14?'Đi chơi với Cò':'Ngồi uống nước với Cò','Cò hay ở quanh gốc đa đầu làng.');
  // khám phá
  const left=spotTotal()-foundCount();if(a>=8&&left>0)add('Khám phá quanh làng',`Còn ${left} nơi chưa tới. Thấy lấp lánh thì lại gần bấm E.`);
  return out}
