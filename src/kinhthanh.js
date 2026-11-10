/* ================= kinh thành Thăng Long ================= */
/* Kinh thành lớn (11/2026: bản đồ nới thêm 60 hàng phía bắc, OY = 80), tọa độ thế giới. Toàn thư mục năm 1230: mở rộng
   phía ngoài thành Đại La, bốn cửa thành giao quân Tứ sương thay nhau canh giữ; chia hai bên tả hữu kinh thành làm 61
   phường; trong thành dựng cung, điện, lầu, các, nhà lang vũ hai bên đông tây, bên tả cung Thánh Từ (thượng hoàng ở), bên hữu
   cung Quan Triều (vua ở). Ba vòng thành:
   - Thành ngoài, thành Đại La (KINH, x 6–70, y 18–99): tường đá. Cổng nam lớn trên trục chính (x 45–47), cổng nam đầu cầu
     sông Tô Lịch (x 52–54, đường xuống làng An Phú), cổng nam phụ (x 24), cổng đông (y 91–92, ra bến Đông Bộ Đầu), cổng
     bắc (x 46, ra hồ Dâm Đàm). Trẻ dưới 12 tuổi không qua cổng (input.js).
   - Hoàng thành (HOANG), hào nước bao quanh (HAO), cầu ở bốn cửa. Toàn thư năm 1010: bốn cửa đông Tường Phù, tây Quảng
     Phúc, nam Đại Hưng, bắc Diệu Đức. Cổng đóng, có lính gác; người thường không vào. Trong Hoàng thành: cung Quan Triều
     (tây), cung Thánh Từ (đông), vườn ngự uyển có hồ và thủy đình, chùa Chân Giáo (Toàn thư: làm năm 1024 ở trong thành,
     đời Trần vẫn còn trong đại nội), nhà lang vũ, kho, sân chầu trước cửa Cấm thành.
   - Cấm thành (CAM): điện Thiên An, sân rồng Long Trì (hai ban văn võ đứng chầu), hai dãy nhà lang.
   Ngoài Hoàng thành: phía tây chùa Diên Hựu (hồ, gác một cột), Văn Miếu (Toàn thư: làm năm 1070) và Quốc học viện (1253),
   phường phố, chợ (hàng sách, lò rèn, hàng gốm, vải, gạo, rau, cá, phường Nhai Tuân của người Tống); phía nam đại lộ, tháp
   và chùa Báo Thiên, Giảng võ đường và sân tập (1253), phố; phía bắc một dãy phố. Ngoài cổng bắc là hồ Dâm Đàm (Hồ Tây;
   Toàn thư chép đời Lý vua ra hồ xem đánh cá, làm hành cung bên hồ). Bố cục cụ thể, nhà phố, người đi lại là hư cấu.
   buildCity(api) gọi từ map.js sau buildWorld: ghi ô bản đồ, CITY_BUILD (nhà), CITY_DECOR (vật trang trí), CITY_SIGNS.
   cityFolk(): người đi lại, đứng gác, bán hàng, tập võ trong thành (chỉ để nhìn), render.js vẽ. Hình vật trang trí ở kinhthanh_ve.js
   (tách riêng để module này chỉ import constants.js, map.js gọi được lúc nạp mà không vướng vòng import). */
import {BR,FI,G,GA,PA,SA,ST,TR,WA,WL} from './constants.js';

export const KINH={x0:6,y0:18,x1:70,y1:99};
export const HAO={x0:26,y0:24,x1:66,y1:74};
export const HOANG={x0:28,y0:26,x1:64,y1:72};
export const CAM={x0:37,y0:30,x1:55,y1:58};
export const LONGTRI={x0:38,y0:35,x1:54,y1:57};
export const GATES_K={nam:[45,46,47,52,53,54],namPhu:[24],dong:[91,92],bac:[46]};   // cổng thành ngoài: nam, nam phụ (x), đông (y), bắc (x)
export const HOANG_DOORS=[[46.5,73.6,'Cửa Đại Hưng'],[27.4,49,'Cửa Quảng Phúc'],[65.6,49,'Cửa Tường Phù'],[46.5,25.4,'Cửa Diệu Đức']];   // đứng trước cổng Hoàng thành (đóng) bấm E
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
const hs=(x,y)=>{let h=(x*374761393+y*668265263)^0x5bd1e995;h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296};

export function buildCity({set,get,fill}){
  const ring=(r,t)=>{for(let x=r.x0;x<=r.x1;x++){set(x,r.y0,t);set(x,r.y1,t)}for(let y=r.y0;y<=r.y1;y++){set(r.x0,y,t);set(r.x1,y,t)}};
  const trees=(pts)=>{for(const [x,y] of pts)if(get(x,y)===G)set(x,y,TR)};
  // ---- ngoài cổng bắc: hồ Dâm Đàm ----
  fill(4,2,72,17,G);
  for(let y=2;y<=15;y++)for(let x=6;x<=42;x++){const d=Math.hypot((x+.5-24)/17,(y+.5-8.5)/5.6)+(hs(x,y)-.5)*.12;if(d<1)set(x,y,WA);else if(d<1.13)set(x,y,SA)}
  fill(46,2,46,17,PA);fill(12,16,46,16,PA);
  for(let x=8;x<=70;x+=3)for(const y of [3,6,10,13])if(get(x,y)===G&&hs(x,y)<.45)set(x,y,TR);
  // ---- nền, tường thành ngoài, cổng ----
  fill(KINH.x0,KINH.y0,KINH.x1,KINH.y1,G);ring(KINH,WL);
  for(const x of [...GATES_K.nam,...GATES_K.namPhu])set(x,KINH.y1,GA);for(const y of GATES_K.dong)set(KINH.x1,y,GA);for(const x of GATES_K.bac)set(x,KINH.y0,GA);
  // đại lộ lát đá: trục nam bắc từ cổng nam lớn lên cửa Đại Hưng; ngang thành từ tây sang cổng đông; đường cổng nam phụ, cổng đầu cầu
  fill(45,75,47,98,ST);fill(7,91,69,92,ST);fill(45,100,53,100,PA);fill(23,76,25,98,ST);fill(52,93,54,98,ST);fill(46,19,46,22,ST);
  // đường vòng quanh hào, ngõ phường
  fill(25,23,67,23,PA);fill(25,75,67,75,PA);fill(25,23,25,75,PA);fill(67,23,67,90,PA);
  fill(16,19,16,90,PA);for(const y of [33,47,61,76])fill(7,y,24,y,PA);
  fill(26,80,44,80,PA);fill(48,80,69,80,PA);fill(48,76,48,90,PA);fill(44,76,44,90,PA);fill(7,93,69,93,PA);
  // hào nước quanh Hoàng thành, cầu ở bốn cửa
  ring(HAO,WA);fill(HAO.x0+1,HAO.y0+1,HAO.x1-1,HAO.y1-1,G);
  fill(45,HAO.y1,47,HAO.y1,BR);fill(HAO.x0,48,HAO.x0,49,BR);fill(HAO.x1,48,HAO.x1,49,BR);fill(46,HAO.y0,46,HAO.y0,BR);
  fill(45,HOANG.y1+1,47,HOANG.y1+1,ST);fill(HAO.x0+1,48,HOANG.x0-1,49,ST);fill(HOANG.x1+1,48,HAO.x1-1,49,ST);fill(46,HAO.y0+1,46,HOANG.y0-1,ST);
  // Hoàng thành: tường, bốn cửa (đóng)
  ring(HOANG,WL);
  const gate=(x,y)=>{set(x,y,GA);CLOSED.add(x+','+y)};
  for(const x of [45,46,47])gate(x,HOANG.y1);gate(HOANG.x0,48);gate(HOANG.x0,49);gate(HOANG.x1,48);gate(HOANG.x1,49);gate(46,HOANG.y0);
  fill(38,59,54,71,ST);fill(29,48,36,49,ST);fill(56,48,63,49,ST);fill(46,27,46,29,ST);fill(29,27,63,27,ST);   // sân chầu, lối đi lát đá
  // Cấm thành: tường, cổng nam, cổng bắc (đóng), sân rồng Long Trì
  ring(CAM,WL);fill(CAM.x0+1,CAM.y0+1,CAM.x1-1,CAM.y1-1,ST);for(const x of [45,46,47])gate(x,CAM.y1);gate(46,CAM.y0);
  // vườn ngự uyển phía tây: hồ, thủy đình; cây hai bên
  fill(30,34,35,43,WA);trees([[29,33],[36,34],[29,45],[36,44],[31,46],[34,46]]);
  trees([[57,34],[63,34],[57,40],[63,40],[60,44],[57,46],[63,46],[30,56],[35,56],[58,57],[62,57],[31,66],[35,69],[58,66],[62,69]]);
  // ---- phía tây: chùa Diên Hựu, Văn Miếu, Quốc học viện, phường, chợ ----
  fill(8,20,13,25,WA);
  fill(17,23,24,26,ST);fill(17,31,24,32,ST);trees([[17,19],[24,19],[17,27],[24,27]]);
  fill(8,63,24,75,ST);
  // ---- phía nam: tháp, chùa Báo Thiên; sân Giảng võ ----
  fill(56,94,68,98,SA);trees([[27,86],[30,90],[40,86],[43,82],[42,89]]);
  for(const x of [10,20,30,40,50,60])if(get(x,90)===G)set(x,90,TR);

  // ---- nhà, công trình: Hoàng thành, Cấm thành ----
  B('dien','Điện Thiên An',40,31,13,4,'dien');
  B('langT','',38,37,2,19,'lang');B('langH','',53,37,2,19,'lang');
  B('quantrieu','Cung Quan Triều',29,28,6,3,'palace');B('thanhtu','Cung Thánh Từ',57,28,6,3,'palace');
  B('changiao','Chùa Chân Giáo',29,51,6,3,'pagoda');
  B('kho','Kho',58,51,4,2,'kho');B('kho2','',58,54,4,2,'kho');B('kho3','',29,62,4,2,'kho');B('kho4','',59,62,4,2,'kho');
  B('langW','',29,59,6,2,'lang');B('langE','',57,59,6,2,'lang');B('langW2','',29,68,6,2,'lang');B('langE2','',57,68,6,2,'lang');   // nhà lang vũ hai bên
  B('vuonD','',58,36,5,2,'lang');
  // ---- phía tây ----
  B('dienhuu','Chùa Diên Hựu',8,27,6,3,'pagoda');
  B('vanmieu','Văn Miếu',17,20,7,3,'dinh');
  B('hocvien','Quốc học viện',17,28,7,3,'school');
  // chợ: bốn hàng có người bán (NPC ở state.js) và các hàng khác
  B('sach','Hàng sách',9,64,3,2,'stall');B('ren','Lò rèn',14,64,3,2,'stall');B('vai','',19,64,3,2,'stall');
  B('nhaituan','Phường Nhai Tuân',9,69,3,2,'stall');B('gom','Hàng gốm',14,69,3,2,'stall');B('gao','',19,69,3,2,'stall');
  B('k_rau','',9,73,3,2,'stall');B('k_ca','',19,73,3,2,'stall');
  // ---- phía nam ----
  B('thap','Tháp Báo Thiên',36,78,2,2,'tower');B('baothien','Chùa Báo Thiên',32,83,6,3,'pagoda');
  B('giangvo','Giảng võ đường',58,86,6,3,'dinh');
  // phường: nhà phố mái ngói hai bên ngõ (Toàn thư năm 1230: chia 61 phường)
  let n=0;const pho=(x,y,w=4,h=3)=>{if(x<KINH.x0+1||x+w>KINH.x1)return;for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const t=get(xx,yy);if(t!==G)return}B('pho'+(n++),'',x,y,w,h,'pho')};
  for(const y of [35,39,43,49,53,57,77,81,85])for(const x of [7,11,17,21])pho(x,y);
  for(const x of [7,11,17])pho(x,94);
  for(const x of [27,31,35,39])pho(x,94);
  for(let x=27;x<=63;x+=4)if(x+3<45||x>47)pho(x,19);
  for(const [x,y] of [[49,77],[53,77],[57,77],[61,77],[65,77],[49,81],[53,81],[57,81],[61,81],[65,81],[49,85],[53,85],[26,76]])pho(x,y);
  pho(49,94,3,3);pho(26,81,4,2);
  // ---- trang trí ----
  D('motcot',10,22);                                  // gác một cột giữa hồ Diên Hựu
  for(const x of [18,20,22])D('bia',x,25);            // bia đá ở Văn Miếu
  D('co',46,48,1,{big:1});                            // cột cờ giữa sân rồng
  for(const x of [44,48])D('nghe',x,76);              // nghê đá hai bên đường lên cửa Đại Hưng
  for(const x of [43,49])D('nghe',x,70);              // nghê đá trước cửa Cấm thành
  for(const [x,y] of [[42,37],[50,37],[42,56],[50,56],[40,62],[52,62],[40,68],[52,68]])D('den',x,y);   // đèn đá ở Long Trì, sân chầu
  D('them',45,35,0);D('them',47,35,0);                // thềm rồng trước điện
  D('thuydinh',32,38);                                // thủy đình giữa hồ ngự uyển
  for(const [x,y] of [[57,95],[63,95]])D('gia',x,y);  // giá binh khí
  for(const x of [59,61,63,65])D('nom',x,97);         // hình nộm tập đâm
  D('well',13,62);D('well',20,46);D('well',29,89);D('well',51,90);D('banyan',41,89);D('well',8,90);
  for(const [x,y] of [[KINH.x0,KINH.y0],[KINH.x1,KINH.y0],[KINH.x0,KINH.y1],[KINH.x1,KINH.y1]])D('vong',x,y,0);   // vọng lâu bốn góc thành
  for(const [x,y] of [[HOANG.x0,HOANG.y0],[HOANG.x1,HOANG.y0],[HOANG.x0,HOANG.y1],[HOANG.x1,HOANG.y1]])D('vong',x,y,0,{red:1});
  CITY_DECOR.push({kind:'boat',x:18,y:7},{kind:'boat',x:30,y:10});   // thuyền đánh cá trên hồ Dâm Đàm
  // ---- biển ----
  SG(42,76,'Cửa Đại Hưng','Cửa Đại Hưng, cửa nam Hoàng thành. Toàn thư chép năm 1010 thành Thăng Long mở bốn cửa: đông Tường Phù, tây Quảng Phúc, nam Đại Hưng, bắc Diệu Đức.');
  SG(44,98,'Thành Đại La','Thành Đại La, vòng thành ngoài của kinh thành. Toàn thư chép năm 1230 mở rộng phía ngoài thành Đại La, bốn cửa thành giao quân Tứ sương thay nhau canh giữ, hai bên tả hữu kinh thành chia làm 61 phường.');
  SG(14,30,'Chùa Diên Hựu','Chùa Diên Hựu, có gác một cột giữa hồ. Toàn thư chép năm 1249 trùng tu chùa trên nền cũ.');
  SG(24,22,'Văn Miếu','Văn Miếu, thờ Khổng Tử, Chu Công. Toàn thư chép làm năm 1070, đời Lý Thánh Tông; Hoàng thái tử đến học ở đây.');
  SG(16,31,'Quốc học viện','Quốc học viện, nơi giảng Tứ thư, Lục kinh. Toàn thư chép lập năm 1253.');
  SG(65,89,'Giảng võ đường','Giảng võ đường, nơi luyện tập võ nghệ. Toàn thư chép lập năm 1253.');
  SG(39,79,'Tháp Báo Thiên','Tháp Báo Thiên, ngọn tháp cao nhất kinh thành.');
  SG(7,62,'Chợ kinh thành','Chợ trong kinh thành (hư cấu): hàng sách, lò rèn, hàng gốm, vải, gạo, rau, cá, hàng của người Tống ở phường Nhai Tuân.');
  SG(44,15,'Hồ Dâm Đàm','Hồ Dâm Đàm, tức Hồ Tây. Toàn thư chép đời Lý vua làm hành cung cạnh hồ để xem đánh cá, có lần ngự thuyền nhỏ ra hồ.');
}

/* ---------- người trong thành (chỉ để nhìn) ---------- */
const LOOKS=['dan_nam1','dan_nam2','dan_nu1','dan_nu2','dan_nu3','ong_gia','khach','trai2','trai3','dan1','tre1','tre2'];
const ROUTES=[   // vòng đi, theo các đường, ngõ (tọa độ ô)
  [[7.5,91.5],[69.5,91.5],[69.5,92.5],[7.5,92.5]],             // đại lộ ngang
  [[46.5,98],[46.5,75.6],[45.5,75.6],[45.5,98]],               // trục chính lên cửa Đại Hưng
  [[25.5,23.5],[67.5,23.5],[67.5,75.5],[25.5,75.5]],           // đường vòng quanh hào
  [[16.5,19.5],[16.5,90.5]],                                   // ngõ dọc phía tây
  [[7.5,33.5],[24.5,33.5],[24.5,47.5],[7.5,47.5]],             // ngõ phường tây bắc
  [[7.5,61.5],[24.5,61.5],[24.5,76.5],[7.5,76.5]],             // quanh chợ
  [[26,80.5],[44,80.5],[44,90],[26,90]],                       // quanh tháp Báo Thiên
  [[48.5,76.5],[48.5,90],[69,90],[69,80.5],[48.5,80.5]],       // phố phía đông nam
  [[24,98],[24,76.5]],[[53,98],[53,93.5]],                     // đường hai cổng nam phụ
  [[46.5,17.5],[46.5,16.5],[12.5,16.5],[46.5,16.5]],           // ra hồ Dâm Đàm
  [[9,66.5],[22,66.5],[22,71.5],[9,71.5]],                     // giữa các hàng trong chợ
];
const along=(pts,s)=>{const L=[];let tot=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],l=Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1]);L.push(l);tot+=l}
  let u=((s%tot)+tot)%tot;for(let i=0;i<pts.length;i++){if(u<=L[i]){const a=pts[i],b=pts[(i+1)%pts.length],f=L[i]?u/L[i]:0,dx=b[0]-a[0],dy=b[1]-a[1];
    return {x:a[0]+dx*f,y:a[1]+dy*f,dir:Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')}}u-=L[i]}return {x:pts[0][0],y:pts[0][1],dir:'down'}};
const STAND=[];   // người đứng yên: [x, y, hướng, hình, việc]
(function(){
  for(const [x,y] of [[44.3,77.3],[48.7,77.3],[25.3,48.2],[25.3,50.2],[67.7,48.2],[67.7,50.2],[45.3,21.4],[47.7,21.4]])STAND.push([x,y,'down','quan','gac']);   // gác cầu bốn cửa Hoàng thành
  for(const [x,y] of [[43.6,59.6],[49.4,59.6]])STAND.push([x,y,'down','quan','gac']);   // gác cổng Cấm thành (trong Hoàng thành)
  for(let y=61;y<=70;y+=1.8){STAND.push([42.3,y,'right','quan','gac']);STAND.push([50.7,y,'left','quan','gac'])}   // hai hàng lính ở sân chầu
  for(let y=38.5;y<=54;y+=1.45){STAND.push([43.4,y,'right','voquan','chau']);STAND.push([49.6,y,'left','hocquan','chau'])}   // hai ban văn võ đứng chầu ở Long Trì
  for(const [x,y] of [[20.4,66.4],[20.4,71.4],[10.4,75.4],[20.4,75.4]])STAND.push([x,y,'down',['dan_nu1','dan_nu3','dan_nu2','dan_nam2'][STAND.length%4],'ban']);   // hàng vải, gạo, rau, cá (bốn hàng kia có NPC ở state.js)
  for(const [x,y] of [[9.6,30.6],[12.4,31.3],[34.6,86.6],[37.4,87.2]])STAND.push([x,y,'down','su','su']);
  for(let i=0;i<8;i++)STAND.push([17.4+(i%4)*1.6,31.4+Math.floor(i/4)*.9,'up','ban_van','hoc']);              // học trò ở sân Quốc học viện
  for(let i=0;i<12;i++)STAND.push([58+(i%6)*1.8,95.4+Math.floor(i/6)*1.4,'up','quan','tap']);              // lính tập ở sân Giảng võ
  for(const [x,y] of [[11.5,48.4],[19.5,62.4],[33.5,81.4],[57.5,90.4]])STAND.push([x,y,'down','tre2','choi']);
  for(const [x,y] of [[20,15.6],[34,16.4]])STAND.push([x,y,'up','ong_gia','ngoi']);   // người ngồi câu bên hồ
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
