/* ================= minigame: buổi tập trận năm 1283 (đường võ) ================= */
/* Toàn thư chép mùa đông năm 1283 vua thân hành dẫn các vương hầu điều quân thủy bộ tập trận (sự kiện 'tietche').
   Bãi tập, người xem, các quan chấm, anh Ngũ cưỡi ngựa tới là hư cấu; Toàn thư chép Hưng Đạo Vương thu nhận Phạm
   Ngũ Lão làm gia thần (xem sự kiện 'ngu' năm 1278).
   Diễn ra ngay trên bản đồ, ở bãi đất ngoài tường đông kinh thành (BAI): bàn các quan chấm ở đầu bãi, ba hàng hình
   nộm, hương binh các làng đâm thử ở hai hàng bên, dân xem đứng dọc tường thành và cuối bãi.
   Cách chơi giữ như cũ (hàm tmHit, test và bot dùng): thanh canh nhịp hiện ở đầu màn hình, bấm Space hoặc E khi mũi
   giáo ở vùng sáng của hình nộm; giữa vùng là trúng hiểm (2 điểm), trong vùng là trúng (1), ngoài là trượt. 6 lượt,
   mũi giáo nhanh dần, hai lượt cuối hình nộm lắc lư. Võ càng cao vùng sáng càng rộng (20 + Võ×0,65, 26–90 điểm ảnh).
   Sau mỗi đòn: quan chấm hô điểm, người xem reo hoặc ồ lên. Xong 6 lượt các quan bàn rồi xướng điểm; đã gặp anh Ngũ
   bên đường (1272–1277) thì anh cưỡi ngựa tới, dừng trước mặt bạn, lời theo điểm (đứng đầu: "Ta nhớ cậu."). Điểm ≥ 9 'top', ≥ 5 'ok', còn lại 'low'. */
import {TS,Z,ctx} from '../constants.js';
import {trainPromote} from '../chuc.js';
import {MG,P,S,save,setMG} from '../state.js';
import {gain,setKeys,showModal} from '../ui.js';
import {K} from '../events.js';
import {practice} from '../nghe.js';
import {VW,camX,camY,clock,drawSprite,shadow} from '../render.js';
import {personSprite,simple} from '../sprites.js';
import {horseDir} from '../trai.js';
import {drawBubbles} from '../climax.js';
import {hudBox} from './flood.js';

/* bãi tập: bạn đứng ở ME đâm hình nộm DUMMY; hai hàng bên có hương binh làng khác */
const ME={x:74.5,y:12.6},DUMMY={x:76.3,y:12.6},LANES=[10.4,14.8],JUDGE={x:75.4,y:7.6};
const NGU_FROM={x:77.5,y:2.6},NGU_TO={x:77.6,y:12.7};
// người xem: đủ kiểu người làng, già trẻ gái trai (tools/ve_nguoi.py), không ai đội khăn đỏ như bạn
const CROWD=[[71.6,9.4,'dan_nam1'],[71.5,10.9,'dan_nu1'],[71.7,12.4,'ong_gia'],[71.5,13.9,'dan_nu3'],[71.6,15.4,'trai3'],[71.6,16.9,'tre1'],
  [73.2,17.8,'dan_nam2'],[74.6,17.9,'dan_nu2'],[76,17.8,'trai2'],[77.4,17.9,'tre2'],[78.6,17.6,'trai4']];
const CHEER=['Hay!','Giỏi quá!','Trúng rồi!','Đâm thế mới gọi là đâm!','Làng An Phú đấy!'],OOH=['Ối...','Tiếc quá!','Run tay rồi.'];
const dummySprite=()=>simple('hinh_nom',18,30,s=>{s(8,8,2,22,'#6e4a2a');s(2,11,14,2,'#6e4a2a');s(4,6,10,13,'#c9a36a');s(5,7,8,11,'#d9b47a');s(6,1,6,6,'#c9a36a');s(7,2,4,4,'#d9b47a');
  for(let y=8;y<18;y+=3)s(4,y,10,1,'#a8844a');s(7,12,4,3,'#b8322a')},9,29);
const tableSprite=()=>simple('ban_cham',40,18,s=>{s(1,4,38,6,'#7a5232');s(1,4,38,1,'#9a6a42');s(3,10,2,8,'#4a311b');s(35,10,2,8,'#4a311b');s(8,1,8,4,'#efe8d4');s(24,2,6,3,'#2a2226');s(30,1,2,4,'#b8322a')},20,16);
const flagSprite=c=>simple('co_tap'+c,18,40,s=>{s(1,0,2,40,'#4a311b');s(3,2,13,9,c);s(3,11,10,3,c);s(5,4,6,1,'#e9b93a')},2,39);

export function startTraining(){
  const back={x:S.x,y:S.y};
  setMG({type:'timing',round:0,score:0,pos:10,dir:1,speed:300,t:0,res:[],flash:0,phase:'vao',pt:2.6,swing:0,bub:[],floats:[],back,
    ngu:null,lanes:LANES.map((y,i)=>({x:ME.x,y,look:{id:i?'huong_binh2':'huong_binh'},swing:0,cd:1+i*.7})),crowd:CROWD.map(([x,y,id])=>({x,y,look:{id}})),
    judges:[{x:JUDGE.x-.8,y:JUDGE.y-.5,look:{id:'quan'}},{x:JUDGE.x,y:JUDGE.y-.6,look:{id:'voquan'}},{x:JUDGE.x+.8,y:JUDGE.y-.5,look:{id:'quan'}}],
    hideNPC:true,speedMul:()=>0,hideTree:t=>t.x>=71&&t.x<=79&&t.y>=5&&t.y<=18,hideProp:p=>p.x>=71&&p.x<=79&&p.y>=5&&p.y<=18,   // dọn bãi tập
    cam:()=>[75.2,12.2],update:tmUpdate,draw:tmDraw,hud:tmHud,key:k=>{if(k===' '||k==='e'){tmHit();return true}return false},findTarget:()=>null});
  tmZone();S.x=ME.x;S.y=ME.y;P.dir='right';document.body.classList.add('mg');
  setKeys('<span><kbd>Space</kbd> hoặc <kbd>E</kbd>: đâm khi mũi giáo vào vùng sáng</span><span>6 lượt · giữa vùng là trúng hiểm</span>');
  sayJ(1,'Hương binh làng An Phú, ra trước hình nộm!',2.6);
  if(S.co==='village'){const c=MG.crowd[3];c.look={id:'co'};c.name='Cò';say(c,'Cố lên! Cả làng đang nhìn đấy!',3)}   // Cò còn ở làng thì đứng xem
}
const sayJ=(i,t,d=2.2)=>say(MG.judges[i],t,d);
function say(o,text,dur=2.2){const M=MG;M.bub=M.bub.filter(b=>b.o!==o);M.bub.push({o,text,t:dur})}
const pick=a=>a[Math.floor(Math.random()*a.length)];
function tmZone(){const w=Math.max(26,Math.min(90,20+S.vo*.65));MG.zw=w;MG.z0=60+w/2+Math.random()*(360-w);MG.zc=MG.z0}

function tmUpdate(dt){const M=MG;M.t+=dt;M.flash=Math.max(0,M.flash-dt);M.swing=Math.max(0,M.swing-dt);
  for(const b of M.bub)b.t-=dt;M.bub=M.bub.filter(b=>b.t>0);for(const f of M.floats)f.t+=dt;M.floats=M.floats.filter(f=>f.t<1.4);
  for(const l of M.lanes){l.swing=Math.max(0,l.swing-dt);if((l.cd-=dt)<=0){l.cd=1.6+Math.random()*1.4;l.swing=.24}}   // hương binh làng khác đâm thử
  S.x=ME.x;S.y=ME.y;P.dir='right';P.moving=false;
  if(M.phase==='aim'){if(M.round>=4)M.zc=M.z0+Math.sin(M.t*1.2)*40;M.pos+=M.dir*M.speed*dt;if(M.pos>470){M.pos=470;M.dir=-1}if(M.pos<10){M.pos=10;M.dir=1}return}
  if((M.pt-=dt)>0){if(M.phase==='ngu')nguRide(dt);return}
  if(M.phase==='vao'||M.phase==='nghi'){M.phase='aim';if(M.round===4)sayJ(1,'Hai lượt cuối, hình nộm lắc!',1.8)}
  else if(M.phase==='cham'){const sc=M.score;M.phase='xuong';M.pt=3;
    sayJ(1,sc>=9?`Điểm ${sc} trên 12. Đứng đầu cả bãi!`:sc>=5?`Điểm ${sc} trên 12. Đạt.`:`Điểm ${sc} trên 12. Phải luyện thêm.`,3);
    for(const c of M.crowd)if(Math.random()<.35)say(c,sc>=9?pick(CHEER):sc>=5?'Được đấy.':pick(OOH),2.4)}
  else if(M.phase==='xuong'){if(S.nguMet){   // đã gặp anh Ngũ bên đường: anh cưỡi ngựa tới, với mọi mức điểm
    M.phase='ngu';M.pt=1e9;M.ngu={x:NGU_FROM.x,y:NGU_FROM.y,dir:'down',arrived:false,talk:0};say(M.crowd[1],'Ngựa ai kia?',2.2);say(M.crowd[7],'Tướng dưới trướng Hưng Đạo Vương đấy!',2.6)}
    else tmEnd()}}
/* anh Ngũ cưỡi ngựa từ đầu bãi xuống, dừng trước mặt bạn */
function nguRide(dt){const M=MG,n=M.ngu;
  if(!n.arrived){const dx=NGU_TO.x-n.x,dy=NGU_TO.y-n.y,d=Math.hypot(dx,dy),sp=3.4*dt;if(d<=sp){n.x=NGU_TO.x;n.y=NGU_TO.y;n.arrived=true;n.talk=0;const sc=M.score;say(n,sc>=9?'Ta nhớ cậu. Cậu trai đứng nghe ta bàn binh pháp bên đường năm nào.':sc>=5?'Cậu trai bên gốc cây năm nào đây mà! Đường giáo vững đấy, chỉ thiếu chút nhanh.':'Hôm nay tay run phải không? Năm xưa ta cũng thế. Cái chí thì ta thấy rồi, đừng nản.',3.6)}
    else if(Math.abs(dy)>.05){n.y+=Math.sign(dy)*Math.min(sp,Math.abs(dy));n.dir='down'}else{n.x+=Math.sign(dx)*Math.min(sp,Math.abs(dx));n.dir=dx<0?'left':'right'}return}   // đi 4 hướng
  n.talk+=dt;if(n.talk>3.6&&!n.said2){n.said2=true;say(n,'Giặc sang, ta sẽ tìm cậu.',2.8)}if(n.talk>6.6)tmEnd()}

export function tmHit(){const M=MG;if(!M||M.type!=='timing'||M.round>=6||M.phase!=='aim')return;
  const d=Math.abs(M.pos-M.zc),pts=d<M.zw*.18?2:d<M.zw/2?1:0;M.score+=pts;M.res.push(pts);M.round++;M.speed+=60;M.flash=.25;M.swing=.24;tmZone();
  M.floats.push({x:DUMMY.x,y:DUMMY.y-1.8,t:0,text:pts===2?'Trúng hiểm! +2':pts?'Trúng +1':'Trượt',col:pts===2?'#e2bf72':pts?'#9fcaa9':'#e07f6b'});
  sayJ(pts?1:2,pts===2?'Trúng hiểm! Hai điểm.':pts?'Trúng. Một điểm.':'Trượt!',1.4);
  const c=M.crowd[Math.floor(Math.random()*M.crowd.length)];if(pts===2||Math.random()<.4)say(c,pts?pick(CHEER):pick(OOH),1.6);
  if(M.round>=6){M.phase='cham';M.pt=2.4;sayJ(0,'(Các quan chụm đầu bàn điểm...)',2.2)}else{M.phase='nghi';M.pt=1.3}}

function tmDraw(list){const M=MG,wob=M.round>=4&&M.phase==='aim'?Math.round(Math.sin(M.t*1.2)*3)/TS:0;
  list.push({y:JUDGE.y,f:()=>drawSprite(tableSprite(),JUDGE.x,JUDGE.y)});
  for(const [x,c] of [[72.6,'#b8322a'],[78.3,'#b8322a'],[75.4,'#e9b93a']])list.push({y:5.9,f:()=>drawSprite(flagSprite(c),x,5.9+(x===75.4?0:.4))});
  for(const [o,i] of M.judges.map((o,i)=>[o,i]))list.push({y:o.y,f:()=>drawSprite(personSprite(o.look,'down',0),o.x,o.y),lab:i===1?['Võ quan chấm',o.x,o.y-2]:null});
  for(const y of [LANES[0],ME.y,LANES[1]]){const dx=y===ME.y?wob:0;list.push({y:y-.05,f:()=>{shadow(DUMMY.x+dx,y,10);drawSprite(dummySprite(),DUMMY.x+dx,y)}})}
  for(const l of M.lanes)list.push({y:l.y,f:()=>{shadow(l.x,l.y,10);drawSprite(personSprite(l.look,'right',l.swing>0?(l.swing>.17?'a0':'a1'):0),l.x,l.y)}});
  for(const c of M.crowd){const dir=c.x<72.5?'right':'up',hop=M.phase!=='aim'&&M.bub.some(b=>b.o===c)?Math.round(Math.abs(Math.sin(clock*12))*2)/TS:0;
    list.push({y:c.y,f:()=>{shadow(c.x,c.y,10);drawSprite(personSprite(c.look,dir,0),c.x,c.y-hop)}})}
  if(M.ngu){const n=M.ngu,fr=n.arrived?0:0,bobY=n.arrived?0:Math.round(Math.abs(Math.sin(clock*9))*1.5)/TS,hd=n.dir==='left'?'left':'right';
    list.push({y:n.y,f:()=>{shadow(n.x,n.y,22);drawSprite(personSprite({id:'ngu_tuong'},n.dir==='down'?'down':hd,0),n.x,n.y-.85-bobY);drawSprite(horseDir(0,fr,hd),n.x,n.y-bobY)},lab:['Anh Ngũ',n.x,n.y-2.9]})}}

function tmHud(){const M=MG;
  // thanh canh nhịp
  if(M.phase==='aim'||M.phase==='nghi'||M.phase==='vao'){const ox=Math.round(VW/2-240),oy=16;hudBox(ox-6,oy-6,492,104);const g=ctx;
    g.fillStyle='#2a302b';g.fillRect(ox,oy,480,72);g.fillStyle='#4a3a28';g.fillRect(ox,oy+48,480,24);
    g.fillStyle='rgba(226,191,114,.35)';g.fillRect(ox+M.zc-M.zw/2,oy+8,M.zw,40);g.fillStyle='rgba(226,191,114,.7)';g.fillRect(ox+M.zc-M.zw*.18,oy+8,M.zw*.36,40);
    g.fillStyle='#c9a36a';g.fillRect(ox+M.zc-3,oy+10,6,38);g.fillRect(ox+M.zc-12,oy+20,24,4);g.fillStyle='#8a6a3a';g.fillRect(ox+M.zc-6,oy+4,12,10);
    if(M.phase==='aim'){const x=ox+Math.round(M.pos);g.fillStyle='#6a4e2e';g.fillRect(x-1,oy+24,3,46);g.fillStyle='#d3d7da';g.fillRect(x-3,oy+18,7,7);g.fillStyle='#b8322a';g.fillRect(x-2,oy+27,5,2)}
    if(M.flash>0){g.fillStyle=`rgba(255,255,255,${M.flash*2})`;g.fillRect(ox,oy,480,72)}
    g.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';g.textBaseline='middle';g.textAlign='left';g.fillStyle='#efe8d4';g.fillText(`Lượt ${Math.min(6,M.round+1)}/6 · Điểm ${M.score}`,ox+4,oy+86);
    g.textAlign='right';g.fillStyle='#aab2a2';g.fillText(M.res.map(p=>p===2?'◆':p?'◇':'·').join(' '),ox+476,oy+86)}
  // chữ nổi trên hình nộm
  ctx.font='700 14px "Be Vietnam Pro", system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  for(const f of M.floats){ctx.globalAlpha=Math.max(0,1-f.t/1.4);const x=f.x*TS*Z-camX,y=(f.y-f.t*.6)*TS*Z-camY;ctx.fillStyle='#0b0d0c';ctx.fillText(f.text,x+2,y+2);ctx.fillStyle=f.col;ctx.fillText(f.text,x,y)}ctx.globalAlpha=1;
  drawBubbles(M.bub,M.phase==='aim'||M.phase==='nghi'||M.phase==='vao'?130:16)}

function tmEnd(){const M=MG;if(!M||M.type!=='timing'||M.over)return;M.over=true;const sc=M.score;
  setMG(null);setKeys();document.body.classList.remove('mg');S.pending=null;S.x=M.back.x;S.y=M.back.y;let title,body;
  practice('ngua');
  const nguP=S.nguMet?'<p>Viên tướng trẻ cưỡi ngựa dừng trước mặt bạn chính là anh Ngũ đứng đọc sách bên đường năm nào, nay là Phạm Ngũ Lão, tướng dưới trướng Hưng Đạo Vương.</p>':'';if(S.nguMet)S.flags.nguKnows=true;
  if(sc>=9){S.flags.train='top';gain('vo',5);title='Xuất sắc nhất đội';body='<p>Đường giáo của bạn nhanh và chuẩn đến mức cả bãi tập phải dừng lại xem.</p>'+nguP+'<p class="note">Khi có biến, bạn sẽ khỏe hơn trong chiến đấu.</p>'}
  else if(sc>=5){S.flags.train='ok';gain('vo',3);title='Đạt yêu cầu';body='<p>Bạn hoàn thành buổi tập, được võ quan khen một câu.</p>'+nguP}
  else{S.flags.train='low';gain('vo',1);title='Cần luyện thêm';body='<p>Mấy lần bạn đâm trượt hình nộm, bị võ quan mắng trước cả bãi.</p>'+nguP}
  showModal({kicker:`${K(3,1283)} · Điểm ${sc}/12`,title,body});trainPromote();save()}
