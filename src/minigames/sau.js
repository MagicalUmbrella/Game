/* ================= minigame: sâu cắn lúa (đường nông, hạ 1280) ================= */
/* Hư cấu. Mùa hạ năm 1280 sâu cắn lúa lan khắp cánh đồng phía nam làng. Ổ sâu mọc dần trên các ô ruộng; để
   lâu thì ổ lớn hết cỡ, lan sang ô bên cạnh và làm hại lúa. Lấy tro bếp ở cửa nhà (mỗi lần TRO nắm), ra ruộng
   đứng cạnh ổ sâu bấm E rắc tro, bắt sâu. Hết giờ thì tính số lần lúa bị hại.
   Kết cục ghi S.flags.sau: 'giu' (giữ được lúa, được mùa) | 'vua' (mất một phần) | 'mat' (mất mùa năm ấy:
   harvest() trong chuc.js thu nửa phần). */
import {FI,TS,Z,ctx} from '../constants.js';
import {get} from '../map.js';
import {MG,P,S,save,setMG} from '../state.js';
import {floatAt,gain,renderHUD,setKeys,showModal} from '../ui.js';
import {VW,camX,camY,clock} from '../render.js';
import {Hs} from '../pixel.js';
import {hudBox,hudBar,mark} from './flood.js';
import {endMG,goalArrow,pickTiles} from './chung.js';

/* Độ khó (chỉnh bằng bot): thời gian, nhịp mọc ổ mới, thời gian một ổ lớn hết cỡ, số nắm tro mỗi lần lấy,
   ngưỡng hại lúa cho từng kết cục. */
export const SAU={T:75,SPAWN:4,GROW:18,TRO:4,START:4,GIU:10,VUA:20,MAX:7};   // MAX: số ổ tối đa cùng lúc
const DOOR={x:43.5,y:69.6};
export function startSau(){
  const field=pickTiles(43,70,28,72,78,92,(x,y)=>get(x,y)===FI,400,1);
  const M={type:'sau',t:0,field,o:[],tro:0,dmg:0,spawnT:SAU.SPAWN,
    update:sUpdate,findTarget:sTarget,draw:sDraw,hud:sHud,goal:sGoal};
  setMG(M);for(let i=0;i<SAU.START;i++)spawn(M);
  S.x=DOOR.x;S.y=DOOR.y;P.dir='down';document.body.classList.add('mg');
  setKeys('<span><kbd>E</kbd> lấy tro bếp ở cửa nhà, rắc tro bắt sâu ở ổ sâu</span><span><kbd>Shift</kbd> chạy</span><span>Ổ để lâu sẽ lan sang ruộng bên</span>');
}
function spawn(M,near){let c=M.field.filter(f=>!M.o.some(o=>Math.abs(o.x-f.x)+Math.abs(o.y-f.y)<2));
  if(near)c=c.filter(f=>Math.abs(f.x-near.x)+Math.abs(f.y-near.y)<=4);if(!c.length)return;
  const f=c[Math.floor(Math.random()*c.length)];M.o.push({x:f.x,y:f.y,g:near?.3:Math.random()*.3})}
function sUpdate(dt){const M=MG;M.t+=dt;
  if((M.spawnT-=dt)<=0){M.spawnT=SAU.SPAWN;if(M.o.length<SAU.MAX)spawn(M)}
  for(const o of [...M.o]){o.g+=dt/SAU.GROW;if(o.g>=1){o.g=.4;M.dmg++;floatAt('Sâu lan sang ruộng bên!',o.x,o.y-1,'#e07f6b');if(M.o.length<SAU.MAX)spawn(M,o)}}
  if(M.t>=SAU.T)endSau()}
function sTarget(){const M=MG;
  if(Math.hypot(DOOR.x-S.x,DOOR.y-S.y)<1.4&&M.tro<SAU.TRO)return{label:'Lấy tro bếp',act:()=>{M.tro=SAU.TRO}};
  if(M.tro>0){let b=null,bd=1.3;for(const o of M.o){const d=Math.hypot(o.x-S.x,o.y-S.y);if(d<bd){bd=d;b=o}}
    if(b)return{label:'Rắc tro, bắt sâu',act:()=>{M.o.splice(M.o.indexOf(b),1);M.tro--;floatAt('Sạch ổ sâu',b.x,b.y-1,'#9fcaa9')}}}
  return null}
function sGoal(){const M=MG;if(!M.tro)return[DOOR.x,DOOR.y];let b=null,bs=-1;
  for(const o of M.o){const s=o.g-Math.hypot(o.x-S.x,o.y-S.y)/40;if(s>bs){bs=s;b=o}}   // ổ sắp lan, gần mình thì đi trước
  return b?[b.x,b.y]:null}
function sDraw(list){const M=MG;
  for(const o of M.o)list.push({y:o.y-.4,f:()=>{const sx=Math.round(o.x*TS),sy=Math.round(o.y*TS),r=2+Math.round(o.g*6);   // vệt lúa úa vàng, sâu bò lổn nhổn
    ctx.fillStyle=`rgba(190,160,60,${.45+o.g*.4})`;ctx.fillRect((sx-r)*Z-camX,(sy-r)*Z-camY,(2*r)*Z,(2*r)*Z);
    for(let i=0;i<3+Math.floor(o.g*6);i++){const a=clock*1.5+i*2.1,px=sx+Math.round(Math.cos(a+Hs(i,3,1)*6)*r*.7),py=sy+Math.round(Math.sin(a*1.3+i)*r*.7);ctx.fillStyle='#5a7a2a';ctx.fillRect(px*Z-camX,py*Z-camY,2*Z,Z)}
    if(o.g>.7)mark(o.x,o.y-1.1,'#e07f6b')}});
  if(!M.tro)list.push({y:DOOR.y,f:()=>mark(DOOR.x,DOOR.y-1.4,'#aab2a2'),lab:Math.hypot(DOOR.x-S.x,DOOR.y-S.y)<4?['Tro bếp',DOOR.x,DOOR.y-2.4]:null})}
function sHud(){const M=MG,w=Math.min(440,VW-32),x=Math.round(VW/2-w/2);hudBox(x,16,w,64);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#e2bf72';ctx.fillText('Lúa bị hại',x+12,32);hudBar(x+90,26,w-102,M.dmg/(SAU.VUA+2),M.dmg>SAU.VUA?'#e0402a':M.dmg>SAU.GIU?'#d98a3a':'#9fcaa9');
  ctx.fillStyle='#efe8d4';ctx.fillText(`Ổ sâu ${M.o.length} · tro trong tay ${M.tro}/${SAU.TRO}`,x+12,56);ctx.textAlign='right';ctx.fillStyle='#aab2a2';ctx.fillText(`Còn ${Math.max(0,Math.ceil(SAU.T-M.t))} giây`,x+w-12,56);goalArrow()}

export function endSau(){const M=MG;endMG();const how=M.dmg<=SAU.GIU?'giu':M.dmg<=SAU.VUA?'vua':'mat';S.flags.sau=how;
  if(how==='giu'){gain('tien',3);gain('tieng',2);showModal({kicker:'Hạ · 1280',title:'Giữ được lúa',body:'<p>Mấy ngày liền bạn rắc tro, bắt sâu từ sáng đến tối. Ruộng nhà xanh tốt giữa cả cánh đồng úa vàng. Hàng xóm sang hỏi cách, bạn chỉ cho cả xóm.</p><p class="note">Hư cấu. Năm nay nhà được mùa.</p>'})}
  else if(how==='vua')showModal({kicker:'Hạ · 1280',title:'Mất một phần',body:'<p>Sâu ăn mất mấy thửa sát bờ, phần còn lại bạn giữ được. Năm nay đủ ăn, không dư.</p>'});
  else{S.tien=Math.max(0,S.tien-3);renderHUD();showModal({kicker:'Hạ · 1280',title:'Sâu ăn trắng ruộng',body:'<p>Sâu lan nhanh hơn tay bạn. Cuối hạ, ruộng nhà chỉ còn trơ gốc rạ. Nhà phải bán bớt đồ để có gạo ăn (−3 quan).</p><p class="note">Mùa gặt năm nay chỉ được nửa phần.</p>'})}
  save()}
