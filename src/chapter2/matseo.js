/* ================= chương hai · Mặt Sẹo, kẻ thù riêng của bạn ================= */
/* Hư cấu hoàn toàn. Tên đầu toán giặc đêm 12 tháng giêng 1285 đốt làng An Phú (climax.js, hình 'giac_dau') có một
   vết sẹo chém ngang mặt; dân gọi hắn là Mặt Sẹo, tên thật Tháp Lạt Mạc. Hắn không có trong sử: chỉ là một viên bách
   hộ (chỉ huy trăm lính) hư cấu, để người chơi có một gương mặt giặc theo suốt chương hai, không đụng tới công các tướng
   có tên trong Toàn thư (bắt Ô Mã Nhi là Đỗ Hành, bắt Áo Lỗ Xích là Nguyễn Khoái).
   Bạn gặp lại hắn: trong trại Gia Lâm (bị bắt), ở toán cướp lương (cuopluong.js, hắn cưỡi ngựa chạy thoát), trên gò
   Chương Dương (hắn giữ gò, đánh lui thì hắn chạy), trên thuyền giặc rời trại Gia Lâm. Bạch Đằng 1288 (chưa làm) là chỗ
   bắt sống hắn. Mỗi lần gặp ghi S.c2.ms (danh sách chỗ gặp), kết quả đối đầu ghi S.c2.msWin. */
import {S} from '../state.js';

export const MS={name:'Mặt Sẹo',full:'Tháp Lạt Mạc',look:{id:'giac_dau'}};
export function msMeet(place){if(!S.c2)return;S.c2.ms=S.c2.ms||[];if(!S.c2.ms.includes(place))S.c2.ms.push(place)}
export const msMet=()=>!!(S.c2&&S.c2.ms&&S.c2.ms.length);
export function msWin(place){if(!S.c2)return;S.c2.msWin=S.c2.msWin||[];if(!S.c2.msWin.includes(place))S.c2.msWin.push(place)}
/* câu hắn nói khi nhận ra bạn: nhớ chuyện đêm 1285 */
export function msTaunt(place){const r=S.res||{};
  if(place==='trai')return r.boss==='killed'?'Mày tưởng chém ngã được ta à? Nằm yên trong chuồng mà chờ ngày giải về Bắc!':'Thằng làng An Phú! Nằm yên trong chuồng mà chờ ngày giải về Bắc!';
  if(r.boss==='killed')return 'Mày tưởng chém ngã được ta đêm ấy à? Ta còn sống, thằng làng An Phú!';
  if(r.boss==='tricked')return 'Thằng lừa ta đêm ấy! Lần này không có quân Trần nào vây cho mày đâu.';
  if(S.capt&&S.c2&&S.c2.tron&&S.c2.tron.ok)return 'Con chuột trốn khỏi chuồng tù đây rồi!';
  return 'Ta nhớ mặt mày. Đêm ấy ở làng An Phú!'}
/* đoạn kể ngắn cho biên niên chương hai */
export function msChronicle(){const m=(S.c2&&S.c2.ms)||[],w=(S.c2&&S.c2.msWin)||[];if(!m.length)return null;
  return `Mặt Sẹo, tên đầu toán đốt làng đêm tháng giêng, bạn gặp lại ${m.length} lần${w.length?`, ${w.length} lần đánh cho hắn phải chạy`:''}. Hắn vẫn còn sống.`}
