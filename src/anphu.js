/* ================= làng An Phú (bản đồ đợt 2, 11/2026) ================= */
/* Hư cấu hoàn toàn. Thêm vào làng gốc (map.js: nhà mình, nhà bà Tư, trường, đình, sân võ, chùa) mà không dời chỗ nào cũ,
   nên mọi việc chương một (NPC, lụt, đêm 1285) vẫn ở chỗ cũ. Chỉ import constants.js (giống world.js, kinhthanh.js).
   - Xóm Đông (x 55–73, y gốc 31–52): đường xóm (x 64), nhà ông Cả Lợi mái ngói có rào, hai nhà rào tre, chợ làng hai lều
     bên đường, ao làng có cầu ao, giếng xóm.
   - Lũy tre ôm sát khu nhà ở (11/2026, cho làng nhỏ hẳn so với kinh thành): bờ đông (x 74, chừa lối ra bến ông lái đò,
     ra bãi) và bờ nam (y gốc 52, giữa làng và ruộng: từng khóm tre cách quãng, chừa nhiều lối ra đồng, vì đêm 1285 dân
     phải chạy qua; lũy kín thì đêm ấy khó hẳn). Ruộng, rừng tây, bụi chuối ở ngoài lũy.
   - Cổng làng ở ba lối vào (hai đầu cầu sông Tô Lịch phía bắc, đường ra đồng phía nam); quán nước ở đầu làng (cạnh cổng phía đông bắc); miếu thổ địa;
     chuồng gà, cối giã gạo, nong phơi thóc, giàn bầu.
   AP_BUILD, AP_DECOR (vẽ ở anphu_ve.js, cờ lang), AP_SIGNS gộp vào BUILDINGS, DECOR, SIGNS ở map.js; AP_SOLID là ô chặn
   thêm (cột cổng); AP_TREE: ô cây đặt sẵn và loại cây (1 tre, 2 cau, 3 chuối). villageFolk(t): người trong làng đi lại,
   ngồi quán, bán hàng, trẻ chơi (chỉ để nhìn; render.js vẽ trước đêm tháng giêng 1285). */
import {G,OY,PA,TR,WA,W} from './constants.js';
/* Tọa độ trong file này là tọa độ gốc (như phần gốc của map.js): hàng y gốc là hàng y+OY của bản đồ thế giới. Nới bản đồ
   phía bắc (đổi OY) thì làng tự dời theo, không phải sửa số. Dữ liệu xuất ra (AP_*, VILLAGE, villageFolk) đã cộng OY. */

export const AP_BUILD=[],AP_DECOR=[],AP_SIGNS=[],AP_SOLID=[],AP_TREE=new Map();
export const VILLAGE={x0:22,y0:28+OY,x1:76,y1:54+OY};   // khung làng (ranh vẽ người trong làng)
const YARDS=[   // vườn có rào: khung rào [x0,y0,x1,y1], lối vào (các ô để trống trên rào)
  {r:[55,32,62,39],gate:[[62,36],[62,37]]},
  {r:[66,32,73,38],gate:[[66,35],[66,36]]},
  {r:[66,41,73,48],gate:[[66,44],[66,45]]}];

export function buildAnPhu(api){
  const set=(x,y,v)=>api.set(x,y+OY,v),get=(x,y)=>api.get(x,y+OY),fill=(x0,y0,x1,y1,v)=>api.fill(x0,y0+OY,x1,y1+OY,v),road=(x0,y0,x1,y1)=>api.road(x0,y0+OY,x1,y1+OY);
  const clear=(x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(get(x,y)===TR)set(x,y,G)};
  const tree=(x,y,v)=>{if(get(x,y)===G){set(x,y,TR);AP_TREE.set((y+OY)*W+x,v)}};
  const B=(id,name,x,y,w,h,kind)=>{clear(x,y,x+w-1,y+h);AP_BUILD.push({id,name,x,y:y+OY,w,h,kind})};
  const D=(kind,x,y,o={})=>AP_DECOR.push({kind,x,y:y+OY,lang:1,...o});
  // xóm Đông: đường xóm, vườn rào
  clear(54,30,74,52);
  road(64,31,64,52);road(52,44,64,44);
  for(const yd of YARDS){const [x0,y0,x1,y1]=yd.r,gate=new Set(yd.gate.map(([x,y])=>x+','+y));
    for(let x=x0;x<=x1;x++)for(const y of [y0,y1])if(!gate.has(x+','+y))D('rao',x,y,{solid:1,h:1,end:x===x0||x===x1});
    for(let y=y0+1;y<y1;y++)for(const x of [x0,x1])if(!gate.has(x+','+y))D('rao',x,y,{solid:1,v:1})}
  B('caloi','Nhà ông Cả Lợi',56,33,6,3,'nhangoi');
  B('xd1','',67,33,4,3,'house');B('xd2','',67,42,4,3,'house');
  D('ga',57,37,{solid:1});D('nong',59,37,{flat:1});D('coi',68,37,{solid:1});D('gian',71,37,{solid:1});D('ga',71,46,{solid:1});D('nong',68,46,{flat:1});
  // chợ làng: hai lều bên đường xóm
  B('cho_rau','',55,41,3,2,'stall');B('cho_ca','',59,41,3,2,'stall');
  AP_SIGNS.push({x:63,y:42+OY,name:'Chợ làng',text:'Chợ làng An Phú, họp buổi sáng bên đường xóm Đông: rau, cá đồng, gạo, nồi đất.'});
  AP_SIGNS.push({x:63,y:33+OY,name:'Xóm Đông',text:'Xóm Đông làng An Phú. Nhà ông Cả Lợi mái ngói ở đầu xóm.'});
  // ao làng, cầu ao, giếng xóm
  fill(55,46,61,50,WA);fill(56,51,60,51,WA);set(55,50,G);set(61,50,G);
  D('cauao',58,46);D('well',63,46,{solid:1,plain:1});
  for(const [x,y] of [[65,39],[65,40],[54,47],[62,49]])tree(x,y,2);   // cau
  // bụi chuối ngoài đồng phía tây
  for(const [x,y] of [[23,54],[28,54],[24,66],[29,65]])tree(x,y,3);
  // lũy tre ôm sát khu nhà ở: bờ đông (x 74), bờ nam (y gốc 52, giữa làng và ruộng); phía tây là rừng, phía bắc là sông
  const gapE=new Set([43,44,50,51]),gapS=new Set([39,40,41,49,50,51,63,64,65]);
  for(let y=32;y<=52;y++)if(!gapE.has(y))tree(74,y,1);
  for(let x=23;x<=73;x++)if(!gapS.has(x)&&(x+1)%6<3)tree(x,52,1);   // khóm tre cách quãng: chừa nhiều lối ra đồng (đêm 1285 dân phải chạy qua)
  road(40,66,40,72);road(40,51,40,53);road(50,51,50,53);road(64,52,64,53);
  // cổng làng (cột cổng chặn, lối giữa đi được)
  for(const [x,y] of [[40,52],[53,29],[24,29]]){D('cong',x,y);for(const dx of [-1,1]){set(x+dx,y,G);AP_SOLID.push([x+dx,y+OY])}}
  // quanh làng cũ: quán nước đầu làng, miếu thổ địa, chuồng gà, nong thóc, giàn bầu
  D('quan',57,29,{solid:1});D('mieu',27,37,{solid:1});D('ga',32,50,{solid:1});D('nong',53,49,{flat:1});D('nong',54,51,{flat:1});D('gian',38,49,{solid:1})}

/* ---------- người trong làng (chỉ để nhìn) ---------- */
const ROUTES=[
  [[41,44.5],[63.5,44.5],[63.5,32.2],[63.5,44.5]],          // đi chợ
  [[40.5,32],[40.5,51],[40.5,32]],                           // đường cái làng
  [[63.6,32],[63.6,51.5]]].map(r=>r.map(([x,y])=>[x,y+OY])); // đường xóm Đông
const LOOKS=['dan_nam1','dan_nu1','dan_nam2','dan_nu2','ong_gia','dan_nu3','tre1','dan_nam1'];
const STAND=[[56.2,30.1,'right','ong_gia','ngoi'],[58.1,30.2,'left','dan_nam2','ngoi'],   // quán nước đầu làng
  [56.5,43.4,'down','dan_nu1','ban'],[60.5,43.4,'down','dan_nu3','ban'],                    // bán rau, bán cá
  [57.2,45.3,'down','dan_nu2','ban'],                                                        // giặt ở cầu ao
  [62.5,40.6,'left','tre1','choi'],[66.6,50.2,'up','tre2','choi'],[30.5,51.3,'up','tre2','choi']].map(([x,y,...r])=>[x,y+OY,...r]);
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
