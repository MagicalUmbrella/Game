/* ================= minigame: tập trận 1283 ================= */
import {trainPromote} from '../chuc.js';
import {MG,S,save,setMG} from '../state.js';
import {gain,nextModal,showModal} from '../ui.js';
import {K} from '../events.js';
import {practice} from '../nghe.js';

/* Độ khó: vùng trúng rộng theo Võ (20 + Võ×0,65, từ 26 đến 90 điểm ảnh), mũi giáo nhanh dần (300, mỗi lượt +60),
   hai lượt cuối hình nộm lắc lư. Mô phỏng: người bấm lệch ±35 ms, Võ 50 được "xuất sắc" khoảng 4 lần trong 10. */
export function startTraining(){
  setMG({type:'timing',round:0,score:0,pos:0,dir:1,speed:300,t:0,res:[],flash:0,tick:tmTick,modalKey:k=>{if(k===' '||k==='e'){tmHit();return true}return false}});tmZone();
  showModal({kicker:K(3,1283),title:'Bãi tập trận',body:'<p>Bấm <kbd>Space</kbd> hoặc <kbd>E</kbd> khi mũi giáo nằm trong vùng sáng của hình nộm. Giữa vùng là trúng hiểm. Có 6 lượt, càng về sau càng nhanh, hai lượt cuối hình nộm lắc lư. Võ càng cao, vùng sáng càng rộng.</p><canvas id="tm" width="480" height="72" style="width:100%;max-width:480px;image-rendering:pixelated;border:2px solid #0b0d0c"></canvas><p class="note" id="tmInfo">Lượt 1/6</p>',choices:[{label:'Đâm!',fn:()=>{tmHit();return false}}]});
}
function tmZone(){const w=Math.max(26,Math.min(90,20+S.vo*.65));MG.zw=w;MG.z0=60+w/2+Math.random()*(360-w);MG.zc=MG.z0}
function tmTick(dt){const M=MG,c=document.getElementById('tm');if(!c)return;M.t+=dt;if(M.round>=4)M.zc=M.z0+Math.sin(M.t*1.2)*40;M.pos+=M.dir*M.speed*dt;if(M.pos>470){M.pos=470;M.dir=-1}if(M.pos<10){M.pos=10;M.dir=1}M.flash=Math.max(0,M.flash-dt);
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#2a302b';g.fillRect(0,0,480,72);
  g.fillStyle='#4a3a28';g.fillRect(0,48,480,24);
  g.fillStyle='rgba(226,191,114,.35)';g.fillRect(M.zc-M.zw/2,8,M.zw,40);g.fillStyle='rgba(226,191,114,.7)';g.fillRect(M.zc-M.zw*.18,8,M.zw*.36,40);
  g.fillStyle='#c9a36a';g.fillRect(M.zc-3,10,6,38);g.fillRect(M.zc-12,20,24,4);g.fillStyle='#8a6a3a';g.fillRect(M.zc-6,4,12,10);
  const x=Math.round(M.pos);g.fillStyle='#6a4e2e';g.fillRect(x-1,24,3,46);g.fillStyle='#d3d7da';g.fillRect(x-3,18,7,7);g.fillStyle='#b8322a';g.fillRect(x-2,27,5,2);
  if(M.flash>0){g.fillStyle=`rgba(255,255,255,${M.flash*2})`;g.fillRect(0,0,480,72)}}
export function tmHit(){const M=MG;if(!M||M.type!=='timing'||M.round>=6)return;const d=Math.abs(M.pos-M.zc),pts=d<M.zw*.18?2:d<M.zw/2?1:0;M.score+=pts;M.res.push(pts);M.round++;M.speed+=60;M.flash=.25;tmZone();
  const info=document.getElementById('tmInfo');if(info)info.textContent=(pts===2?'Trúng hiểm!':pts?'Trúng!':'Trượt!')+`  ·  Điểm ${M.score}  ·  `+(M.round<6?`Lượt ${M.round+1}/6`:'Xong');
  if(M.round>=6)setTimeout(tmEnd,500)}
function tmEnd(){const sc=MG.score;setMG(null);S.pending=null;let title,body;
  practice('ngua');
  if(sc>=9){S.flags.train='top';gain('vo',5);title='Xuất sắc nhất đội';body='<p>Đường giáo của bạn nhanh và chuẩn đến mức cả bãi tập phải dừng lại xem.</p>'+(S.nguMet?'<p>Một viên tướng trẻ cưỡi ngựa đi qua, dừng lại nhìn bạn rất lâu. Bạn nhận ra anh Ngũ đứng đọc sách bên đường năm nào, nay đã là tướng dưới trướng Hưng Đạo Vương. Anh gật đầu: "Ta nhớ cậu."</p>':'')+'<p class="note">Khi có biến, bạn sẽ khỏe hơn trong chiến đấu.</p>';if(S.nguMet)S.flags.nguKnows=true}
  else if(sc>=5){S.flags.train='ok';gain('vo',3);title='Đạt yêu cầu';body='<p>Bạn hoàn thành buổi tập, được võ quan khen một câu.</p>'}
  else{S.flags.train='low';gain('vo',1);title='Cần luyện thêm';body='<p>Mấy lần bạn đâm trượt hình nộm, bị đội trưởng mắng trước hàng quân.</p>'}
  showModal({kicker:`Điểm ${sc}/12`,title,body});trainPromote();nextModal();save()}
