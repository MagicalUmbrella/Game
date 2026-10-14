/* ================= người ================= */
/* Sprite người ghép từ các mẫu điểm ảnh viết bằng chữ: đầu, thân, tay, chân, rồi tóc, mũ, khăn.
   Mỗi mẫu rộng 16 cột, đặt trên lưới thân 16×24 (hàng 23 là bàn chân). Hàng âm là phần nhô lên trên
   đầu (búi tóc, nón, mũ trụ). Hướng 'right' lật từ 'left'. Có viền đậm bằng outline().
   Khung bước: 0 đứng, 1 và 2 hai nhịp chân (vòng [1,0,2,0] trong render). */
import {flip,mk,outline,shade} from './pixel.js';

const cache={};

/* ---------- đầu ---------- */
const HEAD={
  down:[
    '.....HHHHHH.....',
    '....HHHHHHHH....',
    '....HhHHHHHH....',
    '....HSSSSSSH....',
    '....SSSSSSSS....',
    '....SSeSSeSS....',
    '....SSeSSeSS....',
    '....sSSSSSSs....',
    '.....sSSSSs.....',
    '......ssss......'],
  left:[
    '......HHHHH.....',
    '.....HHHHHHH....',
    '....HHHHhHHH....',
    '....SSSSHHHH....',
    '...SSSSSSHHH....',
    '...SeSSSSsHH....',
    '..SSSSSSSSH.....',
    '...nSSSSSs......',
    '....sSSSs.......',
    '......ss........'],
  up:[
    '.....HHHHHH.....',
    '....HHHHHHHH....',
    '....HhHHHHHH....',
    '....HHHHHHHH....',
    '....HHHHHHHH....',
    '....HHHHHHHH....',
    '....HHHHHHHH....',
    '....sHHHHHHs....',
    '.....sSSSSs.....',
    '......ssss......'],
};
// Trẻ con để chỏm: đầu cạo, một túm tóc trên đỉnh, má hồng.
const HEAD_KID={
  down:[
    '.......HH.......',
    '.....SSHHSS.....',
    '....SSSSSSSS....',
    '....SSSSSSSS....',
    '....SSeSSeSS....',
    '....SSeSSeSS....',
    '....mSSSSSSm....',
    '.....sSSSSs.....',
    '......ssss......'],
  left:[
    '........HH......',
    '.....SSSHHS.....',
    '....SSSSSSSS....',
    '...SSSSSSSSS....',
    '...SeSSSSSSs....',
    '..SSSSSSSSs.....',
    '...nmSSSSs......',
    '....sSSSs.......',
    '......ss........'],
  up:[
    '.......HH.......',
    '.....SSHHSS.....',
    '....SSSSSSSS....',
    '....SSSSSSSS....',
    '....SSSSSSSS....',
    '....SSSSSSSS....',
    '....sSSSSSSs....',
    '.....sSSSSs.....',
    '......ssss......'],
};
// Sư: đầu trọc.
const BALD={down:HEAD.down.map((r,i)=>i<4?r.replace(/[Hh]/g,'S').replace(/^(....)S/,'$1s'):r),
  left:HEAD.left.map((r,i)=>i<6?r.replace(/[Hh]/g,'S'):r.replace(/H/g,'s')),
  up:HEAD.up.map(r=>r.replace(/[Hh]/g,'S'))};

/* ---------- phần trên đầu và quanh mặt (hàng tính theo đầu, hàng 0 = đỉnh tóc) ---------- */
const KNOT={ // búi tó của đàn ông
  down:[[-2,'.......HH.......'],[-1,'......HhHH......']],
  left:[[-2,'.........HH.....'],[-1,'........HhHH....']],
  up:[[-2,'.......HH.......'],[-1,'......HHHH......']]};
const WRAP={ // khăn vấn của đàn bà
  down:[[0,'.....qQQQQq.....'],[1,'...QQqQQqQQqQ...'],[2,'...qQQqQQqQQq...'],[3,'....H......H....'],[4,'....H......H....']],
  left:[[0,'......qQQQQ.....'],[1,'....QQqQQqQQQ...'],[2,'....qQQqQQqQq...'],[3,'........HHHH....'],[4,'.........HHH....'],[5,'.........HH.....']],
  up:[[0,'.....qQQQQq.....'],[1,'...QQqQQqQQqQ...'],[2,'...qQQqQQqQQq...'],[7,'.....HHHHHH.....']]};
const BAND={ // khăn đỏ quấn đầu
  down:[[3,'....RRRRRRRR....']],
  left:[[3,'....RRRRRRRRr...'],[4,'...........rr...'],[5,'............r...']],
  up:[[3,'....RRRRRRRR....'],[4,'.......rr.......'],[5,'.......r.r......']]};
const HAT={ // nón lá
  down:[[-3,'.......YY.......'],[-2,'......YYYy......'],[-1,'.....YYYYyy.....'],[0,'....YYYYYYyy....'],[1,'..YYYYYYYYYYyy..'],[2,'.yyyyyyyyyyyyyy.']],
  left:[[-3,'.......YY.......'],[-2,'......YYYy......'],[-1,'.....YYYYyy.....'],[0,'....YYYYYYyy....'],[1,'..YYYYYYYYYYyy..'],[2,'.yyyyyyyyyyyyyy.']],
  up:[[-3,'.......YY.......'],[-2,'......YYYy......'],[-1,'.....YYYYyy.....'],[0,'....YYYYYYyy....'],[1,'..YYYYYYYYYYyy..'],[2,'.yyyyyyyyyyyyyy.']]};
const BEARD={ // râu tóc bạc của ông già
  down:[[7,'....wSSSSSSw....'],[8,'.....wWWWWw.....'],[9,'......WWWW......'],[10,'.......Ww.......']],
  left:[[7,'...wSSSSSs......'],[8,'...WWWWSs.......'],[9,'....WWW.........'],[10,'....W...........']],
  up:[]};
const HELM={ // mũ trụ giặc Nguyên: chóp nhọn, vành lông, tai che xuống cổ
  down:[[-3,'.......m........'],[-2,'......MMm.......'],[-1,'.....MMMMm......'],[0,'....MmMMMMM.....'],[1,'...MMMMMMMMMM...'],[2,'...TTTTTTTTTT...'],[3,'...tTSSSSSSTt...'],[4,'...t........t...'],[5,'...t........t...'],[6,'...tt......tt...'],[7,'....t......t....']],
  left:[[-3,'.......m........'],[-2,'......MMm.......'],[-1,'.....MMMMm......'],[0,'....MmMMMMM.....'],[1,'...MMMMMMMMMM...'],[2,'...TTTTTTTTTT...'],[3,'.....TTtTTTTt...'],[4,'.........tTTt...'],[5,'.........tTTt...'],[6,'.........tttt...']],
  up:[[-3,'.......m........'],[-2,'......MMm.......'],[-1,'.....MMMMm......'],[0,'....MmMMMMM.....'],[1,'...MMMMMMMMMM...'],[2,'...TTTTTTTTTT...'],[3,'...tTTTTTTTTt...'],[4,'...tTTTTTTTTt...'],[5,'...tTTTTTTTTt...'],[6,'...tttttttttt...']]};
const PLUME={down:[[-6,'.......R........'],[-5,'.......Rr.......'],[-4,'.......rR.......']],
  left:[[-6,'........R.......'],[-5,'.......Rr.......'],[-4,'.......rR.......']],
  up:[[-6,'.......R........'],[-5,'.......Rr.......'],[-4,'.......rR.......']]};

/* ---------- thân (không gồm tay). Áo giao lĩnh: vạt trái đè vạt phải, đường cổ chéo ---------- */
const TORSO={
  shirt:{ // áo ngắn, quần
    down:['....LCCSSCCc....','....LCCCdSCc....','....LCCdCCCc....','....LCdCCCCc....','....BBBBBBBB....','....LCCbCCCc....','....cCCbCCcc....'],
    left:['.....CCCCCc.....','.....dCCCCc.....','.....CdCCCc.....','.....CCdCCc.....','.....BBBBBB.....','.....bCCCCc.....','.....bCCCcc.....'],
    up:  ['....LCCCCCCc....','....LCCCCCCc....','....LCCCCCCc....','....LCCCCCCc....','....BBBbbBBB....','....LCCbbCCc....','....cCCCCCcc....']},
  long:{ // áo dài quá gối (thầy đồ, học trò, quan)
    down:['....LCCSSCCc....','....LCCCdSCc....','....LCCdCCCc....','....LCdCCCCc....','....BBBBBBBB....','....LCCCdCCc....','....LCCCdCCc....','...LCCCCdCCCc...','...LCCCCdCCCc...','...cCCCCdCCcc...','...ccccccccccc..'],
    left:['.....CCCCCc.....','.....dCCCCc.....','.....CdCCCc.....','.....CCdCCc.....','.....BBBBBB.....','.....dCCCCc.....','.....dCCCCc.....','....dCCCCCcc....','....dCCCCCcc....','....dCCCCCcc....','....cccccccc....'],
    up:  ['....LCCCCCCc....','....LCCCCCCc....','....LCCCCCCc....','....LCCCCCCc....','....BBBbbBBB....','....LCCbbCCc....','....LCCCCCCc....','...LCCCCCCCCc...','...LCCCCCCCCc...','...cCCCCCCCcc...','...ccccccccccc..']},
  dress:{ // áo đàn bà, yếm ở cổ, váy dài sẫm
    down:['....LCCXXCCc....','....LCCXXCCc....','....LCCCCCCc....','....BBBBBBBB....','....LCCbbCCc....','....LCCCCCCc....','...LCCC..CCCc...','...JJJJJJJJJJ...','...JJJJJjJJJJ...','...JJJJJjJJJJ...','...jjjjjjjjjj...'],
    left:['.....CCCCCc.....','.....XCCCCc.....','.....CCCCCc.....','.....BBBBBB.....','.....bCCCCc.....','.....CCCCCc.....','....CCCCCCcc....','....JJJJJJJj....','....JJJJJJJj....','....JJJJJJJj....','....jjjjjjjj....'],
    up:  ['....LCCCCCCc....','....LCCCCCCc....','....LCCCCCCc....','....BBBbbBBB....','....LCCbbCCc....','....LCCCCCCc....','...LCCCCCCCCc...','...JJJJJJJJJJ...','...JJJJJJJJJJ...','...JJJJJJJJJJ...','...jjjjjjjjjj...']},
  monk:{ // áo nâu nhà sư, cà sa chéo vai
    down:['....LCCCCCCc....','....LCdCCCCc....','....LCCdCCCc....','....LCCCdCCc....','....LCCCCdCc....','....LCCCCCdc....','....LCCCCCCc....','...LCCCCCCCCc...','...LCCCCCCCCc...','...cCCCCCCCcc...','...ccccccccccc..'],
    left:['.....CCCCCc.....','.....CCCCdc.....','.....CCCdCc.....','.....CCdCCc.....','.....CdCCCc.....','.....dCCCCc.....','.....CCCCCc.....','....CCCCCCcc....','....CCCCCCcc....','....CCCCCCcc....','....cccccccc....'],
    up:  ['....LCCCCCCc....','....LCCCCdCc....','....LCCCdCCc....','....LCCdCCCc....','....LCdCCCCc....','....LdCCCCCc....','....LCCCCCCc....','...LCCCCCCCCc...','...LCCCCCCCCc...','...cCCCCCCCcc...','...ccccccccccc..']},
  coat:{ // áo choàng giặc Nguyên: vạt phải đè vạt trái, viền lông, đai da, ủng
    down:['...TLCCCCCCcT...','....LCCCCTCc....','....LCCCTCCc....','....LCCTCCCc....','....KKKKKKKK....','....LCCTCCCc....','....LCCTCCCc....','....LCCTCCCc....','....tttTtttt....'],
    left:['....TCCCCCcT....','.....TCCCCc.....','.....CTCCCc.....','.....CCTCCc.....','.....KKKKKK.....','.....TCCCCc.....','.....TCCCCc.....','.....TCCCcc.....','.....tttttt.....'],
    up:  ['...TLCCCCCCcT...','....LCCCCCCc....','....LCCCCCCc....','....LCCCCCCc....','....KKKKKKKK....','....LCCcCCCc....','....LCCcCCCc....','....LCCcCCCc....','....tttttttt....']},
};

/* ---------- chân. Mỗi kiểu có 3 khung ---------- */
const LEGS={
  bare:{ // quần ngắn ống, chân trần
    down:[['....PPPPPPPP....','.....PPppPP.....','.....PP..PP.....','.....Pp..pP.....','.....FF..FF.....','....FFF..FFF....'],
          ['....PPPPPPPP....','.....PPppPP.....','.....PP..PP.....','.....FF..Pp.....','....FFF..FF.....','.........FFF....'],
          ['....PPPPPPPP....','.....PPppPP.....','.....PP..PP.....','.....pP..FF.....','.....FF..FFF....','....FFF.........']],
    left:[['.....PPPPPP.....','......PPPP......','......PPpP......','......PPpP......','......FFFF......','.....FFFFF......'],
          ['.....PPPPPP.....','.....PPPPPp.....','....PP...pP.....','....PP....pP....','...FF......FF...','..FFF......FF...'],
          ['.....PPPPPP.....','.....pPPPPP.....','.....Pp..PP.....','....pP....PP....','...FF.....FF....','..FF.....FFF....']],
    up:  [['....PPPPPPPP....','.....PPppPP.....','.....PP..PP.....','.....Pp..pP.....','.....FF..FF.....','....FFF..FFF....'],
          ['....PPPPPPPP....','.....PPppPP.....','.....PP..PP.....','.....Pp..FF.....','.....FF..FF.....','....FFF.........'],
          ['....PPPPPPPP....','.....PPppPP.....','.....PP..PP.....','.....FF..pP.....','.....FF..FF.....','.........FFF....']]},
  robe:{ // áo dài, váy: chỉ lộ bàn chân
    down:[['.....FF..FF.....','....FFF..FFF....'],['.....FF..FF.....','....FFF...F.....'],['.....FF..FF.....','.....F...FFF....']],
    left:[['......FFFF......','.....FFFFF......'],['....FF...FF.....','...FFF...FF.....'],['.....FF.FF......','....FFF.FF......']],
    up:  [['.....FF..FF.....','....FFF..FFF....'],['.....FF..FF.....','....FFF...F.....'],['.....FF..FF.....','.....F...FFF....']]},
  boots:{ // quần, ủng da
    down:[['.....PP..PP.....','.....Pp..pP.....','.....KK..KK.....','....KKK..KKK....'],
          ['.....PP..PP.....','.....KK..pP.....','....KKK..KK.....','.........KKK....'],
          ['.....PP..PP.....','.....Pp..KK.....','.....KK..KKK....','....KKK.........']],
    left:[['......PPPP......','......PPpP......','......KKKK......','.....KKKKK......'],
          ['.....PP..pP.....','....PP....pP....','...KK......KK...','..KKK......KK...'],
          ['.....Pp..PP.....','....pP....PP....','...KK.....KK....','..KK.....KKK....']],
    up:  [['.....PP..PP.....','.....Pp..pP.....','.....KK..KK.....','....KKK..KKK....'],
          ['.....PP..PP.....','.....Pp..KK.....','.....KK..KK.....','....KKK.........'],
          ['.....PP..PP.....','.....KK..pP.....','.....KK..KK.....','.........KKK....']]},
};

/* ---------- tay: ống tay áo và bàn tay, đung đưa theo nhịp bước ---------- */
function arms(dir,f,len){ // trả về [[x,y,kí tự]] tính từ vai; len: số ô ống tay
  const out=[],sw=f===1?1:f===2?-1:0;
  if(dir==='left'){ // nhìn nghiêng: một tay, đánh ra trước (sang trái) hoặc ra sau
    for(let i=0;i<len;i++)out.push([8-Math.round(sw*i/(len-1)),i,i<2?'C':'c']);out.push([8-sw,len,'S']);return out}
  for(const [x,fw] of [[3,sw>0],[12,sw<0]]){ // tay đánh ra trước trông ngắn lại một ô
    const n=len-(fw?1:0);for(let i=0;i<n;i++)out.push([x,i,i<2?'C':x===3?'L':'c']);out.push([x,n,'S'])}
  return out}

/* ---------- ghép ---------- */
function paint(g,ox,oy,rows,pal){
  for(let y=0;y<rows.length;y++){const r=rows[y];for(let x=0;x<r.length;x++){const ch=r[x];if(ch==='.')continue;const col=pal[ch];if(!col)continue;g.fillStyle=col;g.fillRect(ox+x,oy+y,1,1)}}}
function overlay(g,ox,oy,list,pal){for(const [ry,row] of list)paint(g,ox,oy+ry,[row],pal)}

const SKIN='#e9b98f',SKIND='#c58f66';

export function personSprite(o,dir,f){
  const key=JSON.stringify(o)+dir+f;if(cache[key])return cache[key];
  if(dir==='right')return cache[key]=flip(personSprite(o,'left',f));
  const d=dir==='left'?'left':dir==='up'?'up':'down';
  const top=o.spear?13:o.plume?9:7,[c,g]=mk(22,top+26),X=3,Y=top;
  const kid=o.kid,sh=o.shirt;
  const hairCol={old:'#ddd6c6',oldwoman:'#c9c2b3'}[o.hair]||'#1e1813';
  const pal={
    S:SKIN,s:SKIND,e:'#2a1e16',n:'#b47c58',m:'#e5978a',F:SKIND,
    H:hairCol,h:o.hair==='old'||o.hair==='oldwoman'?shade(hairCol,-.18):shade(hairCol,.18),
    C:sh,c:shade(sh,-.22),L:shade(sh,.14),d:shade(sh,-.42),
    B:o.belt||(o.long||o.hair==='woman'||o.hair==='oldwoman'?shade(sh,-.38):'#7a2e22'),b:shade(o.belt||'#7a2e22',-.15),
    P:o.pants||'#3b3027',p:shade(o.pants||'#3b3027',-.25),K:'#2b231d',
    J:'#2d2621',j:'#211b17',X:'#b85a3a',
    Q:'#4a2e20',q:'#6b3a28',Y:'#d9c288',y:'#b9a066',R:'#b8322a',r:'#8a2420',
    M:'#5d636c',T:'#6b5440',t:'#4f3d2e',W:'#e6e0d2',w:'#c9c2b3'};
  const palHelm={...pal,m:'#8a9099'}; // trong mũ trụ, 'm' là ánh kim
  const woman=o.hair==='woman'||o.hair==='oldwoman',monk=o.hair==='monk',enemy=!!o.helm;
  const type=enemy?'coat':monk?'monk':woman?'dress':o.long?'long':'shirt';
  const legType=enemy?'boots':type==='shirt'?'bare':'robe';

  // vị trí theo dáng người: trẻ con thấp hơn, đầu to so với thân
  const headY=kid?5:1,torsoY=kid?13:11;
  // ngọn giáo vẽ trước, nằm sau người
  if(o.spear){const sx=X+(d==='left'?4:13);g.fillStyle='#6a4e2e';g.fillRect(sx,Y-10,1,33);g.fillStyle='#d3d7da';g.fillRect(sx-1,Y-12,3,2);g.fillStyle='#eef0f2';g.fillRect(sx,Y-13,1,1);g.fillStyle='#b8322a';g.fillRect(sx-1,Y-8,3,1)}
  // chân
  const legs=LEGS[legType][d][f%3];
  const legY=24-legs.length;
  paint(g,X,Y+legY,legs,pal);
  // thân
  let torso=TORSO[type][d];
  if(kid)torso=torso.filter((_,i)=>i!==2&&i!==6); // trẻ con: thân ngắn
  // áo dài, váy: vạt đung đưa theo nhịp bước
  const sway=(type==='long'||type==='dress'||type==='monk')&&f?(f===1?1:-1):0;
  torso.forEach((r,i)=>{const swing=i>=torso.length-2?sway:0;paint(g,X+swing,Y+torsoY+i,[r],pal)});
  // tay
  const armLen=kid?4:6;
  for(const [x,y,ch] of arms(d,f,armLen)){g.fillStyle=pal[ch];g.fillRect(X+x,Y+torsoY+y,1,1)}
  // đầu
  const head=(kid?HEAD_KID:monk?BALD:HEAD)[d];
  paint(g,X,Y+headY,head,pal);
  if(!kid&&!monk&&!woman&&!enemy&&!o.hat&&(o.hair==='man'||o.hair==='old'))overlay(g,X,Y+headY,KNOT[d],pal);
  if(woman)overlay(g,X,Y+headY,WRAP[d],pal);
  if(o.hair==='old')overlay(g,X,Y+headY,BEARD[d],pal);
  if(o.band)overlay(g,X,Y+headY,BAND[d],pal);
  if(o.hat)overlay(g,X,Y+headY,HAT[d],pal);
  if(enemy){overlay(g,X,Y+headY,HELM[d],palHelm);if(o.plume)overlay(g,X,Y+headY,PLUME[d],pal)}
  outline(c);c.ax=X+8;c.ay=Y+24;
  return cache[key]=c;
}
