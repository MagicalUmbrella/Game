/* ================= kinh thành: hình vật trang trí ================= */
/* Gác một cột, bia, cột cờ, nghê đá, đèn đá, thềm rồng, thủy đình, giá binh khí, hình nộm, vọng lâu góc thành (kinhthanh.js đặt chỗ). */
import {simple} from './sprites.js';

/* ---------- vật trang trí (vẽ bằng code, có viền) ---------- */
export function cityDecorSprite(d){switch(d.kind){
  case 'motcot':return simple('motcot',22,34,s=>{s(10,18,3,16,'#8a7a62');s(9,30,5,3,'#a89a82');s(3,10,16,9,'#a8402b');s(4,11,14,7,'#7a2a1e');s(8,12,6,5,'#2e2118');
    s(0,6,22,4,'#7a3f2a');s(2,4,18,2,'#9a5a3a');s(6,1,10,3,'#7a3f2a');s(10,0,2,2,'#d9b14a');s(0,5,2,2,'#9a5a3a');s(20,5,2,2,'#9a5a3a')},11,32);
  case 'bia':return simple('bia',10,16,s=>{s(1,0,8,12,'#9a968a');s(2,1,6,10,'#b4b0a2');for(let y=2;y<10;y+=2)s(3,y,4,1,'#7a766a');s(0,12,10,4,'#7a766a')},5,15);
  case 'co':return simple('cocot',24,64,s=>{s(3,4,2,58,'#6e4a2a');s(2,60,4,4,'#5a5040');s(5,6,18,13,'#c8302a');s(5,6,18,2,'#e04a3a');s(11,10,6,5,'#f0d070');s(2,2,4,3,'#d9b14a')},4,62);
  case 'nghe':return simple('nghe',16,16,s=>{s(1,11,14,5,'#8a8476');s(3,4,10,8,'#a8a292');s(4,1,6,5,'#b8b2a2');s(5,2,1,1,'#3a3630');s(10,6,3,2,'#8a8476');s(2,6,2,5,'#9a9484')},8,15);
  case 'den':return simple('den',10,20,s=>{s(3,12,4,6,'#8a8476');s(1,18,8,2,'#6a6559');s(1,6,8,6,'#a8a292');s(3,8,4,3,'#f0c860');s(0,4,10,2,'#7a766a');s(3,2,4,2,'#7a766a')},5,19);
  case 'them':return simple('them',16,16,s=>{s(0,0,16,16,'#b8b1a1');for(let y=0;y<16;y+=4)s(0,y,16,1,'#8a8476');s(4,2,8,12,'#c9c2b0');s(5,3,2,10,'#d9b14a');s(9,3,2,10,'#d9b14a')},8,16);
  case 'thuydinh':return simple('thuydinh',30,30,s=>{for(const x of [4,24])s(x,16,2,12,'#6e4a2a');s(2,26,26,3,'#8a6238');s(3,13,24,4,'#a8402b');s(0,7,30,6,'#7a3f2a');s(3,5,24,2,'#9a5a3a');s(12,2,6,3,'#7a3f2a');s(14,0,2,2,'#d9b14a')},15,28);
  case 'gia':return simple('gia',18,22,s=>{s(1,6,16,2,'#6e4a2a');s(1,16,16,2,'#6e4a2a');s(1,6,2,16,'#5a3a20');s(15,6,2,16,'#5a3a20');for(let x=4;x<15;x+=3){s(x,0,1,20,'#8a6238');s(x,0,1,3,'#c0c4c8')}},9,21);
  case 'nom':return simple('nom',14,26,s=>{s(6,8,2,18,'#6e4a2a');s(2,10,10,9,'#c9ab6c');s(3,11,8,7,'#b8954f');s(4,2,6,7,'#c9ab6c');s(0,12,14,2,'#a88b52')},7,25);
  case 'vong':{const red=d.red;return simple('vong'+(red?'r':''),26,44,s=>{s(3,18,20,24,red?'#a8643c':'#9a8e78');for(let y=20;y<40;y+=4)s(3,y,20,1,red?'#8a4a2a':'#7a6e5a');s(8,26,10,8,'#2e2118');
    s(0,10,26,8,red?'#7a3f2a':'#6a5a48');s(2,8,22,2,red?'#9a5a3a':'#7a6a58');s(5,3,16,5,red?'#7a3f2a':'#6a5a48');s(11,0,4,3,'#d9b14a');s(0,9,2,3,red?'#9a5a3a':'#7a6a58');s(24,9,2,3,red?'#9a5a3a':'#7a6a58')},13,40)}
  default:return null}}

