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
import {nextStep,stepTo} from './pathfind.js';
import {VH,VW,camX,camY,clock,drawSprite,reduce,shadow} from './render.js';
import {charred,dirOf,endChapter,smoke,tongue,torchFx} from './climax.js';
import {hudBox} from './minigames/flood.js';
import {BEN_FIRES,BIGFLAG,CAMP,FIRES,KC_AT,OMN_AT,PEN,PENS,PEN_DOOR,PEN_IN,THUY,T_FIRES,campFolk,campMini,campSolid,drawCamp,flagFx,hideProp,inRect} from './trai.js';

const src=t=>`<p class="src">Toàn thư chép: ${t}</p>`;
/* ---------- chỗ trong cảnh (tọa độ ô; bố cục trại ở src/trai.js) ---------- */
const BEN=[82.5,12.5];                                   // bến Đông Bộ Đầu, bờ tây
const LANDING=FERRIES[0].b;                              // bãi đổ bờ đông, ở thủy trại
const GATE_W=[CAMP.x0+.5,12.5];                          // cổng tây doanh trại
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
    roam:true,hideProp,update:escortUpdate,draw:escortDraw,post:nightPost,hud:sceneHud,findTarget:()=>null,blockAt,speedMul:()=>.6,mini:sceneMini,said:{}});
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
    if(M.fade>=2.8){M.phase='walk2';M.fade=0;toast('Thuyền cập cầu tàu thủy trại giặc ở bờ đông. Thuyền chiến neo kín bến, lính canh đứng sau hàng cọc.',5200)}
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
  if(M.phase==='walk2'&&S.x>THUY.x1+4)once('road',()=>{sayMe('Chúng giải mình đi đâu thế này... xa bờ sông quá.',3.6);note('ngày 12 tháng giêng, giặc đánh vào Gia Lâm, Vũ Ninh, Đông Ngàn.',8)});
  if(M.phase==='walk2'&&S.x>CAMP.x0-9)once('see',()=>toast('Trước mặt là doanh trại quân Nguyên: rào cọc nhọn, chòi canh bốn góc, lửa trại khắp bãi.',5000));
  if(M.phase==='walk2'&&inRect(Math.floor(S.x),Math.floor(S.y),CAMP))once('gate',()=>{say(L,'Ném nó vào chuồng tù!',2.6);note('',.01)});
  if(M.phase==='walk2'&&Math.hypot(L.x-gx,L.y-gy)<.5&&dp<2.6)startCamp();
}
function drawWalker(list,o,lab){list.push({y:o.y,f:()=>{shadow(o.x,o.y,10);drawSprite(personSprite(o.look,o.dir,frame(o)),o.x,o.y);if(o.torch){const px=Math.round((o.x+.35)*TS),py=Math.round((o.y-.4)*TS);tongue(px,py-10,8,5,o.x)}},lab:lab&&Math.hypot(o.x-S.x,o.y-S.y)<5?[o.name,o.x,o.y-2]:null})}
function rope(a,b){ctx.strokeStyle='#8a6a3a';ctx.lineWidth=Z;ctx.beginPath();ctx.moveTo(a.x*T-camX,(a.y-.55)*T-camY);ctx.lineTo(b.x*T-camX,(b.y-.55)*T-camY);ctx.stroke()}
function escortDraw(list){const M=MG;
  // xóm bị đốt: còn cháy âm ỉ
  for(const b of M.burnt){const c=buildingSprite(b),top=b.y*TS-c.oy,roof=top+Math.round(c.height*.42);list.push({y:b.y+b.h+.02,f:()=>{
    ctx.globalAlpha=.65;ctx.drawImage(charred(b,c),(b.x*TS-c.ox)*Z-camX,top*Z-camY,c.width*Z,c.height*Z);ctx.globalAlpha=1;
    for(let x=0;x<b.w;x+=2){const px=b.x*TS+x*TS+8;smoke(px,roof-10,x+b.x*3,8);tongue(px,roof+6,9,9,x+b.y)}}})}
  drawCamp(list);drawFolk(list);
  list.push({y:BIGFLAG[1],f:()=>flagFx(BIGFLAG[0],BIGFLAG[1],true)});for(const f of BEN_FIRES)list.push({y:f[1],f:()=>torchFx(f[0],f[1],true)});
  list.push({y:-1,f:()=>{rope(M.me,M.lead);let prev=M.me;for(const c of M.caps){rope(prev,c);prev=c}}});
  drawWalker(list,M.lead,true);for(const g of M.guards)drawWalker(list,g,false);for(const c of M.caps)drawWalker(list,c,true);
}

/* ---------- 3. trong trại ---------- */
function startCamp(){const M=MG,res=M.res;
  const caps=M.caps,px=PEN.x0,py=PEN.y0;caps.push(walker('la1','Người làng bên',{id:'trai'},px+3.6,py+.4,{tat:true}),walker('la2','Người làng bên',{id:'dan1'},px+.6,py+2.2,{}));
  const spots=[[px+.6,py+.6],[px+4.2,py+1.8],[px+1.4,py+2.4],[px+3.4,py+2.6],[px+.4,py+1.6],[px+4.4,py+.6]];caps.forEach((c,i)=>{if(c.id.startsWith('cap')){const p=spots[i%spots.length];c.x=p[0];c.y=p[1]}c.path=null;c.moving=false;c.dir='down'});
  S.x=PEN_IN[0];S.y=PEN_IN[1];P.dir='down';
  const guards=[walker('gd1','Lính canh',{id:'giac'},PEN_DOOR[0]-.8,PEN_DOOR[1]-.2,{torch:true}),walker('gd2','Lính canh',{id:'giac'},CAMP.x0+1.4,12.6,{torch:true})];
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
  ctx.fillText(M.type==='escort'?(M.phase==='walk2'?'Bờ đông sông Hồng · trại quân Nguyên':'Bị giải đi · đêm 12 tháng giêng'):'Trại quân Nguyên · chuồng tù',x+12,30);
  ctx.fillStyle='#aab2a2';ctx.textAlign='right';ctx.fillText(M.type==='camp'&&M.dawn?'giờ Mão, ngày 13':'Ất Dậu 1285',x+w-12,30);
  ctx.textAlign='left';ctx.fillStyle='#efe8d4';ctx.fillText(M.type==='escort'?(M.phase==='walk2'?'Tên lính lôi bạn về phía chuồng tù trong trại':'Bước theo tên cầm đầu ra bến Đông Bộ Đầu'):M.kc?'Một viên quan nước ta vào trại giặc':'Quan sát, nghe ngóng',x+12,47);
  if(M.note&&M.note.text){const nw=Math.min(620,VW-32),nx=Math.round(VW/2-nw/2);ctx.font='500 12px "Be Vietnam Pro", system-ui, sans-serif';const words=('Toàn thư chép: '+M.note.text).split(' '),lines=[];let cur='';
    for(const wd of words){const t=cur?cur+' '+wd:wd;if(ctx.measureText(t).width>nw-24&&cur){lines.push(cur);cur=wd}else cur=t}if(cur)lines.push(cur);
    const nh=lines.length*16+12,ny=VH-170-nh;ctx.globalAlpha=Math.min(1,M.note.t*2);hudBox(nx,ny,nw,nh);ctx.fillStyle='#c9bfa0';lines.forEach((l,i)=>ctx.fillText(l,nx+12,ny+14+i*16));ctx.globalAlpha=1}}
function sceneMini(m){const dot=(x,y,r,col)=>{m.fillStyle=col;m.fillRect(Math.round(x*2-r),Math.round(y*2-r),r*2,r*2)};
  campMini(m);if(MG.type==='escort'){dot(BEN[0],BEN[1],2,'#ff9a3a');const [gx,gy]=MG.goal;dot(gx,gy,2.5,Math.floor(clock*3)%2?'#e2bf72':'#a8884a')}}
/* lính tuần, thợ rèn, lính gác trong trại */
function drawFolk(list){for(const o of campFolk())drawWalker(list,o,false)}
