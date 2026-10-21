/* ================= cây cối, đồ vật quanh làng ================= */
/* Cây vẽ bằng code, tô từng điểm ảnh: tán lá là các khối cầu sáng từ trên bên trái, lá lốm đốm theo cụm
   2×2, viền sẫm. Bốn loại cây: cây tán (0), bụi tre (1), cau (2), chuối (3); thêm cây đa đầu làng. Màu đổi
   theo mùa. Đồ vật trang trí (đống rơm, chum nước, bụi cây, lau sậy) đặt cố định theo bản đồ: đống rơm và chum
   cạnh nhà là vật cản (bsolid), bụi cây và lau sậy chỉ để nhìn. */
import {G,H,PA,SA,W,WA} from './constants.js';
import {Hs,mk,outline} from './pixel.js';
import {BUILDINGS,DECOR,SIGNS,bsolid,get} from './map.js';
import {KINH} from './kinhthanh.js';

const rgb={};const C=h=>rgb[h]||(rgb[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
function buf(w,h){const [c,g]=mk(w,h),img=g.createImageData(w,h),D=img.data;
  return {c,g,img,w,h,set(x,y,hex){x|=0;y|=0;if(x<0||y<0||x>=w||y>=h)return;const v=C(hex),j=(y*w+x)*4;D[j]=v[0];D[j+1]=v[1];D[j+2]=v[2];D[j+3]=255},
    on(x,y){return x>=0&&y>=0&&x<w&&y<h&&D[((y|0)*w+(x|0))*4+3]>0},done(){g.putImageData(img,0,0);return c}}}

/* khối lá tròn: P = [tối, giữa, sáng, đốm sáng]; mép lởm chởm, sáng phía trên bên trái */
function leafBall(b,cx,cy,r,P,k,squash=1){
  for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const yy=y/squash,a=Math.atan2(yy,x),rr=r+(Hs(Math.round(a*3),k,7)-.5)*2.2;
    if(x*x+yy*yy>rr*rr)continue;const n=Hs((cx+x)>>1,(cy+y)>>1,k)-.5,l=(-x*.55-y*.85)/r+n*.9;
    b.set(cx+x,cy+y,l<-.45?P[0]:l<.1?P[1]:l<.62?P[2]:Hs(cx+x,cy+y,k+3)<.5?P[3]:P[2])}}
function line(b,x0,y0,x1,y1,col){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++)b.set(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),col)}

const LEAF=[['#2f6b2e','#4a8f3a','#6cb04a','#a6d86a'],['#245a27','#3a7d33','#57a042','#8cc85c'],['#7a4e1c','#a8762a','#cf9f38','#f0cc68'],['#3e5240','#55684f','#6f8064','#93a385']];
const BAMBOO=[['#3a6626','#58883a','#7eac4c','#b4d474'],['#2e5a24','#4a7e32','#6ea444','#a2cc66'],['#6a6a26','#90883a','#b4a84c','#dccc74'],['#4a5a3a','#62724a','#7c8a5e','#a0ac82']];
const sc={};
export function treeSprite(s,v){const key=s+'_'+v;if(sc[key])return sc[key];let c;
  if(v===1){ // bụi tre: nhiều thân vươn cao, lá thành chùm rủ ra hai bên
    const b=buf(36,56),P=BAMBOO[s];
    const CU=s===3?['#7a8a5a','#94a26e']:s===2?['#9a9a3e','#b8b456']:['#7e9c3a','#a6bc56'];
    for(let i=0;i<6;i++){const bx=10+i*3,tx=3+i*6+(Hs(i,s,1)*3|0),ty=6+(Hs(i,2,s)*10|0);   // thân tre mảnh, xòe từ gốc
      for(let y=53;y>=ty;y--){const t=(53-y)/(53-ty),x=Math.round(bx+(tx-bx)*Math.sqrt(t));b.set(x,y,(53-y)%6===0?'#4e6a24':CU[i%2])}}
    for(const [cx,cy,r] of [[7,14,6],[29,13,6],[18,7,7],[4,26,5],[32,25,5],[12,20,5],[24,19,5],[8,35,3],[28,34,3]])leafBall(b,cx,cy,r,P,cx*7+cy,.7);
    for(let i=0;i<40;i++){const x=2+(Hs(i,s,8)*32|0),y=4+(Hs(i,s,9)*26|0);if(!b.on(x,y)&&b.on(x+1,y+1))b.set(x,y,P[1])}   // lá lơ thơ ở mép
    c=b.done();outline(c,'#1d2a1b');c.ax=18;c.ay=54}
  else if(v===2){ // cau: thân mảnh có đốt, tàu lá xòe trên ngọn, buồng cau
    const b=buf(30,58),P=s===2?['#5a6a22','#7a8a2e','#9cac3e','#c8d070']:LEAF[s===3?3:1];
    for(let y=55;y>=14;y--){const x=14+Math.round(Math.sin((55-y)/14)*1.5);b.set(x,y,y%3===0?'#6a6656':'#9a9682');b.set(x+1,y,y%3===0?'#4e4a3e':'#7a7664')}
    for(let i=0;i<8;i++){const a=-Math.PI+i*Math.PI/7+(i%2?.12:-.12),L=11+(i%3),ex=15+Math.cos(a)*L,ey=13+Math.sin(a)*L*.55+(Math.abs(Math.cos(a))*5);
      for(let t=0;t<=1;t+=.06){const x=15+(ex-15)*t,y=13+(ey-13)*t+t*t*5;b.set(x,y,P[1]);b.set(x,y-1,P[2]);if(((t*16)|0)%2)b.set(x+(Math.cos(a+1.6)*2|0),y+2,P[0])}}
    for(const [x,y] of [[13,16],[15,17],[17,16],[14,18],[16,18]])b.set(x,y,s===2?'#e08a2a':'#8aa83a');
    c=b.done();outline(c,'#1d2a1b');c.ax=15;c.ay=56}
  else if(v===3){ // chuối: thân giả to, tàu lá lớn rủ, gân lá sáng
    const b=buf(34,38),P=s===2?['#6a7a26','#8e9a34','#b0b84a','#d8dc80']:s===3?['#4a5e3a','#62764a','#7a8c5c','#a0ae80']:['#3a7a2a','#58a03a','#78bc4c','#b0dc78'];
    for(let y=35;y>=18;y--){b.set(15,y,'#7a9a4a');b.set(16,y,'#9ab45a');b.set(17,y,'#6a8a3e');b.set(18,y,'#58763a')}
    for(const [ex,ey,w] of [[2,14,4],[32,13,4],[6,2,3],[28,3,3],[17,0,3],[1,26,3],[33,24,3]]){
      for(let t=0;t<=1;t+=.04){const x=16.5+(ex-16.5)*t,y=18+(ey-18)*t+Math.sin(t*Math.PI)*-4+t*t*6,ww=Math.sin(t*Math.PI)*w;
        for(let k=-ww;k<=ww;k++){const tear=Hs(Math.round(t*40),ex+k,3)<.12&&Math.abs(k)>ww*.6;if(!tear)b.set(x,y+k,k<-ww*.3?P[2]:k>ww*.4?P[0]:P[1])}
        b.set(x,y,P[3])}}
    c=b.done();outline(c,'#1d2a1b');c.ax=17;c.ay=36}
  else if(v===4){ // sú vẹt ven sông Bạch Đằng, bờ biển: tán thấp xòe rộng, rễ chống hình vòm cắm xuống bùn
    const b=buf(40,34),P=s===3?['#3a4e3a','#4e6248','#66785a','#8a9a78']:s===2?['#3e5a2a','#56742e','#74903c','#a0b05a']:['#1f4a2a','#2f6636','#468446','#7ab062'];
    for(let i=0;i<7;i++){const x0=8+i*4,top=20+(i%2),spread=(i-3)*1.6;   // rễ chống
      for(let t=0;t<=1;t+=.05){const x=x0+spread*t,y=top+t*12-Math.sin(t*Math.PI)*2;b.set(x,y,i%2?'#5a4a36':'#6e5c42')}}
    for(let y=14;y<23;y++){b.set(19,y,'#5a4a36');b.set(20,y,'#6e5c42')}
    for(const [cx,cy,r] of [[10,12,7],[30,12,7],[20,8,8],[15,15,6],[25,15,6]])leafBall(b,cx,cy,r,P,cx*11+cy+s,.75);
    c=b.done();outline(c,'#1d2a1b');c.ax=20;c.ay=32}
  else{ // cây tán
    const b=buf(34,42),P=LEAF[s];
    for(let y=26;y<40;y++){b.set(15,y,'#7a5634');b.set(16,y,'#6b4a2c');b.set(17,y,'#5a3c22');b.set(18,y,'#4c331f')}
    b.set(13,39,'#5a3c22');b.set(14,39,'#6b4a2c');b.set(19,39,'#4c331f');b.set(20,39,'#4c331f');b.set(14,38,'#6b4a2c');b.set(19,38,'#5a3c22');
    line(b,17,30,22,25,'#5a3c22');line(b,15,29,11,25,'#6b4a2c');
    for(const [cx,cy,r] of [[17,10,6],[10,17,6],[24,17,6],[17,18,9],[12,23,5],[22,23,5]])leafBall(b,cx,cy,r,P,cx*13+cy+s);
    if(s===0||s===2)for(let i=0;i<14;i++){const x=6+(Hs(i,s,3)*22|0),y=5+(Hs(i,s,4)*20|0);if(b.on(x,y))b.set(x,y,s===0?(i%2?'#f2a2b6':'#fbd3dc'):(i%2?'#e07a2c':'#c85a22'))}
    c=b.done();outline(c,'#1d2a1b');c.ax=17;c.ay=40}
  return sc[key]=c}

export function banyanSprite(s){const key='ban'+s;if(sc[key])return sc[key];
  const b=buf(64,60),P=LEAF[s];
  for(let y=30;y<56;y++)for(let x=26;x<38;x++)b.set(x,y,x<29?'#7a5634':x<34?'#6b4a2c':'#4c331f');
  for(const [x0,x1] of [[20,26],[38,45]])for(let x=x0;x<x1;x++){const y=54+((x%3)===0?1:0);b.set(x,y,'#5a3c22');b.set(x,y+1,'#4c331f')}
  for(const [cx,cy,r] of [[32,10,10],[18,16,10],[46,16,10],[10,26,8],[54,26,8],[32,22,13],[22,30,7],[42,30,7]])leafBall(b,cx,cy,r,P,cx*5+cy+s);
  for(const rx of [16,21,43,48])for(let y=30;y<50;y++)if(Hs(rx,y,2)<.85)b.set(rx,y,'#5a3c22');   // rễ phụ buông
  const c=b.done();outline(c,'#1d2a1b');c.ax=32;c.ay=56;return sc[key]=c}

/* ---- đồ vật ---- */
function haystack(s){const key='rom'+s;if(sc[key])return sc[key];const b=buf(22,24);
  for(let y=4;y<22;y++){const w=Math.round(Math.sqrt(Math.max(0,1-((y-17)/14)**2))*10);for(let x=11-w;x<=11+w;x++){const n=Hs(x,y>>1,9),l=(11-x)*.06-(y-4)*.03+n*.5;
    b.set(x,y,l>.45?'#f4dc8a':l>.05?'#dcb860':l>-.35?'#b8903c':'#8e6a28')}}
  for(let y=0;y<6;y++)b.set(11,y,'#6a4a2a');b.set(10,5,'#8e6a28');b.set(12,5,'#8e6a28');
  for(let x=4;x<19;x++)if(Hs(x,3,1)<.6)b.set(x,21,'#8e6a28');
  const c=b.done();outline(c);c.ax=11;c.ay=22;return sc[key]=c}
function jar(){if(sc.chum)return sc.chum;const b=buf(14,16);
  for(let y=2;y<15;y++){const w=Math.round(Math.sin((y-1)/14*Math.PI)*6)+1;for(let x=7-w;x<=7+w;x++)b.set(x,y,x<5&&y<9?'#a06a40':x>8||y>11?'#5a3a22':'#7e5230')}
  for(let x=3;x<=11;x++){b.set(x,1,'#4a2e1a');b.set(x,2,'#8e5e38')}b.set(5,5,'#e0b080');b.set(5,6,'#c89068');
  const c=b.done();outline(c);c.ax=7;c.ay=15;return sc.chum=c}
function bush(s,k){const key='bui'+s+k;if(sc[key])return sc[key];const b=buf(18,14),P=LEAF[s];
  leafBall(b,6,8,5,P,k);leafBall(b,11,7,6,P,k+3);if(s<2&&k%3===0)for(let i=0;i<4;i++){const x=3+(Hs(i,k,2)*12|0),y=3+(Hs(i,k,3)*7|0);if(b.on(x,y))b.set(x,y,s?'#f4d84c':'#f4a9bc')}
  const c=b.done();outline(c,'#1d2a1b');c.ax=9;c.ay=13;return sc[key]=c}
function reeds(s,k){const key='lau'+s+k;if(sc[key])return sc[key];const b=buf(16,22),st=s===3?'#a8a274':s===2?'#c8b060':'#7aaa44';
  for(let i=0;i<3;i++){const x0=3+i*4,lean=(Hs(i,k,1)-.5)*5,top=5+(Hs(i,k,2)*5|0);for(let y=20;y>=top;y--)b.set(x0+lean*(20-y)/16,y,i===1?'#5a8a34':st);
    const tx=x0+lean*(20-top)/16;if(i!==1){b.set(tx,top-1,'#7a4e2a');b.set(tx,top-2,'#6a3e1e');b.set(tx,top-3,'#7a4e2a')}else{b.set(tx-1,top+3,st);b.set(tx+1,top+6,st)}}
  const c=b.done();outline(c,'#1d2a1b');c.ax=7;c.ay=21;return sc[key]=c}

/* ---- đặt đồ vật cố định theo bản đồ ---- */
const free=(x,y)=>x>0&&y>0&&x<W-1&&y<H-1&&get(x,y)===G&&!bsolid[y*W+x];
const nearPath=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>get(x+a,y+b)===PA);
export const PROPS=[];
for(const bd of BUILDINGS){if(bd.kind!=='house')continue;
  const spots=[[bd.x-1,bd.y+bd.h-2,'rom'],[bd.x+bd.w,bd.y+bd.h-1,'chum']];
  for(const [x,y,k] of spots)if(free(x,y)&&!nearPath(x,y)){PROPS.push({x,y,k,solid:true});bsolid[y*W+x]=1}}
for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const t=get(x,y),h=Hs(x,y,321);
  const wet=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>get(x+a,y+b)===WA);
  if((t===SA||t===G)&&wet&&h<.16&&!bsolid[y*W+x])PROPS.push({x,y,k:'lau'});
  else if(t===G&&h>.975&&!(x>=27&&x<=59&&y>=49&&y<=73)&&!(x>=KINH.x0&&x<=KINH.x1&&y>=KINH.y0&&y<=KINH.y1)&&!nearPath(x,y)&&!bsolid[y*W+x]&&!DECOR.some(d=>Math.abs(d.x-x)<3&&Math.abs(d.y-y)<3)&&!SIGNS.some(s=>s.x===x&&s.y===y))PROPS.push({x,y,k:'bui'})}

/* chuồng trâu ở chỗ trâu đứng (PEN, dialogs.js): mái rơm và rào sau vẽ trước trâu, rào trước vẽ sau trâu */
function penBack(){if(sc.penB)return sc.penB;const b=buf(44,30);
  for(let y=2;y<12;y++){const ins=Math.max(0,4-y);for(let x=2+ins;x<42-ins;x++){const n=Hs(x,(y+(Hs(x,3,1)*4|0))>>2,7);b.set(x,y,y===11?'#8e6a28':n<.3?'#f0d888':n<.75?'#d8b860':'#b8903c')}}
  for(const x of [4,39])for(let y=12;y<28;y++){b.set(x,y,'#7a5634');b.set(x+1,y,'#5a3c22')}
  for(const y of [16,21])for(let x=2;x<42;x++)b.set(x,y,x%5===0?'#5a3c22':'#9a7444');
  for(let x=4;x<41;x+=6)for(let y=13;y<26;y++)b.set(x,y,'#8a6a3e');
  const c=b.done();outline(c);c.ax=22;c.ay=28;return sc.penB=c}
function penFront(){if(sc.penF)return sc.penF;const b=buf(44,12);
  for(const x of [2,41])for(let y=0;y<11;y++){b.set(x,y,'#7a5634');b.set(x+1,y,'#5a3c22')}
  for(let x=2;x<43;x++){if(x>17&&x<27)continue;b.set(x,3,x%5===0?'#5a3c22':'#a87e4c');b.set(x,7,x%5===0?'#5a3c22':'#9a7444')}   // chừa lối vào
  for(const x of [16,27])for(let y=0;y<11;y++){b.set(x,y,'#7a5634');b.set(x+1,y,'#5a3c22')}
  const c=b.done();outline(c);c.ax=22;c.ay=11;return sc.penF=c}
PROPS.push({x:44,y:77,k:'chuongSau'},{x:44,y:79,k:'chuongTruoc'});
export function propSprite(p,s){if(p.k==='chuongSau')return penBack();if(p.k==='chuongTruoc')return penFront();return p.k==='rom'?haystack(s):p.k==='chum'?jar():p.k==='lau'?reeds(s,p.x+p.y):bush(s,(p.x*7+p.y)%9)}
/* vị trí neo khi vẽ (ô x+.5, y+1 là chân) */
export const propAt=p=>p.k==='chuongSau'?[44.5,78.05]:p.k==='chuongTruoc'?[44.5,79.3]:[p.x+.5+(p.k==='lau'?(Hs(p.x,p.y,4)-.5)*.6:0),p.y+(p.k==='bui'||p.k==='lau'?.7+Hs(p.x,p.y,5)*.3:.95)];
