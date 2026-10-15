/* ================= nghề ================= */
/* Nghề học được qua việc làm, không có điểm số: chưa biết hoặc đã biết. Mỗi lần làm việc đúng nghề thì thêm
   tiến độ (practice); đủ NGHE[id].need thì biết nghề, có thông báo. Tiến độ ở S.nghe[id] (số), đã biết khi
   S.nghe[id] >= need. Nghề nào cũng có tác dụng trong chương một (ghi trong effect), và là chỗ dựa cho chương hai
   (chèo thuyền cho Bạch Đằng, thuốc nam cho cảnh cứu người, cưỡi ngựa cho các trận đánh).
   Thêm nghề: thêm một dòng vào NGHE, gọi practice(id) ở chỗ học, đọc knows(id) ở chỗ dùng, và có dòng biên niên. */
import {S} from './state.js';
import {toast} from './ui.js';

export const NGHE={
  boi:{name:'Bơi lội',need:6,how:'câu cá, đẩy thuyền, cứu người dưới nước, đắp đê lúc lụt',
    effect:'Lụt năm 1270: quen nước, lội lụt vác bao nhanh hơn. Bị giải qua sông thì nhớ con nước (chương hai: thoát theo đường sông).'},
  cheo:{name:'Chèo thuyền',need:4,how:'giúp ông lái đò bến sông Tô Lịch chèo đò, mỗi mùa một lần',
    effect:'Chương hai: chèo thuyền đi đánh trên sông. Bị giải sang sông thì nhớ được đường nước.'},
  thuoc:{name:'Thuốc nam',need:5,how:'hái lá thuốc, sắc thuốc chữa người, chữa trâu, hỏi sư cụ',
    effect:'Đậu mùa năm 1278: tự sắc thuốc cho cha. Đêm giặc đến: một lần tự băng bó, hồi 1 máu.'},
  ngua:{name:'Cưỡi ngựa',need:3,how:'luyện ở Giảng võ đường, tập trận năm 1283 (đường võ)',
    effect:'Chương hai: đi ngựa đưa tin, đánh trận. Ở trại giặc: nhìn bãi ngựa biết quân số kỵ binh.'},
  ren:{name:'Nghề rèn',need:4,how:'phụ bác thợ rèn quai búa (từ 14 tuổi)',
    effect:'Rèn giáo cho trai làng (lo trước ngày giặc đến) chỉ mất 7 quan thay vì 16; tự rèn lại kiếm gỉ.'},
};
export const knows=id=>((S.nghe||{})[id]||0)>=NGHE[id].need;
export const ngheList=()=>Object.keys(NGHE).filter(knows);
/* thêm n bước học nghề id; vừa đủ thì báo đã biết nghề */
export function practice(id,n=1){if(!S.nghe)S.nghe={};const was=knows(id);S.nghe[id]=Math.min(NGHE[id].need,(S.nghe[id]||0)+n);
  if(!was&&knows(id))setTimeout(()=>toast('Nghề mới: '+NGHE[id].name+'. '+NGHE[id].effect,6000),400)}
/* dòng biên niên về nghề */
export function ngheChronicle(){const k=ngheList();if(!k.length)return'Chưa học được nghề gì ngoài việc nhà.';
  return'Nghề đã học: '+k.map(id=>NGHE[id].name.toLowerCase()).join(', ')+'.'}
