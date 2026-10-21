/* ================= chương hai · dò tin ở làng Thượng Phúc (tháng 3 năm 1285) ================= */
/* Hư cấu hoàn toàn (làng Thượng Phúc, toán giặc đóng ở đó, người trong làng). Nhiệm vụ đầu tiên của bạn trong đội dân
   binh ông Đoàn: đêm lẻn vào một làng ven sông giặc đang đóng (ở cụm nhà phía tây trại dân binh), hỏi chuyện người làng
   còn kẹt lại, rồi lẻn ra. MG 'dotin', đêm:
   - Ba toán lính cầm đuốc đi tuần theo vòng (LOOPS); mỗi tên có quạt tầm nhìn (DOTIN.VIEW, CONE), nhà, cây che khuất.
     Bị thấy thì thanh lộ đầy dần, đầy thì giặc thổi tù và: bạn phải chạy ra, chỉ mang được những tin đã có (lo).
   - Người trong làng (INF), bấm E cạnh họ: ông lão coi đình (giờ đổi gác thuyền canh, 'gac'), bà hàng nước (đường đi của
     thuyền canh, 'thuyen'), chú bé bị bắt chăn ngựa ('ky'; biết cưỡi ngựa thì đếm được số ngựa, đoán ra kỵ binh đóng xa
     bến), tấm bảng gỗ giặc vẽ thế đất quanh bến ('bando', cần Văn DOTIN.VAN đọc được chữ Hán).
   - Về chỗ bìa tre (EXIT) bấm E để rút; trời sáng (DOTIN.T) thì phải rút.
   Kết quả S.c2.tin2 (danh sách tin), S.c2.dotin {n, lo}. Tin dùng ở trận Chương Dương (chuongduong.js). */
import {T,ctx} from '../constants.js';
import * as st from '../state.js';
import {S,save,setMG} from '../state.js';
import {floatAt,gain,setKeys,showModal,toast} from '../ui.js';
import {camX,camY} from '../render.js';
import {walkable} from '../dialogs.js';
import {get} from '../map.js';
import {TR} from '../constants.js';
import {along} from '../pathfind.js';
import {knows} from '../nghe.js';
import {walker,drawWalker} from '../camp.js';
import {drawBubbles} from '../climax.js';
import {darkPost,goalArrow,twinkle} from '../minigames/chung.js';
import {hudBar,hudBox} from '../minigames/flood.js';
import {ch2Go,ch2Note} from './index.js';

export const DOTIN={T:150,VIEW:3.8,CONE:.55,NEAR:.9,FILL:1.5,DECAY:.35,PACE:1.05,VAN:40};
const DIRV={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
function nearOK(x,y){for(let r=0;r<6;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(walkable(Math.floor(x)+dx,Math.floor(y)+dy))return [Math.floor(x)+dx+.5,Math.floor(y)+dy+.5];return [x,y]}
const START=[12.5,142.5];
/* vòng tuần (tọa độ thế giới, cụm nhà ở x 22–40, y 139–148) */
const LOOPS=[[[21.5,138.5],[28.5,138.5],[28.5,143.5],[21.5,143.5],[21.5,138.5]],
  [[32.5,139.5],[42.5,139.5],[42.5,148.5],[32.5,148.5],[32.5,139.5]],
  [[17.5,144.5],[24.5,144.5],[24.5,150.5],[17.5,150.5],[17.5,144.5]]];
const INF=[
  {k:'gac',name:'Ông lão coi đình',look:{id:'ong_gia'},at:[33.5,143.5],
    line:'Thuyền canh của chúng đổi gác lúc gà gáy canh tư. Lúc ấy thằng nào cũng ngáp.',got:'Biết giờ đổi gác của thuyền canh giặc'},
  {k:'thuyen',name:'Bà hàng nước',look:{id:'dan_nu3'},at:[27.5,141.5],
    line:'Ba chiếc thuyền treo đèn, đêm nào cũng đi đúng một đường, từ gốc gạo sang bãi cát rồi quay lại.',got:'Biết đường đi của thuyền canh giặc'},
  {k:'ky',name:'Chú bé chăn ngựa',look:{id:'tre2',kid:true},at:[20.5,149.5],
    line:()=>knows('ngua')?'Cháu phải cho ngựa của chúng ăn. Ngựa nhiều lắm, toàn buộc ở bãi xa phía trên, không cho xuống gần bến.':'Cháu phải cho ngựa của chúng ăn. Nhiều lắm, cháu đếm không xuể.',
    got:()=>knows('ngua')?'Biết quân kỵ giặc đóng xa bến (bạn biết cưỡi ngựa, đếm được số máng cỏ)':null},
  {k:'bando',name:'Tấm bảng gỗ',board:true,at:[30.5,148.5],
    line:()=>S.van>=DOTIN.VAN?'Giặc vẽ thế đất quanh bến Chương Dương, chú bằng chữ Hán: chỗ nào đóng trại, chỗ nào đắp ụ.':'Tấm bảng vẽ nguệch ngoạc, chú chữ Hán. Bạn không đọc được.',
    got:()=>S.van>=DOTIN.VAN?'Đọc được thế đất quanh bến Chương Dương':null}];
const val=v=>typeof v==='function'?v():v;
const okWalk=(x,y)=>walkable(x,y);

export function startDotin(){S.c2.scene='dotin';S.season=0;save();
  showModal({kicker:'Xuân 1285 · tháng ba',title:'Dò tin ở làng Thượng Phúc',
    body:`<p>Ông Đoàn chỉ về phía cụm nhà bên kia cánh đồng: "Làng Thượng Phúc. Giặc đóng một toán ở đó, canh đường ra bến Chương Dương. Người làng chưa chạy kịp còn kẹt lại. Anh lẻn vào hỏi chuyện họ, hỏi được gì hay nấy, rồi về trước khi trời sáng."</p>
      <p class="note">Đi trong bóng tối, tránh quạt sáng trước mặt lính tuần; nhà và cây che được tầm nhìn. Bấm E cạnh người trong làng để hỏi chuyện. Về chỗ bìa tre bấm E để rút. Làng Thượng Phúc và mọi người ở đó là hư cấu.</p>`,
    choices:[{label:'Lẻn vào làng',fn:()=>begin()}]})}

function begin(){
  const pat=LOOPS.map((pts,i)=>{const L=pts.reduce((a,p,j)=>j?a+Math.abs(p[0]-pts[j-1][0])+Math.abs(p[1]-pts[j-1][1]):0,0);
    return walker('p'+i,'Lính tuần',{id:i===1?'giac_ky':'giac'},pts[0][0],pts[0][1],{pts,L,s:i*7,torch:true})});
  const inf=INF.map((d,i)=>{const [x,y]=nearOK(...d.at);return walker('i'+i,d.name,d.look||{id:'ong_gia'},x,y,{d,board:d.board,dir:'down'})});
  const [sx,sy]=nearOK(...START);S.x=sx;S.y=sy;st.P.dir='right';
  setMG({type:'dotin',t:0,clock:0,pat,inf,got:[],tried:{},alert:0,seen:false,lo:false,bub:[],warned:0,exit:[sx,sy],done:false,
    hideNPC:true,roam:true,update:dUpdate,draw:dDraw,post:dPost,hud:dHud,findTarget:dTarget,goal:dGoal,speedMul:()=>.85});
  document.body.classList.add('mg');
  setKeys('<span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> đi</span><span><kbd>E</kbd> hỏi chuyện</span><span>Tránh quạt sáng của lính tuần</span>');
  toast('Đêm không trăng. Ba toán lính cầm đuốc đi tuần quanh làng.',4500);save()}

function sight(g,o){const dx=o.x-g.x,dy=o.y-g.y,d=Math.hypot(dx,dy);if(d>DOTIN.VIEW)return 0;
  if(d>DOTIN.NEAR){const [vx,vy]=DIRV[g.dir]||[0,1];if((dx*vx+dy*vy)/d<DOTIN.CONE)return 0}
  const n=Math.ceil(d/.3);for(let i=1;i<n;i++){const x=Math.floor(g.x+dx*i/n),y=Math.floor(g.y-.4+dy*i/n);if(!walkable(x,y)||get(x,y)===TR)return 0}
  return 1-d/DOTIN.VIEW*.6}
function bub(o,text,t=4){const M=st.MG;M.bub=M.bub.filter(b=>b.o!==o);M.bub.push({o,text,t})}
function dUpdate(dt){const M=st.MG;if(M.done)return;M.t+=dt;M.clock=M.t;M.warned-=dt;for(const b of M.bub)b.t-=dt;M.bub=M.bub.filter(b=>b.t>0);
  for(const g of M.pat){g.s=(g.s+DOTIN.PACE*dt)%g.L;const a=along(g.pts,g.s);g.moving=true;g.walk+=dt*7;g.x=a.x;g.y=a.y;g.dir=a.dir}
  for(const i of M.inf)if(!i.board)i.dir=Math.abs(S.x-i.x)>Math.abs(S.y-i.y)?(S.x>i.x?'right':'left'):(S.y>i.y?'down':'up');
  let v=0;for(const g of M.pat){const s=sight(g,{x:S.x,y:S.y});if(s>v)v=s}
  M.seen=v>0;M.alert=v>0?Math.min(1,M.alert+dt*DOTIN.FILL*(.4+v)):Math.max(0,M.alert-dt*DOTIN.DECAY);
  if(v>0&&M.alert>.45&&M.warned<=0){floatAt('"Ai đó?!"',S.x,S.y-1,'#e07f6b');M.warned=3}
  if(M.alert>=1){M.lo=true;finish(M,'lo');return}
  if(M.t>=DOTIN.T)finish(M,'sang')}
function dTarget(){const M=st.MG;
  if(Math.hypot(S.x-M.exit[0],S.y-M.exit[1])<1.3)return {label:M.got.length?`Rút về trại (${M.got.length} tin)`:'Rút về trại (chưa có tin nào)',act:()=>{if(!M.got.length&&!M.sure){M.sure=1;toast('Chưa hỏi được gì. Bấm E lần nữa nếu vẫn muốn rút.',3000);return}finish(M,'ra')}};
  let best=1.4,t=null;for(const i of M.inf)if(!M.tried[i.d.k]){const d=Math.hypot(i.x-S.x,i.y-S.y);if(d<best){best=d;t=i}}
  if(!t)return null;return {label:t.board?'Xem tấm bảng gỗ':'Hỏi chuyện '+t.name.toLowerCase(),act:()=>ask(t)}}
function ask(i){const M=st.MG;M.tried[i.d.k]=1;const got=val(i.d.got),line=val(i.d.line);
  if(i.board){bub({x:S.x,y:S.y},line,4.6)}else bub(i,line,4.6);
  if(got){M.got.push(i.d.k);floatAt(got,S.x,S.y-1.2,'#9fcaa9')}}
function dGoal(){const M=st.MG;const left=M.inf.filter(i=>!M.tried[i.d.k]&&(!i.board||S.van>=DOTIN.VAN));
  if(left.length){left.sort((a,b)=>Math.hypot(a.x-S.x,a.y-S.y)-Math.hypot(b.x-S.x,b.y-S.y));return [left[0].x,left[0].y]}return M.exit}

function finish(M,how){M.done=true;setMG(null);setKeys();document.body.classList.remove('mg');
  const got=M.got.slice();S.c2.tin2=got;S.c2.dotin={n:got.length,lo:how==='lo'};
  if(got.length)gain('tieng',1);
  const TXT={gac:'giờ đổi gác của thuyền canh',thuyen:'đường đi của thuyền canh',ky:'chỗ đóng quân kỵ',bando:'thế đất quanh bến Chương Dương'};
  ch2Note(got.length?`Tháng ba năm 1285, bạn lẻn vào làng Thượng Phúc giặc đóng, dò được ${got.map(k=>TXT[k]).join(', ')}${how==='lo'?', rồi bị lộ phải chạy':''}.`:`Tháng ba năm 1285, bạn lẻn vào làng Thượng Phúc giặc đóng${how==='lo'?' thì bị lộ, phải chạy ra tay không':' mà không dò được tin gì'}.`);
  save();
  showModal({kicker:'Xuân 1285 · tháng ba',title:how==='lo'?'Tù và rúc lên':'Về trại',
    body:`<p>${how==='lo'?'Một tên lính tuần hét lên rồi thổi tù và. Bạn chạy thục mạng qua ruộng, lội qua mương, mãi tới bìa tre mới dám ngoái lại.':how==='sang'?'Gà đã gáy sáng. Bạn phải rút ra trước khi trời rạng.':'Bạn lẻn ra khỏi làng lúc trời còn tối.'}</p>
      <p>${got.length?`Ông Đoàn nghe bạn kể, gật gù: "${got.length>=3?'Được việc lắm. Chừng này thì trận tới đỡ chết nhiều người.':'Có còn hơn không.'}"`:'Ông Đoàn chỉ thở dài: "Không sao. Còn sống về là được."'}</p>
      <p class="note">Hư cấu. Tin dò được sẽ có ích ở trận sắp tới.</p>`,
    choices:[{label:'Tiếp tục',fn:()=>ch2Go('cuop2')}]})}

/* ---------- vẽ ---------- */
function cone(g){const [vx,vy]=DIRV[g.dir]||[0,1],a=Math.atan2(vy,vx),h=Math.acos(DOTIN.CONE),sx=g.x*T-camX,sy=(g.y-.35)*T-camY,r=DOTIN.VIEW*T;
  ctx.fillStyle='rgba(240,190,110,.13)';ctx.beginPath();ctx.moveTo(sx,sy);ctx.arc(sx,sy,r,a-h,a+h);ctx.closePath();ctx.fill()}
function boardDraw(i){const x=i.x*T-camX,y=i.y*T-camY;ctx.fillStyle='#0b0d0c';ctx.fillRect(x-20,y-44,40,32);ctx.fillRect(x-3,y-14,6,14);ctx.fillStyle='#8a6a42';ctx.fillRect(x-17,y-41,34,26);ctx.fillStyle='#5a4028';ctx.fillRect(x-1,y-14,2,13);
  ctx.fillStyle='#2a1e14';for(let k=0;k<4;k++)ctx.fillRect(x-12+k*7,y-36+(k%2)*6,4,8)}
function dDraw(list){const M=st.MG;
  for(const g of M.pat)drawWalker(list,g,false);
  for(const i of M.inf){if(i.board)list.push({y:i.y,f:()=>boardDraw(i),lab:Math.hypot(i.x-S.x,i.y-S.y)<4?[i.name,i.x,i.y-1.4]:null});else drawWalker(list,i,true);
    if(!M.tried[i.d.k])list.push({y:i.y+.01,f:()=>twinkle(i.x,i.y-(i.board?2:1.7))})}
  list.push({y:M.exit[1],f:()=>twinkle(M.exit[0],M.exit[1]-.5,'#9fcaa9'),lab:Math.hypot(M.exit[0]-S.x,M.exit[1]-S.y)<5?['Bìa tre (rút về)',M.exit[0],M.exit[1]-1.2]:null})}
function dPost(){const M=st.MG,h=[[S.x,S.y,120]];for(const g of M.pat)h.push([g.x,g.y,170]);darkPost(h,.8);
  for(const g of M.pat)if(Math.abs(g.x-S.x)<16&&Math.abs(g.y-S.y)<10)cone(g);drawBubbles(M.bub);goalArrow()}
function dHud(){const M=st.MG,w=Math.min(470,innerWidth-32),x=Math.round(innerWidth/2-w/2);hudBox(x,16,w,46);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#e2bf72';ctx.fillText('Dò tin ở làng Thượng Phúc',x+12,30);
  ctx.textAlign='right';ctx.fillStyle='#aab2a2';ctx.fillText(`tin ${M.got.length} · trời sáng sau ${Math.max(0,Math.ceil(DOTIN.T-M.t))} giây`,x+w-12,30);ctx.textAlign='left';
  ctx.fillStyle=M.seen?'#e07f6b':'#efe8d4';ctx.fillText(M.seen?'Có lính tuần đang nhìn về phía bạn!':M.got.length>=2?'Đã có tin. Về bìa tre bấm E để rút':'Hỏi chuyện người trong làng (bấm E)',x+12,48);hudBar(x+w-150,42,138,M.alert,M.alert>.6?'#e0402a':'#d98a3a')}
