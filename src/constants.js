/* ================= constants ================= */
/* Bản đồ thế giới W×H ô (src/world.js). W0×H0 là phần bản đồ gốc (làng An Phú, bến Đông Bộ Đầu), sinh bằng RNG seed 1258
   trong map.js và giữ nguyên; từ 10/2026 bản đồ nới thêm OY hàng phía bắc cho kinh thành Thăng Long gấp đôi (kinhthanh.js),
   nên phần gốc nằm ở các hàng OY…OY+H0 (tọa độ thế giới = tọa độ gốc + OY theo trục dọc). */
export const TS=16, Z=3, T=TS*Z, W0=96, H0=72, OY=20, W=480, H=260;
export const G=0,WA=1,FI=2,PA=3,TR=4,MO=5,WL=6,SA=8,BR=9,ST=10,GA=11,WR=12,DK=13,BI=14;
export const SEASONS=['Xuân','Hạ','Thu','Đông'];
const CAN=['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
const CHI=['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
export const canchi=y=>CAN[(y+6)%10]+' '+CHI[(y+8)%12];
export const $=id=>document.getElementById(id);
export const cv=$('cv'),ctx=cv.getContext('2d');
