/* ================= pixel helpers ================= */
export function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d',{willReadFrequently:true})]}
export function shade(hex,a){const n=parseInt(hex.slice(1),16);const r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(a>0?v+(255-v)*a:v*(1+a))));return'#'+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1)}
export function Hs(x,y,k=0){let h=(x*374761393+y*668265263+k*2246822519)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
export function outline(c,col='#221913'){const g=c.getContext('2d'),w=c.width,h=c.height,d=g.getImageData(0,0,w,h).data,o=[];
  const A=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&d[(y*w+x)*4+3]>0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!A(x,y)&&(A(x-1,y)||A(x+1,y)||A(x,y-1)||A(x,y+1)))o.push(x,y);
  g.fillStyle=col;for(let i=0;i<o.length;i+=2)g.fillRect(o[i],o[i+1],1,1);return c}
export function disc(g,cx,cy,r,col){g.fillStyle=col;for(let y=-r;y<=r;y++){const w=Math.floor(Math.sqrt(r*r+r*.8-y*y));g.fillRect(cx-w,cy+y,w*2+1,1)}}
export function flip(c){const[f,g]=mk(c.width,c.height);g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0);f.ax=c.width-c.ax;f.ay=c.ay;return f}
/* Viền theo màu: mỗi điểm viền lấy màu điểm bên cạnh (ưu tiên bên dưới, rồi hai bên, rồi bên trên) làm tối
   đi, như pixel art viền màu (tóc viền nâu sẫm, áo viền màu áo đậm). Dùng cho sprite người. */
