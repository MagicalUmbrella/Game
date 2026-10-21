/* ================= minigame: chèo đò sông Hồng (học nghề chèo thuyền) ================= */
/* Hư cấu. Ông lái đò già mở bến bên bờ tây sông Hồng, phía đông làng An Phú (NPC 'laido' ở state.js). Lần đầu gặp
   ông kể chuyện bến Đông Bộ Đầu năm 1258 (theo Toàn thư). Từ 12 tuổi, mỗi mùa một lần, bạn được cầm chèo một chuyến:
   chở khách sang bờ đông rồi quay về.
   Cách chơi: bấm luân phiên A, D (hoặc ← →) để chèo; bấm một bên liền thì thuyền đi yếu. Nước sông Hồng chảy xiết,
   giữa dòng xiết nhất, đẩy thuyền trôi xuôi (xuống phía nam); giữ W để mũi thuyền ngược dòng, S để xuôi. Cập bờ mà
   lệch bến quá CHEO.TOL ô thì thuyền mắc bãi, phải men bờ (W, S) về đúng bến. Hai chuyến trong CHEO.TMAX giây.
   Kết quả: q = 2 (đúng bến cả hai lần, nhanh), 1 (xong trong giờ), 0 (hết giờ, ông lái đò cầm chèo thay). Chỉ q ≥ 1
   mới thêm một bước nghề chèo thuyền (nghe.js, cần NGHE.cheo.need chuyến). Khách trả tiền đò. */
import {voice} from '../loi.js';
import {TS,Z,ctx} from '../constants.js';
import {MG,P,S,age,save,setMG} from '../state.js';
import {gain,say,setKeys,showModal,spend,toast} from '../ui.js';
import {VW,camX,camY,clock,drawSprite,reduce,shadow} from '../render.js';
import {personSprite} from '../sprites.js';
import {drawBoat,seat} from '../thuyen.js';
import {keys} from '../input.js';
import {knows,practice} from '../nghe.js';
import {hudBar,hudBox} from './flood.js';
import {endMG} from './chung.js';

const src=t=>`<p class="src">Toàn thư chép: ${t}</p>`;
/* bến tây (bờ làng) và bến đông; thuyền chạy ngang trên dòng y = BEN */
export const BEN=64.6,WX=78.6,EX=92.3,SHORE_W=[77.2,BEN],SHORE_E=[93.6,BEN];
export const LAIDO={x:76.6,y:63.5};   // chỗ ông lái đò ngồi chờ khách
/* Độ khó (chỉnh bằng bot trong tests): sức một lần chèo, tốc độ tối đa, sức cản, nước chảy (giữa dòng), sức lái,
   độ lệch bến cho phép, thời gian, thời gian được tính "nhanh". GUST: nước lúc mạnh lúc yếu. */
export const CHEO={IMP:.42,VMAX:3.2,DRAG:.9,CUR:1.7,GUST:.5,STEER:2.3,TOL:.7,TMAX:42,FAST:30};
const now=()=>S.year*4+S.season;
export const cheoOpen=()=>age()>=12&&S.cheoAt!==now();

/* ---------- ông lái đò ---------- */
export function talkLaiDo(){
  if(!S.metLaiDo){S.metLaiDo=true;gain('van',1);gain('vo',1);
    return showModal({kicker:'Bến đò sông Hồng',title:'Ông lái đò',body:`<p>Ông lái đò già ngồi hút thuốc lào trên mũi thuyền, kể chuyện năm bạn ra đời: vua Thái Tông cùng Thái tử ngự lâu thuyền xuôi dòng, đánh tan quân Mông Cổ ở bến Đông Bộ Đầu, ngay mạn trên kia. "Thuyền của ta khi ấy cũng chở quân đấy," ông cười.</p>${src('ngày 24 tháng chạp năm Đinh Tỵ (đầu năm 1258), vua cùng Thái tử ngự lâu thuyền tiến quân đến Đông Bộ Đầu, đón đánh, phá tan quân giặc.')}<p class="note">Ông lái đò là hư cấu.</p>`})}
  const ch=[];
  if(age()>=12)ch.push({label:knows('cheo')?'Chở một chuyến khách sang sông':'Xin ông cho cầm chèo một chuyến',note:S.cheoAt===now()?'mùa này đã chèo':'−2 Sức · mỗi mùa một lần'+(knows('cheo')?'':' · học nghề chèo thuyền'),disabled:S.cheoAt===now(),fn:()=>{if(!spend(2))return;toast('Chèo hai chuyến sang sông về: tốn 2 Sức.',3000);startCheo()}});
  say('Ông lái đò',voice('laido',age()<12?'Sông Hồng xiết lắm, trẻ con đừng ra mép nước. Lớn thêm vài tuổi ta cho cầm chèo.':knows('cheo')?'Tay chèo của cậu giờ hơn cả ta hồi trẻ.':'Chèo đò sông Hồng không như sông Tô Lịch đâu. Nước chảy xiết, mắt phải nhìn bến bên kia, chứ đừng nhìn mái chèo.'),ch)}

/* thuyền đậu ở bến khi không chèo (render.js gọi khi không có màn chơi) */
const MOOR={big:false,x:WX,y:BEN,sx:WX,dir:'right',wake:[],moving:false};
export function drawMoored(list){if(Math.abs(S.x-WX)>30||Math.abs(S.y-BEN)>20)return;drawBoat(list,MOOR,[],[])}

/* ---------- chèo ---------- */
const PAX=['Bà hàng xén','Ông đồ làng bên','Cô gánh rau','Người đi chợ huyện'];
export function startCheo(){
  const B={big:false,x:WX,y:BEN,sx:WX,dir:'right',wake:[],moving:false,v:0};
  const pax=PAX[Math.floor(Math.random()*PAX.length)];
  setMG({type:'cheo',B,t:0,leg:0,phase:'board',k:0,bumps:0,last:null,stuck:false,pax,paxT:0,roam:true,hide:['laido'],speedMul:()=>0,
    update:cUpdate,findTarget:()=>null,draw:cDraw,hud:cHud,key:cKey,meSort:()=>MG.phase==='row'||MG.phase==='swap'?{y:B.y-.5,dy:bob(B)}:null,goal:()=>[MG.leg?WX:EX,BEN]});
  P.dir='right';document.body.classList.add('mg');
  setKeys('<span><kbd>A</kbd> <kbd>D</kbd> luân phiên: chèo</span><span><kbd>W</kbd> ngược dòng · <kbd>S</kbd> xuôi dòng</span><span>Cập đúng bến bên kia rồi quay về</span>');
  toast('Ông lái đò: "A, D đều tay mà chèo. Nước xiết đẩy thuyền trôi xuôi, giữ W cho mũi thuyền ngược lên, nhìn bến bên kia mà lái."',6500)}
const bob=B=>reduce?0:Math.round(Math.sin(clock*2.2+B.sx))/TS;
const sideOf=k=>k==='a'||k==='arrowleft'?'L':k==='d'||k==='arrowright'?'R':null;
function cKey(k){const M=MG;if(!M||M.type!=='cheo')return false;const s=sideOf(k);
  if(s&&M.phase==='row'){M.B.push=(M.B.push||0)+CHEO.IMP*(M.last===s?.25:1);   // lực mái chèo dồn dần vào thuyền, khỏi giật
    M.last=s;M.stroke=.3;return true}
  return k==='w'||k==='s'||k==='arrowup'||k==='arrowdown'||!!s}
function cUpdate(dt){const M=MG,B=M.B;M.t+=dt;M.stroke=Math.max(0,(M.stroke||0)-dt);
  const stern=()=>seat(B,2);
  if(M.phase==='board'||M.phase==='off'){   // bước xuống thuyền / lên bờ
    M.k=Math.min(1,M.k+dt*1.5);const sh=M.phase==='board'?SHORE_W:M.leg?SHORE_W:SHORE_E,st=stern();
    const [a,b]=M.phase==='board'?[sh,st]:[st,sh];S.x=a[0]+(b[0]-a[0])*M.k;S.y=a[1]+(b[1]-a[1])*M.k;P.moving=M.k<1;
    if(M.k>=1){if(M.phase==='board'){M.phase='row';M.k=0}else return finish()}return}
  if(M.phase==='swap'){   // cập bến đông: khách lên bờ, nghỉ một nhịp rồi quay về
    M.k+=dt;const st=stern();S.x=st[0];S.y=st[1];if(M.k>=1.6){M.phase='row';M.k=0;M.leg=1;B.dir='left';B.v=0;B.push=0;B.vy=0;M.last=null;M.paxT=0}return}
  // chèo
  if(M.t>=CHEO.TMAX)return giveUp();
  const sg=M.leg?-1:1,tx=M.leg?WX:EX,mid=(WX+EX)/2,half=(EX-WX)/2,cur=CHEO.CUR*(1-.55*Math.min(1,Math.abs(B.x-mid)/half))*(1+CHEO.GUST*Math.sin(M.t*.9+M.leg*2));   // nước xiết giữa dòng, lúc mạnh lúc yếu
  B.v*=Math.exp(-CHEO.DRAG*dt);
  if(B.push>0){const g=Math.min(B.push,B.push*dt*9+.02);B.push-=g;B.v=Math.min(CHEO.VMAX,B.v+g)}
  const up=keys.w||keys.arrowup,down=keys.s||keys.arrowdown,steer=(down?1:0)-(up?1:0);
  const atBank=sg*(B.x-tx)>=0;
  // lái và nước trôi đổi dần (B.vy), không đổi tốc ngay một nhịp: thuyền đi mượt, có quán tính
  const vyT=atBank?steer*CHEO.STEER*.8:cur+steer*CHEO.STEER;B.vy=(B.vy||0)+(vyT-(B.vy||0))*Math.min(1,dt*5);
  if(!atBank){B.x+=sg*B.v*dt;B.y+=B.vy*dt}
  else{B.x=tx;B.v=0;B.push=0;B.y+=B.vy*dt;   // mắc bãi: chỉ men bờ được
    if(!M.stuck&&Math.abs(B.y-BEN)>CHEO.TOL){M.stuck=true;M.bumps++;toast(B.y>BEN?'Thuyền trôi xuôi quá bến, mắc bãi. Giữ W men bờ ngược lên.':'Thuyền lên quá bến. Giữ S men bờ xuống.',3600)}}
  B.y=Math.max(BEN-7,Math.min(BEN+9,B.y));B.moving=B.v>.15;
  if(B.moving){B.wakeT=(B.wakeT||0)-dt;if(B.wakeT<=0){B.wakeT=.12;B.wake.push({x:B.x-sg*1.4,y:B.y+.05,t:0})}}
  for(const w of B.wake)w.t+=dt;B.wake=B.wake.filter(w=>w.t<1.6);
  const st=stern();S.x=st[0];S.y=st[1];P.dir=B.dir;P.moving=false;
  if(atBank&&Math.abs(B.y-BEN)<=CHEO.TOL){M.stuck=false;B.y+=(BEN-B.y)*Math.min(1,dt*4);
    if(M.leg===0){M.phase='swap';M.k=0;M.paxT=0}else{M.phase='off';M.k=0}}}
function q(){const M=MG;return M.bumps===0&&M.t<=CHEO.FAST?2:1}
function finish(){const M=MG,qq=M.gaveUp?0:q();endMG();S.cheoAt=now();S.x=SHORE_W[0];S.y=SHORE_W[1]+.6;
  if(qq>=1){const was=knows('cheo');practice('cheo');gain('tien',qq);gain('vo',2,true);   // chèo đò cũng là luyện sức

    showModal({kicker:'Bến đò sông Hồng',title:qq===2?'Đò cập đúng bến':'Xong một chuyến',body:`<p>${qq===2?'Hai chuyến, cả hai lần mũi thuyền chạm đúng bến. Ông lái đò gõ tẩu vào mạn thuyền: "Được! Lần sau ta ngồi uống nước thôi."':'Thuyền còn chòng chành, có lúc lệch bến, nhưng khách lên bờ không ướt chân. Ông lái đò gật gù.'}</p><p class="note">Khách trả tiền đò. ${was?'':'Nghề chèo thuyền: '+Math.min(S.nghe.cheo,4)+' chuyến.'}</p>`})}
  else showModal({kicker:'Bến đò sông Hồng',title:'Ông lái đò cầm chèo thay',body:'<p>Nước cuốn thuyền trôi mãi, ông lái đò phải đỡ lấy mái chèo đưa khách vào bờ. "Không sao. Sông Hồng có ai thuần được ngay đâu."</p><p class="note">Chuyến này chưa tính vào nghề chèo thuyền.</p>'});
  save()}
/* hết giờ: ông lái đò cầm chèo đưa thuyền về */
function giveUp(){const M=MG;M.gaveUp=true;M.phase='off';M.k=0;M.leg=1;const B=M.B;B.x=WX;B.y=BEN;B.dir='left'}

function cDraw(list){const M=MG,B=M.B,ld={look:{id:'laido'},at:seat(B,0),dir:B.dir};
  const riders=[ld];if(M.leg===0&&M.phase!=='swap')riders.push({look:{id:'khach'},at:seat(B,1)});
  drawBoat(list,B,riders,[]);
  // khách lên bờ đông
  if(M.phase==='swap'||(M.leg===1&&M.paxT<2)){if(M.leg===1)M.paxT+=1/60;const u=M.phase==='swap'?Math.min(1,M.k/1.2):1,a=seat(B,1),x=a[0]+(SHORE_E[0]+.8-a[0])*u,y=a[1]+(SHORE_E[1]-a[1])*u;
    list.push({y:y,f:()=>{shadow(x,y,10);drawSprite(personSprite({id:'khach'},'right',u<1?[1,0,2,0][Math.floor(clock*8)%4]:0),x,y)},lab:[M.pax,x,y-2]})}
  // mái chèo trong tay bạn
  if(M.phase==='row'||M.phase==='swap')list.push({y:B.y-.49,f:()=>{const sg=B.dir==='right'?1:-1,stroke=M.stroke>0?Math.sin(M.stroke/.3*Math.PI):0,rx=S.x,ry=S.y+bob(B);
    const hx=Math.round((rx+sg*.15)*TS),hy=Math.round((ry-.75)*TS),wx=Math.round((rx-sg*(.9+.6*stroke))*TS),wy=Math.round((ry+.35)*TS);
    ctx.strokeStyle='#6e4a2a';ctx.lineWidth=Z;ctx.beginPath();ctx.moveTo(hx*Z-camX,hy*Z-camY);ctx.lineTo(wx*Z-camX,wy*Z-camY);ctx.stroke();ctx.fillStyle='#8a6238';ctx.fillRect((wx-2)*Z-camX,(wy-1)*Z-camY,Z*4,Z*2)}});
  // cọc bến hai bờ
  for(const [x,y] of [[WX-.9,BEN],[EX+.9,BEN]])list.push({y:y-.6,f:()=>{const sx=Math.round(x*TS),sy=Math.round(y*TS);ctx.fillStyle='#0b0d0c';ctx.fillRect((sx-2)*Z-camX,(sy-14)*Z-camY,4*Z,15*Z);ctx.fillStyle='#8a6238';ctx.fillRect((sx-1)*Z-camX,(sy-13)*Z-camY,2*Z,13*Z);ctx.fillStyle='#e2bf72';ctx.fillRect((sx-1)*Z-camX,(sy-13)*Z-camY,2*Z,2*Z)},lab:[x<80?'Bến làng':'Bến bờ đông',x,y-1.4]})}
function cHud(){const M=MG,B=M.B,w=Math.min(460,VW-32),x=Math.round(VW/2-w/2);hudBox(x,16,w,64);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#9cc7e0';ctx.fillText('Thời gian',x+12,32);hudBar(x+84,26,w-96,1-M.t/CHEO.TMAX,M.t>CHEO.TMAX*.75?'#e0402a':'#7fb3c8');
  const off=B.y-BEN;ctx.fillStyle='#efe8d4';ctx.fillText(`${M.leg?'Chuyến về':'Chuyến sang'} · ${Math.abs(off)<=CHEO.TOL?'đúng hướng bến':off>0?'trôi xuôi '+off.toFixed(1)+' ô: giữ W':'lên quá '+(-off).toFixed(1)+' ô: giữ S'}`,x+12,56);
  ctx.textAlign='right';ctx.fillStyle='#aab2a2';ctx.fillText(`Lệch bến ${M.bumps} lần`,x+w-12,56)}
