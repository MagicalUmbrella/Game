/* ================= doanh trại quân Nguyên ở Gia Lâm (bố cục, va chạm, hình vẽ) ================= */
/* Hư cấu dựa trên Toàn thư: tháng giêng năm 1285 Ô Mã Nhi đánh vào Gia Lâm, Vũ Ninh, Đông Ngàn rồi đến Đông Bộ Đầu.
   Bố cục trại, thủy trại, đồ vật trong trại là hư cấu. Trại dựng lên từ đêm 12 tháng giêng 1285 (campUp): trước đó bờ
   đông là bãi trống. Cảnh bị giải đi, cảnh trong trại (src/camp.js) dùng bố cục này; chương hai có thể dùng lại
   (trốn trại, đốt kho lương, cứu người ở các chuồng tù).
   Tọa độ là ô bản đồ thế giới (src/world.js: CAMP, THUY). */
import {T,TS,Z,ctx} from './constants.js';
import {CAMP,THUY,hongEW,hongX} from './world.js';
import {simple} from './sprites.js';
import {propSprite} from './scenery.js';
import {Hs,flip} from './pixel.js';
import {MG,S} from './state.js';
import {VH,VW,camX,camY,clock,drawSprite,reduce,shadow} from './render.js';
import {tongue} from './climax.js';
import {sackSprite} from './minigames/flood.js';
export {CAMP,THUY};

/* ---------- bố cục ---------- */
export const GATES={w:[11,12,13],e:[19,20,21],s:[152,153,154]};      // cổng tây (x=CAMP.x0), cổng đông (x=CAMP.x1), cổng nam (y=CAMP.y1)
export const CMD={x:147,y:7,w:5,h:3};                                // trướng Ô Mã Nhi
export const OMN_AT=[150.9,11.4],KC_AT=[148.4,11.5];                 // chỗ Ô Mã Nhi đứng, chỗ sứ giả đứng trước trướng
export const GENS=[{x:140,y:7,w:3,h:2,name:'Lều tướng'},{x:154,y:7,w:3,h:2,name:'Lều tướng'}];
/* chuồng tù: rào quanh (x0-1..x1+1, y0-1..y1+1), cửa ở hàng trên (door) */
export const PENS=[{x0:146,y0:15,x1:150,y1:17,door:148,main:true},{x0:138,y0:15,x1:142,y1:17,door:140},{x0:138,y0:23,x1:142,y1:25,door:140}];
export const PEN=PENS[0];
export const PEN_DOOR=[148.5,13.4],PEN_IN=[148.5,16.2];
export const TORTURE={x:146,y:22};                                   // chỗ tra hỏi: cột trói, lò than, bàn
export const HORSE={x0:159,y0:6,x1:166,y1:10,gate:162};              // bãi ngựa (trong rào), cổng ở hàng dưới
export const FORGE={x:131,y:25,w:5,h:3};                             // lò rèn (lán), đe, giá binh khí
export const ANVIL=[137.5,27.6],RACKS=[{x:131,y:29},{x:133,y:29}];
export const GRAN={x:147,y:26,w:6,h:3};                              // kho lương
export const SACKS=[];for(let y=31;y<=33;y++)for(let x=145;x<=151;x++)if((x+y)%3!==0)SACKS.push([x+.5,y+.6]);
export const CARTS=[{x:156,y:27},{x:154,y:33}];
export const TOWERS=[{x:129,y:5},{x:168,y:5},{x:129,y:35},{x:168,y:35},{x:129,y:8},{x:129,y:14},{x:168,y:16},{x:168,y:22},{x:149,y:35},{x:156,y:35}];
export const TENTS=[{x:132,y:6},{x:136,y:6},{x:156,y:14},{x:160,y:14},{x:164,y:14},{x:157,y:23},{x:161,y:23},{x:165,y:23},{x:157,y:32},{x:161,y:32},{x:165,y:32},
  {x:131,y:33},{x:135,y:33},{x:139,y:33},{x:132,y:17}];
export const FIRES=[[134.5,10.4],[158.5,18.6],[162.5,27.8],[138.5,30.6],[151.5,19.4],[144.5,9.4],[164.5,19.4]];
export const FLAGS=[[146.6,10.2],[152.4,10.2],[128.5,10.4],[128.5,14.6],[170.5,18.4],[170.5,22.6]];
export const BIGFLAG=[80.4,13.6];                                    // cờ lớn ở bến Đông Bộ Đầu (Toàn thư), chỉ cắm từ đêm 12
export const TROUGH={x:160,y:10};
export const HAY=[[165,7],[165,9]];
export const POT=[162.5,29.2];
/* thủy trại: cầu tàu (ô BR do world.js đặt ở y 8 và 16), thuyền chiến neo hai bên, hàng cọc phía bộ */
export const JETTY_Y=[8,16];
export const SHIPS=[[94.6,7.15],[94.4,9.9],[94.6,15.15],[94.2,17.9]];
export const T_TENTS=[{x:103,y:5},{x:103,y:17}];
export const T_SACKS=[[104.5,9.6],[105.5,9.6],[104.5,10.4],[105.3,14.6],[106.2,14.6]];
export const T_FIRES=[[102.5,13.9]];
export const T_FLAGS=[[101.4,9.6],[101.4,14.8]];
export const T_STAKE_X=THUY.x1+1;                                   // hàng cọc phía bộ, chừa lối ở y 11–13

/* Trại có dựng chưa: từ đêm 12 tháng giêng 1285 (đã qua đêm giặc đến làng, hoặc đang bị giải đi). */
export const campUp=()=>!!(MG&&(MG.type==='escort'||MG.type==='camp'))||!!(S&&S.res);

const inR=(x,y,r)=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h;
export const inRect=(x,y,r)=>x>=r.x0&&x<=r.x1&&y>=r.y0&&y<=r.y1;
export const isStake=(x,y)=>(((x===CAMP.x0&&!GATES.w.includes(y))||(x===CAMP.x1&&!GATES.e.includes(y)))&&y>=CAMP.y0&&y<=CAMP.y1)||
  (y===CAMP.y0&&x>=CAMP.x0&&x<=CAMP.x1)||(y===CAMP.y1&&x>=CAMP.x0&&x<=CAMP.x1&&!GATES.s.includes(x))||
  (x===T_STAKE_X&&y>=THUY.y0&&y<=THUY.y1&&!(y>=11&&y<=13));
const ring=(x,y,p)=>((x===p.x0-1||x===p.x1+1)&&y>=p.y0-1&&y<=p.y1+1)||((y===p.y0-1||y===p.y1+1)&&x>=p.x0-1&&x<=p.x1+1);
/* rào chuồng tù; openDoor: cửa chuồng chính đang mở (lúc áp giải vào, lính ra vào) */
export function penFence(x,y,openDoor){for(const p of PENS)if(ring(x,y,p)){if(openDoor&&p.main&&y===p.y0-1&&x===p.door)return false;return true}return false}
export const horseFence=(x,y)=>ring(x,y,HORSE)&&!(y===HORSE.y1+1&&x===HORSE.gate);
const towerAt=(x,y)=>TOWERS.some(t=>x>=t.x&&x<t.x+2&&y>=t.y&&y<t.y+2);
const tentAt=(x,y)=>TENTS.some(t=>x>=t.x&&x<t.x+3&&y>=t.y&&y<t.y+2)||T_TENTS.some(t=>x>=t.x&&x<t.x+3&&y>=t.y&&y<t.y+2)||GENS.some(g=>inR(x,y,g))||inR(x,y,CMD);
const thingAt=(x,y)=>inR(x,y,FORGE)||inR(x,y,GRAN)||CARTS.some(c=>x>=c.x&&x<c.x+2&&y===c.y)||RACKS.some(r=>x>=r.x&&x<r.x+2&&y===r.y)||
  (x===Math.floor(ANVIL[0])&&y===Math.floor(ANVIL[1]))||(x>=TORTURE.x&&x<TORTURE.x+4&&y===TORTURE.y+1)||(x>=TROUGH.x&&x<TROUGH.x+2&&y===TROUGH.y)||
  SACKS.some(([a,b])=>Math.floor(a)===x&&Math.floor(b)===y)||T_SACKS.some(([a,b])=>Math.floor(a)===x&&Math.floor(b)===y)||(x===Math.floor(POT[0])&&y===Math.floor(POT[1]));
/* Ô bị chặn khi trại đã dựng (không tính rào chuồng tù, rào bãi ngựa: xem penFence, horseFence). */
export function campSolid(x,y){if(!campUp())return false;if(x<THUY.x0-1||x>CAMP.x1||y<CAMP.y0||y>CAMP.y1)return false;
  return isStake(x,y)||towerAt(x,y)||tentAt(x,y)||thingAt(x,y)||penFence(x,y,MG&&MG.type==='escort')||horseFence(x,y)}
/* bụi cỏ, đá trong khu trại, thủy trại: đã bị giẫm phẳng */
export const hideProp=p=>campUp()&&((p.x>=CAMP.x0&&p.x<=CAMP.x1&&p.y>=CAMP.y0&&p.y<=CAMP.y1)||(p.x>=THUY.x0&&p.x<=THUY.x1+1&&p.y>=THUY.y0&&p.y<=THUY.y1));

/* ---------- hình vẽ ---------- */
const stakeSprite=()=>simple('stake',16,26,s=>{for(const x of[1,6,11]){s(x,4,4,22,'#6e4a2a');s(x+1,2,2,2,'#8a6238');s(x+3,4,1,22,'#4a311b')}s(0,12,16,2,'#4a311b');s(0,20,16,2,'#4a311b')},8,24);
const tentSprite=()=>simple('tent',50,36,s=>{s(4,14,42,20,'#cfc3a6');s(4,14,42,2,'#e6dcc2');s(9,8,32,7,'#d9ceb2');s(15,4,20,5,'#e6dcc2');s(22,1,6,4,'#b8a888');
  for(const x of[8,16,24,32,40])s(x,15,1,19,'#a8987a');s(4,22,42,1,'#8a6a3a');s(21,22,8,12,'#3a2e22');s(24,22,2,12,'#5a4636');s(4,32,42,2,'#8a7a5c')},25,34);
/* lều tướng: nỉ sẫm viền đỏ, đỉnh có ngù */
const genSprite=()=>simple('gentent',50,40,s=>{s(4,16,42,22,'#7a6a52');s(4,16,42,3,'#9a8a6a');s(9,10,32,7,'#8a7a5e');s(15,5,20,6,'#9a8a6a');s(23,1,4,5,'#a83a32');
  s(4,24,42,2,'#a83a32');for(const x of[8,18,30,40])s(x,17,1,21,'#5e5040');s(20,24,10,14,'#2a2018');s(24,24,2,14,'#4a3a2a');s(4,36,42,2,'#4a3a2a')},25,38);
const cmdSprite=()=>simple('cmdtent',86,56,s=>{s(4,22,78,32,'#5a3a2a');s(4,22,78,3,'#7a5238');s(12,12,62,11,'#6a442e');s(22,5,42,8,'#7a5238');s(36,1,14,5,'#d9b25a');
  for(let x=8;x<80;x+=10)s(x,24,2,30,'#d9b25a');s(4,36,78,2,'#d9b25a');s(36,34,14,20,'#1e140e');s(40,34,6,20,'#3a2618');s(4,52,78,2,'#3a2618')},43,54);
const fenceSprite=()=>simple('fence',16,14,s=>{s(1,2,3,12,'#7a5a36');s(12,2,3,12,'#7a5a36');s(0,4,16,2,'#8a6a42');s(0,9,16,2,'#8a6a42')},8,13);
const logSprite=()=>simple('logs',18,8,s=>{s(1,3,16,3,'#5a3a22');s(3,1,12,3,'#6e4a2a');s(2,5,14,2,'#3a2618')},9,7);
/* chòi canh: bốn cột, sàn cao, mái lá, thang */
const towerSprite=()=>simple('choi',34,62,s=>{for(const x of[3,28])s(x,18,3,44,'#5a3a22');for(const x of[11,20])s(x,22,2,40,'#6e4a2a');
  s(1,24,32,4,'#8a6238');s(1,24,32,1,'#a8784a');s(1,27,32,1,'#4a311b');for(let y=32;y<60;y+=7){s(3,y,28,1,'#4a311b')}
  s(3,16,28,8,'#7a5a36');s(3,16,28,1,'#9a7444');for(let x=5;x<30;x+=4)s(x,17,1,7,'#5a3f25');
  s(0,6,34,6,'#b8a060');s(2,3,30,4,'#cdb672');s(6,1,22,3,'#ddc884');s(0,11,34,1,'#8a7440');for(let x=1;x<34;x+=3)s(x,12,1,2,'#a88c50');
  for(let y=30;y<62;y+=4)s(14,y,6,1,'#7a5a36');s(14,30,1,32,'#5a3f25');s(19,30,1,32,'#5a3f25')},17,61);
/* ngựa nhìn nghiêng (trái), khung 1 cúi đầu gặm cỏ */
function horseSprite(col,fr){const key='ngua'+col+fr;return simple(key,30,24,s=>{const [b,d,m]=col===0?['#7a4a28','#5a3418','#2a1a10']:col===1?['#3a3230','#26201e','#141010']:['#c8b8a0','#a89880','#6a5a48'];
  s(7,8,17,8,b);s(8,7,14,1,b);s(9,14,14,2,d);s(22,9,3,6,b);for(const x of[8,11,19,22])s(x,15,2,7,d);for(const x of[8,11,19,22])s(x,21,2,2,'#1a1410');
  s(24,10,2,7,m);s(25,15,2,4,m);   // đuôi
  if(fr===0){s(3,2,5,8,b);s(1,3,4,4,b);s(0,5,3,3,d);s(5,1,1,2,d);s(6,0,1,2,d);s(6,2,3,7,m);s(2,4,1,1,'#0a0a0a')}
  else{s(3,8,5,6,b);s(1,13,4,4,b);s(0,15,3,3,d);s(6,7,3,6,m);s(2,14,1,1,'#0a0a0a')}
  s(10,8,7,2,'#8a2a22');s(12,10,3,5,'#6a5030')},15,22)}
/* thuyền chiến của giặc: thân cao, mũi lái vểnh, buồm phên, cờ */
const shipSprite=()=>simple('chien',72,46,s=>{s(4,30,64,9,'#5a3a22');s(0,26,8,8,'#5a3a22');s(64,24,8,10,'#5a3a22');s(6,38,60,3,'#3a2414');s(4,30,64,2,'#7a5232');
  for(let x=8;x<66;x+=8)s(x,32,4,3,'#2a1a10');   // lỗ mái chèo
  s(14,22,40,8,'#6a4a2a');s(14,22,40,1,'#8a6238');s(20,18,24,5,'#5a3a22');
  s(34,0,2,26,'#3a2414');s(22,3,26,16,'#b89a62');for(let y=5;y<19;y+=3)s(22,y,26,1,'#8a7040');for(let x=26;x<48;x+=6)s(x,3,1,16,'#8a7040');
  s(36,0,10,5,'#a83a32');s(46,1,4,3,'#a83a32');s(2,22,3,6,'#3a2414')},36,40);
const jettyPost=()=>simple('coc',5,9,s=>{s(1,0,3,9,'#4a311b');s(1,0,3,2,'#6e4a2a')},2,7);
/* lò rèn: lán mái tranh, lò than đỏ, ống bễ */
const forgeSprite=()=>simple('lorendg',82,56,s=>{for(const x of[4,40,76])s(x,18,3,36,'#5a3a22');s(0,8,82,12,'#a88c50');s(4,4,74,6,'#bba062');s(10,1,62,4,'#cdb672');s(0,19,82,2,'#7a6a3a');
  s(8,32,22,22,'#6a625a');s(8,32,22,3,'#8a827a');s(12,38,14,10,'#2a1a14');s(14,40,10,6,'#c84a1a');s(16,41,6,3,'#f0a030');s(17,24,4,10,'#5a524a');   // lò, ống khói
  s(34,40,14,8,'#7a5a36');s(34,44,14,1,'#4a311b');s(46,38,4,4,'#4a311b');   // ống bễ
  s(54,26,20,2,'#5a3a22');for(const x of[56,62,68])s(x,28,2,10,'#8a8a8a')},41,54);
const anvilSprite=()=>simple('de',18,14,s=>{s(1,2,16,4,'#5a5a5e');s(1,2,16,1,'#8a8a90');s(0,3,3,2,'#5a5a5e');s(6,6,6,4,'#4a4a4e');s(4,10,10,3,'#5a3a22')},9,13);
const rackSprite=()=>simple('giagiao',32,30,s=>{s(1,10,30,3,'#6e4a2a');s(1,22,30,3,'#6e4a2a');s(2,8,3,22,'#5a3a22');s(27,8,3,22,'#5a3a22');
  for(let x=6;x<27;x+=5){s(x,0,1,28,'#7a5a36');s(x-1,0,3,4,'#b8b8c0')}},16,29);
/* kho lương: nhà kho cột cao, mái ngói thô, bao thóc chất cửa */
const granSprite=()=>simple('kholuong',98,62,s=>{s(4,22,90,36,'#7a5a36');for(let x=6;x<92;x+=6)s(x,24,1,34,'#5a3f25');s(4,22,90,2,'#9a7444');
  s(0,8,98,16,'#6a4a3a');s(4,2,90,8,'#7a5a48');s(10,0,78,4,'#8a6a58');for(let x=2;x<96;x+=4)s(x,9,2,14,'#5a3a2a');s(0,23,98,2,'#3a2418');
  s(38,34,22,24,'#2a1a10');s(40,36,18,22,'#3a2618');s(4,56,90,2,'#3a2418');
  for(const [x,y] of [[8,46],[18,46],[13,40],[66,46],[76,46],[71,40],[84,48]]){s(x,y,10,10,'#d8c08a');s(x,y,10,2,'#e8d4a2');s(x+4,y,2,2,'#8a6a3a')}},49,58);
const cartSprite=()=>simple('xe',34,24,s=>{s(2,6,28,8,'#7a5a36');s(2,6,28,2,'#9a7444');s(30,9,4,2,'#5a3a22');for(const [x,y] of [[4,2],[12,0],[20,2]]){s(x,y,8,6,'#d8c08a');s(x,y,8,1,'#e8d4a2')}
  for(const cx of[8,24]){s(cx-5,13,10,10,'#4a311b');s(cx-3,15,6,6,'#7a5a36');s(cx-1,17,2,2,'#4a311b')}},17,22);
const troughSprite=()=>simple('mang',34,12,s=>{s(1,2,32,8,'#6e4a2a');s(3,3,28,4,'#4a7a8a');s(3,3,28,1,'#7aaabb');s(1,9,32,2,'#4a311b')},17,11);
/* chỗ tra hỏi: cột trói, lò than, bàn gỗ */
const postSprite=()=>simple('cot',14,42,s=>{s(5,0,4,42,'#5a3a22');s(5,0,4,2,'#7a5232');s(3,12,8,2,'#8a6a3a');s(3,20,8,2,'#8a6a3a');s(4,13,1,9,'#8a6a3a')},7,40);
const brazierSprite=()=>simple('lothan',16,16,s=>{s(2,4,12,6,'#3a3a3e');s(2,4,12,1,'#5a5a60');s(4,10,2,6,'#2a2a2e');s(10,10,2,6,'#2a2a2e');s(4,3,8,2,'#c84a1a')},8,15);
const tableSprite=()=>simple('ban',30,16,s=>{s(1,2,28,4,'#7a5a36');s(1,2,28,1,'#9a7444');s(3,6,2,9,'#5a3a22');s(25,6,2,9,'#5a3a22');s(8,0,6,2,'#d8d0b8');s(18,0,3,2,'#3a3a3e')},15,15);
const potSprite=()=>simple('noi',24,18,s=>{s(2,4,20,10,'#3a3a3e');s(2,4,20,2,'#6a6a70');s(4,1,16,3,'#8a8a90');s(5,2,14,1,'#c8b890')},12,16);

export function flagFx(x,y,big){const px=Math.round(x*TS),py=Math.round(y*TS),hgt=big?56:44,w=big?26:20;ctx.fillStyle='#4a311b';ctx.fillRect(px*Z-camX,(py-hgt)*Z-camY,2*Z,hgt*Z);
  for(let i=0;i<w;i++){const wv=reduce?0:Math.round(Math.sin(clock*4-i*.35)*2*(i/w)),h=big?14:11;ctx.fillStyle=i%6<3?'#1c2a4a':'#22325a';ctx.fillRect((px+2+i)*Z-camX,(py-hgt+1+wv)*Z-camY,Z,h*Z);
    if(i%7===3){ctx.fillStyle='#d9b25a';ctx.fillRect((px+2+i)*Z-camX,(py-hgt+5+wv)*Z-camY,Z,3*Z)}}}
export function campfire(x,y,seed){drawSprite(logSprite(),x,y+.15);const px=Math.round(x*TS),py=Math.round(y*TS);tongue(px-3,py,11,7,seed);tongue(px+3,py,9,6,seed+2);tongue(px,py-1,14,8,seed+4)}
/* nền đất bị giẫm nát trong rào (chỉ vẽ phần thấy trên màn hình) */
function trampled(x0,y0,x1,y1){ctx.globalAlpha=.5;
  for(let y=Math.max(CAMP.y0+1,y0);y<Math.min(CAMP.y1,y1+1);y++)for(let x=Math.max(CAMP.x0+1,x0);x<Math.min(CAMP.x1,x1+1);x++){const h=Hs(x,y,61);
    ctx.fillStyle=h<.55?'#6a5638':h<.8?'#5a4a30':'#7a6a48';ctx.fillRect(x*T-camX,y*T-camY,T,T);if(h>.9){ctx.fillStyle='#4a3a26';ctx.fillRect(x*T-camX+Z*4,y*T-camY+Z*6,Z*6,Z*2)}}
  ctx.globalAlpha=1}

/* ngựa trong bãi: đi lững thững, cúi gặm cỏ (vị trí tính theo đồng hồ, không cần lưu) */
const HORSES=[[160.5,7.4,0],[162.8,8.6,1],[164.6,7.2,2],[161.6,10.2,0],[165.4,9.8,1]];
function horseAt(i){const [hx,hy,c]=HORSES[i],t=clock*.25+i*1.7,dx=Math.sin(t)*1.1,dy=Math.sin(t*.6+i)*.4;return {x:Math.max(HORSE.x0+.6,Math.min(HORSE.x1+.4,hx+dx)),y:Math.max(HORSE.y0+.7,Math.min(HORSE.y1+.6,hy+dy)),c,dir:Math.cos(t)>0?'right':'left',graze:Math.sin(t*1.3+i)>.2}}

/* Thêm doanh trại vào danh sách vẽ (chỉ phần thấy trên màn hình). */
export function drawCamp(list){const x0=Math.floor(camX/T)-1,y0=Math.floor(camY/T)-1,x1=Math.ceil((camX+VW)/T)+1,y1=Math.ceil((camY+VH)/T)+1,vis=(x,y,m=3)=>x>=x0-m&&x<=x1+m&&y>=y0-m&&y<=y1+m+2;
  if(x1<THUY.x0-6||x0>CAMP.x1+3||y0>CAMP.y1+3)return;
  list.push({y:-1e3,f:()=>trampled(x0,y0,x1,y1)});
  for(let y=Math.max(CAMP.y0,y0-1);y<=Math.min(CAMP.y1,y1+2);y++)for(let x=Math.max(THUY.x0,x0-1);x<=Math.min(CAMP.x1,x1+1);x++)if(isStake(x,y))list.push({y:y+1,f:()=>drawSprite(stakeSprite(),x+.5,y+1)});
  const openMain=MG&&MG.type==='escort';
  for(const p of [...PENS,HORSE])for(let y=p.y0-1;y<=p.y1+1;y++)for(let x=p.x0-1;x<=p.x1+1;x++){if(!vis(x,y))continue;
    const f=p===HORSE?horseFence(x,y):penFence(x,y,openMain);if(f)list.push({y:y+.9,f:()=>drawSprite(fenceSprite(),x+.5,y+.95)})}
  for(const t of [...TENTS,...T_TENTS])if(vis(t.x+1,t.y))list.push({y:t.y+2,f:()=>drawSprite(tentSprite(),t.x+1.5,t.y+2.05)});
  for(const g of GENS)if(vis(g.x+1,g.y))list.push({y:g.y+g.h,f:()=>{drawSprite(genSprite(),g.x+1.5,g.y+2.05);flagFx(g.x+2.6,g.y+1.6,false)},lab:Math.hypot(g.x+1.5-S.x,g.y+2-S.y)<5?[g.name,g.x+1.5,g.y-.9]:null});
  if(vis(CMD.x+2,CMD.y))list.push({y:CMD.y+CMD.h,f:()=>drawSprite(cmdSprite(),CMD.x+CMD.w/2,CMD.y+CMD.h+.05),lab:Math.hypot(OMN_AT[0]-S.x,OMN_AT[1]-S.y)<12?['Trướng Ô Mã Nhi',CMD.x+CMD.w/2,CMD.y-.9]:null});
  for(const t of TOWERS)if(vis(t.x,t.y))list.push({y:t.y+2,f:()=>drawSprite(towerSprite(),t.x+1,t.y+2)});
  for(const f of [...FLAGS,...T_FLAGS])if(vis(f[0],f[1]))list.push({y:f[1],f:()=>flagFx(f[0],f[1],false)});
  [...FIRES,...T_FIRES].forEach((f,i)=>{if(vis(f[0],f[1]))list.push({y:f[1],f:()=>campfire(f[0],f[1],i*3)})});
  // lò rèn, kho lương, xe, ngựa, chỗ tra hỏi
  if(vis(FORGE.x+2,FORGE.y))list.push({y:FORGE.y+FORGE.h,f:()=>{drawSprite(forgeSprite(),FORGE.x+FORGE.w/2,FORGE.y+FORGE.h+.05);const px=(FORGE.x+1.1)*TS,py=(FORGE.y+2.6)*TS;tongue(Math.round(px),Math.round(py),6,4,7)}});
  if(vis(ANVIL[0],ANVIL[1]))list.push({y:ANVIL[1],f:()=>drawSprite(anvilSprite(),ANVIL[0],ANVIL[1]+.2)});
  for(const r of RACKS)if(vis(r.x,r.y))list.push({y:r.y+.95,f:()=>drawSprite(rackSprite(),r.x+1,r.y+1)});
  if(vis(GRAN.x+3,GRAN.y))list.push({y:GRAN.y+GRAN.h,f:()=>drawSprite(granSprite(),GRAN.x+GRAN.w/2,GRAN.y+GRAN.h+.05),lab:Math.hypot(GRAN.x+3-S.x,GRAN.y+3.5-S.y)<5?['Kho lương',GRAN.x+3,GRAN.y-1.2]:null});
  for(const [x,y] of [...SACKS,...T_SACKS])if(vis(x,y))list.push({y,f:()=>drawSprite(sackSprite(),x,y)});
  for(const c of CARTS)if(vis(c.x,c.y))list.push({y:c.y+.95,f:()=>drawSprite(cartSprite(),c.x+1,c.y+1)});
  if(vis(TROUGH.x,TROUGH.y))list.push({y:TROUGH.y+.9,f:()=>drawSprite(troughSprite(),TROUGH.x+1,TROUGH.y+.95)});
  for(const [x,y] of HAY)if(vis(x,y))list.push({y:y+.95,f:()=>drawSprite(propSprite({k:'rom',x,y},S?S.season:0),x+.5,y+.95)});
  if(vis(HORSE.x0+3,HORSE.y0))for(let i=0;i<HORSES.length;i++){const h=horseAt(i);list.push({y:h.y,f:()=>{shadow(h.x,h.y,22);drawSprite(horseDir(h.c,h.graze?1:0,h.dir),h.x,h.y)}})}
  if(vis(TORTURE.x+2,TORTURE.y)){list.push({y:TORTURE.y+1.9,f:()=>{drawSprite(postSprite(),TORTURE.x+.5,TORTURE.y+1.95);drawSprite(brazierSprite(),TORTURE.x+1.6,TORTURE.y+1.9);
      const px=Math.round((TORTURE.x+1.6)*TS),py=Math.round((TORTURE.y+1.55)*TS);tongue(px,py,7,4,11);drawSprite(tableSprite(),TORTURE.x+3,TORTURE.y+1.9)}})}
  if(vis(POT[0],POT[1]))list.push({y:POT[1],f:()=>{campfire(POT[0],POT[1]+.1,21);drawSprite(potSprite(),POT[0],POT[1]-.05)}});
  // thủy trại: cọc cầu tàu, thuyền chiến neo
  for(const jy of JETTY_Y)for(let x=Math.floor(hongX(jy)+hongEW(jy)-4);x<THUY.x0+2;x++)if(vis(x,jy))for(const dy of [-.08,.98])list.push({y:jy+dy,f:()=>drawSprite(jettyPost(),x+.5,jy+dy+.3)});
  SHIPS.forEach(([x,y],i)=>{if(vis(x,y,5))list.push({y:y-.5,f:()=>{const bob=reduce?0:Math.round(Math.sin(clock*1.2+i*2));drawSprite(shipSprite(),x,y+bob/TS)}})});
}
const flips={};export function horseDir(c,fr,dir){const sp=horseSprite(c,fr);if(dir!=='right')return sp;const k=c+'_'+fr;return flips[k]||(flips[k]=flip(sp))}
/* cờ lớn, đuốc giặc ở bến Đông Bộ Đầu (đêm 12) */
export const BEN_FIRES=[[80.5,11.2],[81,14.6]];

/* ---------- người trong trại (lính tuần, thợ rèn, lính giữ ngựa): vị trí tính theo đồng hồ ---------- */
const PATROLS=[[[131.5,12.6],[144.5,12.6],[144.5,20.6],[131.5,20.6]],[[154.5,12.6],[167.5,12.6],[167.5,20.6],[154.5,20.6]],[[132.5,30.6],[166.5,30.6]],[[107.5,6.6],[107.5,19.6]]];
function along(pts,t){const L=[];let tot=0;const loop=pts.length>2?[...pts,pts[0]]:[...pts,...pts.slice(0,-1).reverse()];
  for(let i=1;i<loop.length;i++){const d=Math.abs(loop[i][0]-loop[i-1][0])+Math.abs(loop[i][1]-loop[i-1][1]);L.push(d);tot+=d}
  let u=(t%tot+tot)%tot;for(let i=0;i<L.length;i++){if(u<=L[i]){const a=loop[i],b=loop[i+1],f=L[i]?u/L[i]:0,dx=b[0]-a[0],dy=b[1]-a[1];
    return {x:a[0]+dx*f,y:a[1]+dy*f,dir:Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')}}u-=L[i]}return {x:pts[0][0],y:pts[0][1],dir:'down'}}
/* danh sách người đứng/đi trong trại lúc này (để camp.js vẽ, va chạm thì không cần: họ đi theo đường trống) */
export function campFolk(){const t=clock;const out=PATROLS.map((p,i)=>{const a=along(p,t*1.3+i*9);return {x:a.x,y:a.y,dir:a.dir,moving:true,look:{id:i%2?'giac_ky':'giac'},torch:true,walk:t*8}});
  out.push({x:ANVIL[0]+1,y:ANVIL[1]+.1,dir:'left',moving:false,look:{id:'dan_nam1'},hammer:true,walk:0});            // thợ rèn (người bị bắt làm thợ)
  out.push({x:HORSE.gate+.5,y:HORSE.y1+1.7,dir:'up',moving:false,look:{id:'giac_ky'},walk:0});                      // lính giữ ngựa
  out.push({x:TORTURE.x+3.2,y:TORTURE.y+2.6,dir:'left',moving:false,look:{id:'giac'},walk:0});                      // lính ở chỗ tra hỏi
  for(const g of GENS)out.push({x:g.x+.4,y:g.y+g.h+.6,dir:'down',moving:false,look:{id:'giac'},walk:0});           // lính gác lều tướng
  out.push({x:CMD.x-.5,y:CMD.y+CMD.h+.6,dir:'down',moving:false,look:{id:'giac_ky'},walk:0},{x:CMD.x+CMD.w+.5,y:CMD.y+CMD.h+.6,dir:'down',moving:false,look:{id:'giac_ky'},walk:0});
  return out}
/* các chấm trên bản đồ nhỏ */
export function campMini(m){const dot=(x,y,r,col)=>{m.fillStyle=col;m.fillRect(Math.round(x*2-r),Math.round(y*2-r),r*2,r*2)};
  m.strokeStyle='#a83a32';m.strokeRect(CAMP.x0*2+.5,CAMP.y0*2+.5,(CAMP.x1-CAMP.x0+1)*2,(CAMP.y1-CAMP.y0+1)*2);
  for(const f of [...FIRES,...T_FIRES])dot(f[0],f[1],1.5,'#ff9a3a');dot(CMD.x+2.5,CMD.y+1.5,2,'#d9b25a')}
