/* ================= map ================= */
import {BI,BR,DK,FI,G,GA,H,H0,MO,OY,PA,SA,ST,TR,W,W0,WA,WL,WR} from './constants.js';
import {buildCity,CITY_BUILD,CITY_DECOR,CITY_SIGNS,CLOSED} from './kinhthanh.js';
import {Hs} from './pixel.js';
import {CAMP,THUY,WBUILD,WDECOR,WSIGNS,buildWorld,hongX} from './world.js';
export {CAMP,THUY,hongX};

export const map=new Uint8Array(W*H),bsolid=new Uint8Array(W*H);
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=rng(1258);
/* OFF: lúc sinh phần bản đồ gốc thì ghi theo tọa độ gốc (cộng OY), xong thì về 0 (tọa độ thế giới) */
let OFF=0;
const set=(x,y,v)=>{y+=OFF;if(x>=0&&y>=0&&x<W&&y<H)map[y*W+x]=v};
export const get=(x,y)=>{y+=OFF;return(x<0||y<0||x>=W||y>=H)?MO:map[y*W+x]};
const fill=(x0,y0,x1,y1,v)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)set(x,y,v)};
export const isW=t=>t===WA||t===WR||t===BI;
/* cống qua đê: ô cầu (BR) nằm trên đê, chỗ sông Tô Lịch chảy ra sông Hồng */
export const CULVERT=new Set();
const tl=x=>24+2*Math.sin(x/7);   // tâm sông Tô Lịch, tọa độ gốc
export const tolichY=x=>OY+tl(x);   // tọa độ thế giới; hongX (sông Hồng) ở world.js
const hxo=y=>hongX(y+OY);   // sông Hồng theo tọa độ gốc

export const BUILDINGS=[
 {id:'home',name:'Nhà mình',x:41,y:46,w:5,h:3,kind:'house'},
 {id:'batu',name:'Nhà bà Tư',x:48,y:46,w:4,h:3,kind:'house'},
 {id:'nha1',name:'',x:33,y:46,w:4,h:3,kind:'house'},
 {id:'nha2',name:'',x:34,y:50,w:4,h:2,kind:'house'},
 {id:'truong',name:'Trường làng',x:30,y:39,w:5,h:3,kind:'school'},
 {id:'dinh',name:'Đình làng',x:31,y:33,w:7,h:3,kind:'dinh'},
 {id:'vo',name:'Sân võ',x:51,y:35,w:3,h:2,kind:'shed'},
 {id:'chua',name:'Chùa làng',x:11,y:38,w:6,h:4,kind:'pagoda'},   // từ 10/2026 dời vào rừng phía tây làng (chỗ cũ nay trong kinh thành)
];
export const DECOR=[{kind:'banyan',x:37,y:42,solid:1},{kind:'well',x:44,y:42,solid:1},{kind:'boat',x:85,y:9},{kind:'boat',x:86,y:14},{kind:'boat',x:82,y:40}];
export const SIGNS=[
 {x:41,y:30,name:'Làng An Phú',text:'Làng An Phú, ven sông Tô Lịch. Phía bắc là kinh thành Thăng Long.'},
 {x:81,y:10,name:'Bến Đông Bộ Đầu',text:'Bến Đông Bộ Đầu bên sông Hồng. Đầu năm 1258, vua Trần Thái Tông và Thái tử ngự lâu thuyền đến đây đón đánh, phá tan quân giặc.'},
 {x:77,y:30,name:'Đường đi Phù Ủng',text:'Đường men theo sông Hồng xuống phía đông nam là làng Phù Ủng, huyện Đường Hào.'},
];

export function road(x0,y0,x1,y1){for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++)for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++){const t=get(x,y);if(isW(t))set(x,y,BR);else if(t!==ST&&t!==GA&&t!==BR&&t!==WL)set(x,y,PA)}}
function buildMap(){
  map.fill(G);
  OFF=OY;   // phần bản đồ gốc: tọa độ gốc
  for(let i=0;i<260;i++)set(Math.floor(R()*W0),Math.floor(R()*H0),TR);   // W0: giữ nguyên chuỗi RNG nên phần bản đồ gốc không đổi
  for(let y=0;y<H0;y++){const m=4+Math.round(2*Math.sin(y/5)+R()*2);for(let x=0;x<m;x++)set(x,y,MO)}
  for(let x=0;x<34;x++){const m=2+Math.round(R()*2);for(let y=0;y<m;y++)set(x,y,MO)}
  for(let y=28;y<H0;y++)for(let x=5;x<24;x++)if(R()<0.62-(x-5)*0.014)set(x,y,TR);
  for(let y=4;y<18;y++)for(let x=14;x<31;x++)if(R()<0.4)set(x,y,TR);
  fill(12,56,16,60,G);
  for(let x=6;x<84;x++){const c=tl(x);for(let y=18;y<31;y++){const d=Math.abs(y+.5-c);if(d<=1.4)set(x,y,WA);else if(d<=2.3&&get(x,y)!==WA)set(x,y,SA)}}
  for(let y=0;y<H0;y++){const c=hxo(y);for(let x=74;x<W0;x++){const d=Math.abs(x+.5-c);if(d<=2.6)set(x,y,WR);else if(d<=3.7&&get(x,y)!==WA)set(x,y,SA)}}
  // đê sông Hồng: dải đất đắp chạy dọc bờ tây, cách mép bãi một ô; chỗ sông Tô Lịch chảy qua là cống (đi lại như cầu)
  let px=null;
  for(let y=0;y<H0;y++){const x=Math.ceil(hxo(y)-5.2);
    for(let xx=(px===null?x:Math.min(px,x))-1;xx<=(px===null?x:Math.max(px,x));xx++){const t=get(xx,y);   // đê rộng 2 ô
      if(t===WA){set(xx,y,BR);CULVERT.add((y+OY)*W+xx)}else if(t===G||t===TR||t===SA||t===PA)set(xx,y,DK)}
    px=x}
  fill(28,30,58,52,G);fill(48,20,58,21,G);fill(70,29,78,30,G);fill(71,9,82,12,G);
  fill(46,35,53,41,SA);fill(23,53,29,67,G);fill(16,57,23,59,G);
  for(let x=28;x<=60;x++)for(let y=Math.floor(tl(x)+2.4);y<30;y++)if(get(x,y)===TR)set(x,y,G);
  fill(9,37,18,43,G);   // khoảng trống trong rừng cho chùa làng
  fill(30,53,58,66,FI);
  for(const y of[57,61,65])road(30,y,58,y);
  road(53,20,53,31);road(24,31,79,31);road(24,20,24,31);road(40,31,40,66);road(50,53,50,66);road(30,44,52,44);road(52,20,54,20);road(71,11,82,12);road(24,61,30,61);
  road(8,44,29,44);road(14,44,14,58);road(14,58,29,58);road(8,36,8,44);road(8,36,23,36);road(23,31,23,36);road(14,42,14,44);
  OFF=0;   // từ đây: tọa độ thế giới
  buildWorld({map,bsolid,road});   // phần còn lại của bản đồ thế giới (world.js)
  // đê sông Hồng nối lên các hàng mới phía bắc
  px=null;
  for(let y=OY-1;y>=0;y--){const x=Math.ceil(hongX(y)-5.2);
    for(let xx=(px===null?x:Math.min(px,x))-1;xx<=(px===null?x:Math.max(px,x));xx++){const t=get(xx,y);if(t===G||t===TR||t===SA||t===PA||t===FI)set(xx,y,DK)}
    px=x}
  buildCity({set,get,fill,road});   // kinh thành Thăng Long (kinhthanh.js)
  BUILDINGS.push(...CITY_BUILD,...WBUILD);DECOR.push(...CITY_DECOR,...WDECOR);SIGNS.push(...CITY_SIGNS,...WSIGNS);
  for(const b of BUILDINGS)for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)bsolid[y*W+x]=1;
  for(const d of DECOR)if(d.solid)bsolid[d.y*W+d.x]=1;
  for(const s of SIGNS)bsolid[s.y*W+s.x]=1;
  for(const k of CLOSED){const [x,y]=k.split(',').map(Number);bsolid[y*W+x]=1}   // cổng Hoàng thành, Cấm thành đóng
}
for(const o of [...BUILDINGS,...DECOR,...SIGNS])o.y+=OY;   // danh sách trên ghi theo tọa độ gốc
buildMap();
export const TREES=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(map[y*W+x]===TR){
  // loại cây: rừng phía tây chủ yếu cây tán, lẫn tre; quanh làng, ven sông có tre, cau, chuối
  const h=Hs(x,y,5),forest=x<26&&y>26+OY;
  // ven sông Bạch Đằng, bờ biển: rừng sú vẹt (4)
  if(x>=392&&[[1,0],[-1,0],[0,1],[0,-1],[2,0],[-2,0],[0,2],[0,-2]].some(([a,b])=>{const t=get(x+a,y+b);return t===WA||t===BI||t===SA}))TREES.push({x,y,v:4});
  else TREES.push({x,y,v:forest?(h<.8?0:1):h<.4?0:h<.68?1:h<.84?2:3})}
