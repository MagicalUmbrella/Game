/* ================= kinh thành Thăng Long ================= */
/* Kinh thành gấp đôi bản cũ (10/2026), tọa độ thế giới. Ba vòng thành:
   - Thành ngoài (KINH, x 6–70, y 1–39): tường đá, cổng nam (đường xuống làng An Phú), cổng nam phụ (x 24),
     cổng đông (đường ra bến Đông Bộ Đầu). Trẻ dưới 12 tuổi không qua cổng (input.js).
   - Hoàng thành (HOANG), có hào nước bao quanh (HAO) và cầu ở ba cổng. Toàn thư (năm 1010) chép bốn cửa thành Thăng Long:
     đông Tường Phù, tây Quảng Phúc, nam Đại Hưng, bắc Diệu Đức. Cổng Hoàng thành đóng, có lính gác; người thường không vào.
   - Cấm thành (CAM) giữa Hoàng thành: điện Thiên An, sân rồng Long Trì (Toàn thư: vua ngự điện Thiên An xem đấu voi
     ở Long Trì), hai dãy nhà lang hai bên. Bên tả cung Thánh Từ (thượng hoàng ở), bên hữu cung Quan Triều (vua ở),
     theo Toàn thư mục năm 1230.
   Ngoài Hoàng thành: chùa Diên Hựu có hồ và gác một cột, Quốc học viện (lập năm 1253), phường phố bên tả bên hữu
   (Toàn thư năm 1230: chia 61 phường), chợ có hàng sách, lò rèn, hàng gốm, phường Nhai Tuân của người Tống (1274),
   Giảng võ đường và sân tập (1253), tháp Báo Thiên. Bố cục cụ thể, nhà phố, người đi lại là hư cấu.
   buildCity(api) gọi từ map.js sau buildWorld: ghi ô bản đồ, CITY_BUILD (nhà), CITY_DECOR (vật trang trí), CITY_SIGNS.
   cityFolk(): người đi lại, đứng gác, bán hàng, tập võ trong thành (chỉ để nhìn), render.js vẽ. Hình vật trang trí ở kinhthanh_ve.js
   (tách riêng để module này chỉ import constants.js, map.js gọi được lúc nạp mà không vướng vòng import). */
import {BR,FI,G,GA,PA,SA,ST,TR,WA,WL} from './constants.js';

export const KINH={x0:6,y0:1,x1:70,y1:39};
export const HOANG={x0:41,y0:4,x1:65,y1:24};
export const HAO={x0:39,y0:2,x1:67,y1:26};
export const CAM={x0:46,y0:6,x1:60,y1:20};
export const LONGTRI={x0:47,y0:11,x1:59,y1:19};
export const GATES_K={nam:[52,53,54],namPhu:[24],dong:[31,32]};   // cổng thành ngoài: nam, nam phụ (x), đông (y)
export const HOANG_DOORS=[[53.5,25.6,'Cửa Đại Hưng'],[40.4,15,'Cửa Quảng Phúc'],[66.6,15,'Cửa Tường Phù']];   // đứng trước cổng Hoàng thành (đóng) bấm E
export const CITY_BUILD=[],CITY_DECOR=[],CITY_SIGNS=[];
export const CLOSED=new Set();   // ô cổng đóng (Hoàng thành, Cấm thành): map.js đánh dấu bsolid
const B=(id,name,x,y,w,h,kind)=>CITY_BUILD.push({id,name,x,y,w,h,kind});
const D=(kind,x,y,solid=1,o={})=>CITY_DECOR.push({kind,x,y,solid,city:1,...o});
const SG=(x,y,name,text)=>CITY_SIGNS.push({x,y,name,text});
/* vòng tường nào (0 thành ngoài, 1 Hoàng thành, 2 Cấm thành) chứa ô tường (x,y); null nếu không phải */
const RINGS=[KINH,HOANG,CAM];
const onRing=(r,x,y)=>(x===r.x0||x===r.x1)&&y>=r.y0&&y<=r.y1||(y===r.y0||y===r.y1)&&x>=r.x0&&x<=r.x1;
export function wallRing(x,y){for(let i=2;i>=0;i--)if(onRing(RINGS[i],x,y))return i;return null}
export const ringRect=i=>RINGS[i];

export function buildCity({set,get,fill}){
  const ring=(r,t)=>{for(let x=r.x0;x<=r.x1;x++){set(x,r.y0,t);set(x,r.y1,t)}for(let y=r.y0;y<=r.y1;y++){set(r.x0,y,t);set(r.x1,y,t)}};
  // nền: cỏ, tường thành ngoài, cổng
  fill(KINH.x0,KINH.y0,KINH.x1,KINH.y1,G);ring(KINH,WL);
  for(const x of GATES_K.nam)set(x,KINH.y1,GA);for(const x of GATES_K.namPhu)set(x,KINH.y1,GA);for(const y of GATES_K.dong)set(KINH.x1,y,GA);
  // đại lộ lát đá: từ cổng nam lên cửa Đại Hưng; ngang thành từ tây sang cổng đông; đường cổng nam phụ
  fill(52,27,54,38,ST);fill(7,31,69,32,ST);fill(23,26,25,38,ST);
  // đường vòng quanh hào, ngõ phường
  fill(38,2,38,30,PA);fill(68,2,69,30,PA);fill(38,27,69,27,PA);fill(7,12,37,12,PA);
  for(const x of [12,18,30,36])fill(x,13,x,30,PA);for(const y of [18,24])fill(7,y,37,y,PA);fill(7,34,51,34,PA);fill(55,34,69,34,PA);fill(31,33,31,38,PA);fill(44,28,44,38,PA);
  // hào nước quanh Hoàng thành, cầu ở ba cổng
  ring(HAO,WA);fill(HAO.x0+1,HAO.y0+1,HAO.x1-1,HAO.y1-1,G);
  fill(52,HAO.y1,54,HAO.y1,BR);fill(HAO.x0,14,HAO.x0,15,BR);fill(HAO.x1,14,HAO.x1,15,BR);
  fill(52,HOANG.y1+1,54,HOANG.y1+1,ST);fill(HAO.x0+1,14,HOANG.x0-1,15,ST);fill(HOANG.x1+1,14,HAO.x1-1,15,ST);
  // Hoàng thành: tường, bốn cửa (đóng)
  ring(HOANG,WL);fill(HOANG.x0+1,HOANG.y0+1,HOANG.x1-1,HOANG.y1-1,ST);
  const gate=(x,y)=>{set(x,y,GA);CLOSED.add(x+','+y)};
  for(const x of [52,53,54])gate(x,HOANG.y1);gate(HOANG.x0,14);gate(HOANG.x0,15);gate(HOANG.x1,14);gate(HOANG.x1,15);gate(53,HOANG.y0);
  // Cấm thành: tường, cổng nam (đóng), sân rồng Long Trì
  ring(CAM,WL);fill(CAM.x0+1,CAM.y0+1,CAM.x1-1,CAM.y1-1,ST);for(const x of [52,53,54])gate(x,CAM.y1);
  // vườn ngự uyển phía tây: hồ, cây; phía đông: cây quanh kho
  fill(42,11,45,19,G);fill(42,12,44,16,WA);for(const [x,y] of [[45,11],[45,17],[42,18],[44,19],[45,13]])set(x,y,TR);
  fill(61,11,64,19,G);for(const [x,y] of [[61,15],[64,15],[61,18],[64,18],[62,19]])set(x,y,TR);
  // chùa Diên Hựu: hồ vuông, gác một cột giữa hồ
  fill(10,3,16,8,G);fill(11,4,15,7,WA);
  // Quốc học viện: sân lát đá, hàng cây
  fill(20,3,34,10,G);fill(22,7,32,10,ST);for(const x of [21,33])for(const y of [4,6,8,10])set(x,y,TR);
  // chợ: sân lát đá
  fill(25,19,35,29,ST);
  // sân Giảng võ: đất cát
  fill(56,33,68,38,SA);fill(56,28,69,30,G);
  // khu tháp Báo Thiên
  fill(45,28,51,33,G);fill(45,35,51,38,G);
  // cây trồng dọc đại lộ, quanh phường
  for(let y=29;y<=37;y+=3){set(51,y,TR);set(55,y,TR)}
  for(let x=9;x<=67;x+=6)if(x<23||x>25)if(get(x,30)!==ST)set(x,30,TR);
  for(const [x,y] of [[37,36],[37,14],[66,37]])set(x,y,TR);

  // ---- nhà, công trình ----
  B('dien','Điện Thiên An',48,7,11,4,'dien');
  B('langT','',47,12,2,7,'lang');B('langH','',58,12,2,7,'lang');
  B('quantrieu','Cung Quan Triều',42,6,4,3,'palace');B('thanhtu','Cung Thánh Từ',61,6,4,3,'palace');
  B('kho','Kho',61,11,4,2,'kho');B('kho2','',61,20,4,2,'kho');B('vuon','',42,21,4,2,'lang');
  B('dienhuu','Chùa Diên Hựu',9,9,6,3,'pagoda');
  B('hocvien','Quốc học viện',23,3,8,3,'school');
  B('giangvo','Giảng võ đường',58,28,6,3,'dinh');
  B('thap','Tháp Báo Thiên',47,29,2,2,'tower');B('baothien','Chùa Báo Thiên',45,35,6,3,'pagoda');
  // chợ: bốn hàng có người bán (NPC ở state.js) và mấy hàng khác
  B('sach','Hàng sách',26,20,3,2,'stall');B('ren','Lò rèn',31,20,3,2,'stall');
  B('nhaituan','Phường Nhai Tuân',26,25,3,2,'stall');B('gom','Hàng gốm',31,25,3,2,'stall');
  B('vai','',34,20,2,2,'stall');B('gao','',34,25,2,2,'stall');
  // phường: nhà phố mái ngói hai bên ngõ
  let n=0;const pho=(x,y,w=4,h=3)=>{if(x<KINH.x0+1||x+w>KINH.x1)return;B('pho'+(n++),'',x,y,w,h,'pho')};
  for(const y of [13,19,25])for(const x of [7,13,19])pho(x+(y===19?0:0),y,4,3);
  for(const [x,y] of [[31,13],[7,35],[13,35],[19,35],[26,35],[32,35]])pho(x,y,4,3);
  pho(7,28,4,2);pho(13,28,4,2);pho(19,28,3,2);pho(64,28,4,2);
  // ---- trang trí ----
  D('motcot',13,5);                                   // gác một cột giữa hồ Diên Hựu
  for(const x of [24,26,28,30])D('bia',x,8);          // bia đá ở Quốc học viện
  D('co',53,15,1,{big:1});                            // cột cờ giữa sân rồng
  for(const x of [50,56])D('nghe',x,28);              // nghê đá hai bên đường lên cửa Đại Hưng
  for(const [x,y] of [[50,11],[56,11],[50,19],[56,19]])D('den',x,y);   // đèn đá ở Long Trì
  D('them',52,11,0);D('them',54,11,0);                // thềm rồng trước điện
  D('thuydinh',43,14);                                // thủy đình giữa hồ ngự uyển
  for(const [x,y] of [[57,34],[63,34]])D('gia',x,y);  // giá binh khí
  for(const x of [59,61,63,65])D('nom',x,37);         // hình nộm tập đâm
  D('well',28,17);D('well',16,33);D('banyan',36,29);D('well',20,27);
  for(const [x,y] of [[KINH.x0,KINH.y0],[KINH.x1,KINH.y0],[KINH.x0,KINH.y1],[KINH.x1,KINH.y1]])D('vong',x,y,0);   // vọng lâu bốn góc thành
  for(const [x,y] of [[HOANG.x0,HOANG.y0],[HOANG.x1,HOANG.y0],[HOANG.x0,HOANG.y1],[HOANG.x1,HOANG.y1]])D('vong',x,y,0,{red:1});
  // ---- biển ----
  SG(49,28,'Cửa Đại Hưng','Cửa Đại Hưng, cửa nam Hoàng thành. Toàn thư chép năm 1010 thành Thăng Long mở bốn cửa: đông Tường Phù, tây Quảng Phúc, nam Đại Hưng, bắc Diệu Đức.');
  SG(37,16,'Cửa Quảng Phúc','Cửa Quảng Phúc, cửa tây Hoàng thành.');
  SG(69,12,'Cửa Tường Phù','Cửa Tường Phù, cửa đông Hoàng thành.');
  SG(17,8,'Chùa Diên Hựu','Chùa Diên Hựu, có gác một cột giữa hồ. Toàn thư chép năm 1249 trùng tu chùa trên nền cũ.');
  SG(22,11,'Quốc học viện','Quốc học viện, nơi giảng Tứ thư, Lục kinh. Toàn thư chép lập năm 1253.');
  SG(65,30,'Giảng võ đường','Giảng võ đường, nơi luyện tập võ nghệ. Toàn thư chép lập năm 1253.');
  SG(50,32,'Tháp Báo Thiên','Tháp Báo Thiên, ngọn tháp cao nhất kinh thành.');
  SG(26,30,'Chợ kinh thành','Chợ trong kinh thành (hư cấu): hàng sách, lò rèn, hàng gốm, hàng của người Tống ở phường Nhai Tuân.');
}

/* ---------- người trong thành (chỉ để nhìn) ---------- */
const LOOKS=['dan_nam1','dan_nam2','dan_nu1','dan_nu2','dan_nu3','ong_gia','khach','trai2','trai3','dan1','tre1','tre2'];
const ROUTES=[   // vòng đi, theo các đường, ngõ (tọa độ ô)
  [[8.5,31.5],[68.5,31.5],[68.5,27.5],[38.5,27.5],[38.5,31.5]],
  [[53.5,38],[53.5,27.8],[38.5,27.8],[38.5,31.5],[53.5,31.5]],
  [[12.5,13],[12.5,30.5],[30.5,30.5],[30.5,13]],
  [[7.5,18.5],[37.5,18.5],[37.5,24.5],[7.5,24.5]],
  [[24,38],[24,26.5],[36,26.5],[36,18.6],[24.5,18.6]],
  [[18.5,13],[18.5,34.5],[44.5,34.5],[44.5,28],[38.5,28]],
  [[26,22.5],[35,22.5],[35,27.6],[26,27.6]],
  [[68.5,3],[68.5,26.5],[38.5,26.8],[38.5,3]],
];
const along=(pts,s)=>{const L=[];let tot=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],l=Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1]);L.push(l);tot+=l}
  let u=((s%tot)+tot)%tot;for(let i=0;i<pts.length;i++){if(u<=L[i]){const a=pts[i],b=pts[(i+1)%pts.length],f=L[i]?u/L[i]:0,dx=b[0]-a[0],dy=b[1]-a[1];
    return {x:a[0]+dx*f,y:a[1]+dy*f,dir:Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')}}u-=L[i]}return {x:pts[0][0],y:pts[0][1],dir:'down'}};
const STAND=[];   // người đứng yên: [x, y, hướng, hình, việc]
(function(){
  for(const [x,y] of [[51.3,27.7],[55.7,27.7]])STAND.push([x,y,'down','quan','gac']);                       // gác cầu Đại Hưng
  for(const [x,y] of [[38.6,13.3],[38.6,16.6]])STAND.push([x,y,'left','quan','gac']);
  for(const [x,y] of [[68.4,13.3],[68.4,16.6]])STAND.push([x,y,'right','quan','gac']);
  for(const [x,y] of [[51.3,22.6],[55.7,22.6]])STAND.push([x,y,'down','quan','gac']);                       // gác cổng Cấm thành (trong Hoàng thành)
  for(let y=12.8;y<=18.6;y+=1.45){STAND.push([50.6,y,'right','voquan','chau']);STAND.push([55.4,y,'left','hocquan','chau'])}   // hai ban văn võ đứng chầu ở Long Trì
  for(const [x,y] of [[35,22.4],[35,27.4]])STAND.push([x,y,'down',['dan_nu1','dan_nu3'][STAND.length%2],'ban']);   // hàng vải, hàng gạo (bốn hàng kia có NPC ở state.js)
  for(const [x,y] of [[12.6,12.8],[16.4,11.3]])STAND.push([x,y,'down','su','su']);
  for(const [x,y] of [[47.3,38.4],[49.6,38.4]])STAND.push([x,y,'up','su','su']);
  for(let i=0;i<8;i++)STAND.push([23.5+(i%4)*2.6,9.9+Math.floor(i/4)*1.3,'up','ban_van','hoc']);              // học trò ở sân Quốc học viện
  for(let i=0;i<12;i++)STAND.push([58+(i%6)*1.8,34.6+Math.floor(i/6)*1.6,'up','quan','tap']);              // lính tập ở sân Giảng võ
  for(const [x,y] of [[10.5,21.5],[15.5,27.4],[33.5,16.6]])STAND.push([x,y,'down','tre2','choi']);
})();
let cache=null,cacheT=-1;
export function cityFolk(t){if(cache&&Math.abs(t-cacheT)<1/90)return cache;cacheT=t;const out=[];
  ROUTES.forEach((r,i)=>{for(let k=0;k<4;k++){const sp=.9+((i*7+k*3)%5)*.08,a=along(r,(t*sp+k*13.7+i*5.1)*(k%2?-1:1)),dir=k%2?{up:'down',down:'up',left:'right',right:'left'}[a.dir]:a.dir;
    out.push({x:a.x+(k%2?.25:-.25),y:a.y+(k%2?.2:-.2),dir,moving:true,walk:t*7+k,look:{id:LOOKS[(i*4+k)%LOOKS.length],kid:LOOKS[(i*4+k)%LOOKS.length].startsWith('tre')}})}});
  for(const [x,y,dir,id,job] of STAND){const ph=x*3.1+y;let f=0;
    if(job==='tap')f=Math.sin(t*4+ph*.2)>.4?'a1':Math.sin(t*4+ph*.2)>-.2?'a0':0;
    else if(job==='choi')f=[1,0,2,0][Math.floor(t*6+ph)%4];
    out.push({x,y:y+(job==='choi'?Math.sin(t*3+ph)*.3:0),dir:job==='choi'?['down','left','up','right'][Math.floor(t*.7+ph)%4]:dir,moving:job==='choi',frame:f,walk:0,look:{id,kid:id.startsWith('tre')}})}
  return cache=out}
