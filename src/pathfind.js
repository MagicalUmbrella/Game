/* ================= tìm đường cho người do máy điều khiển ================= */
/* BFS trên lưới ô (4 hướng). Dùng cho giặc và người cùng đánh trong đêm 1285, để họ đi theo
   đường thật: không xuyên sông, cây, nhà. Mỗi người giữ đường đi của mình, tính lại khi đích
   đổi ô hoặc sau một quãng ngắn. */
import {H,W} from './constants.js';

const prev=new Int32Array(W*H),seen=new Int32Array(W*H),queue=new Int32Array(W*H);let stamp=0;
const PAD=28;   // chỉ tìm trong khung bao quanh điểm đầu và đích, thêm PAD ô mỗi bên (bản đồ thế giới rất lớn)

/* Đường từ ô (sx,sy) tới ô (gx,gy) theo các ô ok(x,y). Ô xuất phát luôn được tính là đi được
   (người bị đánh bật vào bụi cây vẫn tìm được lối ra). Đích không tới được thì đi tới ô tới được
   gần đích nhất. Trả về danh sách tâm ô, không gồm ô xuất phát. */
export function gridPath(sx,sy,gx,gy,ok){
  stamp++;const s=sy*W+sx;seen[s]=stamp;prev[s]=-1;queue[0]=s;let h=0,t=1,best=s,bd=Math.abs(sx-gx)+Math.abs(sy-gy);
  const bx0=Math.max(0,Math.min(sx,gx)-PAD),bx1=Math.min(W-1,Math.max(sx,gx)+PAD),by0=Math.max(0,Math.min(sy,gy)-PAD),by1=Math.min(H-1,Math.max(sy,gy)+PAD);
  while(h<t){const i=queue[h++],x=i%W,y=(i/W)|0;
    if(x===gx&&y===gy){best=i;bd=0;break}
    const d=Math.abs(x-gx)+Math.abs(y-gy);if(d<bd){bd=d;best=i}
    for(let k=0;k<4;k++){const nx=x+(k===0)-(k===1),ny=y+(k===2)-(k===3);
      if(nx<bx0||ny<by0||nx>bx1||ny>by1)continue;const j=ny*W+nx;if(seen[j]===stamp||!ok(nx,ny))continue;seen[j]=stamp;prev[j]=i;queue[t++]=j}}
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

/* Bước đi 4 hướng: o tiến về (tx,ty) tối đa m ô, mỗi lúc theo một trục (không đi chéo).
   Giữ trục đang đi cho tới khi thẳng hàng với đích theo trục ấy, rồi mới rẽ; quãng còn dư
   trong khung này đi tiếp theo trục kia. Trả về [dx,dy] để người gọi tự cộng (và kiểm tra va chạm)
   và tính hướng mặt bằng dirOf. */
export function step4(o,tx,ty,m){
  const dx=tx-o.x,dy=ty-o.y;let ax=o.axis;
  if((ax!=='x'&&ax!=='y')||Math.abs(ax==='x'?dx:dy)<1e-4)ax=Math.abs(dx)>=Math.abs(dy)?'x':'y';
  const X=ax==='x',a=X?dx:dy,b=X?dy:dx,u=Math.min(Math.abs(a),m),v=Math.min(Math.abs(b),m-u),p=Math.sign(a)*u,q=Math.sign(b)*v;
  o.axis=v>1e-6?(X?'y':'x'):ax;
  return X?[p,q]:[q,p]}

/* Đi tới điểm st do nextStep trả về, 4 hướng. Đã cùng hàng ô (hay cùng cột ô) với điểm ấy thì
   đi thẳng sang, không cần về đúng tâm ô: vẫn trong ô đi được, và hai người đứng sát nhau (bị
   separate đẩy ra) không phải giành nhau một đường tâm ô rồi kẹt. */
export function stepTo(o,st,m,ok){
  const cx=Math.floor(o.x)===Math.floor(st[0]),cy=Math.floor(o.y)===Math.floor(st[1]),
    tx=cy&&!cx?st[0]:cx&&!cy?o.x:st[0],ty=cy&&!cx?o.y:cx&&!cy?st[1]:st[1];
  if(!ok)return step4(o,tx,ty,m);
  // lệch khỏi đường (bị đánh bật, bị đẩy): đi chữ L có thể cắt qua góc ô cấm; thử trục kia, không được thì tìm đường lại
  const ax=o.axis,d=step4(o,tx,ty,m);if(ok(Math.floor(o.x+d[0]),Math.floor(o.y+d[1])))return d;
  o.axis=(o.axis||ax)==='x'?'y':'x';const e=step4(o,tx,ty,m);if(ok(Math.floor(o.x+e[0]),Math.floor(o.y+e[1])))return e;
  o.axis=ax;o.path=null;return[0,0]}
