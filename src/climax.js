/* ================= cao trào: đêm tháng giêng 1285 ================= */
/* Ba hồi (đồng hồ M.t đếm ngược từ 150 giây):
   Hồi 1 · Trống làng (150 → 125): giặc tụ ở bờ bắc sông Tô Lịch quanh đống lửa, chưa sang sông. Lúc gom người.
   Hồi 2 · Làng cháy (125 → 45): tù và giặc rúc, toán đứng chờ ào qua cầu; giặc tràn vào. Từng nóc nhà bốc cháy,
           lửa chặn lối đi trước cửa (BURN, ignite): đường quen bị cắt, phải tìm lối vòng.
   Hồi 3 · Tên đầu toán (từ 45, hoặc 12 giây sau khi đã đưa hết mọi người vào rừng): tù và giặc gọi toán cướp rút
           về (không thêm giặc mới); cu Tí nhà bên kẹt lại trong làng;
           tên đầu toán (hư cấu) bắt một người còn ngoài rừng làm con tin, giải ra sân đình. Hạ hắn thì cứu được;
           bấm E cạnh hắn thì đổi mình lấy con tin (bị bắt), hoặc (đường văn, một lần) lừa hắn là quân Trần đã vây làng.
           Trời sáng mà con tin còn trong tay hắn thì người ấy bị bắt đi.
   Đã gặp anh Ngũ: khoảng giây 80 nghe tù và quân ta từ xa; còn 22 giây thì quân Phạm Ngũ Lão tới đánh giặc
   (không làm giặc bỏ chạy ngay); họ để tên đầu toán cho bạn.
   Hết máu: đang đối đầu tên đầu toán (hắn còn sống) thì bị bắt ('captured', how 'fight'); lừa hắn hỏng cũng bị bắt
   (how 'trick'). Lúc khác: còn người cùng đánh đứng được thì được kéo vào rừng ('down'), không còn ai thì bị bắt (how 'down').
   Bị bắt (cả 'surrender') dẫn tới màn bị giải sang trại giặc bên kia sông (src/camp.js) và mở đầu chương hai khác. */
import {nguChronicle,nguRecall} from './ngu.js';
import {midChronicle} from './minigames/chung.js';
import {careerChronicle,careerTrai,laiFollow} from './chuc.js';
import {$,T,TS,W,H,WA,Z,ctx} from './constants.js';
import {regionId} from './world.js';
import {Hs} from './pixel.js';
import {BUILDINGS,get,tolichY} from './map.js';
import {buildingSprite,personSprite} from './sprites.js';
import {isKid} from './person.js';
import {LOOK_THAO,MG,P,S,has,save,setMG} from './state.js';
import {floatAt,floatText,gain,renderHUD,setKeys,showModal,toast} from './ui.js';
import {hudBar,hudBox,mark,sackSprite} from './minigames/flood.js';
import {canStand} from './input.js';
import {bfs,walkable} from './dialogs.js';
import {nextStep,step4,stepTo} from './pathfind.js';
import {prepChronicle,prepClimax} from './prep.js';
import {VH,VW,camX,camY,clock,drawSprite,reduce,shadow} from './render.js';
import {carryWeak,ducKin,followFast,soulChronicle,theHp,traiFromTieng,voDmg,voFast,voHp} from './stats.js';
import {knows,ngheChronicle} from './nghe.js';
import {lifeChronicle,lifeClimax} from './life.js';
import {exploreChronicle} from './explore.js';
import {chainChronicle} from './chains.js';
import {startEscort} from './camp.js';

export const ZONE={x0:23,y0:54,x1:29,y1:66};
const inZone=(x,y)=>x>=ZONE.x0&&x<=ZONE.x1+1&&y>=ZONE.y0&&y<=ZONE.y1+1;
const src=t=>`<p class="src">Toàn thư chép: ${t}</p>`;
/* Ba hồi: mốc M.t bắt đầu hồi 2, hồi 3. */
export const ACT2=125,ACT3=45;
const ACTS=['','Trống làng','Làng cháy','Tên đầu toán'];
const NGU_HORN=80,NGU_AT=22;                        // tù và quân ta vọng lại; quân Phạm Ngũ Lão tới
const DINH=[34.5,37.6];                             // sân đình, nơi tên đầu toán giữ con tin
/* máu tên đầu toán: gặp người đánh mạnh thì hắn càng lì đòn (đánh 1 → 11 máu, đánh 3 → 16, đánh 4 → 18) */
const bossHp=()=>{const d=pDmg();return d>1?10+2*d:11};
/* Độ khó (chỉnh bằng bảng bot trong npm test): số giặc tụ ở bờ bắc hồi 1 (STAGE_MAX, cứ STAGE_GAP giây một tên),
   số giặc tối đa hồi 2 (RAID_MAX), khoảng cách giữa hai lần thêm giặc (raidGap), tỉ lệ lính kỵ (KY), tốc độ giặc,
   thời gian bạn không bị đánh tiếp sau một đòn (HIT_INV). */
const STAGE_MAX=5,STAGE_GAP=4,RAID_MAX=10,EN_HP=3,GUARD_MAX=4,KY=.3,FOOT_SP=2.35,KY_SP=3.1,HIT_INV=.9;
/* càng nhiều người đứng ra đánh cùng bạn, giặc kéo đến càng đông: cứ hai người thêm một tên */
const raidMax=M=>RAID_MAX+Math.floor(M.al.filter(a=>!a.quan).length/2);
const raidGap=t=>Math.max(1.9,3.8-(ACT2-t)*.022);
/* Nhà bốc cháy ở hồi 2, theo thứ tự; cách nhau FIRE_GAP giây. Lửa trước cửa chặn lối FIRE_T giây. */
const BURN=['nha2','nha1','batu','home','truong','vo'],FIRE_GAP=11,FIRE_T=30;
const TI_AT=[32.5,49.5];                            // cu Tí nấp sau nhà, cạnh bụi chuối
/* Lửa chặn ô (x,y): giặc, người cùng đánh, dân tự đi đều tránh; bạn không bước vào được (input.js solidAt). */
const fireAt=(x,y)=>{const M=MG;if(!M||!M.fire)return false;const e=M.fire.get(y*W+x);return e!=null&&e>M.T-M.t};
/* Giặc và người cùng đánh đi theo đường thật (src/pathfind.js), không xuyên sông, cây, nhà, lửa.
   Chưa vét sông Tô Lịch thì giặc lội qua được (đi chậm lại một nửa); đã vét thì phải qua cầu. */
/* đêm 1285 chỉ diễn ra trong vùng An Phú (bản đồ thế giới rộng hơn nhiều: không cho ai đi lạc ra ngoài, tìm đường cũng nhanh) */
const inHome=(x,y)=>regionId(x,y)==='anphu';
const okAlly=(x,y)=>walkable(x,y)&&inHome(x,y)&&!fireAt(x,y);
const okEnemyFire=(x,y)=>(walkable(x,y)||(S.flags.tolich!=='done'&&get(x,y)===WA))&&inHome(x,y);
const okEnemy=(x,y)=>(walkable(x,y)||(S.flags.tolich!=='done'&&get(x,y)===WA))&&inHome(x,y)&&!fireAt(x,y);
const wading=o=>get(Math.floor(o.x),Math.floor(o.y))===WA;
/* Đường văn. Người có chữ được dân làng nghe lời: bấm E thì người ấy tự tìm đường vào rừng, đi chậm hơn
   khi được dẫn, giặc gặp trên đường vẫn bắt được. Đuốc nghi binh: 2 cây, cứ 25 Văn thêm một cây (tối
   đa 5), đỗ Thái học sinh thêm một cây; mỗi cây cháy 10 giây. */
const SELF_SPEED=.8,TORCH_T=10;
export const torches=()=>S.path!=='van'?0:Math.min(5,2+Math.floor(S.van/25))+(S.dothi?1:0);
let zoneReach=null;
function zoneSpot(p){ // ô trong rừng trú ẩn đi tới được từ làng, gần p nhất
  if(!zoneReach)zoneReach=bfs(43,50);let best=null,bd=1e9;
  for(let y=ZONE.y0;y<=ZONE.y1;y++)for(let x=ZONE.x0;x<=ZONE.x1;x++)if(zoneReach[y*W+x]!==-2){const d=Math.hypot(x+.5-p.x,y+.5-p.y);if(d<bd){bd=d;best=[x+.5,y+.5]}}
  return best}
function reachSafe(p){p.st='safe';p.path=null;floatAt(p.name+' đã an toàn',p.x,p.y,'#9fcaa9');p.spot=[ZONE.x0+.8+Math.random()*(ZONE.x1-ZONE.x0-.6),ZONE.y0+1+Math.random()*(ZONE.y1-ZONE.y0-2)];
  if(MG&&p.id==='ti')say(p,'Cháu cảm ơn chú!')}
// Chỗ giặc lục lọi khi không có ai để đuổi: sân các nhà, kho thóc, đình, ruộng.
const LOOT=[[43.5,51.5],[47.5,51.2],[52.5,51],[36.5,38.5],[34.5,38.5],[44.5,44.5],[40.5,46.5],[49.5,46],[38.5,52.5],[46.5,56.5]];
function pickLoot(e){let p;do p=LOOT[Math.floor(Math.random()*LOOT.length)];while(e.loot&&p===e.loot&&LOOT.length>1);e.lootT=1+Math.random()*2.5;return p}
/* Vị trí riêng của mỗi tên giặc quanh một điểm (đuốc, chỗ lục lọi), để chúng dàn ra thay vì dồn vào một chỗ.
   spin: đi vòng quanh điểm ấy (quanh đuốc: dáo dác tìm quân mai phục). */
function around(p,e,r,spin=0){if(e.slot==null)e.slot=Math.random()*Math.PI*2;const a=e.slot+spin*(MG.T-MG.t),x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;
  return okEnemy(Math.floor(x),Math.floor(y))&&!inZone(x,y)?{x,y}:p}
/* các phía vây: null là đi thẳng tới, còn lại là chỗ đứng chặn phía đông, tây, nam, bắc của người bị đuổi */
const FLANK=[null,[1.6,0],[-1.6,0],[0,1.6],[0,-1.6]];
/* Giặc đứng gần nhau quá thì đẩy nhau ra (không vào ô cấm, không vào rừng). */
function separate(en){const R=.7;
  for(let i=0;i<en.length;i++)for(let j=i+1;j<en.length;j++){const a=en[i],b=en[j];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=R)continue;
    if(d<1e-3){dx=Math.cos(i+j);dy=Math.sin(i+j);d=1}const k=(R-d)/2/d;if(Math.abs(dx)>=Math.abs(dy))dy=0;else dx=0;   // đẩy theo một trục, không trượt chéo
    for(const [o,s] of [[a,-1],[b,1]]){if(o.boss&&o.st==='hold')continue;const nx=o.x+s*dx*k,ny=o.y+s*dy*k;if(okEnemy(Math.floor(nx),Math.floor(ny))&&(o.st==='flee'||!inZone(nx,ny))){o.x=nx;o.y=ny}}}}
const FIRES=[[53.5,21.6],[24.5,20.2],[48.5,21.2]];
/* tên người đứng giữa câu: viết thường chữ đầu với danh xưng (mẹ, cha, bà Tư, bé Sen, cụ xã, trai làng, cu Tí) */
const lc=n=>/^(Mẹ|Cha|Bà|Bé|Cụ|Trai|Cu)/.test(n)?n[0].toLowerCase()+n.slice(1):n;
const names=a=>a.map(lc).join(', ');
const liveOut=p=>p.st==='wait'||p.st==='follow'||p.st==='self';   // người còn ngoài rừng, chưa bị bắt

/* ---------- lời nói ngắn trên đầu nhân vật ---------- */
function say(o,text,dur=3.4){if(!MG)return;MG.bub=MG.bub.filter(b=>b.o!==o);MG.bub.push({o,text,t:dur})}
const sayMe=(text,dur)=>say({x:0,y:0,me:true},text,dur);
/* Câu của người được bạn dẫn (đường văn: chỉ đường), nhắc lại những gì đã xảy ra trong đời. */
function leadLine(p){const F=S.flags;
  switch(p.id){
    case'me':return S.cha?'Để mẹ ôm theo bát hương nhà mình đã!':'Giá mà cha con còn đây... Thôi, đi!';
    case'cha':return F.daumua==='cham'?'Năm dịch con không bỏ cha. Giờ cha theo con.':'Đi thôi, cha còn đi được.';
    case'batu':return S.thao==='wife'?'Cháu rể ơi, bà già rồi, cứ đưa con Thảo đi trước...':'Bà chạy không nổi đâu cháu ơi... Ừ, đi thì đi!';
    case'thao':return S.thao==='wife'?'Em đi sau anh. Anh đừng buông tay em.':S.thao==='co'?'Anh Cò đâu rồi? Anh có thấy anh ấy không?':'Em... em sợ lắm.';
    case'sen':return 'Cha ơi, con sợ! Cha bế con!';
    case'ly':return F.dh==='hoa'?'Giờ thì cháu hiểu vì sao cả nước nói "đánh" rồi chứ?':'Người coi việc làng phải đi sau cùng. Cháu dẫn ta đi.';
    case'ti':return 'Chú ơi! Nhà cháu cháy rồi, mẹ cháu chạy đâu mất!';
  }return 'Đi! Đi mau!'}
/* Câu mở màn của người cùng đánh. */
function allyLine(a){const F=S.flags;
  if(a.id==='co')return F.exam==='khoe'?'Ông Thái học sinh cũng biết cầm gậy cơ à? Thôi, đánh đã!':F.dieu==='di'?'Như hồi trốn học thả diều nhé: cậu chạy trước, tớ đỡ sau!':'Tớ ở đây. Cậu cứ lo cho mọi người.';
  if(a.id==='trai0')return F.de==='saved'?'Năm nước to cậu giữ đê cho làng. Giờ đến lượt bọn tớ!':S.tieng>=60?'Cả làng theo cậu!':'Bọn tớ đứng cùng cậu!';
  return null}

export function startClimax(){
  if(S.quests.lo==='active'){delete S.quests.lo;renderHUD()}   // hết hạn lo trước (hết 1284)
  const v=[],add=(id,name,x,y,look,slow)=>v.push({id,name,x,y,look,st:'wait',slow:slow||1,walk:0,dir:'down'});
  add('me','Mẹ',45.5,50.4,{id:'me_gia'},.85);
  if(S.cha)add('cha','Cha',42.5,56.4,{id:'cha_gia'},S.flags.daumua==='muon'?.6:.85);   // năm dịch thuốc về chậm: cha yếu, đi chậm
  add('batu','Bà Tư',52.4,49.9,{id:'batu'},.75);
  if(S.ev.thao&&S.thao!=='gone'){const p=S.thao==='wife'?[47.4,50.7]:S.thao==='co'?[36.4,49.7]:[49.3,50.6];add('thao','Thảo',p[0],p[1],LOOK_THAO)}
  if(S.child)add('sen','Bé Sen',46.6,51.7,{id:'sen',kid:true},.8);
  add('ly','Cụ xã',35.8,36.9,{id:'ly'},.8);
  const sk=[[42.3,50.3],[44.9,50.3],[33.4,37.4],[35.3,37.5]];if(S.flags.duyet==='giu')sk.push([43.6,51.4]);
  const al=[];
  if(S.co==='village')al.push({id:'co',name:'Cò',x:38.5,y:45.2,look:{id:'co_do'},hp:S.rel.co>=4?6:4,dmg:1,cd:0,sp:4,inv:0,dir:'down',walk:0});
  // trai làng: theo Tiếng (src/stats.js), thêm một nếu giữ được đê 1270, một nếu theo đường nông; nói "hòa" thì bớt một; tối đa 4
  const nLang=Math.min(4,traiFromTieng()+careerTrai()+(S.flags.de==='saved'?1:0)+(S.path==='nong'?1:0)-(S.flags.dh==='hoa'?1:0));
  for(let i=0;i<Math.max(0,nLang);i++)al.push({id:'trai'+i,name:'Trai làng',x:39+i*2,y:44.6,look:{id:['trai','trai2','trai3','trai4'][i%4]},hp:4,dmg:1,cd:0,sp:3.6,inv:0,dir:'down',walk:0});
  const maxhp=Math.max(2,4+(S.path==='vo'?2:0)+(S.flags.train==='top'?1:0)+voHp()+theHp()+(S.vat&&S.vat.do?1:0));   // đô vật làng chịu đòn tốt hơn
  setMG({type:'climax',T:150,t:150,act:1,hp:maxhp,maxhp,v,sk:sk.map(([x,y])=>({x,y,st:'wait'})),carry:null,en:[],al,spawnT:2,decoy:null,decoys:torches(),cd:0,inv:0,slash:0,kills:0,ngu:false,horn:false,nLang:Math.max(0,nLang),
    fire:new Map(),burn:[],burnI:0,fireT:0,bub:[],banner:{act:1,t:3.2},shake:0,boss:null,bossOut:null,
    hideNPC:true,mini:clMini,update:clUpdate,findTarget:clTarget,draw:clDraw,hud:clHud,post:nightPost,key:clKey,blockAt:fireAt,speedMul:()=>MG.carry?(S.path==='nong'?.92:.74):1});
  // những gì đã lo trước (src/prep.js): người, thóc đã ở sẵn trong rừng; trai làng có giáo
  lifeClimax(MG.al);
  prepClimax(MG.v,MG.sk,MG.al,o=>{o.st='safe';o.x=ZONE.x0+1.2+Math.random()*4;o.y=ZONE.y0+1.5+Math.random()*10;if(o.look)o.spot=[o.x,o.y]});
  S.x=43.5;S.y=50.6;P.dir='down';document.body.classList.add('mg');
  setKeys(`<span><kbd>Space</kbd> đánh</span><span><kbd>E</kbd> ${S.path==='van'?'chỉ đường':'dẫn người'} · vác thóc</span>${MG.decoys?'<span><kbd>Q</kbd> đuốc nghi binh</span>':''}<span><kbd>Shift</kbd> chạy</span>`);
  toast(al.length?`${al.map(a=>a.name).filter((x,i,a)=>a.indexOf(x)===i).map((x,i)=>i?lc(x):x).join(', ')} cầm gậy chạy ra đứng cạnh bạn. Giặc còn ở bờ bắc, tranh thủ lúc chúng chưa sang sông!`:'Không ai trong làng đứng ra cùng bạn. Giặc còn ở bờ bắc, tranh thủ lúc chúng chưa sang sông!',5200);
  const me=v.find(p=>p.id==='me'),M0=MG;setTimeout(()=>{if(MG===M0&&me)say(me,S.cha?'Con ơi! Giặc đến thật rồi sao?':'Con ơi... giặc đến rồi!',3.6)},3300);
  al.forEach((a,i)=>{const l=allyLine(a);if(l)setTimeout(()=>{if(MG===M0)say(a,l,4)},5000+i*1800)});
  if(S.path==='van'){const n=MG.decoys,M=MG;setTimeout(()=>{if(MG===M)toast(`Dân làng tin người có chữ: bấm E để chỉ đường, họ tự tìm vào rừng. Bạn có ${n} cây đuốc nghi binh (Q).`,6000)},5400)}
  else if(ducKin()){const M=MG;setTimeout(()=>{if(MG===M)toast('Người nhà tin lời bạn: bấm E chỉ đường là cha mẹ, vợ con tự tìm vào rừng. Người khác thì phải dẫn.',6000)},5400)}
}
const pDmg=()=>1+(S.path==='vo'?1:0)+(has('Kiếm sắt')?1:0)+voDmg();
function clKey(k){if(k===' '){clAttack();return true}if(k==='q'&&MG.decoys>0){if(inZone(S.x,S.y)){toast('Trong rừng giặc không dám vào, cắm đuốc ở đây chẳng dụ được ai. Ra ngoài làng mà cắm.');return true}MG.decoys--;MG.decoy={x:S.x,y:S.y,t:TORCH_T};toast('Bạn cắm đuốc, hò hét giả làm quân mai phục. Giặc kéo về phía ánh lửa!');return true}return false}
function clAttack(){const M=MG;if(M.cd>0)return;M.cd=(S.path==='vo'?.3:.45)*(voFast()?.8:1);M.slash=.15;M.swing=.24;
  // có giặc trong tầm thì tự quay mặt về tên gần nhất, khỏi phải bấm hướng trước
  let near=null,nd=1.6;for(const e of M.en){if(e.dead)continue;const d=Math.hypot(e.x-S.x,e.y-S.y);if(d<nd){nd=d;near=e}}if(near)P.dir=dirOf(near.x-S.x,near.y-S.y);
  const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[P.dir];
  for(const e of M.en){if(e.dead)continue;const dx=e.x-S.x,dy=e.y-S.y,d=Math.hypot(dx,dy);if(d<1.6&&(d<.8||(dx*v[0]+dy*v[1])/d>.2))hitEnemy(e,pDmg(),S.x,S.y)}}
/* Người đi theo tìm đường ngắn nhất (BFS 4 hướng, chỉ qua ô đi được) tới người đi trước mình. */
function followTrail(p,lead,m){const st=nextStep(p,lead.x,lead.y,okAlly,MG.T-MG.t);if(!st)return;
  const [mx,my]=stepTo(p,st,m,okAlly);p.x+=mx;p.y+=my;if(mx||my)p.dir=dirOf(mx,my)}
/* hướng bị đánh bật: theo trục trội (4 hướng, không bật chéo) */
const axisDir=(dx,dy)=>Math.abs(dx)>=Math.abs(dy)?[dx<0?-1:1,0]:[0,dy<0?-1:1];
function hitEnemy(e,dmg,fx,fy){e.hp-=dmg;const kb=e.boss?.15:.6,[ux,uy]=axisDir(e.x-fx,e.y-fy),kx=e.x+ux*kb,ky=e.y+uy*kb;if(okEnemy(Math.floor(kx),Math.floor(ky))){e.x=kx;e.y=ky}e.flash=.15;e.stun=e.boss?.35:.8;
  if(e.hp<=0){e.dead=true;MG.kills++;if(e.cap){e.cap.st='wait';e.cap.x=e.x;e.cap.y=e.y;floatAt('Cứu được '+e.cap.name+'!',e.x,e.y,'#9fcaa9');if(e.boss)say(e.cap,e.cap.id==='ti'?'Chú ơi!':'Con... con đây rồi!');e.cap=null}
    if(e.boss){MG.bossOut='killed';MG.shake=1;toast('Tên đầu toán gục xuống giữa sân đình! Đám giặc quanh đó hoảng loạn.',4600);for(const g of MG.en)if(!g.dead&&!g.boss&&Math.hypot(g.x-e.x,g.y-e.y)<8)g.st='flee'}}}
function stagePos(){for(let k=0;k<20;k++){const f=FIRES[Math.floor(Math.random()*FIRES.length)],x=f[0]+(Math.random()*5-2.5),y=f[1]+(Math.random()*2-1.4);
    if(walkable(Math.floor(x),Math.floor(y))&&y<tolichY(x)-1.2)return[x,y]}return[53.5,21.8]}
function spawnEnemy(stage){const M=MG,pts=[[53.5,21.8],[24.5,20.4]];
  if(S.flags.tolich!=='done')for(let k=0;k<10;k++){const x=30+Math.floor(Math.random()*30),y=tolichY(x)-2.4;if(walkable(x,Math.floor(y))){pts.push([x+.5,y]);break}}
  if(M.T-M.t>40)pts.push([79.5,31.5]);
  const p=stage?stagePos():pts[Math.floor(Math.random()*pts.length)],ky=Math.random()<KY;
  const e={x:p[0],y:p[1],home:stage?[53.5,21.8]:p,hp:ky?EN_HP+1:EN_HP,sp:ky?KY_SP:FOOT_SP,ky,st:stage?'stage':'hunt',cap:null,walk:0,dir:'down',flash:0,dead:false};
  if(stage)e.tgt={x:e.x,y:e.y};M.en.push(e);return e}
export const dirOf=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');

/* ---------- lửa (hồi 2) ---------- */
/* Còn đường đi (okAlly) từ ô rừng tới bạn, tới mọi người, mọi bao thóc còn ở ngoài không. */
function stillReachable(){const M=MG,seen=new Uint8Array(W*H),q=[];const s=[ZONE.x0+3,ZONE.y0+5];seen[s[1]*W+s[0]]=1;q.push(s[1]*W+s[0]);let h=0;
  while(h<q.length){const i=q[h++],x=i%W,y=(i/W)|0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b,j=ny*W+nx;if(nx<0||ny<0||nx>=W||ny>=H||seen[j]||!okAlly(nx,ny))continue;seen[j]=1;q.push(j)}}
  const ok=(x,y)=>{const tx=Math.floor(x),ty=Math.floor(y);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(seen[(ty+dy)*W+tx+dx])return true;return false};
  if(!ok(S.x,S.y))return false;
  for(const p of M.v)if(liveOut(p)&&!ok(p.x,p.y))return false;
  for(const s2 of M.sk)if(s2.st==='wait'&&!ok(s2.x,s2.y))return false;
  return true}
function ignite(b){const M=MG,now=M.T-M.t;M.burn.push({b,at:now});
  toast(`${b.name||'Một nóc nhà trong xóm'} bốc cháy!${b.id==='home'?' Nhà của bạn!':''}`,3400);M.shake=Math.max(M.shake,.35);
  const busy=(x,y)=>Math.hypot(S.x-x-.5,S.y-y-.5)<1.6||M.v.some(p=>liveOut(p)&&Math.hypot(p.x-x-.5,p.y-y-.5)<1.6)||M.al.some(a=>Math.hypot(a.x-x-.5,a.y-y-.5)<1.2)||M.sk.some(s=>s.st!=='safe'&&Math.hypot(s.x-x-.5,s.y-y-.5)<1.2);
  for(let x=b.x-1;x<=b.x+b.w;x++)for(const y of [b.y+b.h]){if(!walkable(x,y)||busy(x,y))continue;const i=y*W+x;M.fire.set(i,now+FIRE_T);if(!stillReachable())M.fire.delete(i)}
  // người còn đứng chờ gần nhà cháy thì kêu lên
  for(const p of M.v)if(p.st==='wait'&&Math.hypot(p.x-(b.x+b.w/2),p.y-(b.y+b.h))<4){say(p,p.id==='sen'?'Cha ơi! Lửa!':'Cháy! Cháy nhà rồi!',3);break}}

/* ---------- tên đầu toán (hồi 3) ---------- */
function startAct3(){const M=MG;M.act=3;M.banner={act:3,t:3.4};M.shake=Math.max(M.shake,.5);
  if(M.hp<M.maxhp){M.hp++;floatText('+1 máu','#9fcaa9')}   // thấy tên đầu toán, bạn nghiến răng đứng thẳng dậy
  // tù và gọi toán cướp gom của rút về bến sông; chỉ tên đầu toán và lính canh của hắn ở lại
  for(const e of M.en)if(!e.dead)e.st='flee';
  // cu Tí con nhà bên kẹt lại trong làng
  const outside=M.v.some(liveOut);
  const ti={id:'ti',name:'Cu Tí nhà bên',x:TI_AT[0],y:TI_AT[1],look:{id:'ti',kid:true},st:'wait',slow:.8,walk:0,dir:'down'};M.v.push(ti);
  const b={boss:true,x:53.5,y:21.8,home:[53.5,21.8],hp:bossHp(),maxhp:bossHp(),sp:2.5,st:'seek',cap:null,walk:0,dir:'down',flash:0,dead:false,cd:0,swing:0,tgt:null,prey:null};
  M.boss=b;M.en.push(b);
  if(outside)say(ti,'Cứu cháu với! Mẹ ơi!',4);
  else{ti.st='hostage';b.cap=ti;b.st='toDinh';ti.x=b.x+.45;ti.y=b.y+.15}   // mọi người đã vào rừng: hắn lôi được cu Tí từ nhà cháy
  // đám lính đi kèm tên đầu toán: 2, đường võ thêm 1, cứ hai người cùng đánh với bạn thêm 1, tối đa GUARD_MAX (4)
  const nG=Math.min(GUARD_MAX,2+(S.path==='vo'?1:0)+Math.floor(M.al.filter(a=>!a.quan).length/2));
  for(let i=0;i<nG;i++){const g=spawnEnemy(false);g.x=53.5+(i%3-1)*.7;g.y=21.4-Math.floor(i/3)*.7;g.home=[53.5,21.8];g.guard=true;g.slot=i*Math.PI*2/nG;g.hp=Math.max(g.hp,EN_HP+1)}   // lính thân tín: lì đòn như lính kỵ
  if(outside){say(b,'Bắt lấy một đứa! Ta sẽ bắt cả làng này phải ra nộp mình!',4);toast('Tù và giặc gọi quân rút. Nhưng tên đầu toán vượt sông, đi tìm người làm con tin! Cu Tí nhà bên còn kẹt trong xóm.',5600)}
  else{say(ti,'Chú ơi! Cứu cháu!',4);toast('Tù và giặc gọi quân rút. Nhưng tên đầu toán vượt sông, tay lôi theo cu Tí nhà bên vừa bắt được trong xóm cháy!',5600)}}
function bossSeek(b){let best=null,bd=1e9;for(const p of MG.v)if(liveOut(p)){const d=Math.hypot(p.x-b.x,p.y-b.y);if(d<bd){bd=d;best=p}}return best}
function bossUpdate(b,dt){const M=MG,now=M.T-M.t;b.flash=Math.max(0,b.flash-dt);b.stun=Math.max(0,(b.stun||0)-dt);b.cd=Math.max(0,b.cd-dt);b.swing=Math.max(0,b.swing-dt);
  let tx=b.x,ty=b.y,sp=b.sp;
  const dp=Math.hypot(S.x-b.x,S.y-b.y),meOut=!inZone(S.x,S.y);
  if(b.st==='seek'){const p=b.prey&&liveOut(b.prey)?b.prey:(b.prey=bossSeek(b));
    if(!p){b.st='hold'}   // không còn ai ngoài rừng: đứng giữ sân đình, chờ bạn ra
    else{tx=p.x;ty=p.y;if(Math.hypot(p.x-b.x,p.y-b.y)<.6){p.st='hostage';p.path=null;b.cap=p;b.st='toDinh';M.shake=Math.max(M.shake,.4);
      toast(`${p.name} bị tên đầu toán bắt làm con tin, giải về sân đình!`,4400);say(p,p.id==='sen'?'Cha ơi!':p.id==='me'?'Con ơi, đừng ra đây!':'Cứu tôi với!',3.6)}}}
  if(b.st==='toDinh'){tx=DINH[0];ty=DINH[1];if(Math.hypot(DINH[0]-b.x,DINH[1]-b.y)<.75){b.st='hold';
    if(b.cap)say(b,`Đứa nào cầm đầu làng này? Ra nộp mình thì ta tha cho ${lc(b.cap.name)}!`,5)}}
  if(b.st==='hold'){tx=DINH[0];ty=DINH[1];if(meOut&&dp<3){tx=S.x;ty=S.y}sp=b.sp*.9}
  if(b.st==='flee'){tx=b.home[0];ty=b.home[1];sp=b.sp*1.3;if(Math.hypot(tx-b.x,ty-b.y)<.6){b.dead=true;return}}
  b.tgt={x:tx,y:ty};
  if(b.stun<=0){const dx=tx-b.x,dy=ty-b.y,d=Math.hypot(dx,dy);if(d>.6){const st=nextStep(b,tx,ty,okEnemy,now);if(st){const [mx,my]=stepTo(b,st,sp*dt*(wading(b)?.5:1),okEnemy),nx=b.x+mx,ny=b.y+my;if(!inZone(nx,ny)){b.x=nx;b.y=ny}b.walk+=dt*8;if(mx||my)b.dir=dirOf(mx,my)}}}
  if(b.cap){b.cap.x=b.x+.75;b.cap.y=b.y+.1}
  // đánh: bạn ở sát thì chém, người cùng đánh ở sát thì chém
  if(b.cd<=0&&b.stun<=0){
    if(b.st!=='flee'&&meOut&&dp<.9&&M.inv<=0){M.hp--;M.inv=HIT_INV;b.swing=.3;b.cd=b.rage?1.1:1.8;b.dir=dirOf(S.x-b.x,S.y-b.y);M.shake=Math.max(M.shake,.6);const [ux,uy]=axisDir(S.x-b.x,S.y-b.y),nx=S.x+ux*1.1,ny=S.y+uy*1.1;if(canStand(nx,ny)){S.x=nx;S.y=ny}floatText('−1 máu','#e07f6b');
      if(M.carry){M.carry.st='wait';M.carry.x=S.x;M.carry.y=S.y;M.carry=null}}
    else if(b.st!=='flee')for(const a of M.al)if(!a.down&&!a.quan&&a.inv<=0&&Math.hypot(a.x-b.x,a.y-b.y)<.9){a.hp-=1;a.inv=1;b.swing=.3;b.cd=b.rage?1.1:1.8;b.dir=dirOf(a.x-b.x,a.y-b.y);if(a.hp<=0){a.down=true;toast(a.name+' bị tên đầu toán chém ngã!',3800)}break}}}
/* Đường văn: lừa tên đầu toán (hư cấu). Thành thì hắn bỏ con tin mà chạy; hỏng thì bạn bị bắt. Chỉ một lần. */
const trickChance=()=>Math.min(.7,.3+S.van/150+(S.dothi?.1:0));
function trick(b){const M=MG;b.tricked=true;
  if(Math.random()<trickChance()){const h=b.cap;h.st='wait';h.x=b.x;h.y=b.y;b.cap=null;b.st='flee';M.bossOut='tricked';M.shake=.4;
    say(b,'Quân Trần? Rút! Rút mau!',3);say(h,'Chú ơi!',2.5);toast('Tên đầu toán tin là quân Trần đã vây làng, bỏ con tin mà chạy về phía sông!',4600)}
  else{M.captureHow='trick';finishClimax('captured')}}   // lừa hỏng: hắn biết bạn nói dối, sai lính trói bạn lại
function surrender(){const M=MG,h=M.boss&&M.boss.cap;if(!h)return;M.surrenderFor=h;finishClimax('surrender')}

function clUpdate(dt){
  const M=MG;M.t-=dt;M.cd=Math.max(0,M.cd-dt);M.inv=Math.max(0,M.inv-dt);M.slash=Math.max(0,M.slash-dt);M.swing=Math.max(0,(M.swing||0)-dt);M.shake=Math.max(0,M.shake-dt*1.6);
  if(!M.banner){for(const b of M.bub)b.t-=dt;M.bub=M.bub.filter(b=>b.t>0)}else if((M.banner.t-=dt)<=0)M.banner=null;
  if(M.decoy){M.decoy.t-=dt;if(M.decoy.t<=0)M.decoy=null}
  // biết thuốc nam: còn 1 máu thì một lần tự băng bó, ít giây sau hồi 1 máu
  if(knows('thuoc')&&!M.healed&&M.hp===1&&M.maxhp>1){M.healT=(M.healT||0)+dt;if(M.healT>3){M.healed=true;M.hp++;floatAt('tự băng bó vết thương',S.x,S.y,'#9fcaa9')}}
  const allIn=()=>M.v.every(p=>p.st==='safe'||p.st==='lost')&&M.sk.every(s=>s.st==='safe')&&inZone(S.x,S.y);
  /* --- nhịp ba hồi --- */
  if(M.act===1){
    if(M.spawnT<1e8&&(M.spawnT-=dt)<=0){if(M.en.length<STAGE_MAX)spawnEnemy(true);M.spawnT=STAGE_GAP}   // giặc tụ dần ở bờ bắc
    if(M.t<=ACT2||allIn()){M.act=2;M.act2At=M.T-M.t;M.banner={act:2,t:3.4};M.shake=.8;M.fireT=5;if(M.spawnT<1e8)M.spawnT=2.5;
      for(const e of M.en)if(e.st==='stage')e.wake=.3+Math.random()*4;   // ào qua cầu, tên trước tên sau
      toast('Tù và giặc rúc lên! Toán giặc bên kia sông ào qua cầu.',4200);sayMe('Chúng sang rồi!',2.6)}}
  else if(M.act===2&&!M.ngu&&M.spawnT<1e8){M.spawnT-=dt;if(M.spawnT<=0){if(M.en.length<raidMax(M))spawnEnemy(false);M.spawnT=raidGap(M.t)}}   // hồi 3 không thêm giặc mới
  if(M.act>=2&&M.burnI<BURN.length&&(M.fireT-=dt)<=0){const id=BURN[M.burnI++],b=BUILDINGS.find(x=>x.id===id);if(b)ignite(b);M.fireT=FIRE_GAP}
  if(M.act===2&&(M.t<=ACT3||(allIn()&&M.T-M.t-M.act2At>=12)))startAct3();
  if(S.nguMet&&!M.horn&&M.t<=NGU_HORN){M.horn=true;toast('Xa xa, phía sông Hồng, có tiếng tù và quân ta vọng lại. Cầm cự thêm chút nữa!',5200)}
  if(!M.ngu&&M.t<=NGU_AT){
    if(S.nguMet){M.ngu=true;M.shake=.6;for(let i=0;i<4;i++)M.al.push({id:'quan'+i,name:i?'Quân Trần':'Phạm Ngũ Lão',x:79+i*.6,y:31.2+(i%2)*.6,look:{id:i?'quan':'ngu_tuong'},hp:99,dmg:3,cd:0,sp:6,inv:0,quan:true,dir:'left',walk:0});
      toast(nguRecall(),5600);
      const ngu=M.al.find(a=>a.id==='quan0');if(ngu)say(ngu,M.boss&&M.boss.cap&&!M.boss.dead?'Bọn tay chân để ta lo. Tên đầu toán là của cậu!':'Giết hết bọn cướp lương!',4.6)}
    else{M.ngu='none';const a=M.al.find(x=>!x.down);if(a)say(a,'Không có ai đến cứu đâu. Chỉ còn chúng ta thôi!',4);else sayMe('Không ai đến cả. Chỉ còn mình mình.',4)}}
  let lead={x:S.x,y:S.y};
  for(const p of M.v){
    if(p.st==='follow'){
      // giặc ở gần (không phải tên đang chạy về) khi bạn đang đánh gần đó: đứng lại, lùi ra xa, không đi thẳng vào giữa trận
      let en=null,ed=1.2;for(const e of M.en)if(!e.dead&&!e.cap&&e.st!=='flee'&&e.st!=='stage'){const q=Math.hypot(e.x-p.x,e.y-p.y);if(q<ed){ed=q;en=e}}
      if(en){const m=Math.min(1.2-ed,2.8*dt);p.moving=true;p.walk+=dt*8;p.dir=dirOf(en.x-p.x,en.y-p.y);
        // lùi theo một trục: ưu tiên trục vừa xa giặc vừa về phía người đi trước (không lùi mãi ra xa đoàn)
        const ax=Math.sign(p.x-en.x)||1,ay=Math.sign(p.y-en.y)||1,opts=[[ax,0],[0,ay]];
        opts.sort((a,b)=>{const g=o=>(o[0]&&o[0]===Math.sign(lead.x-p.x))||(o[1]&&o[1]===Math.sign(lead.y-p.y))?1:0,w=o=>o[0]?Math.abs(p.x-en.x):Math.abs(p.y-en.y);return g(b)-g(a)||w(b)-w(a)});
        for(const [ux,uy] of opts){const nx=p.x+ux*m,ny=p.y+uy*m;if(okAlly(Math.floor(nx),Math.floor(ny))){p.x=nx;p.y=ny;break}}
        lead=p;continue}
      const d=Math.hypot(lead.x-p.x,lead.y-p.y);if(d>.9){followTrail(p,lead,Math.min(d-.85,4.3*(carryWeak()?Math.max(p.slow,1):p.slow)*(followFast()||laiFollow()?1.15:1)*(d>3?1.3:1)*dt));p.moving=true;p.walk+=dt*8}else p.moving=false;lead=p;
      if(inZone(p.x,p.y))reachSafe(p)}
    else if(p.st==='self'){const st=p.dest&&nextStep(p,p.dest[0],p.dest[1],okAlly,M.T-M.t);
      if(st){const [mx,my]=stepTo(p,st,4.3*p.slow*SELF_SPEED*dt,okAlly);p.x+=mx;p.y+=my;p.moving=true;p.walk+=dt*8;p.dir=dirOf(mx,my)}else p.moving=false;
      if(inZone(p.x,p.y))reachSafe(p)}
    else if(p.st==='safe'){const d=Math.hypot(p.spot[0]-p.x,p.spot[1]-p.y);if(d>.1){const [mx,my]=step4(p,p.spot[0],p.spot[1],2*dt);p.x+=mx;p.y+=my;p.moving=true;p.walk+=dt*8;p.dir=dirOf(mx,my)}else{p.moving=false;p.dir='right'}}
    else p.moving=false}
  if(M.carry&&inZone(S.x,S.y)){M.carry.st='safe';M.carry.x=ZONE.x0+1.2+Math.random()*4;M.carry.y=ZONE.y0+1.5+Math.random()*10;M.carry=null;floatText('Đã giấu thóc!','#e2bf72')}
  for(const e of M.en){if(e.dead)continue;
    if(e.boss){bossUpdate(e,dt);continue}
    e.flash=Math.max(0,e.flash-dt);e.stun=Math.max(0,(e.stun||0)-dt);e.swing=Math.max(0,(e.swing||0)-dt);let tx,ty;
    if(e.st==='stage'){ // hồi 1: đứng quanh đống lửa bờ bắc; bạn sang tận nơi thì xông ra. Sang hồi 2 thì lần lượt ào qua cầu.
      if(Math.hypot(S.x-e.x,S.y-e.y)<3||(e.wake!=null&&(e.wake-=dt)<=0)){e.st='hunt';e.tgt=null}else{e.dir='down';e.tgt={x:e.x,y:e.y};continue}}
    if(e.cap||e.st==='flee'){e.st='flee';e.tgt=null;tx=e.home[0];ty=e.home[1]}
    else{let tg=null;
      if(M.decoy&&!inZone(M.decoy.x,M.decoy.y)&&Math.hypot(M.decoy.x-e.x,M.decoy.y-e.y)<11)tg=around(M.decoy,e,1.6,.7);
      else{let best=1e9;for(const p of M.v)if(liveOut(p)){const d=Math.hypot(p.x-e.x,p.y-e.y);if(d<best){best=d;tg=p}}
        // bạn đã vào rừng thì giặc thôi đuổi (giặc không dám theo vào rừng)
        if(!inZone(S.x,S.y)&&(!tg||Math.hypot(S.x-e.x,S.y-e.y)<best*1.2))tg={x:S.x,y:S.y};
        // tên canh con tin (hồi 3) đứng quanh sân đình
        // lính kèm tên đầu toán (hồi 3): vây quanh hắn khi hắn đi bắt người, đứng quanh sân đình khi hắn giữ con tin;
        // bạn tới gần thì xông ra đánh
        if(e.guard&&M.boss&&!M.boss.dead&&Math.hypot(S.x-e.x,S.y-e.y)>3.2)tg=M.boss.st==='hold'?around({x:DINH[0],y:DINH[1]},e,1.6,.25):around(M.boss,e,1.3,.5);
        for(const a of M.al)if(!a.down&&!inZone(a.x,a.y)&&Math.hypot(a.x-e.x,a.y-e.y)<1.2)tg=a}
      if(!tg){ // không còn ai ngoài rừng để đuổi: đi lục lọi trong làng, dừng lại một lúc ở mỗi chỗ
        if(!e.loot)e.loot=pickLoot(e);
        else if(Math.hypot(e.loot[0]-e.x,e.loot[1]-e.y)<.6&&(e.lootT-=dt)<=0)e.loot=pickLoot(e);
        tg=around({x:e.loot[0],y:e.loot[1]},e,.9)}
      else e.loot=null;
      e.tgt=tg;tx=tg.x;ty=tg.y;
      // vây: đuổi bạn hay dân làng thì mỗi tên nhắm một phía (FLANK theo e.side), tới gần mới áp vào, nên không dồn một cục
      // đi cùng một đường; phía ấy là ô cấm hay trong rừng thì đi thẳng tới
      const prey=M.v.includes(tg)||(Math.abs(tg.x-S.x)<1e-6&&Math.abs(tg.y-S.y)<1e-6);
      if(prey){if(e.side==null)e.side=(M.sideN=(M.sideN||0)+1)%FLANK.length;const o=FLANK[e.side];
        if(o&&Math.hypot(tg.x-e.x,tg.y-e.y)>1.7){const fx=tg.x+o[0],fy=tg.y+o[1];if(okEnemy(Math.floor(fx),Math.floor(fy))&&!inZone(fx,fy)){tx=fx;ty=fy}}}}
    // kẹt nhiều lần liền (bị người khác chắn lối hẹp): đi vòng sang một chỗ trống gần đó một lúc rồi mới quay lại đích
    if(e.detour){if((e.detourT-=dt)>0){tx=e.detour[0];ty=e.detour[1]}else e.detour=null}
    const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);
    // đứng giữa ô lửa (lửa bén lên chỗ đang đứng): được bước xuyên lửa ra ngoài, không thì kẹt tới khi lửa tàn
    const okE=fireAt(Math.floor(e.x),Math.floor(e.y))?okEnemyFire:okEnemy;
    if(d>.05){const st=nextStep(e,tx,ty,okE,M.T-M.t);if(st){const [mx,my]=stepTo(e,st,e.sp*dt*(e.st==='flee'?1.15:1)*(wading(e)?.5:1),okE),nx=e.x+mx,ny=e.y+my;if(!(inZone(nx,ny)&&e.st!=='flee')){e.x=nx;e.y=ny}e.walk+=dt*9;if(mx||my)e.dir=dirOf(mx,my)}}
    // kẹt (đứng im lâu mà chưa tới nơi): tìm đường lại; đang đi lục lọi thì đổi chỗ
    // giặc đang rút chạy về thì chờ ít hơn và đi vòng ngay (hai tên rút ngược chiều nhau từng chắn nhau mãi ở lối hẹp)
    const fl=e.st==='flee';
    if(d>1.2&&e.lx!=null&&Math.hypot(e.x-e.lx,e.y-e.ly)<.004){if((e.stuck=(e.stuck||0)+dt)>(fl?.7:1.2)){e.stuck=0;e.path=null;if(e.loot)e.loot=pickLoot(e);if(e.guard)e.guard=false;
      if((e.stuckN=(e.stuckN||0)+1)>=(fl?1:2)){e.stuckN=0;for(let k=0;k<12;k++){const x=Math.floor(e.x)+Math.floor(Math.random()*7)-3,y=Math.floor(e.y)+Math.floor(Math.random()*7)-3;if(okEnemy(x,y)&&!inZone(x+.5,y+.5)){e.detour=[x+.5,y+.5];e.detourT=1.6;e.path=null;break}}}}}   // lính canh kẹt (lửa chặn đường về đình): thôi canh, đi đánhelse e.stuck=0;
    e.lx=e.x;e.ly=e.y;
    if(e.cap){e.cap.x=e.x+.45;e.cap.y=e.y+.15}
    if(e.st==='flee'&&d<.3){e.dead=true;if(e.cap){e.cap.st='lost';toast(e.cap.name+' đã bị giặc bắt đi mất...',4200);e.cap=null}continue}
    if(e.st!=='flee'){
      if(e.stun<=0)for(const p of M.v)if((p.st==='wait'||p.st==='self'||(p.st==='follow'&&e.tgt===p))&&Math.hypot(p.x-e.x,p.y-e.y)<.55){p.st='cap';p.path=null;e.cap=p;e.st='flee';toast(p.name+' bị giặc bắt! Đuổi theo đánh hạ tên lính để cứu.',3800);say(p,'Cứu với!',2.4);break}
      if(!e.cap&&M.inv<=0&&Math.hypot(S.x-e.x,S.y-e.y)<.6){M.hp--;M.inv=HIT_INV;M.shake=Math.max(M.shake,.45);e.swing=.3;e.dir=dirOf(S.x-e.x,S.y-e.y);const [ux,uy]=axisDir(S.x-e.x,S.y-e.y),nx=S.x+ux*.9,ny=S.y+uy*.9;if(canStand(nx,ny)){S.x=nx;S.y=ny}
        if(M.carry){M.carry.st='wait';M.carry.x=S.x;M.carry.y=S.y;M.carry=null;toast('Bạn bị đánh trúng, đánh rơi bao thóc!')}floatText('−1 máu','#e07f6b')}
      for(const a of M.al)if(!a.down&&!a.quan&&a.inv<=0&&Math.hypot(a.x-e.x,a.y-e.y)<.6){a.hp--;a.inv=1;e.swing=.3;e.dir=dirOf(a.x-e.x,a.y-e.y);if(a.hp<=0){a.down=true;toast(a.name+' bị thương nặng, ngã xuống!',3800);if(a.id==='co')say(a,'Đừng... đừng lo cho tớ! Đi đi!',3.6)}}}}
  M.en=M.en.filter(e=>!e.dead);
  separate(M.en);
  for(const a of M.al){if(a.down)continue;a.cd=Math.max(0,a.cd-dt);a.inv=Math.max(0,a.inv-dt);a.slash=Math.max(0,(a.slash||0)-dt);a.swing=Math.max(0,(a.swing||0)-dt);let tg=null,best=a.quan?60:9;
    // quân Phạm Ngũ Lão để tên đầu toán cho bạn; không ai sang bờ bắc đánh toán đứng chờ ở hồi 1
    for(const e of M.en){if(e.st==='stage'||(a.quan&&e.boss))continue;const d=Math.hypot(e.x-a.x,e.y-a.y);if(d<best&&(a.quan||Math.hypot(e.x-42,e.y-44)<15)){best=d;tg=e}}
    // không có giặc: đứng cạnh bạn; chỉ đổi chỗ đứng khi bạn đi xa hơn một ô (bạn nhích qua lại thì đồng minh không rung theo)
    if(!tg){const fx=S.x+(a.id==='co'?-1.3:1.3),fy=S.y+.7;if(!a.fol||Math.hypot(a.fol[0]-fx,a.fol[1]-fy)>1)a.fol=[fx,fy]}
    const tx=tg?tg.x:a.fol[0],ty=tg?tg.y:a.fol[1],dx=tx-a.x,dy=ty-a.y,d=Math.hypot(dx,dy);
    a.moving=false;if(d>(tg?.7:1)){const st=nextStep(a,tx,ty,okAlly,M.T-M.t);if(st){const fin=st[0]===tx&&st[1]===ty,sd=Math.hypot(st[0]-a.x,st[1]-a.y),m=Math.min(sd-(fin?.6:0),a.sp*dt);if(m>0){const [mx,my]=stepTo(a,st,m,okAlly);a.x+=mx;a.y+=my;a.moving=true;a.walk+=dt*9;a.dir=dirOf(mx,my)}}}
    if(tg&&d<1.1&&a.cd<=0){a.cd=(a.quan?.5:(a.id.startsWith('trai')&&(S.flags.doi||0)>=3)?.65:.9)*(a.giao?.67:1);a.slash=.15;a.swing=.24;a.dir=dirOf(dx,dy);hitEnemy(tg,a.dmg,a.x,a.y)}}
  M.en=M.en.filter(e=>!e.dead);
  if(M.hp<=0){const boss=M.boss&&!M.boss.dead&&M.boss.st!=='flee';M.captureHow=boss?'fight':'down';return finishClimax(boss||!M.al.some(a=>!a.down)?'captured':'down')}
  if(M.t<=0)return finishClimax('dawn');
  if(M.act===3&&(!M.boss||M.boss.dead||!M.boss.cap)&&allIn())finishClimax('done');
}
function clTarget(){const M=MG;let best=1.4,t=null;
  const b=M.boss;if(b&&!b.dead&&b.cap&&Math.hypot(b.x-S.x,b.y-S.y)<1.8){const h=b.cap;return{label:`Đổi mình lấy ${lc(h.name)}`,act:()=>{if(b.dead||b.cap!==h)return;showModal({kicker:'Sân đình',title:`Đổi mình lấy ${lc(h.name)}?`,
    body:`<p>Tên đầu toán sẽ thả ${lc(h.name)} chạy vào rừng, còn bạn bị trói giải về trại giặc. Những ai còn ngoài rừng phải tự lo lấy thân.</p>`,
    choices:[{label:'Bước ra, đổi mình',note:'bạn bị bắt',fn:surrender},
      ...(S.path==='van'&&!b.tricked?[{label:'Lừa hắn: hô to quân Trần đã vây kín làng',note:`đường văn · hỏng thì bị bắt (${Math.round(100*trickChance())}% thành)`,fn:()=>trick(b)}]:[]),
      {label:'Chưa, còn đánh được'}]})}}}
  for(const p of M.v)if(p.st==='wait'){const d=Math.hypot(p.x-S.x,p.y-S.y);if(d<best){best=d;t=S.path==='van'||(ducKin()&&['me','cha','thao','sen'].includes(p.id))?{label:'Chỉ đường cho '+p.name+' vào rừng',act:()=>{p.st='self';p.path=null;p.dest=zoneSpot(p);floatAt(p.name+' tự tìm đường vào rừng',p.x,p.y,'#9fcaa9');say(p,leadLine(p))}}
        :{label:'Dẫn '+p.name+' đi',act:()=>{p.st='follow';floatAt(p.name+' đi theo bạn',p.x,p.y,'#9fcaa9');say(p,leadLine(p))}}}}
  if(!M.carry)for(const s of M.sk)if(s.st==='wait'){const d=Math.hypot(s.x-S.x,s.y-S.y);if(d<best){best=d;t={label:'Vác bao thóc',act:()=>{s.st='carry';M.carry=s}}}}
  return t}

/* ---------- vẽ ---------- */
export function torchFx(x,y,big){const sx=Math.round(x*TS),sy=Math.round(y*TS);ctx.fillStyle='#5a3f25';ctx.fillRect(sx*Z-camX,(sy-10)*Z-camY,Z,10*Z);
  const n=big?14:6;for(let i=0;i<n;i++){const ph=(clock*3+i*.29)%1,fx=sx-(big?5:2)+Math.floor(Hs(i,3,9)*(big?10:5)),fy=sy-12-Math.floor(ph*(big?14:7));ctx.fillStyle=ph<.4?'#ffe08a':ph<.7?'#f2913a':'#b8322a';ctx.fillRect(fx*Z-camX,fy*Z-camY,Z*(big?2:1),Z*(big?2:1))}}
/* Lưỡi lửa: chân ở (px, py) tính bằng pixel game, cao h, rộng w; ba lớp đỏ, cam, vàng thuôn dần lên, lay động. */
export function tongue(px,py,h,w,ph){const f=Math.max(3,Math.round(h*(.78+.22*Math.sin(clock*9+ph)))),
  layer=(ww,hh,col)=>{ctx.fillStyle=col;for(let y=0;y<hh;y++){const k=1-y/hh,half=Math.max(1,Math.round(ww/2*Math.sqrt(k))),sway=Math.round(Math.sin(clock*7+ph+y*.45)*(1-k)*2);ctx.fillRect((px-half+sway)*Z-camX,(py-y-1)*Z-camY,half*2*Z,Z)}};
  layer(w,f,'#b8322a');layer(w-2,Math.round(f*.72),'#f2913a');layer(Math.max(2,w-4),Math.round(f*.42),'#ffe08a')}
/* Bóng sạm đúng hình ngôi nhà (không phủ ra khoảng trống quanh nhà). */
const charC={};
export function charred(b,c){if(charC[b.id])return charC[b.id];const d=document.createElement('canvas');d.width=c.width;d.height=c.height;const g=d.getContext('2d');
  g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='#1a0d08';g.fillRect(0,0,d.width,d.height);return charC[b.id]=d}
/* Khói xám bốc lên, trôi sang bên (vẽ trước lớp bóng đêm nên chỉ thấy quanh chỗ sáng). */
export function smoke(px,py,seed,n=8){for(let i=0;i<n;i++){const ph=(clock*.28+Hs(i,seed,7))%1,x=px+Math.round(Math.sin(clock*.8+i)*3+ph*8+(Hs(i,seed,3)-.5)*8),y=py-Math.round(ph*40),r=1+Math.round(ph*2);
  ctx.fillStyle=`rgba(58,54,52,${.42*(1-ph)})`;ctx.fillRect((x-r)*Z-camX,(y-r)*Z-camY,r*2*Z,r*2*Z)}}
/* Lửa trên ô đất trước cửa nhà cháy. */
function groundFire(x,y,i){const px=x*TS,py=(y+1)*TS-2;ctx.fillStyle='rgba(60,20,10,.55)';ctx.fillRect(px*Z-camX,(py-3)*Z-camY,TS*Z,4*Z);
  tongue(px+4,py,9,6,i);tongue(px+11,py,12,7,i+2);tongue(px+8,py-1,7,4,i+5)}
function slashFx(x,y,dir){const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir],cx=Math.round((x+v[0]*.8)*TS),cy=Math.round((y-.5+v[1]*.7)*TS);ctx.fillStyle='rgba(255,255,240,.85)';
  for(let i=-4;i<=4;i++){const px=v[0]?cx+v[0]*Math.round(4-Math.abs(i)*.6):cx+i*2,py=v[1]?cy+v[1]*Math.round(4-Math.abs(i)*.6):cy+i*2;ctx.fillRect(px*Z-camX,py*Z-camY,Z*2,Z*2)}}
const enLook=e=>({id:e.boss?'giac_dau':e.ky?'giac_ky':'giac'});
/* khung vẽ: đang chém thì vung lên rồi chém xuống (swing đếm ngược), không thì bước đi */
const swingFr=(o,t)=>o.swing>t?'a0':'a1';
function clDraw(list){const M=MG,fr=o=>o.swing>0?swingFr(o,.17):o.moving?[1,0,2,0][Math.floor(o.walk)%4]:0,now=M.T-M.t;
  for(const f of FIRES)list.push({y:f[1],f:()=>torchFx(f[0],f[1],true)});
  for(const t of [[ZONE.x0+.5,ZONE.y0+.5],[ZONE.x1+.5,ZONE.y0+.5],[ZONE.x0+.5,ZONE.y1+.5],[ZONE.x1+.5,ZONE.y1+.5],[ZONE.x1+.5,(ZONE.y0+ZONE.y1)/2]])list.push({y:t[1],f:()=>torchFx(t[0],t[1])});
  // nhà cháy: mái sạm dần, lửa trên mái và trước cửa
  for(const {b,at} of M.burn){const k=Math.min(1,(now-at)/14),c=buildingSprite(b),top=b.y*TS-c.oy,roof=top+Math.round(c.height*.42);list.push({y:b.y+b.h+.02,f:()=>{
      ctx.globalAlpha=.6*k;ctx.drawImage(charred(b,c),(b.x*TS-c.ox)*Z-camX,top*Z-camY,c.width*Z,c.height*Z);ctx.globalAlpha=1;   // mái, vách sạm dần
      for(let x=0;x<b.w;x++){const px=b.x*TS+x*TS+8;smoke(px,roof-14,x+b.x*3,10);tongue(px,roof,14+Math.round(10*k),12,x*1.7+b.x);if(k>.4)tongue(px-5,roof+10,9,8,x+3)}
      for(let x=0;x<b.w;x+=2)tongue(b.x*TS+x*TS+10,(b.y+b.h)*TS-4,8,7,x+b.y)}})}
  for(const [i,exp] of M.fire)if(exp>now){const x=i%W,y=(i/W)|0;list.push({y:y+.95,f:()=>groundFire(x,y,i)})}
  for(const s of M.sk)if(s.st!=='carry')list.push({y:s.y,f:()=>{drawSprite(sackSprite(),s.x,s.y);if(s.st==='wait')mark(s.x,s.y-.9,'#e2bf72')}});
  for(const p of M.v){if(p.st==='lost')continue;list.push({y:p.y,f:()=>{shadow(p.x,p.y,10);drawSprite(personSprite(p.look,p.dir,fr(p)),p.x,p.y);if(p.st==='wait')mark(p.x,p.y-(isKid(p.look)?1.6:2.1),'#e2bf72');if(p.st==='cap'||p.st==='hostage')mark(p.x,p.y-1.75,'#e07f6b')},lab:p.st!=='safe'&&p.st!=='hostage'&&Math.hypot(p.x-S.x,p.y-S.y)<4?[p.name,p.x,p.y-(isKid(p.look)?1.55:2)]:null})}
  for(const e of M.en)list.push({y:e.y,f:()=>{if(e.boss){ctx.fillStyle='rgba(184,50,42,.35)';const sx=Math.round(e.x*TS),sy=Math.round(e.y*TS);ctx.fillRect((sx-8)*Z-camX,(sy-1)*Z-camY,16*Z,3*Z)}
      shadow(e.x,e.y,e.boss?14:10);if(e.flash>0)ctx.globalAlpha=.45;drawSprite(personSprite(enLook(e),e.dir,e.swing>0?swingFr(e,.2):[1,0,2,0][Math.floor(e.walk)%4]),e.x,e.y);ctx.globalAlpha=1},
    lab:e.boss&&Math.hypot(e.x-S.x,e.y-S.y)<7?['Tên đầu toán',e.x,e.y-2.05]:null});
  for(const a of M.al)list.push({y:a.y,f:()=>{shadow(a.x,a.y,10);if(a.down)ctx.globalAlpha=.5;drawSprite(personSprite(a.look,a.down?'down':a.dir,a.down?0:fr(a)),a.x,a.y);ctx.globalAlpha=1;if(a.slash>0)slashFx(a.x,a.y,a.dir)},lab:Math.hypot(a.x-S.x,a.y-S.y)<4?[a.name+(a.down?' (bị thương)':''),a.x,a.y-2]:null});
  if(M.carry)list.push({y:S.y+.01,f:()=>drawSprite(sackSprite(),S.x,S.y-1.55)});
  if(M.decoy)list.push({y:M.decoy.y,f:()=>torchFx(M.decoy.x,M.decoy.y,true)});
  if(M.slash>0)list.push({y:S.y+.02,f:()=>slashFx(S.x,S.y,P.dir)});
  list.push({y:ZONE.y0,f:()=>{},lab:Math.hypot(ZONE.x1-S.x,ZONE.y0+5-S.y)<9?['Bìa rừng · nơi an toàn',(ZONE.x0+ZONE.x1+1)/2,ZONE.y0-.2]:null});
}
let darkC=null;
function nightPost(){const M=MG;if(!darkC)darkC=document.createElement('canvas');if(darkC.width!==VW||darkC.height!==VH){darkC.width=VW;darkC.height=VH}
  const g=darkC.getContext('2d'),k=Math.min(1,M.t/25),now=M.T-M.t;g.globalCompositeOperation='source-over';g.clearRect(0,0,VW,VH);g.fillStyle=`rgba(8,12,32,${.74*k+.08})`;g.fillRect(0,0,VW,VH);
  g.globalCompositeOperation='destination-out';
  const hole=(x,y,r)=>{const sx=x*T-camX,sy=(y-.7)*T-camY;if(sx<-r||sy<-r||sx>VW+r||sy>VH+r)return;const gr=g.createRadialGradient(sx,sy,r*.2,sx,sy,r);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(sx-r,sy-r,r*2,r*2)};
  hole(S.x,S.y,240);for(const f of FIRES)hole(f[0],f[1],200);hole(ZONE.x0+.5,ZONE.y0+.5,110);hole(ZONE.x1+.5,ZONE.y0+.5,110);hole(ZONE.x0+.5,ZONE.y1+.5,110);hole(ZONE.x1+.5,ZONE.y1+.5,110);hole(ZONE.x1+.5,(ZONE.y0+ZONE.y1)/2,110);if(M.decoy)hole(M.decoy.x,M.decoy.y,220);
  for(const {b} of M.burn)hole(b.x+b.w/2,b.y+b.h/2,260);
  if(M.boss&&!M.boss.dead)hole(M.boss.x,M.boss.y,120);
  g.globalCompositeOperation='source-over';ctx.drawImage(darkC,0,0,VW,VH);
  // ánh lửa cam phủ lên làng khi nhà cháy
  if(M.burn.length){ctx.fillStyle=`rgba(255,110,40,${Math.min(.12,.02*M.burn.length)})`;ctx.fillRect(0,0,VW,VH)}
  // tàn lửa bay lên từ nhà cháy
  if(!reduce)for(const {b,at} of M.burn)for(let i=0;i<14;i++){const ph=((now-at)*.35+Hs(i,b.x,3))%1,x=(b.x+Hs(i,b.y,5)*b.w+Math.sin(clock*1.7+i)*.6)*T-camX,y=(b.y+.2-ph*5)*T-camY;
    ctx.fillStyle=`rgba(255,${150+Math.floor(80*(1-ph))},60,${1-ph})`;ctx.fillRect(Math.round(x/Z)*Z,Math.round(y/Z)*Z,Z,Z)}
  if(M.t<25){ctx.fillStyle=`rgba(255,165,110,${.14*(1-k)})`;ctx.fillRect(0,0,VW,VH)}
  // sắp hết máu: viền đỏ
  if(M.hp<=2){const a=(M.hp<=1?.5:.3)*(.75+.25*Math.sin(clock*6)),gr=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.35,VW/2,VH/2,Math.max(VW,VH)*.7);gr.addColorStop(0,'rgba(160,20,20,0)');gr.addColorStop(1,`rgba(160,20,20,${a})`);ctx.fillStyle=gr;ctx.fillRect(0,0,VW,VH)}}
/* Bong bóng lời nói, vẽ trên lớp bóng đêm. */
function bubbles(){if(MG.banner)return;drawBubbles(MG.bub)}
/* lời nói trên đầu người: bub = [{o (người, có x, y, look; o.me là bạn), text, t (giây còn lại)}]; tập trận 1283 dùng chung */
export function drawBubbles(bub,top=90){ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';
  for(const b of bub){const o=b.o.me?{x:S.x,y:S.y}:b.o,kid=!b.o.me&&isKid(b.o.look);const words=b.text.split(' '),lines=[];let cur='';
    for(const w of words){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>210&&cur){lines.push(cur);cur=w}else cur=t}if(cur)lines.push(cur);
    const w=Math.ceil(Math.max(...lines.map(l=>ctx.measureText(l).width)))+16,h=lines.length*16+10;
    let x=Math.round(o.x*T-camX-w/2),y=Math.round((o.y-(kid?1.9:2.45))*T-camY-h);x=Math.max(8,Math.min(VW-w-8,x));y=Math.max(top,y);
    ctx.globalAlpha=Math.min(1,b.t*3);ctx.fillStyle='#0b0d0c';ctx.fillRect(x-2,y-2,w+4,h+4);ctx.fillStyle='#efe8d4';ctx.fillRect(x,y,w,h);
    const tx=Math.max(x+8,Math.min(x+w-14,Math.round(o.x*T-camX)-3));ctx.fillStyle='#0b0d0c';ctx.fillRect(tx-2,y+h,10,4);ctx.fillStyle='#efe8d4';ctx.fillRect(tx,y+h,6,3);
    ctx.fillStyle='#1d221f';ctx.textAlign='left';lines.forEach((l,i)=>ctx.fillText(l,x+8,y+13+i*16));ctx.globalAlpha=1}}
function clHud(){const M=MG,w=Math.min(460,VW-32),x=Math.round(VW/2-w/2);
  bubbles();
  if(M.banner){const bn=M.banner,a=Math.min(1,bn.t*1.5,(3.4-bn.t)*3),y=Math.round(VH*.3);ctx.globalAlpha=Math.max(0,a);ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle='rgba(11,13,12,.72)';ctx.fillRect(0,y-46,VW,92);ctx.font='500 14px "Alegreya SC", Georgia, serif';ctx.fillStyle='#e2bf72';ctx.fillText(['','HỒI MỘT','HỒI HAI','HỒI BA'][bn.act],VW/2,y-20);
    ctx.font='700 34px "Alegreya SC", Georgia, serif';ctx.fillStyle='#efe8d4';ctx.fillText(ACTS[bn.act],VW/2,y+12);ctx.globalAlpha=1}
  hudBox(x,16,w,64);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#e2bf72';const lab=`Hồi ${M.act} · ${ACTS[M.act]}`+(M.act===1&&M.en.length?` · giặc tụ ${M.en.length}`:''),lw=Math.ceil(ctx.measureText(lab).width)+24;ctx.fillText(lab,x+12,32);hudBar(x+lw,26,w-lw-12,M.t/M.T,'#d08a54');
  for(let i=0;i<M.maxhp;i++){ctx.fillStyle=i<M.hp?'#e07f6b':'#3b443d';ctx.fillRect(x+12+i*16,50,12,12)}
  const sv=M.v.filter(p=>p.st==='safe').length,ss=M.sk.filter(s=>s.st==='safe').length;
  ctx.fillStyle='#efe8d4';ctx.textAlign='right';ctx.fillText(`Người an toàn ${sv}/${M.v.length} · Thóc ${ss}/${M.sk.length}${MG.decoys?` · Đuốc ${MG.decoys}`:''}`,x+w-12,56);
  // máu tên đầu toán
  const b=M.boss;if(b&&!b.dead&&Math.hypot(b.x-S.x,b.y-S.y)<9){const bw=Math.min(300,VW-40),bx=Math.round(VW/2-bw/2),by=VH-200;hudBox(bx,by,bw,26);ctx.fillStyle='#e07f6b';ctx.textAlign='left';ctx.fillText('Tên đầu toán',bx+10,by+13);hudBar(bx+104,by+7,bw-114,b.hp/b.maxhp,'#b8322a')}}

/* Bản đồ nhỏ trong đêm 1285 (gọi từ render.js drawMini): nhà cháy, người còn chờ, giặc (cả toán tụ ở bờ bắc), tên đầu toán. */
function clMini(m){const M=MG,dot=(x,y,r,col)=>{m.fillStyle=col;m.fillRect(Math.round(x*2-r),Math.round(y*2-r),r*2,r*2)};
  for(const {b} of M.burn){m.fillStyle=Math.floor(clock*4)%2?'#ff9a3a':'#e0502a';m.fillRect(b.x*2,b.y*2,b.w*2,b.h*2)}
  for(const p of M.v)if(p.st==='wait'||p.st==='hostage'||p.st==='cap')dot(p.x,p.y,2,p.st==='wait'?'#e2bf72':'#ff6b5a');
  for(const s2 of M.sk)if(s2.st==='wait')dot(s2.x,s2.y,1,'#e2bf72');
  for(const e of M.en)if(!e.dead)dot(e.x,e.y,e.boss?3:1.5,e.boss?'#ff2a2a':e.st==='stage'?'#a83a32':'#e0402a');
  m.strokeStyle='#9fcaa9';m.strokeRect(ZONE.x0*2+.5,ZONE.y0*2+.5,(ZONE.x1-ZONE.x0+1)*2,(ZONE.y1-ZONE.y0+1)*2)}

/* ---------- kết thúc đêm ---------- */
export function finishClimax(reason){const M=MG;setMG(null);setKeys();document.body.classList.remove('mg');S.pending=null;$('toast').hidden=true;
  const allyUp=M.al.some(a=>!a.down),captured=reason==='captured'||reason==='surrender',hostage=M.boss&&!M.boss.dead&&M.boss.cap;
  /* Bị bắt mà chưa cứu lại thì mất; con tin trong tay tên đầu toán lúc trời sáng thì bị bắt đi. Đổi mình lấy
     con tin thì người ấy được thả, chạy vào rừng. Người đang đi theo bạn lúc bạn ngã xuống, không ai đỡ, thì bị bắt.
     Người chưa dẫn hoặc đang tự đi thì kẹt lại trong làng: thoát nạn nhưng nhà cửa bị đốt. */
  for(const p of M.v){
    if(reason==='surrender'&&p===M.surrenderFor)p.st='safe';
    else if(p.st==='cap'||p.st==='hostage')p.st='lost';
    else if(p.st==='follow')p.st=reason==='captured'||(reason==='down'&&!allyUp)?'lost':'left';
    else if(p.st==='wait'||p.st==='self')p.st='left'}
  const ti=M.v.find(p=>p.id==='ti');
  const res={reason,captured,saved:M.v.filter(p=>p.st==='safe').map(p=>p.name),left:M.v.filter(p=>p.st==='left').map(p=>p.name),lost:M.v.filter(p=>p.st==='lost').map(p=>p.name),
    thoc:M.sk.filter(s=>s.st==='safe').length,thocT:M.sk.length,kills:M.kills,coDown:M.al.some(a=>a.id==='co'&&a.down),coThere:M.al.some(a=>a.id==='co'),nLang:M.nLang,ngu:M.ngu===true,
    boss:M.bossOut||(reason==='surrender'?'surrender':hostage?'took':M.boss?'alive':null),hostage:reason==='surrender'?M.surrenderFor.name:hostage?hostage.name:null,ti:ti?ti.st:null};
  S.res=res;
  if(captured)S.capt={how:reason==='surrender'?'surrender':M.captureHow||'down',for:reason==='surrender'?M.surrenderFor.name:null};
  res.how=S.capt&&captured?S.capt.how:null;res.burnt=M.burn.map(x=>x.b.id);res.lostWho=M.v.filter(p=>p.st==='lost').map(p=>({id:p.id,name:p.name,look:p.look}));
  const rescuer=M.ngu===true?'quân của Phạm Ngũ Lão':M.al.some(a=>a.id==='co'&&!a.down)?'Cò':allyUp?'trai làng':'mấy người làng liều mình quay lại';
  const lead={down:`<p>Một nhát giáo sượt qua, bạn ngã xuống bờ ruộng. Lúc mở mắt ra, ${rescuer} đã kéo bạn vào bìa rừng.</p>`,
    captured:{fight:'<p>Đao tên đầu toán quật ngang, bạn ngã sấp giữa sân đình. Hắn đặt chân lên lưng bạn, quát lính trói lại. Lúc tỉnh hẳn, tay bạn đã bị trói giật cánh khuỷu.</p>',
      trick:'<p>Tên đầu toán bật cười: hắn đã nghe tiếng tù và của quân mình gọi rút, biết chẳng có quân Trần nào vây làng. Hắn quát lính quật bạn xuống, trói giật cánh khuỷu.</p>',
      down:'<p>Một nhát giáo sượt qua, bạn ngã xuống bờ ruộng. Quanh bạn không còn ai đứng dậy được. Lúc tỉnh lại, tay bạn đã bị trói giật cánh khuỷu, sợi thừng buộc vào yên ngựa giặc.</p>'}[M.captureHow||'down'],
    surrender:`<p>Bạn ném gậy xuống đất, bước ra giữa sân đình. Tên đầu toán cười khẩy, đẩy ${lc(res.hostage)} về phía bìa rừng rồi quăng thừng trói bạn lại. ${res.hostage} ngoái lại nhìn bạn rồi chạy vào rừng.</p>`,
    dawn:'<p>Trời hửng sáng. Tiếng tù và của giặc vang lên gọi quân rút về phía bến sông.</p>',
    done:res.lost.length?`<p>Những người còn lại đã vào rừng, bao thóc cuối cùng đã giấu kỹ. Bạn đứng ở bìa rừng, nhìn về phía làng đang cháy, nghĩ đến ${names(res.lost)} đã bị giặc bắt đi.</p>`:'<p>Người cuối cùng đã vào rừng, bao thóc cuối cùng đã giấu kỹ. Bạn đứng ở bìa rừng, nhìn về phía làng đang cháy.</p>'}[reason];
  const bossLine=res.boss==='killed'?'<p>Tên đầu toán nằm lại giữa sân đình.</p>':res.boss==='tricked'?'<p>Tên đầu toán bị lừa, bỏ chạy về phía bến sông.</p>':res.boss==='took'?`<p>Tên đầu toán giải ${lc(res.hostage)} đi theo đoàn giặc rút về bến sông.</p>`:'';
  const title={done:res.lost.length?'Rút vào rừng':'Không bỏ lại ai',down:'Ngã xuống',captured:'Bị bắt',surrender:'Đổi mình',dawn:'Bình minh'}[reason];
  showModal({kicker:reason==='down'||captured?'Đêm ngày 12 tháng giêng':'Rạng sáng ngày 13 tháng giêng',title,body:lead+bossLine+
    `<p><b>An toàn trong rừng:</b> ${names(res.saved)||'không ai'}.</p>${res.left.length?`<p><b>Kẹt lại trong làng</b> (thoát nạn nhưng nhà cửa bị đốt): ${names(res.left)}.</p>`:''}${res.lost.length?`<p><b>Bị giặc bắt đi:</b> ${names(res.lost)}.</p>`:''}<p>Thóc giấu được ${res.thoc}/${res.thocT} bao. ${res.kills?`Bạn và mọi người đánh hạ ${res.kills} tên giặc.`:'Không hạ được tên giặc nào.'}${res.coDown?' Cò bị thương nặng nhưng còn sống.':''}</p>`,
    choices:[captured?{label:'Bị giải về trại giặc',fn:()=>startEscort(res)}:{label:'Nhìn lại cuộc đời',fn:()=>endChapter(res)}]});
  save()}

export function endChapter(res){
  res=res||S.res||{saved:[],left:[],lost:[],thoc:0,thocT:4,kills:0};
  S.ended=true;save();const F=S.flags,L=[];
  L.push({but:'Năm một tuổi, bạn bốc cây bút lông.',kiem:'Năm một tuổi, bạn bốc thanh kiếm gỗ.',lua:'Năm một tuổi, bạn bốc bông lúa.',hat:'Năm một tuổi, bạn bốc chuỗi tràng hạt.'}[S.toi]||'');
  if(F.dieu)L.push(F.dieu==='di'?'Năm 8 tuổi trốn học thả diều với Cò, bị mẹ phạt quỳ, đổi lại một người bạn thân.':'Năm 8 tuổi ở lại học bài, Cò giận mất mấy hôm.');
  L.push(F.de==='saved'?'Năm nước to 1270, bạn cùng trai làng giữ được đê. Làng nhớ ơn đến tận bây giờ.':F.de==='lost'?'Năm nước to 1270, bạn ra đê nhưng không giữ nổi. Cả làng mất mùa.':F.de==='home'?'Năm nước to 1270, bạn ở nhà giữ đồ đạc, để mặc đê làng vỡ.':'');
  if(S.path==='van')L.push(F.exam==='pass'||F.exam==='khoe'?`Năm 1275 đỗ Thái học sinh${F.exam==='khoe'?', nhưng để bạn cũ đứng ngoài ngõ':''}.`:'Năm 1275 lều chõng đi thi nhưng không đỗ.');
  if(S.path==='vo')L.push(F.train==='top'?'Năm 1283 đứng đầu buổi tập trận'+(F.nguKnows?', được Phạm Ngũ Lão nhớ mặt.':'.'):F.train==='ok'?'Năm 1283 tập trận đạt yêu cầu.':'Năm 1283 tập trận còn vụng về.');
  if(S.ev.thao)L.push(S.thao==='wife'?`Bạn cưới Thảo${S.child?', có bé Sen':''}${F.vay?', nhà phải vay tiền làm sính lễ':''}.`:S.thao==='co'?(F.rival?'Bạn nói lời thương nhưng Thảo chọn Cò.':'Bạn nhường Thảo cho Cò'+(F.cuoiCo==='vang'?', rồi không đến dự đám cưới.':', và làm phù rể cho bạn mình.')):'Thảo theo chồng về làng bên, không ai giữ lại.');
  if(F.daumua)L.push(F.daumua==='mat'?'Năm dịch đậu mùa, bạn mải lo việc riêng. Cha mất cuối xuân Mậu Dần.':F.daumua==='cham'?'Năm dịch đậu mùa, bạn bỏ hết mọi việc ở nhà chăm cha. Cha qua khỏi.':F.daumua==='nam'?'Năm dịch đậu mùa, bạn tự sắc thuốc nam chữa cho cha. Cha qua khỏi, hàng xóm học cách sắc thuốc của bạn.':F.daumua==='muon'?'Năm dịch đậu mùa, thuốc về chậm. Cha qua khỏi nhưng yếu hẳn, đêm giặc đến đi không nhanh được.':F.daumua==='matcuu'?'Năm dịch đậu mùa, bạn chạy ngược chạy xuôi hái thuốc mà không kịp. Cha mất cuối xuân Mậu Dần.':'Năm dịch đậu mùa, bạn lên kinh mua thuốc cứu được cha.');
  if(F.dichGiup)L.push('Năm dịch, bạn nhường một thang thuốc cứu đứa nhỏ nhà chị Lụa bên cạnh.');
  if(F.tang)L.push(F.tang==='lo'?'Thầy đồ Chu mất, bạn đứng ra lo tang cho thầy.':'Thầy đồ Chu mất, bạn chỉ gửi chút tiền phúng viếng.');
  if(S.co==='army')L.push('Bạn tiễn Cò theo cờ "Phá cường địch, báo hoàng ân" của Hoài Văn hầu.');else if(F.coStay)L.push('Bạn khuyên Cò ở lại giữ làng'+(res.coThere?', và đêm ấy Cò đứng cạnh bạn.':'.'));
  if(F.tolich)L.push(F.tolich==='done'?'Bạn cùng làng vét sông Tô Lịch. Đêm giặc đến, chúng chỉ qua được bằng hai cây cầu.':'Bạn không ra vét sông Tô Lịch. Đêm giặc đến, chúng lội qua được chỗ sông nông.');
  if(F.duyet&&F.duyet!=='the')L.push(F.duyet==='luong'?'Bạn góp lương cho quân của Hưng Đạo Vương.':'Bạn giữ thóc cho nhà, đêm giặc đến có thêm một bao phải cứu.');
  if(F.dh)L.push(F.dh==='danh'?'Trước Diên Hồng, bạn nói "Đánh!".':'Trước Diên Hồng, bạn nói "nên hòa". Trai làng nhớ câu ấy.');
  L.push(...careerChronicle());
  L.push(...midChronicle());
  L.push(...prepChronicle(res.nLang||0));
  L.push(...exploreChronicle());
  L.push(...chainChronicle());
  if(F.don)L.push('Bạn viết đơn cho làng xin quan trên giảm sưu thuế năm mất mùa.');
  if((F.doi||0)>=3)L.push('Bạn luyện trai làng thành đội, đêm giặc đến họ đánh theo hiệu lệnh.');
  L.push(S.tieng>=60?'Cả làng nể bạn. Đêm giặc đến, trai làng theo bạn đông nhất.':S.tieng>=20?'Làng quý bạn. Có việc, người ta sẵn lòng theo.':'Làng ít ai nghe bạn. Đêm giặc đến, bạn phải tự xoay xở nhiều.');
  L.push(soulChronicle());
  L.push(ngheChronicle());
  L.push(S.the>=75?'Bạn khỏe mạnh, mỗi mùa làm được nhiều việc hơn người.':S.the<40?'Những năm thức khuya, đói kém làm bạn gầy yếu đi.':'');
  if(S.nguMet)L.push(nguChronicle());
  // đêm tháng giêng: tên đầu toán, cu Tí, bị bắt
  if(res.boss==='killed')L.push('Đêm giặc đến, bạn hạ tên đầu toán giữa sân đình.');
  else if(res.boss==='took')L.push(`Đêm giặc đến, tên đầu toán giải ${lc(res.hostage)} đi lúc trời sáng.`);
  else if(res.boss==='surrender')L.push(`Đêm giặc đến, bạn bước ra sân đình, đổi mình lấy ${lc(res.hostage)}.`);
  else if(res.boss==='tricked')L.push('Đêm giặc đến, bạn hô to quân Trần đã vây làng. Tên đầu toán tin thật, bỏ con tin mà chạy.');
  else if(res.boss==='alive')L.push('Đêm giặc đến, bạn đưa được mọi người vào rừng trước khi tên đầu toán kịp bắt ai.');
  if(res.ti)L.push(res.ti==='safe'?'Bạn cứu được cu Tí nhà bên khỏi xóm cháy.':res.ti==='lost'?'Cu Tí nhà bên bị giặc bắt đi.':'Cu Tí nhà bên kẹt lại trong xóm cháy, sáng ra mới được người làng tìm thấy.');
  if(res.reason==='captured')L.push({fight:'Bạn đánh nhau với tên đầu toán giữa sân đình, thua, bị hắn trói giải đi.',trick:'Bạn hô quân Trần đã vây làng, nhưng tên đầu toán không tin. Hắn trói bạn giải đi.'}[res.how]||'Bạn ngã xuống mà không còn ai đỡ, bị giặc trói giải đi.');
  if(S.capt){if(S.capt.shield)L.push('Trong trại giặc, bạn bước lên nhận đòn thay người làng bên có chữ "Sát Thát" trên tay.');if(S.capt.trust)L.push('Những người bị bắt cùng tin bạn. Có chuyện gì, họ nhìn bạn mà làm theo.');
    if(S.capt.river)L.push('Lúc bị giải qua sông, bạn ghi nhớ con nước, hướng thuyền.');if(S.capt.horse)L.push('Nhìn bãi ngựa trong trại, bạn ước được quân số kỵ binh giặc.')}
  if(S.capt)L.push(S.capt.seen?'Trong trại giặc, bạn gọi tên mình cho sứ giả Đỗ Khắc Chung nghe.':S.capt.map?'Trong trại giặc, bạn lặng lẽ ghi nhớ từng đống lửa, từng lối đi.':'');
  const path=res.captured?'Rạng sáng ngày 13, đoàn giặc lùa những người bị bắt ra bãi sông. Bạn đi giữa họ, hai tay bị trói, ngoái nhìn khói làng An Phú bốc lên phía tây.':
    {van:S.dothi?'Là Thái học sinh, bạn được giao việc thảo văn thư, theo xa giá triều đình rời Thăng Long khi giặc áp sát.':'Không đỗ đạt, bạn ở lại làng dạy chữ cho trẻ. Khi giặc áp sát, bạn giúp các bô lão chép sổ đinh, đưa dân đi lánh nạn.',
    vo:'Như các quân sĩ khác, trên cánh tay bạn thích hai chữ <b>Sát Thát</b> bằng mực. Bạn theo cờ Hưng Đạo Vương ra trận'+(F.nguKnows?', vào đội quân của Phạm Ngũ Lão.':'.'),
    nong:'Bạn dẫn dân làng vào rừng dựng lán, cất giấu lương thực. Giặc đến chỉ thấy làng không.'}[S.path||'nong'];
  const hook=res.captured?`Chương hai bắt đầu trong doanh trại giặc ở Gia Lâm: sống sót, tìm đường trốn thoát và đem tin về cho quân ta${res.lost.length?`; ${names(res.lost)} cũng đang trong tay giặc`:''}.`
    :res.lost.length?`Chương hai: ${names(res.lost)} đang trong tay giặc. Bạn phải tìm cách cứu ${res.lost.length>1?'họ':'người ấy'}, trong khi cuộc kháng chiến dẫn tới trận Bạch Đằng năm 1288.`:'Chương hai: cuộc kháng chiến, dẫn tới trận Bạch Đằng năm 1288.';
  showModal({kicker:'Xuân · Ất Dậu 1285',title:'Hết chương một',
    body:`<p>${path}</p><p class="kicker" style="margin-top:6px">Biên niên đời bạn</p><ul style="margin:0;padding-left:18px;display:grid;gap:4px;line-height:1.5">${L.filter(Boolean).map(x=>`<li>${x}</li>`).join('')}</ul>${(()=>{const t=lifeChronicle();return t.length?`<p class="kicker" style="margin-top:6px">Những chuyện nhỏ</p><ul class="note" style="margin:0;padding-left:18px;display:grid;gap:2px;line-height:1.5">${t.map(x=>`<li>${x[0].toUpperCase()+x.slice(1)}.</li>`).join('')}</ul>`:''})()}
     <div class="endstats"><div><b>${S.van}</b><span>Văn</span></div><div><b>${S.vo}</b><span>Võ</span></div><div><b>${S.duc}</b><span>Đức</span></div><div><b>${S.tieng}</b><span>Tiếng</span></div><div><b>${S.tien}</b><span>quan</span></div></div>
     <p class="note">${S.name}, 27 tuổi.</p><p><span class="seal">Hết chương một</span>&nbsp; ${hook}</p>`,
    choices:[{label:'Bắt đầu một cuộc đời mới',fn:()=>{try{localStorage.removeItem('dvmd-save')}catch(e){}location.reload();return false}}]});
}
