/* ================= chương hai · chặn toán giặc cướp lương (tháng 4 năm 1285) ================= */
/* Hư cấu hoàn toàn. Nhiệm vụ thứ hai của đội dân binh: một toán giặc vét thóc ở làng bên (cụm nhà phía nam trại dân binh),
   bắt hai người làng gánh thóc theo, đi đường đất lên phía bắc về trại chúng. Cầm đầu là Mặt Sẹo cưỡi ngựa (matseo.js),
   tên đầu toán đã đốt làng An Phú đêm tháng giêng. Bạn cùng trai làng (S.c2.men còn sống, Cò nếu ở làng, anh Hến nếu ở lại)
   phục ở quãng đường qua rặng cây (ROUTE).
   MG 'cuop2': Space đánh (tự quay về tên gần nhất). Đánh lính gác thì cả toán dừng lại đánh; người mình cũng xông vào.
   Hạ hết lính (LUONG.N) thì giữ được thóc, hai người gánh thóc theo về đội (S.c2.luong 'giu'). Mặt Sẹo trúng LUONG.MS_HIT đòn
   hay mất nửa số lính thì quất ngựa chạy (S.c2.ms ghi lần gặp; chạy vì thua thì msWin). Bạn hết máu, hay toán giặc ra tới
   đầu đường (EXIT) mà chưa ai đánh, là mất thóc ('mat' / 'bo'). Người mình bị đánh gục thì chỉ bị thương, không chết.
   Hậu quả ở trận Chương Dương (chuongduong.js): giữ thóc thì bạn thêm 1 máu, trai làng thêm 1 máu; mất thì trai làng bớt 1. */
import {T,TS,ctx} from '../constants.js';
import * as st from '../state.js';
import {S,P,has,save,setMG} from '../state.js';
import {floatAt,gain,setKeys,showModal,toast} from '../ui.js';
import {camX,camY,clock,drawSprite,shadow} from '../render.js';
import {walkable} from '../dialogs.js';
import {canStand} from '../input.js';
import {along,nextStep,stepTo} from '../pathfind.js';
import {personSprite,simple} from '../sprites.js';
import {horseDir} from '../trai.js';
import {dirOf,drawBubbles} from '../climax.js';
import {voHp,theHp} from '../stats.js';
import {hudBar,hudBox} from '../minigames/flood.js';
import {goalArrow} from '../minigames/chung.js';
import {MS,msMeet,msTaunt,msWin} from './matseo.js';
import {villageMen} from './chuongduong.js';
import {ch2Go,ch2Note} from './index.js';

export const LUONG={PACE:.8,N:4,HP:4,EN_SP:2.3,HIT_CD:1.25,MY_CD:.36,AL_CD:1.1,AL_HP:3,MS_HIT:3,AGGRO:3.2};
const ROUTE=[[54.5,189.5],[70.5,189.5],[70.5,170.5]],EXIT=ROUTE[2],AMBUSH=[67.5,181.5];
const okW=(x,y)=>walkable(x,y);
const cap=n=>n[0].toUpperCase()+n.slice(1);
const pDmg=()=>1+(S.vo>=50?1:0)+(has('Kiếm sắt')?1:0)+(S.c2.the==='mai'?1:0);
const baoSprite=()=>simple('baothoc',10,8,s=>{s(0,1,10,7,'#0b0d0c');s(1,2,8,5,'#c8a868');s(3,0,4,2,'#0b0d0c');s(4,1,2,1,'#a88848');s(2,3,1,3,'#a88848')},5,7);

export function startCuopLuong(){S.c2.scene='cuop2';S.season=0;save();
  const n=villageMen().filter(m=>!m.fallen).length;
  showModal({kicker:'Xuân 1285 · tháng tư',title:'Toán giặc cướp lương',
    body:`<p>Tin báo: một toán giặc vừa vét sạch thóc ở làng bên, bắt hai người làng gánh theo, đang đi đường đất lên phía bắc. Đi đầu là một tên cưỡi ngựa, mặt có vết sẹo chém ngang.</p>
      <p>Bạn nhận ra hắn ngay: tên đầu toán đêm đốt làng An Phú. Ông Đoàn giao bạn${n?` cùng ${n} trai làng`:''} phục ở quãng đường qua rặng cây.</p>
      <p class="note">Space đánh. Hạ hết lính gác trước khi toán giặc ra khỏi rặng cây thì giữ được thóc. Người mình cùng xông vào. Hư cấu.</p>`,
    choices:[{label:'Ra chỗ phục',fn:()=>begin()}]})}

function begin(){const L=ROUTE.reduce((a,p,j)=>j?a+Math.abs(p[0]-ROUTE[j-1][0])+Math.abs(p[1]-ROUTE[j-1][1]):0,0);
  // đoàn: Mặt Sẹo cưỡi ngựa đi đầu, lính, hai người gánh thóc, lính
  const row=[{ms:true,hp:99,hits:0},{en:1},{en:1},{carry:1,name:'Người gánh thóc',look:{id:'dan_nam1'}},{carry:1,name:'Người gánh thóc',look:{id:'dan_nam2'}},{en:1},{en:1}];
  let k=0;for(const o of row){Object.assign(o,{k:k++,x:ROUTE[0][0],y:ROUTE[0][1],dir:'right',walk:0,swing:0,cd:Math.random(),stun:0,flash:0,dead:false});if(o.en){o.hp=LUONG.HP;o.look={id:k%2?'giac':'giac_ky'}}}
  const al=[];const add=(name,look,hp)=>{const [x,y]=[AMBUSH[0]-1-al.length%3*.9,AMBUSH[1]+.8+Math.floor(al.length/3)*.9];al.push({name,look,hp,max:hp,x,y,dir:'right',walk:0,swing:0,cd:Math.random(),ko:false})};
  const ah=LUONG.AL_HP+(S.flags.giao?1:0);villageMen().filter(m=>!m.fallen).forEach(m=>add(cap(m.name),m.look,ah));
  if(S.co==='village')add('Cò',{id:'co'},ah+1);if(S.c2.hen==='o')add('Anh Hến',{id:'trai3'},ah);
  const hp=Math.max(4,6+voHp()+theHp());S.x=AMBUSH[0];S.y=AMBUSH[1];P.dir='right';
  setMG({type:'cuop2',t:0,clock:0,L,s:0,row,en:row.filter(o=>o.en),ms:row[0],al,hp,maxhp:hp,inv:0,cd:0,swing:0,fight:false,bub:[],msGone:false,msBeat:false,done:false,
    hideNPC:true,roam:true,update:lUpdate,draw:lDraw,post:()=>{drawBubbles(st.MG.bub);goalArrow()},hud:lHud,key:lKey,findTarget:()=>null,goal:lGoal,speedMul:()=>1});
  document.body.classList.add('mg');msMeet('cuop');
  setKeys('<span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> đi</span><span><kbd>Space</kbd> đánh</span><span>Hạ lính gác trước khi toán giặc ra khỏi rặng cây</span>');
  toast('Toán giặc đang tới từ phía làng bên. Chờ chúng vào rặng cây hay xông ra ngay cũng được.',4500);save()}

const live=()=>st.MG.en.filter(e=>!e.dead);
function bub(o,text,t=3.2){const M=st.MG;if(!M||!M.bub)return;M.bub=M.bub.filter(b=>b.o!==o);M.bub.push({o,text,t})}
function startFight(M){if(M.fight)return;M.fight=true;bub(M.ms,msTaunt(),4);for(const a of M.al)if(Math.random()<.5)bub(a,['Xông lên!','Trả thóc đây!','Đánh!'][Math.floor(Math.random()*3)],2.4)}
function lKey(k){if(k!==' ')return false;const M=st.MG;if(M.cd>0||M.done)return true;M.cd=LUONG.MY_CD;M.swing=.24;
  let tg=null,bd=1.5;for(const e of live()){const d=Math.hypot(e.x-S.x,e.y-S.y);if(d<bd){bd=d;tg=e}}
  const ms=M.ms;if(!M.msGone&&Math.hypot(ms.x-S.x,ms.y-S.y)<Math.min(bd,1.6)){tg=ms}
  if(tg){P.dir=dirOf(tg.x-S.x,tg.y-S.y);hit(M,tg);startFight(M)}return true}
function hit(M,e){e.flash=.2;
  if(e.ms){e.hits++;floatAt('Trúng!',e.x,e.y-1.6,'#e2bf72');if(e.hits>=LUONG.MS_HIT)msFlee(M,true);return}
  e.hp-=pDmg();e.stun=.5;const dx=e.x-S.x,dy=e.y-S.y,ax=Math.abs(dx)>Math.abs(dy),nx=e.x+(ax?Math.sign(dx)*.5:0),ny=e.y+(ax?0:Math.sign(dy)*.5);if(okW(Math.floor(nx),Math.floor(ny))){e.x=nx;e.y=ny}
  if(e.hp<=0){e.dead=true;floatAt('Hạ một tên!',e.x,e.y-1,'#e2bf72');if(live().length<=LUONG.N/2)msFlee(M,true)}}
function msFlee(M,beat){if(M.msGone)return;M.msGone=true;M.msBeat=beat;M.ms.flee=true;bub(M.ms,beat?'Lũ chuột nhắt! Rồi sẽ biết tay ta!':'Đi! Mang thóc đi!',3.4);if(beat){msWin('cuop');toast('Mặt Sẹo quất ngựa bỏ chạy!',3000)}}
function lUpdate(dt){const M=st.MG;if(M.done)return;M.t+=dt;M.clock=M.t;M.cd=Math.max(0,M.cd-dt);M.swing=Math.max(0,M.swing-dt);M.inv=Math.max(0,M.inv-dt);
  for(const b of M.bub)b.t-=dt;M.bub=M.bub.filter(b=>b.t>0);
  if(!live().length)return finish(M,'giu');
  // đoàn đi theo đường khi chưa bị đánh
  if(!M.fight){M.s+=LUONG.PACE*dt;for(const o of M.row){const a=along(ROUTE,Math.max(0,Math.min(M.L,M.s-o.k*1.25)));o.moving=M.s-o.k*1.25>0;if(o.moving)o.walk+=dt*7;o.x=a.x;o.y=a.y;o.dir=a.dir}
    if(M.row.some(o=>o.en&&Math.hypot(o.x-S.x,o.y-S.y)<LUONG.AGGRO))startFight(M);
    if(M.s-M.row[M.row.length-1].k*1.25>=M.L-.05)return finish(M,'bo')}
  // Mặt Sẹo: ngồi ngựa quát tháo, rồi chạy về phía bắc
  const ms=M.ms;if(ms.flee&&!ms.gone){ms.y-=4.5*dt;ms.dir='up';ms.moving=true;ms.walk+=dt*10;if(ms.y<EXIT[1]-6)ms.gone=true}
  if(M.fight&&!M.msGone&&M.t%7<dt)bub(ms,['Giết hết chúng nó!','Lũ dân đen!','Giữ lấy thóc!'][Math.floor(M.t/7)%3],2.6);
  if(!M.fight)return;
  // lính giặc đánh bạn hoặc người mình gần nhất
  const tgs=[{x:S.x,y:S.y,me:true},...M.al.filter(a=>!a.ko)];   // mỗi tên nhắm một người, không dồn cả vào bạn
  live().forEach((e,i)=>{e.cd=Math.max(0,e.cd-dt);e.stun=Math.max(0,e.stun-dt);e.flash=Math.max(0,e.flash-dt);e.swing=Math.max(0,e.swing-dt);if(e.stun>0)return;
    let tg=tgs[i%tgs.length],bd=Math.hypot(tg.x-e.x,tg.y-e.y);const dm=Math.hypot(S.x-e.x,S.y-e.y);if(dm<1.2&&dm<bd){tg=tgs[0];bd=dm}   // bạn áp sát thì nó đánh bạn
    if(bd<.95){e.dir=dirOf(tg.x-e.x,tg.y-e.y);e.moving=false;if(e.cd<=0){e.cd=LUONG.HIT_CD;e.swing=.3;
      if(tg.me){if(M.inv<=0&&Math.random()<.7){M.hp--;M.inv=.9;floatAt('−1 máu',S.x,S.y-1,'#e07f6b');const nx=S.x+Math.sign(S.x-e.x)*.6;if(canStand(nx,S.y))S.x=nx;if(M.hp<=0)return finish(M,'nga')}}
      else if(Math.random()<.6){tg.hp--;tg.flash=.2;if(tg.hp<=0){tg.ko=true;floatAt(tg.name+' bị thương!',tg.x,tg.y-1,'#e07f6b')}}}return}
    const s=nextStep(e,tg.x,tg.y,okW,clock);if(!s)return;const [mx,my]=stepTo(e,s,LUONG.EN_SP*dt,okW);e.x+=mx;e.y+=my;e.walk+=dt*9;e.moving=!!(mx||my);if(mx||my)e.dir=dirOf(mx,my)});
  if(M.hp<=0)return finish(M,'nga');
  // người mình xông vào
  for(const a of M.al){if(a.ko)continue;a.cd=Math.max(0,a.cd-dt);a.swing=Math.max(0,a.swing-dt);a.flash=Math.max(0,(a.flash||0)-dt);
    let tg=null,bd=1e9;for(const e of live()){const d=Math.hypot(e.x-a.x,e.y-a.y);if(d<bd){bd=d;tg=e}}if(!tg){a.moving=false;continue}
    if(bd<1){a.dir=dirOf(tg.x-a.x,tg.y-a.y);a.moving=false;if(a.cd<=0){a.cd=LUONG.AL_CD*(S.flags.giao?.75:1);a.swing=.24;if(Math.random()<.55){tg.hp--;tg.flash=.2;if(tg.hp<=0){tg.dead=true;floatAt('Hạ một tên!',tg.x,tg.y-1,'#e2bf72');if(live().length<=LUONG.N/2)msFlee(M,true)}}}continue}
    const s=nextStep(a,tg.x,tg.y,okW,clock);if(!s)continue;const [mx,my]=stepTo(a,s,2.4*dt,okW);a.x+=mx;a.y+=my;a.walk+=dt*9;a.moving=!!(mx||my);if(mx||my)a.dir=dirOf(mx,my)}
  if(!live().length)finish(M,'giu')}
function lGoal(){const M=st.MG;const l=live();if(!l.length)return null;let b=l[0],bd=1e9;for(const e of l){const d=Math.hypot(e.x-S.x,e.y-S.y);if(d<bd){bd=d;b=e}}return [b.x,b.y]}

function finish(M,how){if(M.done)return;M.done=true;if(!M.msGone)msFlee(M,false);setMG(null);setKeys();document.body.classList.remove('mg');
  const hurt=M.al.filter(a=>a.ko).map(a=>a.name);
  S.c2.luong=how==='giu'?'giu':how==='bo'?'bo':'mat';S.c2.luongHurt=hurt;
  if(how==='giu'){gain('tieng',3);gain('vo',1)}
  ch2Note(how==='giu'?'Tháng tư năm 1285, bạn phục đánh toán giặc cướp lương, giữ được thóc, cứu hai người làng bên bị bắt gánh thóc.':how==='nga'?'Tháng tư năm 1285, bạn phục đánh toán giặc cướp lương nhưng bị đánh gục; giặc mang thóc đi mất.':'Tháng tư năm 1285, toán giặc cướp lương đi qua chỗ phục mà bạn không kịp ra tay; thóc mất.');
  ch2Note(M.msBeat?'Ở trận chặn lương, Mặt Sẹo, tên đầu toán đốt làng, bị bạn đánh phải quất ngựa chạy.':'Ở trận chặn lương bạn gặp lại Mặt Sẹo, tên đầu toán đốt làng. Hắn cưỡi ngựa chạy thoát.');
  if(hurt.length)ch2Note(`${hurt.join(', ')} bị thương ở trận chặn lương.`);
  save();
  showModal({kicker:'Xuân 1285 · tháng tư',title:how==='giu'?'Giữ được thóc':'Mất thóc',
    body:`<p>${how==='giu'?'Tên lính cuối cùng ngã xuống. Hai người làng bên quỳ xuống giữa đường, thóc đổ vung vãi. "Cho chúng tôi theo đội với. Làng mất hết rồi."':how==='nga'?'Bạn bị một nhát cán giáo vào đầu, ngã quỵ. Lúc trai làng dìu dậy được thì toán giặc đã đi xa, tiếng ngựa còn vọng lại.':'Toán giặc đi khuất sau rặng cây. Bạn chỉ còn nghe tiếng ngựa của Mặt Sẹo xa dần.'}</p>
      <p>${M.msBeat?'Mặt Sẹo quất ngựa chạy, ngoái lại chửi một câu. Bạn nhớ cái nhìn ấy.':'Mặt Sẹo cưỡi ngựa chạy thoát.'}${hurt.length?` ${hurt.join(', ')} bị thương, phải băng bó.`:''}</p>
      <p class="note">Hư cấu. ${how==='giu'?'Có thóc, có thêm người: trận tới cả đội khỏe hơn.':'Thiếu lương, trận tới trai làng yếu hơn.'}</p>`,
    choices:[{label:'Về trại',fn:()=>ch2Go('traiB')}]})}

/* ---------- vẽ ---------- */
const fr=o=>o.swing>0?(o.swing>.17?'a0':'a1'):o.moving?[1,0,2,0][Math.floor(o.walk)%4]:0;
function lDraw(list){const M=st.MG;
  for(const o of M.row){if(o.dead||o.gone)continue;
    if(o.ms){const hd=o.dir==='right'?'right':'left',bob=o.moving&&Math.floor(o.walk)%2?1/TS:0;list.push({y:o.y,f:()=>{shadow(o.x,o.y,22);if(o.flash>0&&Math.floor(clock*30)%2)return;drawSprite(personSprite(MS.look,hd,0),o.x,o.y-.85-bob);drawSprite(horseDir(1,o.moving?Math.floor(o.walk)%3:0,hd),o.x,o.y-bob)},lab:Math.hypot(o.x-S.x,o.y-S.y)<6?[MS.name,o.x,o.y-2.6]:null});continue}
    if(o.carry){list.push({y:o.y,f:()=>{shadow(o.x,o.y,10);drawSprite(personSprite(o.look,o.dir,M.fight?0:fr(o)),o.x,o.y);drawSprite(baoSprite(),o.x,o.y-1.25)},lab:Math.hypot(o.x-S.x,o.y-S.y)<4?[o.name,o.x,o.y-2]:null});continue}
    list.push({y:o.y,f:()=>{shadow(o.x,o.y,10);if(o.flash>0&&Math.floor(clock*30)%2)return;drawSprite(personSprite(o.look,o.dir,fr(o)),o.x,o.y)}})}
  for(const a of M.al)list.push({y:a.y,f:()=>{shadow(a.x,a.y,10);if(a.ko){ctx.fillStyle='#0b0d0c';ctx.fillRect(a.x*T-camX-21,a.y*T-camY-12,42,15);ctx.fillStyle='#6a5a3a';ctx.fillRect(a.x*T-camX-18,a.y*T-camY-9,36,9);return}drawSprite(personSprite(a.look,a.dir,fr(a)),a.x,a.y)},lab:!a.ko&&Math.hypot(a.x-S.x,a.y-S.y)<4?[a.name,a.x,a.y-2]:null})}
function lHud(){const M=st.MG,w=Math.min(440,innerWidth-32),x=Math.round(innerWidth/2-w/2);hudBox(x,16,w,64);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#e07f6b';ctx.fillText('Máu',x+12,32);hudBar(x+60,26,w-72,M.hp/M.maxhp,'#c0453a');
  const left=Math.max(0,M.L-M.s+ (M.row.length-1)*1.25);ctx.fillStyle='#efe8d4';
  ctx.fillText(M.fight?`Lính giặc còn ${live().length}${M.msGone?' · Mặt Sẹo đã chạy':' · Mặt Sẹo còn quát tháo'}`:`Toán giặc tới gần · còn ${Math.ceil(left)} bước là ra khỏi rặng cây`,x+12,56)}
