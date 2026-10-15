/* ================= minigame: việc hằng ngày ================= */
/* Học chữ (nhớ nét bút), luyện võ (canh nhịp đòn), làm đồng (bấm theo nhịp câu hò), câu cá (canh phao).
   Mỗi lần chơi 5–15 giây trong khung modal (MG.type 'daily', vẽ qua MG.tick, phím qua MG.modalKey).
   Kết quả q từ 0 đến 1, hoặc null nếu bấm "Làm qua loa"; nơi gọi tự quyết phần thưởng theo q
   (dailyReward). Sức đã trừ trước khi gọi. */
import {MG,S,setMG} from '../state.js';
import {nextModal,showModal} from '../ui.js';
import {SEASONS} from '../constants.js';

const CW=480,CH=96;
const DIRS={w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right'};

/* Phần thưởng chung: chơi khá (q ≥ 0.5) được đúng mức cũ, giỏi (q ≥ hi) thêm 1, kém hoặc làm qua loa bớt 1. */
export const dailyReward=(base,q,hi=1)=>q==null||q<.5?Math.max(1,base-1):q>=hi?base+1:base;

function start(kind,title,intro,state,done,quick){
  setMG({type:'daily',kind,t:0,over:false,flash:0,...state,done,tick,modalKey:key});
  showModal({kicker:'Việc hằng ngày · tốn 1 Sức',title,body:`<p>${intro}</p><canvas id="dl" width="${CW}" height="${CH}" style="width:100%;max-width:${CW}px;image-rendering:pixelated;border:2px solid #0b0d0c"></canvas><p class="note" id="dlInfo">&nbsp;</p>`,
    choices:[{label:quick||'Làm qua loa',note:'ít kết quả hơn',fn:()=>{finish(null);return false}}]});
}
function info(t){const e=document.getElementById('dlInfo');if(e)e.textContent=t}
let pending=null;
function finish(q,delay=0){const M=MG;if(!M||M.type!=='daily'||M.over)return;M.over=true;
  const end=()=>{if(pending!==end)return;pending=null;if(MG===M){setMG(null);nextModal()}M.done(q)};pending=end;delay?setTimeout(end,delay):end()}
// Kết thúc ngay phần đang chờ (đang hiện lời nhận xét trước khi đóng). Dùng cho test.
export function dailyFlush(){if(pending)pending()}

/* ---------- học chữ: nhớ nét ---------- */
export function startWriting(done){
  const n=Math.min(7,3+Math.floor(S.van/25)),pool=['up','down','left','right'];
  const seq=Array.from({length:n},()=>pool[Math.floor(Math.random()*4)]);
  start('viet','Tập viết','Nhớ thứ tự các nét bút thầy viết mẫu, rồi viết lại bằng <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> (hoặc phím mũi tên). Văn càng cao, bài càng dài.',
    {seq,inp:[],phase:'show',showT:1.1+.35*n,limit:2.2+1.1*n},done);
  info(`Nhớ ${n} nét…`);
}
/* ---------- luyện võ: ba đòn canh nhịp ---------- */
export function startDrill(done){
  const zw=Math.max(26,Math.min(100,24+S.vo*.7));
  start('vo','Luyện võ','Bấm <kbd>Space</kbd> hoặc <kbd>E</kbd> khi mũi côn ở vùng sáng của cọc gỗ. Ba đòn, đòn sau nhanh hơn. Võ càng cao, vùng sáng càng rộng.',
    {pos:10,dir:1,speed:270,round:0,pts:0,zw,zc:0},done);
  zone();info('Đòn 1/3');
}
function zone(){const M=MG;M.zc=60+M.zw/2+Math.random()*(CW-120-M.zw)}
/* ---------- làm đồng: bấm theo nhịp ---------- */
const FIELD=['Cấy lúa','Làm cỏ','Gặt lúa','Cày ải'];
export function startField(done){
  const notes=[];let tt=1.1;for(let i=0;i<8;i++){notes.push({t:tt,k:i%2?'d':'a',hit:false,miss:false});tt+=.5+Math.random()*.18}
  start('dong',FIELD[S.season],`${SEASONS[S.season]}: ${FIELD[S.season].toLowerCase()} theo câu hò. Bấm <kbd>A</kbd> hoặc <kbd>D</kbd> đúng lúc bó mạ chạm vạch.`,{notes,end:tt+.4},done);
  info('Sẵn sàng…');
}
/* ---------- câu cá: canh phao ---------- */
export function startFishing(done){
  const bite=2.4+Math.random()*3.6,nib=[];for(let x=.9+Math.random();x<bite-.7;x+=.9+Math.random()*1.2)nib.push(x);
  start('ca','Câu cá','Phao <b>chìm hẳn</b> thì bấm <kbd>Space</kbd> hoặc <kbd>E</kbd> giật cần. Phao chỉ rung nhẹ là cá đang rỉa mồi, giật lúc ấy cá sổng mất.',
    {bite,win:.6,nib},done,'Ngồi chờ may rủi');
  info('Phao nằm im trên mặt nước…');
}

function key(k){const M=MG;if(!M||M.type!=='daily'||M.over)return false;
  if(M.kind==='viet'){const d=DIRS[k];if(!d||M.phase!=='input')return!!d;M.inp.push(d);const i=M.inp.length-1;
    if(d!==M.seq[i]){M.flash=-.3;info(`Sai nét thứ ${i+1}.`);finish(i/M.seq.length,700)}else if(M.inp.length===M.seq.length){info('Đúng hết!');finish(1,600)}return true}
  const hit=k===' '||k==='e';
  if(M.kind==='vo'&&hit){const d=Math.abs(M.pos-M.zc),p=d<M.zw*.18?2:d<M.zw/2?1:0;M.pts+=p;M.round++;M.speed+=70;M.flash=p?.25:-.25;
    info((p===2?'Trúng hiểm!':p?'Trúng!':'Trượt!')+(M.round<3?`  ·  Đòn ${M.round+1}/3`:''));if(M.round>=3)finish(M.pts/6,600);else zone();return true}
  if(M.kind==='dong'&&(k==='a'||k==='d'||k==='arrowleft'||k==='arrowright')){const kk=k==='arrowleft'?'a':k==='arrowright'?'d':k;
    const n=M.notes.find(n=>!n.hit&&!n.miss&&Math.abs(n.t-M.t)<.17);if(n&&n.k===kk){n.hit=true;M.flash=.15}else M.flash=-.15;return true}
  if(M.kind==='ca'&&hit){if(M.t>=M.bite&&M.t<=M.bite+M.win){info('Dính rồi!');M.flash=.3;finish(1,600)}
    else{info(M.nib.some(x=>M.t>=x&&M.t<x+.35)?'Giật lúc cá mới rỉa mồi, cá sổng mất.':'Giật hụt, cá chưa ăn.');M.flash=-.3;finish(0,800)}return true}
  return false}

function tick(dt){const M=MG,c=document.getElementById('dl');if(!M||M.type!=='daily')return;if(M.over)return draw(c);M.t+=dt;M.flash=M.flash>0?Math.max(0,M.flash-dt):Math.min(0,M.flash+dt);
  if(M.kind==='viet'&&!M.over){if(M.phase==='show'&&M.t>=M.showT){M.phase='input';M.t=0;info('Viết lại!')}else if(M.phase==='input'&&M.t>M.limit){info('Hết giờ.');finish(M.inp.length/M.seq.length,500)}}
  if(M.kind==='vo'){M.pos+=M.dir*M.speed*dt;if(M.pos>CW-10){M.pos=CW-10;M.dir=-1}if(M.pos<10){M.pos=10;M.dir=1}}
  if(M.kind==='dong'){for(const n of M.notes)if(!n.hit&&!n.miss&&M.t>n.t+.17)n.miss=true;const h=M.notes.filter(n=>n.hit).length;info(`Trúng ${h}/${M.notes.length}`);if(M.t>M.end)finish(h/M.notes.length)}
  if(M.kind==='ca'&&M.t>M.bite+M.win){info('Cá ăn mất mồi rồi.');finish(0,600)}
  draw(c)}

/* ---------- vẽ ---------- */
// Mũi tên 8×8 ô (mỗi ô 4 điểm ảnh), đầu tam giác rõ; các hướng khác xoay từ mẫu hướng lên.
const ARROW=['...##...','..####..','.######.','########','...##...','...##...','...##...','...##...'];
function arrow(g,x,y,d,col){g.fillStyle=col;
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(ARROW[r][c]!=='#')continue;
    const [px,py]=d==='up'?[c,r]:d==='down'?[c,7-r]:d==='left'?[r,c]:[7-r,c];g.fillRect(x+px*4,y+py*4,4,4)}}
function draw(c){const M=MG;if(!c||!M||M.type!=='daily')return;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  g.fillStyle='#2a302b';g.fillRect(0,0,CW,CH);
  if(M.kind==='viet'){g.fillStyle='#e8dcc0';g.fillRect(8,8,CW-16,CH-16);const n=M.seq.length,w=Math.min(56,(CW-40)/n),x0=(CW-w*n)/2;
    M.seq.forEach((d,i)=>{const x=x0+i*w+(w-32)/2,y=CH/2-16;
      if(M.phase==='show')arrow(g,x,y,d,'#2a1e16');
      else{g.fillStyle='#d6c8a8';g.fillRect(x-2,y-2,36,36);const u=M.inp[i];if(u)arrow(g,x,y,u,u===d?'#2a1e16':'#b8322a')}})}
  if(M.kind==='vo'){g.fillStyle='#4a3a28';g.fillRect(0,CH-24,CW,24);g.fillStyle='rgba(226,191,114,.35)';g.fillRect(M.zc-M.zw/2,10,M.zw,CH-34);g.fillStyle='rgba(226,191,114,.7)';g.fillRect(M.zc-M.zw*.18,10,M.zw*.36,CH-34);
    g.fillStyle='#8a6a3a';g.fillRect(M.zc-5,14,10,CH-38);g.fillStyle='#6a4e2e';g.fillRect(M.zc-14,30,28,5);
    const x=Math.round(M.pos);g.fillStyle='#6a4e2e';g.fillRect(x-2,22,4,CH-26);g.fillStyle='#3b2a1a';g.fillRect(x-2,18,4,6)}
  if(M.kind==='dong'){g.fillStyle='#5e7a3a';g.fillRect(0,CH-30,CW,30);g.fillStyle='#7fb3c8';g.fillRect(0,CH-30,CW,4);const hx=70;g.fillStyle='#e2bf72';g.fillRect(hx-2,6,4,CH-12);
    for(const n of M.notes){if(n.hit)continue;const x=hx+(n.t-M.t)*170;if(x<-20||x>CW+20)continue;g.fillStyle=n.miss?'#6b5a40':'#9fcaa9';g.fillRect(x-10,30,20,24);g.fillStyle='#2a302b';g.font='bold 14px system-ui';g.textAlign='center';g.fillText(n.k.toUpperCase(),x,47)}}
  if(M.kind==='ca'){g.fillStyle='#3d6f86';g.fillRect(0,30,CW,CH-30);g.fillStyle='#5b8ea4';for(let i=0;i<8;i++)g.fillRect((i*67+M.t*20)%CW,44+(i%3)*14,22,2);
    let dip=Math.sin(M.t*2.4)*1.5;for(const x of M.nib)if(M.t>=x&&M.t<x+.35)dip=4;if(M.t>=M.bite&&M.t<=M.bite+M.win)dip=16;
    g.fillStyle='#d3d7da';g.fillRect(CW/2-1,0,2,28+dip);g.fillStyle='#b8322a';g.fillRect(CW/2-4,24+dip,8,6);g.fillStyle='#efe8d4';g.fillRect(CW/2-4,30+dip,8,5)}
  if(M.flash){g.fillStyle=M.flash>0?`rgba(159,202,169,${M.flash*1.4})`:`rgba(224,127,107,${-M.flash*1.4})`;g.fillRect(0,0,CW,CH)}}
