/* ================= tường thành ================= */
/* Tường thành Thăng Long vẽ thành vật dựng đứng (sprite sắp theo y), cao hơn mặt đất 12 điểm ảnh: đoạn ngang
   thấy mặt thành (lối đi lát đá, lỗ châu mai phía ngoài) và vách gạch nhìn từ phía nam; đoạn dọc chỉ thấy mặt
   thành, lỗ châu mai ở phía ngoài. Cổng (ô GA) có vòm tối, cánh cửa gỗ mở; cổng nam có lầu mái ngói.
   Chỉ là hình vẽ: va chạm vẫn theo ô WL, GA của bản đồ. */
import {GA,H,ST,W,WL} from './constants.js';
import {Hs,mk,shade} from './pixel.js';
import {get} from './map.js';

const UP=12;                                     // độ cao tường (điểm ảnh)
const isW=(x,y)=>{const t=get(x,y);return t===WL||t===GA};
const inside=(x,y)=>{const t=get(x,y);return t===ST||t===GA};

export const WALLS=[];
for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=get(x,y);if(t!==WL&&t!==GA)continue;
  const vert=(isW(x,y-1)||isW(x,y+1))&&!(isW(x-1,y)||isW(x+1,y));
  WALLS.push({x,y,gate:t===GA,vert,outL:vert&&!inside(x-1,y),outN:!vert&&!inside(x,y-1)})}
// lầu trên cổng: mỗi dãy ô cổng nằm ngang một lầu
export const TOWERS=[];
for(const w of WALLS)if(w.gate&&!w.vert&&!(get(w.x-1,w.y)===GA)){let n=1;while(get(w.x+n,w.y)===GA)n++;TOWERS.push({x:w.x,y:w.y,n})}

const sc={};
const stone=(x,y)=>Hs(x>>1,y>>1,23)<.4?'#a89a82':Hs(x,y,5)<.08?'#8e826c':'#b6a890';
const brick=(x,y)=>{const row=y>>2,j=(x+(row%2?4:0))&7;return (y&3)===3||j===7?'#5c3a26':Hs((x+(row%2?4:0))>>3,row,4)<.25?'#a8724c':(y&3)===0?'#b47e58':'#966040'};

export function wallSprite(w){const key=[w.vert,w.gate,w.outL,w.outN,w.x%2,w.y%2].join();if(sc[key])return sc[key];
  const hh=16+UP,[c,g]=mk(16,hh),p=(x,y,col)=>{g.fillStyle=col;g.fillRect(x,y,1,1)};
  if(w.vert){ // nhìn từ trên: lối đi, tường chắn hai bên, lỗ châu mai phía ngoài
    for(let y=0;y<hh;y++)for(let x=0;x<16;x++){const o=w.outL?x:15-x,wy=y+w.y*16;
      p(x,y,o<3?((wy&7)<4?(o===2?'#6e6250':'#9a8e78'):(o<1?'#4a4034':'#5e5242')):o===3?'#6e6250':o===14?'#8a7e68':o===15?'#5e5242':stone(x,wy))}
    if(w.gate)for(let y=UP-2;y<hh-2;y++)for(let x=4;x<14;x++)p(x,y,(y&3)===0?'#5a3018':x===8||x===9?'#4a2814':'#7a4424');   // cổng: ván cửa gỗ
  }else{
    for(let y=0;y<UP;y++)for(let x=0;x<16;x++)p(x,y,stone(x,y+w.y*16));                   // lối đi trên thành
    const crenel=w.outN?0:UP-3;                                                        // lỗ châu mai ở mép phía ngoài
    for(let x=0;x<16;x++){const on=(x&7)<5;p(x,crenel,on?'#9a8e78':'#4a4034');p(x,crenel+1,on?'#8a7e68':'#4a4034');p(x,crenel+2,on?'#6e6250':'#6e6250')}
    for(let x=0;x<16;x++)p(x,w.outN?UP-1:0,'#8a7e68');
    for(let y=UP;y<hh;y++)for(let x=0;x<16;x++){const fy=y-UP;p(x,y,fy===0?'#c8baa0':fy===1?'#6a4430':fy>=14?(fy===15?'#3e2618':'#6e4430'):brick(x+w.x*16,fy))}
    if(w.gate){ // vòm cổng tối, hai cánh cửa gỗ mở vào trong
      for(let y=UP+2;y<hh;y++)for(let x=1;x<15;x++){const r=Math.hypot(x-7.5,Math.max(0,UP+8-y));if(r<7)p(x,y,y>hh-3?'#2a2018':'#1c1410')}
      for(let y=UP+6;y<hh-1;y++){p(1,y,'#7a4424');p(2,y,'#5a3018');p(13,y,'#5a3018');p(14,y,'#7a4424')}
    }
  }
  c.ax=8;c.ay=hh;return sc[key]=c}

/* lầu cổng: mái ngói hai tầng trên mặt thành, cột đỏ */
export function towerSprite(t){const key='lau'+t.n;if(sc[key])return sc[key];
  const w=t.n*16+12,h=34,[c,g]=mk(w,h),r=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,ww,hh)};
  const roof=(x0,y0,ww,rows)=>{for(let k=0;k<rows;k++){const ins=Math.round((rows-1-k)*1.4),xs=x0+ins,xe=x0+ww-ins;
      for(let x=xs;x<xe;x++)r(x,y0+k,1,1,k%3===0?'#a06a3a':(x+k)%4===0?'#5e3420':k%3===2?'#6e3e24':'#7e4a2c')}
    r(x0+Math.round((rows-1)*1.4)-1,y0-2,ww-2*Math.round((rows-1)*1.4)+2,2,'#4a2818');r(x0-2,y0+rows-2,3,2,'#7e4a2c');r(x0+ww-1,y0+rows-2,3,2,'#7e4a2c');r(x0-3,y0+rows-4,2,2,'#7e4a2c');r(x0+ww+1,y0+rows-4,2,2,'#7e4a2c')};
  r(8,21,w-16,12,'#c8b490');for(let x=10;x<w-10;x+=8){r(x,21,2,12,'#9a2a1e');r(x,21,1,12,'#b8402c')}r(8,32,w-16,1,'#7a6a50');   // tầng dưới: cột đỏ, vách
  roof(2,12,w-4,10);r(w/2-10,6,20,6,'#c8b490');r(w/2-9,6,2,6,'#9a2a1e');r(w/2+7,6,2,6,'#9a2a1e');roof(w/2-15,0,30,7);   // tầng trên
  // viền
  const d=g.getImageData(0,0,w,h).data,A=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&d[(y*w+x)*4+3]>0;g.fillStyle='#221913';
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!A(x,y)&&(A(x-1,y)||A(x+1,y)||A(x,y-1)||A(x,y+1)))g.fillRect(x,y,1,1);
  c.ax=w/2;c.ay=h;return sc[key]=c}
