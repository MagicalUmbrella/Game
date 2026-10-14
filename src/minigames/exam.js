/* ================= minigame: kỳ thi 1275 ================= */
import {S,save,shuffle} from '../state.js';
import {gain,showModal,toast} from '../ui.js';

const QBANK=[
 {q:'Quốc học viện được lập vào năm nào?',a:['Năm 1226','Năm 1253','Năm 1258','Năm 1272'],c:1},
 {q:'Ai soạn bộ Đại Việt sử ký?',a:['Lê Văn Hưu','Trần Quốc Tuấn','Đào Tiêu','Lê Phụ Trần'],c:0},
 {q:'Đại Việt sử ký chép từ Triệu Vũ Đế đến đời nào?',a:['Lý Thái Tổ','Đinh Tiên Hoàng','Lý Chiêu Hoàng','Trần Thái Tông'],c:2},
 {q:'Năm Mậu Ngọ (1258), quân ta phá giặc ở bến nào?',a:['Bạch Đằng','Đông Bộ Đầu','Bình Than','Vạn Kiếp'],c:1},
 {q:'Tứ thư gồm Luận ngữ, Mạnh Tử, Đại học và sách nào?',a:['Kinh Thi','Trung dung','Kinh Dịch','Xuân Thu'],c:1},
 {q:'Sách nào KHÔNG thuộc Ngũ kinh?',a:['Kinh Thi','Kinh Thư','Kinh Lễ','Luận ngữ'],c:3},
 {q:'Năm 1271, Mông Cổ đặt quốc hiệu là gì?',a:['Đại Liêu','Đại Kim','Đại Nguyên','Đại Hạ'],c:2},
 {q:'Mùa thu năm Canh Ngọ (1270), kinh đô gặp chuyện gì?',a:['Hạn hán lớn','Nước to, phố phải đi bằng thuyền','Động đất','Bão làm đổ tháp'],c:1},
 {q:'Tam tự kinh mở đầu "Nhân chi sơ", câu tiếp theo là gì?',a:['tính bản thiện','tính tương cận','tập tương viễn','cẩu bất giáo'],c:0},
 {q:'Người Tống sang quy phụ được cho ở phường nào?',a:['Nhai Tuân','Giang Khẩu','Đông Hà','Thịnh Quang'],c:0},
 {q:'Ai đang làm vua năm 1275?',a:['Trần Thái Tông','Trần Thánh Tông','Trần Nhân Tông','Lý Huệ Tông'],c:1},
 {q:'Giảng võ đường được lập cùng năm với nơi nào?',a:['Tháp Báo Thiên','Quốc học viện','Điện Diên Hồng','Hành cung Thiên Trường'],c:1},
];
export function startExam(){const qs=shuffle(QBANK).slice(0,5),need=S.quests.sach==='done'?3:4,elim=S.van>=55?2:S.van>=35?1:0;let i=0,ok=0;
  const ask=()=>{const q=qs[i],off=shuffle([0,1,2,3].filter(j=>j!==q.c)).slice(0,elim);
    showModal({kicker:`Trường thi · câu ${i+1}/5`,title:q.q,body:elim?`<p class="note">Nhờ học rộng (Văn ${S.van}), bạn loại được ${elim} đáp án sai.</p>`:'<p class="note">Học thêm để loại được đáp án sai: Văn 35 loại 1, Văn 55 loại 2.</p>',
      choices:q.a.map((t,j)=>({label:t,disabled:off.includes(j),note:off.includes(j)?'loại':'',fn:()=>{if(j===q.c)ok++;i++;if(i<5)ask();else examResult(ok,need)}}))})};
  ask()}
function examResult(ok,need){S.pending=null;
  if(ok>=need){S.dothi=true;S.flags.exam='pass';S.flags.lang+=2;gain('duc',3);
    showModal({kicker:'Ngày xướng danh',title:'Đỗ Thái học sinh',body:`<p>Bạn trả lời đúng ${ok}/5 câu. Đào Tiêu đỗ Trạng nguyên, Quách Nhẫn đỗ Thám hoa, và tên bạn nằm trong bảng 27 Thái học sinh! Cả làng An Phú mở tiệc mừng.</p>`});
    showModal({kicker:'Tiệc mừng ở nhà',title:'Cò đứng ngoài ngõ',body:'<p>Giữa tiệc, bạn thấy Cò đứng ngoài ngõ, không vào. Cậu mặc bộ áo cũ, tay còn dính bùn.</p>',choices:[
      {label:'Ra kéo Cò vào ngồi mâm trên',note:'Cò thân hơn',fn:()=>{S.flags.exam='pass';S.rel.co+=2;toast('"Ông Thái học sinh mà vẫn nhớ thằng bạn chăn trâu này à?" Cò cười, mắt đỏ hoe.',5000)}},
      {label:'Mải tiếp khách quan, để Cò đứng đó',note:'Cò tủi thân',fn:()=>{S.flags.exam='khoe';S.rel.co=Math.max(0,S.rel.co-2);toast('Lúc bạn ngoảnh ra, Cò đã đi mất.',4000)}}]});
  }else{S.flags.exam='fail';showModal({kicker:'Ngày xướng danh',title:'Không có tên trên bảng',body:`<p>Bạn trả lời đúng ${ok}/5 câu, chưa đủ để đỗ. Đào Tiêu đỗ Trạng nguyên, cùng 27 người đỗ Thái học sinh.</p><p>${S.rel.co>=3?'Tối ấy Cò mang sang một vò rượu: "Trượt thì học tiếp, tớ còn chẳng biết chữ đây này."':'Mẹ nấu nồi chè đậu đen, không nhắc gì chuyện thi.'}</p>`})}
  save()}
