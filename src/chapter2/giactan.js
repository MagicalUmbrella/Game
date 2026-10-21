/* ================= chương hai · giặc tan: cứu người ở trại Gia Lâm ================= */
/* Hư cấu. Sau trận Chương Dương, giặc bỏ trại Gia Lâm. Toán lính đi cuối còn giải một hàng tù từ chuồng ra thủy trại để
   chở đi (người làng bị bắt đêm giặc đến: S.res.lostWho, hoặc người còn kẹt lại khi bạn trốn trại: S.c2.tron.lost, cùng vài
   người làng khác). MG 'tim', ban ngày, trại cháy dở:
   - Hàng tù đi theo đường (roadRoute, along) từ cửa chuồng (PEN_DOOR) ra bến thủy trại (LANDING), tốc độ TIM.PACE.
   - Lính áp giải (đi đầu, giữa, cuối; đã đốt kho lương lúc trốn trại thì giặc đói, bỏ trốn bớt một tên) có tầm nhìn hình quạt
     (TIM.VIEW, TIM.CONE). Tên đi cuối thỉnh thoảng ngoái lại.
   - Lẻn tới cạnh người bị trói, đứng yên giữ E TIM.CUT giây để cắt dây; người ấy chạy về bìa tre (SAFE).
   - Bị thấy thì thanh "bị lộ" đầy dần; đầy thì lính quát, đẩy bạn ngã ra, cả hàng đi nhanh hơn một lúc.
   - Võ 40 (hay đường võ): đứng sát sau lưng một tên lính mà hắn không thấy, bấm Space là đánh ngất.
   - Ai lên tới bến thì bị chở đi xa (S.c2.missing, nhắc ở chương ba).
   Kết quả S.c2.tim {cuu, xa, chet, ko, lo}. Trốn trại hỏng (bị giải đi) thì người đầu tiên còn kẹt đã mất trong trại. */
import {T,TS,ctx} from '../constants.js';
import * as st from '../state.js';
import {S,save,setMG} from '../state.js';
import {floatText,gain,setKeys,showModal,toast} from '../ui.js';
import {camX,camY} from '../render.js';
import {keys} from '../input.js';
import {walkable} from '../dialogs.js';
import {FERRIES} from '../world.js';
import {get} from '../map.js';
import {DK,PA,BR,ST,GA,SA} from '../constants.js';
import {roadRoute,along} from '../pathfind.js';
import {walker,goTo,drawWalker} from '../camp.js';
import {CAMP,FIRES,PEN_DOOR,campMini,campSolid,drawCamp,hideProp} from '../trai.js';
import {tongue,smoke} from '../climax.js';
import {hudBar,hudBox} from '../minigames/flood.js';
import {ch2Go,ch2Note} from './index.js';

export const TIM={PACE:.8,GAP:1.4,VIEW:4.4,CONE:.55,FILL:1.4,DECAY:.4,CUT:1.3,LOOK:5};
const lc=n=>/^(Mẹ|Cha|Bà|Bé|Cụ|Trai|Cu)/.test(n)?n[0].toLowerCase()+n.slice(1):n;
const DIRV={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const BACK={up:'down',down:'up',left:'right',right:'left'};
const okWalk=(x,y)=>walkable(x,y)&&!campSolid(x,y);
const roadCost=(x,y)=>{const t=get(x,y);return t===PA||t===DK||t===BR||t===ST||t===GA?1:t===SA?2:3};
function nearOK(x,y){for(let r=0;r<6;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(okWalk(Math.floor(x)+dx,Math.floor(y)+dy))return [Math.floor(x)+dx+.5,Math.floor(y)+dy+.5];return [x,y]}

/* ai đang bị giải: người làng mình trước, rồi người làng khác (hư cấu) */
export function timList(){const r=S.res||{},tr=S.c2.tron,all=r.lostWho||[];
  const own=(tr?all.filter(p=>tr.lost.includes(p.name)):all).map(p=>({name:p.name,look:p.look,own:true}));
  let chet=[];if(tr&&!tr.ok&&own.length)chet=[own.shift().name];   // trốn trại hỏng: một người không qua nổi những ngày trong trại
  const la=[{name:'Ông Bảy làng Đông',look:{id:'ong_gia'}},{name:'Chị Nhài làng Đông',look:{id:'dan_nu1'}},{name:'Cu Tý làng Đông',look:{id:'tre1',kid:true}}];
  return {col:[...own,...la.slice(0,Math.max(2,4-own.length))],chet}}

export function startTim(){S.c2.scene='tim';S.season=1;save();
  const {col,chet}=timList(),own=col.filter(p=>p.own);
  showModal({kicker:'Hạ 1285 · cuối tháng năm',title:'Trại giặc bỏ hoang',
    body:`<p>Giặc thua ở Chương Dương, bỏ trại Gia Lâm mà chạy. Bạn cùng mấy người dân binh sang sông tìm người làng.</p>
      ${chet.length?`<p>Ở góc chuồng tù có một nấm mồ mới đắp. Người làng Đông bảo: ${lc(chet[0])} không qua nổi những ngày trong trại.</p>`:''}
      <p>Toán lính giặc đi cuối còn đang giải một hàng tù ra thủy trại${own.length?`, trong đó có ${own.map(p=>lc(p.name)).join(', ')}`:''}. Thuyền giặc chờ ở bến, chở đi là không biết bao giờ về.</p>
      <p class="note">Lẻn tới cạnh người bị trói, đứng yên giữ E để cắt dây. Tránh tầm nhìn lính.${S.vo>=40||S.path==='vo'?' Đứng sát sau lưng lính mà hắn không thấy thì bấm Space đánh ngất.':''} Hư cấu.</p>`,
    choices:[{label:'Lẻn tới',fn:()=>begin(col,chet)}]})}

function begin(col,chet){
  const start=[PEN_DOOR[0],PEN_DOOR[1]],end=FERRIES[0].b;
  const pts=roadRoute(Math.floor(start[0]),Math.floor(start[1]),Math.floor(end[0]),Math.floor(end[1]),okWalk,roadCost)||[start,end];
  const L=pts.reduce((a,p,i)=>i?a+Math.abs(p[0]-pts[i-1][0])+Math.abs(p[1]-pts[i-1][1]):0,0);
  const tr=S.c2.tron,few=tr&&tr.burn;
  const caps=col.map((p,i)=>walker('cap'+i,p.name,p.look,start[0],start[1],{tied:true,own:p.own}));
  const g=n=>walker('g'+n,'Lính giặc',{id:'giac'},start[0],start[1],{guard:true,look2:n});
  const row=[g(0)];caps.forEach((c,i)=>{row.push(c);if(!few&&i===Math.floor(caps.length/2)-1)row.push(g(1))});row.push(g(2));
  row.forEach((o,i)=>o.k=i);
  const [sx,sy]=nearOK(CAMP.x0-7,12.5),safe=nearOK(CAMP.x0-9,24.5);S.x=sx;S.y=sy;st.P.dir='right';
  setMG({type:'tim',t:0,clock:0,pts,L,s:0,row,caps,chet,safe,alert:0,seen:false,lo:0,ko:0,cut:0,cutting:null,stun:0,rush:0,warned:0,look:TIM.LOOK,done:false,
    hideNPC:true,roam:true,hideProp,update:tUpdate,draw:tDraw,post:tPost,hud:tHud,key:tKey,findTarget:tTarget,mini:campMini,speedMul:()=>st.MG.stun>0?0:.8,
    goal:()=>{const c=st.MG.caps.find(c=>c.tied&&!c.gone);return c?[c.x,c.y]:[S.x,S.y]}});
  document.body.classList.add('mg');
  setKeys(`<span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> đi</span><span>Giữ <kbd>E</kbd> cắt dây</span>${S.vo>=40||S.path==='vo'?'<span><kbd>Space</kbd> đánh ngất lính từ sau lưng</span>':''}`);
  toast('Hàng tù đang ra khỏi trại. Lính đi đầu, đi cuối đều có mắt. Chờ chúng qua rồi lẻn tới từ phía sau.',5500);save()}

const guards=M=>M.row.filter(o=>o.guard&&!o.ko);
function sight(g,o){const dx=o.x-g.x,dy=o.y-g.y,d=Math.hypot(dx,dy);if(d>TIM.VIEW)return 0;
  if(d>.6){const [vx,vy]=DIRV[g.face||g.dir]||[0,1];if((dx*vx+dy*vy)/d<TIM.CONE)return 0}   // sát sau lưng (không quá .6 ô) thì lính mới thấy
  const n=Math.ceil(d/.3);for(let i=1;i<n;i++){const x=Math.floor(g.x+dx*i/n),y=Math.floor(g.y-.4+dy*i/n);if(campSolid(x,y)||get(x,y)===4)return 0}   // lều, rào, cây che
  return 1-d/TIM.VIEW*.6}

function tUpdate(dt){const M=st.MG;if(M.done)return;M.t+=dt;M.clock=M.t;M.stun-=dt;M.rush-=dt;M.warned-=dt;
  // hàng tù đi theo đường; ai đã lên bến thì bị chở đi
  M.s+=TIM.PACE*(M.rush>0?1.7:1)*dt;let k=0;
  for(const o of M.row){if(o.gone||o.free)continue;const s=Math.max(0,M.s-k*TIM.GAP);k++;
    if(s>=M.L-.05&&o.tied){o.gone=true;if(o.own)toast(`${o.name} bị đẩy xuống thuyền giặc!`,3000);continue}
    const a=along(M.pts,Math.min(s,M.L));o.moving=Math.hypot(a.x-o.x,a.y-o.y)>.005;if(o.moving)o.walk+=dt*7;o.x=a.x;o.y=a.y;o.dir=a.dir;
    if(o.guard&&!o.ko){o.face=o.dir;if(o===M.row[M.row.length-1]){M.look-=dt;if(M.look<0)o.face=BACK[o.dir];if(M.look<-1.6)M.look=TIM.LOOK+Math.random()*2}}}
  // người được cắt dây chạy về bìa tre
  for(const c of M.caps)if(c.free&&!c.safe){c.ft=(c.ft||0)+dt;if(c.ft>9||goTo(c,M.safe[0],M.safe[1],3,dt,okWalk)||Math.hypot(c.x-M.safe[0],c.y-M.safe[1])<.6)c.safe=true}
  // cắt dây
  const tg=M.caps.find(c=>c.tied&&!c.gone&&Math.hypot(c.x-S.x,c.y-S.y)<1.05);
  if(tg&&keys.e&&!st.P.moving&&M.stun<=0){if(M.cutting!==tg){M.cutting=tg;M.cut=0}M.cut+=dt;
    if(M.cut>=TIM.CUT){tg.tied=false;tg.free=true;M.cutting=null;M.cut=0;floatText(tg.own?'Cứu được '+lc(tg.name)+'!':'Cắt dây!','#9fcaa9');if(tg.own)gain('tieng',1);else gain('duc',1)}}
  else{M.cut=Math.max(0,M.cut-dt*2);if(!tg)M.cutting=null}
  // tầm nhìn lính
  let v=0;for(const g of guards(M)){const s=sight(g,{x:S.x,y:S.y});if(s>v)v=s}
  M.seen=v>0;M.alert=v>0?Math.min(1,M.alert+dt*TIM.FILL*(.4+v)):Math.max(0,M.alert-dt*TIM.DECAY);
  if(v>0&&M.alert>.5&&M.warned<=0){floatText('"Đứa nào kia?!"','#e07f6b');M.warned=3}
  if(M.alert>=1){M.alert=.3;M.lo++;M.rush=8;M.stun=1.2;M.cut=0;const g=guards(M).sort((a,b)=>Math.hypot(a.x-S.x,a.y-S.y)-Math.hypot(b.x-S.x,b.y-S.y))[0];
    if(g){const dx=S.x-g.x,dy=S.y-g.y,d=Math.hypot(dx,dy)||1;for(let i=0;i<8;i++){const nx=S.x+dx/d*.3,ny=S.y+dy/d*.3;if(!okWalk(Math.floor(nx),Math.floor(ny)))break;S.x=nx;S.y=ny}}
    toast('Lính giặc quát lên, xô bạn ngã. Cả hàng bị giục đi nhanh hơn!',3500)}
  // xong: mọi người hoặc đã được cứu hoặc đã lên thuyền, lính đi cuối tới bến
  if(M.caps.every(c=>c.gone||c.safe)&&(M.s-(M.row.length-1)*TIM.GAP>=M.L-.05||M.caps.every(c=>c.safe)))finish(M)}
function tKey(k){const M=st.MG;if(k!==' '||!(S.vo>=40||S.path==='vo')||M.stun>0)return false;
  const g=guards(M).find(g=>Math.hypot(g.x-S.x,g.y-S.y)<1.15&&!sight(g,{x:S.x,y:S.y}));
  if(g){g.ko=true;g.moving=false;M.ko++;floatText('Hạ một tên!','#f0a27f');return true}return false}
function tTarget(){const M=st.MG,tg=M.caps.find(c=>c.tied&&!c.gone&&Math.hypot(c.x-S.x,c.y-S.y)<1.05);
  return tg?{label:`Giữ E để cắt dây cho ${lc(tg.name)} (${Math.round(M.cut/TIM.CUT*100)}%)`,act:()=>{}}:null}

function finish(M){M.done=true;setMG(null);setKeys();document.body.classList.remove('mg');
  const cuu=M.caps.filter(c=>c.safe).map(c=>c.name),xa=M.caps.filter(c=>c.gone).map(c=>c.name);
  const own=M.caps.filter(c=>c.own),ownCuu=own.filter(c=>c.safe).map(c=>c.name),ownXa=own.filter(c=>c.gone).map(c=>c.name);
  S.c2.tim={cuu,xa,chet:M.chet,ko:M.ko,lo:M.lo};S.c2.missing=ownXa;
  if(M.chet.length)ch2Note(`${M.chet.map(cap1).join(', ')} mất trong trại giặc Gia Lâm, trước khi bạn kịp quay lại.`);
  ch2Note(cuu.length?`Giặc bỏ trại Gia Lâm, bạn lẻn tới cắt dây cứu ${cuu.map(lc).join(', ')} khỏi hàng tù.`:'Giặc bỏ trại Gia Lâm, bạn không cứu được ai khỏi hàng tù.');
  if(ownXa.length)ch2Note(`${ownXa.map(cap1).join(', ')} bị giặc chở đi trên thuyền, không biết về đâu.`);
  if(M.ko)ch2Note(`Bạn đánh ngất ${M.ko} tên lính áp giải từ sau lưng.`);
  save();
  showModal({kicker:'Hạ 1285 · cuối tháng năm',title:ownXa.length?'Thuyền giặc đi xa':'Về bìa tre',
    body:`${cuu.length?`<p>Ở bìa tre, ${cuu.map(lc).join(', ')} ngồi bệt xuống đất, cổ tay còn hằn vết dây.${ownCuu.length?' Người làng ôm lấy nhau mà khóc.':''}</p>`:''}
      ${xa.length?`<p>Chiếc thuyền giặc rời bến, chở theo ${xa.map(lc).join(', ')}. Bạn đứng trên bãi nhìn theo tới khi cánh buồm khuất sau khúc sông.</p>`:''}
      <p class="note">Hư cấu.${ownXa.length?' Người bị chở đi sẽ được nhắc lại về sau.':''}</p>`,
    choices:[{label:'Tiếp tục',fn:()=>ch2Go('tin')}]})}
const cap1=n=>n[0].toUpperCase()+n.slice(1);

/* ---------- vẽ ---------- */
function cone(g){const [vx,vy]=DIRV[g.face||g.dir]||[0,1],a=Math.atan2(vy,vx),h=Math.acos(TIM.CONE),sx=g.x*T-camX,sy=(g.y-.35)*T-camY,r=TIM.VIEW*T;
  ctx.fillStyle='rgba(224,120,90,.15)';ctx.beginPath();ctx.moveTo(sx,sy);ctx.arc(sx,sy,r,a-h,a+h);ctx.closePath();ctx.fill()}
function tDraw(list){const M=st.MG;drawCamp(list);
  for(const o of M.row){if(o.gone)continue;if(o.ko){list.push({y:o.y,f:()=>{ctx.fillStyle='#0b0d0c';ctx.fillRect(o.x*T-camX-21,o.y*T-camY-12,42,15);ctx.fillStyle='#3c4250';ctx.fillRect(o.x*T-camX-18,o.y*T-camY-9,36,9)}});continue}drawWalker(list,o,!o.guard)}
  for(const c of M.caps)if(c.free&&!c.gone)drawWalker(list,c,true);
  // khói còn bốc ở mấy đống lửa trại bỏ
  list.push({y:-1e8,f:()=>{for(const [i,f] of FIRES.entries()){const px=Math.round(f[0]*TS),py=Math.round(f[1]*TS);smoke(px,py-6,i+3,7);if(i%2)tongue(px,py,7,6,i)}}})}
function tPost(){const M=st.MG;for(const g of guards(M))if(Math.abs(g.x-S.x)<16&&Math.abs(g.y-S.y)<10)cone(g);
  if(M.cutting&&M.cut>0){const sx=S.x*T-camX,sy=(S.y-1.9)*T-camY;ctx.fillStyle='#0b0d0c';ctx.fillRect(sx-22,sy,44,8);ctx.fillStyle='#9fcaa9';ctx.fillRect(sx-20,sy+2,40*M.cut/TIM.CUT,4)}}
function tHud(){const M=st.MG,w=Math.min(470,innerWidth-32),x=Math.round(innerWidth/2-w/2);hudBox(x,16,w,46);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#e2bf72';ctx.fillText('Trại giặc bỏ hoang · cứu người khỏi hàng tù',x+12,30);
  const free=M.caps.filter(c=>c.free).length,left=M.caps.filter(c=>c.tied&&!c.gone).length,gone=M.caps.filter(c=>c.gone).length;
  ctx.textAlign='right';ctx.fillStyle='#aab2a2';ctx.fillText(`cứu ${free} · còn trói ${left}${gone?' · bị chở đi '+gone:''}`,x+w-12,30);ctx.textAlign='left';
  ctx.fillStyle=M.seen?'#e07f6b':'#efe8d4';ctx.fillText(M.stun>0?'Bị xô ngã!':M.seen?'Có lính đang nhìn về phía bạn!':'Lẻn tới sau lưng, giữ E cắt dây',x+12,48);hudBar(x+w-150,42,138,M.alert,M.alert>.6?'#e0402a':'#d98a3a')}
