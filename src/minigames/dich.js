/* ================= minigame: năm dịch đậu mùa 1278 ================= */
/* Toàn thư chép mùa xuân năm 1278 dân chết nhiều vì bệnh đậu mùa (sự kiện 'daumua' ở events.js). Chuyện cha bạn
   ốm và màn chạy chữa này là hư cấu.
   Cha sốt (sot từ 0 đến 1) tăng dần. Lên rừng phía tây hái lá thuốc (mỗi bụi một lần; biết nghề thuốc nam thì
   mỗi bụi được 2 lá), mang tối đa 3 lá; bụi đã hái thì DICH.MOC giây sau ra lá lại; đủ 3 lá thì về cửa nhà sắc một thang (sot giảm mạnh). Múc nước giếng đắp
   khăn cho cha hạ sốt một chút. Đủ THANG thang trước khi sốt lên tới 1 thì cha khỏi. Giữa chừng nhà chị Lụa
   bên cạnh (hư cấu) có đứa nhỏ cũng lên cơn sốt: đưa một thang sang đó thì cứu được đứa bé (+Đức), nhưng cha
   phải đợi thêm.
   Kết cục ghi S.flags.daumua: 'cham' (cha khỏi), 'nam' (cha khỏi, biết thuốc nam), 'muon' (hết giờ, cha qua
   khỏi nhưng yếu hẳn: đêm 1285 cha đi chậm), 'matcuu' (sốt lên tới 1: cha mất dù bạn đã cố). */
import {TS,Z,ctx} from '../constants.js';
import {MG,P,S,save,setMG} from '../state.js';
import {floatAt,gain,setKeys,showModal} from '../ui.js';
import {VW,camX,camY,drawSprite} from '../render.js';
import {simple} from '../sprites.js';
import {TREES} from '../map.js';
import {knows,practice} from '../nghe.js';
import {gainThe} from '../stats.js';
import {mark,hudBar,hudBox} from './flood.js';
import {endMG,goalArrow,pickTiles,twinkle} from './chung.js';

/* Độ khó (chỉnh bằng bot trong tests/bots.js): sốt ban đầu, tốc độ sốt tăng, giảm khi đắp khăn, khi uống thuốc;
   số thang cần; giờ nhà bên có người ốm; thời gian tối đa. */
export const DICH={SOT0:.3,RISE:.0085,NUOC:.07,THANG_GIAM:.3,THANG:3,NHA_BEN:25,TMAX:98,BUI:7,MOC:20};   // MOC: bụi đã hái bao lâu thì ra lá lại
const DOOR={x:43.5,y:69.4},WELL={x:44.5,y:63.4},BEN={x:35,y:69.4};   // cửa nhà mình, giếng, cửa nhà chị Lụa (nhà phía tây)
const leafSprite=()=>simple('la_thuoc',9,7,s=>{s(1,2,3,4,'#3f8a3a');s(4,1,4,4,'#5aa84a');s(2,3,1,1,'#2a5a26');s(5,2,1,2,'#3f8a3a');s(4,5,1,2,'#6e4a2a')},4,7);
const bowlSprite=()=>simple('bat_nuoc',8,5,s=>{s(0,1,8,3,'#8a6238');s(1,0,6,1,'#7fb3c8');s(1,4,6,1,'#5a3f25')},4,5);

export function startDich(){
  // bụi lá thuốc: ô cạnh nhiều cây trong rừng phía tây, đi tới được từ nhà
  const tree=new Set(TREES.map(t=>t.x+','+t.y)),nTree=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].filter(([a,b])=>tree.has((x+a)+','+(y+b))).length;
  const bui=pickTiles(43,70,4,54,24,86,(x,y)=>nTree(x,y)>=3,DICH.BUI,5).map(p=>({...p,got:false}));
  setMG({type:'dich',t:0,sot:DICH.SOT0,la:0,thang:0,nuoc:false,bui,ben:null,benDone:false,hide:['cha'],
    update:dUpdate,findTarget:dTarget,draw:dDraw,hud:dHud,goal:dGoal});
  S.x=DOOR.x;S.y=DOOR.y+.3;P.dir='down';document.body.classList.add('mg');
  setKeys('<span><kbd>E</kbd> hái lá, múc nước, sắc thuốc ở cửa nhà</span><span><kbd>Shift</kbd> chạy</span><span>Mũi tên vàng chỉ việc nên làm tiếp</span>');
}
const near=(p,r=1.3)=>Math.hypot(p.x-S.x,p.y-S.y)<r;
const ripe=b=>b.got===false||MG.t-b.got>=DICH.MOC;
function dUpdate(dt){const M=MG;M.t+=dt;M.sot=Math.min(1,M.sot+DICH.RISE*dt);
  if(!M.ben&&M.t>=DICH.NHA_BEN){M.ben={x:BEN.x,y:BEN.y};floatAt('Nhà chị Lụa có đứa nhỏ lên cơn sốt!',BEN.x,BEN.y-1,'#e07f6b')}
  if(M.sot>=1)return endDich('matcuu');
  if(M.t>=DICH.TMAX)return endDich('muon')}
function dTarget(){const M=MG;
  if(M.la<3)for(const b of M.bui)if(ripe(b)&&near(b))return{label:'Hái lá thuốc',act:()=>{b.got=M.t;const n=knows('thuoc')?2:1;M.la=Math.min(3,M.la+n);floatAt(knows('thuoc')?'+2 lá (nhận ra đúng cây thuốc)':'+1 lá thuốc',b.x,b.y-1,'#9fcaa9')}};
  if(!M.nuoc&&near(WELL,1.4))return{label:'Múc nước giếng',act:()=>{M.nuoc=true}};
  if(M.ben&&!M.benDone&&M.la>=3&&near(M.ben,1.5))return{label:'Đưa thang thuốc sang cho đứa nhỏ nhà chị Lụa',act:()=>{M.la=0;M.benDone=true;floatAt('Đứa bé hạ sốt rồi!',M.ben.x,M.ben.y-1,'#e2bf72')}};
  if(near(DOOR,1.4)){
    if(M.la>=3)return{label:'Sắc thuốc cho cha',act:()=>{M.la=0;M.thang++;M.sot=Math.max(0,M.sot-DICH.THANG_GIAM);floatAt(`Cha uống thang thuốc (${M.thang}/${DICH.THANG})`,DOOR.x,DOOR.y-1.2,'#9fcaa9');if(M.thang>=DICH.THANG)endDich(knows('thuoc')?'nam':'cham')}};
    if(M.nuoc)return{label:'Đắp khăn mát cho cha',act:()=>{M.nuoc=false;M.sot=Math.max(0,M.sot-DICH.NUOC);floatAt('Cha đỡ nóng',DOOR.x,DOOR.y-1.2,'#9cc7e0')}}}
  return null}
/* việc nên làm tiếp: đủ lá thì về nhà (hoặc sang nhà bên nếu chưa giúp và cha chưa nguy), sốt cao thì đi múc nước */
function dGoal(){const M=MG;
  if(M.la>=3)return M.ben&&!M.benDone&&M.sot<.6?[M.ben.x,M.ben.y]:[DOOR.x,DOOR.y];
  if(M.nuoc)return[DOOR.x,DOOR.y];
  if(M.sot>.8)return[WELL.x,WELL.y];
  let best=null,bd=1e9;for(const b of M.bui)if(ripe(b)){const d=Math.hypot(b.x-S.x,b.y-S.y);if(d<bd){bd=d;best=b}}
  return best?[best.x,best.y]:[WELL.x,WELL.y]}
function dDraw(list){const M=MG;
  for(const b of M.bui)if(ripe(b))list.push({y:b.y,f:()=>{drawSprite(leafSprite(),b.x,b.y);twinkle(b.x,b.y-.4)},lab:Math.hypot(b.x-S.x,b.y-S.y)<3?['Lá thuốc',b.x,b.y-1]:null});
  if(M.ben&&!M.benDone)list.push({y:M.ben.y,f:()=>mark(M.ben.x,M.ben.y-1.4,'#e07f6b'),lab:Math.hypot(M.ben.x-S.x,M.ben.y-S.y)<4?['Nhà chị Lụa',M.ben.x,M.ben.y-2.4]:null});
  list.push({y:DOOR.y,f:()=>{if(M.la>=3||M.nuoc)mark(DOOR.x,DOOR.y-1.4,'#9fcaa9')},lab:Math.hypot(DOOR.x-S.x,DOOR.y-S.y)<4?['Cha nằm trong nhà',DOOR.x,DOOR.y-2.4]:null});
  if(M.la)list.push({y:S.y+.01,f:()=>{for(let i=0;i<M.la;i++)drawSprite(leafSprite(),S.x-.3+i*.3,S.y-1.6)}});
  if(M.nuoc)list.push({y:S.y+.01,f:()=>drawSprite(bowlSprite(),S.x,S.y-1.55)})}
function dHud(){const M=MG,w=Math.min(440,VW-32),x=Math.round(VW/2-w/2);hudBox(x,16,w,64);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#e07f6b';ctx.fillText('Cha sốt',x+12,32);hudBar(x+80,26,w-92,M.sot,M.sot>.75?'#e0402a':'#d98a3a');
  ctx.fillStyle='#efe8d4';ctx.fillText(`Thang thuốc ${M.thang}/${DICH.THANG} · lá trong tay ${M.la}/3${M.nuoc?' · bát nước':''}`,x+12,56);
  ctx.textAlign='right';ctx.fillStyle='#aab2a2';ctx.fillText(M.ben&&!M.benDone?'Nhà bên có người ốm':'Cuối xuân còn '+Math.max(0,Math.ceil(DICH.TMAX-M.t))+' giây',x+w-12,56);
  goalArrow()}

export function endDich(how){const M=MG;endMG();S.flags.daumua=how;S.suc=0;practice('thuoc',how==='nam'?1:2);
  if(M.benDone){S.flags.dichGiup=true;gain('duc',3);gain('tieng',1)}
  const ben=M.benDone?'<p>Đứa nhỏ nhà chị Lụa cũng khỏi. Chị bế con sang tận nhà, lạy mẹ bạn mấy lạy.</p>':M.ben?'<p>Nhà chị Lụa bên cạnh không ai lo kịp thuốc. Mấy hôm sau, đứa nhỏ đi theo bao đứa trẻ khác trong năm dịch ấy.</p>':'';
  if(how==='cham'||how==='nam'){gain('duc',2);gainThe(-3);showModal({kicker:'Cuối xuân',title:'Cha qua khỏi',body:`<p>${how==='nam'?'Thuốc bạn tự hái, tự sắc theo cách sư cụ dạy.':'Mấy thang lá rừng sắc vội, cộng với bao đêm thức bên giường.'} Mụn khô dần, cha hạ sốt, ngồi dậy được, nắm tay bạn không nói nên lời.</p>${ben}`})}
  else if(how==='muon'){gain('duc',1);gainThe(-3);showModal({kicker:'Cuối xuân',title:'Cha qua khỏi, nhưng yếu hẳn',body:`<p>Cơn sốt lui dần, nhưng thuốc đến chậm. Cha qua khỏi mà người gầy rộc, chân đi không vững như xưa.</p>${ben}<p class="note">Từ nay cha đi lại chậm.</p>`})}
  else{S.cha=false;gainThe(-3);showModal({kicker:'Cuối xuân',title:'Cha mất',body:`<p>Bạn chạy ngược chạy xuôi mà không kịp. Cha mất trong một đêm mưa phùn cuối xuân, tay vẫn nắm tay bạn.</p>${ben}<p class="note">Từ nay nhà chỉ còn bạn và mẹ.</p>`})}
  save()}
