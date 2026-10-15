/* ================= nền đất ================= */
/* Vẽ sẵn nền bản đồ ra canvas theo từng mảnh CH×CH ô (mỗi mùa một bộ, giữ tối đa CACHE mảnh, mảnh lâu không dùng
   thì bỏ). Bản đồ thế giới quá lớn để vẽ một lần. Tô từng điểm ảnh: cỏ loang nhiều tông theo nhiễu mịn, khóm cỏ,
   hoa, sỏi; đường đất có vệt sẫm và đá; ranh giới cỏ với đường, cát lượn theo nhiễu chứ không vuông theo ô; nước
   sâu nông theo khoảng cách tới bờ, có bọt ven bờ và vệt sóng; ruộng có bờ, lúa theo mùa; núi đá có vách; tường
   thành gạch có lỗ châu mai; sân lát đá; biển. Không đổi ô nào của bản đồ.
   Khoảng cách tới bờ (distTo) tính trong mảnh có thêm lề MG ô mỗi bên, lề lớn hơn khoảng cách xa nhất cần tính,
   nên ghép các mảnh lại không lộ đường nối. */
import {BI,BR,DK,FI,G,GA,H,MO,PA,SA,ST,TR,TS,W,WA,WL,WR} from './constants.js';
import {Hs,mk} from './pixel.js';
import {BUILDINGS,CULVERT,get,map} from './map.js';

export const CH=32;const MG=3,CP=CH*TS,LW=(CH+2*MG)*TS,CACHE=56;
const rgb={};const C=h=>rgb[h]||(rgb[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);

/* nhiễu giá trị mịn (0..1), tỉ lệ sc điểm ảnh một ô lưới */
function vn(x,y,sc,k){const gx=x/sc,gy=y/sc,x0=Math.floor(gx),y0=Math.floor(gy),fx=gx-x0,fy=gy-y0,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
  const a=Hs(x0,y0,k),b=Hs(x0+1,y0,k),c=Hs(x0,y0+1,k),d=Hs(x0+1,y0+1,k);return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}
const fbm=(x,y,k)=>vn(x,y,22,k)*.6+vn(x,y,8,k+5)*.3+vn(x,y,3,k+9)*.1;

/* ---- vật liệu từng điểm ảnh và khoảng cách tới vật liệu khác (tính cho từng mảnh) ---- */
const K={grass:0,path:1,sand:2,water:3,field:4,rock:5,wall:6,stone:7,hong:8,dike:9,sea:10};
const wet=k=>k===K.water||k===K.hong||k===K.sea;
const kindOf=t=>t===G||t===TR?K.grass:t===PA?K.path:t===SA?K.sand:t===DK?K.dike:t===WR?K.hong:t===BI?K.sea:t===WA||t===BR?K.water:t===FI?K.field:t===MO?K.rock:t===WL?K.wall:K.stone;
const q=new Int32Array(LW*LW);   // hàng đợi BFS dùng chung (distTo chạy trọn một lần, không xen kẽ)
/* vật liệu từng điểm ảnh của mảnh (cx, cy) kể cả lề, gốc ở điểm ảnh ((cx*CH-MG)*TS, (cy*CH-MG)*TS) */
function prep(cx,cy){const mat=new Uint8Array(LW*LW),ox0=(cx*CH-MG)*TS,oy0=(cy*CH-MG)*TS;
  for(let y=0;y<LW;y++){const ty=(oy0+y)>>4;for(let x=0;x<LW;x++)mat[y*LW+x]=kindOf(get((ox0+x)>>4,ty))}return mat}
/* khoảng cách (điểm ảnh, tối đa lim) từ mỗi điểm tới điểm gần nhất thỏa src(kind) */
function distTo(mat,src,lim){
  const d=new Uint8Array(LW*LW).fill(255);let h=0,t=0;
  for(let i=0;i<LW*LW;i++)if(src(mat[i])){d[i]=0;q[t++]=i}
  while(h<t){const i=q[h++],v=d[i]+1;if(v>lim)continue;const x=i%LW;
    if(x>0&&d[i-1]>v){d[i-1]=v;q[t++]=i-1}if(x<LW-1&&d[i+1]>v){d[i+1]=v;q[t++]=i+1}
    if(i>=LW&&d[i-LW]>v){d[i-LW]=v;q[t++]=i-LW}if(i<LW*(LW-1)&&d[i+LW]>v){d[i+LW]=v;q[t++]=i+LW}}
  return d}

/* ---- bảng màu theo mùa ---- */
const GRASS=[['#5d9a3e','#78b24d','#93c45d','#4c8434'],['#4d8c35','#62a043','#7cb552','#3f772c'],['#8d9a42','#a3ad4f','#bcbf63','#76823a'],['#7a8d64','#8c9e73','#a3b388','#66785a']];
const FLOWER=[['#f4a9bc','#fff4e2'],['#f4d84c','#fff4e2'],['#e3893a','#f4c04a'],null];
const TOLICH=[['#4f9fb5','#3f8aa6','#33789a','#a8dde6'],['#459cb8','#378aa8','#2b7799','#a2dbe8'],['#5096a8','#418299','#357189','#a9d4dc'],['#5a8fa0','#4b7f90','#3f6f80','#b5d3da']];
const HONG=[['#b98058','#a96e4a','#965f3e','#dcb592'],['#be7a4e','#ad6a40','#985a35','#e0b48e'],['#b1835e','#a07250','#8c6244','#d8b998'],['#a6826a','#94725c','#80634f','#cfb9a8']];
const SEA=[['#3f86a6','#2f7296','#245f86','#a8d8e4'],['#3a86ac','#2b729c','#1f5e8c','#a2d6e6'],['#46819a','#376f8a','#2c5e7a','#acd2dc'],['#4f7d8e','#416d7e','#365d6e','#b4cfd6']];
const FIELD=[{g:'#79a998',d:'#6a9a8a',l:'#93c0ae'},{g:'#4a7a36',d:'#3c682c',l:'#5a8a40'},{g:'#8c7a44',d:'#776737',l:'#a08c52'},{g:'#76614a',d:'#62503c',l:'#8a7258'}];

const cache=new Map();
/* mảnh (cx, cy) của mùa s, vẽ nếu chưa có */
export function groundChunk(s,cx,cy){const key=s+','+cx+','+cy;let c=cache.get(key);
  if(c){cache.delete(key);cache.set(key,c);return c}   // đưa lên cuối: mới dùng
  const it=bake(s,cx,cy);let r;do r=it.next();while(!r.done);c=r.value;cache.set(key,c);
  if(cache.size>CACHE)cache.delete(cache.keys().next().value);
  return c}
export const hasChunk=(s,cx,cy)=>cache.has(s+','+cx+','+cy);
export const NCX=Math.ceil(W/CH),NCY=Math.ceil(H/CH);
/* Vẽ một mảnh, chia thành nhiều bước nhỏ (generator): vẽ trước lúc rảnh thì mỗi lần chỉ chạy vài mili giây,
   không làm khựng hình; mảnh đang cần thấy ngay thì chạy một mạch (groundChunk). */
function* bake(s,cx,cy){
  const mat=prep(cx,cy);yield;
  const dW=distTo(mat,wet,26);yield;const dL=distTo(mat,k=>!wet(k),26);yield;const dH=distTo(mat,k=>k===K.hong,48);yield;
  const dD=distTo(mat,k=>k!==K.dike,8);yield;const dK=distTo(mat,k=>k===K.dike,3);yield;const dG=distTo(mat,k=>k===K.grass,6);yield;
  const dF=distTo(mat,k=>k!==K.field,4);yield;const dP=distTo(mat,k=>k===K.path||k===K.stone,4);yield;const dR=distTo(mat,k=>k!==K.rock,8);yield;
  const [c,g]=mk(CP,CP),img=g.createImageData(CP,CP),D=img.data;
  const gr=GRASS[s],tl=TOLICH[s],hg=HONG[s],fd=FIELD[s],sea=SEA[s];
  const put=(i,h)=>{const v=C(h),j=i*4;D[j]=v[0];D[j+1]=v[1];D[j+2]=v[2];D[j+3]=255};
  const bx=cx*CP,by=cy*CP;
  for(let ly=0;ly<CP;ly++){if((ly&15)===15)yield;for(let lx=0;lx<CP;lx++){const x=bx+lx,y=by+ly,i=(ly+MG*TS)*LW+lx+MG*TS,o=ly*CP+lx;let k=mat[i];const n=fbm(x,y,3),e=vn(x,y,4,17);
    // ranh giới lượn: đường, cát, sân đá sát cỏ thì cỏ lấn vào 0–3 điểm ảnh theo nhiễu
    if((k===K.path||k===K.sand)&&dG[i]<=1+Math.floor(e*3))k=K.grass;
    switch(k){
    case K.grass:{const v=n+(Hs(x,y,1)-.5)*.08;let col=v<.3?gr[0]:v<.66?gr[1]:gr[2];
      if(dW[i]<=2+Math.floor(e*2))col=dW[i]<=1?'#5b4a32':gr[3];     // bờ đất ẩm sát nước
      else if(dP[i]===1&&e<.5)col=gr[3];                              // cỏ sẫm men theo mép đường
      else if(dK[i]<=2)col=dK[i]===1?gr[3]:gr[0];                     // chân đê
      put(o,col);break}
    case K.path:{const v=n+(Hs(x,y,2)-.5)*.1;put(o,dG[i]<=3+Math.floor(e*3)?(v<.5?'#9d8150':'#ad9160'):v<.38?'#ad9160':v<.7?'#c1a46e':'#cfb582');break}
    case K.sand:{const r=Math.sin((x+vn(x,y,10,4)*14)/3+y/9);put(o,r>.82?'#e9dcae':n<.35?'#c9b47c':'#dbc896');break}
    case K.dike:{const v=n+(Hs(x,y,4)-.5)*.1,dd=dD[i]+Math.floor(e*1.5),east=get((x+5)>>4,y>>4)!==DK;   // đê: mái cỏ hai bên (phía sông tối hơn), mặt đê đất nện
      put(o,dd<=1?gr[3]:dd<=5?(east?(dd<=3?gr[0]:gr[3]):(v<.5?gr[1]:gr[2])):dd<=6?'#9a7e50':v<.35?'#a88c5c':v<.75?'#b9a070':'#cbb284');break}
    case K.hong:
    case K.sea:
    case K.water:{if(dL[i]<=Math.floor(e*3.2)){const st=shoreTile(x,y);if(st===SA){put(o,n<.35?'#c9b47c':'#dbc896');break}if(st===G){put(o,'#5b4a32');break}}   // bờ lượn, bớt gãy khúc theo ô
      const hong=k===K.hong||isHongBridge(x>>4,y>>4),p=k===K.sea?sea:hong?hg:tl,mix=hong||k===K.sea||dH[i]>=48?0:Math.pow(1-dH[i]/48,1.2),   // Tô Lịch ngả dần sang màu phù sa gần chỗ đổ ra sông Hồng
      dd=dL[i]+(e-.5)*3;
      let col=dd<1.6?p[3]:dd<4?p[0]:dd<11?p[1]:p[2];
      if(dd>=2&&Math.sin(x/5+vn(x,y,30,8)*9+(y%9)*1.7)>.93&&Hs(x,y,5)<.7)col=dd<4?p[3]:p[0];   // vệt sóng
      if(mix>0){const a=C(col),b=C(hg[p.indexOf(col)]),j=o*4;for(let q=0;q<3;q++)D[j+q]=a[q]+(b[q]-a[q])*mix;D[j+3]=255}else put(o,col);break}
    case K.field:{const tx=x>>4,ty=y>>4,lx=x&15;
      const bund=dF[i]<2||(tx%6===0&&lx<2&&get(tx-1,ty)===FI);
      if(bund){put(o,dF[i]===0||lx===0?'#6b5a3a':Hs(x,y,3)<.5?gr[1]:gr[2]);break}
      const v=n+(Hs(x,y,6)-.5)*.1;put(o,v<.4?fd.d:v<.75?fd.g:fd.l);break}
    case K.rock:{const v=fbm(x*1.6,y*1.6,11),cliff=dR[i]<=6&&isCliff(x,y);
      let col=v<.35?'#5f6656':v<.62?'#737b67':'#8a927c';if(cliff)col=((x+Math.floor(vn(x,y,6,2)*3))%4===0)?'#3c4136':'#4d5345';
      if(!cliff&&Math.abs(vn(x,y,7,13)-.5)<.025)col='#4a5143';    // vết nứt
      put(o,col);break}
    case K.wall:{put(o,wallPx(x,y));break}
    default:{const lx=x&15,ly=y&15,sx=(x+(((y>>3)&1)?5:0))%11,col=ly%8===0||sx===0?'#7d776a':vn(x,y,9,21)<.45?'#a49d8e':'#b3ac9c';put(o,col)}
    }
  }
  }
  g.putImageData(img,0,0);
  g.save();g.translate(-cx*CP,-cy*CP);details(g,s,cx*CH-1,cy*CH-1,cx*CH+CH,cy*CH+CH);g.restore();
  return c}
/* vẽ nền phần đang nhìn thấy (tọa độ điểm ảnh bản đồ, chưa nhân Z); mảnh thiếu thì vẽ ngay */
export function drawGround(ctx,s,sx,sy,sw,sh,Zm){
  const c0=Math.max(0,Math.floor(sx/CP)),c1=Math.min(NCX-1,Math.floor((sx+sw)/CP)),r0=Math.max(0,Math.floor(sy/CP)),r1=Math.min(NCY-1,Math.floor((sy+sh)/CP));
  for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++){const c=groundChunk(s,cx,cy);ctx.drawImage(c,Math.round((cx*CP-sx)*Zm),Math.round((cy*CP-sy)*Zm),CP*Zm,CP*Zm)}
  queuePrefetch(s,c0-1,r0-1,c1+1,r1+1)}
/* vẽ trước các mảnh quanh chỗ đang nhìn (ring) và các mảnh xin vẽ sẵn (extra), mỗi lần rảnh một mảnh,
   để đi tới không bị khựng */
let ring=null,busy=false,job=null;const extra=[];
function queuePrefetch(s,c0,r0,c1,r1){ring=[s,c0,r0,c1,r1];kick()}
function kick(){if(busy)return;busy=true;setTimeout(prefetchOne,20)}
/* chọn mảnh kế tiếp cần vẽ trước: quanh chỗ đang nhìn trước, rồi tới mảnh xin vẽ sẵn */
function nextJob(){
  if(ring){const [s,c0,r0,c1,r1]=ring;for(let cy=Math.max(0,r0);cy<=Math.min(NCY-1,r1);cy++)for(let cx=Math.max(0,c0);cx<=Math.min(NCX-1,c1);cx++)if(!hasChunk(s,cx,cy))return [s,cx,cy]}
  while(extra.length){const j=extra.shift();if(!hasChunk(j[0],j[1],j[2]))return j}return null}
function prefetchOne(){busy=false;const t0=performance.now();
  while(performance.now()-t0<6){
    if(!job){const j=nextJob();if(!j)return;job={key:j.join(','),it:bake(...j)}}
    if(cache.has(job.key)){job=null;continue}   // đã được vẽ một mạch trong lúc chờ
    const r=job.it.next();if(r.done){cache.set(job.key,r.value);if(cache.size>CACHE)cache.delete(cache.keys().next().value);job=null}}
  kick()}
/* xin vẽ sẵn các mảnh quanh ô (x, y) cho mùa s (màn tiêu đề vẽ sẵn quanh nhà) */
export function prewarm(s,x,y,r=1){const cx=Math.floor(x/CH),cy=Math.floor(y/CH);
  for(let j=cy-r;j<=cy+r;j++)for(let i=cx-r;i<=cx+r;i++)if(i>=0&&j>=0&&i<NCX&&j<NCY)extra.push([s,i,j]);kick()}
/* ảnh toàn bản đồ, một điểm ảnh mỗi ô (bản đồ nhỏ, bản đồ thế giới) */
const ovCache={};
export function overview(s){if(ovCache[s])return ovCache[s];const [c,g]=mk(W,H),img=g.createImageData(W,H),D=img.data,gr=GRASS[s];
  const col=t=>t===G?gr[1]:t===TR?'#2f5a26':t===FI?['#a4c070','#5a8a3e','#c8a848','#8a7a5a'][s]:t===PA||t===BR?'#c1a46e':t===SA?'#dbc896':t===WA?TOLICH[s][1]:t===WR?HONG[s][1]:t===BI?SEA[s][1]:t===MO?'#737b67':t===WL||t===GA?'#946040':t===DK?'#b9a070':'#a49d8e';
  for(let i=0;i<W*H;i++){const v=C(col(map[i])),j=i*4;D[j]=v[0];D[j+1]=v[1];D[j+2]=v[2];D[j+3]=255}
  for(const b of BUILDINGS)for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){const j=(y*W+x)*4;D[j]=107;D[j+1]=58;D[j+2]=40}
  g.putImageData(img,0,0);return ovCache[s]=c}
/* tường thành nổi khối: đoạn ngang có mặt thành (lối đi lát đá, lỗ châu mai ở mép) và vách gạch nhìn từ phía nam;
   đoạn dọc chỉ thấy mặt thành, lỗ châu mai ở phía ngoài. */
function wallPx(x,y){const tx=x>>4,ty=y>>4,lx=x&15,ly=y&15,isWL=(a,b)=>{const t=get(a,b);return t===WL||t===GA};
  const vert=(isWL(tx,ty-1)||isWL(tx,ty+1))&&!(isWL(tx-1,ty)||isWL(tx+1,ty));
  const brick=(bx,by)=>{const row=by>>2,j=(bx+(row%2?4:0))&7;return (by&3)===3||j===7?'#5c3a26':Hs(bx>>3,y>>2,4)<.25?'#a8724c':(by&3)===0?'#b07c56':'#946040'};
  if(vert){const outL=get(tx-1,ty)!==ST&&get(tx-1,ty)!==GA,o=outL?lx:15-lx;
    if(o<3)return (ly&7)<4?(o===2?'#6e6250':'#9a8e78'):(o<2?'#5a4e3e':'#7e725e');   // lỗ châu mai phía ngoài
    if(o===3||o===14)return '#6e6250';return vn(x,y,6,23)<.45?'#a89a82':'#b6a890'}           // lối đi trên thành
  if(ly===0)return (lx&7)<4?'#9a8e78':'#5a4e3e';                                             // răng cưa châu mai
  if(ly<2)return (lx&7)<4?'#8a7e68':'#4e4436';
  if(ly<5)return vn(x,y,6,23)<.45?'#a89a82':'#b6a890';                                       // lối đi trên thành
  if(ly===5)return '#c8baa0';
  const b=brick(x,ly-6);return ly>=14?(ly===15?'#3e2618':'#7a4e34'):ly===6?'#6a4430':b}
const isHongBridge=(tx,ty)=>get(tx,ty)===BR&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>get(tx+a,ty+b)===WR);
/* ô đất liền sát điểm nước này (theo hướng gần nhất trong ô) */
function shoreTile(x,y){const tx=x>>4,ty=y>>4,lx=x&15,ly=y&15,c=[[lx,-1,0],[15-lx,1,0],[ly,0,-1],[15-ly,0,1]].sort((a,b)=>a[0]-b[0]);
  for(const [,a,b] of c){const t=get(tx+a,ty+b);if(t===SA)return SA;if(t===G||t===TR)return G}return -1}
const isCliff=(x,y)=>get(x>>4,(y+6)>>4)!==MO;

/* ---- chi tiết đặt lên trên: khóm cỏ, hoa, sỏi, lúa, cầu, cổng ---- */
function details(g,s,X0,Y0,X1,Y1){
  const p=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  const gr=GRASS[s],fl=FLOWER[s],fd=FIELD[s];
  for(let ty=Math.max(0,Y0);ty<=Math.min(H-1,Y1);ty++)for(let tx=Math.max(0,X0);tx<=Math.min(W-1,X1);tx++){const t=map[ty*W+tx],ox=tx*TS,oy=ty*TS;
    if(t===G||t===TR){
      for(let i=0;i<3;i++){if(Hs(tx,ty,40+i)>.55)continue;const x=ox+1+Math.floor(Hs(tx,ty,50+i)*13),y=oy+3+Math.floor(Hs(tx,ty,60+i)*12);
        p(x,y,1,2,gr[3]);p(x+2,y,1,2,gr[3]);p(x+1,y-1,1,3,gr[3]);p(x+1,y-2,1,1,gr[2]);p(x-1,y+1,1,1,gr[3])}     // khóm cỏ
      if(fl&&Hs(tx,ty,99)<.09){const x=ox+2+Math.floor(Hs(tx,ty,98)*11),y=oy+2+Math.floor(Hs(tx,ty,97)*11);
        for(const[a,b]of[[0,0],[5,2],[2,5]])if(Hs(tx+a,ty+b,96)<.7){p(x+a,y+b-1,1,1,fl[0]);p(x+a-1,y+b,3,1,fl[0]);p(x+a,y+b+1,1,1,fl[0]);p(x+a,y+b,1,1,fl[1])}}
      if(Hs(tx,ty,91)<.05){const x=ox+3+Math.floor(Hs(tx,ty,92)*9),y=oy+4+Math.floor(Hs(tx,ty,93)*9);p(x,y,3,2,'#8e8a7c');p(x,y,2,1,'#b4b0a2');p(x,y+2,3,1,'#4e5a3c')}   // đá nhỏ
    }
    else if(t===PA){for(let i=0;i<3;i++){if(Hs(tx,ty,70+i)>.5)continue;const x=ox+2+Math.floor(Hs(tx,ty,71+i)*11),y=oy+2+Math.floor(Hs(tx,ty,72+i)*11);
        p(x,y,2,1,'#e0caa0');p(x,y+1,2,1,'#8a7046')}}                                              // sỏi
    else if(t===SA){if(Hs(tx,ty,80)<.15){const x=ox+3+Math.floor(Hs(tx,ty,81)*9),y=oy+3+Math.floor(Hs(tx,ty,82)*9);p(x,y,2,1,'#f7efd8');p(x,y+1,2,1,'#b39e6a')}}
    else if(t===FI){
      for(let r=0;r<4;r++)for(let c2=0;c2<4;c2++){const ax=ox+2+c2*4+(r%2),ay=oy+2+r*4;
        if((tx%6===0&&c2===0)||ax<ox+2&&false)continue;
        if(s===0){p(ax,ay+1,1,2,'#7fbf55');p(ax+1,ay,1,3,'#a6d86e');p(ax+2,ay+1,1,2,'#7fbf55');p(ax,ay+3,3,1,'#5a8f8c')}          // mạ non trên nước
        else if(s===1){p(ax-1,ay,4,4,'#3f7a2e');p(ax,ay-1,1,3,'#68ad4a');p(ax+2,ay-1,1,2,'#68ad4a');p(ax+1,ay,1,1,'#8ccc62')}   // lúa xanh rậm
        else if(s===2){p(ax-1,ay,4,4,'#b8902c');p(ax,ay-1,2,2,'#e8c34c');p(ax+2,ay,1,2,'#f2d878');p(ax-1,ay+3,1,1,'#8c6a22')}   // lúa chín trĩu
        else{p(ax,ay+1,1,2,'#9a8460');p(ax+2,ay+1,1,2,'#9a8460');if(Hs(tx+r,ty+c2,5)<.2)p(ax-1,ay+3,4,1,'#8fa8b0')}               // rạ và vũng nước
      }}
    else if(t===WA&&s<3&&Hs(tx,ty,61)<.3&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const n=get(tx+a,ty+b);return n!==WA&&n!==BR})){   // sen, bèo ven bờ
      for(let i=0;i<3;i++){const x=ox+2+Math.floor(Hs(tx,ty,62+i)*10),y=oy+3+Math.floor(Hs(tx,ty,65+i)*9);
        p(x,y,4,2,'#3f7d32');p(x+1,y-1,3,1,'#5d9a3e');p(x+1,y,2,1,'#79b34e');p(x+3,y,1,1,'#2e5a26');
        if(s===1&&i===0){p(x+1,y-3,2,2,'#f08aa8');p(x,y-2,1,1,'#f8b8cc');p(x+3,y-2,1,1,'#d8708e');p(x+1,y-3,1,1,'#ffd0dc')}}}
    else if(t===BR&&CULVERT.has(ty*W+tx)){   // cống qua đê: mặt đê nện đất, hai đầu cống xây đá, miệng cống tối
      p(ox+3,oy,10,16,'#b9a070');for(let i=0;i<6;i++)p(ox+4+Math.floor(Hs(tx,ty,i)*8),oy+Math.floor(Hs(tx,ty,i+9)*15),2,1,i%2?'#a88c5c':'#cbb284');
      p(ox+3,oy,1,16,gr[1]);p(ox+12,oy,1,16,gr[1]);
      for(const cx of[1,13]){p(ox+cx,oy+2,2,12,'#8a8476');p(ox+cx,oy+2,2,1,'#aaa392');p(ox+cx,oy+6,2,1,'#6a6559');p(ox+cx,oy+10,2,1,'#6a6559');p(ox+cx,oy+13,2,1,'#5a554c');
        p(ox+cx+(cx===1?-1:2),oy+5,1,6,'#1e2a30')}}
    else if(t===BR){p(ox+1,oy,14,16,'#9a7044');for(let j=0;j<16;j+=4){p(ox+1,oy+j,14,1,'#6c4e2b');p(ox+1,oy+j+1,14,1,'#b08454')}
      p(ox,oy,1,16,'#4a331e');p(ox+15,oy,1,16,'#4a331e');p(ox+1,oy,1,16,'#7a5532');p(ox+14,oy,1,16,'#7a5532');for(const yy of[2,10]){p(ox,oy+yy,2,3,'#3a2818');p(ox+14,oy+yy,2,3,'#3a2818')}}
    else if(t===GA){p(ox,oy,16,16,'#4e3020');p(ox+2,oy+2,12,14,'#2a1a10');p(ox,oy,16,2,'#7a4a30');p(ox+7,oy+2,2,14,'#6a4028');p(ox+3,oy+7,1,2,'#d9b14a');p(ox+12,oy+7,1,2,'#d9b14a')}
  }
}
