/* ================= thuyền: sang sông ================= */
/* Chuyến sang sông bằng thuyền, dùng chung cho bến đò (input.js, khi cả hai bờ đã mở) và cảnh bị giải sang trại giặc
   (camp.js). Thuyền đi từ mép nước bờ này (waterLine) sang mép nước bờ kia, nhanh dần rồi chậm dần; người trên thuyền
   ngồi ở các chỗ (seat), chèo đứng ở đuôi thuyền khua mái; sau thuyền có vệt nước.
   Vẽ thành hai lớp: thân thuyền (kể cả mui) vẽ trước người ngồi, mạn trước vẽ sau để che chân người ngồi. */
import {T,TS,Z,ctx} from './constants.js';
import {get,isW} from './map.js';
import {simple} from './sprites.js';
import {flip} from './pixel.js';
import {personSprite} from './sprites.js';
import {MG,P,S,setMG} from './state.js';
import {setKeys,toast} from './ui.js';
import {camX,camY,clock,drawSprite,reduce,shadow} from './render.js';
import {keys} from './input.js';

/* ---------- hình thuyền ---------- */
// đò nan: thân gỗ, mui tre ở giữa; lớp trước chỉ có mạn thuyền
const doBack=()=>simple('doBack',56,22,s=>{s(20,2,18,9,'#c9ab6c');s(21,1,16,2,'#d9bf84');for(let x=22;x<37;x+=3)s(x,3,1,8,'#a88b52');s(19,10,20,1,'#8a6e3e');
  s(3,11,50,6,'#6e4a2a');s(0,9,5,5,'#6e4a2a');s(51,8,5,6,'#6e4a2a');s(3,11,50,1,'#9a6a3e');s(5,17,46,2,'#3a2414');for(let x=8;x<50;x+=7)s(x,12,1,5,'#5a3a20')},28,16);
const doFront=()=>simple('doFront',56,22,s=>{s(3,14,50,3,'#6e4a2a');s(0,12,5,3,'#6e4a2a');s(51,11,5,4,'#6e4a2a');s(3,14,50,1,'#9a6a3e');s(5,17,46,2,'#3a2414')},28,16);
// thuyền giặc chở người: dài, mũi lái vểnh, viền đỏ, cột cờ ở đuôi
const giacBack=()=>simple('giacBack',92,30,s=>{s(80,0,2,20,'#3a2414');s(82,1,10,6,'#1c2a4a');s(84,3,6,1,'#d9b25a');
  s(4,17,84,8,'#4a3020');s(0,12,7,9,'#4a3020');s(85,11,7,10,'#4a3020');s(4,17,84,1,'#8a2a22');s(6,25,80,3,'#2a1a10');for(let x=10;x<86;x+=8)s(x,19,1,6,'#3a2414')},46,22);
const giacFront=()=>simple('giacFront',92,30,s=>{s(4,20,84,5,'#4a3020');s(0,16,7,5,'#4a3020');s(85,15,7,6,'#4a3020');s(4,20,84,1,'#8a2a22');s(6,25,80,3,'#2a1a10')},46,22);
const flips={};const fl=(c,k)=>flips[k]||(flips[k]=flip(c));
const sprites=(big,dir)=>{const b=big?giacBack():doBack(),f=big?giacFront():doFront();return dir==='left'?[fl(b,(big?'gb':'db')),fl(f,(big?'gf':'df'))]:[b,f]};

/* ---------- đường đi trên nước ---------- */
/* Điểm bắt đầu, kết thúc của thuyền trên đường thẳng từ bờ a sang bờ b: mép nước gần a và gần b (lùi vào trong nước một chút). */
export function waterLine(a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*10);let first=null,last=null;
  for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,y=a[1]+(b[1]-a[1])*i/n;if(isW(get(Math.floor(x),Math.floor(y)))){if(!first)first=[x,y];last=[x,y]}}
  if(!first)return null;const ux=(b[0]-a[0])/Math.hypot(b[0]-a[0],b[1]-a[1]),uy=(b[1]-a[1])/Math.hypot(b[0]-a[0],b[1]-a[1]);
  return{s:[first[0]+ux*.8,first[1]+uy*.8],e:[last[0]-ux*.8,last[1]-uy*.8]}}
/* Tạo chuyến đi: thuyền đậu ở s, chở sang e. big: thuyền giặc. speed: ô mỗi giây lúc chèo đều. */
export function makeBoat(a,b,{big=false,speed=1.6}={}){const w=waterLine(a,b);if(!w)return null;
  const d=Math.hypot(w.e[0]-w.s[0],w.e[1]-w.s[1]);
  return{big,sx:w.s[0],sy:w.s[1],ex:w.e[0],ey:w.e[1],x:w.s[0],y:w.s[1],t:0,dur:Math.max(2.5,d/speed),dir:w.e[0]>=w.s[0]?'right':'left',wake:[],moving:false}}
/* Chèo thuyền đi thêm dt giây; trả về true khi tới bờ bên kia. Nhanh dần lúc đầu, chậm dần lúc cập bến. */
export function rowBoat(B,dt){B.t=Math.min(B.dur,B.t+dt);const u=B.t/B.dur,e=u<.5?2*u*u:1-2*(1-u)*(1-u);
  const ox=B.x,oy=B.y;B.x=B.sx+(B.ex-B.sx)*e;B.y=B.sy+(B.ey-B.sy)*e;B.moving=B.t<B.dur;
  if(B.moving&&Math.hypot(B.x-ox,B.y-oy)>0){B.wakeT=(B.wakeT||0)-dt;if(B.wakeT<=0){B.wakeT=.12;B.wake.push({x:B.x-(B.dir==='right'?1.4:-1.4)*(B.big?1.6:1),y:B.y+.05,t:0})}}
  for(const w of B.wake)w.t+=dt;B.wake=B.wake.filter(w=>w.t<1.6);return B.t>=B.dur}
/* Chỗ ngồi thứ i trên thuyền (0 ở mũi). */
export function seat(B,i){const n=B.big?6:3,L=B.big?4.2:2,sg=B.dir==='right'?1:-1,k=Math.min(i,n-1);
  return[B.x+sg*(L/2-.5-k*(L-.8)/(n-1)),B.y-.02]}
const bob=B=>reduce?0:Math.round(Math.sin(clock*2.2+B.sx)*1)/TS;
/* Thêm thuyền vào danh sách vẽ. riders: [{look, at:[x,y], dir}] người ngồi; rowers: người đứng chèo ở đuôi (tự vẽ). */
export function drawBoat(list,B,riders=[],rowers=[]){const [back,front]=sprites(B.big,B.dir),by=B.y+bob(B);
  list.push({y:B.y-.6,f:()=>{   // vệt nước, thân thuyền
    for(const w of B.wake){const a=1-w.t/1.6,px=Math.round(w.x*TS),py=Math.round(w.y*TS);ctx.fillStyle=`rgba(225,240,245,${.55*a})`;const sp=Math.round(2+w.t*5);
      ctx.fillRect((px-sp)*Z-camX,(py+1)*Z-camY,Z*2,Z);ctx.fillRect((px+sp)*Z-camX,(py+1)*Z-camY,Z*2,Z)}
    drawSprite(back,B.x,by)}});
  const sg=B.dir==='right'?1:-1,stroke=Math.sin(clock*(B.moving?5:1.2));
  for(const r of rowers){list.push({y:B.y-.5,f:()=>{   // người chèo đứng ở đuôi, mái chèo khua nước
    const rx=r.at[0],ry=r.at[1]+bob(B);drawSprite(personSprite(r.look,B.dir,B.moving?[1,0,2,0][Math.floor(clock*5)%4]:0),rx,ry);
    const hx=Math.round((rx+sg*.15)*TS),hy=Math.round((ry-.75)*TS),wx=Math.round((rx-sg*(.9+.5*stroke))*TS),wy=Math.round((ry+.35)*TS);
    ctx.strokeStyle='#6e4a2a';ctx.lineWidth=Z;ctx.beginPath();ctx.moveTo(hx*Z-camX,hy*Z-camY);ctx.lineTo(wx*Z-camX,wy*Z-camY);ctx.stroke();
    ctx.fillStyle='#8a6238';ctx.fillRect((wx-2)*Z-camX,(wy-1)*Z-camY,Z*4,Z*2)}})}
  riders.forEach((r,i)=>list.push({y:B.y-.45+i*.001,f:()=>drawSprite(personSprite(r.look,r.dir||B.dir,0),r.at[0],r.at[1]+bob(B)+.32)}));
  list.push({y:B.y-.3,f:()=>drawSprite(front,B.x,by)});
}

/* ---------- bến đò (khi đã mở vùng bên kia) ---------- */
/* Chuyến đò thường: ông lái đò đứng chèo, bạn ngồi giữa thuyền. Giữ Space để thuyền đi nhanh. */
export function startFerry(f,a,b){const B=makeBoat(a,b,{speed:1.7});if(!B){S.x=b[0];S.y=b[1];return}
  const prev={x:S.x,y:S.y};
  setMG({type:'ferry',B,roam:true,hideNPC:false,speedMul:()=>0,phase:'board',k:0,from:a,to:b,
    update(dt){const M=MG,f2=keys[' ']?3:1;
      if(M.phase==='board'){M.k=Math.min(1,M.k+dt*1.6);const st=seat(B,1);S.x=prev.x+(st[0]-prev.x)*M.k;S.y=prev.y+(st[1]-prev.y)*M.k;P.moving=M.k<1;if(M.k>=1)M.phase='row';return}
      if(M.phase==='row'){if(rowBoat(B,dt*f2)){M.phase='land';M.k=0}const st=seat(B,1);S.x=st[0];S.y=st[1];P.dir=B.dir;P.moving=false;return}
      M.k=Math.min(1,M.k+dt*1.6);const st=seat(B,1);S.x=st[0]+(b[0]-st[0])*M.k;S.y=st[1]+(b[1]-st[1])*M.k;P.moving=M.k<1;
      if(M.k>=1){setMG(null);setKeys();document.body.classList.remove('mg');toast('Đò cập bến bên kia sông.',2600)}},
    draw(list){drawBoat(list,B,[],[{look:{id:'dan1'},at:seat(B,2)}])},
    meSort:()=>MG.phase==='row'?{y:B.y-.44,dy:.32+bob(B)}:null,
    findTarget:()=>null,key:k=>k===' '});
  document.body.classList.add('mg');setKeys(`<span>${f.name}</span><span>Giữ <kbd>Space</kbd> cho thuyền đi nhanh</span>`)}
/* người chơi ngồi trên thuyền: render.js vẽ người chơi ở S; khi đang chèo, chỉ cần đặt S vào chỗ ngồi */
export const onBoat=()=>MG&&(MG.type==='ferry'&&MG.phase==='row'||MG.type==='escort'&&MG.phase==='row');
