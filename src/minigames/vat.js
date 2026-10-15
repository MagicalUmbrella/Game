/* ================= minigame: đấu vật hội xuân ================= */
/* Hư cấu: sới vật hội xuân ở đình làng An Phú. Mỗi năm vào mùa xuân (từ 14 tuổi) được vào sới một lần.
   Ba đô lần lượt (VAT_OPP), thắng đô này năm sau mới gặp đô kế. Hạ cả ba thì thành đô vật của làng (S.vat.do):
   đêm 1285 thêm 1 máu (climax.js), có dòng biên niên.
   Cách chơi (trong khung modal, MG.type 'vat', vẽ bằng MG.tick, phím qua MG.modalKey): đối thủ đẩy vạch về phía
   bạn; bấm luân phiên A và D (hoặc ← →) để đẩy lại, Võ và thể trạng cao thì mỗi lần đẩy mạnh hơn. Khi đối thủ
   hở thế (vạch nhấp nháy vàng) bấm Space để quật: đang không bị dồn thì thắng luôn. Quật lúc đối thủ đứng vững
   thì mình mất thế. Đẩy đối thủ ra khỏi sới (vạch chạm mép phải) cũng thắng; bị đẩy ra mép trái là thua.
   Hết giờ thì ai đang lấn hơn thắng. */
import {personSprite} from '../sprites.js';
import {MG,S,save,setMG} from '../state.js';
import {gain,nextModal,showModal,toast} from '../ui.js';

const CW=480,CH=96;
export const VAT_OPP=[{name:'Trai xóm Đông',push:.3,gap:3.2},{name:'Đô Hảo làng bên',push:.42,gap:3.6},{name:'Đô Mạnh ở kinh thành',push:.55,gap:4.2}];
export const VAT_T=18,OPEN_T=.55;
export const vatState=()=>S.vat||(S.vat={lv:0,last:0,won:0,lost:0,do:false});
export const vatPush=()=>.055*(1+S.vo/120+(S.the-50)/250);   // mỗi lần đẩy đúng nhịp (luân phiên hai phím)
export const vatOpen=()=>age0()>=14&&S.season===0&&vatState().last!==S.year&&!vatState().do;
const age0=()=>S.year-1258;

/* lv: đô thứ mấy; done(win) gọi sau khi đóng khung; thach: trai làng thách (không tính vào hội) */
export function startVat(done,lvOverride){const V=vatState(),lv=lvOverride!=null?lvOverride:V.lv,o=VAT_OPP[lv];
  setMG({type:'vat',t:0,p:0,last:null,openT:0,nextOpen:1.6+Math.random()*1.4,over:false,flash:0,lv,o,done,tick,modalKey:key});
  showModal({kicker:'Sới vật hội xuân',title:`Vật với ${o.name}`,body:`<p>Bấm luân phiên <kbd>A</kbd> <kbd>D</kbd> (hoặc <kbd>←</kbd> <kbd>→</kbd>) để đẩy vạch sang phía đối thủ. Thấy đối thủ <b>hở thế</b> (vạch nhấp nháy vàng) thì bấm <kbd>Space</kbd> quật ngã. Quật lúc người ta đứng vững là tự mất thế.</p>
    <canvas id="vt" width="${CW}" height="${CH}" style="width:100%;max-width:${CW}px;image-rendering:pixelated;border:2px solid #0b0d0c"></canvas><p class="note" id="vtInfo">&nbsp;</p>`,
    choices:[{label:'Xin thua',note:'chịu thua, ra khỏi sới',fn:()=>{finish(false);return false}}]})}
function info(t){const e=document.getElementById('vtInfo');if(e)e.textContent=t}
function finish(win,msg){const M=MG;if(!M||M.type!=='vat'||M.over)return;M.over=true;if(msg)info(msg);
  setTimeout(()=>{if(MG===M){setMG(null);nextModal()}M.done(win)},msg?700:0)}
export function vatFlush(){const M=MG;if(M&&M.type==='vat'&&M.over){setMG(null);nextModal();M.done(M.p>0)}}
function key(k){const M=MG;if(!M||M.type!=='vat'||M.over)return false;
  const side=k==='a'||k==='arrowleft'?'L':k==='d'||k==='arrowright'?'R':null;
  if(side){M.p=Math.min(1,M.p+vatPush()*(M.last===side?.25:1));M.last=side;if(M.p>=1)finish(true,'Đẩy đối thủ ra khỏi sới!');return true}
  if(k===' '||k==='e'){
    if(M.openT>0){if(M.p>-.3)finish(true,'Quật ngã! Cả hội reo hò.');else{M.p+=.25;M.openT=0;M.flash=.3;info('Quật được nửa vời, gỡ lại được ít thế.')}}
    else{M.p-=.15;M.flash=-.3;info('Quật hụt, mất thế!');if(M.p<=-1)finish(false,'Bị đẩy ra khỏi sới.')}
    return true}
  return false}
function tick(dt){const M=MG;if(!M||M.type!=='vat')return;const c=document.getElementById('vt');if(M.over)return draw(c);
  M.t+=dt;M.flash=M.flash>0?Math.max(0,M.flash-dt):Math.min(0,M.flash+dt);
  M.p-=M.o.push*dt*(1+.45*Math.sin(M.t*2.3+M.lv));
  if(M.openT>0)M.openT-=dt;else if((M.nextOpen-=dt)<=0){M.openT=OPEN_T;M.nextOpen=M.o.gap*(.7+Math.random()*.6)}
  if(M.p<=-1)finish(false,'Bị đẩy ra khỏi sới.');else if(M.t>=VAT_T)finish(M.p>0,M.p>0?'Hết giờ, bạn lấn hơn.':'Hết giờ, đối thủ lấn hơn.');
  else info(`Còn ${Math.ceil(VAT_T-M.t)} giây`+(M.openT>0?' · Đối thủ hở thế!':''));
  draw(c)}
function draw(c){const M=MG;if(!c||!M||M.type!=='vat')return;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  g.fillStyle='#4a3a28';g.fillRect(0,0,CW,CH);g.fillStyle='#6e5638';g.fillRect(20,20,CW-40,CH-40);   // sới đất
  g.fillStyle='#8a2a22';g.fillRect(20,20,8,CH-40);g.fillStyle='#2a5a4a';g.fillRect(CW-28,20,8,CH-40);   // mép sới: trái là phía bạn
  const x=CW/2+M.p*(CW/2-36),open=M.openT>0&&Math.floor(M.t*10)%2===0;
  g.fillStyle=open?'#f2e6a8':M.flash<0?'#e07f6b':M.flash>0?'#9fcaa9':'#efe8d4';g.fillRect(x-4,12,8,CH-24);
  // hai đô (hình người như ngoài bản đồ, phóng 2 lần): bạn bên trái vạch, đối thủ bên phải, chúi vào nhau
  const me={id:S.path==='van'?'ban_van':S.path==='vo'?'ban_vo':'ban_nong'},f=Math.floor(M.t*8)%2?1:2;
  g.drawImage(personSprite(me,'right',f),x-58,6,64,80);g.drawImage(personSprite({id:'trai'},'left',f),x-6,6,64,80);
  g.fillStyle='#efe8d4';g.font='12px sans-serif';g.textBaseline='top';g.fillText('Bạn',30,4);g.textAlign='right';g.fillText(M.o.name,CW-30,4);g.textAlign='left'}

/* ---------- vào hội (cửa đình, mùa xuân) ---------- */
export function hoiVat(){const V=vatState();V.last=S.year;
  startVat(win=>{const o=VAT_OPP[V.lv];
    if(win){V.won++;gain('tieng',2);gain('tien',1);
      if(V.lv>=VAT_OPP.length-1){V.do=true;showModal({kicker:`Xuân · ${S.year}`,title:'Đô vật làng An Phú',body:`<p>Bạn quật ngã ${o.name} giữa tiếng trống chầu. Các cụ trao giải là một tấm lụa đỏ, cả làng công kênh bạn quanh sân đình.</p><p class="note">Hư cấu. Từ nay bạn là đô vật của làng. Quen vật lộn tay không, đêm giặc đến bạn chịu đòn được hơn (thêm 1 máu).</p>`})}
      else{V.lv++;toast(`Bạn thắng ${o.name}! Năm sau sới hội sẽ có đô khác mạnh hơn.`,4600)}}
    else{V.lost++;toast(`${o.name} thắng keo này. Năm sau lại vào sới.`,4200)}
    save()})}
