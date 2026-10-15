/* ================= minigame: toán cướp bãi sông (đường võ, đông 1280) ================= */
/* Hư cấu. Đêm đông năm 1280, ba tên cướp dắt trộm con trâu nhà ông Cả Lợi ra bãi sông Hồng, định xuống thuyền
   trốn sang bờ kia. Bạn là hương binh trong làng, nghe trâu rống thì đuổi theo.
   Tên cầm đầu dắt trâu đi thẳng ra thuyền (BOAT), hai tên kia quay lại chặn bạn khi bạn tới gần. Space để đánh
   (tự quay mặt về tên gần nhất, như đêm 1285). Hạ tên cầm đầu trước khi hắn tới thuyền thì giữ được trâu.
   Hắn tới thuyền thì cướp chạy mất; bạn hết máu thì ngã, cướp chạy mất.
   Kết cục ghi S.flags.cuop: 'win' | 'lost' | 'nga'. Giữ được trâu thì ông Cả mang ơn (chuc.js: xaScore cộng thêm). */
import {TS,Z,ctx} from '../constants.js';
import {MG,P,S,has,save,setMG} from '../state.js';
import {floatAt,floatText,gain,setKeys,showModal} from '../ui.js';
import {VW,camX,camY,clock,drawSprite,shadow} from '../render.js';
import {buffaloSprite,personSprite} from '../sprites.js';
import {solidAt,canStand} from '../input.js';
import {nextStep,stepTo} from '../pathfind.js';
import {dirOf,torchFx} from '../climax.js';
import {voHp,theHp} from '../stats.js';
import {hudBox,hudBar} from './flood.js';
import {darkPost,endMG,goalArrow} from './chung.js';

/* Độ khó (chỉnh bằng bot): tốc độ tên dắt trâu, tốc độ hai tên chặn, máu mỗi tên, khoảng cách bắt đầu chặn,
   nhịp đánh của cướp. */
export const CUOP={LEAD_SP:1.25,GUARD_SP:2.6,HP:4,AGGRO:4.5,HIT_CD:1.15,MY_CD:.36};
const BOAT={x:81.2,y:57.5},START={x:43.5,y:49.8};
const okW=(x,y)=>!solidAt(x+.5,y+.5);
const pDmg=()=>1+(S.vo>=50?1:0)+(has('Kiếm sắt')?1:0);

export function startCuop(){
  const en=[{lead:true,x:54.5,y:55.5},{x:53.5,y:54.5},{x:53.5,y:56.5}].map((e,i)=>({...e,id:i,hp:CUOP.HP,cd:0,stun:0,dir:'right',walk:0,swing:0,dead:false,flash:0}));
  const hp=Math.max(2,4+voHp()+theHp());
  setMG({type:'cuop',t:0,en,hp,maxhp:hp,inv:0,cd:0,swing:0,trau:{x:52.5,y:55.5,dir:'right',trail:[]},hideNPC:true,
    update:cUpdate,findTarget:()=>null,draw:cDraw,hud:cHud,post:cPost,key:cKey,goal:cGoal,speedMul:()=>1});
  S.x=START.x;S.y=START.y;P.dir='down';document.body.classList.add('mg');
  setKeys('<span><kbd>Space</kbd> đánh</span><span><kbd>Shift</kbd> chạy</span><span>Hạ tên dắt trâu trước khi hắn ra tới thuyền</span>');
}
const live=()=>MG.en.filter(e=>!e.dead);
function cKey(k){if(k!==' ')return false;const M=MG;if(M.cd>0)return true;M.cd=CUOP.MY_CD;M.swing=.24;
  let tg=null,bd=1.5;for(const e of live()){const d=Math.hypot(e.x-S.x,e.y-S.y);if(d<bd){bd=d;tg=e}}
  if(tg){P.dir=dirOf(tg.x-S.x,tg.y-S.y);hit(tg)}return true}
function hit(e){const M=MG;e.hp-=pDmg();e.flash=.2;e.stun=.5;
  const dx=e.x-S.x,dy=e.y-S.y,ax=Math.abs(dx)>Math.abs(dy),nx=e.x+(ax?Math.sign(dx)*.6:0),ny=e.y+(ax?0:Math.sign(dy)*.6);if(okW(Math.floor(nx),Math.floor(ny))){e.x=nx;e.y=ny}
  if(e.hp<=0){e.dead=true;floatAt(e.lead?'Tên dắt trâu gục xuống!':'Hạ một tên!',e.x,e.y-1,'#e2bf72');if(e.lead)endCuop('win')}}
function cUpdate(dt){const M=MG;M.t+=dt;M.cd=Math.max(0,M.cd-dt);M.swing=Math.max(0,M.swing-dt);M.inv=Math.max(0,M.inv-dt);
  for(const e of live()){e.cd=Math.max(0,e.cd-dt);e.stun=Math.max(0,e.stun-dt);e.flash=Math.max(0,e.flash-dt);e.swing=Math.max(0,e.swing-dt);if(e.stun>0)continue;
    const dp=Math.hypot(S.x-e.x,S.y-e.y);let tx,ty,sp;
    if(e.lead&&dp>1.3){tx=BOAT.x;ty=BOAT.y;sp=CUOP.LEAD_SP}             // dắt trâu ra thuyền; bị áp sát thì buông thừng đánh lại
    else if(e.lead||dp<CUOP.AGGRO||M.t>6){tx=S.x;ty=S.y;sp=CUOP.GUARD_SP}
    else{const l=M.en[0];tx=l.x-1;ty=l.y+(e.id===1?-1:1);sp=CUOP.LEAD_SP*1.1}
    if(dp<.95&&!(e.lead&&dp>1.3)){e.dir=dirOf(S.x-e.x,S.y-e.y);if(e.cd<=0&&M.inv<=0){e.cd=CUOP.HIT_CD;e.swing=.3;M.hp--;M.inv=.9;M.shake=.5;floatText('−1 máu','#e07f6b');
      const nx=S.x+Math.sign(S.x-e.x)*.8;if(canStand(nx,S.y))S.x=nx;if(M.hp<=0)return endCuop('nga')}continue}
    const st=nextStep(e,tx,ty,okW,clock);if(!st)continue;const [mx,my]=stepTo(e,st,sp*dt,okW);e.x+=mx;e.y+=my;e.walk+=dt*9;if(mx||my)e.dir=dirOf(mx,my);
    if(e.lead){const T=M.trau;T.trail.push([e.x,e.y]);if(T.trail.length>40){const [bx,by]=T.trail.shift();if(bx!==T.x)T.dir=bx>T.x?'right':'left';T.x=bx;T.y=by}
      if(Math.hypot(BOAT.x-e.x,BOAT.y-e.y)<.6)return endCuop('lost')}}
  M.shake=Math.max(0,(M.shake||0)-dt*1.6)}
function cGoal(){const l=MG.en.find(e=>e.lead&&!e.dead);return l?[l.x,l.y]:null}
function cDraw(list){const M=MG,T=M.trau;
  list.push({y:T.y,f:()=>{shadow(T.x,T.y,22);drawSprite(buffaloSprite(T.dir),T.x,T.y)},lab:Math.hypot(T.x-S.x,T.y-S.y)<5?['Trâu nhà ông Cả',T.x,T.y-1.6]:null});
  // thuyền cướp đợi ở mép nước
  list.push({y:BOAT.y-.3,f:()=>{const sx=Math.round((BOAT.x+1)*TS),sy=Math.round(BOAT.y*TS);ctx.fillStyle='#0b0d0c';ctx.fillRect((sx-14)*Z-camX,(sy-4)*Z-camY,30*Z,8*Z);ctx.fillStyle='#4a3020';ctx.fillRect((sx-13)*Z-camX,(sy-3)*Z-camY,28*Z,6*Z)}});
  for(const e of live()){const fr=e.swing>0?(e.swing>.17?'a0':'a1'):[1,0,2,0][Math.floor(e.walk)%4];
    list.push({y:e.y,f:()=>{shadow(e.x,e.y,10);if(e.flash>0&&Math.floor(clock*30)%2)return;drawSprite(personSprite({id:'cuop'},e.dir,fr),e.x,e.y);if(e.lead)torchFx(e.x+.3,e.y-.2,false)},
      lab:Math.hypot(e.x-S.x,e.y-S.y)<5?[e.lead?'Tên dắt trâu':'Kẻ cướp',e.x,e.y-2]:null})}}
function cPost(){const M=MG,h=[[S.x,S.y,230],[BOAT.x,BOAT.y,120]];for(const e of live())if(e.lead)h.push([e.x,e.y,170]);darkPost(h,.66)}
function cHud(){const M=MG,w=Math.min(440,VW-32),x=Math.round(VW/2-w/2);hudBox(x,16,w,64);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#e07f6b';ctx.fillText('Máu',x+12,32);hudBar(x+60,26,w-72,M.hp/M.maxhp,'#c0453a');
  const l=M.en.find(e=>e.lead&&!e.dead),d=l?Math.hypot(BOAT.x-l.x,BOAT.y-l.y):0;ctx.fillStyle='#efe8d4';ctx.fillText(`Kẻ cướp còn ${live().length} · tên dắt trâu cách thuyền ${Math.ceil(d)} bước`,x+12,56);goalArrow()}

export function endCuop(how){endMG();S.flags.cuop=how;
  if(how==='win'){gain('tieng',4);gain('vo',2);showModal({kicker:'Đông · 1280',title:'Giữ được trâu',body:'<p>Tên dắt trâu gục xuống ngay mép bãi. Hai tên kia vứt đuốc chạy vào bóng tối. Sáng ra, trai làng trói hắn giải lên huyện. Ông Cả Lợi dắt trâu về, đứng trước cửa nhà bạn rất lâu mới nói được câu cảm ơn.</p><p class="note">Hư cấu. Ông Cả mang ơn bạn. Cả làng biết chuyện.</p>'})}
  else{if(how==='lost')gain('tieng',-1);showModal({kicker:'Đông · 1280',title:how==='nga'?'Bị đánh ngã':'Cướp chạy mất',body:how==='nga'?'<p>Bạn bị đánh ngã giữa bãi. Lúc gượng dậy được thì thuyền cướp đã khuất trên sông, con trâu rống mãi bên kia bờ.</p>':'<p>Tên cầm đầu lôi được trâu xuống thuyền, đẩy sào ra giữa dòng. Bạn đứng trên bãi, nghe tiếng trâu rống xa dần.</p><p class="note">Ông Cả mất trâu. Trong làng có người xì xào: "Hương binh gì mà để cướp dắt trâu đi ngay trước mũi."</p>'})}
  save()}
