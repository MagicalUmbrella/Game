/* ================= chân dung và tranh ================= */
/* Chân dung người nói trong hội thoại: cắt phần đầu, vai từ sprite người (person.js), phóng to, đặt trên
   nền màu theo mùa. Tranh phong cảnh pixel theo mùa ở đầu khung sự kiện. Đều vẽ bằng code, lưu data URL. */
import {Hs,mk,shade} from './pixel.js';
import {BODY_H,KID_HEAD,personSprite} from './person.js';
import {LOOK_THAO,NPCS,S,coLook} from './state.js';

const SKY=[['#f3d9c8','#e9b9a8'],['#bfe0e8','#8ec5d6'],['#f1d79a','#e2a866'],['#c9d3d8','#9fb0b8']]; // xuân, hạ, thu, đông

/* Ai là người nói: tìm theo tên trong NPCS, cộng vài tên đặc biệt. Không phải người thì null. */
function lookOf(who){
  if(who==='Cò')return coLook();
  if(who==='Thảo')return LOOK_THAO;
  const n=NPCS.find(n=>n.name===who);
  return n?n.look:null;
}

const pcache={};
export function portrait(who){
  const look=lookOf(who);if(!look)return null;
  const season=S?S.season:0,key=JSON.stringify(look)+season;if(pcache[key])return pcache[key];
  const sp=personSprite(look,'down',0),top=sp.ay-BODY_H+(look.kid?KID_HEAD:0);  // hàng đầu tiên của đầu
  const y0=Math.max(0,top-(look.plume?8:look.hat?5:look.helm?4:3)),hgt=top+19-y0;  // từ trên đầu tới ngang ngực
  const [c,g]=mk(24,24);
  const [a,b]=SKY[season];for(let y=0;y<24;y++){g.fillStyle=y<14?a:b;g.fillRect(0,y,24,1)}
  for(let x=0;x<24;x++)if(Hs(x,1,season)<.3){g.fillStyle=shade(b,-.1);g.fillRect(x,20+Math.floor(Hs(x,2)*3),1,4)}
  g.drawImage(sp,0,y0,22,hgt,1,24-Math.min(24,hgt),22,Math.min(24,hgt));
  return pcache[key]=c.toDataURL();
}

/* Tranh phong cảnh 160×40 theo mùa: trời, núi xa, sông, ruộng, cây, hoa lá theo mùa. */
const bcache={};
export function banner(season){
  if(bcache[season])return bcache[season];
  const W=160,H=40,[c,g]=mk(W,H),px=(x,y,col)=>{g.fillStyle=col;g.fillRect(x,y,1,1)};
  const [a,b]=SKY[season];
  for(let y=0;y<26;y++){g.fillStyle=y<9?a:y<18?shade(a,-.06):b;g.fillRect(0,y,W,1)}
  // mặt trời / trăng
  g.fillStyle=season===3?'#eef3f5':'#fff3d6';for(let y=-3;y<=3;y++){const w=Math.round(Math.sqrt(9-y*y));g.fillRect(126-w,8+y,w*2+1,1)}
  // hai lớp núi
  for(let x=0;x<W;x++){const h1=10+Math.round(6*Math.sin(x/13)+4*Hs(x>>2,7,season)),h2=6+Math.round(4*Math.sin(x/9+1)+3*Hs(x>>1,3,season));
    g.fillStyle=shade(b,-.28);g.fillRect(x,26-h1,1,h1);g.fillStyle=shade(b,-.42);g.fillRect(x,28-h2,1,h2)}
  // sông và ruộng
  g.fillStyle=season===2?'#c9a64a':season===0?'#7fae5a':season===1?'#5e9a4a':'#7e8a6a';g.fillRect(0,28,W,12);
  g.fillStyle='#5b8ea4';g.fillRect(0,30,W,3);g.fillStyle='#8ec5d6';for(let x=0;x<W;x+=9)g.fillRect(x+(season*3)%9,31,4,1);
  for(let x=0;x<W;x+=4){g.fillStyle=shade(season===2?'#c9a64a':'#6a9a4a',-.18);g.fillRect(x,35+(x>>2)%2,1,3)}
  // vài cây
  for(const tx of [14,38,92,148]){g.fillStyle='#4a3a28';g.fillRect(tx,22,1,6);g.fillStyle=season===2?'#b8862a':season===3?'#5a6a5a':'#3f6f3a';
    for(let y=-4;y<=1;y++){const w=3-Math.abs(y+1.5)/1.5|0;g.fillRect(tx-w,20+y,w*2+1,1)}}
  // hoa lá theo mùa
  for(let i=0;i<26;i++){const x=Math.floor(Hs(i,11,season)*W),y=Math.floor(Hs(i,13,season)*30);
    if(season===0)px(x,y,i%2?'#f2a7b5':'#fbd8df');else if(season===2)px(x,y,i%2?'#d08a54':'#e2bf72');else if(season===3){px(x,y,'#eef3f5')}else if(i<10)px(x,y+8,'#e58fa0')}
  return bcache[season]=c.toDataURL();
}
