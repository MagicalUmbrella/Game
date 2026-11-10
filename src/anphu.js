/* ================= làng An Phú (bản đồ đợt 2, 11/2026) ================= */
/* Hư cấu hoàn toàn. Thêm vào làng gốc (map.js: nhà mình, nhà bà Tư, trường, đình, sân võ, chùa) mà không dời chỗ nào cũ,
   nên mọi việc chương một (NPC, lụt, đêm 1285) vẫn ở chỗ cũ. Chỉ import constants.js (giống world.js, kinhthanh.js).
   - Xóm Đông (x 55–73, y 51–72): đường xóm (x 64), nhà ông Cả Lợi mái ngói có rào, hai nhà rào tre, chợ làng hai lều
     bên đường, ao làng có cầu ao, giếng xóm.
   - Xóm Tây (x 23–29, y 73–87, giữa rừng và ruộng): hai nhà, bụi chuối.
   - Lũy tre: bờ đông (x 74, chừa lối ở đường cái, lối ra bến ông lái đò, lối ra bãi) và bờ nam (y 88, cổng làng ở đường x 40).
   - Cổng làng ở ba lối vào (hai đầu cầu sông Tô Lịch phía bắc, đường đi phía nam); quán nước ở đầu làng (cạnh cổng phía đông bắc); miếu thổ địa;
     chuồng gà, cối giã gạo, nong phơi thóc, giàn bầu.
   Mọi tọa độ là tọa độ thế giới (đã cộng OY).
   AP_BUILD, AP_DECOR (vẽ ở anphu_ve.js, cờ lang), AP_SIGNS gộp vào BUILDINGS, DECOR, SIGNS ở map.js; AP_SOLID là ô chặn
   thêm (cột cổng); AP_TREE: ô cây đặt sẵn và loại cây (1 tre, 2 cau, 3 chuối). villageFolk(t): người trong làng đi lại,
   ngồi quán, bán hàng, trẻ chơi (chỉ để nhìn; render.js vẽ trước đêm tháng giêng 1285). */
import {G,PA,TR,WA,W} from './constants.js';

export const AP_BUILD=[],AP_DECOR=[],AP_SIGNS=[],AP_SOLID=[],AP_TREE=new Map();
export const VILLAGE={x0:6,y0:48,x1:76,y1:90};   // khung làng (ranh vẽ người trong làng)
const YARDS=[   // vườn có rào: khung rào [x0,y0,x1,y1], lối vào (các ô để trống trên rào)
  {r:[55,52,62,59],gate:[[62,56],[62,57]]},
  {r:[66,52,73,58],gate:[[66,55],[66,56]]},
  {r:[66,61,73,68],gate:[[66,64],[66,65]]}];

export function buildAnPhu({set,get,fill,road}){
  const clear=(x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(get(x,y)===TR)set(x,y,G)};
  const tree=(x,y,v)=>{if(get(x,y)===G){set(x,y,TR);AP_TREE.set(y*W+x,v)}};
  const B=(id,name,x,y,w,h,kind)=>{clear(x,y,x+w-1,y+h);AP_BUILD.push({id,name,x,y,w,h,kind})};
  const D=(kind,x,y,o={})=>AP_DECOR.push({kind,x,y,lang:1,...o});
  // xóm Đông: đường xóm, vườn rào
  clear(54,50,74,72);
  road(64,51,64,72);road(52,64,64,64);
  for(const yd of YARDS){const [x0,y0,x1,y1]=yd.r,gate=new Set(yd.gate.map(([x,y])=>x+','+y));
    for(let x=x0;x<=x1;x++)for(const y of [y0,y1])if(!gate.has(x+','+y))D('rao',x,y,{solid:1,h:1,end:x===x0||x===x1});
    for(let y=y0+1;y<y1;y++)for(const x of [x0,x1])if(!gate.has(x+','+y))D('rao',x,y,{solid:1,v:1})}
  B('caloi','Nhà ông Cả Lợi',56,53,6,3,'nhangoi');
  B('xd1','',67,53,4,3,'house');B('xd2','',67,62,4,3,'house');
  D('ga',57,57,{solid:1});D('nong',59,57,{flat:1});D('coi',68,57,{solid:1});D('gian',71,57,{solid:1});D('ga',71,66,{solid:1});D('nong',68,66,{flat:1});
  // chợ làng: hai lều bên đường xóm
  B('cho_rau','',55,61,3,2,'stall');B('cho_ca','',59,61,3,2,'stall');
  AP_SIGNS.push({x:63,y:62,name:'Chợ làng',text:'Chợ làng An Phú, họp buổi sáng bên đường xóm Đông: rau, cá đồng, gạo, nồi đất.'});
  AP_SIGNS.push({x:63,y:53,name:'Xóm Đông',text:'Xóm Đông làng An Phú. Nhà ông Cả Lợi mái ngói ở đầu xóm.'});
  // ao làng, cầu ao, giếng xóm
  fill(55,66,61,70,WA);fill(56,71,60,71,WA);set(55,70,G);set(61,70,G);
  D('cauao',58,66);D('well',63,66,{solid:1,plain:1});
  for(const [x,y] of [[65,59],[65,60],[54,67],[62,69]])tree(x,y,2);   // cau
  // xóm Tây
  B('xt1','',24,74,4,3,'house');B('xt2','',25,82,4,3,'house');
  for(const [x,y] of [[23,73],[28,73],[24,86],[29,85]])tree(x,y,3);   // chuối
  // lũy tre: bờ đông, bờ nam; chừa lối
  const gapE=new Set([51,63,64,70,71,80]);
  for(let y=52;y<=87;y++)if(!gapE.has(y))tree(74,y,1);
  road(40,86,40,92);
  for(let x=22;x<=73;x++)if(x<39||x>41)tree(x,88,1);
  // cổng làng (cột cổng chặn, lối giữa đi được)
  for(const [x,y] of [[40,88],[53,49],[24,49]]){D('cong',x,y);for(const dx of [-1,1]){set(x+dx,y,G);AP_SOLID.push([x+dx,y])}}
  // quanh làng cũ: quán nước đầu làng, miếu thổ địa, chuồng gà, nong thóc, giàn bầu
  D('quan',57,49,{solid:1});D('mieu',27,57,{solid:1});D('ga',32,70,{solid:1});D('nong',53,69,{flat:1});D('nong',54,71,{flat:1});D('gian',38,69,{solid:1})}

/* ---------- người trong làng (chỉ để nhìn) ---------- */
const ROUTES=[
  [[41,64.5],[63.5,64.5],[63.5,52.2],[63.5,64.5]],          // đi chợ
  [[40.5,52],[40.5,86],[40.5,52]],                           // đường cái làng
  [[63.6,52],[63.6,71.5]],                                    // đường xóm Đông
  [[24.5,78.5],[29.5,78.5],[29.5,81.5],[24.5,81.5]]];         // xóm Tây
const LOOKS=['dan_nam1','dan_nu1','dan_nam2','dan_nu2','ong_gia','dan_nu3','tre1','dan_nam1'];
const STAND=[[56.2,50.1,'right','ong_gia','ngoi'],[58.1,50.2,'left','dan_nam2','ngoi'],   // quán nước đầu làng
  [56.5,63.4,'down','dan_nu1','ban'],[60.5,63.4,'down','dan_nu3','ban'],                    // bán rau, bán cá
  [57.2,65.3,'down','dan_nu2','ban'],                                                        // giặt ở cầu ao
  [62.5,60.6,'left','tre1','choi'],[66.6,70.2,'up','tre2','choi'],[30.5,71.3,'up','tre2','choi']];
const along=(pts,s)=>{const L=[];let tot=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],l=Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1]);L.push(l);tot+=l}
  let u=((s%tot)+tot)%tot;for(let i=0;i<pts.length;i++){if(u<=L[i]){const a=pts[i],b=pts[(i+1)%pts.length],f=L[i]?u/L[i]:0,dx=b[0]-a[0],dy=b[1]-a[1];
    return {x:a[0]+dx*f,y:a[1]+dy*f,dir:Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')}}u-=L[i]}return {x:pts[0][0],y:pts[0][1],dir:'down'}};
let cache=null,cacheT=-1;
export function villageFolk(t){if(cache&&Math.abs(t-cacheT)<1/90)return cache;cacheT=t;const out=[];
  ROUTES.forEach((r,i)=>{for(let k=0;k<2;k++){const sp=.8+((i*5+k*3)%4)*.07,a=along(r,t*sp+k*21.3+i*7.7),id=LOOKS[(i*2+k)%LOOKS.length];
    out.push({x:a.x+(k?.2:-.2),y:a.y,dir:a.dir,moving:true,walk:t*7+k,look:{id,kid:id.startsWith('tre')}})}});
  for(const [x,y,dir,id,job] of STAND){const ph=x*3.1+y;
    if(job==='choi')out.push({x,y:y+Math.sin(t*3+ph)*.3,dir:['down','left','up','right'][Math.floor(t*.7+ph)%4],moving:true,frame:[1,0,2,0][Math.floor(t*6+ph)%4],walk:0,look:{id,kid:true}});
    else out.push({x,y,dir,moving:false,frame:0,walk:0,look:{id,kid:false}})}
  return cache=out}
