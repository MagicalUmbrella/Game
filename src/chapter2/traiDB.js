/* ================= chương hai · trại dân binh (ba đêm quanh đống lửa) ================= */
/* Hư cấu (trại, ông Đoàn, dân binh, lời nói), trừ các tin có src theo Toàn thư. Trại ở bãi cỏ vùng Chương Dương (CAMP_DB),
   MG 'traidb', đêm, đống lửa giữa trại, mọi người ngồi quanh. Tin tức không hiện bằng khung chữ mà người trong trại
   nói với nhau (lời trên đầu, drawBubbles), sau đó bạn đi lại, bấm E nói chuyện với từng người (say có lựa chọn).
   Ba đêm (kind):
   - 'A' tháng 2: người đưa tin kể Trần Kiện hàng giặc, Trần Bình Trọng ở bãi Đà Mạc; anh Hến muốn bỏ về (giữ chân hay để
     về, S.c2.hen); thề không hàng hay mài giáo (S.c2.the). Ngủ (ông Đoàn) → dò tin (dotin.js).
   - 'B' đêm trước Chương Dương: người nhà tới thăm (Thảo, bé Sen, hoặc mẹ): hứa trở về (S.c2.hua) hay nhận áo bông
     (S.c2.ao); bé Sen buộc vòng chỉ đỏ (S.c2.bua); Cò ở làng: đứng cạnh nhau hay ở lại giữ nhà (S.c2.coKe); Cò theo quân:
     đoàn quân Hoài Văn hầu đi ngang. Ông Đoàn → xuống thuyền (chuongduong.js).
   - 'C' sau khi giặc tan: dân binh kể tin Tây Kết, Vạn Kiếp, Thoát Hoan chui đồ đồng, lời vua; chỗ người đã ngã để trống;
     chọn theo dân binh đuổi giặc (S.c2.duoi, có thể cứu được một người làng bị chở đi) hay về làng. → vua về kinh.
   Hậu quả các lựa chọn dùng ở chuongduong.js (chuongduong đọc S.c2.the, hua, ao, bua, coKe, hen). */
import {T,TS,ctx} from '../constants.js';
import * as st from '../state.js';
import {S,save,setMG} from '../state.js';
import {gain,say,setKeys,showModal,toast} from '../ui.js';
import {camX,camY,clock} from '../render.js';
import {walkable} from '../dialogs.js';
import {keys} from '../input.js';
import {openRegion} from '../world.js';
import {campfire} from '../trai.js';
import {drawBubbles} from '../climax.js';
import {darkPost} from '../minigames/chung.js';
import {hudBox} from '../minigames/flood.js';
import {walker,goTo,drawWalker} from '../camp.js';
import {EXTRA_LOOK} from '../portrait.js';
import {villageMen} from './chuongduong.js';
import {ch2Go,ch2Note} from './index.js';

const src=t=>`<p class="src">Toàn thư chép: ${t}</p>`;
const cap=n=>n[0].toUpperCase()+n.slice(1);
const lc=n=>/^(Mẹ|Cha|Bà|Bé|Cụ|Trai|Cu)/.test(n)?n[0].toLowerCase()+n.slice(1):n;
export const CAMP_DB=[70.5,141.5];   // đống lửa trại dân binh (bãi cỏ vùng Chương Dương)
function nearOK(x,y){for(let r=0;r<8;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const tx=Math.floor(x)+dx,ty=Math.floor(y)+dy;if(walkable(tx,ty))return [tx+.5,ty+.5]}return [x,y]}
const SEAT=[[0,-1.9],[1.8,-.8],[1.8,1.1],[-2.7,.2],[-1.8,1.1],[-1.8,-.8],[1,-1.7],[-1,-1.7],[2.7,.2],[-2.4,2.2]];
const faceFire=(o,f)=>{const dx=f[0]-o.x,dy=f[1]-o.y;o.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')};

export function startTraiDB(kind){S.c2.scene='trai'+kind;openRegion(S,'phianam');save();
  const F=nearOK(...CAMP_DB),M={type:'traidb',kind,t:0,clock:0,fire:F,npc:[],bub:[],step:0,script:[],free:false,talked:{},walkers:[],
    hideNPC:true,roam:true,update:tUpdate,draw:tDraw,post:tPost,hud:tHud,findTarget:tTarget,speedMul:()=>.85};
  let si=0;const add=(id,name,look,o={})=>{const s=SEAT[si++%SEAT.length],[x,y]=nearOK(F[0]+s[0],F[1]+s[1]),n=walker(id,name,look,x,y,o);faceFire(n,F);M.npc.push(n);EXTRA_LOOK[name]=look;return n};
  M.doan=add('doan','Ông Đoàn',{id:'dan_nam1'});
  const men=villageMen().filter(m=>!m.fallen);men.forEach((m,i)=>add('m'+i,cap(m.name),m.look,{man:m}));
  if(S.co==='village'&&!S.c2.coFell)M.co=add('co','Cò',{id:'co'});
  M.hen=add('hen','Anh Hến',{id:'trai3'});if(kind!=='A'&&(S.c2.hen!=='o'||S.c2.henFell)){M.npc.pop();M.hen=null}
  M.dan=add('dan','Dân binh',{id:'huong_binh'});add('dan2','Dân binh',{id:'trai4'});
  if(kind==='C')M.empty=[...(S.c2.men||[]).filter(m=>m.fallen),...(S.c2.henFell?[{name:'anh Hến'}]:[])].map((m,i)=>{const s=SEAT[(si+i)%SEAT.length];return {name:cap(m.name),x:F[0]+s[0],y:F[1]+s[1]}});
  const [px,py]=nearOK(F[0],F[1]+3.2);S.x=px;S.y=py;st.P.dir='up';
  setMG(M);document.body.classList.add('mg');
  if(kind==='A')scriptA(M);else if(kind==='B')scriptB(M);else scriptC(M);
  setKeys('<span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> đi</span><span><kbd>E</kbd> nói chuyện</span><span>Giữ <kbd>Space</kbd>: nghe nhanh</span>')}

/* lời nói theo thời gian: [giây, người (đối tượng hoặc hàm), lời, thời lượng] ; hàm thì gọi lúc tới giờ */
function bub(o,text,t=3.4){const M=st.MG;M.bub=M.bub.filter(b=>b.o!==o);M.bub.push({o,text,t})}
function tUpdate(dt){const M=st.MG;const sp=keys[' ']?3:1;M.t+=dt*sp;M.clock=M.t;
  for(const b of M.bub)b.t-=dt*sp;M.bub=M.bub.filter(b=>b.t>0);
  while(M.step<M.script.length&&M.t>=M.script[M.step][0]){const [,who,text,d]=M.script[M.step++];if(typeof who==='function')who();else bub(who,text,d||3.4)}
  for(const w of M.walkers)if(w.to){if(goTo(w,w.to[0],w.to[1],w.sp||2.2,dt*sp)){w.to=null;if(w.done)w.done()}}
  if(M.leaving)for(const w of M.leaving){if(goTo(w,w.out[0],w.out[1],2.4,dt*sp))w.gone=true}}
function tTarget(){const M=st.MG;if(!M.free)return null;let best=1.5,t=null;
  for(const n of [...M.npc,...M.walkers])if(!n.gone&&n.talk){const d=Math.hypot(n.x-S.x,n.y-S.y);if(d<best){best=d;t=n}}
  return t?{label:'Nói chuyện với '+t.name,act:()=>t.talk(t)}:null}
const arrive=(look,name,from,to,o={})=>{const M=st.MG,[fx,fy]=nearOK(...from),w=walker('w'+M.walkers.length,name,look,fx,fy,{to:nearOK(...to),...o});EXTRA_LOOK[name]=look;M.walkers.push(w);return w};

/* ---------- đêm A: tin Trần Bình Trọng ---------- */
function scriptA(M){const F=M.fire;let mes;
  M.script=[[1,M.doan,'Ai gác thì gác, còn lại ngủ sớm. Mai còn chèo xa.'],
    [3,()=>{mes=arrive({id:'khach'},'Người đưa tin',[F[0]+10,F[1]-1],[F[0]+2.6,F[1]-.4]);M.mes=mes}],
    [7.5,()=>bub(mes,'Có tin từ phía bãi Đà Mạc!')],
    [10.5,()=>bub(mes,'Chương Hiến hầu Trần Kiện đem cả quân ra hàng giặc rồi.',3.8)],
    [14,M.hen,'Tông thất nhà vua mà cũng hàng ư?'],
    [17,()=>bub(mes,'Bảo Nghĩa Vương Trần Bình Trọng đánh giặc ở bãi Đà Mạc, bị chúng bắt.',3.8)],
    [21,()=>bub(mes,'Ông không chịu ăn. Giặc hỏi việc nước, ông không đáp.',3.6)],
    [25,()=>bub(mes,'Giặc hỏi: có muốn làm vương đất Bắc không?',3.2)],
    [28.5,()=>bub(mes,'Ông thét: "Ta thà làm ma nước Nam chứ không thèm làm vương đất bắc"!',4.6)],
    [33.5,()=>bub(mes,'…Rồi giặc giết ông.',3)],
    [37.5,M.dan,'Thà chết như ông ấy.',3.2],
    [40.5,M.hen,'Tôi… tôi muốn về. Vợ con tôi còn ở làng, giặc đi lục khắp nơi.',4],
    [45,()=>newsA(M)]];
  M.title='Tháng 2 · đêm ở trại dân binh'}
function newsA(M){
  showModal({kicker:'Xuân 1285 · tháng hai',title:'Ma nước Nam',
    body:`<p>Đống lửa nổ lách tách. Không ai nói thêm câu nào. Ông Đoàn nhìn bạn: "Còn anh?"</p>
      ${src('tháng 2 năm 1285, Chương Hiến hầu Trần Kiện đem quân hàng giặc. Bảo Nghĩa Vương Trần Bình Trọng đánh giặc ở bãi Đà Mạc, bị bắt, không chịu ăn, không đáp lời giặc hỏi việc nước; giặc hỏi có muốn làm vương đất Bắc không thì ông thét câu trên rồi bị giết.')}
      <p class="note">Trại, người đưa tin, lời trong trại là hư cấu.</p>`,
    choices:[
      {label:'Đứng dậy thề trước cả trại: không bao giờ hàng giặc',note:'+Tiếng · trận sau: ngã xuống thì cả đội gọi tên bạn',fn:()=>{gain('tieng',2);S.c2.the='the';ch2Note('Nghe tin Trần Bình Trọng, bạn đứng dậy thề trước trại dân binh không bao giờ hàng giặc.');freeA(M)}},
      {label:'Lặng lẽ ngồi mài lại lưỡi giáo suốt đêm',note:'+Võ · trận sau: đánh mạnh hơn',fn:()=>{gain('vo',2);S.c2.the='mai';ch2Note('Nghe tin Trần Bình Trọng, bạn lặng lẽ mài lại lưỡi giáo suốt đêm.');freeA(M)}}]})}
function freeA(M){M.free=true;M.title='Tháng 2 · đêm ở trại dân binh';M.hint='Nói chuyện với anh Hến (muốn bỏ về), trai làng; ông Đoàn: đi ngủ';
  M.hen.talk=()=>{if(S.c2.hen)return say('Anh Hến',S.c2.hen==='o'?'Tôi ở lại. Anh nói phải.':'Tôi về đây. Anh bảo trọng.');
    say('Anh Hến','Làng tôi ở ngay bên kia sông. Đêm nào tôi cũng nghe tiếng lũ trẻ khóc trong mơ. Anh bảo tôi phải làm sao?',[
      {label:'Giữ anh ở lại: bỏ đi lúc này là bỏ cả nước',note:S.tieng>=30?'+Tiếng · trận sau thêm một người đánh cùng':'cần Tiếng 30',disabled:S.tieng<30,fn:()=>{S.c2.hen='o';gain('tieng',2);ch2Note('Anh Hến, dân binh làng bên, muốn bỏ về; bạn giữ được anh ở lại.')}},
      {label:'Để anh về lo cho vợ con',note:'+Đức · anh Hến về làng',fn:()=>{S.c2.hen='ve';gain('duc',2);ch2Note('Anh Hến, dân binh làng bên, muốn bỏ về lo cho vợ con; bạn để anh đi.');M.leaving=[M.hen];M.hen.out=nearOK(M.fire[0]-12,M.fire[1]+2)}}])};
  for(const n of M.npc)if(n.man)n.talk=()=>say(n.name,manLine(n));
  if(M.co)M.co.talk=()=>say('Cò',S.flags.dieu?'Mày còn nhớ cái diều năm tám tuổi không? Giặc tan thì mình thả lại một cái, to hơn.':'Ngủ đi. Mai tao chèo cho, mày cứ ngồi mũi.');
  M.doan.talk=()=>say('Ông Đoàn','Ngủ đi. Sáng mai tôi cần một người lanh lẹ lẻn vào làng Thượng Phúc dò tin giặc. Anh đi được không?',[{label:'Đi ngủ, sáng mai lên đường',fn:()=>{if(!S.c2.hen){S.c2.hen='bo';ch2Note('Đêm ấy anh Hến lặng lẽ bỏ trại về làng, không ai giữ.')}done('dotin')}}])}
function manLine(n){const l=[S.flags.de==='saved'?'Năm lụt mình còn giữ được đê, giờ giữ nước cũng giữ được.':'Năm lụt làng mình mất đê. Lần này không để mất nữa.',
  (S.flags.doi||0)>=3?'Mấy buổi luyện đội ở sân võ, giờ mới thấy có ích.':'Ước gì hồi ấy tôi chịu khó tập võ hơn.',
  'Không biết mẹ tôi ở làng có đủ gạo không.','Anh dẫn đâu tôi theo đấy.'];return l[(n.id.charCodeAt(1)+Math.floor(st.MG.t/20))%l.length]}

/* ---------- đêm B: trước Chương Dương ---------- */
function scriptB(M){const F=M.fire;M.title='Tháng 5 · đêm trước Chương Dương';
  const wife=S.thao==='wife',coWife=S.thao==='co',kin=wife||coWife?{name:'Thảo',look:{id:'thao'}}:{name:'Mẹ',look:{id:'me_gia'}};
  M.script=[[1,M.doan,'Đêm mai xuống thuyền. Ai có nhắn gì về nhà thì nhắn đêm nay.'],
    [3,()=>{M.kin=arrive(kin.look,kin.name,[F[0]-11,F[1]+1],[F[0]-2.4,F[1]+2.6]);if(S.child&&wife)M.sen=arrive({id:'sen',kid:true},'Bé Sen',[F[0]-12,F[1]+2],[F[0]-3.2,F[1]+3.2])}],
    [8,()=>bub(M.kin,kin.name==='Mẹ'?'Con ơi! Mẹ mang cơm nắm cho con đây.':'Anh ơi! Em với con mang cơm nắm sang.')],
    [11,()=>{if(M.sen)bub(M.sen,'Cha ơi!')}]];
  if(S.co==='army')M.script.push([13,()=>{const col=[];for(let i=0;i<6;i++){const w=arrive(i===4?{id:'co_do'}:{id:'quan'},i===4?'Cò':'Quân Hoài Văn hầu',[F[0]+14,F[1]-4.5+(i%2)*.6],[F[0]-14,F[1]-4.5+(i%2)*.6],{sp:2.6});w.x+=i*1.3;w.to=nearOK(F[0]-14+i*1.3,F[1]-4.5);col.push(w)}M.col=col}],
    [16,()=>bub(M.col[4],'Ê! Mai gặp nhau ở Chương Dương nhé! Quân Hoài Văn hầu đánh cánh trái!',4)],[20,()=>{toast('Cò theo quân Hoài Văn hầu đi qua trại trong đêm.',3600)}]);
  M.script.push([14,()=>{M.free=true;M.hint=`Nói chuyện với ${kin.name.toLowerCase()==='mẹ'?'mẹ':'Thảo'}${M.sen?', bé Sen':''}${M.co?', Cò':''}; ông Đoàn: xuống thuyền`;setTalksB(M,kin)}])}
function setTalksB(M,kin){
  if(M.kin)M.kin.talk=()=>{if(S.c2.hua||S.c2.ao)return say(kin.name,S.c2.hua?'Anh nhớ lời rồi đấy.':'Mặc áo vào cho ấm. Đi đi.');
    const coWife=S.thao==='co';
    say(kin.name,coWife?'Cò không chịu ngồi yên đâu, anh biết rồi. Em chỉ xin anh một điều…':kin.name==='Mẹ'?'Mẹ già rồi, chỉ mong con về. Con định thế nào?':'Em không cản anh. Em chỉ muốn nghe anh nói một câu.',[
      {label:coWife?'Tôi hứa đưa Cò về cho cô':'Hứa sẽ trở về',note:'trận sau: ngã xuống lần đầu thì đứng dậy đủ sức',fn:()=>{S.c2.hua=coWife?'co':'ve';ch2Note(coWife?'Đêm trước Chương Dương, bạn hứa với Thảo sẽ đưa Cò về.':`Đêm trước Chương Dương, bạn hứa với ${lc(kin.name)} sẽ trở về.`)}},
      {label:kin.name==='Mẹ'?'Mẹ đừng đợi con, cứ lo cho mình':'Đừng đợi anh. Nếu anh không về, em đưa con về bên ngoại',note:'nhận áo bông chần · trận sau thêm 1 máu',fn:()=>{S.c2.ao=true;gain('duc',1);ch2Note(`Đêm trước Chương Dương, ${lc(kin.name)} khâu cho bạn chiếc áo bông chần, dặn mặc vào mà đi.`)}}])};
  if(M.sen)M.sen.talk=()=>{if(S.c2.bua)return say('Bé Sen','Cha nhớ đừng tháo ra nhé!');S.c2.bua=true;ch2Note('Bé Sen buộc vào cổ tay bạn một vòng chỉ đỏ.');
    say('Bé Sen','Cha đi đánh giặc à? Con buộc cho cha cái này. Bà bảo chỉ đỏ thì tên không bắn trúng.')};
  if(M.co)M.co.talk=()=>{if(S.c2.coKe)return say('Cò',S.c2.coKe==='canh'?'Mai tao đứng sau lưng mày.':'Ừ… tao ở lại giữ thuyền. Mày phải về đấy.');
    say('Cò',S.flags.dieu?'Hồi tám tuổi trốn học thả diều, mày bị thầy phạt quỳ, tao đứng ngoài cửa sổ. Mai tao không đứng ngoài nữa.':'Mai đánh lớn. Mày tính sao với tao?',[
      {label:'Mai mày đứng cạnh tao, trông lưng cho nhau',note:'Cò khỏe hơn, theo sát bạn',fn:()=>{S.c2.coKe='canh';ch2Note('Đêm trước Chương Dương, bạn với Cò hẹn đứng cạnh nhau trông lưng cho nhau.')}},
      {label:'Mày ở lại giữ thuyền, nhà mày còn mẹ già',note:'Cò không ra trận',fn:()=>{S.c2.coKe='o';gain('duc',1);ch2Note('Đêm trước Chương Dương, bạn bảo Cò ở lại giữ thuyền vì nhà Cò còn mẹ già.')}}])};
  for(const n of M.npc)if(n.man)n.talk=()=>say(n.name,manLine(n));
  if(M.hen&&S.c2.hen==='o')M.hen.talk=()=>say('Anh Hến','Hôm ấy anh giữ tôi ở lại. Mai tôi đứng gần anh.');
  M.doan.talk=()=>say('Ông Đoàn','Trăng lặn rồi. Ra bến thôi.',[{label:'Xuống thuyền',fn:()=>done('cd')}])}

/* ---------- đêm C: giặc tan ---------- */
function scriptC(M){const F=M.fire;M.title='Hạ 1285 · lửa trại sau ngày giặc tan';M.light=.66;
  const a=M.dan,b=M.npc.find(n=>n.man)||M.hen||M.dan,c=M.co||M.hen||M.dan;
  M.script=[[1,a,'Nghe tin chưa? Ở Tây Kết quân ta chém đầu Toa Đô rồi!'],
    [4.5,b,'Ô Mã Nhi chỉ còn một chiếc thuyền, vượt biển chạy mất.'],
    [8,M.doan,'Ở Vạn Kiếp, Hưng Đạo Vương phá tan quân Thoát Hoan.',3.6],
    [12,c,'…Mà tướng giặc phải giấu Thoát Hoan trong một cái đồ đồng mới chạy được về Bắc!',4.2],
    [16.5,()=>{for(const n of M.npc)if(n!==M.doan&&Math.random()<.8)bub(n,['Ha ha ha!','Chui đồ đồng!','Ha ha!'][Math.floor(Math.random()*3)],2.6)}],
    [20,M.doan,'Vua trông thấy thủ cấp Toa Đô, bảo: "Người làm tôi phải nên như thế này".',4.4],
    [25,M.doan,'Rồi cởi áo ngự, sai quân đem liệm chôn.',3.4]];
  let t=29;for(const e of (M.empty||[]))M.script.push([t,a,`Giá có ${e.name} ở đây…`,3.4]),t+=3.8;
  M.script.push([t+1,()=>newsC(M)])}
function newsC(M){
  showModal({kicker:'Hạ 1285 · tháng năm',title:'Giặc chạy',
    body:`<p>Lửa trại cháy tới khuya. ${(M.empty||[]).length?'Mấy chỗ ngồi quanh đống lửa để trống, có bát cơm úp ở đó.':''} Sáng mai ông Đoàn chia đội: ai còn sức thì xuôi sông đuổi giặc, ai nhà còn người già con nhỏ thì về dựng lại mái nhà.</p>
      <p>Người ta truyền nhau lời vua khi trông thấy thủ cấp Toa Đô: <b>"Người làm tôi phải nên như thế này"</b>.</p>
      ${src('tháng 5 năm 1285, ngày 20, ta đánh bại giặc ở Tây Kết, chém đầu Nguyên soái Toa Đô; Ô Mã Nhi trốn ra biển chỉ còn một chiếc thuyền. Hưng Đạo Vương đánh bại Thoát Hoan, Lý Hằng ở Vạn Kiếp; tỳ tướng Lý Quán giấu Thoát Hoan vào một đồ đồng chạy về Bắc. Vua thấy thủ cấp Toa Đô, nói câu trên, cởi áo ngự sai liệm chôn.')}
      <p class="note">Lửa trại, lời dân binh là hư cấu.</p>`,
    choices:[
      {label:'Theo dân binh đuổi giặc',note:'+Võ'+((S.c2.missing||[]).length?' · có thể gặp người làng bị chở đi':''),fn:()=>{S.c2.duoi='duoi';gain('vo',2);ch2Note('Giặc tan, bạn theo dân binh xuôi sông đuổi giặc.');duoi()}},
      {label:'Về làng dựng lại mái nhà',note:'+Đức · đứng cùng người nhà ngày vua về',fn:()=>{S.c2.duoi='ve';gain('duc',2);ch2Note('Giặc tan, bạn về làng cùng người nhà dựng lại mái nhà trên nền cũ.');done('vuave')}}]})}
/* đuổi giặc: chặn được một thuyền giặc chở người bị bắt, cứu được một người làng bị chở đi từ trại Gia Lâm */
function duoi(){const miss=S.c2.missing||[];
  if(!miss.length){showModal({kicker:'Hạ 1285',title:'Xuôi sông',body:'<p>Thuyền dân binh đuổi tới tận cửa sông. Thuyền giặc chạy tán loạn, vứt lại cờ, giáo trôi đầy mặt nước.</p><p class="note">Hư cấu.</p>',choices:[{label:'Tiếp tục',fn:()=>done('vuave')}]});return}
  const who=miss[0];S.c2.missing=miss.slice(1);S.c2.rescued=who;gain('tieng',2);
  ch2Note(`Trên đường đuổi giặc, thuyền dân binh chặn được một thuyền giặc chở người bị bắt. ${cap(who)} được cứu về.`);
  showModal({kicker:'Hạ 1285',title:'Thuyền chở người bị bắt',body:`<p>Gần cửa sông, thuyền dân binh vây một chiếc thuyền giặc tụt lại phía sau. Dưới khoang có mấy người bị trói. Trong đó có ${lc(who)}, gầy rộc đi, nhận ra bạn thì bật khóc.</p><p class="note">Hư cấu.</p>`,choices:[{label:'Đưa về làng',fn:()=>done('vuave')}]})}

function done(next){const M=st.MG;if(M&&M.type==='traidb'){setMG(null);setKeys();document.body.classList.remove('mg')}save();ch2Go(next)}

/* ---------- vẽ ---------- */
function tDraw(list){const M=st.MG,F=M.fire;
  list.push({y:F[1],f:()=>campfire(F[0],F[1],7)});
  for(const e of (M.empty||[]))list.push({y:e.y-.2,f:()=>{const x=e.x*T-camX,y=(e.y-.3)*T-camY;ctx.fillStyle='#0b0d0c';ctx.fillRect(x-22,y-8,44,16);ctx.fillStyle='#8a7a52';ctx.fillRect(x-20,y-6,40,12);ctx.fillStyle='#e8e0c8';ctx.fillRect(x-6,y-8,12,7);ctx.fillStyle='#6a5a3a';ctx.fillRect(x-7,y-2,14,3)},lab:Math.hypot(e.x-S.x,e.y-S.y)<4?['Chỗ của '+e.name,e.x,e.y-1.2]:null});
  for(const n of M.npc)if(!n.gone)drawWalker(list,n,M.free&&!M.bub.length);
  for(const w of M.walkers)if(!w.gone)drawWalker(list,w,M.free&&!M.bub.length)}
function tPost(){const M=st.MG,F=M.fire;darkPost([[F[0],F[1],330+Math.sin(clock*9)*10],[S.x,S.y,90]],M.light||.78);drawBubbles(M.bub)}
function tHud(){const M=st.MG,w=Math.min(470,innerWidth-32),x=Math.round(innerWidth/2-w/2);hudBox(x,16,w,46);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#e2bf72';ctx.fillText('Trại dân binh · '+(M.title||''),x+12,30);
  ctx.fillStyle='#efe8d4';ctx.fillText(M.free?(M.hint||'Bấm E nói chuyện'):'Ngồi nghe quanh đống lửa (giữ Space nghe nhanh)',x+12,48)}
