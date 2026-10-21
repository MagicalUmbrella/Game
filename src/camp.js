/* ================= bị bắt: giải sang trại giặc (đêm 12 rạng 13 tháng giêng 1285) ================= */
/* Sau đêm tháng giêng, nếu bạn bị bắt (src/climax.js, S.capt), màn chơi không dừng ở một hộp thoại mà đi tiếp:
   1. Bị giải đi (MG.type 'escort'): tay bị trói, đi giữa toán giặc cầm đuốc, qua xóm đang cháy, ra bến Đông Bộ Đầu.
      Bạn tự bước (chậm); tụt lại xa thì lính giật thừng lôi đi. Người làng bị bắt cùng đi thành một dây phía sau.
   2. Qua sông: thuyền giặc chở sang bờ đông sông Hồng (màn tối dần rồi sáng lại).
   3. Trong trại (MG.type 'camp'): bị đẩy vào chuồng tù. Lính khám tay tìm chữ "Sát Thát"; gần sáng Đỗ Khắc Chung
      vào trại Ô Mã Nhi, đối đáp (theo Toàn thư, viết lại bằng lời thường); lúc ông đi ngang chuồng tù thì bạn chọn gọi tên
      mình hay im lặng ghi nhớ trại giặc. Giờ Mão ngày 13 trời hửng thì hết chương một (endChapter).
   Doanh trại (bố cục ở src/trai.js) dựng lên từ đêm 12; trước đó bờ đông là bãi trống.
   Hư cấu: nhân vật bị giải đi, có mặt trong trại, toán lính, người làng bên bị bắt. Theo Toàn thư: giặc đến Đông Bộ Đầu
   dựng cờ lớn; giặc giận dữ khi thấy chữ "Sát Thát"; Đỗ Khắc Chung vào trại Ô Mã Nhi, giờ Mão ngày 13 về.
   Chỗ để thêm cảnh riêng theo cách bị bắt (đánh thua, lừa hỏng, đổi mình, ngã xuống): BRANCH (đầu file). */
import {$,T,TS,Z,ctx} from './constants.js';
import {BUILDINGS} from './map.js';
import {FERRIES} from './world.js';
import {buildingSprite,personSprite} from './sprites.js';
import {MG,P,S,save,setMG} from './state.js';
import {floatAt,gain,setKeys,showModal,toast} from './ui.js';
import {walkable} from './dialogs.js';
import {along,nextStep,roadRoute,routeLen,stepTo} from './pathfind.js';
import {drawBoat,makeBoat,rowBoat,seat} from './thuyen.js';
import {keys} from './input.js';
import {get} from './map.js';
import {BR,DK,GA,PA,SA,ST} from './constants.js';
import {VH,VW,camX,camY,clock,drawSprite,reduce,shadow} from './render.js';
import {charred,dirOf,endChapter,smoke,tongue,torchFx} from './climax.js';
import {hudBox} from './minigames/flood.js';
import {ducShield,ducTrust,gainThe} from './stats.js';
import {knows} from './nghe.js';
import {BEN_FIRES,BIGFLAG,CAMP,FIRES,KC_AT,OMN_AT,PEN,PENS,PEN_DOOR,PEN_IN,THUY,T_FIRES,campFolk,campMini,campSolid,drawCamp,flagFx,hideProp,inRect} from './trai.js';

const src=t=>`<p class="src">Toàn thư chép: ${t}</p>`;
/* ---------- chỗ trong cảnh (tọa độ ô; bố cục trại ở src/trai.js) ---------- */
const BEN=[82.5,32.5];                                   // bến Đông Bộ Đầu, bờ tây
const LANDING=FERRIES[0].b;                              // bãi đổ bờ đông, ở thủy trại
const GATE_W=[CAMP.x0+.5,32.5];                          // cổng tây doanh trại
/* Cảnh riêng theo cách bị bắt (S.capt.how): 'fight' đánh thua tên đầu toán, 'trick' lừa hỏng, 'surrender' đổi mình,
   'down' ngã xuống không ai đỡ. lead: câu tên cầm đầu toán áp giải nói lúc lên đường. Chủ dự án sẽ viết thêm cảnh
   riêng cho từng nhánh: thêm trường vào đây (ví dụ cảnh trong trại) rồi gọi ở campUpdate. */
const BRANCH={
  fight:{lead:'Thằng này đánh cũng ra gì. Trói chặt vào, giải về trại!'},
  trick:{lead:'Dám lừa ta à? Để xem về trại cái mồm mày còn dẻo được bao lâu.'},
  surrender:{lead:'Ta giữ lời: con kia được thả. Còn mày thì đi!'},
  down:{lead:'Còn thở. Trói lại, giải về trại!'},
};
const doorTile=(x,y)=>x===PEN.door&&y===PEN.y0-1;
const okWalk=(x,y)=>walkable(x,y)&&!campSolid(x,y);
const okGuard=(x,y)=>walkable(x,y)&&(!campSolid(x,y)||doorTile(x,y));   // lính đi qua cửa chuồng tù
/* Người chơi: trong trại chỉ đi lại trong chuồng tù (rào, lều, cọc chặn sẵn ở input.js qua campSolid). */
function blockAt(x,y){return MG.type==='camp'&&!inRect(x,y,PEN)}

/* ---------- người trong cảnh ---------- */
export function walker(id,name,look,x,y,extra){return Object.assign({id,name,look,x,y,dir:'down',walk:0,moving:false,path:null},extra||{})}
/* Đi tới (tx,ty) theo đường ô (4 hướng), tốc độ sp ô/giây. Trả về true khi đã tới. */
export function goTo(o,tx,ty,sp,dt,ok=okWalk){const d=Math.hypot(tx-o.x,ty-o.y);if(d<.12){o.moving=false;return true}
  const st=nextStep(o,tx,ty,ok,MG.clock);if(!st){o.moving=false;return false}
  const [mx,my]=stepTo(o,st,Math.min(d,sp*dt),ok);o.x+=mx;o.y+=my;o.moving=!!(mx||my);if(o.moving){o.walk+=dt*8;o.dir=dirOf(mx,my)}return false}
const frame=o=>o.moving?[1,0,2,0][Math.floor(o.walk)%4]:0;
function say(o,text,dur=3.6){MG.bub=MG.bub.filter(b=>b.o!==o);MG.bub.push({o,text,t:dur})}
const sayMe=(text,dur)=>say(MG.me,text,dur);
function note(text,dur=9){MG.note={text,t:dur}}

/* ---------- 1–2. bị giải đi, qua sông ---------- */
/* Đoàn áp giải đi thành một hàng theo đường sá (roadRoute ưu tiên đường đất, đê, cầu): lính cầm đuốc đi đầu, tên cầm
   đầu nắm đầu thừng, bạn bị trói, người làng bị bắt nối dây phía sau, một lính cầm đuốc đi cuối. Mọi người giữ khoảng
   cách đều trên cùng một đường (along), đi 4 hướng, cùng một nhịp. Bạn không tự đi được; giữ Space thì đoàn đi nhanh
   (tua cảnh). Tới bến Đông Bộ Đầu thì xuống thuyền giặc (thuyen.js), chèo sang thủy trại bờ đông, lên bờ đi tiếp vào trại. */
const GAP=1.5,PACE=2.2;
const roadCost=(x,y)=>{const t=get(x,y);return t===PA||t===DK||t===BR||t===ST||t===GA?1:t===SA?2:3};
function route(a,b){return roadRoute(Math.floor(a[0]),Math.floor(a[1]),Math.floor(b[0]),Math.floor(b[1]),okWalk,roadCost)||[[a[0],a[1]],[b[0],b[1]]]}
const ME={me:true,name:'Bạn',get x(){return S.x},get y(){return S.y}};
export function startEscort(res){
  const how=(S.capt&&S.capt.how)||'down',bossLead=res.boss==='took'||res.boss==='alive'||how==='fight'||how==='trick'||how==='surrender';
  const lead=walker('lead',bossLead?'Tên đầu toán':'Lính giặc',{id:bossLead?'giac_dau':'giac_ky'},S.x,S.y,{});
  const g1=walker('g1','Lính giặc',{id:'giac'},S.x,S.y,{torch:true}),g2=walker('g2','Lính giặc',{id:'giac'},S.x,S.y,{torch:true});
  const caps=(res.lostWho||[]).map((p,i)=>walker('cap'+i,p.name,p.look,S.x,S.y,{tied:true}));
  const col=[g1,lead,ME,...caps,g2],pts=route([S.x,S.y],BEN);
  setMG({type:'escort',phase:'walk',clock:0,lead,guards:[g1,g2],caps,me:ME,col,pts,L:routeLen(pts),s:2*GAP,k:0,bub:[],note:null,fade:0,res,hideNPC:true,burnt:(res.burnt||[]).map(id=>BUILDINGS.find(b=>b.id===id)).filter(Boolean),
    roam:true,hideProp,update:escortUpdate,draw:escortDraw,post:nightPost,hud:sceneHud,findTarget:()=>null,speedMul:()=>0,mini:sceneMini,said:{},
    key:k=>k===' ',meSort:()=>MG.phase==='row'?{y:MG.B.y-.44,dy:.32}:null});
  MG.goal=BEN;document.body.classList.add('mg');placeColumn(MG,0);
  setKeys('<span>Tay bị trói, bị giải đi giữa toán giặc</span><span>Giữ <kbd>Space</kbd> cho đoàn đi nhanh</span>');
  $('toast').hidden=true;
  say(lead,BRANCH[how].lead,4.2);
  if(caps.length){const c=caps.find(p=>p.look&&p.look.id==='me_gia')||caps[0];setTimeout(()=>{if(MG&&MG.type==='escort'){const id=c.look&&c.look.id,kid=id==='ti'||id==='sen'||(c.look&&c.look.kid);say(c,id==='me_gia'?'Con ơi... mẹ đây!':id==='sen'?'Cha ơi!':kid?'Chú ơi... cháu sợ lắm!':'Có nhau cả đây.',3.6);
      if(kid)setTimeout(()=>{if(MG&&MG.type==='escort')sayMe(id==='sen'?'Cha đây. Đừng sợ, có cha đây.':'Đừng sợ, có chú đây. Chú không bỏ cháu đâu.',3.6)},2600)}},2200)}
  toast('Tay bị trói giật cánh khuỷu, bạn bị lôi đi giữa toán giặc cầm đuốc, về phía bến Đông Bộ Đầu.',5200);
  save();
}
/* Đặt cả hàng người lên đường M.pts theo quãng đường M.s của người đi đầu. */
function placeColumn(M,dt,moving){M.col.forEach((o,i)=>{const si=M.s-i*GAP,p=along(M.pts,Math.max(0,si)),mv=!!moving&&si>0;
  if(o.me){S.x=p.x;S.y=p.y;P.dir=p.dir;P.moving=mv;if(mv)P.walk+=dt*7}else{o.x=p.x;o.y=p.y;o.dir=p.dir;o.moving=mv;if(mv)o.walk+=dt*7}})}
/* chỗ của từng người trên thuyền: hai lính chèo ở mũi, đuôi; tên cầm đầu, bạn, người bị bắt ngồi giữa */
function boatSpots(M){const B=M.B,a=seat(B,1),b=seat(B,4),riders=[M.lead,ME,...M.caps],n=riders.length,out=new Map();
  riders.forEach((o,i)=>{const u=n>1?i/(n-1):.5;out.set(o,[a[0]+(b[0]-a[0])*u,a[1]])});out.set(M.guards[0],seat(B,0));out.set(M.guards[1],seat(B,5));return out}
function setPos(o,p,dir){if(o.me){S.x=p[0];S.y=p[1];if(dir)P.dir=dir}else{o.x=p[0];o.y=p[1];if(dir)o.dir=dir}}
function escortUpdate(dt){const M=MG;M.clock+=dt;const fast=keys[' ']?3:1;
  for(const b of M.bub)b.t-=dt;M.bub=M.bub.filter(b=>b.t>0);if(M.note&&(M.note.t-=dt)<=0)M.note=null;
  const once=(k,f)=>{if(!M.said[k]){M.said[k]=1;f()}};
  if(M.phase==='walk'||M.phase==='walk2'){
    M.s=Math.min(M.L+M.col.length*GAP,M.s+PACE*fast*dt);placeColumn(M,dt*fast,true);
    // chuyện dọc đường
    const home=BUILDINGS.find(b=>b.id==='home');if(M.phase==='walk'&&home&&Math.hypot(S.x-(home.x+2.5),S.y-(home.y+3))<4)once('home',()=>sayMe(M.burnt.includes(home)?'Nhà mình... cháy cả rồi.':'Nhà mình...',3.4));
    if(M.phase==='walk'&&S.y<51&&S.x>45)once('tolich',()=>{sayMe('Qua sông Tô Lịch rồi. Làng ở sau lưng...',3.4)});
    if(M.phase==='walk'&&Math.hypot(S.x-BEN[0],S.y-BEN[1])<9)once('ben',()=>{toast('Bến Đông Bộ Đầu đỏ rực đuốc giặc. Một lá cờ lớn cắm trên bãi, thuyền giặc chờ sẵn.',4600);note('giặc kéo đến Đông Bộ Đầu, dựng một lá cờ lớn (tháng giêng năm 1285).')});
    if(M.phase==='walk2'&&S.x>THUY.x1+4)once('road',()=>{sayMe('Chúng giải mình đi đâu thế này... xa bờ sông quá.',3.6);note('ngày 12 tháng giêng, giặc đánh vào Gia Lâm, Vũ Ninh, Đông Ngàn.',8)});
    if(M.phase==='walk2'&&S.x>CAMP.x0-9)once('see',()=>toast('Trước mặt là doanh trại quân Nguyên: rào cọc nhọn, chòi canh bốn góc, lửa trại khắp bãi.',5000));
    if(M.phase==='walk2'&&inRect(Math.floor(S.x),Math.floor(S.y),CAMP))once('gate',()=>{say(M.lead,'Ném nó vào chuồng tù!',2.6);note('',.01)});
    // tới bến: xuống thuyền; tới cửa chuồng tù: vào trại
    if(M.phase==='walk'&&M.s-GAP>=M.L-.05){M.B=makeBoat(BEN,LANDING,{big:true,speed:1.45});M.phase='board';M.k=0;M.from=new Map(M.col.map(o=>[o,[o.x,o.y]]));sayMe('',.01);say(M.lead,'Xuống thuyền! Nhanh lên!',2.4)}
    if(M.phase==='walk2'&&Math.hypot(S.x-PEN_DOOR[0],S.y-PEN_DOOR[1])<1.3)startCamp();
    return}
  const B=M.B,spots=boatSpots(M);
  if(M.phase==='board'){M.k=Math.min(1,M.k+dt*1.1*fast);for(const o of M.col){const a=M.from.get(o),b=spots.get(o),u=M.k;setPos(o,[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u],u<1?null:B.dir);if(!o.me)o.moving=u<1;else P.moving=u<1}
    if(M.k>=1){M.phase='row';toast('Thuyền giặc rời bến Đông Bộ Đầu. Sông Hồng mênh mông, bờ bên kia chỉ thấy lửa đuốc lập lòe.',5200)}return}
  if(M.phase==='row'){const done=rowBoat(B,dt*fast);const sp=boatSpots(M);for(const o of M.col){setPos(o,sp.get(o),B.dir);if(!o.me)o.moving=false;else P.moving=false}
    if(B.t>B.dur*.35)once('mid',()=>{if(knows('cheo')||knows('boi')){S.capt.river=true;sayMe('Nước đang ròng, thuyền trôi chếch về hạ lưu... phải nhớ lấy.',4)}else sayMe('Sông rộng quá. Làng mình ở đâu sau lưng kia...',3.6)});
    if(done){M.crossed=true;M.phase='land';M.k=0;M.from=new Map(M.col.map(o=>[o,o.me?[S.x,S.y]:[o.x,o.y]]));
      M.pts=route([B.ex+(B.dir==='right'?.9:-.9),B.ey],PEN_DOOR);M.L=routeLen(M.pts);M.s=2*GAP;
      toast('Thuyền cập cầu tàu thủy trại giặc ở bờ đông. Thuyền chiến neo kín bến, lính canh đứng sau hàng cọc.',5200)}return}
  if(M.phase==='land'){M.k=Math.min(1,M.k+dt*1.1*fast);M.col.forEach((o,i)=>{const p=along(M.pts,Math.max(0,M.s-i*GAP)),a=M.from.get(o),u=M.k;setPos(o,[a[0]+(p.x-a[0])*u,a[1]+(p.y-a[1])*u],p.dir);if(!o.me)o.moving=u<1;else P.moving=u<1});
    if(M.k>=1)M.phase='walk2'}
}
export function drawWalker(list,o,lab){list.push({y:o.y,f:()=>{shadow(o.x,o.y,10);drawSprite(personSprite(o.look,o.dir,frame(o)),o.x,o.y);if(o.tied)wrists(o.x,o.y);if(o.torch){const px=Math.round((o.x+(o.dir==='left'?-.35:.35))*TS),py=Math.round((o.y-.4)*TS);tongue(px,py-10,8,5,o.x)}},lab:lab&&Math.hypot(o.x-S.x,o.y-S.y)<5?[o.name,o.x,o.y-2]:null})}
/* thừng trói tay: một vòng dây ngang thắt lưng */
function wrists(x,y,dy=0){const px=Math.round(x*TS),py=Math.round((y+dy)*TS)-11;ctx.fillStyle='#8a6a3a';ctx.fillRect((px-4)*Z-camX,py*Z-camY,Z*8,Z*2);ctx.fillStyle='#5a4426';ctx.fillRect((px-1)*Z-camX,(py+2)*Z-camY,Z*2,Z*2)}
/* sợi thừng võng xuống giữa hai người: từ tay người kéo tới chỗ trói người sau */
function rope(a,b,dy=0){const ax=a.x*T-camX,ay=(a.y-.68+dy)*T-camY,bx=b.x*T-camX,by=(b.y-.68+dy)*T-camY,mx=(ax+bx)/2,my=Math.max(ay,by)+T*.35;
  ctx.strokeStyle='#3a2a16';ctx.lineWidth=Z+2;ctx.beginPath();ctx.moveTo(ax,ay);ctx.quadraticCurveTo(mx,my,bx,by);ctx.stroke();
  ctx.strokeStyle='#9a7a46';ctx.lineWidth=Z;ctx.beginPath();ctx.moveTo(ax,ay);ctx.quadraticCurveTo(mx,my,bx,by);ctx.stroke()}
function escortDraw(list){const M=MG;
  // xóm bị đốt: còn cháy âm ỉ
  for(const b of M.burnt){const c=buildingSprite(b),top=b.y*TS-c.oy,roof=top+Math.round(c.height*.42);list.push({y:b.y+b.h+.02,f:()=>{
    ctx.globalAlpha=.65;ctx.drawImage(charred(b,c),(b.x*TS-c.ox)*Z-camX,top*Z-camY,c.width*Z,c.height*Z);ctx.globalAlpha=1;
    for(let x=0;x<b.w;x+=2){const px=b.x*TS+x*TS+8;smoke(px,roof-10,x+b.x*3,8);tongue(px,roof+6,9,9,x+b.y)}}})}
  drawCamp(list);drawFolk(list);
  list.push({y:BIGFLAG[1],f:()=>flagFx(BIGFLAG[0],BIGFLAG[1],true)});for(const f of BEN_FIRES)list.push({y:f[1],f:()=>torchFx(f[0],f[1],true)});
  const tied=[M.lead,ME,...M.caps];
  if(M.phase==='row'){const B=M.B;
    drawBoat(list,B,[M.lead,...M.caps].map(o=>({look:o.look,at:[o.x,o.y],dir:B.dir})),M.guards.map(g=>({look:g.look,at:[g.x,g.y]})));
    list.push({y:B.y-.43,f:()=>{wrists(S.x,S.y,.32);for(const c of M.caps)wrists(c.x,c.y,.32);for(let i=1;i<tied.length;i++)rope(tied[i-1],tied[i],.32)}});
    for(const g of M.guards){const px=Math.round(g.x*TS),py=Math.round((g.y-.4)*TS);list.push({y:B.y-.29,f:()=>tongue(px+(B.dir==='left'?-5:5),py-10,8,5,g.x)})}
    return}
  if(M.B)drawBoat(list,M.B);   // thuyền đậu ở bến (lúc xuống thuyền, lên bờ)
  list.push({y:S.y+.001,f:()=>wrists(S.x,S.y)});
  list.push({y:-1,f:()=>{for(let i=1;i<tied.length;i++)rope(tied[i-1],tied[i])}});
  drawWalker(list,M.lead,true);for(const g of M.guards)drawWalker(list,g,false);for(const c of M.caps)drawWalker(list,c,true);
}

/* ---------- 3. trong trại ---------- */
function startCamp(){const M=MG,res=M.res;
  const caps=M.caps,px=PEN.x0,py=PEN.y0;caps.push(walker('la1','Người làng bên',{id:'dan_nam1'},px+3.6,py+.4,{tat:true}),walker('la2','Người làng bên',{id:'dan_nu1'},px+.6,py+2.2,{}));
  const spots=[[px+.6,py+.6],[px+4.2,py+1.8],[px+1.4,py+2.4],[px+3.4,py+2.6],[px+.4,py+1.6],[px+4.4,py+.6]];caps.forEach((c,i)=>{if(c.id.startsWith('cap')){const p=spots[i%spots.length];c.x=p[0];c.y=p[1]}c.path=null;c.moving=false;c.dir='down'});
  S.x=PEN_IN[0];S.y=PEN_IN[1];P.dir='down';if(ducTrust())S.capt.trust=true;if(knows('ngua'))S.capt.horse=true;
  const guards=[walker('gd1','Lính canh',{id:'giac'},PEN_DOOR[0]-.8,PEN_DOOR[1]-.2,{torch:true}),walker('gd2','Lính canh',{id:'giac'},CAMP.x0+1.4,32.6,{torch:true})];
  // người bị bắt ở các chuồng khác (hư cấu)
  const others=[];PENS.filter(p=>!p.main).forEach((p,j)=>{const ids=['dan1','trai','gom','dan1'];for(let i=0;i<3+j;i++)others.push(walker('o'+j+i,'Người bị bắt',{id:ids[(i+j)%ids.length]},p.x0+.6+((i*1.7)%4.2),p.y0+.5+(i%3)*.8,{dir:i%2?'up':'down'}))});
  setMG({type:'camp',clock:0,c:0,res,me:M.me,caps,guards,bub:[],note:null,fade:0,dawn:0,hideNPC:true,said:{},ev:{},
    omn:walker('omn','Ô Mã Nhi',{id:'o_ma_nhi'},OMN_AT[0],OMN_AT[1],{dir:'left'}),off:walker('off','Tướng Nguyên',{id:'giac_ky'},OMN_AT[0]+1.1,OMN_AT[1]-.6,{dir:'left'}),
    kc:null,kcEsc:null,insp:null,talk:0,others,
    cam:()=>[S.x+1,S.y-3.4],roam:true,hideProp,update:campUpdate,draw:campDraw,post:nightPost,hud:sceneHud,findTarget:campTarget,blockAt,speedMul:()=>.6,mini:sceneMini});
  setKeys('<span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> đi lại trong chuồng tù</span><span><kbd>E</kbd> nói chuyện</span>');
  toast('Bạn bị đẩy vào chuồng tù ngay trước trướng tướng giặc. Quanh bạn là người mấy làng ven sông bị bắt trong đêm.',5200);save();
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
      else if(ducShield())showModal({kicker:'Trong chuồng tù',title:'Chữ "Sát Thát"',body:'<p>Tên lính giật tay áo một người làng bên, thấy hai chữ "Sát Thát". Hắn rút roi ngựa, gầm lên.</p>',
        choices:[{label:'Bước lên chắn trước người ấy',note:'Đức 60 · bạn chịu đòn, yếu đi',fn:()=>{S.capt.shield=true;gainThe(-4);M.shake=.7;toast('Bạn bước lên chắn trước người ấy. Ngọn roi quất xuống lưng bạn, rát buốt. Tên lính chửi một tràng rồi bỏ đi.',5200);say(who,'Anh... ơn này tôi nhớ.',3.6)}},
          {label:'Đứng yên',fn:()=>{toast('Tên lính quật người ấy ngã sấp.',4000);say(who,'Giết thì giết, chữ thì vẫn còn đây!',3.6)}}]});
      else{toast('Tên lính giật tay áo một người làng bên, thấy chữ "Sát Thát". Hắn gầm lên, quật người ấy ngã sấp.',5000);say(who,'Giết thì giết, chữ thì vẫn còn đây!',3.6)}
      note('giặc bắt được quân ta, thấy người nào cũng thích chữ "Sát Thát" vào cánh tay thì tức giận, giết hại rất nhiều.',9)})}
  if(M.ev.inspDone&&M.insp&&c>(M.inspAt||0)+3.5){if(goTo(M.insp,PEN_DOOR[0]+1,PEN_DOOR[1]-1.2,2.6,dt,okGuard))M.insp=null}
  // Đỗ Khắc Chung vào trại
  ev('kc',c>16,()=>{M.kc=walker('kc','Đỗ Khắc Chung',{id:'khac_chung'},GATE_W[0],GATE_W[1],{});M.kcEsc=walker('kce','Lính giặc',{id:'giac'},GATE_W[0]-.9,GATE_W[1]+.3,{torch:true});M.kcSt='in';
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
      // đi ngang chuồng tù: bạn chọn gọi tên mình hay im lặng ghi nhớ
      if(!M.ev.choice&&K.x<PEN.x1+1.5&&K.x>PEN.x0-1)ev('choice',true,()=>showModal({kicker:'Gần sáng · ngày 13 tháng giêng',title:'Sứ giả đi ngang chuồng tù',
        body:`<p>Đỗ Khắc Chung đi ngang ngay trước chuồng tù, cách bạn chỉ vài bước. Lính giặc cầm đuốc đi hai bên.</p>
          ${src('vua sai Đỗ Khắc Chung mang thư vào trại Ô Mã Nhi; bị hỏi về chữ "Sát Thát", ông ứng đối không chịu nhún, giơ cánh tay mình cho xem. Giờ Mão ngày 13, ông về.')}
          <p class="note">Bạn có mặt trong trại lúc ấy là hư cấu. Lời đối đáp theo Toàn thư, viết lại bằng lời thường.</p>`,
        choices:[
          {label:'Gọi to tên mình khi ông đi ngang',note:'triều đình biết bạn còn sống · giặc để mắt tới bạn',fn:()=>{S.capt.seen=true;say(K,'...',1.5);floatAt('khẽ gật đầu',K.x,K.y,'#e2bf72');setTimeout(()=>{if(MG===M){say(M.guards[0],'Câm mồm!',2.4);M.shake=.5}},900)}},
          {label:'Im lặng, ghi nhớ trại giặc bố trí ra sao',note:'+3 Văn · biết đường trong trại',fn:()=>{S.capt.map=true;gain('van',3);sayMe('Cổng tây, trướng giữa, lương chất phía đông nam...',4)}}]}));
      if(goTo(K,GATE_W[0],GATE_W[1],2.2,dt)){M.kc=null;M.kcEsc=null;M.kcGone=c}}
    if(M.kcEsc)goTo(M.kcEsc,K.x-.9,K.y+.3,3,dt)}
  ev('omnSay',M.kcGone!=null&&c>M.kcGone+1.5,()=>{say(M.omn,'Người này bị dồn ép mà lời lẽ vẫn ung dung, không làm nhục mệnh vua. Nước này còn người giỏi, chưa dễ tính chuyện được.',5.4);
    note('Ô Mã Nhi bảo các tướng: người ấy ứng đối giỏi, không nhục mệnh vua; nước Nam còn người giỏi, chưa dễ mưu tính.',9)});
  ev('dawn',M.ev.omnSay&&c>M.kcGone+7.5,()=>{M.dawnAt=c;toast('Giờ Mão ngày 13, trời hửng sáng trên bãi sông. Doanh trại giặc bắt đầu nhổ trại, lùa người bị bắt ra bờ.',5200)});
  if(M.dawnAt!=null){M.dawn=Math.min(1,(c-M.dawnAt)/5);if(c-M.dawnAt>6&&!M.ev.end)ev('end',true,()=>endCamp())}
  M.shake=Math.max(0,(M.shake||0)-dt*1.6);
}
function endCamp(){const res=MG.res;setMG(null);setKeys();document.body.classList.remove('mg');$('toast').hidden=true;save();endChapter(res)}
function campTarget(){const M=MG;let best=1.5,t=null;
  for(const o of M.caps){const d=Math.hypot(o.x-S.x,o.y-S.y);if(d<best){best=d;t={label:'Nói chuyện với '+o.name,act:()=>{say(o,captiveLine(o),3.6);const r=meReply(o);if(r)setTimeout(()=>{if(MG&&MG.type==='camp')sayMe(r,3.6)},2400)}}}}
  return t}
/* bạn đáp lại người trong chuồng; trẻ con thì bạn là người dỗ */
function meReply(o){const id=o.look&&o.look.id;
  if(id==='ti')return 'Mẹ cháu chạy nhanh lắm. Sáng ra chú tính đường đưa cháu về.';
  if(id==='sen')return 'Con nép vào cha này. Trời sắp sáng rồi.';
  return ''}
function captiveLine(o){const id=o.look&&o.look.id;
  if(id==='me_gia')return S.cha?'Cha con còn ở trong rừng... mong ông ấy đừng liều đi tìm mẹ con mình.':'Mẹ không sao. Con còn sống là mẹ yên lòng rồi.';
  if(id==='sen')return 'Cha ơi, con lạnh...';
  if(id==='thao')return S.thao==='wife'?'Anh đừng làm gì liều. Mình còn phải về với con.':'Anh Cò mà biết em ở đây...';
  if(id==='batu')return 'Già rồi, chết cũng chẳng sao. Chỉ thương lũ trẻ.';
  if(id==='ly')return 'Làng còn người thì còn làng. Cháu phải sống mà về.';
  if(id==='ti')return 'Chú ơi, mẹ cháu có chạy thoát không?';
  if(o.tat)return S.capt&&S.capt.shield?'Cái roi ấy lẽ ra là của tôi. Anh liều quá.':'Chữ khắc vào tay rồi thì khắc vào lòng. Chúng đánh được thân chứ đánh sao được chữ.';
  if(o.id==='la2')return S.capt&&S.capt.trust?'Làng tôi bên Đông Ngàn. Anh tính gì thì bảo, chúng tôi theo anh.':'Làng tôi bên Đông Ngàn, chúng đốt từ hôm kia...';
  return 'Có nhau cả đây.'}
function campDraw(list){const M=MG;drawCamp(list);drawFolk(list);
  for(const o of M.others)drawWalker(list,o,false);
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
  hole(S.x,S.y,200);for(const o of [M.lead,...(M.guards||[]),M.insp,M.kcEsc,...campFolk()])if(o&&o.torch)hole(o.x,o.y,170);
  for(const f of [...FIRES,...T_FIRES])hole(f[0],f[1],220);if(M.type==='escort')for(const f of BEN_FIRES)hole(f[0],f[1],220);for(const b of (M.burnt||[]))hole(b.x+b.w/2,b.y+b.h/2,230);
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
  ctx.fillText(M.type==='escort'?(M.phase==='walk2'?'Bờ đông sông Hồng · trại quân Nguyên':M.B?'Sông Hồng · thuyền giặc':'Bị giải đi · đêm 12 tháng giêng'):'Trại quân Nguyên · chuồng tù',x+12,30);
  ctx.fillStyle='#aab2a2';ctx.textAlign='right';ctx.fillText(M.type==='camp'&&M.dawn?'giờ Mão, ngày 13':'Ất Dậu 1285',x+w-12,30);
  ctx.textAlign='left';ctx.fillStyle='#efe8d4';ctx.fillText(M.type==='escort'?(M.phase==='walk2'?'Tên lính lôi bạn về phía chuồng tù trong trại':M.B?'Thuyền giặc chở bạn sang bờ đông':'Bị lôi đi giữa toán giặc, ra bến Đông Bộ Đầu'):M.kc?'Một viên quan nước ta vào trại giặc':'Quan sát, nghe ngóng',x+12,47);
  if(M.note&&M.note.text){const nw=Math.min(620,VW-32),nx=Math.round(VW/2-nw/2);ctx.font='500 12px "Be Vietnam Pro", system-ui, sans-serif';const words=('Toàn thư chép: '+M.note.text).split(' '),lines=[];let cur='';
    for(const wd of words){const t=cur?cur+' '+wd:wd;if(ctx.measureText(t).width>nw-24&&cur){lines.push(cur);cur=wd}else cur=t}if(cur)lines.push(cur);
    const nh=lines.length*16+12,ny=VH-170-nh;ctx.globalAlpha=Math.min(1,M.note.t*2);hudBox(nx,ny,nw,nh);ctx.fillStyle='#c9bfa0';lines.forEach((l,i)=>ctx.fillText(l,nx+12,ny+14+i*16));ctx.globalAlpha=1}}
function sceneMini(m){const dot=(x,y,r,col)=>{m.fillStyle=col;m.fillRect(Math.round(x*2-r),Math.round(y*2-r),r*2,r*2)};
  campMini(m);if(MG.type==='escort'){dot(BEN[0],BEN[1],2,'#ff9a3a');const [gx,gy]=MG.goal;dot(gx,gy,2.5,Math.floor(clock*3)%2?'#e2bf72':'#a8884a')}}
/* lính tuần, thợ rèn, lính gác trong trại */
function drawFolk(list){for(const o of campFolk())drawWalker(list,o,false)}
