/* ================= chương hai · gặp dân binh ================= */
/* Hư cấu (đội dân binh, người cầm đầu, lời nói), trừ các tin có src (Toàn thư, tháng 2 năm 1285).
   Bạn cùng trai làng gia nhập một đội dân binh ven sông. S.c2.doi: số người làng theo bạn.
   Sau cảnh này là chỗ dừng hiện tại của chương hai (showCho): biên niên chương hai, "còn tiếp: Chương Dương". */
import {S,save} from '../state.js';
import {gain,showModal} from '../ui.js';
import {traiFromTieng} from '../stats.js';
import {ch2Go,ch2Note} from './index.js';
import {villageMen} from './chuongduong.js';

const src=t=>`<p class="src">Toàn thư chép: ${t}</p>`;
const K='Xuân 1285 · tháng hai';

export function startDanbinh(){S.c2.scene='danbinh';save();
  const doi=Math.min(5,traiFromTieng()+(S.c2.tron&&S.c2.tron.ok?1:0)+(S.c2.tancu.o==='o'?1:0)+(S.career&&S.career.doi?1:0));
  S.c2.doi=doi;S.c2.men=null;villageMen();
  const co=S.co==='village'?'<p>Cò vác giáo đứng sau lưng bạn: "Mày đi đâu tao đi đấy."</p>':'<p>Cò đang ở trong quân Hoài Văn hầu Quốc Toản. Không ai biết đội ấy giờ đánh ở đâu.</p>';
  showModal({kicker:K,title:'Dân binh bến Tranh',
    body:`<p>Ở vùng đầm phía nam, bạn gặp một đội dân binh chừng hai trăm người, giáo mác tự rèn, thuyền nan tự chèo. Người cầm đầu là ông Đoàn, một lão thuyền chài mặt rám nắng.</p>
      <p>"Quân triều rút về phía nam, giặc đông như kiến. Nhưng sông nước là của mình. Anh${doi?` đem theo được ${doi} trai làng (${S.c2.men.map(m=>m.name).join(', ')})`:''}, vào đội thì vào."</p>${co}<p class="note">Ông Đoàn và đội dân binh là hư cấu.</p>`,
    choices:[{label:'Vào đội dân binh',fn:()=>{ch2Note(`Tháng hai năm 1285, bạn vào đội dân binh của ông Đoàn${doi?', đem theo '+doi+' trai làng':''}.${S.co==='village'?' Cò theo bạn.':''}`);news()}}]});
}

function news(){
  showModal({kicker:K,title:'Tin dữ, tin hùng',
    body:`<p>Tin tức truyền qua những người chạy giặc. Có vị hầu tông thất đem cả quân ra hàng giặc. Rồi tin Bảo Nghĩa Vương Trần Bình Trọng đánh giặc ở bãi Đà Mạc, bị bắt. Giặc dụ phong làm vương đất Bắc, ông không chịu, bị giết.</p>
      <p>Ông Đoàn đọc to câu người ta truyền nhau: <b>"Ta thà làm ma nước Nam chứ không thèm làm vương đất bắc."</b> Cả đội lặng đi.</p>
      ${src('tháng 2 năm 1285, Chương Hiến hầu Trần Kiện đem quân hàng giặc. Bảo Nghĩa Vương Trần Bình Trọng đánh giặc ở bãi Đà Mạc, bị bắt, không chịu ăn, không đáp lời giặc hỏi việc nước; giặc hỏi có muốn làm vương đất Bắc không thì ông thét câu trên rồi bị giết. Hai vua đi thuyền nhỏ lánh giặc.')}`,
    choices:[
      {label:'Thề trước cả đội: không bao giờ hàng giặc',note:'+Tiếng',fn:()=>{gain('tieng',2);S.c2.the='the';ch2Note('Nghe tin Trần Bình Trọng, bạn thề trước đội dân binh không bao giờ hàng giặc.');ch2Go('cd')}},
      {label:'Lặng lẽ mài lại lưỡi giáo',note:'+Võ',fn:()=>{gain('vo',2);S.c2.the='mai';ch2Note('Nghe tin Trần Bình Trọng, bạn lặng lẽ mài lại lưỡi giáo suốt đêm.');ch2Go('cd')}}]});
}

/* Chỗ dừng hiện tại: phần sau (Chương Dương, Hàm Tử, Vân Đồn, Bạch Đằng) đang làm. */
export function showCho(){S.c2.scene='cho';save();
  showModal({kicker:'Chương hai · còn tiếp',title:'Biên niên chương hai',wide:true,
    body:`<ul class="chron">${S.c2.chron.map(l=>`<li>${l}</li>`).join('')}</ul><p>Giặc tan ở Chương Dương, nhưng Toa Đô, Ô Mã Nhi còn ở phía nam…</p><p class="note">Phần tiếp theo (giặc tan, vua về kinh) đang làm. Lần sau mở game sẽ chơi tiếp từ đây.</p>`,
    choices:[{label:'Bắt đầu một cuộc đời mới',fn:()=>{try{localStorage.removeItem('dvmd-save')}catch(e){}location.reload();return false}}]});
}
