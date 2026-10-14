/* ================= map ================= */
import {BR,FI,G,GA,H,MO,PA,SA,ST,TR,W,WA,WL,WR} from './constants.js';
import {Hs} from './pixel.js';

export const map=new Uint8Array(W*H),bsolid=new Uint8Array(W*H);
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=rng(1258);
const set=(x,y,v)=>{if(x>=0&&y>=0&&x<W&&y<H)map[y*W+x]=v};
export const get=(x,y)=>(x<0||y<0||x>=W||y>=H)?MO:map[y*W+x];
const fill=(x0,y0,x1,y1,v)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)set(x,y,v)};
export const isW=t=>t===WA||t===WR;
export const tolichY=x=>24+2*Math.sin(x/7),hongX=y=>84+3*Math.sin(y/9);

export const BUILDINGS=[
 {id:'home',name:'Nhà mình',x:41,y:46,w:5,h:3,kind:'house'},
 {id:'batu',name:'Nhà bà Tư',x:48,y:46,w:4,h:3,kind:'house'},
 {id:'nha1',name:'',x:33,y:46,w:4,h:3,kind:'house'},
 {id:'nha2',name:'',x:34,y:50,w:4,h:2,kind:'house'},
 {id:'truong',name:'Trường làng',x:30,y:39,w:5,h:3,kind:'school'},
 {id:'dinh',name:'Đình làng',x:31,y:33,w:7,h:3,kind:'dinh'},
 {id:'vo',name:'Sân võ',x:51,y:35,w:3,h:2,kind:'shed'},
 {id:'chua',name:'Chùa làng',x:20,y:9,w:6,h:4,kind:'pagoda'},
 {id:'cung',name:'Hoàng thành',x:46,y:5,w:15,h:5,kind:'palace'},
 {id:'hocvien',name:'Quốc học viện',x:38,y:5,w:6,h:3,kind:'school'},
 {id:'giangvo',name:'Giảng võ đường',x:62,y:9,w:6,h:3,kind:'dinh'},
 {id:'thap',name:'Tháp Báo Thiên',x:67,y:5,w:2,h:2,kind:'tower'},
 {id:'sach',name:'Hàng sách',x:38,y:13,w:3,h:2,kind:'stall'},
 {id:'ren',name:'Lò rèn',x:43,y:13,w:3,h:2,kind:'stall'},
 {id:'nhaituan',name:'Phường Nhai Tuân',x:58,y:13,w:3,h:2,kind:'stall'},
 {id:'gom',name:'Hàng gốm',x:62,y:16,w:3,h:2,kind:'stall'},
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
  for(let i=0;i<260;i++)set(Math.floor(R()*W),Math.floor(R()*H),TR);
  for(let y=0;y<H;y++){const m=4+Math.round(2*Math.sin(y/5)+R()*2);for(let x=0;x<m;x++)set(x,y,MO)}
  for(let x=0;x<34;x++){const m=2+Math.round(R()*2);for(let y=0;y<m;y++)set(x,y,MO)}
  for(let y=28;y<H;y++)for(let x=5;x<24;x++)if(R()<0.62-(x-5)*0.014)set(x,y,TR);
  for(let y=4;y<18;y++)for(let x=14;x<31;x++)if(R()<0.4)set(x,y,TR);
  fill(19,7,27,16,G);fill(12,56,16,60,G);
  for(let x=6;x<84;x++){const c=tolichY(x);for(let y=18;y<31;y++){const d=Math.abs(y+.5-c);if(d<=1.4)set(x,y,WA);else if(d<=2.3&&get(x,y)!==WA)set(x,y,SA)}}
  for(let y=0;y<H;y++){const c=hongX(y);for(let x=74;x<W;x++){const d=Math.abs(x+.5-c);if(d<=2.6)set(x,y,WR);else if(d<=3.7&&get(x,y)!==WA)set(x,y,SA)}}
  fill(28,30,58,52,G);fill(48,20,58,21,G);fill(70,29,78,30,G);fill(71,9,82,12,G);
  fill(46,35,53,41,SA);fill(23,53,29,67,G);fill(16,57,23,59,G);
  for(let x=28;x<=60;x++)for(let y=Math.floor(tolichY(x)+2.4);y<30;y++)if(get(x,y)===TR)set(x,y,G);
  fill(36,3,70,19,ST);
  for(let x=36;x<=70;x++){set(x,3,WL);set(x,19,WL)}for(let y=3;y<=19;y++){set(36,y,WL);set(70,y,WL)}
  fill(52,19,54,19,GA);fill(70,11,70,12,GA);
  fill(30,53,58,66,FI);
  for(const y of[57,61,65])road(30,y,58,y);
  road(53,20,53,31);road(24,31,79,31);road(24,15,24,31);road(40,31,40,66);road(50,53,50,66);road(30,44,52,44);road(52,20,54,20);road(71,11,82,12);road(24,61,30,61);
  road(8,44,29,44);road(14,44,14,58);road(14,58,29,58);road(8,36,8,44);road(8,36,23,36);road(23,31,23,36);
  for(const b of BUILDINGS)for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)bsolid[y*W+x]=1;
  for(const d of DECOR)if(d.solid)bsolid[d.y*W+d.x]=1;
  for(const s of SIGNS)bsolid[s.y*W+s.x]=1;
}
buildMap();
export const TREES=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(map[y*W+x]===TR){
  // loại cây: rừng phía tây chủ yếu cây tán, lẫn tre; quanh làng, ven sông có tre, cau, chuối
  const h=Hs(x,y,5),forest=x<26&&y>26;TREES.push({x,y,v:forest?(h<.8?0:1):h<.4?0:h<.68?1:h<.84?2:3})}
