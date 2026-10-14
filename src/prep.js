/* ================= lo trước ngày giặc đến (1282–1284) ================= */
/* Hư cấu cấp làng. Từ khi có tin Toa Đô (thu 1282) đến hết năm 1284, có ba việc tốn tiền để lo trước.
   Mỗi việc ghi một cờ S.flags[id], có hậu quả trong đêm 1285 (prepClimax, gọi từ startClimax) và một
   dòng trong biên niên (prepChronicle). Người chơi thường chỉ đủ tiền cho một, hai việc. */
import {S} from './state.js';
import {doneQuest,renderHUD,toast} from './ui.js';

export const PREP={
  lan:{cost:12,label:'Góp tiền dựng lán trong rừng',note:'bà Tư, bé Sen lánh vào rừng trước',
    done:'Trai làng dựng mấy gian lán ở bìa rừng tây nam. Có biến thì người già, trẻ nhỏ lánh vào trước.'},
  giao:{cost:10,label:'Rèn giáo cho trai làng',note:'trai làng đứng ra sẽ có giáo, đánh mạnh hơn',
    done:'Bác thợ rèn rèn một bó giáo. Đêm giặc đến, trai làng nào đứng ra sẽ có giáo trong tay.'},
  catThoc:{cost:6,label:'Cất bớt thóc vào rừng',note:'thuê người gánh · một bao thóc giấu sẵn',
    done:'Mấy đêm liền, nhà bạn thuê người gánh thóc vào rừng, chôn dưới gốc cây lớn.'},
};

export const prepOpen=()=>(S.year===1282&&S.season>=2)||S.year===1283||S.year===1284;

/* Lựa chọn trong hội thoại cho việc id, hoặc null nếu đã làm hay chưa tới lúc. */
export function prepChoice(id){
  const p=PREP[id];if(!prepOpen()||S.flags[id])return null;
  return{label:p.label,note:S.tien>=p.cost?`${p.cost} quan · ${p.note}`:`cần ${p.cost} quan`,disabled:S.tien<p.cost,
    fn:()=>{S.tien-=p.cost;S.flags[id]=true;renderHUD();toast(p.done,5200);if(Object.keys(PREP).every(k=>S.flags[k]))doneQuest('lo')}};
}

/* Áp vào đêm 1285. v: người cần cứu, sk: bao thóc, al: người cùng đánh. putSafe(o) đưa vào rừng. */
export function prepClimax(v,sk,al,putSafe){
  if(S.flags.lan)for(const p of v)if(p.id==='batu'||p.id==='sen')putSafe(p);
  if(S.flags.catThoc&&sk.length)putSafe(sk[0]);
  if(S.flags.giao)for(const a of al)if(a.id.startsWith('trai')){a.hp+=1;a.dmg=2;a.look={...a.look,spear:true}}
}

/* Dòng biên niên. nLang: số trai làng đứng ra đêm 1285. */
export function prepChronicle(nLang){
  const L=[],who=[S.child?'bé Sen':'',('bà Tư')].filter(Boolean).join(' và ');
  if(S.flags.lan)L.push(`Bạn góp tiền dựng lán trong rừng. Đêm giặc đến, ${who} đã lánh sẵn ở đó.`);
  if(S.flags.giao)L.push(nLang?'Bạn rèn giáo cho trai làng. Đêm giặc đến, họ cầm giáo đứng cạnh bạn.':'Bạn rèn giáo cho trai làng, nhưng đêm giặc đến không ai đứng ra cầm.');
  if(S.flags.catThoc)L.push('Bạn cất bớt thóc vào rừng từ trước. Giặc đến, kho nhà trống trơn.');
  return L;
}
