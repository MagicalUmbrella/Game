/* ================= chương hai · giặc tan, vua về kinh ================= */
/* Ba cảnh sau khi cứu người ở trại Gia Lâm (giactan.js):
   - tin (khung sự kiện): giặc chạy; chọn theo dân binh đuổi giặc hay về làng dựng lại nhà (S.c2.duoi). Tin Tây Kết, Vạn Kiếp
     theo Toàn thư (mục tháng 5 năm 1285).
   - vuave (MG 'vuave', trên bản đồ kinh thành): tháng 6, hai vua về kinh. Dân đứng hai bên đường từ cổng đông vào trước
     Hoàng thành; đoàn cờ, quân, tướng cưỡi ngựa, hai cỗ kiệu đi qua (hình vẽ bằng code, không vẽ mặt vua). Bạn đứng trong hàng
     dân binh (hoặc cùng người nhà nếu đã về làng). Lập từ ba công ở Chương Dương trở lên thì một viên quan dừng lại hỏi tên.
     Giữ Space cho đoàn đi nhanh. Hết cảnh là bài thơ của Trần Quang Khải, đúng chữ bản dịch Toàn thư.
   - xet (khung sự kiện): tháng 8, triều đình phong thưởng công thần, trị tội kẻ hàng giặc (Toàn thư). Ở làng (hư cấu): ông Cả
     Lợi bị tố đã nộp thóc cho giặc; bạn làm chứng hay xin cho ông ấy (S.c2.caLoi). Người lập công được thưởng (hư cấu).
   Đoàn rước, người trong đoàn, lời nói là hư cấu; chỉ ngày vua về và bài thơ theo Toàn thư. */
import {T,TS,ctx} from '../constants.js';
import * as st from '../state.js';
import {S,save,setMG} from '../state.js';
import {gain,setKeys,showModal} from '../ui.js';
import {camX,camY,clock,drawSprite,shadow} from '../render.js';
import {keys} from '../input.js';
import {walkable} from '../dialogs.js';
import {along} from '../pathfind.js';
import {personSprite,simple} from '../sprites.js';
import {horseDir} from '../trai.js';
import {drawBubbles} from '../climax.js';
import {hudBox} from '../minigames/flood.js';
import {walker,goTo,drawWalker} from '../camp.js';
import {ch2Go,ch2Note} from './index.js';

const src=t=>`<p class="src">Toàn thư chép: ${t}</p>`;
const lc=n=>/^(Mẹ|Cha|Bà|Bé|Cụ|Trai|Cu)/.test(n)?n[0].toLowerCase()+n.slice(1):n;
export const VV={PACE:1.25,FAST:3.2,GAP:1.35};

/* ---------- tin giặc chạy ---------- */
export function startTin(){S.c2.scene='tin';save();
  showModal({kicker:'Hạ 1285 · tháng năm',title:'Giặc chạy',
    body:`<p>Khắp các bến sông người ta hò nhau đuổi giặc. Ông Đoàn gọi cả đội: ai còn sức thì theo thuyền xuôi về phía đông đuổi giặc, ai nhà còn người già con nhỏ thì về dựng lại mái nhà.</p><p class="note">Hư cấu.</p>`,
    choices:[
      {label:'Theo dân binh đuổi giặc',note:'+Võ',fn:()=>{S.c2.duoi='duoi';gain('vo',2);ch2Note('Giặc tan, bạn theo dân binh xuôi sông đuổi giặc, chỉ kịp thấy thuyền giặc chạy về phía đông.');news()}},
      {label:'Về làng dựng lại mái nhà',note:'+Đức',fn:()=>{S.c2.duoi='ve';gain('duc',2);ch2Note('Giặc tan, bạn về làng cùng người nhà dựng lại mái nhà trên nền cũ.');news()}}]})}
function news(){
  showModal({kicker:'Hạ 1285',title:'Tây Kết, Vạn Kiếp',
    body:`<p>${S.c2.duoi==='duoi'?'Trên thuyền đuổi giặc':'Ở làng'}, tin thắng trận về dồn dập. Ở Tây Kết, quân ta chém đầu Nguyên soái Toa Đô; Ô Mã Nhi chỉ còn một chiếc thuyền vượt biển trốn thoát. Ở Vạn Kiếp, Hưng Đạo Vương đánh tan quân Thoát Hoan; tỳ tướng giặc giấu Thoát Hoan vào một đồ đồng mà chạy về Bắc.</p>
      <p>Người ta kể: vua trông thấy thủ cấp Toa Đô, thương hại nói <b>"Người làm tôi phải nên như thế này"</b>, rồi cởi áo ngự sai đem liệm chôn.</p>
      ${src('tháng 5 năm 1285, ngày 20, ta đánh bại giặc ở Tây Kết, chém đầu Nguyên soái Toa Đô; Ô Mã Nhi trốn ra biển chỉ còn một chiếc thuyền. Hưng Đạo Vương đánh bại Thoát Hoan, Lý Hằng ở Vạn Kiếp; tỳ tướng Lý Quán giấu Thoát Hoan vào một đồ đồng chạy về Bắc. Vua thấy thủ cấp Toa Đô, nói câu trên, cởi áo ngự sai liệm chôn.')}`,
    choices:[{label:'Tiếp tục',fn:()=>ch2Go('vuave')}]})}

/* ---------- vua về kinh ---------- */
const ROUTE=[[82.5,12.5],[53.5,12.5],[53.5,10.7]];   // bến Đông Bộ Đầu → cổng đông → trước Hoàng thành
const kieuSprite=()=>simple('kieu',30,28,s=>{s(0,19,30,2,'#6e4a2a');s(6,9,18,11,'#a8302a');s(8,11,6,8,'#7a1e1a');s(16,11,6,8,'#7a1e1a');s(14,11,2,8,'#d8a020');
  s(3,5,24,5,'#d8a020');s(5,3,20,3,'#f0c850');s(12,0,6,3,'#f0c850');s(3,9,24,1,'#a87818');s(14,-1,2,2,'#f0d070')},15,24);
const flagSprite=c=>simple('coxa'+c,18,40,s=>{s(1,0,2,40,'#6e4a2a');s(3,2,14,11,c);s(3,2,14,2,'#f0d070');s(8,6,4,3,'#f0d070')},2,39);
export function startVuave(){S.c2.scene='vuave';S.season=1;save();
  const L=Math.abs(ROUTE[0][0]-ROUTE[1][0])+Math.abs(ROUTE[1][1]-ROUTE[2][1]);
  // đoàn rước, từ đầu tới cuối; s là khoảng cách tụt sau người đi đầu
  const plan=[['co','#c8302a'],['co','#d8a020'],['linh'],['linh'],['ngua'],['ngua'],['linh'],['kieu'],['kieu'],['linh'],['linh'],['ngua'],['linh'],['co','#c8302a']];
  let s=0;const row=plan.map(([k,c])=>{const o={kind:k,col:c,s,x:ROUTE[0][0],y:ROUTE[0][1],dir:'left',walk:0};s+=k==='kieu'||k==='ngua'?1.9:VV.GAP;return o});
  // dân đứng hai bên đường
  const crowd=[],LOOKS=['dan_nam1','dan_nam2','dan_nu1','dan_nu2','dan_nu3','ong_gia','tre1','tre2','trai2','trai3'];let i=0;
  for(let x=56.5;x<=80;x+=1.15)for(const [y,dir] of [[11.3,'down'],[13.8,'up']]){if(!walkable(Math.floor(x),Math.floor(y)))continue;i++;if((i*7)%5===0)continue;
    const id=LOOKS[(i*3+Math.floor(x))%LOOKS.length];crowd.push(walker('d'+i,'',{id,kid:id.startsWith('tre')},x+(i%3)*.1,y,{dir,ph:i*.7}))}
  // chỗ bạn đứng: hàng dân binh (bờ nam) hoặc cùng người nhà (bờ bắc)
  const ve=S.c2.duoi==='ve',my=ve?11.3:13.8,mx=75.5,me=[];for(const c of crowd)if(Math.abs(c.x-mx)<3.2&&Math.abs(c.y-my)<.5)c.hide=true;
  const add=(name,look,dx)=>{const o=walker('m'+me.length,name,look,mx+dx,my,{dir:ve?'down':'up',ph:me.length});me.push(o);return o};
  if(ve){add('Mẹ',{id:'me_gia'},-1.2);if(S.cha)add('Cha',{id:'cha_gia'},1.2);if(S.thao==='wife')add('Thảo',{id:'thao'},2.4);if(S.child)add('Bé Sen',{id:'sen',kid:true},-2.4)}
  else{add('Ông Đoàn',{id:'dan_nam2'},-1.2);(S.c2.men||[]).filter(m=>!m.fallen).slice(0,3).forEach((m,k)=>add(m.name[0].toUpperCase()+m.name.slice(1),m.look,[1.2,2.4,-2.4][k]));if(S.co==='village'&&!S.c2.coFell)add('Cò',{id:'co'},-2.4)}
  S.x=mx;S.y=my;st.P.dir=ve?'down':'up';
  setMG({type:'vuave',t:0,clock:0,s:-4,L,row,crowd,me,bub:[],stop:0,asked:false,quan:null,done:false,hideNPC:true,roam:true,speedMul:()=>0,
    update:vUpdate,draw:vDraw,post:()=>drawBubbles(st.MG.bub),hud:vHud,findTarget:()=>null,cam:()=>{const k=st.MG.row.find(o=>o.kind==='kieu'&&!o.hidden);return [k?Math.max(S.x-6,Math.min(S.x+6,k.x)):S.x,12.4]}});   // máy quay theo cỗ kiệu đầu, không rời chỗ bạn quá 6 ô
  document.body.classList.add('mg');setKeys('<span>Giữ <kbd>Space</kbd> cho đoàn đi nhanh</span>');save()}
function say(o,text,t=3.4){const M=st.MG;M.bub=M.bub.filter(b=>b.o!==o);M.bub.push({o,text,t})}
function vUpdate(dt){const M=st.MG;if(M.done)return;M.t+=dt;M.clock=M.t;for(const b of M.bub)b.t-=dt;M.bub=M.bub.filter(b=>b.t>0);
  const sp=(keys[' ']?VV.FAST:VV.PACE)*dt;if(M.stop<=0)M.s+=sp;
  for(const o of M.row){const a=along(ROUTE,Math.max(0,Math.min(M.L,M.s-o.s)));o.moving=M.stop<=0&&M.s-o.s>0&&M.s-o.s<M.L;if(o.moving)o.walk+=dt*6;o.x=a.x;o.y=a.y;o.dir=a.dir;o.hidden=M.s-o.s<0||M.s-o.s>=M.L-.05}
  const kieu=M.row.filter(o=>o.kind==='kieu'),near=kieu.some(k=>!k.hidden&&Math.abs(k.x-S.x)<2.5);
  if(near&&!M.cheer){M.cheer=true;for(const c of [...M.crowd,...M.me])if(Math.abs(c.x-S.x)<8&&!c.hide&&Math.random()<.35)say(c,['Vạn tuế!','Giặc tan rồi!','Về rồi, về rồi!'][Math.floor(Math.random()*3)],2.6)}
  // lập công lớn ở Chương Dương: viên quan dừng lại hỏi tên
  const cong=(S.c2.cd&&S.c2.cd.cong)||0,lastK=kieu[kieu.length-1];
  if(cong>=3&&!M.asked&&lastK.x<S.x-1.5){M.asked=true;M.stop=99;M.quan=walker('quan','Viên quan',{id:'hocquan'},S.x+1.5,12.5,{})}
  if(M.quan&&!M.quan.back){const q=M.quan;if(goTo(q,S.x+.9,S.y+(S.y<12?.9:-.9),2.2,dt)&&!M.qsaid){M.qsaid=true;say(q,'Người dẫn thuyền đầu ở Chương Dương, cắm cờ trên gò, có phải anh không?',4);M.askT=1.4}}
  if(M.askT>0){M.askT-=dt;if(M.askT<=0)ask()}
  if(M.quan&&M.quan.back){if(goTo(M.quan,M.quan.bx,12.5,2.4,dt)){M.quan=null;M.stop=0}}
  M.stop=Math.max(0,M.stop===99?99:M.stop-dt);
  if(M.s-M.row[M.row.length-1].s>=M.L)finish(M)}
function ask(){const M=st.MG;if(!M||M.type!=='vuave')return;
  showModal({kicker:'Tháng 6 · trước cổng Hoàng thành',title:'Viên quan hỏi tên',body:'<p>Viên quan cầm sổ, nhìn bạn từ đầu tới chân: "Dân binh lập công, triều đình phải biết tên. Anh tên gì, người làng nào?"</p><p class="note">Hư cấu.</p>',
    choices:[{label:`Thưa, tôi là ${S.name}, người làng An Phú`,note:'+Tiếng',fn:()=>{S.c2.ten='ghi';gain('tieng',3);ch2Note('Ngày vua về kinh, viên quan dừng lại ghi tên bạn vào sổ công dân binh.');back()}},
      {label:'Thưa, công ấy là của cả đội dân binh ông Đoàn',note:'+Đức',fn:()=>{S.c2.ten='doi';gain('duc',3);ch2Note('Ngày vua về kinh, viên quan hỏi tên, bạn thưa công ấy là của cả đội dân binh.');back()}}]})}
function back(){const M=st.MG;if(!M||!M.quan)return;M.quan.back=true;M.quan.bx=Math.max(56,S.x-6);say(M.quan,S.c2.ten==='ghi'?'Được, ta ghi rồi.':'Khá lắm. Ta ghi cả đội.',2.6)}
function finish(M){M.done=true;setMG(null);setKeys();document.body.classList.remove('mg');S.x=43.5;S.y=50.4;
  if(!S.c2.ten)ch2Note('Ngày vua về kinh, bạn đứng trong hàng '+(S.c2.duoi==='ve'?'dân làng cùng người nhà':'dân binh')+' hai bên đường.');save();
  showModal({kicker:'Tháng 6 · Ất Dậu 1285',title:'Hai vua về kinh',big:true,
    body:`<p>Đoàn xa giá đi khuất vào cổng Hoàng thành. Ngày hôm ấy nước sông lên to. Người ta truyền nhau bài thơ của Thượng tướng Trần Quang Khải:</p>
      <p class="poem"><b>Đoạt sáo Chương Dương độ,<br>Cầm hồ Hàm Tử quan.<br>Thái bình tu trí lực,<br>Vạn cổ thử giang san.</b></p>
      <p class="poem">Bến Chương Dương cướp giáo.<br>Cửa Hàm tử bắt thù.<br>Thái bình nên gắng sức,<br>Non nước cũ muôn thu.</p>
      ${src('tháng 6 năm 1285, ngày mồng 6, hai vua trở về kinh sư; Thượng tướng Quang Khải làm bài thơ trên. Hôm ấy nước to.')}`,
    choices:[{label:'Tiếp tục',fn:()=>ch2Go('xet')}]})}
function vDraw(list){const M=st.MG;
  for(const c of M.crowd)if(!c.hide){const j=M.cheer&&Math.sin(clock*9+c.ph)>.6;list.push({y:c.y,f:()=>{shadow(c.x,c.y,10);drawSprite(personSprite(c.look,c.dir,j?1:0),c.x,c.y-(j?.08:0))}})}
  for(const c of M.me)drawWalker(list,c,!M.bub.length);
  if(M.quan)drawWalker(list,M.quan,true);
  for(const o of M.row){if(o.hidden)continue;const fr=o.moving?[1,0,2,0][Math.floor(o.walk)%4]:0;
    if(o.kind==='linh'){for(const dy of [-.45,.45]){const y=o.y+dy;list.push({y,f:()=>{shadow(o.x,y,10);drawSprite(personSprite({id:'quan'},o.dir,fr),o.x,y)}})}}
    else if(o.kind==='co')list.push({y:o.y,f:()=>{shadow(o.x,o.y,10);drawSprite(personSprite({id:'linh'},o.dir,fr),o.x,o.y);drawSprite(flagSprite(o.col),o.x+.25,o.y-.3)}});
    else if(o.kind==='ngua'){const hd=o.dir==='right'?'right':'left',bob=o.moving&&Math.floor(o.walk)%2?1/TS:0;list.push({y:o.y,f:()=>{shadow(o.x,o.y,22);drawSprite(personSprite({id:'voquan'},o.dir==='up'?'up':hd,0),o.x,o.y-.85-bob);drawSprite(horseDir(1,o.moving?Math.floor(o.walk)%3:0,hd),o.x,o.y-bob)}})}
    else if(o.kind==='kieu'){const b=o.moving&&Math.floor(o.walk)%2?1/TS:0;
      for(const [dx,dy] of [[-1,-.5],[-1,.5],[1,-.5],[1,.5]]){const x=o.x+(o.dir==='up'?0:dx),y=o.y+(o.dir==='up'?dx:dy);list.push({y,f:()=>{shadow(x,y,10);drawSprite(personSprite({id:'linh'},o.dir,fr),x,y)}})}
      list.push({y:o.y+.05,f:()=>{shadow(o.x,o.y+.1,26);drawSprite(kieuSprite(),o.x,o.y-.3-b)}})}}}
function vHud(){const M=st.MG,w=Math.min(420,innerWidth-32),x=Math.round(innerWidth/2-w/2);hudBox(x,16,w,46);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#e2bf72';ctx.fillText('Tháng 6 · hai vua về kinh',x+12,30);
  ctx.fillStyle='#efe8d4';ctx.fillText(M.stop>0?'Đoàn rước dừng lại…':'Đoàn xa giá từ bến Đông Bộ Đầu vào kinh. Giữ Space cho đi nhanh',x+12,48)}

/* ---------- tháng 8: phong thưởng, trị tội kẻ hàng giặc ---------- */
export function startXet(){S.c2.scene='xet';S.season=2;save();
  const cong=(S.c2.cd&&S.c2.cd.cong)||0,xa=S.career&&S.career.xa,caXa=xa==='lose'||xa==='no';
  const thuong=cong>=2?(S.tien+=8,'<p>Dân binh có công được thưởng. Bạn nhận tám quan tiền và một tấm vải.</p>'):'';
  showModal({kicker:'Thu 1285 · tháng tám',title:'Phong thưởng và trị tội',
    body:`<p>Triều đình sai quan đi tuyên phong công thần theo thứ bậc, và trị tội những kẻ đã hàng giặc.</p>${thuong}
      <p>Ở làng An Phú, người ta xì xào: lúc giặc chiếm vùng, ông Cả Lợi${caXa?' đang coi việc làng,':''} đã mở kho nộp thóc cho giặc, lại dẫn đường cho chúng đi lục các làng bên. Quan huyện về xét, hỏi trong làng ai thấy tận mắt.</p>
      ${src('mùa thu, tháng 8 năm 1285, triều đình sai Lưu Cương Giới tuyên phong công thần theo thứ bậc khác nhau và trị tội những kẻ hàng giặc.')}
      <p class="note">Ông Cả Lợi nộp thóc, dẫn đường cho giặc, việc thưởng dân binh: hư cấu.</p>`,
    choices:[
      {label:'Đứng ra làm chứng',note:'+Tiếng',fn:()=>{S.c2.caLoi='to';gain('tieng',3);ch2Note('Tháng 8 năm 1285, bạn đứng ra làm chứng việc ông Cả Lợi nộp thóc, dẫn đường cho giặc. Ông bị xét tội.');done()}},
      {label:'Xin cho ông ấy: lúc ấy cả làng ai chẳng sợ',note:'+Đức',fn:()=>{S.c2.caLoi='tha';gain('duc',3);ch2Note('Tháng 8 năm 1285, bạn xin cho ông Cả Lợi: lúc giặc chiếm vùng, cả làng ai chẳng sợ. Ông được tha, nợ bạn một lần.');done()}}]})}
function done(){if((S.c2.cd&&S.c2.cd.cong||0)>=2)ch2Note('Bạn được thưởng tám quan tiền vì công ở Chương Dương.');save();ch2Go('cho')}
