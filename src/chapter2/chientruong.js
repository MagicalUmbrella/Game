/* ================= chương hai · chiến trường lớn ================= */
/* Bộ máy cho các trận lớn (Chương Dương, sau này Bạch Đằng): một bãi đánh riêng, không vẽ trên bản đồ thế giới.
   Tọa độ tính bằng điểm ảnh gốc (1 ô = 16), vẽ phóng Z lần như phần còn lại của game. Ba lớp quân (docs/chuong2.md):
   - lớp gần F.near: từng người có máu, đánh, đuổi (bạn, trai làng theo bạn, giặc lẻ, dân binh lẻ);
   - lớp giữa F.blocks: khối quân 8×4 người cùng tiến, giáp mặt thì hàng đầu đánh nhau, khối còn dưới BROKE người thì vỡ, chạy;
     khối thắng khúc mình thì vòng sang sườn khối địch gần nhất; sức từng khúc chiến tuyến F.lane (có khúc ta yếu, có khúc giặc yếu);
   - lớp xa F.far: hàng nghìn chấm người trên đồi, chỉ để nhìn.
   Thêm: thuyền (nhìn từ trên xuống, mũi lên bờ hoặc mũi xuống với thuyền giặc), mưa tên, bụi máu, cờ khối.
   Bên: side 0 là ta, 1 là giặc. Kịch bản từng trận ở file riêng (chuongduong.js) gọi các hàm ở đây. */
import {Z,ctx} from '../constants.js';
import {DPR,VH,VW} from '../render.js';
import {personSprite} from '../sprites.js';

export const CT={COLS:8,ROWS:4,DX:15,DY:12,BROKE:9,BL:74,EN_HP:3,KY_HP:4,ALLY_HP:5};
const hsh=(x,y)=>{let h=(x*374761393+y*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296};
const vn=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,s=t=>t*t*(3-2*t),a=hsh(xi,yi),b=hsh(xi+1,yi),c=hsh(xi,yi+1),d=hsh(xi+1,yi+1);return a+(b-a)*s(xf)+(c-a)*s(yf)+(a-b-c+d)*s(xf)*s(yf)};
const fbm=(x,y)=>vn(x,y)*.55+vn(x*2.1,y*2.1)*.3+vn(x*4.3,y*4.3)*.15;
const mix=(a,b,k)=>a.map((v,i)=>Math.round(v+(b[i]-v)*k));
export const dirTo=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
export const walkF=(t,o)=>[1,0,2,0][Math.floor(t*7+o)%4];
const TA_LOOK=['trai','trai2','trai3','trai4','huong_binh','huong_binh2','dan_nam1','dan_nam2'];

/* ---------- tạo bãi ---------- */
export function newField(o){
  const F=Object.assign({t:0,lanes:16,lw:130,lx:40,ww:2160,wh:1300,bank:640,hill:[70,210],go:{x:1080,y:250},rnd:mulberry(o.seed||7),
    blocks:[],near:[],boats:[],arrows:[],stuck:[],fx:[],bub:[],far:[],lane:[],camX:0,camY:0,shake:0,banner:null,freeze:0,slow:0},o);
  const R=F.rnd;for(let i=0;i<F.lanes;i++)F.lane.push(.5+R()*.9);
  for(let i=0;i<5000;i++)F.far.push({x:R()*F.ww,y:F.hill[0]+50+R()*(F.hill[1]-F.hill[0]-60),ph:R()*6,side:R()<.55});
  F.bg=bake(F);return F}
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* nền vẽ sẵn một lần, nửa độ phân giải (mỗi điểm nền 2×2 điểm ảnh) cho nhanh: trời rạng, đồi xa, cỏ, gò, bãi cát ẩm, nước nông → sâu */
function bake(F){const w=F.ww>>1,h=F.wh>>1,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),im=x.createImageData(w,h),D=im.data,B=F.bank>>1,[h0,h1]=[F.hill[0]>>1,F.hill[1]>>1],G={x:F.go.x>>1,y:F.go.y>>1};
  for(let y=0;y<h;y++)for(let X=0;X<w;X++){let col;const n=fbm(X/19,y/19),n2=hsh(X,y),goD=Math.hypot((X-G.x)/1.6,y-G.y-10);
    if(y<h0)col=mix([52,40,70],[150,96,96],y/h0);
    else if(y<h1){col=mix([40,58,40],[56,74,46],n);if(n2<.05)col=mix(col,[30,44,30],.6)}
    else if(y<B-13){col=mix([66,92,50],[94,118,62],n);if(n2<.04)col=mix(col,[120,140,74],.7);if(n2>.985)col=[150,130,70]}
    else if(y<B){const k=(y-(B-13))/13+(n-.5)*.4;col=mix([134,118,80],[104,92,64],Math.max(0,Math.min(1,k)));if(n2<.03)col=[90,84,70]}
    else{const dep=Math.min(1,(y-B)/80+(n-.5)*.15);col=mix([84,128,140],[34,64,86],dep);if(y<B+2)col=[200,214,206]}
    if(goD<60&&y>=h0&&y<B-13){const k=1-goD/60;col=mix(col,[118,130,70],k*.8);if(goD>55)col=mix(col,[40,50,30],.5)}
    const i=(y*w+X)*4;D[i]=col[0];D[i+1]=col[1];D[i+2]=col[2];D[i+3]=255}
  x.putImageData(im,0,0);
  for(let i=0;i<Math.round(F.ww/10);i++){const tx=hsh(i,7)*w,ty=h0+12+hsh(i,9)*(h1-h0-20),r=3.5+hsh(i,3)*3.5,bam=hsh(i,5)<.3;
    x.fillStyle='#10180f';x.beginPath();x.arc(tx,ty,r+.5,0,7);x.fill();x.fillStyle=bam?'#3a5a2a':'#2e4a26';x.beginPath();x.arc(tx,ty,r,0,7);x.fill();
    x.fillStyle=bam?'#5a7a3a':'#45663a';x.beginPath();x.arc(tx-r*.3,ty-r*.3,r*.55,0,7);x.fill()}
  F.reeds=[];for(let i=0;i<Math.round(F.ww/4);i++)F.reeds.push({x:hsh(i,11)*F.ww,y:F.bank-4+hsh(i,13)*10,h:6+hsh(i,17)*8,ph:hsh(i,19)*6});
  return c}

/* ---------- khối quân ---------- */
export function mkBlock(F,x,y,side,o={}){const R=F.rnd,men=[];
  for(let r=0;r<CT.ROWS;r++)for(let c=0;c<CT.COLS;c++)men.push({dx:c*CT.DX+Math.sin(r*2+c)*3,dy:r*CT.DY+Math.cos(c*1.7)*2,alive:1,
    look:{id:side?(R()<.15?'giac_ky':'giac'):TA_LOOK[Math.floor(R()*TA_LOOK.length)]},o:R()*4});
  const b=Object.assign({x,y,side,men,str:men.length,broken:0,run:0,fight:0},o);F.blocks.push(b);return b}
const laneOf=(F,x)=>Math.max(0,Math.min(F.lanes-1,Math.floor((x-F.lx+10)/F.lw)));
export const laneX=(F,i)=>F.lx+i*F.lw;
const aliveMen=b=>b.men.filter(m=>m.alive);
function frontY(b){const a=aliveMen(b);if(!a.length)return b.y;return b.y+(b.side?Math.max(...a.map(m=>m.dy)):Math.min(...a.map(m=>m.dy)))}
export function killMan(F,b,m){if(!m||!m.alive)return;m.alive=0;b.str--;dust(F,b.x+m.dx,b.y+m.dy-12,'#c03020',4)}
function killFront(F,b){const a=aliveMen(b);if(!a.length)return;const fy=b.side?Math.max(...a.map(m=>m.dy)):Math.min(...a.map(m=>m.dy));
  const row=a.filter(m=>Math.abs(m.dy-fy)<6);killMan(F,b,row[Math.floor(F.rnd()*row.length)])}
function killSide(F,b,left){const a=aliveMen(b);if(!a.length)return;const fx=left?Math.min(...a.map(m=>m.dx)):Math.max(...a.map(m=>m.dx));
  const col=a.filter(m=>Math.abs(m.dx-fx)<8);killMan(F,b,col[Math.floor(F.rnd()*col.length)])}
/* Một nhịp cho mọi khối. adv: giặc có tiến không (chưa lên bờ thì giặc đứng chờ). mul(b): hệ số sức khối b (kịch bản thêm, ví dụ
   khúc có bạn đứng thì ta mạnh lên). Sức khúc F.lane[i]: lớn thì giặc mạnh, nhỏ thì ta mạnh. */
export function updateBlocks(F,dt,adv,mul=()=>1){const R=F.rnd;
  const L=b=>F.lane[laneOf(F,b.x+60)]||1,rate=(b,o)=>(b.side?1.5*L(o):2/L(o))*mul(b);
  for(const b of F.blocks){b.fight=0;b.face=null;if(b.broken){b.run+=dt;continue}
    const foe=F.blocks.filter(o=>o.side!==b.side&&!o.broken&&Math.abs(o.x-b.x)<100&&(b.side?o.y>b.y-20:o.y<b.y+20)).sort((a,c)=>Math.abs(a.y-b.y)-Math.abs(c.y-b.y))[0];
    const gap=foe?(b.side?frontY(foe)-frontY(b):frontY(b)-frontY(foe)):999;
    const mate=F.blocks.find(o=>o!==b&&o.side===b.side&&!o.broken&&Math.abs(o.x-b.x)<100&&(b.side?o.y>b.y:o.y<b.y)&&Math.abs(o.y-b.y)<60);
    if(foe&&gap<=13){b.fight=1;if(R()<dt*rate(b,foe))killFront(F,foe)}
    else if(foe){if(!mate){const sp=b.side?(adv?14:0):(b.y>F.bank?16:42);b.y+=(b.side?1:-1)*sp*dt}}
    else if(adv){const o=F.blocks.filter(o=>o.side!==b.side&&!o.broken).sort((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y))[0];
      if(o&&Math.hypot(o.x-b.x,o.y-b.y)<700){const left=b.x<o.x,tx=o.x+(left?-F.lw+8:F.lw-8),ty=o.y,dx=tx-b.x,dy=ty-b.y;
        if(Math.abs(dx)<6&&Math.abs(dy)<10){b.fight=1;b.face=left?'right':'left';o.fight=1;if(R()<dt*rate(b,o)*1.6)killSide(F,o,left)}
        else{const sp=26*dt;if(Math.abs(dx)>=6){b.x+=Math.sign(dx)*Math.min(sp,Math.abs(dx));b.face=dx>0?'right':'left'}else b.y+=Math.sign(dy)*Math.min(sp,Math.abs(dy))}}
      else if(!b.side&&b.y>F.go.y+60)b.y-=20*dt}   // hết giặc trước mặt: ta tiến dần lên phía gò
    if(b.str<CT.BROKE){b.broken=1;if(b.onBreak)b.onBreak(b)}}
  for(const b of F.blocks)for(const m of b.men)if(m.atk>0)m.atk-=dt}
export function blocksNear(F,x,y,r,side){return F.blocks.filter(b=>!b.broken&&b.side===side&&Math.abs(b.x+60-x)<r+70&&Math.abs(b.y+20-y)<r+30)}

/* ---------- người lớp gần ---------- */
export function addNear(F,x,y,side,o={}){const R=F.rnd;const ky=side&&R()<.15;
  const e=Object.assign({x,y,side,look:{id:side?(ky?'giac_ky':'giac'):TA_LOOK[Math.floor(R()*TA_LOOK.length)]},hp:side?(ky?CT.KY_HP:CT.EN_HP):3,max:3,
    sw:0,cd:R()*.8,dir:side?'down':'up',dead:0,t:0,vx:0,vy:0,o:R()*4,mv:0,stun:0},o);F.near.push(e);return e}
/* đi 4 hướng: trục chênh nhiều hơn đi trước */
function step(e,tx,ty,sp){const dx=tx-e.x,dy=ty-e.y;if(Math.abs(dx)>Math.abs(dy)+2)e.x+=Math.sign(dx)*Math.min(sp,Math.abs(dx));else e.y+=Math.sign(dy)*Math.min(sp,Math.abs(dy));e.mv=1}
/* Một nhịp cho người lớp gần. P là bạn (cũng là mục tiêu của giặc). hit(tg,e): kịch bản xử lý khi một người bị trúng đòn. */
export function updateNear(F,dt,P,o){const R=F.rnd,fight=o.fight;
  for(const e of F.near){e.t+=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=.85;e.vy*=.85;e.mv=0;if(e.dead)continue;if(e.say>0)e.say-=dt;
    if(e.flee){e.y+=(e.side?-70:70)*dt;e.dir=e.side?'up':'down';e.mv=1;continue}
    e.cd-=dt;e.sw-=dt;e.stun-=dt;if(e.stun>0)continue;
    let foes=e.side?(fight?[P]:[]).concat(F.near.filter(f=>!f.side&&!f.dead&&!f.flee)):F.near.filter(f=>f.side&&!f.dead&&!f.flee);
    let tg=null,bd=1e9;for(const f of foes){const d=Math.hypot(f.x-e.x,f.y-e.y)+(f===P?-6:0);if(d<bd){bd=d;tg=f}}
    if(e.ally){const dp=Math.hypot(P.x-e.x,P.y-e.y);if(dp>60||!tg||bd>70){tg=null;if(dp>26){step(e,P.x+e.slot[0],P.y+e.slot[1],(dp>90?110:80)*dt);e.dir=dirTo(P.x-e.x,P.y-e.y)}continue}}
    if(!tg){if(!e.side&&!e.ally&&fight){e.y-=40*dt;e.dir='up';e.mv=1}continue}
    e.dir=dirTo(tg.x-e.x,tg.y-e.y);const sp=(e.y>F.bank?28:(e.side?40:52))*dt*(e.spd||1);
    if(bd>15)step(e,tg.x,tg.y,sp);
    else if(e.cd<=0){e.cd=.8+R()*.7;e.sw=.22;if(R()<.5){if(tg===P)o.hitMe(e);else{tg.hp--;dust(F,tg.x,tg.y-14,'#c03020',3);if(tg.hp<=0){tg.dead=1;tg.t=0;if(o.died)o.died(tg,e)}}}}}
  // không đứng chồng lên nhau
  const live=F.near.filter(e=>!e.dead);for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){const a=live[i],b=live[j],dx=b.x-a.x,dy=b.y-a.y;
    if(Math.abs(dx)<9&&Math.abs(dy)<6){const k=dt*30;if(Math.abs(dx)>=Math.abs(dy)){const s=dx>=0?1:-1;a.x-=s*k;b.x+=s*k}else{const s=dy>=0?1:-1;a.y-=s*k;b.y+=s*k}}}
  F.near=F.near.filter(e=>!(e.dead&&e.t>10&&!e.ally));}
export function nearFoes(F,side){return F.near.filter(e=>e.side===side&&!e.dead&&!e.flee)}

/* ---------- mưa tên ---------- */
export function volley(F,P,n,spread){const R=F.rnd;for(let i=0;i<n;i++){const nr=i<n*.35;F.arrows.push({x:nr?P.x+(R()-.5)*110:P.x+(R()-.5)*spread,y:nr?P.y+(R()-.5)*70:F.bank-180+R()*280,t:0,T:1.1+R()*.3})}}
export function updateArrows(F,dt,hitAt){for(const a of F.arrows){a.t+=dt;if(a.t>=a.T&&!a.done){a.done=1;F.stuck.push({x:a.x,y:a.y,t:0});hitAt(a.x,a.y)}}
  F.arrows=F.arrows.filter(a=>!a.done);for(const s of F.stuck)s.t+=dt;F.stuck=F.stuck.filter(s=>s.t<6)}

/* ---------- hiệu ứng ---------- */
export function dust(F,x,y,c,n){const R=F.rnd;for(let i=0;i<n;i++)F.fx.push({x,y,vx:(R()-.5)*80,vy:-R()*60,a:1,c})}
export function updateFx(F,dt){for(const f of F.fx){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=150*dt;f.a-=dt*1.4}F.fx=F.fx.filter(f=>f.a>0);F.shake=Math.max(0,F.shake-dt);
  for(const b of F.bub)b.t-=dt;F.bub=F.bub.filter(b=>b.t>0);if(F.banner)F.banner.t-=dt}
export function say(F,o,text,t=3.4){F.bub=F.bub.filter(b=>b.o!==o);F.bub.push({o,text,t})}

/* ---------- vẽ ---------- */
export const view=()=>({w:VW/Z,h:VH/Z});
let ox=0,oy=0;
/* đặt phép biến đổi theo máy quay: gốc là điểm ảnh gốc của bãi */
export function camTransform(F){const v=view(),sh=F.shake>0?Math.round((Math.random()-.5)*6*F.shake/.3):0;
  F.camX=Math.max(v.w/2,Math.min(F.ww-v.w/2,F.camX));F.camY=Math.max(v.h/2,Math.min(F.wh-v.h/2,F.camY));
  ox=Math.round(v.w/2-F.camX)+sh;oy=Math.round(v.h/2-F.camY)+sh;ctx.setTransform(DPR*Z,0,0,DPR*Z,ox*DPR*Z,oy*DPR*Z);ctx.imageSmoothingEnabled=false}
export const toScreen=(x,y)=>[(x+ox)*Z,(y+oy)*Z];
export const vis=(F,x,y,m=80)=>{const v=view();return Math.abs(x-F.camX)<v.w/2+m&&Math.abs(y-F.camY)<v.h/2+m};
export function person(look,x,y,dir,f){const c=personSprite(look,dir,f);ctx.drawImage(c,Math.round(x)-c.ax,Math.round(y)-c.ay)}
function shadowAt(x,y){ctx.fillStyle='rgba(20,15,10,.28)';ctx.fillRect(Math.round(x)-5,Math.round(y)-1,10,2)}
const BL=CT.BL,hullW=k=>Math.round(14*Math.sin(Math.PI*Math.min(1,Math.max(0,k))*.92+.12));
/* thuyền nhìn từ trên xuống. b.y là đuôi, mũi ở b.y−BL (thuyền ta, mũi lên bờ) hoặc b.y+BL (b.down: thuyền giặc mũi xuống) */
function boatBack(b){const x=Math.round(b.x),y=Math.round(b.y),s=b.down?1:-1,dark=b.side;
  for(let i=0;i<BL;i++){const w=hullW(i/BL),yy=y+s*i;ctx.fillStyle='#0b0d0c';ctx.fillRect(x-w-1,yy,w*2+2,1);if(w>1){ctx.fillStyle=i%7===0?(dark?'#1e1e24':'#3e2614'):(dark?'#33343c':'#5a3a22');ctx.fillRect(x-w+1,yy,w*2-2,1)}}
  const by=y+s*BL;ctx.fillStyle='#0b0d0c';ctx.fillRect(x-2,by-2+s,4,4);ctx.fillStyle=dark?'#4a4a52':'#7a5434';ctx.fillRect(x-1,by-1+s,2,2);
  if(!dark){ctx.fillStyle='#f0e6c8';ctx.fillRect(x-6,by-s*8-1,3,3);ctx.fillRect(x+3,by-s*8-1,3,3);ctx.fillStyle='#0b0d0c';ctx.fillRect(x-5,by-s*8,1,1);ctx.fillRect(x+4,by-s*8,1,1);ctx.fillStyle='#c8302a';ctx.fillRect(x-7,by-s*12,14,1)}}
function boatFront(F,b){const x=Math.round(b.x),y=Math.round(b.y),s=b.down?1:-1,dark=b.side;
  for(let i=0;i<BL;i++){const w=hullW(i/BL),yy=y+s*i;if(w>1){ctx.fillStyle='#0b0d0c';ctx.fillRect(x-w-1,yy,2,1);ctx.fillRect(x+w-1,yy,2,1);ctx.fillStyle=dark?(i%2?'#55565e':'#4a4b52'):(i%2?'#9a7448':'#8a6440');ctx.fillRect(x-w,yy,1,1);ctx.fillRect(x+w-1,yy,1,1)}}
  const w0=hullW(.02);ctx.fillStyle='#0b0d0c';ctx.fillRect(x-w0,y-1,w0*2,3);ctx.fillStyle=dark?'#2a2a30':'#6a4428';ctx.fillRect(x-w0+1,y,w0*2-2,1);
  const f=Math.round(Math.sin(F.t*6+b.x)*1.5),py=b.down?y-4:y;ctx.fillStyle='#0b0d0c';ctx.fillRect(x+7,py-22,3,22);ctx.fillStyle='#6e4a2a';ctx.fillRect(x+8,py-21,1,20);
  ctx.fillStyle='#0b0d0c';ctx.fillRect(x+9,py-22+f,13,8);ctx.fillStyle=b.flagc||(dark?'#2a2c34':'#c8302a');ctx.fillRect(x+9,py-21+f,11,6);ctx.fillStyle=dark?'#c8a040':'#f0d070';ctx.fillRect(x+13,py-19+f,3,2);
  if(b.lamp){const lx=x-9,ly=(b.down?y+BL*.5:y-BL*.5)-16;ctx.fillStyle='#0b0d0c';ctx.fillRect(lx-1,ly,3,18);ctx.fillRect(lx-3,ly-5,7,7);ctx.fillStyle=Math.sin(F.t*9+b.x)>0?'#ffd77a':'#ffb84a';ctx.fillRect(lx-2,ly-4,5,5)}}
function oar(x,y,dir,t){const a=Math.round(Math.sin(t*5)*4);ctx.fillStyle='#0b0d0c';ctx.fillRect(x+dir*3-1+(dir>0?0:-12),y+a-1,14,3);ctx.fillStyle='#8a6238';ctx.fillRect(x+dir*3+(dir>0?0:-11),y+a,12,1);
  if(Math.sin(t*5)>.7){ctx.fillStyle='rgba(220,235,235,.8)';ctx.fillRect(x+dir*15-1,y+a+2,3,1)}}
/* b.crew: danh sách {look} ngồi trong thuyền (mặc định ba cặp người chèo). b.moving: vệt nước, mái chèo khua */
function pushBoat(F,list,b){const y=b.y,s=b.down?1:-1,top=b.down?y:y-BL,bot=b.down?y+BL:y;
  list.push([top-2,()=>{if(b.moving){ctx.fillStyle='rgba(220,235,235,.7)';for(let k=0;k<4;k++){ctx.fillRect(Math.round(b.x)-8-k*3,Math.round(y)-s*(2+k*3),3,1);ctx.fillRect(Math.round(b.x)+6+k*3,Math.round(y)-s*(2+k*3),3,1)}}boatBack(b)}]);
  if(!b.empty)for(let k=0;k<3;k++)for(let c=0;c<2;c++){const sy=y+s*(16+k*17),px=b.x+(c?6:-6),cr=b.crew&&b.crew[k*2+c];
    if(b.crew&&!cr)continue;const look=cr?cr.look:{id:b.side?'giac':TA_LOOK[(k*2+c+(b.x|0))%TA_LOOK.length]};
    list.push([sy,()=>{person(look,px,sy+2,b.down?'down':'up',0);if(cr&&cr.me){ctx.fillStyle='#0b0d0c';ctx.fillRect(Math.round(px)-3,sy-42,7,5);ctx.fillStyle='#ffe08a';ctx.fillRect(Math.round(px)-2,sy-41,5,3)}}]);
    if(c===0&&b.moving)list.push([sy+1,()=>{const w=hullW(Math.abs(y-sy)/BL);oar(Math.round(b.x)-w,sy-4,-1,F.t+b.x*.1);oar(Math.round(b.x)+w,sy-4,1,F.t+b.x*.1)}])}
  list.push([bot,()=>boatFront(F,b)])}
const corpse=(x,y,side)=>{ctx.fillStyle='#0b0d0c';ctx.fillRect(Math.round(x)-7,Math.round(y)-4,14,5);ctx.fillStyle=side?'#3c4250':'#9b2a22';ctx.fillRect(Math.round(x)-6,Math.round(y)-3,12,3)};
function blockFlag(F,b){const fx=Math.round(b.x+CT.COLS*CT.DX/2+4),fy=Math.round(b.y-30),w=Math.round(Math.sin(F.t*4+b.x));ctx.fillStyle='#0b0d0c';ctx.fillRect(fx-1,fy-1,3,30);ctx.fillStyle='#6e4a2a';ctx.fillRect(fx,fy,1,28);
  ctx.fillStyle='#0b0d0c';ctx.fillRect(fx+1,fy-1,14,10);ctx.fillStyle=b.side?'#2a2c34':'#c8302a';ctx.fillRect(fx+1,fy+w,12,8);ctx.fillStyle=b.side?'#c8a040':'#f0d070';ctx.fillRect(fx+5,fy+3+w,4,2)}
/* Vẽ cả bãi. extra(list): kịch bản thêm thứ cần vẽ (bạn, cờ trên gò…), list là các cặp [y, hàm vẽ]. */
export function drawField(F,extra){camTransform(F);
  const v=view(),sx=Math.max(0,Math.floor(F.camX-v.w/2-2)),sy=Math.max(0,Math.floor(F.camY-v.h/2-2)),sw=Math.min(F.ww-sx,Math.ceil(v.w+4)),sh=Math.min(F.wh-sy,Math.ceil(v.h+4));
  ctx.drawImage(F.bg,sx/2,sy/2,sw/2,sh/2,sx,sy,sw,sh);
  for(let i=0;i<260;i++){const x=(i*97+F.t*(10+i%5))%F.ww,y=F.bank+12+(i*37)%(F.wh-F.bank-20);if(!vis(F,x,y,10))continue;ctx.fillStyle=i%3?'rgba(160,200,210,.5)':'rgba(220,235,235,.6)';ctx.fillRect(Math.round(x),y,i%4?4:6,1)}
  // quân xa trên đồi: bóng người nhỏ (thân 2×3, đầu một điểm), có người giơ giáo, nhấp nhô theo bước chân
  for(const f of F.far){if(!vis(F,f.x,f.y,6))continue;const b=Math.sin(F.t*3+f.ph)>.6?1:0,x=Math.round(f.x),y=Math.round(f.y)-b;
    ctx.fillStyle=f.side?'#2c303a':'#6e2620';ctx.fillRect(x,y,2,3);ctx.fillStyle=f.side?'#6a6e78':'#b08a6a';ctx.fillRect(x,y-1,2,1);if(f.ph<1.2){ctx.fillStyle='#4a3a2a';ctx.fillRect(x+2,y-4,1,5)}}
  const list=[];
  for(const r of F.reeds)if(vis(F,r.x,r.y,10))list.push([r.y,()=>{const w=Math.round(Math.sin(F.t*1.5+r.ph)*1.5);ctx.fillStyle='#4a5a2a';ctx.fillRect(Math.round(r.x),Math.round(r.y-r.h),1,Math.round(r.h));ctx.fillStyle='#8a8a4a';ctx.fillRect(Math.round(r.x)+w,Math.round(r.y-r.h)-2,1,3)}]);
  for(const b of F.boats)if(vis(F,b.x,b.y+(b.down?BL/2:-BL/2),90))pushBoat(F,list,b);
  for(const a of F.arrows){if(!vis(F,a.x,a.y,40))continue;const k=a.t/a.T,r=2+k*6;list.push([a.y-30,()=>{ctx.fillStyle=`rgba(0,0,0,${.15+k*.35})`;ctx.beginPath();ctx.ellipse(Math.round(a.x),Math.round(a.y),r,r/2,0,0,7);ctx.fill();
    if(k>.55){const h=(1-k)*160;ctx.fillStyle='#0b0d0c';ctx.fillRect(Math.round(a.x)-1,Math.round(a.y-h-9),3,9);ctx.fillStyle='#d8c8a0';ctx.fillRect(Math.round(a.x),Math.round(a.y-h-8),1,7)}}])}
  for(const s of F.stuck)if(vis(F,s.x,s.y,10))list.push([s.y,()=>{ctx.fillStyle='#0b0d0c';ctx.fillRect(Math.round(s.x)-1,Math.round(s.y)-8,3,9);ctx.fillStyle='#8a6238';ctx.fillRect(Math.round(s.x),Math.round(s.y)-7,1,7)}]);
  for(const b of F.blocks){if(!vis(F,b.x+60,b.y,200))continue;for(const m of b.men){let x=b.x+m.dx,y=b.y+m.dy;
      if(!m.alive){if(vis(F,x,y,20))list.push([y-30,()=>corpse(x,y,b.side)]);continue}
      if(b.broken){x+=Math.sin(m.dx+b.run*4)*5*b.run;y+=(b.side?-1:1)*b.run*(40+m.dx*.5);if(b.run>14)continue}
      if(!vis(F,x,y,30))continue;
      const fr=b.fight||m.atk>0,ph=Math.sin(F.t*(fr?9:6)+m.o*2);if(b.fight&&!b.broken)y+=(b.side?1:-1)*Math.max(0,ph)*3;
      const dir=b.broken?(b.side?'up':'down'):(b.face||(b.side?'down':'up')),f=b.broken?walkF(F.t,m.o):(fr?(ph>.3?'a1':ph>-.3?'a0':0):walkF(F.t*(b.side?.6:1.4),m.o));
      const look=m.look;list.push([y,()=>person(look,x,y,dir,f)])}
    if(!b.broken)list.push([b.y-14,()=>blockFlag(F,b)])}
  for(const e of F.near){if(!vis(F,e.x,e.y,40))continue;if(e.dead){list.push([e.y-30,()=>corpse(e.x,e.y,e.side)]);continue}
    const wade=e.y>F.bank,f=e.sw>0?(e.sw>.11?'a0':'a1'):(e.mv?walkF(F.t,e.o):0);
    list.push([e.y,()=>{if(!wade)shadowAt(e.x,e.y);person(e.look,e.x,e.y,e.dir,f);if(wade){ctx.fillStyle='#4a7888';ctx.fillRect(Math.round(e.x)-8,Math.round(e.y)-9,16,10);ctx.fillStyle='#c8dcd8';ctx.fillRect(Math.round(e.x)-8,Math.round(e.y)-9,16,1)}}])}
  if(extra)extra(list);
  list.sort((a,b)=>a[0]-b[0]);for(const [,f] of list)f();
  for(const f of F.fx){ctx.globalAlpha=Math.max(0,f.a);ctx.fillStyle=f.c;ctx.fillRect(Math.round(f.x),Math.round(f.y),2,2)}ctx.globalAlpha=1}
/* nhãn tên, lời nói trên đầu, băng chữ lớn: vẽ theo điểm ảnh màn hình */
export function drawLabels(F,labels){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  for(const [txt,x,y,col] of labels){const [px,py]=toScreen(x,y);const w=ctx.measureText(txt).width+10;ctx.fillStyle='rgba(11,13,12,.78)';ctx.fillRect(px-w/2,py-9,w,18);ctx.fillStyle=col||'#e2bf72';ctx.fillText(txt,px,py)}
  for(const b of F.bub){const [px,py]=toScreen(b.o.x,b.o.y-46);const w=Math.min(300,ctx.measureText(b.text).width+16);ctx.globalAlpha=Math.min(1,b.t*2);ctx.fillStyle='#efe8d4';ctx.fillRect(px-w/2,py-12,w,24);ctx.fillStyle='#0b0d0c';ctx.fillRect(px-3,py+12,6,4);ctx.fillText(b.text,px,py,w-10);ctx.globalAlpha=1}
  if(F.banner&&F.banner.t>0){ctx.globalAlpha=Math.min(1,F.banner.t);ctx.font='700 22px "Alegreya SC", Georgia, serif';const w=Math.min(VW-40,ctx.measureText(F.banner.txt).width+60),x=VW/2,y=VH*.36;
    ctx.fillStyle='rgba(11,13,12,.8)';ctx.fillRect(x-w/2,y-26,w,52);ctx.strokeStyle='#8a6a32';ctx.lineWidth=2;ctx.strokeRect(x-w/2+1,y-25,w-2,50);ctx.fillStyle='#e2bf72';ctx.fillText(F.banner.txt,x,y+1);ctx.globalAlpha=1}
  ctx.textAlign='left'}
/* bóng đêm có lỗ sáng, tọa độ trên bãi */
let darkC=null;
export function darkness(holes,a){if(!darkC)darkC=document.createElement('canvas');const W=Math.round(VW*DPR),H=Math.round(VH*DPR);if(darkC.width!==W||darkC.height!==H){darkC.width=W;darkC.height=H}
  const g=darkC.getContext('2d');g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);g.fillStyle=`rgba(8,12,32,${a})`;g.fillRect(0,0,W,H);g.globalCompositeOperation='destination-out';
  for(const [x,y,r] of holes){const [px,py]=toScreen(x,y),sx=px*DPR,sy=py*DPR,rr=r*Z*DPR;if(sx<-rr||sy<-rr||sx>W+rr||sy>H+rr)continue;const gr=g.createRadialGradient(sx,sy,rr*.2,sx,sy,rr);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(sx-rr,sy-rr,rr*2,rr*2)}
  g.globalCompositeOperation='source-over';ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(darkC,0,0)}
/* bản đồ nhỏ của trận: khối ta đỏ, khối giặc xám xanh, bạn trắng, mục tiêu vàng */
export function fieldMini(F,P,goal){ctx.setTransform(DPR,0,0,DPR,0,0);const w=200,h=Math.round(w*F.wh/F.ww),x=VW-w-18,y=VH-h-18,k=w/F.ww;
  ctx.fillStyle='#0b0d0c';ctx.fillRect(x-4,y-4,w+8,h+8);ctx.drawImage(F.bg,x,y,w,h);ctx.strokeStyle='#6b5430';ctx.lineWidth=2;ctx.strokeRect(x-3,y-3,w+6,h+6);
  for(const b of F.blocks){if(b.broken&&b.run>3)continue;ctx.fillStyle=b.broken?(b.side?'#7a8090':'#d08070'):(b.side?'#2a2e3a':'#d0302a');ctx.fillRect(x+(b.x+60)*k-3,y+(b.y+18)*k-2,6,4)}
  if(goal&&Math.floor(F.t*3)%2){ctx.fillStyle='#ffe08a';ctx.fillRect(x+goal[0]*k-3,y+goal[1]*k-3,6,6)}
  ctx.fillStyle='#fff';ctx.fillRect(x+P.x*k-2,y+P.y*k-2,4,4)}
/* mũi tên vàng ở mép màn hình chỉ về mục tiêu (khi mục tiêu ở ngoài khung) */
export function edgeArrow(F,gx,gy){const [px,py]=toScreen(gx,gy);if(px>30&&px<VW-30&&py>70&&py<VH-30)return;ctx.setTransform(DPR,0,0,DPR,0,0);
  const cx=VW/2,cy=VH/2,a=Math.atan2(py-cy,px-cx),r=Math.min(VW,VH)/2-46,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
  ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle='#0b0d0c';ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-10,-11);ctx.lineTo(-10,11);ctx.fill();ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-7,-7);ctx.lineTo(-7,7);ctx.fill();ctx.restore()}
