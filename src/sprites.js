/* ================= sprites ================= */
import {TS} from './constants.js';
import {Hs,disc,flip,mk,outline,shade} from './pixel.js';

export {personSprite} from './person.js';
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
function shadeBlob(g,w,h,base,maxY,seed){const d=g.getImageData(0,0,w,h),A=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&d.data[(y*w+x)*4+3]>0&&y<maxY;
  const dark=shade(base,-.25),lite=shade(base,.2);
  for(let y=1;y<maxY;y++)for(let x=1;x<w-1;x++){if(!A(x,y))continue;
    if(!A(x+1,y+1)||(y>maxY*.6&&Hs(x,y,seed)<.3)){g.fillStyle=dark;g.fillRect(x,y,1,1)}
    else if((!A(x-1,y-1)||Hs(x,y,seed+7)<.07)&&y<maxY*.55){g.fillStyle=lite;g.fillRect(x,y,1,1)}}return A}
export function treeSprite(s,v){const key='tr'+s+v;if(spriteCache[key])return spriteCache[key];
  const[c,g]=mk(28,36),base=['#4f9a44','#3d8538','#a8963a','#5b7a56'][s];
  if(v===0){disc(g,14,13,10,base);disc(g,8,17,6,base);disc(g,20,17,6,base)}else{disc(g,14,11,9,base);disc(g,14,18,8,base)}
  const A=shadeBlob(g,28,36,base,25,s+v);
  if(s===0&&v===1)for(let i=0;i<10;i++){const x=6+Math.floor(Hs(i,v,3)*16),y=4+Math.floor(Hs(i,v,4)*16);if(A(x,y)){g.fillStyle=i%2?'#f2a2b6':'#fbd3dc';g.fillRect(x,y,1,1)}}
  if(s===2)for(let i=0;i<12;i++){const x=5+Math.floor(Hs(i,v,5)*18),y=4+Math.floor(Hs(i,v,6)*18);if(A(x,y)){g.fillStyle='#d87a2c';g.fillRect(x,y,1,1)}}
  g.fillStyle='#6b4a2c';g.fillRect(12,23,4,10);g.fillStyle='#4c331f';g.fillRect(15,23,1,10);g.fillRect(11,32,6,1);
  outline(c,'#1d2a1b');c.ax=14;c.ay=33;return spriteCache[key]=c}
export function banyanSprite(s){const key='ban'+s;if(spriteCache[key])return spriteCache[key];
  const[c,g]=mk(60,56),base=['#4b9442','#367d34','#8f8e3a','#557552'][s];
  for(const[cx,cy,r]of[[30,18,15],[15,24,11],[45,24,11],[22,12,9],[38,12,9]])disc(g,cx,cy,r,base);
  shadeBlob(g,60,56,base,36,s+11);
  g.fillStyle='#5e432a';g.fillRect(25,32,10,20);g.fillRect(20,48,20,4);g.fillStyle='#4a321f';g.fillRect(32,32,3,20);
  for(const rx of[18,22,38,41])g.fillRect(rx,32,1,16);
  outline(c,'#1d2a1b');c.ax=30;c.ay=52;return spriteCache[key]=c}
export function simple(key,w,h,draw,ax,ay){if(spriteCache[key])return spriteCache[key];const[c,g]=mk(w,h),s=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,ww,hh)};draw(s);outline(c);c.ax=ax;c.ay=ay;return spriteCache[key]=c}
export const wellSprite=()=>simple('well',18,18,s=>{s(2,6,14,9,'#8a8476');s(2,6,14,2,'#a59f90');s(4,7,10,3,'#2f4b57');s(2,14,14,1,'#6a6559');for(let i=3;i<16;i+=4)s(i,10,1,4,'#6a6559')},9,15);
export const boatSprite=()=>simple('boat',34,16,s=>{s(3,9,28,4,'#6e4a2a');s(1,8,3,2,'#6e4a2a');s(30,8,3,2,'#6e4a2a');s(5,13,24,1,'#4a311b');s(4,9,26,1,'#8a6238');s(11,4,12,5,'#c9ab6c');s(10,5,14,1,'#a88b52');for(let i=12;i<23;i+=3)s(i,4,1,5,'#a88b52');s(25,2,1,8,'#5a3f25')},17,13);
export const signSprite=()=>simple('sign',18,20,s=>{s(8,8,2,11,'#5a3f25');s(2,2,14,8,'#a77a48');s(2,2,14,1,'#c29462');s(2,9,14,1,'#7a5530');for(let i=4;i<14;i+=3)s(i,5,2,1,'#5a3f25')},9,18);

/* buildings */
function roofPx(g,x0,yTop,w,yEave,col,o){
  const rows=yEave-yTop,sl=o.slope||9,ridge=o.ridge||shade(col,-.35);
  for(let r=0;r<=rows;r++){const k=rows?r/rows:1,inset=Math.round((1-k)*sl),xs=x0+inset,xe=x0+w-inset;
    g.fillStyle=(r%3===2)?shade(col,-.16):col;g.fillRect(xs,yTop+r,xe-xs,1);
    g.fillStyle=o.thatch?shade(col,.12):shade(col,-.1);
    if(!o.thatch){for(let i=xs+(r%2?2:0);i<xe;i+=4)g.fillRect(i,yTop+r,1,1)}else for(let i=xs+(r*3)%5;i<xe;i+=5)g.fillRect(i,yTop+r,1,1)}
  g.fillStyle=shade(col,-.3);g.fillRect(x0,yEave,w,1);g.fillStyle=shade(col,.18);g.fillRect(x0+sl,yTop+1,w-2*sl,1);
  if(o.up){g.fillStyle=col;g.fillRect(x0-2,yEave-1,3,2);g.fillRect(x0-4,yEave-3,3,2);g.fillRect(x0-5,yEave-5,2,2);g.fillRect(x0+w-1,yEave-1,3,2);g.fillRect(x0+w+1,yEave-3,3,2);g.fillRect(x0+w+3,yEave-5,2,2)}
  g.fillStyle=ridge;g.fillRect(x0+sl-1,yTop-2,w-2*sl+2,3);
  if(o.curl){g.fillRect(x0+sl-3,yTop-4,2,3);g.fillRect(x0+sl-4,yTop-6,2,2);g.fillRect(x0+w-sl+1,yTop-4,2,3);g.fillRect(x0+w-sl+2,yTop-6,2,2);if(o.pearl){g.fillStyle=o.pearl;g.fillRect(x0+Math.floor(w/2)-2,yTop-5,4,3)}}
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
    s(2,wt,wpx-4,hpx-wt,P.wall);s(2,wt,wpx-4,2,shade(P.wall,-.25));
    for(let x=2;x<wpx-2;x+=12)s(x,wt,2,hpx-wt-3,P.post);s(wpx-4,wt,2,hpx-wt-3,P.post);
    s(1,hpx-3,wpx-2,3,'#8a8476');s(1,hpx-3,wpx-2,1,'#a49d8e');
    if(b.kind==='stall'){s(4,hpx-12,wpx-8,8,'#3a2a1c');s(3,hpx-6,wpx-6,3,'#8a6238');const goods={sach:['#d9cba0','#b8a676','#e8dcb6'],ren:['#c0c4c8','#e0823a','#8a8e92'],nhaituan:['#b8322a','#e2bf72','#3f6f9a'],gom:['#9fbfa8','#7a5132','#d9d0b8']}[b.id]||['#d9cba0'];
      for(let i=0;i<Math.floor((wpx-10)/5);i++)s(5+i*5,hpx-9,3,3,goods[i%goods.length])}
    else{const dw=b.kind==='palace'?14:10,dx=Math.floor(wpx/2-dw/2);s(dx-1,hpx-15,dw+2,12,shade(P.post,-.2));s(dx,hpx-14,dw,11,'#2e2118');s(Math.floor(wpx/2),hpx-14,1,11,'#4a3424');
      if(wpx>=64)for(const wx of[dx-14,dx+dw+6]){s(wx,hpx-13,8,6,'#3a2a1c');for(let i=1;i<8;i+=2)s(wx+i,hpx-13,1,6,'#a07a4a');s(wx,hpx-14,8,1,P.post)}}
    if(b.kind==='palace'){for(let x=8;x<wpx-8;x+=16)s(x,wt,3,hpx-wt-3,'#e2b94e');s(Math.floor(wpx/2)-12,hpx-2,24,2,'#c9c2b0')}
    const two=b.kind==='palace'||b.kind==='pagoda',rTop=two?oy-top+26:oy-top+8,eave=oy+wt+2;
    roofPx(g,ox-4,rTop,wpx+8,eave,P.roof,{thatch:P.thatch,up:P.up,curl:P.curl,ridge:P.ridge,pearl:P.pearl,slope:P.thatch?6:10});
    if(two){const iw=Math.round(wpx*.55),ix=ox+Math.floor((wpx-iw)/2);g.fillStyle=P.wall;g.fillRect(ix+4,rTop-8,iw-8,10);g.fillStyle=P.post;for(let x=ix+4;x<ix+iw-4;x+=8)g.fillRect(x,rTop-8,1,10);
      roofPx(g,ix-2,8,iw+4,rTop-7,P.roof,{up:1,curl:1,ridge:P.ridge,pearl:P.pearl,slope:7})}
  }
  outline(c);c.ox=ox;c.oy=oy;return bspr[b.id]=c}
