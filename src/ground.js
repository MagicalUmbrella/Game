/* ================= ground bake ================= */
import {BR,FI,G,GA,H,MO,PA,SA,ST,TR,TS,W,WA,WL,WR} from './constants.js';
import {Hs,mk,shade} from './pixel.js';
import {get,isW,map} from './map.js';

const grassC=s=>['#7cb24f','#5d9a3e','#9ea84c','#8e9c6c'][s];
const tlC=s=>['#4f95aa','#4089a6','#5389a0','#5a8698'][s];
const hgC=s=>['#b07655','#b8714c','#a97b5d','#9b7764'][s];
const groundCache={};
export function ground(s){if(groundCache[s])return groundCache[s];
  const[c,g]=mk(W*TS,H*TS);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)tilePx(g,map[y*W+x],x,y,s);
  return groundCache[s]=c}
function tilePx(g,t,x,y,s){
  const ox=x*TS,oy=y*TS,p=(dx,dy,w,h,col)=>{g.fillStyle=col;g.fillRect(ox+dx,oy+dy,w,h)};
  const grass=()=>{const b=grassC(s);p(0,0,16,16,b);
    for(let i=0;i<9;i++){const hx=Math.floor(Hs(x,y,i)*16),hy=Math.floor(Hs(x,y,i+30)*15);p(hx,hy,1,2,shade(b,i%3?-.18:.16))}
    if(s<3&&Hs(x,y,99)<.1){const fx=2+Math.floor(Hs(x,y,98)*11),fy=2+Math.floor(Hs(x,y,97)*11),fc=[['#f4a9bc','#fff4e2'],['#f4d84c','#fff4e2'],['#e3893a','#f4c04a']][s];p(fx,fy-1,1,1,fc[0]);p(fx-1,fy,3,1,fc[0]);p(fx,fy+1,1,1,fc[0]);p(fx,fy,1,1,fc[1])}};
  const edgeGrass=col=>{for(const[nx,ny,ex,ey,w]of[[0,-1,0,0,16],[0,1,0,15,16],[-1,0,0,0,1],[1,0,15,0,1]]){const n=get(x+nx,y+ny);if(n===G||n===TR){for(let k=0;k<16;k++)if(Hs(x*3+nx,y*3+ny,k)<.55){if(w>1)p(ex+k,ey,1,1,col);else p(ex,ey+k,1,1,col)}}}};
  switch(t){
   case G:case TR:grass();if(t===TR){g.fillStyle='rgba(20,40,20,.22)';g.fillRect(ox+3,oy+12,10,3)}break;
   case PA:{p(0,0,16,16,'#b99c68');for(let i=0;i<7;i++)p(Math.floor(Hs(x,y,i)*15),Math.floor(Hs(x,y,i+9)*15),i%2?2:1,1,i%3?'#9d8152':'#d0b886');edgeGrass(grassC(s));break}
   case SA:{p(0,0,16,16,'#d7c590');for(let i=0;i<6;i++)p(Math.floor(Hs(x,y,i)*16),Math.floor(Hs(x,y,i+9)*16),1,1,i%2?'#bba872':'#e8d9a8');break}
   case WA:case WR:case BR:{
     const hong=t===WR||(t===BR&&(get(x-1,y)===WR||get(x+1,y)===WR||get(x,y-1)===WR||get(x,y+1)===WR));
     const b=hong?hgC(s):tlC(s);p(0,0,16,16,b);
     if(t!==BR){const lt=shade(b,.28),wet=n=>isW(n)||n===BR;
       if(!wet(get(x,y-1)))p(0,0,16,2,lt);if(!wet(get(x,y+1)))p(0,15,16,1,shade(b,-.25));if(!wet(get(x-1,y)))p(0,0,1,16,lt);if(!wet(get(x+1,y)))p(15,0,1,16,lt);
       p(2+Math.floor(Hs(x,y,1)*8),4+Math.floor(Hs(x,y,2)*4),4,1,shade(b,.18));p(6+Math.floor(Hs(x,y,3)*6),10+Math.floor(Hs(x,y,4)*3),3,1,shade(b,.18))}
     else{p(2,0,12,16,'#90693e');for(let j=0;j<16;j+=3)p(2,j,12,1,'#6c4e2b');p(1,0,1,16,'#5a3f25');p(14,0,1,16,'#5a3f25');p(1,2,2,2,'#4a331e');p(13,2,2,2,'#4a331e');p(1,10,2,2,'#4a331e');p(13,10,2,2,'#4a331e')}
     break}
   case FI:{p(0,0,16,16,['#6e968c','#6a8d5c','#8b7c4b','#7a5f3f'][s]);
     if(s===0)for(let i=0;i<3;i++)p(Math.floor(Hs(x,y,i)*14),Math.floor(Hs(x,y,i+5)*15),3,1,'#8db4ab');
     for(let r=0;r<4;r++)for(let c2=0;c2<4;c2++){const ax=1+c2*4,ay=1+r*4;
       if(s===0){p(ax+1,ay+1,1,2,'#a6d86e');p(ax,ay+1,1,1,'#7fbf55')}
       else if(s===1){p(ax,ay,2,3,'#4b9638');p(ax,ay,1,1,'#7cc458')}
       else if(s===2){p(ax,ay,2,3,'#e1bd48');p(ax+2,ay,1,1,'#c99a30');p(ax,ay+3,2,1,'#9c8a40')}
       else p(ax+1,ay+2,1,1,'#a08a5a')}
     break}
   case MO:{p(0,0,16,16,'#6c7462');for(const[a,b2,w,h]of[[1,1,7,6],[8,3,7,6],[3,8,8,6]]){p(a,b2,w,h,'#7c846f');p(a,b2,w,1,'#949c86');p(a,b2,1,h,'#949c86');p(a,b2+h-1,w,1,'#545b4b');p(a+w-1,b2,1,h,'#545b4b')}
     if(get(x,y+1)!==MO){p(0,11,16,5,'#4d5345');p(3,12,1,4,'#3c4136');p(9,11,1,5,'#3c4136');p(0,11,16,1,'#5e6555')}break}
   case WL:{p(0,0,16,16,'#8f5a3a');for(let j=0;j<16;j+=4){p(0,j,16,1,'#6c4029');const o=(j/4)%2?4:0;for(let i=o;i<16;i+=8)p(i,j,1,4,'#6c4029')}
     if(get(x,y-1)!==WL){p(0,0,16,3,'#a87150');p(2,0,3,1,'#6c4029');p(10,0,3,1,'#6c4029')}if(get(x,y+1)!==WL)p(0,14,16,2,'#5a3523');break}
   case ST:case GA:{p(0,0,16,16,'#a49d8e');for(let j=0;j<16;j+=8){p(0,j,16,1,'#888272');const o=(j/8)%2?4:0;for(let i=o;i<16;i+=8){p(i,j,1,8,'#888272');p(i+1,j+1,6,1,'#b8b1a1')}}
     if(t===GA){p(0,0,2,16,'#6c4029');p(14,0,2,16,'#6c4029');p(0,0,16,2,'#6c4029')}break}
  }
}
