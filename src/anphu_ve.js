/* ================= làng An Phú: hình vật trang trí ================= */
/* Rào tre, cổng làng, quán nước, miếu thổ địa, chuồng gà, cối giã gạo, nong phơi thóc, giàn bầu, cầu ao (anphu.js đặt chỗ). */
import {simple} from './sprites.js';

const TRE=['#c9b26a','#a8904a','#8a7438'];
export function villageDecorSprite(d){switch(d.kind){
  case 'rao':if(d.v)return simple('raov',6,20,s=>{for(let y=0;y<20;y+=4){s(1,y,4,3,TRE[0]);s(1,y+2,4,1,TRE[2])}s(2,0,2,20,TRE[1])},3,18);
    return simple('raoh'+(d.end?'e':''),16,12,s=>{for(let x=0;x<16;x+=3){s(x,1,2,11,TRE[x%2?1:0]);s(x,1,2,1,'#e0cc88')}s(0,4,16,1,TRE[2]);s(0,8,16,1,TRE[2]);if(d.end)s(7,0,3,12,'#7a6030')},8,12);
  case 'cong':return simple('conglang',52,44,s=>{
      for(const x of [2,42]){s(x,14,8,30,'#a8643c');for(let y=16;y<44;y+=4)s(x,y,8,1,'#8a4a2a');s(x+1,15,2,28,'#c07a50');s(x-1,12,10,3,'#8a8476')}   // hai cột gạch, mũ cột
      s(0,6,52,7,'#7a3f2a');for(let x=1;x<51;x+=3)s(x,7,1,5,'#5e2e1e');s(2,4,48,2,'#9a5a3a');s(8,1,36,3,'#7a3f2a');s(0,4,3,3,'#9a5a3a');s(49,4,3,3,'#9a5a3a');   // mái ngói
      s(18,13,16,7,'#2e2118');s(19,14,14,5,'#3a2a1c');for(let x=21;x<32;x+=4)s(x,16,2,1,'#d9b14a')},26,43);   // bảng tên làng
  case 'quan':return simple('quannuoc',32,26,s=>{
      s(2,8,2,18,'#6e4a2a');s(28,8,2,18,'#6e4a2a');s(0,4,32,6,'#c4a35e');for(let x=0;x<32;x+=2)s(x,9,1,2,'#a8884a');s(2,1,28,4,'#b0904e');s(1,3,30,1,'#d8bc78');   // mái rơm
      s(6,18,20,3,'#8a6238');s(7,21,2,5,'#6e4a2a');s(23,21,2,5,'#6e4a2a');s(9,15,5,3,'#5a6a6a');s(10,14,3,1,'#8a9a9a');s(17,16,3,2,'#e8e0c8');s(21,16,3,2,'#e8e0c8')},16,25);   // chõng tre, ấm, chén
  case 'mieu':return simple('mieu',20,24,s=>{
      s(1,19,18,5,'#8a8476');s(1,19,18,1,'#a59f90');s(4,11,12,8,'#a8402b');s(7,13,6,6,'#2e2118');s(9,14,2,3,'#f0c860');   // bệ đá, miếu son, bát hương
      s(0,7,20,5,'#7a3f2a');s(2,5,16,2,'#9a5a3a');s(5,3,10,2,'#7a3f2a');s(9,1,2,2,'#d9b14a');s(0,6,2,2,'#9a5a3a');s(18,6,2,2,'#9a5a3a')},10,23);
  case 'ga':return simple('chuongga',20,17,s=>{
      s(1,5,18,12,'#a8904a');for(let x=2;x<19;x+=3)s(x,5,1,12,'#7a6030');s(1,9,18,1,'#7a6030');s(3,2,14,3,'#c9b26a');s(6,0,8,2,'#a8904a');s(0,16,20,1,'#6a5a30');   // lồng tre
      s(4,11,4,3,'#f0ece0');s(7,10,2,2,'#f0ece0');s(8,10,1,1,'#d03020');s(12,11,4,3,'#b8643a');s(15,10,2,2,'#b8643a');s(16,10,1,1,'#d03020')},10,16);   // gà trắng, gà nâu
  case 'coi':return simple('coigiao',24,15,s=>{
      s(2,9,7,6,'#8a8476');s(3,9,5,2,'#5a5040');s(4,10,3,1,'#e8e0c8');   // cối đá, gạo
      s(5,5,18,2,'#8a6238');s(5,5,18,1,'#a87a48');s(4,4,3,6,'#6e4a2a');s(14,7,3,8,'#6e4a2a');s(13,13,5,2,'#5a3f25');s(20,7,3,4,'#8a6238')},12,14);   // đòn chày, trụ
  case 'nong':return simple('nong',22,11,s=>{
      s(2,2,18,7,'#8a6a3a');s(4,1,14,9,'#8a6a3a');s(4,3,14,5,'#e0b84a');s(6,2,10,7,'#e0b84a');for(let x=5;x<18;x+=3)s(x,4,1,1,'#c89a30')},11,8);   // nong phơi thóc
  case 'gian':return simple('gianbau',22,26,s=>{
      for(const x of [2,18])s(x,6,2,20,'#7a6030');s(0,3,22,4,'#4f8a3a');for(let x=1;x<21;x+=4)s(x,2,3,2,'#6aa84a');s(0,6,22,1,'#3a6a2a');   // giàn lá
      s(5,8,4,7,'#a8c86a');s(6,7,2,1,'#3a6a2a');s(13,9,4,6,'#a8c86a');s(14,8,2,1,'#3a6a2a');s(6,9,1,4,'#c8e08a')},11,25);   // quả bầu
  case 'cauao':return simple('cauao',14,26,s=>{
      for(let y=0;y<22;y+=3){s(1,y,12,2,'#a87a48');s(1,y+2,12,1,'#6e4a2a')}s(1,22,2,4,'#5a3f25');s(11,22,2,4,'#5a3f25');s(5,22,2,3,'#5a3f25')},7,6);   // cầu ao ván gỗ
  default:return null}}
