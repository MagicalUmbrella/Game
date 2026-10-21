/* ================= chương hai · gặp dân binh ================= */
/* Hư cấu (đội dân binh, người cầm đầu, lời nói), trừ các tin có src (Toàn thư, tháng 2 năm 1285).
   Bạn cùng trai làng gia nhập một đội dân binh ven sông. S.c2.doi: số người làng theo bạn.
   Sau cảnh này là đêm ở trại dân binh (traiDB.js, tin Trần Bình Trọng), hai nhiệm vụ (dotin.js, cuopluong.js), rồi trận Chương Dương. showCho: chỗ dừng hiện tại của chương hai, biên niên chương hai, "còn tiếp". */
import {S,save} from '../state.js';
import {showModal} from '../ui.js';
import {msChronicle} from './matseo.js';
import {traiFromTieng} from '../stats.js';
import {ch2Go,ch2Note} from './index.js';
import {villageMen} from './chuongduong.js';

const K='Xuân 1285 · tháng hai';

export function startDanbinh(){S.c2.scene='danbinh';save();
  const doi=Math.min(5,traiFromTieng()+(S.c2.tron&&S.c2.tron.ok?1:0)+(S.c2.tancu.o==='o'?1:0)+(S.career&&S.career.doi?1:0)+(S.c2.tancu.gop==='dan'?1:0));   // chia thóc cho dân tản cư: một người nhà được cứu đói theo bạn vào đội
  S.c2.doi=doi;S.c2.men=null;villageMen();
  const co=S.co==='village'?'<p>Cò vác giáo đứng sau lưng bạn: "Mày đi đâu tao đi đấy."</p>':'<p>Cò đang ở trong quân Hoài Văn hầu Quốc Toản. Không ai biết đội ấy giờ đánh ở đâu.</p>';
  showModal({kicker:K,title:'Dân binh bến Tranh',
    body:`<p>Ở vùng đầm phía nam, bạn gặp một đội dân binh chừng hai trăm người, giáo mác tự rèn, thuyền nan tự chèo. Người cầm đầu là ông Đoàn, một lão thuyền chài mặt rám nắng.</p>
      <p>"Quân triều rút về phía nam, giặc đông như kiến. Nhưng sông nước là của mình. Anh${doi?` đem theo được ${doi} trai làng (${S.c2.men.map(m=>m.name).join(', ')})`:''}, vào đội thì vào."</p>${S.c2.tancu.gop==='dan'&&doi?'<p>Trong số ấy có một người tản cư hôm trước được bạn chia thóc cứu đói, cũng xin theo bạn.</p>':''}${co}<p class="note">Ông Đoàn và đội dân binh là hư cấu.</p>`,
    choices:[{label:'Vào đội dân binh',fn:()=>{ch2Note(`Tháng hai năm 1285, bạn vào đội dân binh của ông Đoàn${doi?', đem theo '+doi+' trai làng':''}.${S.co==='village'?' Cò theo bạn.':''}`);ch2Go('traiA')}}]});
}

/* Chỗ dừng hiện tại: phần sau (Chương Dương, Hàm Tử, Vân Đồn, Bạch Đằng) đang làm. */
export function showCho(){S.c2.scene='cho';save();
  showModal({kicker:'Chương hai · còn tiếp',title:'Biên niên chương hai',wide:true,
    body:`<ul class="chron">${S.c2.chron.map(l=>`<li>${l}</li>`).join('')}${msChronicle()?`<li>${msChronicle()}</li>`:''}</ul><p>Năm Bính Tuất 1286, làng An Phú dựng lại trên nền cũ. Nhưng người ta bảo giặc phương bắc chưa chịu thôi…</p><p class="note">Phần tiếp theo (giữa hai cuộc chiến, 1286–1287) đang làm. Lần sau mở game sẽ chơi tiếp từ đây.</p>`,
    choices:[{label:'Bắt đầu một cuộc đời mới',fn:()=>{try{localStorage.removeItem('dvmd-save')}catch(e){}location.reload();return false}}]});
}
