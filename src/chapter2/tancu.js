/* ================= chương hai · tản cư ================= */
/* Hư cấu. Sáng sau đêm giặc đến (hoặc sau khi trốn khỏi trại): kiểm lại người, nhà; chọn ở lại chôn cất hay đi ngay,
   lo cho cha (cha yếu từ năm đậu mùa mà không biết thuốc nam thì mất trên đường), góp thóc cho quân hay chia cho dân.
   Lựa chọn ghi S.c2.tancu {o, cha, gop}; mỗi lựa chọn có dòng biên niên (ch2Note). */
import {S,save} from '../state.js';
import {gain,showModal} from '../ui.js';
import {gainThe} from '../stats.js';
import {knows} from '../nghe.js';
import {ch2Go,ch2Note} from './index.js';

const K='Xuân 1285 · tháng giêng';
const BNAME={home:'nhà bạn',nha1:'nhà hàng xóm',nha2:'nhà chị Lụa',batu:'nhà bà Tư',truong:'trường làng',vo:'nhà lão võ sư'};
const lc=n=>/^(Mẹ|Cha|Bà|Bé|Cụ|Trai|Cu)/.test(n)?n[0].toLowerCase()+n.slice(1):n;

export function startTancu(){S.c2.scene='tancu';S.x=43.5;S.y=70.4;save();
  const r=S.res||{},tr=S.c2.tron,burnt=(r.burnt||[]).map(b=>BNAME[b]).filter(Boolean);
  const lost=tr?tr.lost:(r.lostWho||[]).map(p=>p.name);
  const open=tr?(tr.ok?`<p>Bạn về tới bìa rừng làng An Phú lúc mặt trời lên cao. Mẹ chạy ra, ôm lấy bạn không nói được câu nào.${tr.saved.length?' Những người bạn đưa về cũng được người nhà đón.':''}</p>`
      :`<p>Bạn bơi vào bờ, lần theo bờ sông về làng. Ba hôm sau mới tới bìa rừng An Phú. Mẹ tưởng bạn đã chết.</p>`)
    :`<p>Sáng ngày 13 tháng giêng. Khói còn bốc lên từ những nóc nhà cháy. Người làng từ trong rừng lần lượt đi ra, đứng lặng nhìn xóm.</p>`;
  showModal({kicker:K,title:'Làng sau đêm giặc',
    body:`${open}<p>${burnt.length?'Cháy rụi: '+burnt.join(', ')+'.':'Nhà cửa còn, nhưng thóc gạo, trâu bò bị giặc cướp gần hết.'}</p>
      ${lost.length?`<p>Không còn ở đây: ${lost.map(lc).join(', ')}. Người làng thắp hương ở đầu ngõ, không ai dám nói là đã mất.</p>`:''}
      <p>Người ta bảo giặc còn đi lùng khắp vùng. Cụ xã muốn cả làng xuống phía nam, vào vùng đầm lầy lánh nạn.</p><p class="note">Hư cấu.</p>`,
    choices:[
      {label:'Ở lại một ngày, chôn cất người chết, dựng mái che cho người già',note:'+Đức · đi chậm một ngày',fn:()=>{S.c2.tancu.o='o';gain('duc',3);
        ch2Note('Sáng sau đêm giặc, bạn ở lại chôn cất người chết, dựng mái che cho người già rồi mới đi.');cha()}},
      {label:'Giục mọi người đi ngay khi giặc chưa quay lại',note:'+Tiếng',fn:()=>{S.c2.tancu.o='di';gain('tieng',2);
        ch2Note('Sáng sau đêm giặc, bạn giục cả làng đi ngay. Mồ mả người chết đắp vội, chưa kịp thắp hương.');cha()}}]});
}

function cha(){
  if(!S.cha)return thoc();
  const weak=S.flags.daumua==='muon';
  if(weak&&!knows('thuoc')){S.cha=false;S.c2.tancu.cha='mat';gainThe(-2);
    ch2Note('Cha yếu từ năm đậu mùa, mất trên đường tản cư. Bạn chôn cha dưới gốc gạo bên bờ đầm.');
    return showModal({kicker:K,title:'Cha',body:`<p>Đi được hai ngày, cha lên cơn sốt. Từ năm đậu mùa, cha chưa bao giờ khỏe lại hẳn. Không ai trong đoàn biết thuốc.</p><p>Đêm thứ ba, cha nắm tay bạn: "Giữ lấy mẹ, giữ lấy làng." Rồi cha đi.</p><p class="note">Hư cấu.</p>`,choices:[{label:'Chôn cha dưới gốc gạo',fn:()=>thoc()}]})}
  showModal({kicker:K,title:'Cha',body:`<p>Cha ${weak?'thở dốc sau mỗi quãng đường':'đã có tuổi, chân đi không nổi đường dài'}. ${weak?'May bạn biết thuốc nam, hái được lá dọc đường sắc cho cha uống.':''}</p><p>Sư cụ chùa làng bên nhắn: chùa ở sâu trong rừng, giặc chưa tới. Người già ở lại đó được.</p><p class="note">Hư cấu.</p>`,
    choices:[
      {label:'Gửi cha ở chùa với sư cụ',note:'bạn đi nhẹ người hơn',fn:()=>{S.c2.tancu.cha='chua';ch2Note('Bạn gửi cha ở chùa trong rừng với sư cụ.');thoc()}},
      {label:'Cõng cha theo',note:'−Thể trạng · +Đức',fn:()=>{S.c2.tancu.cha='cong';gainThe(-3);gain('duc',2);ch2Note('Bạn cõng cha suốt đường tản cư, không để cha ở lại.');thoc()}}]});
}

function thoc(){
  const r=S.res||{};if(!(r.thoc>0))return go();
  showModal({kicker:K,title:'Mấy bao thóc',body:`<p>Bạn còn ${r.thoc} bao thóc giấu được đêm ấy. Có người của quân Trần đi các làng xin lương cho quân. Trong đoàn tản cư, mấy nhà đã hết gạo, trẻ con khóc vì đói.</p><p class="note">Hư cấu.</p>`,
    choices:[
      {label:'Góp thóc cho quân',note:'+Tiếng',fn:()=>{S.c2.tancu.gop='quan';gain('tieng',3);ch2Note('Bạn góp thóc cứu được đêm giặc đến làm lương cho quân Trần.');go()}},
      {label:'Chia cho những nhà đã hết gạo',note:'+Đức',fn:()=>{S.c2.tancu.gop='dan';gain('duc',3);ch2Note('Bạn chia thóc cứu được cho những nhà tản cư đã hết gạo.');go()}}]});
}
function go(){save();ch2Go('danbinh')}
