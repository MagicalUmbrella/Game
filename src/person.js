/* ================= người ================= */
/* Sprite người đọc từ ảnh src/assets/nguoi.png (vẽ bằng tools/ve_nguoi.py, sửa được bằng Aseprite, Piskel…).
   Mỗi hàng ảnh một nhân vật, mỗi ô 32×40, chân chạm điểm (16, 37). Các khung theo nguoi.json: đi xuống,
   sang trái, lên (đứng, hai nhịp bước), và hai khung chém mỗi hướng (vung lên 'a0', chém 'a1').
   look = {id: mã nhân vật trong nguoi.json, kid?: trẻ con}. Hướng phải lật từ trái.
   loadPeople() phải xong trước khi vẽ (main.js chờ). */
import {flip,mk} from './pixel.js';
import SHEET_URL from './assets/nguoi.png';
import META from './assets/nguoi.json';

let sheet=null;
const cache={};
export function loadPeople(){
  return new Promise((ok,fail)=>{const im=new Image();im.onload=()=>{sheet=im;ok()};im.onerror=fail;im.src=SHEET_URL});
}
export const PEOPLE=META.people;
export const isKid=look=>!!(look&&(look.kid||PEOPLE[look.id]?.kid));

/* f: 0–2 khung bước; 'a0' vung lên, 'a1' chém (chỉ người có vũ khí, người khác dùng khung đứng). */
export function personSprite(look,dir,f=0){
  const id=PEOPLE[look&&look.id]?look.id:'ban_nong',key=id+dir+f;if(cache[key])return cache[key];
  if(dir==='right'){const r=flip(personSprite(look,'left',f));if(sheet)cache[key]=r;return r}
  const d=dir==='left'?'left':dir==='up'?'up':'down';
  const atk=typeof f==='string'&&PEOPLE[id].fight;
  const col=META.frames.indexOf(atk?d+f:d+(typeof f==='string'?0:f));
  const [c,g]=mk(META.cw,META.ch);
  if(sheet)g.drawImage(sheet,col*META.cw,PEOPLE[id].row*META.ch,META.cw,META.ch,0,0,META.cw,META.ch);
  c.ax=META.ax;c.ay=META.ay;
  if(!sheet)return c;   // chưa nạp xong: trả ô trống, không lưu
  return cache[key]=c;
}
