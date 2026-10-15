/* ================= chuỗi nhiệm vụ ================= */
/* Hư cấu. Ba chuỗi nhiều bước với người thân: dạy Cò biết chữ, lợp mái nhà bà Tư cùng Thảo, chép sách
   cho thầy Chu. S.chains[id] = {st, n, last}: st 'off' (chưa bắt đầu), 'on', 'done', 'no' (từ chối),
   'fail' (quá hạn); n: số bước đã làm; last: mùa làm bước gần nhất (mỗi mùa một bước).
   Lựa chọn hiện trong hội thoại (chainChoices), hạn chót xét mỗi mùa (checkChains), mỗi kết cục có
   dòng biên niên (chainChronicle). Bước chặt tre nằm ở explore.js (chỗ 'tre', và mọi bụi tre trong TREES). */
import {S,age} from './state.js';
import {doneQuest,gain,renderHUD,say,spend,startQuest,toast} from './ui.js';

const now=()=>S.year*4+S.season;
const C=id=>{S.chains||(S.chains={});return S.chains[id]||(S.chains[id]={st:'off',n:0,last:-1})};
const quest={co:'cco',thao:'cthao',thay:'cthay'};

export const CHAIN_INFO={
  co:{title:'Dạy Cò biết chữ',hint:c=>`Mỗi mùa dạy Cò một buổi (nói chuyện với Cò). Đã dạy ${c.n}/3 buổi. Phải xong trước khi bạn 15 tuổi.`},
  thao:{title:'Mái nhà bà Tư',hint:c=>c.n<3?`Chặt tre ở bụi tre nào cũng được, nhiều nhất ở rừng phía tây (đứng sát gốc bấm E, mỗi mùa một bó). Đã có ${c.n}/3 bó. Phải xong trước năm 1279.`:'Đủ tre rồi. Sang nhà bà Tư cùng Thảo lợp lại mái (tốn 2 Sức).'},
  thay:{title:'Chép sách cho thầy',hint:c=>`Mỗi mùa chép cho thầy Chu một buổi (nói chuyện với thầy). Đã chép ${c.n}/3 buổi.`},
};
export const chainHint=id=>CHAIN_INFO[id].hint(C(id));
export const tre=()=>C('thao');

function begin(id){C(id).st='on';startQuest(quest[id])}
function finish(id){C(id).st='done';doneQuest(quest[id])}
function step(id,cost=1){const c=C(id);if(c.last===now()||!spend(cost))return false;c.n++;c.last=now();renderHUD();return true}

/* Lựa chọn thêm vào hội thoại với npc ('co' | 'thao' | 'thay'). */
export function chainChoices(npc){
  const ch=[];
  if(npc==='co'){const c=C('co');
    if(c.st==='off'&&age()>=10&&age()<=13&&S.van>=10&&S.co==='village')ch.push({label:'Sao trông cậu buồn thế?',fn:()=>say('Cò','Tớ cũng muốn biết chữ như cậu. Nhưng nhà tớ nghèo, cha bảo đi học thì ai chăn trâu.',[
      {label:'Để tớ dạy cậu',note:'mỗi mùa một buổi, ba buổi',fn:()=>{begin('co');say('Cò','Thật hả? Thế thì tớ chăn trâu xong sẽ sang tìm cậu!')}},
      {label:'Tớ bận lắm',fn:()=>{c.st='no';S.rel.co=Math.max(0,S.rel.co-1);renderHUD()}}])});
    if(c.st==='on')ch.push({label:`Dạy Cò học chữ (${c.n}/3)`,note:c.last===now()?'mùa này đã dạy':'−1 Sức',disabled:c.last===now(),fn:()=>{if(!step('co'))return;
      if(c.n>=3){finish('co');S.rel.co+=3;gain('duc',3);say('Cò','Cò cầm que vạch lên vách đất hai chữ tên mình, nét xiêu vẹo. Nó nhìn mãi, rồi quay sang bạn cười toe.')}
      else toast(c.n===1?'Bạn dạy Cò mấy nét đầu tiên trên khay cát.':'Cò đã đọc được mấy chữ trên câu đối ở đình.')}});
  }
  if(npc==='thao'){const c=C('thao');
    if(c.st==='off'&&S.year>=1272&&S.year<=1277&&S.thao==='none')ch.push({label:'Em có chuyện gì lo à?',fn:()=>say('Thảo','Mái nhà bà dột hết rồi anh ạ. Sắp đến mùa mưa, mà em không biết chặt tre lợp lại.',[
      {label:'Để anh lo',note:'chặt 3 bó tre, rồi cùng lợp mái',fn:()=>{begin('thao');say('Thảo','Em cảm ơn anh. Bụi tre to nhất ở bìa rừng phía tây đấy.')}},
      {label:'Anh bận lắm',fn:()=>{c.st='no'}}])});
    if(c.st==='on'&&c.n>=3)ch.push({label:'Cùng Thảo lợp lại mái nhà',note:S.suc<2?'cần 2 Sức':'−2 Sức',disabled:S.suc<2,fn:()=>{if(!spend(2))return;finish('thao');S.rel.thao+=3;gain('tieng',2);gain('duc',1);
      say('Thảo','Hai người lợp xong mái lúc trời chạng vạng. Bà Tư đứng dưới sân, nhìn lên mà rơm rớm nước mắt. Thảo lau mồ hôi, cười: "Mưa bao nhiêu cũng không sợ nữa."')}});
  }
  if(npc==='thay'){const c=C('thay');
    if(c.st==='off'&&S.thay&&S.van>=20&&S.year>=1270&&S.year<=1280)ch.push({label:'Thầy trông mệt quá',fn:()=>say('Thầy đồ Chu','Mắt thầy kém rồi. Thầy muốn chép lại bộ sách quý này cho đời sau, mà tay run không viết nổi nữa.',[
      {label:'Con xin chép giúp thầy',note:'mỗi mùa một buổi, ba buổi',fn:()=>{begin('thay');say('Thầy đồ Chu','Tốt lắm. Chép sách cũng là học, con ạ.')}},
      {label:'Con bận việc nhà',fn:()=>{c.st='no'}}])});
    if(c.st==='on')ch.push({label:`Chép sách cho thầy (${c.n}/3)`,note:c.last===now()?'mùa này đã chép':'−1 Sức · +1 Văn',disabled:c.last===now(),fn:()=>{if(!step('thay'))return;gain('van',1);
      if(c.n>=3){finish('thay');gain('van',3);gain('duc',1);say('Thầy đồ Chu','Thầy lật từng trang bản chép, gật gù. "Chữ con đã ra chữ rồi. Sau này thầy không còn, con giữ lấy bộ sách này."')}
      else toast('Bạn ngồi chép bên ngọn đèn dầu đến khuya.')}});
  }
  return ch;
}

/* Xét hạn chót mỗi khi sang mùa. */
export function checkChains(){
  const fail=(id,msg)=>{const c=C(id);if(c.st!=='on')return;c.st='fail';delete S.quests[quest[id]];renderHUD();toast(msg,5200)};
  if(age()>=15)fail('co','Cò lớn rồi, bận việc đồng áng, thôi không học chữ nữa.');
  if(S.year>=1279||S.thao!=='none')fail('thao','Mái nhà bà Tư vẫn dột. Thảo không nhắc lại chuyện ấy nữa.');
  if(!S.thay)fail('thay','Thầy Chu mất khi bộ sách còn chép dở.');
}

export function chainChronicle(){
  const L=[],st=id=>C(id).st;
  L.push({done:'Bạn dạy Cò biết chữ; Cò viết được tên mình lên vách nhà.'+(S.co==='army'?' Theo quân, Cò tự viết thư gửi về làng.':''),
    fail:'Bạn hứa dạy Cò biết chữ nhưng bỏ dở giữa chừng.',no:'Cò ngỏ ý muốn học chữ, bạn bận không nhận dạy.'}[st('co')]);
  L.push({done:'Bạn cùng Thảo lợp lại mái nhà bà Tư trước mùa mưa.',fail:'Bạn hứa lợp mái nhà bà Tư rồi bỏ đó; mùa mưa năm ấy nhà bà dột suốt.',no:'Thảo nhờ bạn lợp mái nhà bà Tư, bạn từ chối.'}[st('thao')]);
  L.push({done:'Bạn chép lại bộ sách quý cho thầy Chu.',fail:'Thầy Chu mất khi bộ sách bạn chép còn dở dang.',no:'Thầy Chu muốn nhờ bạn chép sách, bạn từ chối.'}[st('thay')]);
  return L.filter(Boolean);
}
