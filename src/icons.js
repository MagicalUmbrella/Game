/* ================= biểu tượng giao diện ================= */
/* Biểu tượng pixel vẽ bằng code cho HUD, hội thoại, modal: mẫu chữ 10×10 (hoặc nhỏ hơn), mỗi chữ cái
   một màu, '.' là trong suốt; có viền đậm bằng outline(). Vẽ một lần, lưu thành ảnh data URL.
   ico(tên, cỡ điểm ảnh) trả về thẻ <img> để chèn vào HTML. */
import {mk,outline} from './pixel.js';

const ICONS={
  van:{p:{r:'#b8322a',R:'#7a2b22',P:'#efe6cf',l:'#9a8a6a'},r:[ // cuộn sách
    'rr......rr','RPPPPPPPPR','RPllllllPR','RPPPPPPPPR','RPllllllPR','RPPPPPPPPR','RPllllPPPR','RPPPPPPPPR','rr......rr']},
  vo:{p:{m:'#eef0f2',M:'#a9b0b8',g:'#d9b25a',h:'#7a3a28'},r:[ // kiếm dựng đứng
    '....m.....','...mM.....','...mM.....','...mM.....','...mM.....','...mM.....','.ggggg....','....h.....','....h.....','...ggg....']},
  duc:{p:{p:'#e58fa0',P:'#f8cdd6',g:'#5b8f4f'},r:[ // hoa sen
    '....pp....','...pPPp...','.p.pPPp.p.','pPppPPppPp','pPPpPPpPPp','.pPPPPPPp.','..pPPPPp..','...gggg...','....gg....','....g.....']},
  tien:{p:{c:'#8a6a2a',C:'#d9b25a',Y:'#f4e2a0'},r:[ // đồng xu lỗ vuông
    '...cccc...','..cCCCCc..','.cCYCCCCc.','cCYCCCCCCc','cCCC..CCCc','cCCC..CCCc','cCCCCCCCCc','.cCCCCCCc.','..cCCCCc..','...cccc...']},
  suc:{p:{W:'#fbf7ea',w:'#dcd4bd',b:'#6d9cc0',B:'#2f4f62'},r:[ // bát cơm đầy
    '...WWWW...','..WWWwWW..','.WWwWWWWW.','bbbbbbbbbb','BbbbbbbbbB','.BbbbbbbB.','..BBBBBB..','...BBBB...']},
  sucEmpty:{p:{b:'#3d4a44',B:'#2a332e'},r:[ // bát rỗng
    '..........','..........','..........','bbbbbbbbbb','BbbbbbbbbB','.BbbbbbbB.','..BBBBBB..','...BBBB...']},
  heart:{p:{h:'#b8322a',H:'#e07f6b'},r:['.hh..hh.','hHHhhHHh','hHHHHHHh','hHHHHHHh','.hHHHHh.','..hHHh..','...hh...']},
  heartEmpty:{p:{h:'#4a3a36'},r:['.hh..hh.','h..hh..h','h......h','h......h','.h....h.','..h..h..','...hh...']},
  // mùa: hoa đào, hoa sen nở, bông lúa chín, mây gió bấc
  s0:{p:{p:'#f2a7b5',P:'#fbd8df',y:'#e2bf72',d:'#6a4e2e'},r:[
    '..........','...pp.....','..pPPp....','.pPyyPp...','..pPPp.d..','...pp.d...','.....d....','....d.pp..','...d.pPPp.','..d...pp..']},
  s1:{p:{p:'#e58fa0',P:'#f8cdd6',g:'#5b8f4f',G:'#7fb26b'},r:[
    '....pp....','...pPPp...','..pPPPPp..','..pPPPPp..','...pPPp...','....gg....','.GGGgGGG..','GGGGgGGGG.','.GGGgGGG..','....g.....']},
  s2:{p:{y:'#e2bf72',Y:'#f4e2a0',g:'#9a8a3a'},r:[
    '....g.....','....gY....','...gyY....','...gyY.Y..','..g.yyY...','..g..yY.Y.','.g...yyY..','.g....yY..','g......y..','g.........']},
  s3:{p:{c:'#c9d3d8',C:'#eef3f5',w:'#8fa3ad'},r:[
    '..........','...cc.....','..cCCcc...','.cCCCCCc..','cCCCCCCCc.','.ccccccc..','..........','ww.www.ww.','.www..www.','..........']},
  done:{p:{g:'#9fcaa9'},r:['.......g','......gg','.....gg.','g...gg..','gg.gg...','.ggg....','..g.....']},
};

const cache={};
function url(name){
  if(cache[name])return cache[name];
  const t=ICONS[name],w=Math.max(...t.r.map(r=>r.length)),h=t.r.length,[c,g]=mk(w+2,h+2);
  t.r.forEach((row,y)=>[...row].forEach((ch,x)=>{const col=t.p[ch];if(col){g.fillStyle=col;g.fillRect(x+1,y+1,1,1)}}));
  outline(c);return cache[name]={src:c.toDataURL(),w:w+2,h:h+2};
}
export function ico(name,px=2,cls=''){
  if(!ICONS[name])return'';const u=url(name);
  return`<img class="ico ${cls}" src="${u.src}" width="${u.w*px}" height="${u.h*px}" alt="">`;
}

/* Ghi chú lựa chọn ("−1 Sức · +2 Văn") thành nhãn màu có biểu tượng. Chữ được thoát HTML trước. */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KIND={'Văn':'van','Võ':'vo','Đức':'duc','Sức':'suc','quan':'tien'};
export function chips(note){
  return esc(note).replace(/([+−-])\s?(\d+)\s(Văn|Võ|Đức|Sức|quan)/g,(m,sg,n,k)=>`<span class="chip ${KIND[k]} ${sg==='+'?'up':'down'}">${ico(KIND[k],1)}${sg==='+'?'+':'−'}${n} ${k}</span>`);
}
