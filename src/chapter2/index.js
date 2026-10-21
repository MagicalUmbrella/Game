/* ================= chương hai: khởi đầu, lưu, nối các cảnh ================= */
/* Chương hai (1285–1288), dàn ý ở docs/chuong2.md. Mọi người, việc quanh các mốc Toàn thư là hư cấu.
   S.ch = 2 khi đã sang chương hai. S.c2 giữ tiến trình:
     scene: cảnh đang chơi ('tron' trốn trại, 'tancu' dẫn dân lánh nạn, 'danbinh' gặp dân binh, 'cd' trận Chương Dương, 'cho' hết phần đã làm)
     tron: kết quả trốn trại {ok, saved:[tên], burn, horse, caught}
     tancu: lựa chọn lúc tản cư {o, cha, gop}
     doi: số người làng theo bạn vào dân binh; men: trai làng ấy [{name, look, fallen}] (chuongduong.js)
     cd: kết quả trận Chương Dương
     chron: các dòng biên niên chương hai
   Chơi lại từ bản lưu thì ch2Resume() mở lại đúng cảnh (gọi từ intro.startPlay). */
import {S,save,setMG} from '../state.js';
import {openRegion} from '../world.js';
import {showModal,setKeys,renderHUD} from '../ui.js';
import {startTron} from './trontrai.js';
import {startTancu} from './tancu.js';
import {startDanbinh,showCho} from './danbinh.js';
import {startCD} from './chuongduong.js';

/* chương một đã xong (đêm 1285 có kết quả) thì sang được chương hai */
export const ch2Open=sv=>!!(sv&&sv.res&&sv.ended&&sv.ch!==2);

export function ch2Start(){
  S.ch=2;S.ended=false;S.pending=null;S.year=1285;S.season=0;
  S.c2={scene:S.capt?'tron':'tancu',tron:null,tancu:{},doi:0,chron:[]};
  openRegion(S,'gialam');save();renderHUD();
  showModal({kicker:'Chương hai · 1285–1288',title:'Giữ nước',big:true,
    body:`<p>Đêm tháng giêng năm Ất Dậu đã qua. Giặc Nguyên tràn khắp bờ bắc sông Hồng, dựng cờ lớn ở bến Đông Bộ Đầu.</p>
      <p>${S.capt?'Bạn còn trong chuồng tù trại giặc ở Gia Lâm. Đêm nay phải tìm đường ra.':'Làng An Phú còn khói. Bạn phải đưa những người còn lại đi lánh nạn.'}</p>
      <p class="note">Chương hai hư cấu trên nền sử: các mốc lịch sử theo Đại Việt sử ký toàn thư, người và việc quanh đó là hư cấu.</p>`,
    choices:[{label:'Bắt đầu',fn:()=>{runScene()}}]});
}
export function ch2Resume(){if(!S.c2)return;setMG(null);setKeys();document.body.classList.remove('mg','battle');runScene()}
function runScene(){const sc=S.c2.scene;if(sc==='tron')startTron();else if(sc==='tancu')startTancu();else if(sc==='danbinh')startDanbinh();else if(sc==='cd'||(sc==='cho'&&!S.c2.cd))startCD();else showCho()}
export function ch2Go(scene){S.c2.scene=scene;save();runScene()}
export function ch2Note(line){if(S.c2&&line)S.c2.chron.push(line)}
