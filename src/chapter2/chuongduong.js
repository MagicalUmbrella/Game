/* ================= chương hai · trận Chương Dương (tháng 5 năm 1285) ================= */
/* Toàn thư (mục tháng 5 năm 1285): Quang Khải, Quốc Toản, Trần Thông, Nguyễn Khả Lạp, Nguyễn Truyền đem dân binh các lộ
   đánh bại giặc ở Kinh Thành, Chương Dương; Thoát Hoan, A Lạt chạy qua sông Lô. Mọi việc của bạn, đội ông Đoàn, trai làng,
   bố cục bãi đánh là hư cấu (cách A ở docs/chuong2.md: công của bạn đứng cạnh công các tướng, không thay).
   MG 'cd' vẽ bãi riêng (chientruong.js) qua MG.render. Bốn nhịp, mỗi nhịp có hạn giờ nên đứng yên trận vẫn tới kết:
   - dem: đêm, giữ W chèo, A D lái thuyền dẫn đầu; cả đoàn chèo theo bạn. Thuyền canh giặc có đèn (CD.DET_R); trong vùng đèn
     thì thanh "bị lộ" đầy dần. Lộ (lo) thì giặc bắn tên vào đoàn thuyền, chiến tuyến giặc mạnh hơn. Quá CD.NIGHT_T thì trời rạng (cham).
   - giu: lên bến, đứng trong vòng bến (CD.HOLD_R) mà giặc trong vòng không quá 2 tên thì giữ được dần (CD.HOLD_T giây);
     đủ thì đợt thuyền sau cập bến. Quá CD.HOLD_MAX thì đợt sau phải đổ bộ dưới mưa tên (late).
   - canh: cánh trái (CD.SECTOR) sắp vỡ. Bạn đứng trong khúc ấy thì khối ta ở đó mạnh lên, khối giặc yếu đi. Hết khối giặc ở khúc
     ấy, hoặc trụ đủ CD.CANH_T giây, là giữ được; hai khối ta ở khúc ấy vỡ trước là vỡ (thêm người ngã; Cò theo quân Quốc Toản đứng ở khúc ấy thì ngã).
   - co: lên gò, giữ E CD.FLAG giây để cắm cờ. Quá CD.CO_T thì người khác cắm trước.
   Trai làng theo bạn (S.c2.men) đi cạnh bạn, có thể ngã; tên người ngã ghi vào biên niên. Kết quả S.c2.cd. */
import * as st from '../state.js';
import {S,save,setMG} from '../state.js';
import {gain,setKeys,showModal} from '../ui.js';
import {DPR,VW} from '../render.js';
import {ctx} from '../constants.js';
import {keys} from '../input.js';
import {hudBar,hudBox} from '../minigames/flood.js';
import {gainThe,theHp,voDmg,voHp} from '../stats.js';
import {CT,addNear,blocksNear,darkness,dirTo,drawField,drawLabels,dust,edgeArrow,fieldMini,killMan,laneX,mkBlock,nearFoes,newField,person,say,updateArrows,updateBlocks,updateFx,updateNear,volley,walkF} from './chientruong.js';
import {ch2Go,ch2Note} from './index.js';

const src=t=>`<p class="src">Toàn thư chép: ${t}</p>`;
export const CD={NIGHT_T:150,DET_R:80,DET_UP:1.1,DET_DOWN:.22,ROW:26,STEER:22,HOLD_T:36,HOLD_MAX:80,HOLD_R:110,CANH_T:45,SECTOR:[1,4],FLAG:1.6,CO_T:100,ME_LANE:9};
const NAMES=['anh Tráng','anh Lực','anh Thìn','cu Mão','anh Ngọ'];
const MLOOK=['trai','trai2','trai3','trai4','trai'];
const cap=n=>n[0].toUpperCase()+n.slice(1);

/* trai làng theo bạn (hư cấu). Bản lưu chưa có danh sách thì dựng theo S.c2.doi */
export function villageMen(){if(!S.c2.men){const g=S.flags.giao?'_giao':'';S.c2.men=Array.from({length:S.c2.doi||0},(_,i)=>({name:NAMES[i],look:{id:MLOOK[i]+g},fallen:false}))}return S.c2.men}

export function startCD(){S.c2.scene='cd';S.season=1;save();
  const n=villageMen().length;
  showModal({kicker:'Hạ 1285 · tháng năm',title:'Đêm trước Chương Dương',
    body:`<p>Tin báo về: quân triều sắp đánh lớn ở bến Chương Dương. Đội dân binh ông Đoàn được lệnh xuôi sông trong đêm, đi đợt thuyền đầu, rạng sáng đổ bộ.</p>
      <p>Ông Đoàn giao bạn cầm thuyền dẫn đầu${n?`, ${n} trai làng ngồi cùng thuyền`:''}. "Không đốt đuốc, không ai nói một lời. Thuyền canh của giặc treo đèn, cứ tránh xa đèn."</p>
      <p class="note">Giữ W để chèo, A D lái, cả đoàn chèo theo bạn. Lên bờ: WASD đi, Space đánh, giữ E để cắm cờ. Hư cấu trên nền sử.</p>`,
    choices:[{label:'Xuống thuyền',fn:()=>begin()}]})}

function begin(){
  const F=newField({seed:1285,wh:1440}),R=F.rnd,me=[];
  const P={x:0,y:0,dir:'up',hp:0,max:6+voHp()+theHp()+(S.path==='vo'?2:0),sw:0,cd:0,inv:0,mv:0,axis:'y',walk:0,look:{id:S.path==='van'?'ban_van':S.path==='vo'?'ban_vo':'ban_nong'}};P.hp=P.max;
  const men=villageMen().filter(m=>!m.fallen);
  // đoàn thuyền: mỗi khúc hai thuyền; thuyền của bạn ở khúc CD.ME_LANE, bạn ngồi gần mũi, trai làng ngồi cùng
  for(let i=0;i<F.lanes;i++)for(let r=0;r<2;r++){const b={x:laneX(F,i)+60+(r?30:-30)+R()*10,y:1270+r*60+R()*40,moving:false,flagc:R()<.5?'#c8302a':'#d8a020',lane:i};
    if(i===CD.ME_LANE&&!r){b.me=true;b.x=laneX(F,i)+60;b.y=1270;const crew=[null,null,null,null,{look:P.look,me:true},null];men.forEach((m,k)=>{crew[[5,2,3,0,1][k]]={look:m.look}});
      for(let k=0;k<6;k++)if(!crew[k])crew[k]={look:{id:'dan_nam'+(1+k%2)}};b.crew=crew}F.boats.push(b)}
  const mb=F.boats.find(b=>b.me);for(const b of F.boats)b.off=b.y-mb.y;
  // thuyền canh giặc treo đèn, đi ngang sông ở ba dải
  const pat=[1093,873,653].map((y,i)=>({x:mb.x+(i===1?-260:220)+R()*80,y,side:1,down:true,lamp:true,crew:[{look:{id:'giac'}},{look:{id:'giac'}},null,null,null,null],vx:(i%2?1:-1)*26,lo:mb.x-420,hi:mb.x+420,said:0}));
  F.boats.push(...pat);
  // chiến tuyến giặc trên bờ: ba hàng khối mỗi khúc, đứng chờ
  for(let i=0;i<F.lanes;i++)for(let r=0;r<3;r++)mkBlock(F,laneX(F,i),440-r*80,1);
  F.camX=mb.x;F.camY=mb.y-120;
  const M={type:'cd',F,P,me:mb,pat,phase:'dem',pt:0,t:0,det:0,lo:false,cham:false,late:false,hold:0,canh:null,co:null,kills:0,nga:0,fallen:[],coFell:false,flagHold:0,volT:4,
    allies:[],hideNPC:true,roam:true,render:cdRender,hud:cdHud,update:cdUpdate,key:cdKey,findTarget:()=>null,speedMul:()=>0,goal:cdGoal};
  setMG(M);document.body.classList.add('mg','battle');
  setKeys('<span><kbd>W</kbd> chèo</span><span><kbd>A</kbd><kbd>D</kbd> lái</span><span>Tránh vùng đèn thuyền canh</span>');
  F.banner={txt:'Đêm · xuôi sông về Chương Dương',t:3.5}}

/* ---------- cập nhật ---------- */
function cdKey(k){if(k===' '){atk();return true}return false}
function cdUpdate(dt){const M=st.MG,F=M.F;if(F.freeze>0){F.freeze-=dt;return}if(F.slow>0){F.slow-=dt;dt*=.3}
  F.t+=dt;M.t+=dt;M.pt+=dt;updateFx(F,dt);
  if(M.phase==='dem')night(M,dt);else{land(M,dt)}
  if(M.phase!=='dem'&&M.phase!=='xong')M.P.inv-=dt;
  // máy quay
  const tx=M.phase==='dem'?M.me.x:M.P.x,ty=M.phase==='dem'?M.me.y-CT.BL-40:M.P.y-30;F.camX+=(tx-F.camX)*Math.min(1,dt*3);F.camY+=(ty-F.camY)*Math.min(1,dt*3)}

function night(M,dt){const F=M.F,mb=M.me,row=!!(keys.w||keys.arrowup),steer=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
  const rush=M.lo||M.cham||M.landing;const v=rush?42:row?CD.ROW:0;
  mb.y-=v*dt;mb.moving=v>0;if(!rush&&steer){mb.x=Math.max(F.lx+40,Math.min(F.ww-60,mb.x+steer*CD.STEER*dt));mb.moving=true}
  for(const b of F.boats){if(b.side)continue;if(b===mb)continue;if(b.y-CT.BL<=F.bank+4){b.moving=false;continue}const ty=mb.y+b.off,d=b.y-ty;const sp=(rush?44:CD.ROW*1.1)*dt;if(d>0){b.y-=Math.min(sp,d);b.moving=true}else b.moving=false}
  // thuyền canh
  for(const p of M.pat){p.x+=p.vx*dt;if(p.x<p.lo||p.x>p.hi||F.rnd()<dt*.08)p.vx*=-1;p.x=Math.max(p.lo,Math.min(p.hi,p.x));p.moving=true;
    const lx=p.x-9,ly=p.y+CT.BL*.5,d=Math.hypot(mb.x-lx,mb.y-CT.BL/2-ly);p.near=d;
    if(d<130&&!p.said&&!M.lo){p.said=1;say(F,{x:lx,y:ly+20},['Hình như có tiếng nước khua?','Sương dày quá, chẳng thấy gì.','Ai đó? …Chắc cá quẫy.'][M.pat.indexOf(p)],3.2)}}
  if(!M.lo&&!M.landing){const inLamp=M.pat.some(p=>p.near<CD.DET_R);M.det=inLamp?Math.min(1,M.det+dt*CD.DET_UP*(1.2-Math.min(...M.pat.map(p=>p.near))/CD.DET_R)):Math.max(0,M.det-dt*CD.DET_DOWN);
    if(M.det>=1){M.lo=true;F.banner={txt:'Thuyền canh thổi tù và! Bị lộ!',t:3};F.shake=.4;volley(F,{x:mb.x,y:mb.y-60},26,900)}}
  if(M.lo){M.volT-=dt;if(M.volT<=0){M.volT=3;volley(F,{x:mb.x,y:mb.y-60},20,900)}}
  updateArrows(F,dt,(x,y)=>{dust(F,x,y,'#c8dcd8',3)});
  if(!M.cham&&!M.lo&&M.t>CD.NIGHT_T){M.cham=true;F.banner={txt:'Trời rạng! Phải đổ bộ ngay!',t:3}}
  if(mb.y-CT.BL<=F.bank+4&&!M.landing){M.landing=true;M.landT=0}
  if(M.landing){M.landT+=dt;if(M.landT>2.2||F.boats.every(b=>b.side||b.y-CT.BL<=F.bank+6))toLand(M)}}

function toLand(M){const F=M.F,P=M.P,mb=M.me,R=F.rnd;M.phase='giu';M.pt=0;
  for(const b of F.boats){if(b.side)continue;b.y=Math.max(b.y,F.bank+CT.BL+2);b.y=F.bank+CT.BL+2;b.moving=false;b.empty=true}
  for(const p of M.pat){p.vx=0;p.moving=false}
  P.x=mb.x;P.y=F.bank-8;P.dir='up';
  // trai làng theo bạn lên bờ
  villageMen().forEach((m,k)=>{if(m.fallen)return;const slot=[[-16,8],[16,8],[-26,-4],[26,-4],[0,16]][k];
    const e=addNear(F,P.x+slot[0],P.y+slot[1],0,{look:m.look,hp:CT.ALLY_HP+(S.flags.giao?1:0),max:CT.ALLY_HP,ally:m,slot,name:cap(m.name),spd:1.1});M.allies.push(e)});
  if(S.co==='village')M.allies.push(addNear(F,P.x,P.y+12,0,{look:{id:'co'},hp:CT.ALLY_HP+1,ally:{name:'Cò',co:true},slot:[0,-14],name:'Cò',spd:1.1}));
  // dân binh các thuyền khác, khối ta đợt đầu, giặc lẻ trên bãi
  for(const b of F.boats)if(!b.side&&!b.me&&Math.abs(b.x-P.x)<600)for(let k=0;k<3;k++)addNear(F,b.x-8+(k%2)*16,F.bank-6-(k>>1)*10,0);
  for(let i=0;i<F.lanes;i++)mkBlock(F,laneX(F,i),F.bank+30-CT.DY*4,0);
  for(let i=0;i<(M.lo?16:12);i++)addNear(F,P.x+(R()-.5)*560,F.bank-150-R()*120,1);
  if(M.lo)for(const b of F.blocks)if(b.side)b.lo=1;   // bị lộ: giặc dàn sẵn, mạnh hơn
  M.zone={x:P.x,y:F.bank-40};
  F.banner={txt:M.cham?'Đổ bộ giữa ban ngày! Giữ lấy bến!':'Rạng sáng · Lên bờ! Giữ lấy bến!',t:3};F.shake=.3;
  setKeys('<span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> đi</span><span><kbd>Space</kbd> đánh</span><span>Đứng giữ vòng bến cho đợt thuyền sau</span>')}

function sector(F){const [a,b]=CD.SECTOR;return [laneX(F,a),laneX(F,b+1)]}
const inSector=(F,x)=>{const [a,b]=sector(F);return x>=a&&x<b};
function mul(M){const F=M.F;return b=>{let k=b.side&&b.lo?1.2:1;if(M.phase==='canh'&&inSector(F,b.x+60)){const here=inSector(F,M.P.x)&&M.P.y<F.bank&&M.P.y>F.go.y-20;k*=here?(b.side?.55:2.4):(b.side?1.5:.6)}return k}}

function land(M,dt){const F=M.F,P=M.P,R=F.rnd,won=M.phase==='xong';
  // bạn đi lại 4 hướng, không đi xuyên giặc
  {let mx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),my=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
    if(mx&&my){if(P.axis==='x')my=0;else mx=0}else if(mx)P.axis='x';else if(my)P.axis='y';
    const blocked=(x,y)=>{for(const e of F.near)if(e.side&&!e.dead&&!e.flee&&Math.abs(e.x-x)<9&&Math.abs(e.y-y)<7)return true;
      for(const b of blocksNear(F,x,y,40,1))for(const m of b.men)if(m.alive&&Math.abs(b.x+m.dx-x)<9&&Math.abs(b.y+m.dy-y)<7)return true;return false};
    const sp=(P.y>F.bank?45:95)*dt,nx=Math.max(20,Math.min(F.ww-20,P.x+mx*sp)),ny=Math.max(F.go.y-10,Math.min(F.bank+20,P.y+my*sp));
    if(!blocked(nx,ny)||(blocked(P.x,P.y)&&my>0)){P.x=nx;P.y=ny}if(mx||my){P.dir=dirTo(mx,my);P.walk+=dt}P.mv=!!(mx||my)}
  P.cd-=dt;P.sw-=dt;
  const adv=M.phase!=='giu'||M.pt>6;
  updateBlocks(F,dt,adv,mul(M));
  // lính trong khối giặc ở sát bạn cũng đánh bạn
  for(const b of blocksNear(F,P.x,P.y,20,1)){b.cd=(b.cd||0)-dt;for(const m of b.men){if(!m.alive)continue;const x=b.x+m.dx,y=b.y+m.dy;
    if(Math.abs(x-P.x)<16&&Math.abs(y-P.y)<14){m.atk=.25;if(b.cd<=0&&!won){b.cd=1.1;if(R()<.5)hitMe(M)}}}}
  updateNear(F,dt,P,{fight:!won,hitMe:()=>hitMe(M),died:(tg)=>died(M,tg)});
  if(!won){M.volT-=dt;if(M.volT<=0){M.volT=3.6+R()*1.6;volley(F,P,22,900)}}
  updateArrows(F,dt,(x,y)=>{if(!won&&Math.hypot(x-P.x,y-P.y)<8)hitMe(M);for(const e of F.near)if(!e.dead&&!e.side&&!e.ally&&Math.hypot(x-e.x,y-e.y)<7){e.dead=1;e.t=0}});
  if(P.hp<=0)down(M);
  // giặc lẻ kéo tới chỗ bạn, dân binh lẻ theo sau
  const foes=nearFoes(F,1).length,mine=F.near.filter(e=>!e.side&&!e.dead&&!e.ally).length;
  const want=M.phase==='giu'?(M.lo?16:14):M.phase==='co'?9:8;
  if(!won&&foes<want&&R()<dt*(M.phase==='giu'?2.6:1.5)){const tgt=M.phase==='giu'?M.zone:P;addNear(F,tgt.x+(R()-.5)*300,Math.max(F.go.y-30,tgt.y-170-R()*50),1)}
  if(!won&&mine<7&&R()<dt*1)addNear(F,P.x+(R()-.5)*160,Math.min(F.bank+20,P.y+90),0);
  phaseTick(M);
  if(M.phase==='giu')giu(M,dt);else if(M.phase==='canh')canh(M,dt);else if(M.phase==='co')co(M,dt);else if(M.phase==='xong'){M.endT-=dt;if(M.endT<=0&&!M.ended){M.ended=true;finish(M)}}
  // đợt thuyền sau
  for(const b of F.boats)if(b.wave2&&!b.landed){b.y-=70*dt;b.moving=true;if(b.y-CT.BL<=F.bank+4){b.landed=1;b.moving=false;b.empty=true;if(b.blk){const nb=mkBlock(F,laneX(F,b.lane),F.bank+30-CT.DY*4,0,{w2:1});
    if(b.late)for(let k=0;k<7;k++){const a=nb.men.filter(m=>m.alive);killMan(F,nb,a[Math.floor(R()*a.length)])}}}}}   // đổ bộ dưới mưa tên: mỗi khối mất bảy người

function giu(M,dt){const F=M.F,P=M.P,Zn=M.zone;
  const inZ=Math.hypot(P.x-Zn.x,P.y-Zn.y)<CD.HOLD_R,foes=nearFoes(F,1).filter(e=>Math.hypot(e.x-Zn.x,e.y-Zn.y)<CD.HOLD_R).length;
  // vòng bến sạch giặc thì giữ nhanh, còn một hai tên thì chậm, từ ba tên trở lên thì mất dần
  M.holding=inZ&&foes<=2;M.hold=M.holding?Math.min(1,M.hold+dt/CD.HOLD_T*(foes?.5:1)):Math.max(0,M.hold-(foes>=3?dt/CD.HOLD_T*.5:0));
  if(M.hold>=1||M.pt>CD.HOLD_MAX){M.late=M.hold<1;wave2(M);M.phase='canh0';M.pt=0}}
function wave2(M){const F=M.F,R=F.rnd;F.banner={txt:M.late?'Đợt thuyền sau đổ bộ dưới mưa tên…':'Đợt thuyền thứ hai cập bến!',t:2.6};
  for(let i=0;i<F.lanes;i++)for(let r=0;r<2;r++)F.boats.push({x:laneX(F,i)+60+(r?30:-30)+R()*10,y:F.wh+CT.BL+r*50+R()*30,wave2:1,lane:i,blk:!r,late:M.late,flagc:R()<.5?'#c8302a':'#d8a020'});
  if(!M.late)ch2Note('Rạng sáng, bạn giữ được bến cho đợt thuyền thứ hai cập bờ.')}

function canhStart(M){const F=M.F,[a,b]=CD.SECTOR,R=F.rnd;M.phase='canh';M.pt=0;M.canhTa=0;M.canhGiac=0;
  for(let i=0;i<F.lanes;i++)if(i<a||i>b)F.lane[i]=Math.min(F.lane[i],.75);   // giữa và cánh phải đang thắng, cánh trái đuối
  for(let i=a;i<=b;i++){F.lane[i]=1.3;if(i%2)mkBlock(F,laneX(F,i),F.go.y+40,1,{res:1})}   // quân trừ bị của giặc dồn xuống cánh trái
  M.preBroken=new Set(F.blocks.filter(b=>b.broken));   // khối đã vỡ từ trước không tính
  if(S.co==='army'){const [x0,x1]=sector(F);M.coArmy=addNear(F,(x0+x1)/2,F.bank-120,0,{look:{id:'co_do'},hp:8,max:8,name:'Cò',stay:[x0+20,x1-20]});say(F,M.coArmy,'Quân Hoài Văn hầu đây! Cánh trái đuối lắm rồi!',4)}
  F.banner={txt:'Cánh trái sắp vỡ! Dẫn trai làng sang chặn!',t:3};
  setKeys('<span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> đi</span><span><kbd>Space</kbd> đánh</span><span>Sang cánh trái (mũi tên vàng)</span>')}
function canh(M,dt){const F=M.F,P=M.P;
  if(!M.reserve&&inSector(F,P.x)&&P.y<F.bank){M.reserve=1;const [a,b]=CD.SECTOR;for(let i=a;i<=b;i++)mkBlock(F,laneX(F,i),Math.min(F.bank-30,P.y+60),0,{w3:1});F.banner={txt:'Dân binh đợt sau theo bạn sang cánh trái!',t:2.4}}   // bạn tới thì kéo theo quân sang lấp chỗ hởM.canhTa=F.blocks.filter(b=>!b.side&&b.broken&&!M.preBroken.has(b)&&inSector(F,b.x+60)).length;
  if(M.coArmy&&!M.coArmy.dead){const c=M.coArmy;if(c.x<c.stay[0])c.x+=40*dt;if(c.x>c.stay[1])c.x-=40*dt;if(inSector(F,P.x)&&!M.coMet&&Math.hypot(P.x-c.x,P.y-c.y)<60){M.coMet=1;say(F,c,'Tưởng mày không tới! Đánh thôi!',3.4)}}
  const left=F.blocks.filter(b=>b.side&&!b.broken&&inSector(F,b.x+60)).length;
  const taAlive=F.blocks.filter(b=>!b.side&&!b.broken&&inSector(F,b.x+60)).length;
  if(M.canhTa>=2||(!taAlive&&M.pt>4)){M.canh='vo';endCanh(M)}else if(!left||M.pt>CD.CANH_T){M.canh='giu';endCanh(M)}}   // vỡ hai khối, hoặc khúc ấy không còn khối ta nào, là vỡ   // giữ đủ giờ mà chưa vỡ ba khối, hoặc dọn sạch giặc ở khúc ấy
function endCanh(M){const F=M.F,[a,b]=CD.SECTOR;for(let i=a;i<=b;i++)F.lane[i]=.8;
  if(M.canh==='giu'){F.banner={txt:'Cánh trái đứng vững!',t:2.6};ch2Note('Cánh trái sắp vỡ, bạn dẫn trai làng sang chặn. Khúc ấy đứng vững.');gain('tieng',2)}
  else{F.banner={txt:'Cánh trái vỡ… quân ta lùi về giữa.',t:3};ch2Note('Cánh trái vỡ. Quân ta phải lùi về giữa rồi mới đánh lên lại được.');
    const al=M.allies.filter(e=>!e.dead&&e.ally&&!e.ally.co);if(al.length){const e=al[al.length-1];e.hp=0;e.dead=1;e.t=0;died(M,e)}
    if(M.coArmy&&!M.coArmy.dead){M.coArmy.dead=1;M.coArmy.t=0;M.coFell=true;say(M.F,M.coArmy,S.flags.dieu?'…Năm tám tuổi… cái diều… bay cao lắm nhỉ…':'…Bảo mẹ tao… tao không chạy…',6)}
    for(const bl of F.blocks)if(!bl.side&&!bl.broken&&inSector(F,bl.x+60)){bl.broken=1}}
  M.phase='co0';M.pt=0}
function co(M,dt){const F=M.F,P=M.P,G=F.go;
  if(Math.hypot(P.x-G.x,P.y-G.y)<26&&keys.e){M.flagHold+=dt;if(M.flagHold>=CD.FLAG)win(M,'me')}else M.flagHold=Math.max(0,M.flagHold-dt*2);
  if(M.pt>CD.CO_T)win(M,'khac')}
function win(M,who){const F=M.F;M.co=who;M.phase='xong';M.endT=5;F.slow=1.6;F.shake=.6;
  F.banner={txt:who==='me'?'Cờ đỏ trên gò Chương Dương!':'Cờ ta đã cắm trên gò!',t:4.5};
  for(const b of F.blocks)if(b.side&&!b.broken)b.broken=1;for(const e of F.near)if(e.side&&!e.dead)e.flee=1;dust(F,F.go.x,F.go.y-30,'#e2bf72',36);
  if(who==='me')gain('tieng',3)}

function hitMe(M){const F=M.F,P=M.P;if(P.inv>0||M.phase==='xong')return;P.hp--;P.inv=.55;F.shake=.25;dust(F,P.x,P.y-14,'#c03020',4)}
function down(M){const F=M.F,P=M.P;M.nga++;P.hp=Math.ceil(P.max*.6);P.inv=2;gainThe(-1);
  const al=M.allies.filter(e=>!e.dead);const who=al.length?al[Math.floor(F.rnd()*al.length)].name:'Dân binh';F.banner={txt:`${who} kéo bạn dậy!`,t:2};
  P.y=Math.min(F.bank-8,P.y+40)}
function died(M,tg){if(tg===M.coArmy){M.coFell=true;say(M.F,tg,S.flags.dieu?'…Năm tám tuổi… cái diều… bay cao lắm nhỉ…':'…Bảo mẹ tao… tao không chạy…',6);return}
  if(!tg.ally)return;const m=tg.ally;if(m.co){M.coFell=true;say(M.F,tg,S.flags.dieu?'…Năm tám tuổi… cái diều… bay cao lắm nhỉ…':'…Bảo mẹ tao… tao không chạy…',6);return}
  m.fallen=true;M.fallen.push(m.name);
  const line=S.flags.de==='saved'?'…Năm lụt… mình giữ được đê… lần này cũng giữ được…':(S.flags.doi||0)>=3?'…Mấy buổi luyện đội… không uổng…':'…Bảo mẹ tôi… tôi không bỏ chạy…';say(M.F,tg,line,6)}
function atk(){const M=st.MG;if(!M||M.type!=='cd'||M.phase==='dem')return;const F=M.F,P=M.P;if(P.cd>0)return;P.cd=.28;P.sw=.2;let hit=0;const dmg=2+voDmg()+(S.path==='vo'?1:0);
  for(const e of F.near)if(!e.dead&&e.side&&!e.flee&&Math.abs(e.x-P.x)<20&&Math.abs(e.y-P.y)<16){e.hp-=dmg;e.stun=.5;const ax=Math.abs(e.x-P.x)>Math.abs(e.y-P.y);e.vx=ax?Math.sign(e.x-P.x)*160:0;e.vy=ax?0:Math.sign(e.y-P.y)*160;hit=1;
    P.dir=ax?(e.x>P.x?'right':'left'):(e.y>P.y?'down':'up');dust(F,e.x,e.y-12,'#c03020',7);if(e.hp<=0){e.dead=1;e.t=0;M.kills++}}
  if(!hit)for(const b of blocksNear(F,P.x,P.y,20,1)){for(const m of b.men){if(!m.alive)continue;const x=b.x+m.dx,y=b.y+m.dy;
    if(Math.abs(x-P.x)<20&&Math.abs(y-P.y)<16){killMan(F,b,m);hit=1;M.kills++;const ax=Math.abs(x-P.x)>Math.abs(y-P.y);P.dir=ax?(x>P.x?'right':'left'):(y>P.y?'down':'up');break}}if(hit)break}
  if(hit){F.freeze=.05;F.shake=Math.max(F.shake,.15)}}

/* ---------- mục tiêu ---------- */
function cdGoal(){const M=st.MG,F=M.F;if(M.phase==='dem')return [M.me.x,F.bank];if(M.phase==='giu')return [M.zone.x,M.zone.y];
  if(M.phase==='canh'){const [a,b]=sector(F);const bl=F.blocks.filter(x=>x.side&&!x.broken&&inSector(F,x.x+60)).sort((p,q)=>q.y-p.y)[0];return [(a+b)/2,bl?bl.y+CT.ROWS*CT.DY+24:F.bank-150]}
  if(M.phase==='co')return [F.go.x,F.go.y];return [M.P.x,M.P.y]}
/* nhịp chuyển: sau đợt hai cập bến ít giây thì sang cánh trái; cánh trái xong ít giây thì lên gò */
function phaseTick(M){if(M.phase==='canh0'&&M.pt>3&&M.F.boats.every(b=>!b.wave2||b.landed))canhStart(M);
  if(M.phase==='co0'&&M.pt>3){M.phase='co';M.pt=0;M.F.banner={txt:'Lên gò! Cắm cờ!',t:3};
    setKeys('<span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> đi</span><span><kbd>Space</kbd> đánh</span><span>Giữ <kbd>E</kbd> trên gò để cắm cờ</span>')}}

/* ---------- vẽ ---------- */
function cdRender(){const M=st.MG,F=M.F,P=M.P;
  drawField(F,list=>{
    if(M.phase!=='dem')list.push([P.y,()=>{if(P.inv>0&&M.phase!=='xong'&&Math.floor(F.t*20)%2)return;const f=P.sw>0?(P.sw>.1?'a0':'a1'):(P.mv?walkF(F.t,0):0);person(P.look,P.x,P.y,P.dir,f);
      if(P.y>F.bank){ctx.fillStyle='#4a7888';ctx.fillRect(Math.round(P.x)-8,Math.round(P.y)-9,16,10)}ctx.fillStyle='#0b0d0c';ctx.fillRect(Math.round(P.x)-3,Math.round(P.y)-45,7,5);ctx.fillStyle='#ffe08a';ctx.fillRect(Math.round(P.x)-2,Math.round(P.y)-44,5,3)}]);
    const G=F.go;list.push([G.y,()=>{const h=M.co?40:Math.round(M.flagHold/CD.FLAG*40);if(h>0){ctx.fillStyle='#0b0d0c';ctx.fillRect(G.x-1,G.y-h-1,3,h+1);ctx.fillStyle='#6e4a2a';ctx.fillRect(G.x,G.y-h,1,h)}
      if(h>6){const w=Math.round(Math.sin(F.t*5));ctx.fillStyle='#0b0d0c';ctx.fillRect(G.x+1,G.y-h-1+w,20,14);ctx.fillStyle='#d23a2a';ctx.fillRect(G.x+1,G.y-h+w,18,12);ctx.fillStyle='#f0d070';ctx.fillRect(G.x+7,G.y-h+4+w,6,4)}
      if(M.phase==='co'&&Math.floor(F.t*3)%2){ctx.fillStyle='#0b0d0c';ctx.fillRect(G.x-3,G.y-14,7,7);ctx.fillStyle='#ffe08a';ctx.fillRect(G.x-2,G.y-13,5,5)}}]);
    if(M.phase==='giu'){const Zn=M.zone;list.push([F.go.y-100,()=>{ctx.strokeStyle=M.holding?'rgba(255,224,138,.55)':'rgba(224,127,107,.5)';ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(Zn.x,Zn.y,CD.HOLD_R,CD.HOLD_R*.55,0,0,7);ctx.stroke();ctx.setLineDash([])}])}
    if(M.phase==='canh'){const [a,b]=sector(F);list.push([F.go.y-100,()=>{ctx.fillStyle='rgba(255,224,138,.07)';ctx.fillRect(a,F.go.y,b-a,F.bank-F.go.y)}])}});
  // nhãn tên trai làng, Cò
  const labels=[];for(const e of F.near)if((e.ally||e===M.coArmy)&&!e.dead&&Math.hypot(e.x-P.x,e.y-P.y)<90)labels.push([e.name,e.x,e.y-44]);
  if(M.phase==='dem'){const holes=[[M.me.x,M.me.y-CT.BL/2,26]];for(const p of M.pat)holes.push([p.x-9,p.y+CT.BL*.5-12,CD.DET_R*1.05]);darkness(holes,.8);
    // sương trôi
    ctx.setTransform(DPR,0,0,DPR,0,0);for(let i=0;i<7;i++){const y=(i*97+F.t*4)%innerHeight,x=((i*233+F.t*12)%(VW+400))-200;ctx.fillStyle='rgba(200,210,220,.06)';ctx.fillRect(x,y,380,26)}}
  else{const k=Math.max(0,.3-M.t*.002);if(k>0){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle=`rgba(40,30,70,${k})`;ctx.fillRect(0,0,VW,innerHeight)}}
  if(F.slow>0){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle=`rgba(255,220,140,${.12*F.slow})`;ctx.fillRect(0,0,VW,innerHeight)}
  drawLabels(F,labels);
  const g=cdGoal();if(M.phase!=='xong'&&M.phase!=='ket'&&M.phase!=='dem')edgeArrow(F,g[0],g[1]);
  fieldMini(F,M.phase==='dem'?{x:M.me.x,y:M.me.y-CT.BL}:P,M.phase==='xong'||M.phase==='ket'?null:g)}
const TITLE={ket:'Giặc tan',dem:'Đêm · xuôi sông',giu:'Rạng sáng · giữ bến',canh0:'Đợt thuyền sau',canh:'Cánh trái',co0:'Lên gò',co:'Lên gò Chương Dương',xong:'Giặc tan'};
function cdHud(){const M=st.MG,F=M.F,P=M.P;ctx.setTransform(DPR,0,0,DPR,0,0);const w=Math.min(470,VW-32),x=Math.round(VW/2-w/2);hudBox(x,16,w,46);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#e2bf72';ctx.fillText('Trận Chương Dương · '+TITLE[M.phase],x+12,30);
  ctx.textAlign='right';ctx.fillStyle='#aab2a2';const alive=M.allies.filter(e=>!e.dead).length;ctx.fillText(M.phase==='dem'?(M.lo?'bị lộ!':'chưa bị lộ'):`Máu ${Math.max(0,P.hp)}/${P.max}${M.allies.length?' · người làng theo '+alive:''}`,x+w-12,30);ctx.textAlign='left';
  let txt='',bar=null,col='#d98a3a';
  if(M.phase==='dem'){txt=M.lo||M.cham?'Cả đoàn chèo gấp vào bờ!':'Giữ W chèo, A D lái. Tránh vùng đèn thuyền canh';bar=M.det;col=M.det>.6?'#e0402a':'#d98a3a'}
  else if(M.phase==='giu'){txt=M.holding?'Giữ được bến…':'Về vòng bến, đánh lui giặc trong vòng';bar=M.hold;col='#e2bf72'}
  else if(M.phase==='canh'){const left=F.blocks.filter(b=>b.side&&!b.broken&&inSector(F,b.x+60)).length;txt=`Trụ ở cánh trái · còn ${left} khối giặc · ta vỡ ${M.canhTa}/2`;bar=Math.min(1,M.pt/CD.CANH_T);col='#e07f6b'}
  else if(M.phase==='co'){txt='Lên gò, giữ E để cắm cờ';bar=M.flagHold/CD.FLAG;col='#e2bf72'}
  else txt=M.phase==='xong'?'Giặc chạy về phía sông Lô!':'…';
  ctx.fillStyle='#efe8d4';ctx.fillText(txt,x+12,48);if(bar!==null)hudBar(x+w-150,42,138,bar,col)}

/* ---------- kết trận ---------- */
function finish(M){M.phase='ket';M.update=()=>{};M.hud=()=>{};   // bãi trận vẫn vẽ sau khung kết, tới khi bấm Tiếp tục
  const cong=[];if(!M.lo&&!M.cham)cong.push('Bạn dẫn đợt thuyền đầu lặng lẽ vào bến, mở đường cho cả đoàn dân binh.');if(!M.late)cong.push('Bạn giữ được bến cho đợt thuyền thứ hai.');
  if(M.canh==='giu')cong.push('Bạn giữ khúc chiến tuyến bên trái lúc nó sắp vỡ.');if(M.co==='me')cong.push('Bạn cắm lá cờ đầu tiên trên gò Chương Dương.');
  S.c2.cd={lo:M.lo,cham:M.cham,late:M.late,canh:M.canh,co:M.co,kills:M.kills,nga:M.nga,fallen:M.fallen.slice(),coFell:M.coFell,cong:cong.length};
  if(M.lo)ch2Note('Đêm trước Chương Dương, thuyền canh giặc phát hiện đoàn thuyền. Dân binh phải đổ bộ dưới mưa tên.');
  else if(M.cham)ch2Note('Đêm trước Chương Dương, bạn chèo chậm, đoàn thuyền đổ bộ khi trời đã rạng.');
  else ch2Note('Đêm trước Chương Dương, bạn cầm thuyền dẫn đầu lặng lẽ qua mặt thuyền canh giặc.');
  ch2Note(M.co==='me'?'Bạn cắm lá cờ đầu tiên trên gò Chương Dương.':'Lá cờ đầu trên gò Chương Dương do người khác cắm; bạn còn đang đánh dưới chân gò.');
  ch2Note(`Trận Chương Dương, bạn hạ ${M.kills} tên giặc${M.nga?`, ngã xuống ${M.nga} lần, được người mình kéo dậy`:''}.`);
  if(M.fallen.length)ch2Note(`Trai làng ngã ở Chương Dương: ${M.fallen.join(', ')}.`);
  if(M.coFell){S.c2.coFell=true;ch2Note(S.co==='army'?'Cò ngã ở cánh trái Chương Dương, trong quân Hoài Văn hầu.':'Cò ngã ở Chương Dương.')}
  if(M.kills>=15)gain('vo',2);
  const lost=M.fallen.length?`<p>Chiều xuống, bạn đi dọc bãi tìm người làng. ${M.fallen.map(cap).join(', ')} không về nữa.</p>`:'';
  const coP=M.coFell?`<p>${S.co==='army'?'Ở cánh trái, người ta tìm thấy Cò nằm dưới lá cờ quân Hoài Văn.':'Cò nằm lại dưới chân gò.'} ${S.flags.dieu?'Bạn nhớ cái diều giấy năm nào hai đứa trốn học đi thả.':'Bạn ngồi cạnh Cò rất lâu.'}</p>`:'';
  save();
  showModal({kicker:'Hạ 1285 · tháng năm',title:'Chương Dương',
    body:`<p>Giặc tan vỡ. Từ gò Chương Dương nhìn về phía bắc, khói còn bốc lên ở kinh thành. Người ta truyền nhau: thái tử giặc đã chạy qua sông Lô.</p>
      ${cong.length?`<ul class="chron">${cong.map(c=>`<li>${c}</li>`).join('')}</ul>`:'<p>Bạn đánh trong đám đông dân binh, không ai kịp nhớ mặt ai.</p>'}${lost}${coP}
      <p class="note">${cong.length>=3?'Sử sách chép tên các tướng. Làng An Phú nhớ tên bạn.':'Việc của bạn và trai làng ở trận này là hư cấu.'}</p>
      ${src('tháng 5 năm 1285, có người trốn từ chỗ giặc về báo: Thượng tướng Trần Quang Khải, Hoài Văn hầu Trần Quốc Toản cùng Trần Thông, Nguyễn Khả Lạp và em là Nguyễn Truyền đem dân binh các lộ đánh bại giặc ở Kinh Thành, Chương Dương; giặc tan vỡ lớn, thái tử Thoát Hoan, A Lạt chạy qua sông Lô.')}`,
    choices:[{label:'Tiếp tục',fn:()=>{setMG(null);setKeys();document.body.classList.remove('mg','battle');ch2Go('cho')}}]})}
