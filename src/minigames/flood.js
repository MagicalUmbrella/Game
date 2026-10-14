/* ================= minigame: lụt 1270 ================= */
import {TS,Z,ctx} from '../constants.js';
import {Hs} from '../pixel.js';
import {tolichY} from '../map.js';
import {simple} from '../sprites.js';
import {MG,P,S,save,setMG} from '../state.js';
import {floatAt,gain,renderHUD,setKeys,showModal} from '../ui.js';
import {VH,VW,camX,camY,clock,drawSprite,reduce} from '../render.js';

export const sackSprite=()=>simple('sack',12,11,s=>{s(2,2,8,8,'#a8885a');s(3,1,6,1,'#a8885a');s(2,2,8,1,'#c4a472');s(4,0,4,2,'#7a5f3a');s(8,3,2,7,'#8a6c42');s(2,9,8,1,'#7a5f3a')},6,10);
export function mark(x,y,col){const sx=Math.round(x*TS)*Z-camX,sy=Math.round(y*TS)*Z-camY,b=Math.round(Math.sin(clock*6)*1.5)*Z;ctx.fillStyle='#0b0d0c';ctx.fillRect(sx-2*Z,sy-7*Z+b,4*Z,9*Z);ctx.fillStyle=col;ctx.fillRect(sx-Z,sy-6*Z+b,2*Z,4*Z);ctx.fillRect(sx-Z,sy-Z+b,2*Z,2*Z)}
export function hudBox(x,y,w,h){ctx.fillStyle='#0b0d0c';ctx.fillRect(x-3,y-3,w+6,h+6);ctx.fillStyle='#1d221f';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#6b5430';ctx.lineWidth=2;ctx.strokeRect(x+1,y+1,w-2,h-2)}
export function hudBar(x,y,w,frac,col){ctx.fillStyle='#0b0d0c';ctx.fillRect(x,y,w,12);ctx.fillStyle=col;ctx.fillRect(x+2,y+2,Math.max(0,(w-4)*Math.min(1,frac)),8)}
export function startFlood(){
  const xs=[31,37,44,50,57];
  setMG({type:'flood',carry:false,level:0,coT:7,br:xs.map(x=>({x:x+.5,y:Math.floor(tolichY(x)+2.6)+.5,got:0})),pile:{x:41.5,y:33.4},
    update:floodUpdate,findTarget:floodTarget,draw:floodDraw,hud:floodHud,post:rainPost,speedMul:()=>MG.carry?.75:1});
  S.x=41.5;S.y=34.8;P.dir='up';document.body.classList.add('mg');
  setKeys('<span><kbd>E</kbd> vác bao đất ở đống đất, đắp vào chỗ đê vỡ</span><span><kbd>Shift</kbd> chạy</span><span>Mỗi chỗ vỡ cần 2 bao</span>');
}
function floodUpdate(dt){const M=MG,open=M.br.filter(b=>b.got<2).length;
  M.level+=dt*(.004+.0023*open);
  if(S.rel.co>=3&&open){M.coT-=dt;if(M.coT<=0){M.coT=8;const b=M.br.find(b=>b.got<2);b.got++;floatAt('Cò đắp giúp một bao!',b.x,b.y,'#e2bf72')}}
  if(!M.br.some(b=>b.got<2))endFlood(true);else if(M.level>=1)endFlood(false)}
function floodTarget(){const M=MG;if(!M.carry&&Math.hypot(M.pile.x-S.x,M.pile.y-S.y)<1.7)return{label:'Vác bao đất',act:()=>{M.carry=true}};
  if(M.carry){let best=1.7,tb=null;for(const b of M.br)if(b.got<2){const d=Math.hypot(b.x-S.x,b.y-S.y);if(d<best){best=d;tb=b}}
    if(tb)return{label:'Đắp chỗ đê vỡ',act:()=>{tb.got++;M.carry=false;floatAt(tb.got>=2?'Đã chặn được!':'Thêm một bao nữa!',tb.x,tb.y,'#9fcaa9')}}}
  return null}
function gush(x,y){const sx=Math.round(x*TS),sy=Math.round(y*TS);for(let i=0;i<12;i++){const ph=(clock*2.4+i*.37)%1;const px=sx-7+Math.floor(Hs(i,7,1)*14),py=sy-12+Math.floor(ph*13);ctx.fillStyle=i%3?'#7fb3c8':'#d6eaf0';ctx.fillRect(px*Z-camX,py*Z-camY,Z*2,Z*2)}}
function floodDraw(list){const M=MG;
  list.push({y:M.pile.y,f:()=>{for(let i=0;i<6;i++)drawSprite(sackSprite(),M.pile.x-.45+(i%3)*.45,M.pile.y-Math.floor(i/3)*.4)},lab:Math.hypot(M.pile.x-S.x,M.pile.y-S.y)<5?['Đống bao đất',M.pile.x,M.pile.y-1.1]:null});
  for(const b of M.br)list.push({y:b.y,f:()=>{if(b.got>=2){for(let i=0;i<3;i++)drawSprite(sackSprite(),b.x-.45+i*.45,b.y)}else{gush(b.x,b.y);if(b.got)drawSprite(sackSprite(),b.x,b.y+.15);mark(b.x,b.y-1.1,'#e07f6b')}}});
  if(M.carry)list.push({y:S.y+.01,f:()=>drawSprite(sackSprite(),S.x,S.y-1.55)});
}
function floodHud(){const M=MG,w=Math.min(420,VW-32),x=Math.round(VW/2-w/2);hudBox(x,16,w,64);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#9fcaa9';ctx.fillText('Nước lên',x+12,32);hudBar(x+90,26,w-102,M.level,'#5aa0c0');
  const open=M.br.filter(b=>b.got<2).length;ctx.fillStyle='#efe8d4';ctx.fillText(`Chỗ đê vỡ còn ${open}/5`,x+12,56);ctx.textAlign='right';ctx.fillStyle=M.carry?'#e2bf72':'#aab2a2';ctx.fillText(M.carry?'Đang vác bao đất':'Ra đống đất lấy bao',x+w-12,56)}
function rainPost(){ctx.fillStyle='rgba(30,50,90,.3)';ctx.fillRect(0,0,VW,VH);if(reduce)return;ctx.fillStyle='rgba(205,220,245,.45)';
  for(let i=0;i<140;i++){const rx=(Hs(i,1,2)*VW+clock*200*(.8+Hs(i,2,3)*.4))%VW,ry=(Hs(i,3,4)*VH+clock*620*(.8+Hs(i,5,6)*.4))%VH;ctx.fillRect(Math.round(rx/Z)*Z,Math.round(ry/Z)*Z,Z,Z*3)}}
export function endFlood(win){setMG(null);setKeys();document.body.classList.remove('mg');S.pending=null;
  if(win){S.flags.de='saved';S.flags.lang+=2;gain('duc',4);gain('tien',2);showModal({kicker:'Thu · Canh Ngọ 1270',title:'Đê đã giữ được',body:`<p>Bao đất cuối cùng được đắp xuống lúc nước vừa chạm mặt đê. Ruộng lúa làng An Phú thoát nạn. Sáng hôm sau, cụ lý trưởng đến tận nhà cảm ơn.</p>${S.rel.co>=3?'<p>Cò lấm lem bùn đất, cười hề hề: "Nhớ đấy, công tớ một nửa!"</p>':''}<p class="note">Cả làng nhớ việc này. Sau này làng có biến, sẽ có người đứng ra giúp bạn.</p>`})}
  else{S.flags.de='lost';S.tien=Math.max(0,S.tien-3);renderHUD();showModal({kicker:'Thu · Canh Ngọ 1270',title:'Nước tràn qua đê',body:'<p>Nước sông Tô Lịch tràn qua chỗ đê vỡ, ruộng làng An Phú ngập trắng. Vụ thu mất trắng, nhà bạn phải bán bớt đồ để có gạo ăn qua đông (−3 quan).</p><p class="note">Bạn đã cố hết sức. Người làng không trách, nhưng năm ấy ai cũng đói.</p>'})}
  save()}
