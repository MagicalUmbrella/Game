/* ================= sprites ================= */
import {TS} from './constants.js';
import {Hs,disc,flip,mk,outline,shade} from './pixel.js';

export {personSprite} from './person.js';
export {treeSprite,banyanSprite,propSprite} from './scenery.js';
const spriteCache={};
const SKIN='#e9b98f',SKIND='#c58f66';
export function buffaloSprite(dir){const key='buf'+dir;if(spriteCache[key])return spriteCache[key];
  if(dir==='right')return spriteCache[key]=flip(buffaloSprite('left'));
  const[c,g]=mk(30,22),s=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  s(8,7,18,8,'#4b4845');s(9,6,15,1,'#5c5955');s(10,12,14,3,'#3a3836');s(9,8,4,1,'#625f5a');
  for(const lx of[10,13,20,23]){s(lx,15,2,5,'#3a3836');s(lx,20,2,1,'#211e1c')}
  s(25,8,2,6,'#3a3836');s(26,14,1,2,'#211e1c');
  s(2,6,8,7,'#4b4845');s(1,9,3,4,'#5c5955');s(4,8,1,1,'#120f0e');s(1,11,1,1,'#120f0e');
  s(0,3,3,1,'#dcd3bc');s(0,2,1,2,'#dcd3bc');s(8,3,3,1,'#dcd3bc');s(10,2,1,2,'#dcd3bc');s(3,4,5,2,'#4b4845');
  outline(c);c.ax=15;c.ay=20;return spriteCache[key]=c}
export function simple(key,w,h,draw,ax,ay){if(spriteCache[key])return spriteCache[key];const[c,g]=mk(w,h),s=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,ww,hh)};draw(s);outline(c);c.ax=ax;c.ay=ay;return spriteCache[key]=c}
export const wellSprite=()=>simple('well',18,18,s=>{s(2,6,14,9,'#8a8476');s(2,6,14,2,'#a59f90');s(4,7,10,3,'#2f4b57');s(2,14,14,1,'#6a6559');for(let i=3;i<16;i+=4)s(i,10,1,4,'#6a6559')},9,15);
export const boatSprite=()=>simple('boat',34,16,s=>{s(3,9,28,4,'#6e4a2a');s(1,8,3,2,'#6e4a2a');s(30,8,3,2,'#6e4a2a');s(5,13,24,1,'#4a311b');s(4,9,26,1,'#8a6238');s(11,4,12,5,'#c9ab6c');s(10,5,14,1,'#a88b52');for(let i=12;i<23;i+=3)s(i,4,1,5,'#a88b52');s(25,2,1,8,'#5a3f25')},17,13);
export const signSprite=()=>simple('sign',18,20,s=>{s(8,8,2,11,'#5a3f25');s(2,2,14,8,'#a77a48');s(2,2,14,1,'#c29462');s(2,9,14,1,'#7a5530');for(let i=4;i<14;i+=3)s(i,5,2,1,'#5a3f25')},9,18);

/* buildings */
/* Mái: mái rơm tô từng sợi (vệt dọc), từng lớp rơm, mép tua lởm chởm, nóc buộc lạt; mái ngói xếp hàng
   âm dương, mỗi hàng có gờ sáng và bóng. Sáng phía trái, tối dần sang phải. */
function roofPx(g,x0,yTop,w,yEave,col,o){
  const rows=yEave-yTop,sl=o.slope||9,ridge=o.ridge||shade(col,-.35);
  const T=[shade(col,.3),shade(col,.14),col,shade(col,-.18),shade(col,-.36)];
  for(let r=0;r<=rows;r++){const k=rows?r/rows:1,inset=Math.round((1-k)*sl),xs=x0+inset,xe=x0+w-inset,y=yTop+r;
    for(let x=xs;x<xe;x++){const side=(x-xs)/(xe-xs);let t;
      if(o.thatch){const strand=Hs(x,(y+(Hs(x,3,1)*5|0))/4|0,7),band=(r+(Hs(x>>1,9,2)*2|0))%6;
        t=band===0?3:strand<.2?0:strand<.55?1:strand<.85?2:3;if(side>.7)t=Math.min(4,t+1);
        if(r>=rows-2&&Hs(x,r,5)<(r-rows+3)*.35)continue}           // mép tua rơm
      else{const row=r%4,ch=(x+(((r>>2)&1)?2:0))%4;t=row===0?0:row===3?4:ch===0?3:ch===3?1:2;if(side>.75&&t<3)t++}
      g.fillStyle=T[t];g.fillRect(x,y,1,1)}}
  if(!o.thatch){g.fillStyle=shade(col,-.3);g.fillRect(x0,yEave,w,1)}
  if(o.up){g.fillStyle=col;g.fillRect(x0-2,yEave-1,3,2);g.fillRect(x0-4,yEave-3,3,2);g.fillRect(x0-5,yEave-5,2,2);g.fillRect(x0+w-1,yEave-1,3,2);g.fillRect(x0+w+1,yEave-3,3,2);g.fillRect(x0+w+3,yEave-5,2,2)}
  g.fillStyle=ridge;g.fillRect(x0+sl-1,yTop-2,w-2*sl+2,3);g.fillStyle=shade(ridge,.25);g.fillRect(x0+sl-1,yTop-2,w-2*sl+2,1);
  if(o.thatch){g.fillStyle=shade(ridge,-.3);for(let x=x0+sl+3;x<x0+w-sl-2;x+=7)g.fillRect(x,yTop-2,1,3)}   // lạt buộc nóc
  if(o.curl){g.fillStyle=ridge;g.fillRect(x0+sl-3,yTop-4,2,3);g.fillRect(x0+sl-4,yTop-6,2,2);g.fillRect(x0+w-sl+1,yTop-4,2,3);g.fillRect(x0+w-sl+2,yTop-6,2,2);if(o.pearl){g.fillStyle=o.pearl;g.fillRect(x0+Math.floor(w/2)-2,yTop-5,4,3)}}
}
/* vách: trát đất loang, cột gỗ có cạnh sáng tối, bóng dưới mái hiên, nền đá */
function wallPx(s,wpx,hpx,wt,P){
  for(let y=wt;y<hpx-3;y++)for(let x=2;x<wpx-2;x++){const n=Hs(x>>1,y>>1,31);s(x,y,1,1,y<wt+4?shade(P.wall,-.32):n<.2?shade(P.wall,-.08):n>.9?shade(P.wall,.08):P.wall)}
  const post=x=>{s(x,wt,1,hpx-wt-3,shade(P.post,.18));s(x+1,wt,1,hpx-wt-3,shade(P.post,-.2))};
  for(let x=2;x<wpx-2;x+=12)post(x);post(wpx-4);
  s(2,wt+4,wpx-4,1,shade(P.post,-.1));                                    // xà ngang
  for(let x=1;x<wpx-1;x+=5){const w=Math.min(5,wpx-1-x);s(x,hpx-3,w,3,'#8a8476');s(x,hpx-3,w,1,'#aaa392');s(x+w-1,hpx-3,1,3,'#6a6559')}
}
const bspr={};
export function buildingSprite(b){if(bspr[b.id])return bspr[b.id];
  const wpx=b.w*TS,hpx=b.h*TS,ex=10,top={palace:44,pagoda:42,tower:84,dinh:26,school:22,stall:16,shed:18,house:20}[b.kind];
  const[c,g]=mk(wpx+ex*2,hpx+top+2),ox=ex,oy=top,s=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(ox+x,oy+y,w,h)};
  const P={house:{wall:'#c6a676',post:'#7a5a36',roof:'#c4a35e',thatch:1},school:{wall:'#cdb088',post:'#6d4a2c',roof:'#8f5434',up:1,curl:1},dinh:{wall:'#b99a6a',post:'#5e3c22',roof:'#7d4329',up:1,curl:1,pearl:'#d9b14a'},
    shed:{wall:'#a88c62',post:'#6b4f2e',roof:'#b99a58',thatch:1},pagoda:{wall:'#d4b88e',post:'#7a3c26',roof:'#7a3f2a',up:1,curl:1,pearl:'#d9b14a'},palace:{wall:'#a8402b',post:'#6e2418',roof:'#9c6a2c',up:1,curl:1,ridge:'#e2b94e',pearl:'#f0d27a'},
    stall:{wall:'#b8946a',post:'#6b4f2e',roof:'#8a5a34',up:1},tower:{}}[b.kind];
  if(b.kind==='tower'){
    for(let i=0;i<7;i++){const w=wpx-4-i*3,x=Math.floor((wpx-w)/2),y=hpx-12-i*12;s(x,y,w,10,i%2?'#a8643c':'#b4704a');s(x,y,w,1,'#c98a60');s(x+Math.floor(w/2)-1,y+3,2,4,'#3a2618');
      s(x-3,y-2,w+6,2,'#6b3826');s(x-4,y-3,2,1,'#6b3826');s(x+w+2,y-3,2,1,'#6b3826')}
    s(Math.floor(wpx/2)-1,hpx-12-7*12-4,2,8,'#d9b14a');s(0,hpx-3,wpx,3,'#8a8476');
  } else {
    const wt=Math.round(hpx*.45);
    wallPx(s,wpx,hpx,wt,P);
    if(b.kind==='stall'){s(4,hpx-12,wpx-8,8,'#3a2a1c');s(3,hpx-6,wpx-6,3,'#8a6238');const goods={sach:['#d9cba0','#b8a676','#e8dcb6'],ren:['#c0c4c8','#e0823a','#8a8e92'],nhaituan:['#b8322a','#e2bf72','#3f6f9a'],gom:['#9fbfa8','#7a5132','#d9d0b8']}[b.id]||['#d9cba0'];
      for(let i=0;i<Math.floor((wpx-10)/5);i++)s(5+i*5,hpx-9,3,3,goods[i%goods.length])}
    else{const dw=b.kind==='palace'?14:10,dx=Math.floor(wpx/2-dw/2);s(dx-1,hpx-15,dw+2,12,shade(P.post,-.25));s(dx,hpx-14,dw,11,'#2e2118');
      if(P.thatch){for(let y=hpx-14;y<hpx-8;y+=2)s(dx,y,dw,1,'#b08a52');s(dx,hpx-8,dw,1,'#8a6a3a')}   // mành tre cuộn nửa chừng
      else{s(Math.floor(wpx/2),hpx-14,1,11,'#4a3424');s(dx+1,hpx-9,1,2,'#d9b14a');s(dx+dw-2,hpx-9,1,2,'#d9b14a')}
      s(dx-2,hpx-3,dw+4,1,'#b8b1a1');                                         // bậc đá
      if(wpx>=64)for(const wx of[dx-14,dx+dw+6]){s(wx-1,hpx-14,10,8,shade(P.post,-.15));s(wx,hpx-13,8,6,'#2e2118');for(let i=1;i<8;i+=2){s(wx+i,hpx-13,1,6,'#a07a4a');s(wx+i,hpx-13,1,1,'#c09a62')}}}
    if(b.kind==='palace'){for(let x=8;x<wpx-8;x+=16)s(x,wt,3,hpx-wt-3,'#e2b94e');s(Math.floor(wpx/2)-12,hpx-2,24,2,'#c9c2b0')}
    const two=b.kind==='palace'||b.kind==='pagoda',rTop=two?oy-top+26:oy-top+8,eave=oy+wt+2;
    roofPx(g,ox-4,rTop,wpx+8,eave,P.roof,{thatch:P.thatch,up:P.up,curl:P.curl,ridge:P.ridge,pearl:P.pearl,slope:P.thatch?6:10});
    if(two){const iw=Math.round(wpx*.55),ix=ox+Math.floor((wpx-iw)/2);g.fillStyle=P.wall;g.fillRect(ix+4,rTop-8,iw-8,10);g.fillStyle=P.post;for(let x=ix+4;x<ix+iw-4;x+=8)g.fillRect(x,rTop-8,1,10);
      roofPx(g,ix-2,8,iw+4,rTop-7,P.roof,{up:1,curl:1,ridge:P.ridge,pearl:P.pearl,slope:7})}
  }
  outline(c);c.ox=ox;c.oy=oy;return bspr[b.id]=c}
