/* ================= intro ================= */
import {$} from './constants.js';
import {S,loadSave,newState,save,setS} from './state.js';
import {renderHUD,showModal} from './ui.js';
import {loseBuffalo} from './dialogs.js';
import {resumePending} from './events.js';
import {ch2Open,ch2Resume,ch2Start} from './chapter2/index.js';

export function titleScreen(){
  const sv=loadSave(),touch=matchMedia('(pointer:coarse)').matches&&!matchMedia('(pointer:fine)').matches;
  showModal({big:true,kicker:'Một cuộc đời dưới triều Trần',title:'Đại Việt Một Đời',
    body:`<p>Sinh năm Mậu Ngọ 1258, lớn lên ở làng An Phú bên sông Tô Lịch. Học chữ, luyện võ, làm ruộng, thương một người, giữ một người bạn, rồi đứng trước đêm giặc phương bắc kéo đến làng.</p><p class="note">Sự kiện lịch sử trong game theo Đại Việt sử ký toàn thư. Mọi lựa chọn đều có hậu quả.${touch?' Game cần bàn phím, nên chơi trên máy tính.':''}</p>`,
    choices:[...(sv&&!sv.ended&&sv.name?[{label:'Tiếp tục',note:`${sv.name} · ${sv.ch===2?'chương hai':(sv.year-1258)+' tuổi'}`,fn:()=>{setS(sv);startPlay(true)}}]:[]),...(ch2Open(sv)&&sv.name?[{label:'Sang chương hai',note:`${sv.name} · 1285`,fn:()=>{setS(sv);startPlay(true,true);ch2Start()}}]:[]),{label:'Bắt đầu cuộc đời',fn:birthScreen}]});
}
function birthScreen(){
  showModal({kicker:'Xuân · Mậu Ngọ 1258',title:'Tiếng khóc chào đời',
    body:`<p>Mấy tuần trước, vua Trần Thái Tông cùng Thái tử ngự lâu thuyền đến bến Đông Bộ Đầu, phá tan quân giặc. Tháng hai, vua nhường ngôi cho Thái tử, tức vua Trần Thánh Tông.</p><p>Ở làng An Phú, ven sông Tô Lịch, có một đứa trẻ cất tiếng khóc chào đời. Cha mẹ đặt tên con là:</p><input id="nameIn" maxlength="24" value="Phạm Văn An" aria-label="Tên nhân vật">`,
    choices:[{label:'Đặt tên',fn:()=>{const v=($('nameIn').value||'').trim()||'Phạm Văn An';setS(newState(v));thoiNoi()}}]});
}
function thoiNoi(){
  const pickItem=(id,k,n,msg)=>()=>{S.toi=id;S[k]+=n;showModal({kicker:'Năm năm sau · Giáp Tý 1264',title:'Sáu tuổi',body:`<p>${msg}</p><p>Năm năm trôi qua. Bạn sáu tuổi, đầu còn để chỏm, đã chạy khắp xóm cùng thằng Cò nhà bên. Sáng nay mẹ gọi bạn lại, có chuyện muốn dặn.</p><p class="note">Đi lại bằng WASD hoặc phím mũi tên. Đến gần mẹ và bấm E.</p>`,choices:[{label:'Ra sân',fn:()=>startPlay(false)}]})};
  showModal({kicker:'Xuân · Kỷ Mùi 1259',title:'Lễ thôi nôi',body:`<p>Tròn một tuổi, cả nhà bày một mâm đồ trước mặt bạn để xem con sau này theo nghề gì. Bạn bò tới và nắm lấy...</p>`,
    choices:[{label:'Cây bút lông',note:'+5 Văn',fn:pickItem('but','van',5,'Cả nhà cười: thằng bé sau này theo nghiệp bút nghiên.')},{label:'Thanh kiếm gỗ',note:'+5 Võ',fn:pickItem('kiem','vo',5,'Cha vỗ đùi: con nhà này sau làm tướng!')},
     {label:'Bông lúa',note:'+5 quan',fn:pickItem('lua','tien',5,'Ông bà gật gù: có bát ăn bát để là phúc rồi.')},{label:'Chuỗi tràng hạt',note:'+5 Đức',fn:pickItem('hat','duc',5,'Mẹ chắp tay: con hiền lành thì trời thương.')}]});
}
export let playing=false;
export function startPlay(fromSave,noResume){playing=true;if(S._reLose){S._reLose=false;loseBuffalo()}$('hud').hidden=false;renderHUD();if(fromSave&&!noResume)setTimeout(()=>S.ch===2?ch2Resume():resumePending(),60);else save();return true}
