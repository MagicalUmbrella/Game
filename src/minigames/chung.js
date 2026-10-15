/* ================= minigame: phần dùng chung ================= */
/* Dùng cho các màn chơi giữa game (dich.js, cuop.js, sau.js): kết thúc màn, phủ bóng đêm có lỗ sáng,
   chọn các ô đi tới được quanh một vùng, mũi chỉ đường tới mục tiêu kế tiếp (MG.goal()).
   MG.goal() trả về [x, y] của việc nên làm tiếp; bot trong tests/bots.js (genericTeleport) cũng dùng nó. */
import {T,TS,Z,ctx} from '../constants.js';
import {S,MG,setMG} from '../state.js';
import {setKeys} from '../ui.js';
import {VH,VW,camX,camY,clock} from '../render.js';
import {Hs} from '../pixel.js';
import {bfs,walkable} from '../dialogs.js';
import {W} from '../constants.js';

export function endMG(){setMG(null);setKeys();document.body.classList.remove('mg');S.pending=null}

let darkC=null;
/* phủ tối toàn màn, khoét lỗ sáng ở các điểm holes = [[x, y, bán kính điểm ảnh], …] */
export function darkPost(holes,a=.72){if(!darkC)darkC=document.createElement('canvas');if(darkC.width!==VW||darkC.height!==VH){darkC.width=VW;darkC.height=VH}
  const g=darkC.getContext('2d');g.globalCompositeOperation='source-over';g.clearRect(0,0,VW,VH);g.fillStyle=`rgba(8,12,32,${a})`;g.fillRect(0,0,VW,VH);g.globalCompositeOperation='destination-out';
  for(const [x,y,r] of holes){const sx=x*T-camX,sy=(y-.7)*T-camY;if(sx<-r||sy<-r||sx>VW+r||sy>VH+r)continue;const gr=g.createRadialGradient(sx,sy,r*.2,sx,sy,r);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(sx-r,sy-r,r*2,r*2)}
  g.globalCompositeOperation='source-over';ctx.drawImage(darkC,0,0,VW,VH)}

/* Các ô trong khung [x0..x1]×[y0..y1] thỏa ok(x, y), đi tới được từ (sx, sy), cách nhau ít nhất gap ô.
   Chọn theo hash cố định nên lần nào cũng giống nhau. */
export function pickTiles(sx,sy,x0,y0,x1,y1,ok,n,gap){const prev=bfs(sx,sy),c=[];
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(prev[y*W+x]!==-2&&walkable(x,y)&&ok(x,y))c.push([x,y,Hs(x,y,77)]);
  c.sort((a,b)=>a[2]-b[2]);const out=[];
  for(const [x,y] of c){if(out.length>=n)break;if(out.every(([a,b])=>Math.abs(a-x)+Math.abs(b-y)>=gap))out.push([x,y])}
  return out.map(([x,y])=>({x:x+.5,y:y+.5}))}

/* Mũi tên ở mép màn hình chỉ về phía mục tiêu kế tiếp khi mục tiêu ở ngoài màn hình. */
export function goalArrow(){const g=MG&&MG.goal&&MG.goal();if(!g)return;const sx=g[0]*T-camX,sy=(g[1]-.5)*T-camY,m=40;
  if(sx>m&&sy>m&&sx<VW-m&&sy<VH-m)return;
  const cx=VW/2,cy=VH/2,dx=sx-cx,dy=sy-cy,k=Math.min((VW/2-m)/Math.max(1,Math.abs(dx)),(VH/2-m)/Math.max(1,Math.abs(dy))),ax=cx+dx*k,ay=cy+dy*k,an=Math.atan2(dy,dx),b=Math.sin(clock*6)*3;
  ctx.save();ctx.translate(ax+Math.cos(an)*b,ay+Math.sin(an)*b);ctx.rotate(an);ctx.fillStyle='#0b0d0c';ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-10,-11);ctx.lineTo(-10,11);ctx.closePath();ctx.fill();
  ctx.fillStyle='#e2bf72';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-7,-7);ctx.lineTo(-7,7);ctx.closePath();ctx.fill();ctx.restore()}

/* lấp lánh nhỏ ở (x, y), như chỗ khám phá */
export function twinkle(x,y,col='#f2e6a8'){const sx=Math.round(x*TS),sy=Math.round(y*TS),p=(Math.sin(clock*5+x*3)+1)/2,r=1+Math.round(p*2);
  ctx.fillStyle=col;ctx.fillRect((sx-r)*Z-camX,(sy-6)*Z-camY,(2*r+1)*Z,Z);ctx.fillRect(sx*Z-camX,(sy-6-r)*Z-camY,Z,(2*r+1)*Z)}

/* Dòng biên niên cho các màn chơi giữa game (endChapter ở climax.js gọi). */
export function midChronicle(){const F=S.flags,L=[],V=S.vat;
  if(V&&(V.won||V.lost))L.push(V.do?`Bạn thành đô vật làng An Phú sau ${V.won} keo thắng ở sới hội xuân. Đêm giặc đến, bạn chịu đòn được hơn.`:`Bạn vào sới vật hội xuân, thắng ${V.won} keo, thua ${V.lost} keo.`);
  if(F.sau)L.push({giu:'Năm 1280 sâu cắn lúa khắp đồng, bạn rắc tro bắt sâu giữ được ruộng nhà, chỉ cách cho cả xóm.',vua:'Năm 1280 sâu cắn lúa, bạn giữ được một phần ruộng.',mat:'Năm 1280 sâu ăn trắng ruộng nhà dù bạn đã ra đồng bắt.',bo:'Năm 1280 sâu cắn lúa, bạn mặc kệ. Nhà mất mùa, sâu lan sang cả ruộng hàng xóm.'}[F.sau]);
  if(F.kien)L.push({thang:'Năm 1280 bạn vạch ra tờ văn tự giả của ông Cả Lợi, giữ lại thửa ruộng cho bà Tư.',thua:'Năm 1280 bạn đứng ra cãi cho bà Tư, nhưng không đủ chứng cứ. Bà Tư mất thửa ruộng bờ sông.',bo:'Năm 1280 bà Tư bị ông Cả Lợi lấy ruộng bằng tờ văn tự giả. Bạn có chữ mà không đứng ra.'}[F.kien]);
  if(F.cuop)L.push({win:'Đông 1280 bạn đuổi toán cướp ra tận bãi sông, giữ lại được trâu cho ông Cả Lợi.',lost:'Đông 1280 bạn đuổi theo toán cướp trâu nhưng không kịp, chúng chèo thuyền đi mất.',nga:'Đông 1280 bạn một mình đánh toán cướp trâu, bị đánh ngã ngoài bãi sông.',bo:'Đông 1280 cướp dắt trâu nhà ông Cả đi ngay trước làng, bạn không ra.'}[F.cuop]);
  return L}
