/* ================= bị bắt: giải sang trại giặc (đêm 12 rạng 13 tháng giêng 1285) ================= */
/* Sau đêm tháng giêng, nếu bạn bị bắt (src/climax.js, S.capt), màn chơi không dừng ở một hộp thoại mà đi tiếp:
   1. Bị giải đi (MG.type 'escort'): tay bị trói, đi giữa toán giặc cầm đuốc, qua xóm đang cháy, ra bến Đông Bộ Đầu.
      Bạn tự bước (chậm); tụt lại xa thì lính giật thừng lôi đi. Người làng bị bắt cùng đi thành một dây phía sau.
   2. Qua sông: thuyền giặc chở sang bờ đông sông Hồng (màn tối dần rồi sáng lại).
   3. Trong trại (MG.type 'camp'): bị đẩy vào bãi quây tù. Lính khám tay tìm chữ "Sát Thát"; gần sáng Đỗ Khắc Chung
      vào trại Ô Mã Nhi, đối đáp (theo Toàn thư, viết lại bằng lời thường); lúc ông đi ngang bãi tù thì bạn chọn gọi tên
      mình hay im lặng ghi nhớ trại giặc. Giờ Mão ngày 13 trời hửng thì hết chương một (endChapter).
   Doanh trại (rào, lều, cờ, lửa, bãi tù) chỉ dựng lên trong hai màn này; bờ đông ngày thường là bãi trống.
   Hư cấu: nhân vật bị giải đi, có mặt trong trại, toán lính, người làng bên bị bắt. Theo Toàn thư: giặc đến Đông Bộ Đầu
   dựng cờ lớn; giặc giận dữ khi thấy chữ "Sát Thát"; Đỗ Khắc Chung vào trại Ô Mã Nhi, giờ Mão ngày 13 về.
   Chỗ để thêm cảnh riêng theo cách bị bắt (đánh thua, lừa hỏng, đổi mình, ngã xuống): BRANCH (đầu file). */
import {$,T,TS,Z,ctx} from './constants.js';
import {BUILDINGS,CAMP,hongX} from './map.js';
import {buildingSprite,personSprite,simple} from './sprites.js';
import {MG,P,S,save,setMG} from './state.js';
import {floatAt,gain,setKeys,showModal,toast} from './ui.js';
import {walkable} from './dialogs.js';
import {nextStep,stepTo} from './pathfind.js';
import {Hs} from './pixel.js';
import {VH,VW,camX,camY,clock,drawSprite,reduce,shadow} from './render.js';
import {charred,dirOf,endChapter,smoke,tongue,torchFx} from './climax.js';
import {hudBox,sackSprite} from './minigames/flood.js';

const src=t=>`<p class="src">Toàn thư chép: ${t}</p>`;
/* ---------- bố cục doanh trại (tọa độ ô) ---------- */
const BEN=[82.5,12.5];                                   // bến Đông Bộ Đầu, bờ tây
const LANDING=[Math.ceil(hongX(12)+3.8)+.5,12.5];        // bãi đổ bờ đông
const GATE_Y=[11,12,13];                                 // cổng trại ở rào phía tây (x = CAMP.x0)
const PEN={x0:101,y0:15,x1:105,y1:17};                   // bãi quây tù (trong rào), cổng ở (103,14)
const PEN_DOOR=[103.5,13.4],PEN_IN=[103.5,16.2];
const CMD={x:109,y:8,w:5,h:3};                           // trướng Ô Mã Nhi (gần bãi tù để người trong bãi nhìn thấy)
const OMN_AT=[112.4,12.4],KC_AT=[110.2,12.5];
const TENTS=[{x:102,y:6},{x:105,y:7},{x:115,y:6},{x:102,y:19},{x:108,y:19},{x:112,y:18},{x:118,y:16},{x:118,y:9}];
const FIRES=[[107.5,10.9],[111.5,15.6],[117.5,13.4],[106.5,22.2]];
const LOOT=[[115.2,16.5],[115.8,17.3],[114.6,17.4],[116.4,16.4]];
const FLAGS=[[108.6,8.2],[114.4,8.2],[80.4,13.6]];          // hai cờ trước trướng, một cờ lớn ở bến Đông Bộ Đầu
const BEN_FIRES=[[80.5,11.2],[81,14.6]];
/* Cảnh riêng theo cách bị bắt (S.capt.how): 'fight' đánh thua tên đầu toán, 'trick' lừa hỏng, 'surrender' đổi mình,
   'down' ngã xuống không ai đỡ. lead: câu tên cầm đầu toán áp giải nói lúc lên đường. Chủ dự án sẽ viết thêm cảnh
   riêng cho từng nhánh: thêm trường vào đây (ví dụ cảnh trong trại) rồi gọi ở campTick. */
const BRANCH={
  fight:{lead:'Thằng này đánh cũng ra gì. Trói chặt vào, giải về trại!'},
  trick:{lead:'Dám lừa ta à? Để xem về trại cái mồm mày còn dẻo được bao lâu.'},
  surrender:{lead:'Ta giữ lời: con kia được thả. Còn mày thì đi!'},
  down:{lead:'Còn thở. Trói lại, giải về trại!'},
};

const inRect=(x,y,r)=>x>=r.x0&&x<=r.x1&&y>=r.y0&&y<=r.y1;
const tentAt=(x,y)=>TENTS.some(t=>x>=t.x&&x<t.x+3&&y>=t.y&&y<t.y+2)||(x>=CMD.x&&x<CMD.x+CMD.w&&y>=CMD.y&&y<CMD.y+CMD.h);
const isStake=(x,y)=>((x===CAMP.x0||x===CAMP.x1)&&y>=CAMP.y0&&y<=CAMP.y1&&!(x===CAMP.x0&&GATE_Y.includes(y)))||((y===CAMP.y0||y===CAMP.y1)&&x>=CAMP.x0&&x<=CAMP.x1);
const isPenFence=(x,y)=>((x===PEN.x0-1||x===PEN.x1+1)&&y>=PEN.y0-1&&y<=PEN.y1+1)||((y===PEN.y0-1||y===PEN.y1+1)&&x>=PEN.x0-1&&x<=PEN.x1+1);
/* Ô bị chặn khi doanh trại dựng lên: rào, lều, trướng, rào bãi tù (trừ cổng bãi tù lúc đang áp giải vào). */
function campBlock(x,y){if(isStake(x,y)||tentAt(x,y))return true;if(isPenFence(x,y))return!(MG&&MG.type==='escort'&&x===103&&y===PEN.y0-1);return false}
const hideProp=p=>p.x>=CAMP.x0&&p.x<=CAMP.x1&&p.y>=CAMP.y0&&p.y<=CAMP.y1;   // bụi cỏ, đá trong khu trại: đã bị giẫm phẳng
const okWalk=(x,y)=>walkable(x,y)&&!campBlock(x,y);
const okGuard=(x,y)=>walkable(x,y)&&!isStake(x,y)&&!tentAt(x,y)&&!(isPenFence(x,y)&&!(x===103&&y===PEN.y0-1));   // lính đi qua cổng bãi tù
/* Người chơi: lúc áp giải đi được ô thường trừ rào, lều; trong trại chỉ trong bãi tù. */
function blockAt(x,y){if(MG.type==='camp')return!inRect(x,y,PEN);return campBlock(x,y)}

/* ---------- vẽ doanh trại ---------- */
const stakeSprite=()=>simple('stake',16,26,s=>{for(const x of[1,6,11]){s(x,4,4,22,'#6e4a2a');s(x+1,2,2,2,'#8a6238');s(x+3,4,1,22,'#4a311b')}s(0,12,16,2,'#4a311b');s(0,20,16,2,'#4a311b')},8,24);
const tentSprite=()=>simple('tent',50,36,s=>{s(4,14,42,20,'#cfc3a6');s(4,14,42,2,'#e6dcc2');s(9,8,32,7,'#d9ceb2');s(15,4,20,5,'#e6dcc2');s(22,1,6,4,'#b8a888');
  for(const x of[8,16,24,32,40])s(x,15,1,19,'#a8987a');s(4,22,42,1,'#8a6a3a');s(21,22,8,12,'#3a2e22');s(24,22,2,12,'#5a4636');s(4,32,42,2,'#8a7a5c')},25,34);
const cmdSprite=()=>simple('cmdtent',86,56,s=>{s(4,22,78,32,'#5a3a2a');s(4,22,78,3,'#7a5238');s(12,12,62,11,'#6a442e');s(22,5,42,8,'#7a5238');s(36,1,14,5,'#d9b25a');
  for(let x=8;x<80;x+=10)s(x,24,2,30,'#d9b25a');s(4,36,78,2,'#d9b25a');s(36,34,14,20,'#1e140e');s(40,34,6,20,'#3a2618');s(4,52,78,2,'#3a2618')},43,54);
const fenceSprite=()=>simple('fence',16,14,s=>{s(1,2,3,12,'#7a5a36');s(12,2,3,12,'#7a5a36');s(0,4,16,2,'#8a6a42');s(0,9,16,2,'#8a6a42')},8,13);
const logSprite=()=>simple('logs',18,8,s=>{s(1,3,16,3,'#5a3a22');s(3,1,12,3,'#6e4a2a');s(2,5,14,2,'#3a2618')},9,7);
function flagFx(x,y,big){const px=Math.round(x*TS),py=Math.round(y*TS),hgt=big?56:44,w=big?26:20;ctx.fillStyle='#4a311b';ctx.fillRect(px*Z-camX,(py-hgt)*Z-camY,2*Z,hgt*Z);
  for(let i=0;i<w;i++){const wv=Math.round(Math.sin(clock*4-i*.35)*2*(i/w)),h=big?14:11;ctx.fillStyle=i%6<3?'#1c2a4a':'#22325a';ctx.fillRect((px+2+i)*Z-camX,(py-hgt+1+wv)*Z-camY,Z,h*Z);
    if(i%7===3){ctx.fillStyle='#d9b25a';ctx.fillRect((px+2+i)*Z-camX,(py-hgt+5+wv)*Z-camY,Z,3*Z)}}}
function campfire(x,y,seed){drawSprite(logSprite(),x,y+.15);const px=Math.round(x*TS),py=Math.round(y*TS);tongue(px-3,py,11,7,seed);tongue(px+3,py,9,6,seed+2);tongue(px,py-1,14,8,seed+4)}
function trampled(){ctx.globalAlpha=.55;for(let y=CAMP.y0+1;y<CAMP.y1;y++)for(let x=CAMP.x0+1;x<CAMP.x1;x++){const h=Hs(x,y,61);
    ctx.fillStyle=h<.55?'#6a5638':h<.8?'#5a4a30':'#7a6a48';ctx.fillRect(x*T-camX,y*T-camY,T,T);if(h>.9){ctx.fillStyle='#4a3a26';ctx.fillRect(x*T-camX+Z*4,y*T-camY+Z*6,Z*6,Z*2)}}
  for(let x=Math.ceil(hongX(12)+3.8);x<CAMP.x0;x++){ctx.fillStyle='#6a5638';ctx.fillRect(x*T-camX,11*T-camY+Z*8,T,T*2)}ctx.globalAlpha=1}
function drawCamp(list){
  list.push({y:-1e3,f:trampled});
  for(let y=CAMP.y0;y<=CAMP.y1;y++)for(let x=CAMP.x0;x<=CAMP.x1;x++)if(isStake(x,y))list.push({y:y+1,f:()=>drawSprite(stakeSprite(),x+.5,y+1)});
  for(let y=PEN.y0-1;y<=PEN.y1+1;y++)for(let x=PEN.x0-1;x<=PEN.x1+1;x++)if(isPenFence(x,y)&&!(MG.type==='escort'&&x===103&&y===PEN.y0-1))list.push({y:y+.9,f:()=>drawSprite(fenceSprite(),x+.5,y+.95)});
  for(const t of TENTS)list.push({y:t.y+2,f:()=>drawSprite(tentSprite(),t.x+1.5,t.y+2.05)});
  list.push({y:CMD.y+CMD.h,f:()=>drawSprite(cmdSprite(),CMD.x+CMD.w/2,CMD.y+CMD.h+.05),lab:Math.hypot(OMN_AT[0]-S.x,OMN_AT[1]-S.y)<12?['Trướng Ô Mã Nhi',CMD.x+CMD.w/2,CMD.y-.9]:null});
  for(const f of FLAGS)list.push({y:f[1],f:()=>flagFx(f[0],f[1],f[0]<100)});
  FIRES.forEach((f,i)=>list.push({y:f[1],f:()=>campfire(f[0],f[1],i*3)}));
  for(const f of BEN_FIRES)list.push({y:f[1],f:()=>torchFx(f[0],f[1],true)});
  for(const l of LOOT)list.push({y:l[1],f:()=>drawSprite(sackSprite(),l[0],l[1])});
}

/* ---------- người trong cảnh ---------- */
function walker(id,name,look,x,y,extra){return Object.assign({id,name,look,x,y,dir:'down',walk:0,moving:false,path:null},extra||{})}
/* Đi tới (tx,ty) theo đường ô (4 hướng), tốc độ sp ô/giây. Trả về true khi đã tới. */
function goTo(o,tx,ty,sp,dt,ok=okWalk){const d=Math.hypot(tx-o.x,ty-o.y);if(d<.12){o.moving=false;return true}
  const st=nextStep(o,tx,ty,ok,MG.clock);if(!st){o.moving=false;return false}
  const [mx,my]=stepTo(o,st,Math.min(d,sp*dt),ok);o.x+=mx;o.y+=my;o.moving=!!(mx||my);if(o.moving){o.walk+=dt*8;o.dir=dirOf(mx,my)}return false}
const frame=o=>o.moving?[1,0,2,0][Math.floor(o.walk)%4]:0;
function say(o,text,dur=3.6){MG.bub=MG.bub.filter(b=>b.o!==o);MG.bub.push({o,text,t:dur})}
const sayMe=(text,dur)=>say(MG.me,text,dur);
function note(text,dur=9){MG.note={text,t:dur}}

/* ---------- 1–2. bị giải đi, qua sông ---------- */
export function startEscort(res){
  const how=(S.capt&&S.capt.how)||'down',bossLead=res.boss==='took'||res.boss==='alive'||how==='fight'||how==='trick'||how==='surrender';
  const me={me:true,get x(){return S.x},get y(){return S.y}};
  const lead=walker('lead',bossLead?'Tên đầu toán':'Lính giặc',{id:bossLead?'giac_dau':'giac_ky'},S.x+1.2,S.y,{torch:true});
  const g1=walker('g1','Lính giặc',{id:'giac'},S.x-1.2,S.y+.2,{torch:true}),g2=walker('g2','Lính giặc',{id:'giac'},S.x,S.y+1.4,{});
  const caps=(res.lostWho||[]).map((p,i)=>walker('cap'+i,p.name,p.look,S.x-.6-i*.4,S.y+.8+i*.5,{}));
  setMG({type:'escort',phase:'walk',clock:0,lead,guards:[g1,g2],caps,me,bub:[],note:null,fade:0,yanked:false,res,hideNPC:true,burnt:(res.burnt||[]).map(id=>BUILDINGS.find(b=>b.id===id)).filter(Boolean),
    hideProp,update:escortUpdate,draw:escortDraw,post:nightPost,hud:sceneHud,findTarget:()=>null,blockAt,speedMul:()=>.6,mini:sceneMini,said:{}});
  MG.goal=BEN;document.body.classList.add('mg');P.dir='right';
  setKeys('<span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> bước theo</span><span>Tay bị trói: không chạy được, tụt lại xa thì bị lôi đi</span>');
  $('toast').hidden=true;
  say(lead,BRANCH[how].lead,4.2);
  if(caps.length){const c=caps.find(p=>p.look&&p.look.id==='me_gia')||caps[0];setTimeout(()=>{if(MG&&MG.type==='escort')say(c,c.look&&c.look.id==='me_gia'?'Con ơi... mẹ đây!':c.look&&c.look.id==='sen'?'Cha ơi!':'Đừng sợ, có nhau cả đây.',3.6)},2200)}
  toast('Tay bị trói giật cánh khuỷu, bạn bị lôi đi giữa toán giặc cầm đuốc, về phía bến Đông Bộ Đầu.',5200);
  save();
}
function chain(list,first,dt,sp){let prev=first;for(const o of list){const d=Math.hypot(prev.x-o.x,prev.y-o.y);if(d>1){const st=nextStep(o,prev.x,prev.y,okWalk,MG.clock);if(st){const [mx,my]=stepTo(o,st,Math.min(d-.9,sp*dt),okWalk);o.x+=mx;o.y+=my;o.moving=!!(mx||my);if(o.moving){o.walk+=dt*8;o.dir=dirOf(mx,my)}}else o.moving=false}else o.moving=false;
  if(d>6){o.x=prev.x;o.y=prev.y+.4;o.path=null}prev=o}}
function escortUpdate(dt){const M=MG;M.clock+=dt;
  for(const b of M.bub)b.t-=dt;M.bub=M.bub.filter(b=>b.t>0);if(M.note&&(M.note.t-=dt)<=0)M.note=null;
  if(M.phase==='cross'){M.fade+=dt;if(M.fade>=1.4&&!M.crossed){M.crossed=true;
      const [lx,ly]=LANDING;S.x=lx;S.y=ly+.2;M.lead.x=lx+1.3;M.lead.y=ly;M.guards[0].x=lx-1;M.guards[0].y=ly-.6;M.guards[1].x=lx-.8;M.guards[1].y=ly+1;M.caps.forEach((c,i)=>{c.x=lx-1.6-i*.5;c.y=ly+.5+(i%2)*.4;c.path=null});
      for(const o of [M.lead,...M.guards])o.path=null;M.goal=PEN_DOOR}
    if(M.fade>=2.8){M.phase='walk2';M.fade=0;toast('Thuyền cập bãi bờ đông. Trước mặt là doanh trại quân Nguyên, rào gỗ nhọn, lửa trại khắp bãi.',5200)}
    return}
  const L=M.lead,dp=Math.hypot(S.x-L.x,S.y-L.y),[gx,gy]=M.goal;
  // tên cầm đầu: đi tới đích, chờ khi bạn tụt lại
  if(dp<2.4){goTo(L,gx,gy,2.4,dt);M.waitT=0}else{L.moving=false;M.waitT=(M.waitT||0)+dt}
  // đứng yên thì bị sợi thừng kéo theo; tụt lại xa thì lính giật mạnh (theo đường ô, không xuyên tường, sông)
  M.idleT=P.moving?0:(M.idleT||0)+dt;
  if(dp>3||(M.idleT>.8&&dp>1.2)){const st=nextStep(M.me,L.x,L.y,okWalk,M.clock);if(st){const [mx,my]=stepTo(M.me,st,(dp>3?5:2.6)*dt,okWalk);S.x+=mx;S.y+=my;if(mx||my){P.dir=dirOf(mx,my);P.walk+=dt*8}}
    if(dp>3&&!M.yanked){M.yanked=true;toast('Tên lính giật mạnh sợi thừng, lôi bạn đi xềnh xệch.',3200);say(M.guards[0],'Đi mau!',2)}}
  // lính đi kèm hai bên, người làng bị bắt thành một dây sau lưng bạn
  const [g1,g2]=M.guards;goTo(g1,S.x+(L.x<S.x?1:-1)*1.1,S.y-.5,3.2,dt);goTo(g2,S.x,S.y+1.3,3.2,dt);
  chain(M.caps,M.me,dt,3);
  // chuyện dọc đường
  const once=(k,f)=>{if(!M.said[k]){M.said[k]=1;f()}};
  const home=BUILDINGS.find(b=>b.id==='home');if(M.phase==='walk'&&home&&Math.hypot(S.x-(home.x+2.5),S.y-(home.y+3))<4)once('home',()=>sayMe(M.burnt.includes(home)?'Nhà mình... cháy cả rồi.':'Nhà mình...',3.4));
  if(M.phase==='walk'&&S.y<31&&S.x>45)once('tolich',()=>{sayMe('Qua sông Tô Lịch rồi. Làng ở sau lưng...',3.4)});
  if(M.phase==='walk'&&Math.hypot(S.x-BEN[0],S.y-BEN[1])<9)once('ben',()=>{toast('Bến Đông Bộ Đầu đỏ rực đuốc giặc. Một lá cờ lớn cắm trên bãi.',4600);note('giặc kéo đến Đông Bộ Đầu, dựng một lá cờ lớn (tháng giêng năm 1285).')});
  if(M.phase==='walk'&&Math.hypot(L.x-BEN[0],L.y-BEN[1])<.6&&dp<2.6){M.phase='cross';M.fade=0;M.crossed=false;sayMe('',.01)}
  if(M.phase==='walk2'&&inRect(Math.floor(S.x),Math.floor(S.y),{x0:CAMP.x0,y0:CAMP.y0,x1:CAMP.x1,y1:CAMP.y1}))once('gate',()=>{say(L,'Ném nó vào bãi tù!',2.6);note('',.01)});
  if(M.phase==='walk2'&&Math.hypot(L.x-gx,L.y-gy)<.5&&dp<2.6)startCamp();
}
function drawWalker(list,o,lab){list.push({y:o.y,f:()=>{shadow(o.x,o.y,10);drawSprite(personSprite(o.look,o.dir,frame(o)),o.x,o.y);if(o.torch){const px=Math.round((o.x+.35)*TS),py=Math.round((o.y-.4)*TS);tongue(px,py-10,8,5,o.x)}},lab:lab&&Math.hypot(o.x-S.x,o.y-S.y)<5?[o.name,o.x,o.y-2]:null})}
function rope(a,b){ctx.strokeStyle='#8a6a3a';ctx.lineWidth=Z;ctx.beginPath();ctx.moveTo(a.x*T-camX,(a.y-.55)*T-camY);ctx.lineTo(b.x*T-camX,(b.y-.55)*T-camY);ctx.stroke()}
function escortDraw(list){const M=MG;
  // xóm bị đốt: còn cháy âm ỉ
  for(const b of M.burnt){const c=buildingSprite(b),top=b.y*TS-c.oy,roof=top+Math.round(c.height*.42);list.push({y:b.y+b.h+.02,f:()=>{
    ctx.globalAlpha=.65;ctx.drawImage(charred(b,c),(b.x*TS-c.ox)*Z-camX,top*Z-camY,c.width*Z,c.height*Z);ctx.globalAlpha=1;
    for(let x=0;x<b.w;x+=2){const px=b.x*TS+x*TS+8;smoke(px,roof-10,x+b.x*3,8);tongue(px,roof+6,9,9,x+b.y)}}})}
  drawCamp(list);
  list.push({y:-1,f:()=>{rope(M.me,M.lead);let prev=M.me;for(const c of M.caps){rope(prev,c);prev=c}}});
  drawWalker(list,M.lead,true);for(const g of M.guards)drawWalker(list,g,false);for(const c of M.caps)drawWalker(list,c,true);
}

/* ---------- 3. trong trại ---------- */
function startCamp(){const M=MG,res=M.res;
  const caps=M.caps;caps.push(walker('la1','Người làng bên',{id:'trai'},104.6,15.4,{tat:true}),walker('la2','Người làng bên',{id:'dan1'},101.6,17.2,{}));
  const spots=[[101.6,15.6],[105.2,16.8],[102.4,17.4],[104.4,17.6],[101.4,16.6],[105.4,15.6]];caps.forEach((c,i)=>{if(c.id.startsWith('cap')){const p=spots[i%spots.length];c.x=p[0];c.y=p[1]}c.path=null;c.moving=false;c.dir='down'});
  S.x=PEN_IN[0];S.y=PEN_IN[1];P.dir='down';
  const guards=[walker('gd1','Lính canh',{id:'giac'},PEN_DOOR[0]-.8,PEN_DOOR[1]-.2,{torch:true}),walker('gd2','Lính canh',{id:'giac'},CAMP.x0+.9,12.6,{torch:true})];
  setMG({type:'camp',clock:0,c:0,res,me:M.me,caps,guards,bub:[],note:null,fade:0,dawn:0,hideNPC:true,said:{},ev:{},
    omn:walker('omn','Ô Mã Nhi',{id:'o_ma_nhi'},OMN_AT[0],OMN_AT[1],{dir:'left'}),off:walker('off','Tướng Nguyên',{id:'giac_ky'},OMN_AT[0]+1.1,OMN_AT[1]-.6,{dir:'left'}),
    kc:null,kcEsc:null,insp:null,talk:0,
    cam:()=>[Math.min(S.x+4,107),S.y-3.6],hideProp,update:campUpdate,draw:campDraw,post:nightPost,hud:sceneHud,findTarget:campTarget,blockAt,speedMul:()=>.6,mini:sceneMini});
  setKeys('<span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> đi lại trong bãi tù</span><span><kbd>E</kbd> nói chuyện</span>');
  toast('Bạn bị đẩy vào bãi quây tù giữa trại giặc. Quanh bạn là người mấy làng ven sông bị bắt trong đêm.',5200);save();
}
/* Lời đối đáp trước trướng: theo Toàn thư (tháng giêng năm Ất Dậu 1285), viết lại bằng lời thường. */
const TALK=[
  ['omn','Quân nước ngươi dám thích chữ "Sát Thát" lên tay, coi khinh quân trời. Tội ấy to lắm!'],
  ['kc','Chó nhà thấy người lạ thì cắn, đâu phải tại chủ. Ấy là lòng căm giận của quân sĩ, vua tôi không hay biết.'],
  ['kc','Tôi là cận thần, lẽ nào lại không có?'],
  ['omn','Đại quân chỉ mượn đường đánh Chiêm Thành. Vua ngươi ra hội kiến thì yên ổn; cứ chống lệnh thì núi sông thành đất bằng!'],
  ['kc','Đóng quân ở biên giới, gửi thư báo trước, không thông hiếu mới là có lỗi. Nay dồn ép nhau, thú cùng còn chống lại nữa là người.'],
];
function campUpdate(dt){const M=MG;M.clock+=dt;M.c+=dt;const c=M.c;
  for(const b of M.bub)b.t-=dt;M.bub=M.bub.filter(b=>b.t>0);if(M.note&&(M.note.t-=dt)<=0)M.note=null;
  const ev=(k,cond,f)=>{if(!M.ev[k]&&cond){M.ev[k]=1;f()}};
  // lính khám tay tìm chữ "Sát Thát"
  ev('insp',c>3,()=>{M.insp=walker('insp','Lính giặc',{id:'giac'},PEN_DOOR[0],PEN_DOOR[1]-.6,{torch:true});say(M.insp,'Giơ tay ra! Đứa nào cũng phải giơ tay ra!',3.4)});
  if(M.insp&&!M.ev.inspDone){const tg=S.path==='vo'?{x:S.x+.8,y:S.y}:M.caps.find(o=>o.tat)||{x:S.x+.8,y:S.y};const arrived=goTo(M.insp,tg.x,tg.y-.2,2.6,dt,okGuard);
    if(arrived)ev('inspDone',true,()=>{M.inspAt=c;const who=S.path==='vo'?null:M.caps.find(o=>o.tat);say(M.insp,'Sát Thát! Lại Sát Thát!',3);M.shake=.6;
      if(!who){toast('Tên lính giật tay áo bạn lên, thấy hai chữ "Sát Thát" thích bằng mực. Hắn gầm lên, đạp bạn ngã sấp xuống bùn.',5200);sayMe('...',1)}
      else{toast('Tên lính giật tay áo một người làng bên, thấy chữ "Sát Thát". Hắn gầm lên, quật người ấy ngã sấp.',5000);say(who,'Giết thì giết, chữ thì vẫn còn đây!',3.6)}
      note('giặc bắt được quân ta, thấy người nào cũng thích chữ "Sát Thát" vào cánh tay thì tức giận, giết hại rất nhiều.',9)})}
  if(M.ev.inspDone&&M.insp&&c>(M.inspAt||0)+3.5){if(goTo(M.insp,PEN_DOOR[0]+1,PEN_DOOR[1]-1.2,2.6,dt,okGuard))M.insp=null}
  // Đỗ Khắc Chung vào trại
  ev('kc',c>16,()=>{M.kc=walker('kc','Đỗ Khắc Chung',{id:'khac_chung'},LANDING[0],LANDING[1],{});M.kcEsc=walker('kce','Lính giặc',{id:'giac'},LANDING[0]-.9,LANDING[1]+.3,{torch:true});M.kcSt='in';
    toast('Ngoài cổng trại có tiếng huyên náo. Một viên quan nước ta, áo xanh, đi giữa hai hàng đuốc giặc.',5000);
    const la=M.caps.find(o=>o.id==='la2');if(la)setTimeout(()=>{if(MG===M)say(la,'Quan nước mình! Vua sai người sang đấy!',3.4)},2500);
    note('Chi hậu cục thủ Đỗ Khắc Chung tự xin vua cho vào dò xét quân giặc, mang thư sang trại Ô Mã Nhi.',10)});
  const K=M.kc;
  if(K){
    if(M.kcSt==='in'){if(goTo(K,KC_AT[0],KC_AT[1],2.2,dt)){M.kcSt='talk';K.dir='right';M.omn.dir='left';M.talk=0;M.talkT=0}}
    else if(M.kcSt==='talk'){if((M.talkT-=dt)<=0){if(M.talk<TALK.length){const [who,t]=TALK[M.talk++];say(who==='omn'?M.omn:K,t,4.6);M.talkT=4.8;
          if(M.talk===3)floatAt('vén tay áo',K.x,K.y,'#e2bf72')}
        else{M.kcSt='out';toast('Đỗ Khắc Chung chắp tay, quay ra cổng trại.',3600)}}}
    else if(M.kcSt==='out'){
      // đi ngang bãi tù: bạn chọn gọi tên mình hay im lặng ghi nhớ
      if(!M.ev.choice&&K.x<PEN.x1+1.5&&K.x>PEN.x0-1)ev('choice',true,()=>showModal({kicker:'Gần sáng · ngày 13 tháng giêng',title:'Sứ giả đi ngang bãi tù',
        body:`<p>Đỗ Khắc Chung đi ngang ngay trước bãi quây tù, cách bạn chỉ vài bước. Lính giặc cầm đuốc đi hai bên.</p>
          ${src('vua sai Đỗ Khắc Chung mang thư vào trại Ô Mã Nhi; bị hỏi về chữ "Sát Thát", ông ứng đối không chịu nhún, giơ cánh tay mình cho xem. Giờ Mão ngày 13, ông về.')}
          <p class="note">Bạn có mặt trong trại lúc ấy là hư cấu. Lời đối đáp theo Toàn thư, viết lại bằng lời thường.</p>`,
        choices:[
          {label:'Gọi to tên mình khi ông đi ngang',note:'triều đình biết bạn còn sống · giặc để mắt tới bạn',fn:()=>{S.capt.seen=true;say(K,'...',1.5);floatAt('khẽ gật đầu',K.x,K.y,'#e2bf72');setTimeout(()=>{if(MG===M){say(M.guards[0],'Câm mồm!',2.4);M.shake=.5}},900)}},
          {label:'Im lặng, ghi nhớ trại giặc bố trí ra sao',note:'+3 Văn · biết đường trong trại',fn:()=>{S.capt.map=true;gain('van',3);sayMe('Cổng tây, trướng giữa, lương chất phía đông nam...',4)}}]}));
      if(goTo(K,LANDING[0],LANDING[1],2.2,dt)){M.kc=null;M.kcEsc=null;M.kcGone=c}}
    if(M.kcEsc)goTo(M.kcEsc,K.x-.9,K.y+.3,3,dt)}
  ev('omnSay',M.kcGone!=null&&c>M.kcGone+1.5,()=>{say(M.omn,'Người này bị dồn ép mà lời lẽ vẫn ung dung, không làm nhục mệnh vua. Nước này còn người giỏi, chưa dễ tính chuyện được.',5.4);
    note('Ô Mã Nhi bảo các tướng: người ấy ứng đối giỏi, không nhục mệnh vua; nước Nam còn người giỏi, chưa dễ mưu tính.',9)});
  ev('dawn',M.ev.omnSay&&c>M.kcGone+7.5,()=>{M.dawnAt=c;toast('Giờ Mão ngày 13, trời hửng sáng trên bãi sông. Doanh trại giặc bắt đầu nhổ trại, lùa người bị bắt ra bờ.',5200)});
  if(M.dawnAt!=null){M.dawn=Math.min(1,(c-M.dawnAt)/5);if(c-M.dawnAt>6&&!M.ev.end)ev('end',true,()=>endCamp())}
  M.shake=Math.max(0,(M.shake||0)-dt*1.6);
}
function endCamp(){const res=MG.res;setMG(null);setKeys();document.body.classList.remove('mg');$('toast').hidden=true;save();endChapter(res)}
function campTarget(){const M=MG;let best=1.5,t=null;
  for(const o of M.caps){const d=Math.hypot(o.x-S.x,o.y-S.y);if(d<best){best=d;t={label:'Nói chuyện với '+o.name,act:()=>say(o,captiveLine(o),3.6)}}}
  return t}
function captiveLine(o){const id=o.look&&o.look.id;
  if(id==='me_gia')return S.cha?'Cha con còn ở trong rừng... mong ông ấy đừng liều đi tìm mẹ con mình.':'Mẹ không sao. Con còn sống là mẹ yên lòng rồi.';
  if(id==='sen')return 'Cha ơi, con lạnh...';
  if(id==='thao')return S.thao==='wife'?'Anh đừng làm gì liều. Mình còn phải về với con.':'Anh Cò mà biết em ở đây...';
  if(id==='batu')return 'Già rồi, chết cũng chẳng sao. Chỉ thương lũ trẻ.';
  if(id==='ly')return 'Làng còn người thì còn làng. Cháu phải sống mà về.';
  if(id==='ti')return 'Chú ơi, mẹ cháu có chạy thoát không?';
  if(o.tat)return 'Chữ khắc vào tay rồi thì khắc vào lòng. Chúng đánh được thân chứ đánh sao được chữ.';
  if(o.id==='la2')return 'Làng tôi bên Đông Ngàn, chúng đốt từ hôm kia...';
  return 'Có nhau cả đây.'}
function campDraw(list){const M=MG;drawCamp(list);
  for(const o of M.caps)drawWalker(list,o,Math.hypot(o.x-S.x,o.y-S.y)<3);
  for(const g of M.guards)drawWalker(list,g,false);
  if(M.insp)drawWalker(list,M.insp,false);
  drawWalker(list,M.omn,true);drawWalker(list,M.off,false);
  if(M.kc){drawWalker(list,M.kc,true);if(M.kcEsc)drawWalker(list,M.kcEsc,false)}
}

/* ---------- chung: đêm, chữ, bản đồ nhỏ ---------- */
let darkC=null;
function nightPost(){const M=MG;if(!darkC)darkC=document.createElement('canvas');if(darkC.width!==VW||darkC.height!==VH){darkC.width=VW;darkC.height=VH}
  const g=darkC.getContext('2d'),a=.72*(1-(M.dawn||0)*.75);g.globalCompositeOperation='source-over';g.clearRect(0,0,VW,VH);g.fillStyle=`rgba(8,12,32,${a})`;g.fillRect(0,0,VW,VH);
  g.globalCompositeOperation='destination-out';
  const hole=(x,y,r)=>{const sx=x*T-camX,sy=(y-.7)*T-camY;if(sx<-r||sy<-r||sx>VW+r||sy>VH+r)return;const gr=g.createRadialGradient(sx,sy,r*.2,sx,sy,r);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(sx-r,sy-r,r*2,r*2)};
  hole(S.x,S.y,200);for(const o of [M.lead,...(M.guards||[]),M.insp,M.kcEsc])if(o&&o.torch)hole(o.x,o.y,170);
  for(const f of FIRES)hole(f[0],f[1],220);for(const f of BEN_FIRES)hole(f[0],f[1],220);for(const b of (M.burnt||[]))hole(b.x+b.w/2,b.y+b.h/2,230);
  g.globalCompositeOperation='source-over';ctx.drawImage(darkC,0,0,VW,VH);
  if(M.dawn){ctx.fillStyle=`rgba(255,175,120,${.12*M.dawn})`;ctx.fillRect(0,0,VW,VH)}
  if(M.fade){const f=M.fade<1.4?M.fade/1.4:Math.max(0,(2.8-M.fade)/1.4);ctx.fillStyle=`rgba(5,6,10,${f})`;ctx.fillRect(0,0,VW,VH);
    if(f>.5){ctx.globalAlpha=(f-.5)*2;ctx.font='500 18px "Alegreya SC", Georgia, serif';ctx.fillStyle='#efe8d4';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Thuyền giặc chở bạn sang bờ bên kia sông Hồng...',VW/2,VH/2);ctx.globalAlpha=1}}}
function bubbles(){const M=MG;ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';
  for(const b of M.bub){if(!b.text)continue;const o=b.o.me?{x:S.x,y:S.y}:b.o;const words=b.text.split(' '),lines=[];let cur='';
    for(const w of words){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>230&&cur){lines.push(cur);cur=w}else cur=t}if(cur)lines.push(cur);
    const w=Math.ceil(Math.max(...lines.map(l=>ctx.measureText(l).width)))+16,h=lines.length*16+10;
    let x=Math.round(o.x*T-camX-w/2),y=Math.round((o.y-2.45)*T-camY-h);x=Math.max(8,Math.min(VW-w-8,x));y=Math.max(90,y);
    ctx.globalAlpha=Math.min(1,b.t*3);ctx.fillStyle='#0b0d0c';ctx.fillRect(x-2,y-2,w+4,h+4);ctx.fillStyle='#efe8d4';ctx.fillRect(x,y,w,h);
    const tx=Math.max(x+8,Math.min(x+w-14,Math.round(o.x*T-camX)-3));ctx.fillStyle='#0b0d0c';ctx.fillRect(tx-2,y+h,10,4);ctx.fillStyle='#efe8d4';ctx.fillRect(tx,y+h,6,3);
    ctx.fillStyle='#1d221f';ctx.textAlign='left';lines.forEach((l,i)=>ctx.fillText(l,x+8,y+13+i*16));ctx.globalAlpha=1}}
function sceneHud(){const M=MG;if(M.fade>.3)return;bubbles();
  const w=Math.min(420,VW-32),x=Math.round(VW/2-w/2);hudBox(x,16,w,44);ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#e2bf72';
  ctx.fillText(M.type==='escort'?(M.phase==='walk2'?'Bờ đông sông Hồng · trại quân Nguyên':'Bị giải đi · đêm 12 tháng giêng'):'Trại quân Nguyên · bãi tù',x+12,30);
  ctx.fillStyle='#aab2a2';ctx.textAlign='right';ctx.fillText(M.type==='camp'&&M.dawn?'giờ Mão, ngày 13':'Ất Dậu 1285',x+w-12,30);
  ctx.textAlign='left';ctx.fillStyle='#efe8d4';ctx.fillText(M.type==='escort'?(M.phase==='walk2'?'Tên lính lôi bạn về phía bãi tù trong trại':'Bước theo tên cầm đầu ra bến Đông Bộ Đầu'):M.kc?'Một viên quan nước ta vào trại giặc':'Quan sát, nghe ngóng',x+12,47);
  if(M.note&&M.note.text){const nw=Math.min(620,VW-32),nx=Math.round(VW/2-nw/2);ctx.font='500 12px "Be Vietnam Pro", system-ui, sans-serif';const words=('Toàn thư chép: '+M.note.text).split(' '),lines=[];let cur='';
    for(const wd of words){const t=cur?cur+' '+wd:wd;if(ctx.measureText(t).width>nw-24&&cur){lines.push(cur);cur=wd}else cur=t}if(cur)lines.push(cur);
    const nh=lines.length*16+12,ny=VH-170-nh;ctx.globalAlpha=Math.min(1,M.note.t*2);hudBox(nx,ny,nw,nh);ctx.fillStyle='#c9bfa0';lines.forEach((l,i)=>ctx.fillText(l,nx+12,ny+14+i*16));ctx.globalAlpha=1}}
function sceneMini(m){const dot=(x,y,r,col)=>{m.fillStyle=col;m.fillRect(Math.round(x*2-r),Math.round(y*2-r),r*2,r*2)};
  m.strokeStyle='#a83a32';m.strokeRect(CAMP.x0*2+.5,CAMP.y0*2+.5,(CAMP.x1-CAMP.x0+1)*2,(CAMP.y1-CAMP.y0+1)*2);
  for(const f of FIRES)dot(f[0],f[1],1.5,'#ff9a3a');dot(BEN[0],BEN[1],2,'#ff9a3a');
  if(MG.type==='escort'){const [gx,gy]=MG.goal;dot(gx,gy,2.5,Math.floor(clock*3)%2?'#e2bf72':'#a8884a')}}
