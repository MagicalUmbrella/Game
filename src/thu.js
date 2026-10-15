/* ================= thử từng phần ================= */
/* Mở trang với ?thu trên địa chỉ (ví dụ https://magicalumbrella.github.io/Game/?thu): màn tiêu đề có thêm "Thử từng
   phần", chọn một màn để chơi ngay với nhân vật dựng sẵn (năm, đường đời, chỉ số hợp với màn ấy). Bản lưu ở chế độ này
   tách riêng (khóa SAVE_KEY 'dvmd-thu' trong state.js) nên không đè lên đời đang chơi thật. Chơi xong muốn thử phần
   khác thì tải lại trang. Dùng để chủ dự án, người chơi thử kiểm tra từng màn mà không phải chơi lại từ đầu. */
import {setS,newState,MG,S} from './state.js';
import {showModal,nextModal,closeDialog,modalOpen} from './ui.js';
import {startPlay} from './intro.js';
import {startFlood} from './minigames/flood.js';
import {startExam} from './minigames/exam.js';
import {startTraining} from './minigames/training.js';
import {startDich} from './minigames/dich.js';
import {startSau} from './minigames/sau.js';
import {startKien} from './minigames/kien.js';
import {startCuop} from './minigames/cuop.js';
import {hoiVat} from './minigames/vat.js';
import {startCheo} from './minigames/cheo.js';
import {startClimax,finishClimax} from './climax.js';

export const THU=/[?&]thu\b/.test(location.search);

/* dựng nhân vật cho màn: đời mới, bỏ qua việc đầu đời, rồi đè năm, mùa, chỉ số */
function base(o){const n=newState('Người thử'),f=Object.assign(n.flags,o.flags||{});setS(Object.assign(n,{quests:{hoc:'done',trau:'done'},lifeWait:1e9,metLaiDo:true},o,{flags:f}));
  startPlay(false);while(modalOpen)nextModal();closeDialog()}
const night=o=>({year:1285,season:0,co:'village',cha:true,the:60,tieng:40,...o});
const go=(o,fn)=>()=>{setTimeout(()=>{base(o);fn()},0)};

const SCENES=[
  ['Lụt 1270 (đắp đê)','12 tuổi, có Cò giúp',go({year:1270,season:2},startFlood)],
  ['Khoa thi 1275','đường văn, Văn 40',go({year:1275,season:0,path:'van',van:40},startExam)],
  ['Dịch đậu mùa 1278','chạy chữa cho cha',go({year:1278,season:1},startDich)],
  ['Sâu cắn lúa 1280','đường nông',go({year:1280,season:1,path:'nong'},startSau)],
  ['Tờ văn tự giả 1280','đường văn, Văn 40',go({year:1280,season:2,path:'van',van:40},startKien)],
  ['Toán cướp trâu 1280','đường võ, Võ 40',go({year:1280,season:3,path:'vo',vo:40},startCuop)],
  ['Đấu vật hội xuân','16 tuổi, Võ 30',go({year:1274,season:0,vo:30},hoiVat)],
  ['Chèo đò sông Hồng','14 tuổi',go({year:1272,season:1},startCheo)],
  ['Tập trận 1283','đường võ, Võ 50, đã gặp anh Ngũ',go({year:1283,season:3,path:'vo',vo:50,nguMet:true,nguN:3},startTraining)],
  ['Đêm 1285 · đường võ','Võ 70, có Cò, Tiếng 40',go(night({path:'vo',vo:70,nguMet:true}),startClimax)],
  ['Đêm 1285 · đường văn','Văn 55, đỗ, có Cò',go(night({path:'van',van:55,vo:20,flags:{exam:'pass'}}),startClimax)],
  ['Đêm 1285 · đường nông','Võ 25, Tiếng 30',go(night({path:'nong',vo:25,tieng:30}),startClimax)],
  ['Đêm 1285 · vào thẳng hồi 3','đường võ, tên đầu toán',go(night({path:'vo',vo:70}),()=>{startClimax();if(MG)MG.t=45.01})],
  ['Bị bắt, giải sang trại giặc','cảnh áp giải và trong trại',go(night({path:'vo',vo:50}),()=>{startClimax();if(MG)finishClimax('captured')})],
];

export function thuMenu(){
  showModal({kicker:'Chế độ thử',title:'Thử từng phần',wide:true,
    body:'<p>Chọn một màn để chơi ngay với nhân vật dựng sẵn. Chế độ này lưu riêng, không đụng tới đời bạn đang chơi. Muốn thử phần khác thì tải lại trang (F5).</p>',
    choices:SCENES.map(([label,note,fn])=>({label,note,fn}))})}
