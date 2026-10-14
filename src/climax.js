/* ================= cao trào: đêm tháng giêng 1285 ================= */
import {T,TS,W,WA,Z,ctx} from './constants.js';
import {Hs} from './pixel.js';
import {get,tolichY} from './map.js';
import {personSprite} from './sprites.js';
import {isKid} from './person.js';
import {LOOK_THAO,MG,P,S,has,save,setMG} from './state.js';
import {floatAt,floatText,setKeys,showModal,toast} from './ui.js';
import {hudBar,hudBox,mark,sackSprite} from './minigames/flood.js';
import {canStand} from './input.js';
import {bfs,walkable} from './dialogs.js';
import {nextStep} from './pathfind.js';
import {prepChronicle,prepClimax} from './prep.js';
import {VH,VW,camX,camY,clock,drawSprite,shadow} from './render.js';
import {followFast,traiFromDuc,voDmg,voFast,voHp} from './stats.js';
import {lifeChronicle,lifeClimax} from './life.js';
import {exploreChronicle} from './explore.js';
import {chainChronicle} from './chains.js';

export const ZONE={x0:23,y0:54,x1:29,y1:66};
const inZone=(x,y)=>x>=ZONE.x0&&x<=ZONE.x1+1&&y>=ZONE.y0&&y<=ZONE.y1+1;
/* Giặc và người cùng đánh đi theo đường thật (src/pathfind.js), không xuyên sông, cây, nhà.
   Chưa vét sông Tô Lịch thì giặc lội qua được (đi chậm lại một nửa); đã vét thì phải qua cầu. */
const okAlly=(x,y)=>walkable(x,y);
const okEnemy=(x,y)=>walkable(x,y)||(S.flags.tolich!=='done'&&get(x,y)===WA);
const wading=o=>get(Math.floor(o.x),Math.floor(o.y))===WA;
/* Đường văn. Người có chữ được dân làng nghe lời: bấm E thì người ấy tự tìm đường vào rừng, đi chậm hơn
   khi được dẫn, giặc gặp trên đường vẫn bắt được. Đuốc nghi binh: 2 cây, cứ 25 Văn thêm một cây (tối
   đa 5), đỗ Thái học sinh thêm một cây; mỗi cây cháy 10 giây. */
const SELF_SPEED=.8,TORCH_T=10;
export const torches=()=>S.path!=='van'?0:Math.min(5,2+Math.floor(S.van/25))+(S.dothi?1:0);
let zoneReach=null;
function zoneSpot(p){ // ô trong rừng trú ẩn đi tới được từ làng, gần p nhất
  if(!zoneReach)zoneReach=bfs(43,50);let best=null,bd=1e9;
  for(let y=ZONE.y0;y<=ZONE.y1;y++)for(let x=ZONE.x0;x<=ZONE.x1;x++)if(zoneReach[y*W+x]!==-2){const d=Math.hypot(x+.5-p.x,y+.5-p.y);if(d<bd){bd=d;best=[x+.5,y+.5]}}
  return best}
function reachSafe(p){p.st='safe';p.path=null;floatAt(p.name+' đã an toàn',p.x,p.y,'#9fcaa9');p.spot=[ZONE.x0+.8+Math.random()*(ZONE.x1-ZONE.x0-.6),ZONE.y0+1+Math.random()*(ZONE.y1-ZONE.y0-2)]}
// Chỗ giặc lục lọi khi không có ai để đuổi: sân các nhà, kho thóc, đình, ruộng.
const LOOT=[[43.5,51.5],[47.5,51.2],[52.5,51],[36.5,38.5],[34.5,38.5],[44.5,44.5],[40.5,46.5],[49.5,46],[38.5,52.5],[46.5,56.5]];
function pickLoot(e){let p;do p=LOOT[Math.floor(Math.random()*LOOT.length)];while(e.loot&&p===e.loot&&LOOT.length>1);e.lootT=1+Math.random()*2.5;return p}
/* Vị trí riêng của mỗi tên giặc quanh một điểm (đuốc, chỗ lục lọi), để chúng dàn ra thay vì dồn vào một chỗ.
   spin: đi vòng quanh điểm ấy (quanh đuốc: dáo dác tìm quân mai phục). */
function around(p,e,r,spin=0){if(e.slot==null)e.slot=Math.random()*Math.PI*2;const a=e.slot+spin*(MG.T-MG.t),x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;
  return okEnemy(Math.floor(x),Math.floor(y))&&!inZone(x,y)?{x,y}:p}
/* Giặc đứng gần nhau quá thì đẩy nhau ra (không vào ô cấm, không vào rừng). */
function separate(en){const R=.7;
  for(let i=0;i<en.length;i++)for(let j=i+1;j<en.length;j++){const a=en[i],b=en[j];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=R)continue;
    if(d<1e-3){dx=Math.cos(i+j);dy=Math.sin(i+j);d=1}const k=(R-d)/2/d;
    for(const [o,s] of [[a,-1],[b,1]]){const nx=o.x+s*dx*k,ny=o.y+s*dy*k;if(okEnemy(Math.floor(nx),Math.floor(ny))&&(o.st==='flee'||!inZone(nx,ny))){o.x=nx;o.y=ny}}}}
const FIRES=[[53.5,21.6],[24.5,20.2],[48.5,21.2]];
export function startClimax(){
  const v=[],add=(id,name,x,y,look,slow)=>v.push({id,name,x,y,look,st:'wait',slow:slow||1,walk:0,dir:'down'});
  add('me','Mẹ',45.5,50.4,{id:'me_gia'},.85);
  if(S.cha)add('cha','Cha',42.5,56.4,{id:'cha_gia'},.85);
  add('batu','Bà Tư',52.4,49.9,{id:'batu'},.75);
  if(S.ev.thao&&S.thao!=='gone'){const p=S.thao==='wife'?[47.4,50.7]:S.thao==='co'?[36.4,49.7]:[49.3,50.6];add('thao','Thảo',p[0],p[1],LOOK_THAO)}
  if(S.child)add('sen','Bé Sen',46.6,51.7,{id:'sen',kid:true},.8);
  add('ly','Cụ lý trưởng',35.8,36.9,{id:'ly'},.8);
  const sk=[[42.3,50.3],[44.9,50.3],[33.4,37.4],[35.3,37.5]];if(S.flags.duyet==='giu')sk.push([43.6,51.4]);
  const al=[];
  if(S.co==='village')al.push({id:'co',name:'Cò',x:38.5,y:45.2,look:{id:'co_do'},hp:S.rel.co>=4?6:4,dmg:1,cd:0,sp:4,inv:0,dir:'down',walk:0});
  // trai làng: theo Đức (src/stats.js), thêm một nếu giữ được đê 1270, một nếu theo đường nông; nói "hòa" thì bớt một; tối đa 4
  const nLang=Math.min(4,traiFromDuc()+(S.flags.de==='saved'?1:0)+(S.path==='nong'?1:0)-(S.flags.dh==='hoa'?1:0));
  for(let i=0;i<Math.max(0,nLang);i++)al.push({id:'trai'+i,name:'Trai làng',x:39+i*2,y:44.6,look:{id:'trai'},hp:4,dmg:1,cd:0,sp:3.6,inv:0,dir:'down',walk:0});
  const maxhp=4+(S.path==='vo'?2:0)+(S.flags.train==='top'?1:0)+voHp();
  setMG({type:'climax',T:150,t:150,hp:maxhp,maxhp,v,sk:sk.map(([x,y])=>({x,y,st:'wait'})),carry:null,en:[],al,spawnT:3,decoy:null,decoys:torches(),cd:0,inv:0,slash:0,kills:0,ngu:false,nLang:Math.max(0,nLang),
    hideNPC:true,update:clUpdate,findTarget:clTarget,draw:clDraw,hud:clHud,post:nightPost,key:clKey,speedMul:()=>MG.carry?(S.path==='nong'?.92:.74):1});
  // những gì đã lo trước (src/prep.js): người, thóc đã ở sẵn trong rừng; trai làng có giáo
  lifeClimax(MG.al);
  prepClimax(MG.v,MG.sk,MG.al,o=>{o.st='safe';o.x=ZONE.x0+1.2+Math.random()*4;o.y=ZONE.y0+1.5+Math.random()*10;if(o.look)o.spot=[o.x,o.y]});
  S.x=43.5;S.y=50.6;P.dir='down';document.body.classList.add('mg');
  setKeys(`<span><kbd>Space</kbd> đánh</span><span><kbd>E</kbd> ${S.path==='van'?'chỉ đường':'dẫn người'} · vác thóc</span>${MG.decoys?'<span><kbd>Q</kbd> đuốc nghi binh</span>':''}<span><kbd>Shift</kbd> chạy</span>`);
  toast(al.length?`${al.map(a=>a.name).filter((x,i,a)=>a.indexOf(x)===i).join(', ')} cầm gậy chạy ra đứng cạnh bạn.`:'Không ai trong làng đứng ra cùng bạn. Bạn phải tự xoay xở.',4600);
  if(S.path==='van'){const n=MG.decoys,M=MG;setTimeout(()=>{if(MG===M)toast(`Dân làng tin người có chữ: bấm E để chỉ đường, họ tự tìm vào rừng. Bạn có ${n} cây đuốc nghi binh (Q).`,6000)},4800)}
}
const pDmg=()=>1+(S.path==='vo'?1:0)+(has('Kiếm sắt')?1:0)+voDmg();
function clKey(k){if(k===' '){clAttack();return true}if(k==='q'&&MG.decoys>0){if(inZone(S.x,S.y)){toast('Trong rừng giặc không dám vào, cắm đuốc ở đây chẳng dụ được ai. Ra ngoài làng mà cắm.');return true}MG.decoys--;MG.decoy={x:S.x,y:S.y,t:TORCH_T};toast('Bạn cắm đuốc, hò hét giả làm quân mai phục. Giặc kéo về phía ánh lửa!');return true}return false}
function clAttack(){const M=MG;if(M.cd>0)return;M.cd=(S.path==='vo'?.3:.45)*(voFast()?.8:1);M.slash=.15;M.swing=.24;
  // có giặc trong tầm thì tự quay mặt về tên gần nhất, khỏi phải bấm hướng trước
  let near=null,nd=1.6;for(const e of M.en){if(e.dead)continue;const d=Math.hypot(e.x-S.x,e.y-S.y);if(d<nd){nd=d;near=e}}if(near)P.dir=dirOf(near.x-S.x,near.y-S.y);
  const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[P.dir];
  for(const e of M.en){if(e.dead)continue;const dx=e.x-S.x,dy=e.y-S.y,d=Math.hypot(dx,dy);if(d<1.6&&(d<.8||(dx*v[0]+dy*v[1])/d>.2))hitEnemy(e,pDmg(),S.x,S.y)}}
function hitEnemy(e,dmg,fx,fy){e.hp-=dmg;const d=Math.hypot(e.x-fx,e.y-fy)||1,kx=e.x+(e.x-fx)/d*.6,ky=e.y+(e.y-fy)/d*.6;if(okEnemy(Math.floor(kx),Math.floor(ky))){e.x=kx;e.y=ky}e.flash=.15;e.stun=.8;
  if(e.hp<=0){e.dead=true;MG.kills++;if(e.cap){e.cap.st='wait';e.cap.x=e.x;e.cap.y=e.y;floatAt('Cứu được '+e.cap.name+'!',e.x,e.y,'#9fcaa9');e.cap=null}}}
function spawnEnemy(){const M=MG,pts=[[53.5,21.8],[24.5,20.4]];
  if(S.flags.tolich!=='done')for(let k=0;k<10;k++){const x=30+Math.floor(Math.random()*30),y=tolichY(x)-2.4;if(walkable(x,Math.floor(y))){pts.push([x+.5,y]);break}}
  if(M.T-M.t>40)pts.push([79.5,31.5]);
  const p=pts[Math.floor(Math.random()*pts.length)],ky=Math.random()<.25;
  M.en.push({x:p[0],y:p[1],home:p,hp:ky?3:2,sp:ky?3:2.1,ky,st:'hunt',cap:null,walk:0,dir:'down',flash:0,dead:false})}
export const dirOf=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
function clUpdate(dt){
  const M=MG;M.t-=dt;M.cd=Math.max(0,M.cd-dt);M.inv=Math.max(0,M.inv-dt);M.slash=Math.max(0,M.slash-dt);M.swing=Math.max(0,(M.swing||0)-dt);
  if(M.decoy){M.decoy.t-=dt;if(M.decoy.t<=0)M.decoy=null}
  if(!M.ngu&&M.t>8){M.spawnT-=dt;if(M.spawnT<=0){if(M.en.length<9)spawnEnemy();M.spawnT=Math.max(1.9,4.4-(M.T-M.t)*.018)}}
  if(!M.ngu&&S.nguMet&&M.t<=45){M.ngu=true;for(let i=0;i<4;i++)M.al.push({id:'quan'+i,name:i?'Quân Trần':'Phạm Ngũ Lão',x:79+i*.6,y:31.2+(i%2)*.6,look:{id:i?'quan':'ngu_tuong'},hp:99,dmg:3,cd:0,sp:6,inv:0,quan:true,dir:'left',walk:0});
    toast(S.flags.nguKnows?'Tiếng tù và! Phạm Ngũ Lão dẫn quân đến. Ông nhận ra bạn từ buổi tập trận năm nào!':'Tiếng tù và! Một đội quân áo đỏ phi đến. Người đi đầu chính là anh Ngũ ngồi đọc sách bên đường năm xưa!',5600)}
  let lead={x:S.x,y:S.y};
  for(const p of M.v){
    if(p.st==='follow'){
      // giặc ở gần (không phải tên đang chạy về): đứng lại, lùi ra xa, không đi thẳng vào giữa trận
      let en=null,ed=1.2;for(const e of M.en)if(!e.dead&&!e.cap&&e.st!=='flee'){const q=Math.hypot(e.x-p.x,e.y-p.y);if(q<ed){ed=q;en=e}}
      if(en){const q=ed||1,m=Math.min(1.2-ed,2.2*dt);p.x+=(p.x-en.x)/q*m;p.y+=(p.y-en.y)/q*m;p.moving=true;p.walk+=dt*8;p.dir=dirOf(en.x-p.x,en.y-p.y);lead=p;continue}
      const d=Math.hypot(lead.x-p.x,lead.y-p.y);if(d>.9){const m=Math.min(d-.85,4.3*p.slow*(followFast()?1.15:1)*dt);p.x+=(lead.x-p.x)/d*m;p.y+=(lead.y-p.y)/d*m;p.moving=true;p.walk+=dt*8;p.dir=dirOf(lead.x-p.x,lead.y-p.y)}else p.moving=false;lead=p;
      if(inZone(p.x,p.y))reachSafe(p)}
    else if(p.st==='self'){const st=p.dest&&nextStep(p,p.dest[0],p.dest[1],okAlly,M.T-M.t);
      if(st){const sx=st[0]-p.x,sy=st[1]-p.y,sd=Math.hypot(sx,sy)||1,m=Math.min(sd,4.3*p.slow*SELF_SPEED*dt);p.x+=sx/sd*m;p.y+=sy/sd*m;p.moving=true;p.walk+=dt*8;p.dir=dirOf(sx,sy)}else p.moving=false;
      if(inZone(p.x,p.y))reachSafe(p)}
    else if(p.st==='safe'){const d=Math.hypot(p.spot[0]-p.x,p.spot[1]-p.y);if(d>.1){const m=Math.min(d,2*dt);p.x+=(p.spot[0]-p.x)/d*m;p.y+=(p.spot[1]-p.y)/d*m;p.moving=true;p.walk+=dt*8;p.dir=dirOf(p.spot[0]-p.x,p.spot[1]-p.y)}else{p.moving=false;p.dir='right'}}
    else p.moving=false}
  if(M.carry&&inZone(S.x,S.y)){M.carry.st='safe';M.carry.x=ZONE.x0+1.2+Math.random()*4;M.carry.y=ZONE.y0+1.5+Math.random()*10;M.carry=null;floatText('Đã giấu thóc!','#e2bf72')}
  for(const e of M.en){if(e.dead)continue;e.flash=Math.max(0,e.flash-dt);e.stun=Math.max(0,(e.stun||0)-dt);let tx,ty;
    if(e.cap||e.st==='flee'||M.ngu){e.st='flee';e.tgt=null;tx=e.home[0];ty=e.home[1]}
    else{let tg=null;
      if(M.decoy&&!inZone(M.decoy.x,M.decoy.y)&&Math.hypot(M.decoy.x-e.x,M.decoy.y-e.y)<11)tg=around(M.decoy,e,1.6,.7);
      else{let best=1e9;for(const p of M.v)if(p.st==='wait'||p.st==='follow'||p.st==='self'){const d=Math.hypot(p.x-e.x,p.y-e.y);if(d<best){best=d;tg=p}}
        // bạn đã vào rừng thì giặc thôi đuổi (giặc không dám theo vào rừng)
        if(!inZone(S.x,S.y)&&(!tg||Math.hypot(S.x-e.x,S.y-e.y)<best*1.2))tg={x:S.x,y:S.y};
        for(const a of M.al)if(!a.down&&!a.quan&&!inZone(a.x,a.y)&&Math.hypot(a.x-e.x,a.y-e.y)<1.2)tg=a}
      if(!tg){ // không còn ai ngoài rừng để đuổi: đi lục lọi trong làng, dừng lại một lúc ở mỗi chỗ
        if(!e.loot)e.loot=pickLoot(e);
        else if(Math.hypot(e.loot[0]-e.x,e.loot[1]-e.y)<.6&&(e.lootT-=dt)<=0)e.loot=pickLoot(e);
        tg=around({x:e.loot[0],y:e.loot[1]},e,.9)}
      else e.loot=null;
      e.tgt=tg;tx=tg.x;ty=tg.y}
    const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);
    if(d>.05){const st=nextStep(e,tx,ty,okEnemy,M.T-M.t);if(st){const sx=st[0]-e.x,sy=st[1]-e.y,sd=Math.hypot(sx,sy)||1,m=Math.min(sd,e.sp*dt*(e.st==='flee'?1.15:1)*(wading(e)?.5:1)),nx=e.x+sx/sd*m,ny=e.y+sy/sd*m;if(!(inZone(nx,ny)&&e.st!=='flee')){e.x=nx;e.y=ny}e.walk+=dt*9;e.dir=dirOf(sx,sy)}}
    // kẹt (đứng im lâu mà chưa tới nơi): tìm đường lại; đang đi lục lọi thì đổi chỗ
    if(d>1.2&&e.lx!=null&&Math.hypot(e.x-e.lx,e.y-e.ly)<.004){if((e.stuck=(e.stuck||0)+dt)>1.2){e.stuck=0;e.path=null;if(e.loot)e.loot=pickLoot(e)}}else e.stuck=0;
    e.lx=e.x;e.ly=e.y;e.swing=Math.max(0,(e.swing||0)-dt);
    if(e.cap){e.cap.x=e.x+.45;e.cap.y=e.y+.15}
    if(e.st==='flee'&&d<.3){e.dead=true;if(e.cap){e.cap.st='lost';toast(e.cap.name+' đã bị giặc bắt đi mất...',4200);e.cap=null}continue}
    if(e.st!=='flee'){
      if(e.stun<=0)for(const p of M.v)if((p.st==='wait'||p.st==='self'||(p.st==='follow'&&e.tgt===p))&&Math.hypot(p.x-e.x,p.y-e.y)<.55){p.st='cap';p.path=null;e.cap=p;e.st='flee';toast(p.name+' bị giặc bắt! Đuổi theo đánh hạ tên lính để cứu.',3800);break}
      if(!e.cap&&M.inv<=0&&Math.hypot(S.x-e.x,S.y-e.y)<.6){M.hp--;M.inv=1.1;e.swing=.3;e.dir=dirOf(S.x-e.x,S.y-e.y);const kd=Math.hypot(S.x-e.x,S.y-e.y)||1,nx=S.x+(S.x-e.x)/kd*.9,ny=S.y+(S.y-e.y)/kd*.9;if(canStand(nx,ny)){S.x=nx;S.y=ny}
        if(M.carry){M.carry.st='wait';M.carry.x=S.x;M.carry.y=S.y;M.carry=null;toast('Bạn bị đánh trúng, đánh rơi bao thóc!')}floatText('−1 máu','#e07f6b')}
      for(const a of M.al)if(!a.down&&!a.quan&&a.inv<=0&&Math.hypot(a.x-e.x,a.y-e.y)<.6){a.hp--;a.inv=1;e.swing=.3;e.dir=dirOf(a.x-e.x,a.y-e.y);if(a.hp<=0){a.down=true;toast(a.name+' bị thương nặng, ngã xuống!',3800)}}}}
  M.en=M.en.filter(e=>!e.dead);
  separate(M.en);
  for(const a of M.al){if(a.down)continue;a.cd=Math.max(0,a.cd-dt);a.inv=Math.max(0,a.inv-dt);a.slash=Math.max(0,(a.slash||0)-dt);a.swing=Math.max(0,(a.swing||0)-dt);let tg=null,best=a.quan?60:9;
    for(const e of M.en){const d=Math.hypot(e.x-a.x,e.y-a.y);if(d<best&&(a.quan||Math.hypot(e.x-42,e.y-44)<15)){best=d;tg=e}}
    const tx=tg?tg.x:S.x+(a.id==='co'?-1.3:1.3),ty=tg?tg.y:S.y+.7,dx=tx-a.x,dy=ty-a.y,d=Math.hypot(dx,dy);
    a.moving=false;if(d>(tg?.7:1)){const st=nextStep(a,tx,ty,okAlly,M.T-M.t);if(st){const fin=st[0]===tx&&st[1]===ty,sx=st[0]-a.x,sy=st[1]-a.y,sd=Math.hypot(sx,sy)||1,m=Math.min(sd-(fin?.6:0),a.sp*dt);if(m>0){a.x+=sx/sd*m;a.y+=sy/sd*m;a.moving=true;a.walk+=dt*9;a.dir=dirOf(sx,sy)}}}
    if(tg&&d<1.1&&a.cd<=0){a.cd=a.quan?.5:.9;a.slash=.15;a.swing=.24;a.dir=dirOf(dx,dy);hitEnemy(tg,a.dmg,a.x,a.y)}}
  M.en=M.en.filter(e=>!e.dead);
  if(M.hp<=0)return finishClimax('down');
  if(M.t<=0)return finishClimax('dawn');
  if(M.v.every(p=>p.st==='safe'||p.st==='lost')&&M.sk.every(s=>s.st==='safe')&&inZone(S.x,S.y))finishClimax('done');
}
function clTarget(){const M=MG;let best=1.4,t=null;
  for(const p of M.v)if(p.st==='wait'){const d=Math.hypot(p.x-S.x,p.y-S.y);if(d<best){best=d;t=S.path==='van'?{label:'Chỉ đường cho '+p.name+' vào rừng',act:()=>{p.st='self';p.path=null;p.dest=zoneSpot(p);floatAt(p.name+' tự tìm đường vào rừng',p.x,p.y,'#9fcaa9')}}
        :{label:'Dẫn '+p.name+' đi',act:()=>{p.st='follow';floatAt(p.name+' đi theo bạn',p.x,p.y,'#9fcaa9')}}}}
  if(!M.carry)for(const s of M.sk)if(s.st==='wait'){const d=Math.hypot(s.x-S.x,s.y-S.y);if(d<best){best=d;t={label:'Vác bao thóc',act:()=>{s.st='carry';M.carry=s}}}}
  return t}
function torchFx(x,y,big){const sx=Math.round(x*TS),sy=Math.round(y*TS);ctx.fillStyle='#5a3f25';ctx.fillRect(sx*Z-camX,(sy-10)*Z-camY,Z,10*Z);
  const n=big?14:6;for(let i=0;i<n;i++){const ph=(clock*3+i*.29)%1,fx=sx-(big?5:2)+Math.floor(Hs(i,3,9)*(big?10:5)),fy=sy-12-Math.floor(ph*(big?14:7));ctx.fillStyle=ph<.4?'#ffe08a':ph<.7?'#f2913a':'#b8322a';ctx.fillRect(fx*Z-camX,fy*Z-camY,Z*(big?2:1),Z*(big?2:1))}}
function slashFx(x,y,dir){const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir],cx=Math.round((x+v[0]*.8)*TS),cy=Math.round((y-.5+v[1]*.7)*TS);ctx.fillStyle='rgba(255,255,240,.85)';
  for(let i=-4;i<=4;i++){const px=v[0]?cx+v[0]*Math.round(4-Math.abs(i)*.6):cx+i*2,py=v[1]?cy+v[1]*Math.round(4-Math.abs(i)*.6):cy+i*2;ctx.fillRect(px*Z-camX,py*Z-camY,Z*2,Z*2)}}
const enLook=e=>({id:e.ky?'giac_ky':'giac'});
/* khung vẽ: đang chém thì vung lên rồi chém xuống (swing đếm ngược), không thì bước đi */
const swingFr=(o,t)=>o.swing>t?'a0':'a1';
function clDraw(list){const M=MG,fr=o=>o.swing>0?swingFr(o,.17):o.moving?[1,0,2,0][Math.floor(o.walk)%4]:0;
  for(const f of FIRES)list.push({y:f[1],f:()=>torchFx(f[0],f[1],true)});
  for(const t of [[ZONE.x0+.5,ZONE.y0+.5],[ZONE.x1+.5,ZONE.y0+.5],[ZONE.x0+.5,ZONE.y1+.5],[ZONE.x1+.5,ZONE.y1+.5],[ZONE.x1+.5,(ZONE.y0+ZONE.y1)/2]])list.push({y:t[1],f:()=>torchFx(t[0],t[1])});
  for(const s of M.sk)if(s.st!=='carry')list.push({y:s.y,f:()=>{drawSprite(sackSprite(),s.x,s.y);if(s.st==='wait')mark(s.x,s.y-.9,'#e2bf72')}});
  for(const p of M.v){if(p.st==='lost')continue;list.push({y:p.y,f:()=>{shadow(p.x,p.y,10);drawSprite(personSprite(p.look,p.dir,fr(p)),p.x,p.y);if(p.st==='wait')mark(p.x,p.y-(isKid(p.look)?1.6:2.1),'#e2bf72');if(p.st==='cap')mark(p.x,p.y-1.75,'#e07f6b')},lab:p.st!=='safe'&&Math.hypot(p.x-S.x,p.y-S.y)<4?[p.name,p.x,p.y-(isKid(p.look)?1.55:2)]:null})}
  for(const e of M.en)list.push({y:e.y,f:()=>{shadow(e.x,e.y,10);if(e.flash>0)ctx.globalAlpha=.45;drawSprite(personSprite(enLook(e),e.dir,e.swing>0?swingFr(e,.2):[1,0,2,0][Math.floor(e.walk)%4]),e.x,e.y);ctx.globalAlpha=1}});
  for(const a of M.al)list.push({y:a.y,f:()=>{shadow(a.x,a.y,10);if(a.down)ctx.globalAlpha=.5;drawSprite(personSprite(a.look,a.down?'down':a.dir,a.down?0:fr(a)),a.x,a.y);ctx.globalAlpha=1;if(a.slash>0)slashFx(a.x,a.y,a.dir)},lab:Math.hypot(a.x-S.x,a.y-S.y)<4?[a.name+(a.down?' (bị thương)':''),a.x,a.y-2]:null});
  if(M.carry)list.push({y:S.y+.01,f:()=>drawSprite(sackSprite(),S.x,S.y-1.55)});
  if(M.decoy)list.push({y:M.decoy.y,f:()=>torchFx(M.decoy.x,M.decoy.y,true)});
  if(M.slash>0)list.push({y:S.y+.02,f:()=>slashFx(S.x,S.y,P.dir)});
  list.push({y:ZONE.y0,f:()=>{},lab:Math.hypot(ZONE.x1-S.x,ZONE.y0+5-S.y)<9?['Bìa rừng · nơi an toàn',(ZONE.x0+ZONE.x1+1)/2,ZONE.y0-.2]:null});
}
let darkC=null;
function nightPost(){const M=MG;if(!darkC)darkC=document.createElement('canvas');if(darkC.width!==VW||darkC.height!==VH){darkC.width=VW;darkC.height=VH}
  const g=darkC.getContext('2d'),k=Math.min(1,M.t/25);g.globalCompositeOperation='source-over';g.clearRect(0,0,VW,VH);g.fillStyle=`rgba(8,12,32,${.74*k+.08})`;g.fillRect(0,0,VW,VH);
  g.globalCompositeOperation='destination-out';
  const hole=(x,y,r)=>{const sx=x*T-camX,sy=(y-.7)*T-camY;if(sx<-r||sy<-r||sx>VW+r||sy>VH+r)return;const gr=g.createRadialGradient(sx,sy,r*.2,sx,sy,r);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(sx-r,sy-r,r*2,r*2)};
  hole(S.x,S.y,240);for(const f of FIRES)hole(f[0],f[1],200);hole(ZONE.x0+.5,ZONE.y0+.5,110);hole(ZONE.x1+.5,ZONE.y0+.5,110);hole(ZONE.x0+.5,ZONE.y1+.5,110);hole(ZONE.x1+.5,ZONE.y1+.5,110);hole(ZONE.x1+.5,(ZONE.y0+ZONE.y1)/2,110);if(M.decoy)hole(M.decoy.x,M.decoy.y,220);
  g.globalCompositeOperation='source-over';ctx.drawImage(darkC,0,0,VW,VH);
  if(M.t<25){ctx.fillStyle=`rgba(255,165,110,${.14*(1-k)})`;ctx.fillRect(0,0,VW,VH)}}
function clHud(){const M=MG,w=Math.min(460,VW-32),x=Math.round(VW/2-w/2);hudBox(x,16,w,64);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#e2bf72';ctx.fillText('Trời sáng sau',x+12,32);hudBar(x+110,26,w-122,M.t/M.T,'#d08a54');
  for(let i=0;i<M.maxhp;i++){ctx.fillStyle=i<M.hp?'#e07f6b':'#3b443d';ctx.fillRect(x+12+i*16,50,12,12)}
  const sv=M.v.filter(p=>p.st==='safe').length,ss=M.sk.filter(s=>s.st==='safe').length;
  ctx.fillStyle='#efe8d4';ctx.textAlign='right';ctx.fillText(`Người an toàn ${sv}/${M.v.length} · Thóc ${ss}/${M.sk.length}${MG.decoys?` · Đuốc ${MG.decoys}`:''}`,x+w-12,56)}
export function finishClimax(reason){const M=MG;setMG(null);setKeys();document.body.classList.remove('mg');S.pending=null;
  const allyUp=M.al.some(a=>!a.down);
  /* Bị bắt mà chưa cứu lại thì mất. Người đang đi theo bạn lúc bạn ngã xuống, không ai đỡ, thì bị bắt.
     Người chưa dẫn hoặc đang tự đi thì kẹt lại trong làng: thoát nạn nhưng nhà cửa bị đốt. */
  for(const p of M.v)if(p.st==='cap')p.st='lost';else if(p.st==='follow')p.st=reason==='down'&&!allyUp?'lost':'left';else if(p.st==='wait'||p.st==='self')p.st='left';
  const res={reason,saved:M.v.filter(p=>p.st==='safe').map(p=>p.name),left:M.v.filter(p=>p.st==='left').map(p=>p.name),lost:M.v.filter(p=>p.st==='lost').map(p=>p.name),
    thoc:M.sk.filter(s=>s.st==='safe').length,thocT:M.sk.length,kills:M.kills,coDown:M.al.some(a=>a.id==='co'&&a.down),coThere:M.al.some(a=>a.id==='co'),nLang:M.nLang,ngu:M.ngu};
  S.res=res;
  const rescuer=M.ngu?'quân của Phạm Ngũ Lão':M.al.some(a=>a.id==='co'&&!a.down)?'Cò':allyUp?'trai làng':'mấy người làng liều mình quay lại';
  const lead={down:`<p>Một nhát giáo sượt qua, bạn ngã xuống bờ ruộng. Lúc mở mắt ra, ${rescuer} đã kéo bạn vào bìa rừng.</p>`,dawn:'<p>Trời hửng sáng. Tiếng tù và của giặc vang lên gọi quân rút về phía bến sông.</p>',done:res.lost.length?`<p>Những người còn lại đã vào rừng, bao thóc cuối cùng đã giấu kỹ. Bạn đứng ở bìa rừng, nhìn về phía làng đang cháy, nghĩ đến ${res.lost.join(', ')} đã bị giặc bắt đi.</p>`:'<p>Người cuối cùng đã vào rừng, bao thóc cuối cùng đã giấu kỹ. Bạn đứng ở bìa rừng, nhìn về phía làng đang cháy.</p>'}[reason];
  showModal({kicker:'Rạng sáng ngày 12 tháng giêng',title:reason==='done'?(res.lost.length?'Rút vào rừng':'Không bỏ lại ai'):reason==='down'?'Ngã xuống':'Bình minh',body:lead+
    `<p><b>An toàn trong rừng:</b> ${res.saved.join(', ')||'không ai'}.</p>${res.left.length?`<p><b>Kẹt lại trong làng</b> (thoát nạn nhưng nhà cửa bị đốt): ${res.left.join(', ')}.</p>`:''}${res.lost.length?`<p><b>Bị giặc bắt đi:</b> ${res.lost.join(', ')}.</p>`:''}<p>Thóc giấu được ${res.thoc}/${res.thocT} bao. Bạn và mọi người đánh hạ ${res.kills} tên giặc.${res.coDown?' Cò bị thương nặng nhưng còn sống.':''}</p>`,
    choices:[{label:'Nhìn lại cuộc đời',fn:()=>endChapter(res)}]});
  save()}

function endChapter(res){
  res=res||S.res||{saved:[],left:[],lost:[],thoc:0,thocT:4,kills:0};
  S.ended=true;save();const F=S.flags,L=[];
  L.push({but:'Năm một tuổi, bạn bốc cây bút lông.',kiem:'Năm một tuổi, bạn bốc thanh kiếm gỗ.',lua:'Năm một tuổi, bạn bốc bông lúa.',hat:'Năm một tuổi, bạn bốc chuỗi tràng hạt.'}[S.toi]||'');
  if(F.dieu)L.push(F.dieu==='di'?'Năm 8 tuổi trốn học thả diều với Cò, bị mẹ phạt quỳ, đổi lại một người bạn thân.':'Năm 8 tuổi ở lại học bài, Cò giận mất mấy hôm.');
  L.push(F.de==='saved'?'Năm nước to 1270, bạn cùng trai làng giữ được đê. Làng nhớ ơn đến tận bây giờ.':F.de==='lost'?'Năm nước to 1270, bạn ra đê nhưng không giữ nổi. Cả làng mất mùa.':F.de==='home'?'Năm nước to 1270, bạn ở nhà giữ đồ đạc, để mặc đê làng vỡ.':'');
  if(S.path==='van')L.push(F.exam==='pass'||F.exam==='khoe'?`Năm 1275 đỗ Thái học sinh${F.exam==='khoe'?', nhưng để bạn cũ đứng ngoài ngõ':''}.`:'Năm 1275 lều chõng đi thi nhưng không đỗ.');
  if(S.path==='vo')L.push(F.train==='top'?'Năm 1283 đứng đầu buổi tập trận'+(F.nguKnows?', được Phạm Ngũ Lão nhớ mặt.':'.'):F.train==='ok'?'Năm 1283 tập trận đạt yêu cầu.':'Năm 1283 tập trận còn vụng về.');
  if(S.ev.thao)L.push(S.thao==='wife'?`Bạn cưới Thảo${S.child?', có bé Sen':''}${F.vay?', nhà phải vay tiền làm sính lễ':''}.`:S.thao==='co'?(F.rival?'Bạn nói lời thương nhưng Thảo chọn Cò.':'Bạn nhường Thảo cho Cò'+(F.cuoiCo==='vang'?', rồi không đến dự đám cưới.':', và làm phù rể cho bạn mình.')):'Thảo theo chồng về làng bên, không ai giữ lại.');
  if(F.daumua)L.push(F.daumua==='mat'?'Năm dịch đậu mùa, bạn mải lo việc riêng. Cha mất cuối xuân Mậu Dần.':F.daumua==='cham'?'Năm dịch đậu mùa, bạn bỏ hết mọi việc ở nhà chăm cha. Cha qua khỏi.':'Năm dịch đậu mùa, bạn lên kinh mua thuốc cứu được cha.');
  if(F.tang)L.push(F.tang==='lo'?'Thầy đồ Chu mất, bạn đứng ra lo tang cho thầy.':'Thầy đồ Chu mất, bạn chỉ gửi chút tiền phúng viếng.');
  if(S.co==='army')L.push('Bạn tiễn Cò theo cờ "Phá cường địch, báo hoàng ân" của Hoài Văn hầu.');else if(F.coStay)L.push('Bạn khuyên Cò ở lại giữ làng'+(res.coThere?', và đêm ấy Cò đứng cạnh bạn.':'.'));
  if(F.tolich)L.push(F.tolich==='done'?'Bạn cùng làng vét sông Tô Lịch. Đêm giặc đến, chúng chỉ qua được bằng hai cây cầu.':'Bạn không ra vét sông Tô Lịch. Đêm giặc đến, chúng lội qua được chỗ sông nông.');
  if(F.duyet&&F.duyet!=='the')L.push(F.duyet==='luong'?'Bạn góp lương cho quân của Hưng Đạo Vương.':'Bạn giữ thóc cho nhà, đêm giặc đến có thêm một bao phải cứu.');
  if(F.dh)L.push(F.dh==='danh'?'Trước Diên Hồng, bạn nói "Đánh!".':'Trước Diên Hồng, bạn nói "nên hòa". Trai làng nhớ câu ấy.');
  L.push(...prepChronicle(res.nLang||0));
  L.push(...exploreChronicle());
  L.push(...chainChronicle());
  L.push(S.duc>=60?'Cả làng tin bạn. Đêm giặc đến, trai làng theo bạn đông nhất.':S.duc>=20?'Làng quý bạn. Có việc, người ta sẵn lòng theo.':'Làng ít ai nghe bạn. Đêm giặc đến, bạn phải tự xoay xở nhiều.');
  if(S.nguMet)L.push('Bạn từng ngồi nghe anh Ngũ bàn binh pháp bên đường. Đêm giặc đến, anh ấy dẫn quân tới.');
  const path={van:(S.dothi?'Là Thái học sinh, bạn':'Bạn')+' được giao việc thảo văn thư, theo xa giá triều đình rời Thăng Long khi giặc áp sát.',
    vo:'Như các quân sĩ khác, trên cánh tay bạn thích hai chữ <b>Sát Thát</b> bằng mực. Bạn theo cờ Hưng Đạo Vương ra trận'+(F.nguKnows?', vào đội quân của Phạm Ngũ Lão.':'.'),
    nong:'Bạn dẫn dân làng vào rừng dựng lán, cất giấu lương thực. Giặc đến chỉ thấy làng không.'}[S.path||'nong'];
  const hook=res.lost.length?`Chương hai: ${res.lost.join(', ')} đang trong tay giặc. Bạn phải tìm cách cứu họ, trong khi cuộc kháng chiến dẫn tới trận Bạch Đằng năm 1288.`:'Chương hai: cuộc kháng chiến, dẫn tới trận Bạch Đằng năm 1288.';
  showModal({kicker:'Xuân · Ất Dậu 1285',title:'Hết chương một',
    body:`<p>${path}</p><p class="kicker" style="margin-top:6px">Biên niên đời bạn</p><ul style="margin:0;padding-left:18px;display:grid;gap:4px;line-height:1.5">${L.filter(Boolean).map(x=>`<li>${x}</li>`).join('')}</ul>${(()=>{const t=lifeChronicle();return t.length?`<p class="kicker" style="margin-top:6px">Những chuyện nhỏ</p><p class="note" style="line-height:1.6">${t.map(x=>x[0].toUpperCase()+x.slice(1)).join('. ')}.</p>`:''})()}
     <div class="endstats"><div><b>${S.van}</b><span>Văn</span></div><div><b>${S.vo}</b><span>Võ</span></div><div><b>${S.duc}</b><span>Đức</span></div><div><b>${S.tien}</b><span>quan</span></div></div>
     <p class="note">${S.name}, 27 tuổi.</p><p><span class="seal">Hết chương một</span>&nbsp; ${hook}</p>`,
    choices:[{label:'Bắt đầu một cuộc đời mới',fn:()=>{try{localStorage.removeItem('dvmd-save')}catch(e){}location.reload();return false}}]});
}
