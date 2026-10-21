/* ================= chương hai · trốn khỏi trại giặc Gia Lâm ================= */
/* Hư cấu. Đêm hôm sau ngày bị giải vào trại (chương một, camp.js). Bố cục trại ở trai.js.
   - Rào sau chuồng tù có một cọc mục (LOOSE). Đứng cạnh, giữ E (TRON.PRY giây, không bước đi) để nạy; nạy xong người
     trong chuồng lần lượt chui theo bạn (đi nối đuôi theo vết chân, M.trail).
   - Lính tuần (campFolk ở trai.js) và lính giữ ba cổng (M.gate) có tầm nhìn hình quạt (TRON.VIEW ô, TRON.CONE),
     lều, kho, tháp che khuất tầm nhìn (sight). Ai trong hàng của bạn bị thấy thì thanh "bị lộ" đầy dần; đầy thì bị bắt
     lại, giải về chuồng (M.caught). Bị bắt lại ba lần, hoặc trời sáng (TRON.T giây) mà chưa ra khỏi trại, thì thất bại.
   - Lấy đuốc ở đống lửa (E), đốt kho lương (E ở GRAN): lính giữ cổng bỏ chỗ chạy đi cứu lửa, lính tuần nhìn về phía
     lửa (tầm nhìn còn nửa) trong TRON.DISTRACT giây. Cầm đuốc thì chính bạn sáng, dễ bị thấy hơn.
   - Biết cưỡi ngựa (nghe.js): mở cổng bãi ngựa (E) cho ngựa xổng, lính cũng chạy theo bắt.
   - Ra khỏi rào trại là thoát. Kết quả ghi S.c2.tron, có dòng biên niên. */
import {T,TS,ctx} from '../constants.js';
import {MG,P,S,save,setMG} from '../state.js';
import {floatText,gain,setKeys,showModal,toast} from '../ui.js';
import {camX,camY,clock} from '../render.js';
import {keys} from '../input.js';
import {walker,drawWalker} from '../camp.js';
import {CAMP,FIRES,GATES,GRAN,HORSE,PEN,PEN_IN,campFolk,campMini,campSolid,drawCamp,hideProp,inRect} from '../trai.js';
import {tongue,smoke} from '../climax.js';
import {darkPost} from '../minigames/chung.js';
import {hudBar,hudBox} from '../minigames/flood.js';
import {knows} from '../nghe.js';
import {gainThe} from '../stats.js';
import {ch2Go,ch2Note} from './index.js';

const lc=n=>/^(Mẹ|Cha|Bà|Bé|Cụ|Trai|Cu)/.test(n)?n[0].toLowerCase()+n.slice(1):n;
export const TRON={T:210,PRY:2.4,VIEW:4.6,CONE:.55,FILL:1.5,DECAY:.45,DISTRACT:40,CAUGHT:3};
/* đọc trai.js lúc chạy, không lúc nạp file (vòng import) */
let LOOSE={x:0,y:0};                                   // cọc mục ở rào sau chuồng chính
const gatePost=()=>[{x:CAMP.x0+1.6,y:GATES.w[1]+.5,dir:'right'},{x:CAMP.x1-.6,y:GATES.e[1]+.5,dir:'left'},{x:GATES.s[1]+.5,y:CAMP.y1-.6,dir:'up'}];
const DIRV={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};

export function startTron(){
  const res=S.res||{},caps=(res.lostWho||[]).map((p,i)=>walker('cap'+i,p.name,p.look,PEN.x0+.8+i*.9,PEN.y0+1.2,{dir:'down'}));
  caps.push(walker('la1','Ông Bảy làng Đông',{id:'ong_gia'},PEN.x0+3.6,PEN.y0+.6,{la:true}),walker('la2','Chị Nhài làng Đông',{id:'dan_nu1'},PEN.x0+.6,PEN.y0+2.2,{la:true}));   // người làng khác cùng bị bắt (hư cấu)
  LOOSE={x:PEN.x0+2,y:PEN.y1+1};
  const gate=gatePost().map((g,i)=>walker('gate'+i,'Lính giữ cổng',{id:'giac'},g.x,g.y,{dir:g.dir,torch:true,post:g}));
  S.x=PEN_IN[0];S.y=PEN_IN[1];P.dir='down';
  setMG({type:'tron',t:0,caps,gate,follow:[],trail:[],pry:0,open:false,alert:0,caught:0,torch:false,burn:0,horse:0,seen:false,warned:0,done:false,
    hideNPC:true,roam:true,hideProp,update:tUpdate,draw:tDraw,post:tPost,hud:tHud,findTarget:tTarget,passAt,speedMul:()=>keys.shift?1.1:.75,mini:tMini,
    goal:()=>MG.open?[CAMP.x0-1,GATES.w[1]+.5]:[LOOSE.x+.5,LOOSE.y-.2]});
  document.body.classList.add('mg');
  setKeys('<span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> đi</span><span><kbd>E</kbd> nạy rào, lấy đuốc, đốt kho</span><span>Tránh tầm nhìn lính có đuốc</span>');
  toast(`Đêm 13 tháng giêng. Ông Bảy làng Đông khẽ bảo: "Cọc rào phía sau chuồng mục rồi, nạy được." Phải ra khỏi trại trước khi trời sáng.`,6500);
  S.c2.scene='tron';save();
}
const passAt=(x,y)=>MG.open&&x===LOOSE.x&&y===LOOSE.y;
const inPen=(x,y)=>inRect(Math.floor(x),Math.floor(y),PEN);
const outside=o=>o.x<CAMP.x0-.5||o.x>CAMP.x1+1.5||o.y>CAMP.y1+1.5||o.y<CAMP.y0-.5;

/* tầm nhìn: trong quạt trước mặt (hoặc sát bên), không bị lều, kho, tháp che */
function sight(g,o,view){const dx=o.x-g.x,dy=o.y-g.y,d=Math.hypot(dx,dy);if(d>view)return 0;
  if(d>1.3){const [vx,vy]=DIRV[g.dir]||[0,1];if((dx*vx+dy*vy)/d<TRON.CONE)return 0}
  const n=Math.ceil(d/.3);for(let i=1;i<n;i++){const x=g.x+dx*i/n,y=g.y-.4+(dy)*i/n;if(campSolid(Math.floor(x),Math.floor(y))&&!inPen(x,y))return 0}
  return 1-d/view*.6}
function watchers(){const M=MG;const fol=campFolk().filter(o=>o.torch);return [...fol,...M.gate.filter(g=>!g.away)]}

function tUpdate(dt){const M=MG;if(M.done)return;M.t+=dt;
  // nạy rào: đứng sát cọc mục, giữ E
  const nearLoose=Math.hypot(S.x-(LOOSE.x+.5),S.y-(LOOSE.y-.3))<1.1;
  if(!M.open&&nearLoose&&keys.e&&!P.moving){M.pry+=dt;if(M.pry>=TRON.PRY){M.open=true;M.follow=M.caps.slice();toast('Cọc mục bật ra. Từng người một chui qua lỗ rào theo bạn.',4000)}}
  else if(!M.open)M.pry=Math.max(0,M.pry-dt*.5);
  // người theo sau đi nối đuôi theo vết chân của bạn
  const last=M.trail[M.trail.length-1];if(!last||Math.hypot(last[0]-S.x,last[1]-S.y)>.18)M.trail.push([S.x,S.y,P.dir]);if(M.trail.length>400)M.trail.shift();
  M.follow.forEach((o,i)=>{const k=M.trail.length-1-Math.round((i+1)*4.2);if(k<0)return;const [x,y,dir]=M.trail[k];o.moving=Math.hypot(x-o.x,y-o.y)>.01;if(o.moving){o.walk+=dt*8;o.dir=dir}o.x=x;o.y=y});
  // lính giữ cổng: bỏ chỗ chạy về phía kho, ngựa khi có lửa hay ngựa xổng; hết thì quay về
  const away=M.burn>0||M.horse>0;M.burn=Math.max(0,M.burn-dt);M.horse=Math.max(0,M.horse-dt);
  for(const g of M.gate){const tx=away?(M.burn>0?GRAN.x+2:HORSE.gate+.5):g.post.x,ty=away?(M.burn>0?GRAN.y+GRAN.h+1:HORSE.y1+2.5):g.post.y;
    const dx=tx-g.x,dy=ty-g.y,d=Math.hypot(dx,dy);g.away=away&&d>2;if(d>.1){const sp=(away?3.2:1.6)*dt;if(Math.abs(dx)>Math.abs(dy)){g.x+=Math.sign(dx)*Math.min(sp,Math.abs(dx));g.dir=dx>0?'right':'left'}else{g.y+=Math.sign(dy)*Math.min(sp,Math.abs(dy));g.dir=dy>0?'down':'up'}g.moving=true;g.walk+=dt*8}else{g.moving=false;if(!away)g.dir=g.post.dir}}
  // bị thấy: thanh lộ đầy dần
  const view=TRON.VIEW*(away?.5:1),targets=[{x:S.x,y:S.y,me:true},...M.follow.filter(o=>!inPen(o.x,o.y))];let seen=0;
  if(M.open||!inPen(S.x,S.y))for(const g of watchers())for(const o of targets){if(inPen(o.x,o.y))continue;const v=sight(g,o,view*(o.me&&M.torch?1.5:1));if(v>seen){seen=v}}
  M.seen=seen>0;M.alert=seen>0?Math.min(1,M.alert+dt*TRON.FILL*(.4+seen)):Math.max(0,M.alert-dt*TRON.DECAY);
  if(seen>0&&M.alert>.5&&M.warned<=0){floatText('"Ai đó?!"','#e07f6b');M.warned=3}M.warned-=dt;
  if(M.alert>=1)return caught();
  if(M.t>=TRON.T)return finish(false,'dawn');
  if(outside({x:S.x,y:S.y})&&M.open)return finish(true)}

function caught(){const M=MG;M.caught++;M.alert=0;gainThe(-2);
  if(M.caught>=TRON.CAUGHT)return finish(false,'caught');
  S.x=PEN_IN[0];S.y=PEN_IN[1];M.follow.forEach((o,i)=>{o.x=PEN.x0+.8+i*.9;o.y=PEN.y0+1.2});M.trail=[];M.torch=false;
  toast(`Bị phát hiện! Lính giặc quật bạn ngã, lôi cả hàng về chuồng (${M.caught}/${TRON.CAUGHT}). Cọc rào vẫn chưa ai để ý.`,5000)}

function tTarget(){const M=MG;
  if(!M.open&&Math.hypot(S.x-(LOOSE.x+.5),S.y-(LOOSE.y-.3))<1.1)return{label:`Giữ E để nạy cọc rào mục (${Math.round(M.pry/TRON.PRY*100)}%)`,act:()=>{}};
  if(!M.torch&&!M.burn)for(const f of FIRES)if(Math.hypot(S.x-f[0],S.y-f[1])<1.4&&!inPen(S.x,S.y))return{label:'Rút một cây đuốc từ đống lửa',act:()=>{M.torch=true;toast('Bạn cầm đuốc. Có đuốc thì chính bạn sáng rõ, lính dễ thấy hơn.',3600)}};
  if(M.torch&&!M.burnt&&S.x>=GRAN.x-1&&S.x<=GRAN.x+GRAN.w+1&&S.y>=GRAN.y-1&&S.y<=GRAN.y+GRAN.h+1.5)return{label:'Châm lửa đốt kho lương giặc',act:()=>{M.burnt=true;M.burn=TRON.DISTRACT;M.torch=false;M.alert=Math.max(0,M.alert-.3);toast('Kho lương bốc cháy! Cả trại nháo nhào, lính giữ cổng bỏ chỗ chạy đi dập lửa.',5000)}};
  if(knows('ngua')&&!M.horseOpen&&Math.hypot(S.x-(HORSE.gate+.5),S.y-(HORSE.y1+1.5))<1.4)return{label:'Mở cổng bãi ngựa cho ngựa xổng',act:()=>{M.horseOpen=true;M.horse=TRON.DISTRACT*.6;toast('Bạn quen ngựa, khẽ mở then cổng. Ngựa hí vang, phá chuồng chạy tán loạn, lính ùa ra bắt.',5000)}};
  return null}

function finish(ok,why){const M=MG;M.done=true;setMG(null);setKeys();document.body.classList.remove('mg');
  const saved=ok?M.follow.filter(o=>!o.la).map(o=>o.name):[],lost=(S.res.lostWho||[]).map(p=>p.name).filter(n=>!saved.includes(n));
  S.c2.tron={ok,why:why||'ok',saved,lost,burn:!!M.burnt,horse:!!M.horseOpen,caught:M.caught};
  if(ok){gain('tieng',saved.length?3:1);if(M.burnt)gain('vo',2);
    ch2Note(`Đêm 13 tháng giêng, bạn nạy rào trốn khỏi trại giặc Gia Lâm${saved.length?', đưa theo '+saved.map(lc).join(', '):''}${M.caught?' (bị bắt lại '+M.caught+' lần)':''}.`);
    if(M.burnt)ch2Note('Trước khi trốn, bạn đốt kho lương của giặc trong trại.');if(M.horseOpen)ch2Note('Bạn mở cổng bãi ngựa, ngựa giặc xổng chạy khắp trại.');
    if(lost.length)ch2Note(`Không đưa ra kịp: ${lost.map(lc).join(', ')}.`)}
  else ch2Note(why==='dawn'?'Trời sáng mà bạn chưa ra khỏi trại giặc. Bạn bị giải theo đoàn tù xuống thuyền, đi về phía đông.':'Bạn bị bắt lại ba lần. Giặc xích bạn, giải theo đoàn tù xuống thuyền, đi về phía đông.');
  const seenBy=S.capt&&S.capt.seen;
  showModal({kicker:'Rạng sáng 14 tháng giêng',title:ok?'Ra khỏi trại giặc':'Không thoát được',
    body:ok?`<p>Bạn ${saved.length?'cùng '+saved.map(lc).join(', ')+' ':''}lội qua ruộng nước, chạy mãi tới khi tiếng tù và trong trại xa dần.${M.burnt?' Sau lưng, lửa kho lương còn đỏ rực một góc trời.':''}</p>
      ${seenBy?'<p>Ở bìa lũy tre, một người lạ đón: "Có phải anh là người hôm trước gọi to tên mình khi quan nước ta đi qua trại? Đi theo tôi."</p>':''}
      <p class="note">Hư cấu.</p>`
      :`<p>${why==='dawn'?'Trời rạng, tiếng tù và nổi lên khắp trại.':'Lần thứ ba bị bắt lại, giặc xích chân bạn.'} Bạn bị dồn xuống thuyền cùng đoàn tù, xuôi về phía đông.</p>
      <p>Trên thuyền, giữa đêm, bạn nghe tiếng hò reo trên bờ: dân binh đánh úp đoàn thuyền giặc. Trong hỗn loạn, bạn nhảy xuống sông, bơi vào bờ.</p><p class="note">Hư cấu.</p>`,
    choices:[{label:'Tiếp tục',fn:()=>{ch2Go('tancu')}}]});
  save()}

/* ---------- vẽ ---------- */
function cone(g,view){const [vx,vy]=DIRV[g.dir]||[0,1],a=Math.atan2(vy,vx),h=Math.acos(TRON.CONE),sx=g.x*T-camX,sy=(g.y-.35)*T-camY,r=view*T;
  ctx.fillStyle='rgba(255,200,90,.16)';ctx.beginPath();ctx.moveTo(sx,sy);ctx.arc(sx,sy,r,a-h,a+h);ctx.closePath();ctx.fill()}
function tDraw(list){const M=MG;drawCamp(list);
  for(const o of campFolk())drawWalker(list,o,false);
  for(const g of M.gate)drawWalker(list,g,false);
  for(const c of M.caps)drawWalker(list,c,true);
  if(M.torch)list.push({y:S.y+.01,f:()=>{const px=Math.round((S.x+.35)*TS),py=Math.round((S.y-.4)*TS);tongue(px,py-10,8,5,1)}});
  if(M.burnt)list.push({y:GRAN.y+GRAN.h,f:()=>{for(let x=0;x<GRAN.w;x++){const px=(GRAN.x+x)*TS+8,py=(GRAN.y+1)*TS;smoke(px,py-12,x+9,10);tongue(px,py,16,12,x*1.7)}}});
  if(!M.open)list.push({y:LOOSE.y+.9,f:()=>{if(Math.floor(clock*3)%2){const px=Math.round((LOOSE.x+.5)*TS),py=Math.round((LOOSE.y+.4)*TS);ctx.fillStyle='#ffe08a';ctx.fillRect(px*3-camX-3,py*3-camY-30,6,6)}}})}
function tPost(){const M=MG,h=[[S.x,S.y,M.torch?190:100]];for(const g of watchers())h.push([g.x,g.y,120]);for(const f of FIRES)h.push([f[0],f[1],150]);if(M.burnt)h.push([GRAN.x+GRAN.w/2,GRAN.y+1,320]);
  darkPost(h,.8*(1-Math.max(0,M.t-TRON.T*.75)/(TRON.T*.25)*.5));
  const view=TRON.VIEW*(M.burn>0||M.horse>0?.5:1);for(const g of watchers())if(Math.abs(g.x-S.x)<16&&Math.abs(g.y-S.y)<10)cone(g,view)}   // quạt tầm nhìn vẽ trên lớp tối cho dễ thấy
function tHud(){const M=MG,w=Math.min(440,innerWidth-32),x=Math.round(innerWidth/2-w/2);hudBox(x,16,w,46);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#e2bf72';ctx.fillText('Trốn khỏi trại giặc · đêm 13 tháng giêng',x+12,30);
  const left=Math.max(0,TRON.T-M.t);ctx.fillStyle='#aab2a2';ctx.textAlign='right';ctx.fillText(`trời sáng sau ${Math.floor(left/60)}:${String(Math.floor(left%60)).padStart(2,'0')}`,x+w-12,30);ctx.textAlign='left';
  ctx.fillStyle=M.seen?'#e07f6b':'#efe8d4';ctx.fillText(M.seen?'Có lính đang nhìn về phía bạn!':M.open?`Ra khỏi rào trại · ${M.follow.length} người theo sau${M.torch?' · đang cầm đuốc':''}`:'Nạy cọc rào mục sau chuồng',x+12,48);
  hudBar(x+w-150,42,138,M.alert,M.alert>.6?'#e0402a':'#d98a3a')}
function tMini(m){campMini(m);const dot=(x,y,r,col)=>{m.fillStyle=col;m.fillRect(Math.round(x*2-r),Math.round(y*2-r),r*2,r*2)};
  if(S.capt&&S.capt.map)for(const g of watchers())dot(g.x,g.y,1.5,'#e0402a');dot(LOOSE.x,LOOSE.y,1.5,'#e2bf72')}
