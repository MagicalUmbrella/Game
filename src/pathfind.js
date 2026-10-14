/* ================= tìm đường cho người do máy điều khiển ================= */
/* BFS trên lưới ô (4 hướng). Dùng cho giặc và người cùng đánh trong đêm 1285, để họ đi theo
   đường thật: không xuyên sông, cây, nhà. Mỗi người giữ đường đi của mình, tính lại khi đích
   đổi ô hoặc sau một quãng ngắn. */
import {H,W} from './constants.js';

const prev=new Int32Array(W*H),queue=new Int32Array(W*H);

/* Đường từ ô (sx,sy) tới ô (gx,gy) theo các ô ok(x,y). Ô xuất phát luôn được tính là đi được
   (người bị đánh bật vào bụi cây vẫn tìm được lối ra). Đích không tới được thì đi tới ô tới được
   gần đích nhất. Trả về danh sách tâm ô, không gồm ô xuất phát. */
export function gridPath(sx,sy,gx,gy,ok){
  prev.fill(-2);const s=sy*W+sx;prev[s]=-1;queue[0]=s;let h=0,t=1,best=s,bd=Math.abs(sx-gx)+Math.abs(sy-gy);
  while(h<t){const i=queue[h++],x=i%W,y=(i/W)|0;
    if(x===gx&&y===gy){best=i;bd=0;break}
    const d=Math.abs(x-gx)+Math.abs(y-gy);if(d<bd){bd=d;best=i}
    for(let k=0;k<4;k++){const nx=x+(k===0)-(k===1),ny=y+(k===2)-(k===3);
      if(nx<0||ny<0||nx>=W||ny>=H)continue;const j=ny*W+nx;if(prev[j]!==-2||!ok(nx,ny))continue;prev[j]=i;queue[t++]=j}}
  const out=[];for(let i=best;i!==s&&i>=0;i=prev[i])out.push([i%W+.5,((i/W)|0)+.5]);return out.reverse()}

/* Điểm kế tiếp mà o nên đi tới để đến (tx,ty), hoặc null nếu không có đường (đứng chờ).
   now là đồng hồ tăng dần (giây). Đã ở sát đích, ô đích đi được thì đi thẳng. */
export function nextStep(o,tx,ty,ok,now){
  const ox=Math.floor(o.x),oy=Math.floor(o.y),gx=Math.floor(tx),gy=Math.floor(ty);
  if(Math.abs(ox-gx)+Math.abs(oy-gy)<=1&&(ok(gx,gy)||(ox===gx&&oy===gy))){o.path=null;return[tx,ty]}
  const key=gx+','+gy;
  if(!o.path||o.goal!==key||now-o.pathAt>.6){o.path=gridPath(ox,oy,gx,gy,ok);o.goal=key;o.pathAt=now}
  while(o.path.length&&Math.hypot(o.path[0][0]-o.x,o.path[0][1]-o.y)<.2)o.path.shift();
  return o.path.length?o.path[0]:null}
