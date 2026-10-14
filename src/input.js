/* ================= input & physics ================= */
import {$,FI,GA,MO,TR,W,WL} from './constants.js';
import {BUILDINGS,SIGNS,bsolid,get,isW} from './map.js';
import {MG,NPCS,P,S,age,npcOn} from './state.js';
import {closeDialog,dialogOpen,floats,modalOpen,mpick,pick,say,toast} from './ui.js';
import {buffaloLabel,buffaloUpdate,doorAction,fieldAction,fishAction,talkBuffalo} from './dialogs.js';
import {dirOf} from './climax.js';
import {playing} from './intro.js';
import {showStats} from './stats.js';

export const keys={};let lastAxis='y';
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'){if(e.key==='Enter'){e.preventDefault();mpick(0)}return}
  const k=e.key.toLowerCase();keys[k]=true;
  if(['a','d','arrowleft','arrowright'].includes(k))lastAxis='x';else if(['w','s','arrowup','arrowdown'].includes(k))lastAxis='y';
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(MG&&MG.modalKey&&modalOpen&&MG.modalKey(k))return;
  if(modalOpen){if(/^[1-9]$/.test(k))mpick(+k-1);return}
  if(dialogOpen){if(/^[1-9]$/.test(k))pick(+k-1);else if(k==='escape')closeDialog();return}
  if(MG&&MG.key&&playing&&MG.key(k))return;
  if(k==='c'&&playing&&!MG){showStats();return}
  if(k==='e'&&playing&&target)target.act();
});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
export function solidAt(px,py){const tx=Math.floor(px),ty=Math.floor(py),t=get(tx,ty);if(isW(t)||t===MO||t===TR||t===WL)return true;if(t===GA&&age()<12)return true;return bsolid[ty*W+tx]===1}
export function canStand(x,y){const r=.28;return!solidAt(x-r,y-.12)&&!solidAt(x+r,y-.12)&&!solidAt(x-r,y+.12)&&!solidAt(x+r,y+.12)}
let target=null,gateWarn=0;
export function update(dt){
  if(!playing||modalOpen||dialogOpen){P.moving=false;return}
  let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
  if(dx&&dy){if(lastAxis==='x')dy=0;else dx=0}
  P.moving=!!(dx||dy);
  if(P.moving){const l=Math.hypot(dx,dy);dx/=l;dy/=l;const sp=(keys.shift?7:4.4)*(.8+.2*Math.min(1,(age()-6)/10))*(MG&&MG.speedMul?MG.speedMul():1)*dt;
    if(Math.abs(dx)>Math.abs(dy))P.dir=dx>0?'right':'left';else P.dir=dy>0?'down':'up';
    const nx=S.x+dx*sp,ny=S.y+dy*sp;if(canStand(nx,S.y))S.x=nx;if(canStand(S.x,ny))S.y=ny;
    P.walk+=dt*(keys.shift?14:9);
    if(age()<12&&get(Math.floor(S.x+dx*.6),Math.floor(S.y+dy*.6))===GA&&performance.now()-gateWarn>4000){gateWarn=performance.now();toast('Lính gác: Trẻ con không được một mình vào kinh. Đợi mười hai tuổi đã.')}
  }
  buffaloUpdate(dt);
  for(const n of NPCS)if(n.wander){n.t=(n.t||0)-dt;if(n.t<=0){n.t=2+Math.random()*3;n.tx=n.home[0]+(Math.random()*4-2);n.ty=n.home[1]+(Math.random()*2-1)}
    const d=Math.hypot(n.tx-n.x,n.ty-n.y);if(d>.05){const nx=n.x+(n.tx-n.x)/d*1.2*dt,ny=n.y+(n.ty-n.y)/d*1.2*dt;n.face=dirOf(n.tx-n.x,n.ty-n.y);if(!solidAt(nx,ny)){n.x=nx;n.y=ny;n.moving=true}else n.tx=n.x}else n.moving=false}
  findTarget();
  if(MG&&MG.update)MG.update(dt);
  for(const f of floats)f.t+=dt;while(floats.length&&floats[0].t>1.6)floats.shift();
}
function setPrompt(){const p=$('prompt');if(target){p.hidden=false;p.innerHTML='<kbd>E</kbd> ';p.append(target.label)}else p.hidden=true}
function findTarget(){
  if(MG&&MG.findTarget){target=MG.findTarget();return setPrompt()}
  target=null;let best=1.5;
  for(const n of NPCS){if(!npcOn(n))continue;const d=Math.hypot(n.x-S.x,n.y-S.y);if(d<best){best=d;target={label:'Nói chuyện với '+n.name,act:()=>n.talk()}}}
  const b=S.buffalo;{const d=Math.hypot(b.x-S.x,b.y-S.y),lab=buffaloLabel();if(lab&&d<best){best=d;target={label:lab,act:talkBuffalo}}}
  for(const sg of SIGNS){const d=Math.hypot(sg.x+.5-S.x,sg.y+1.2-S.y);if(d<best){best=d;target={label:'Đọc biển: '+sg.name,act:()=>say(sg.name,sg.text)}}}
  if(!target)for(const bd of BUILDINGS){if(!['home','cung','chua','dinh','truong','thap'].includes(bd.id))continue;const dx=bd.x+Math.floor(bd.w/2)+.5,dy=bd.y+bd.h+.3;if(Math.hypot(dx-S.x,dy-S.y)<1.3){target={label:bd.id==='home'?'Vào nhà':'Xem '+bd.name,act:()=>doorAction(bd)};break}}
  if(!target&&get(Math.floor(S.x),Math.floor(S.y))===FI&&age()>=8)target={label:'Làm đồng  (−1 Sức)',act:fieldAction};
  if(!target){const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[P.dir];if(isW(get(Math.floor(S.x+v[0]*.9),Math.floor(S.y+v[1]*.9))))target={label:'Câu cá  (−1 Sức)',act:fishAction}}
  setPrompt();
}
