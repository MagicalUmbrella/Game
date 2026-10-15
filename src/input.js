/* ================= input & physics ================= */
import {mocFlush} from './moc.js';
import {$,FI,GA,MO,TR,W,WL} from './constants.js';
import {FERRIES,REGIONS,locked,regionId,regionOpen} from './world.js';
import {campSolid} from './trai.js';
import {startFerry} from './thuyen.js';
import {toggleWorldMap,worldMapOpen} from './render.js';
import {BUILDINGS,SIGNS,bsolid,get,isW} from './map.js';
import {MG,NPCS,P,S,age,npcOn} from './state.js';
import {closeDialog,dialogOpen,floats,modalOpen,mpick,pick,renderHUD,say,toast,toggleQuests} from './ui.js';
import {buffaloLabel,buffaloUpdate,doorAction,fieldMenu,fishAction,goSleep,talkBuffalo} from './dialogs.js';
import {dirOf} from './climax.js';
import {playing} from './intro.js';
import {showStats} from './stats.js';
import {exploreTarget} from './explore.js';
import {step4} from './pathfind.js';

function keyName(e){const c=e.code||'';
  return c==='Space'?' ':/^Key[A-Z]$/.test(c)?c.slice(3).toLowerCase():/^Digit\d$/.test(c)?c.slice(5):/^Arrow/.test(c)?c.toLowerCase():(e.key||'').toLowerCase()}
export const keys={};let lastAxis='y';
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'){if(e.key==='Enter'){e.preventDefault();mpick(0)}return}
  // Lấy phím theo vị trí (e.code): bật bộ gõ tiếng Việt (Unikey, Telex) thì e.key có khi là 'Process' hay chữ đã ghép dấu,
  // làm Space, E, WASD không ăn trong màn chơi.
  const k=keyName(e);keys[k]=true;
  if(['a','d','arrowleft','arrowright'].includes(k))lastAxis='x';else if(['w','s','arrowup','arrowdown'].includes(k))lastAxis='y';
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(MG&&MG.modalKey&&modalOpen){if(e.repeat)return;if(MG.modalKey(k))return}   // giữ phím không tính là bấm nhiều lần
  if(modalOpen){if(/^[1-9]$/.test(k))mpick(+k-1);return}
  if(dialogOpen){if(/^[1-9]$/.test(k))pick(+k-1);else if(k==='escape')closeDialog();return}
  if((k==='m'||(k==='escape'&&worldMapOpen))&&playing){toggleWorldMap();return}   // bản đồ thế giới
  if(worldMapOpen)return;
  if(MG&&MG.key&&playing&&MG.key(k))return;
  if(k==='c'&&playing&&!MG){showStats();return}
  if(k==='j'&&playing){toggleQuests();return}
  if(k==='n'&&playing&&!MG){goSleep();return}   // về nhà ngủ, sang mùa mới
  if(k==='e'&&playing&&target)target.act();
});
addEventListener('keyup',e=>{keys[keyName(e)]=false;keys[(e.key||'').toLowerCase()]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
/* Đêm 1285: lửa chặn ô (MG.blockAt). Đang đứng sẵn trong ô ấy thì vẫn bước ra được. */
export function solidAt(px,py){const tx=Math.floor(px),ty=Math.floor(py),t=get(tx,ty);if(MG&&MG.blockAt&&MG.blockAt(tx,ty)&&!(Math.floor(S.x)===tx&&Math.floor(S.y)===ty))return true;if(isW(t)||t===MO||t===TR||t===WL)return true;if(!(MG&&MG.roam)&&locked(S,tx,ty))return true;   // vùng chưa tới lúc (world.js)
  if(campSolid(tx,ty))return true;   // rào, lều trong doanh trại giặc (trai.js)
  if(t===GA&&age()<12)return true;return bsolid[ty*W+tx]===1}
const solidTerrain=(tx,ty)=>{const t=get(tx,ty);return isW(t)||t===MO||t===TR||t===WL||bsolid[ty*W+tx]===1};
export function canStand(x,y){const r=.28;return!solidAt(x-r,y-.12)&&!solidAt(x+r,y-.12)&&!solidAt(x-r,y+.12)&&!solidAt(x+r,y+.12)}
let target=null,gateWarn=0,lockWarn=-1e9,lastRegion='anphu';
let lastMG=null;
export function update(dt){
  if(MG!==lastMG){lastMG=MG;renderHUD()}   // vào, ra màn chơi riêng: khung việc cần làm đổi theo
  if(!playing||modalOpen||dialogOpen||worldMapOpen){P.moving=false;return}
  mocFlush();   // cảnh nhỏ khi vừa lên mốc chỉ số (moc.js)
  let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
  if(dx&&dy){if(lastAxis==='x')dy=0;else dx=0}
  P.moving=!!(dx||dy);
  if(P.moving){const l=Math.hypot(dx,dy);dx/=l;dy/=l;const sp=(keys.shift?7:4.4)*(.8+.2*Math.min(1,(age()-6)/10))*(MG&&MG.speedMul?MG.speedMul():1)*dt;
    if(Math.abs(dx)>Math.abs(dy))P.dir=dx>0?'right':'left';else P.dir=dy>0?'down':'up';
    const nx=S.x+dx*sp,ny=S.y+dy*sp;if(canStand(nx,S.y))S.x=nx;if(canStand(S.x,ny))S.y=ny;
    P.walk+=dt*(keys.shift?14:9);
    if(!(MG&&MG.roam)&&performance.now()-lockWarn>5000){const lx=Math.floor(S.x+dx*.6),ly=Math.floor(S.y+dy*.6);if(locked(S,lx,ly)&&!solidTerrain(lx,ly)){lockWarn=performance.now();const r=REGIONS[regionId(lx,ly)];toast(r.name+': chưa tới lúc đi xa thế. '+(r.hint||'')+' (Mở ở chương '+(r.ch===2?'hai':'ba')+'.)')}}
    if(age()<12&&get(Math.floor(S.x+dx*.6),Math.floor(S.y+dy*.6))===GA&&performance.now()-gateWarn>4000){gateWarn=performance.now();toast('Lính gác: Trẻ con không được một mình vào kinh. Đợi mười hai tuổi đã.')}
  }
  {const r=regionId(Math.floor(S.x),Math.floor(S.y));if(r!==lastRegion){lastRegion=r;renderHUD()}}   // tên vùng trên bảng trạng thái
  buffaloUpdate(dt);
  for(const n of NPCS)if(n.wander){n.t=(n.t||0)-dt;if(n.t<=0){n.t=2+Math.random()*3;n.tx=n.home[0]+(Math.random()*4-2);n.ty=n.home[1]+(Math.random()*2-1)}
    const d=Math.hypot(n.tx-n.x,n.ty-n.y);if(d>.05){const [mx,my]=step4(n,n.tx,n.ty,1.2*dt),nx=n.x+mx,ny=n.y+my;n.face=dirOf(mx,my);if(!solidAt(nx,ny)){n.x=nx;n.y=ny;n.moving=true}else{n.tx=n.x;n.ty=n.y}}else n.moving=false}
  findTarget();
  if(MG&&MG.update)MG.update(dt);
  for(const f of floats)f.t+=dt;while(floats.length&&floats[0].t>1.6)floats.shift();
}
function setPrompt(){const p=$('prompt');if(target){p.hidden=false;p.innerHTML='<kbd>E</kbd> ';p.append(target.label)}else p.hidden=true}
function findTarget(){
  if(MG&&MG.findTarget){target=MG.findTarget();return setPrompt()}
  target=null;let best=1.5;
  for(const n of NPCS){if(!npcOn(n)||S.res&&S.res.lost&&S.res.lost.includes(n.name))continue;const d=Math.hypot(n.x-S.x,n.y-S.y);if(d<best){best=d;target={label:'Nói chuyện với '+n.name,act:()=>n.talk()}}}
  const b=S.buffalo;{const d=Math.hypot(b.x-S.x,b.y-S.y),lab=buffaloLabel();if(lab&&d<best){best=d;target={label:lab,act:talkBuffalo}}}
  for(const sg of SIGNS){const d=Math.hypot(sg.x+.5-S.x,sg.y+1.2-S.y);if(d<best){best=d;target={label:'Đọc biển: '+sg.name,act:()=>say(sg.name,sg.text)}}}
  {const ex=exploreTarget(best);if(ex){best=ex.d;target=ex}}
  if(S.buffalo.st==='lost'&&S.quests.trau==='active'&&Math.hypot(b.x-S.x,b.y-S.y)<1.5)target={label:buffaloLabel(),act:talkBuffalo};   // đang tìm trâu thì trâu được ưu tiên hơn chỗ khám phá cạnh đó
  if(!target)for(const f of FERRIES)for(const [a,b] of [[f.a,f.b],[f.b,f.a]]){if(target)break;if(Math.hypot(a[0]-S.x,a[1]-S.y)<1.4&&regionOpen(S,regionId(Math.floor(a[0]),Math.floor(a[1])))&&regionOpen(S,regionId(Math.floor(b[0]),Math.floor(b[1]))))target={label:'Đi đò: '+f.name,act:()=>startFerry(f,a,b)}}
  if(!target)for(const bd of BUILDINGS){if(!['home','cung','chua','dinh','truong','thap'].includes(bd.id))continue;const dx=bd.x+Math.floor(bd.w/2)+.5,dy=bd.y+bd.h+.3;if(Math.hypot(dx-S.x,dy-S.y)<1.3){target={label:bd.id==='home'?'Vào nhà':'Xem '+bd.name,act:()=>doorAction(bd)};break}}
  if(!target&&get(Math.floor(S.x),Math.floor(S.y))===FI&&age()>=8)target={label:'Làm đồng',act:fieldMenu};
  if(!target){const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[P.dir];if(isW(get(Math.floor(S.x+v[0]*.9),Math.floor(S.y+v[1]*.9))))target={label:'Câu cá  (−1 Sức)',act:fishAction}}
  setPrompt();
}
