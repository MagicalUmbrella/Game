/* ================= người ================= */
/* Sprite người ghép từ các mẫu điểm ảnh viết bằng chữ, dáng chibi (đầu to): đầu 13 hàng, thân, tay, chân,
   rồi búi tóc, khăn vấn, nón lá, khăn đỏ, râu, mũ trụ. Lưới thân rộng 20 cột, cao 28 hàng (hàng 27 là
   bàn chân); hàng âm là phần nhô lên trên đầu. Mắt có tròng và đốm sáng, má hồng, viền theo màu từng vùng
   (outlineSel). Khung bước: 0 đứng, 1 và 2 hai nhịp chân (người nhún xuống một điểm ảnh); 'right' lật từ
   'left'. Mỗi chữ cái là một màu trong bảng màu pal bên dưới, '.' là trong suốt. */
import {flip,mk,outlineSel,shade} from './pixel.js';

export const BODY_H=28;   // chiều cao lưới thân
const cache={};

/* ---------- đầu (13 hàng) ---------- */
const HEAD={
  down:['......kkHHHHkk......','.....kHHHhhHHHk.....','....kHHhhHHHHHHk....','...kHHHHHHHHHHHHk...','...kHHHHHHHHHHHHk...',
        '...kHSSSSSSSSSSHk...','...kSSKKSSSSKKSSk...','...sSSwESSSSwESSs...','...sSSEESSSSEESSs...','...sSbSSSSSSSSbSs...',
        '....sSSSSmmSSSSs....','.....ssSSSSSSss.....','.......ssssss.......'],
  left:['.......kkHHHk.......','.....kkHHHHhHk......','....kHHHHHHhHHk.....','...kHHHHHHHHHHHk....','...kHHHHHHHHHHHHk...',
        '...SSSSSSHHHHHHHk...','..SSKKSSSSHHHHHHk...','..SSwESSSSsHHHHk....','.SSSEESSSSsHHHk.....','..SSbSSSSSsHHk......',
        '..smSSSSSSsk........','...ssSSSSs..........','.....ssss...........'],
  up:  ['......kkHHHHkk......','.....kHHHhhHHHk.....','....kHHhhHHHHHHk....','...kHHHHHHHHHHHHk...','...kHHHHhHHHHHHHk...',
        '...kHHHHHHHHHHHHk...','...kHHHHHHHHHHHHk...','...kHHHHHHHHHHHHk...','...kkHHHHHHHHHHkk...','....kkHHHHHHHHkk....',
        '....sSkkHHHHkkSs....','.....ssSSSSSSss.....','.......ssssss.......'],
};
// Trẻ con để chỏm: đầu cạo, một túm tóc trên đỉnh, má hồng to.
const KID={
  down:['........kHHk........','.......kHhHHk.......','.....ssSSHHSSss.....','....sSSSSSSSSSSs....','...sSSSSSSSSSSSSs...',
        '...sSSSSSSSSSSSSs...','...sSSKKSSSSKKSSs...','...sSSwESSSSwESSs...','...sSSEESSSSEESSs...','...sSbbSSSSSSbbSs...',
        '....sSSSSmmSSSSs....','.....ssSSSSSSss.....','.......ssssss.......'],
  left:['.........kHHk.......','........kHhHk.......','......ssSSHHSs......','....sSSSSSSSSSs.....','...sSSSSSSSSSSSs....',
        '...SSSSSSSSSSSSs....','..SSKKSSSSSSSSSs....','..SSwESSSSSSSSs.....','.SSSEESSSSSSSSs.....','..SSbbSSSSSSSs......',
        '..smSSSSSSSSs.......','...ssSSSSSs.........','.....sssss..........'],
  up:  ['........kHHk........','.......kHhHHk.......','.....ssSSHHSSss.....','....sSSSSSSSSSSs....','...sSSSSSSSSSSSSs...',
        '...sSSSSSSSSSSSSs...','...sSSSSSSSSSSSSs...','...sSSSSSSSSSSSSs...','...sSSSSSSSSSSSSs...','...sSSSSSSSSSSSSs...',
        '....sSSSSSSSSSSs....','.....ssSSSSSSss.....','.......ssssss.......'],
};
// Sư: đầu trọc (đầu trẻ con bỏ túm tóc và má hồng).
const BALD={};for(const d in KID)BALD[d]=KID[d].map((r,i)=>i<2?'.'.repeat(20):i===2?r.replace(/[Hh]/g,'S'):r.replace(/b/g,'S'));

/* ---------- phần thêm trên đầu (hàng tính theo đầu) ---------- */
const ALL=o=>({down:o,left:o,up:o});
const KNOT={down:[[-3,'........kHHk........'],[-2,'.......kHhHHk.......'],[-1,'........kkkk........']],
  left:[[-3,'..........kHHk......'],[-2,'.........kHhHHk.....'],[-1,'..........kkkk......']],
  up:[[-3,'........kHHk........'],[-2,'.......kHHHHk.......'],[-1,'........kkkk........']]};
const WRAP={ // khăn vấn, tóc dài hai bên mặt
  down:[[-1,'.....qQQQQQQQQq.....'],[0,'....QQqQQqQQqQQQ....'],[1,'...QqQQqQQqQQqQQQ...'],[2,'...qQQQqQQQqQQQQq...'],[3,'....qqqqqqqqqqqq....'],
        [5,'...H............H...'],[6,'...H............H...'],[7,'...H............H...'],[8,'...HH..........HH...'],[9,'....H..........H....']],
  left:[[-1,'......qQQQQQq.......'],[0,'.....QQqQQqQQQ......'],[1,'....QqQQqQQqQQQ.....'],[2,'....qQQQqQQQqQQq....'],[3,'.....qqqqqqqqqq.....']],
  up:[[-1,'.....qQQQQQQQQq.....'],[0,'....QQqQQqQQqQQQ....'],[1,'...QqQQqQQqQQqQQQ...'],[2,'...qQQQqQQQqQQQQq...'],[3,'....qqqqqqqqqqqq....']]};
const BAND={down:[[4,'...RRRRRRRRRRRRRR...']],
  left:[[4,'...RRRRRRRRRRRRRR...'],[5,'................rr..'],[6,'.................r..']],
  up:[[4,'...RRRRRRRRRRRRRR...'],[5,'........rRRr........'],[6,'.......r....r.......']]};
const HAT=ALL([[-4,'.........YY.........'],[-3,'........YYyY........'],[-2,'.......YYYYyy.......'],[-1,'......YYYYYYyy......'],
  [0,'.....YYYYYYYYyy.....'],[1,'....YYYYYYYYYYyy....'],[2,'..YYYYYYYYYYYYYYyy..'],[3,'.yyyyyyyyyyyyyyyyyy.']]);
const BEARD={down:[[10,'.....VWWWWWWWWV.....'],[11,'.....VWWWWWWWWV.....'],[12,'......VWWWWWWV......'],[13,'.......VWWWWV.......'],[14,'........VWWV........']],
  left:[[10,'..VWWWWSSSs.........'],[11,'..VWWWWWWs..........'],[12,'...VWWWWV...........'],[13,'....VWWV............'],[14,'.....VV.............']],up:[]};
const HELM={
  down:[[-4,'.........m..........'],[-3,'........MMm.........'],[-2,'.......MMMMm........'],[-1,'......MMMMMMm.......'],[0,'.....MMmMMMMMM......'],
        [1,'....MMMMMMMMMMMM....'],[2,'...MMMMMMMMMMMMMM...'],[3,'...TTTTTTTTTTTTTT...'],[4,'...TtTTtTTtTTtTTT...'],
        [5,'...tT..........Tt...'],[6,'...tT..........Tt...'],[7,'...tT..........Tt...'],[8,'...ttT........Ttt...'],[9,'....tt........tt....']],
  left:[[-4,'.........m..........'],[-3,'........MMm.........'],[-2,'.......MMMMm........'],[-1,'......MMMMMMm.......'],[0,'.....MMmMMMMMM......'],
        [1,'....MMMMMMMMMMMM....'],[2,'...MMMMMMMMMMMMMM...'],[3,'...TTTTTTTTTTTTTT...'],[4,'...TtTTtTTtTTtTTT...'],
        [5,'...........TTTt.....'],[6,'...........TTTt.....'],[7,'...........tTTt.....'],[8,'............ttt.....']],
  up:[[-4,'.........m..........'],[-3,'........MMm.........'],[-2,'.......MMMMm........'],[-1,'......MMMMMMm.......'],[0,'.....MMmMMMMMM......'],
        [1,'....MMMMMMMMMMMM....'],[2,'...MMMMMMMMMMMMMM...'],[3,'...TTTTTTTTTTTTTT...'],[4,'...TtTTtTTtTTtTTT...'],
        [5,'...tTTTTTTTTTTTTt...'],[6,'...tTTTTTTTTTTTTt...'],[7,'...tTTTTTTTTTTTTt...'],[8,'...tttttttttttttt...']]};
const PLUME=ALL([[-7,'........RR..........'],[-6,'.........Rr.........'],[-5,'........rR..........']]);

/* ---------- thân (không gồm tay), bắt đầu ở hàng 13 ---------- */
const TORSO={
  shirt:{ // áo giao lĩnh ngắn, thắt lưng
    down:['.....LCCCSSCCCc.....','.....LCCCdSCCCc.....','.....LCCdCCCCCc.....','.....LCdCCCCCCc.....','.....BBBBBBBBBB.....','.....LCCCbCCCCc.....','.....LCCCbCCCcc.....','.....ccCCCCCCcc.....'],
    left:['......CCCCCCcc......','......dCCCCCcc......','......CdCCCCcc......','......CCdCCCcc......','......BBBBBBBB......','......bCCCCCcc......','......bCCCCccc......','......cCCCCccc......'],
    up:  ['.....LCCCCCCCCc.....','.....LCCCCCCCCc.....','.....LCCCCCCCCc.....','.....LCCCCCCCCc.....','.....BBBBbbBBBB.....','.....LCCCbbCCCc.....','.....LCCCCCCCcc.....','.....ccCCCCCCcc.....']},
  long:{ // áo dài quá gối (thầy đồ, học trò, quan)
    down:['.....LCCCSSCCCc.....','.....LCCCdSCCCc.....','.....LCCdCCCCCc.....','.....LCdCCCCCCc.....','.....BBBBBBBBBB.....','.....LCCCCdCCCc.....','.....LCCCCdCCCc.....',
          '....LCCCCCdCCCCc....','....LCCCCCdCCCCc....','....LCCCCCdCCCcc....','....LCCCCCdCCCcc....','...LCCCCCCdCCCCcc...','...cccccccccccccc...'],
    left:['......CCCCCCcc......','......dCCCCCcc......','......CdCCCCcc......','......CCdCCCcc......','......BBBBBBBB......','......dCCCCCcc......','......dCCCCCcc......',
          '.....dCCCCCCccc.....','.....dCCCCCCccc.....','.....dCCCCCCccc.....','.....dCCCCCCccc.....','....dCCCCCCCcccc....','....cccccccccccc....'],
    up:  ['.....LCCCCCCCCc.....','.....LCCCCCCCCc.....','.....LCCCCCCCCc.....','.....LCCCCCCCCc.....','.....BBBBbbBBBB.....','.....LCCCbbCCCc.....','.....LCCCCCCCCc.....',
          '....LCCCCCCCCCCc....','....LCCCCCCCCCCc....','....LCCCCCCCCCCc....','....LCCCCCCCCCCc....','...LCCCCCCCCCCCCc...','...cccccccccccccc...']},
  dress:{ // áo tứ thân có yếm ở cổ, váy dài sẫm
    down:['.....LCCCXXCCCc.....','.....LCCCXXCCCc.....','.....LCCCCCCCCc.....','.....BBBBBBBBBB.....','.....LCCCbbCCCc.....','.....LCCCCCCCCc.....','....LCCCC..CCCCc....',
          '....JJJJJJJJJJJJ....','....JJJJJjJJJJJJ....','...JJJJJJjJJJJJJJ...','...JJJJJJjJJJJJJJ...','...JJJJJJjJJJJJJJ...','...jjjjjjjjjjjjjj...'],
    left:['......CCCCCCcc......','......XCCCCCcc......','......CCCCCCcc......','......BBBBBBBB......','......bCCCCCcc......','......CCCCCCcc......','.....CCCCCCCccc.....',
          '.....JJJJJJJJJj.....','.....JJJJJJJJJj.....','....JJJJJJJJJJjj....','....JJJJJJJJJJjj....','....JJJJJJJJJJjj....','....jjjjjjjjjjjj....'],
    up:  ['.....LCCCCCCCCc.....','.....LCCCCCCCCc.....','.....LCCCCCCCCc.....','.....BBBBbbBBBB.....','.....LCCCbbCCCc.....','.....LCCCCCCCCc.....','....LCCCCCCCCCCc....',
          '....JJJJJJJJJJJJ....','....JJJJJJJJJJJJ....','...JJJJJJJJJJJJJJ...','...JJJJJJJJJJJJJJ...','...JJJJJJJJJJJJJJ...','...jjjjjjjjjjjjjj...']},
  monk:{ // áo nâu nhà sư, cà sa vắt chéo
    down:['.....LCCCCCCCCc.....','.....LdCCCCCCCc.....','.....LCdCCCCCCc.....','.....LCCdCCCCCc.....','.....LCCCdCCCCc.....','.....LCCCCdCCCc.....','.....LCCCCCdCCc.....',
          '....LCCCCCCCdCCc....','....LCCCCCCCCdCc....','....LCCCCCCCCCCc....','....LCCCCCCCCCcc....','...LCCCCCCCCCCCCc...','...cccccccccccccc...'],
    left:['......CCCCCCcc......','......CCCCCdcc......','......CCCCdCcc......','......CCCdCCcc......','......CCdCCCcc......','......CdCCCCcc......','......CCCCCCcc......',
          '.....CCCCCCCccc.....','.....CCCCCCCccc.....','.....CCCCCCCccc.....','.....CCCCCCCccc.....','....CCCCCCCCcccc....','....cccccccccccc....'],
    up:  ['.....LCCCCCCCCc.....','.....LCCCCCCCdc.....','.....LCCCCCCdCc.....','.....LCCCCCdCCc.....','.....LCCCCdCCCc.....','.....LCCCdCCCCc.....','.....LCCdCCCCCc.....',
          '....LCCdCCCCCCCc....','....LCdCCCCCCCCc....','....LCCCCCCCCCCc....','....LCCCCCCCCCcc....','...LCCCCCCCCCCCCc...','...cccccccccccccc...']},
  coat:{ // áo choàng giặc Nguyên: vạt chéo viền lông, đai da
    down:['....TLCCCCCCCCcT....','.....LCCCCCTCCc.....','.....LCCCCTCCCc.....','.....LCCCTCCCCc.....','.....OOOOOOOOOO.....','.....LCCTCCCCCc.....',
          '.....LCCTCCCCCc.....','....LCCCTCCCCCCc....','....LCCCTCCCCCCc....','....LCCCTCCCCCcc....','....tttTtttttttt....'],
    left:['.....TCCCCCCccT.....','......TCCCCCcc......','......CTCCCCcc......','......CCTCCCcc......','......OOOOOOOO......','......TCCCCCcc......',
          '......TCCCCCcc......','.....TCCCCCCccc.....','.....TCCCCCCccc.....','.....TCCCCCCccc.....','.....tttttttttt.....'],
    up:  ['....TLCCCCCCCCcT....','.....LCCCCCCCCc.....','.....LCCCCCCCCc.....','.....LCCCCCCCCc.....','.....OOOOOOOOOO.....','.....LCCCcCCCCc.....',
          '.....LCCCcCCCCc.....','....LCCCCcCCCCCc....','....LCCCCcCCCCCc....','....LCCCCcCCCCcc....','....tttttttttttt....']},
};

/* ---------- chân: mỗi kiểu 3 khung ---------- */
const BARE_F=[['......PPPPPPPP......','......PPpPPpPP......','......PPP..PPP......','......PPp..pPP......','......PPp..pPP......','......FFF..FFF......','.....FFFF..FFFF.....'],
  ['......PPPPPPPP......','......PPpPPpPP......','......PPP..PPP......','......PPp..pPP......','......FFF..pPP......','.....FFFF..FFF......','..........FFFF......'],
  ['......PPPPPPPP......','......PPpPPpPP......','......PPP..PPP......','......PPp..pPP......','......PPp..FFF......','......FFF..FFFF.....','......FFFF..........']];
const LEGS={
  bare:{down:BARE_F,up:[BARE_F[0],BARE_F[2],BARE_F[1]],
    left:[['.......PPPPPP.......','........PPPP........','........PPpP........','........PPpP........','........PPpP........','........FFFF........','.......FFFFF........'],
          ['.......PPPPPP.......','.......PPPPPp.......','......PPP..pP.......','.....PPP....pPP.....','....PPP......pPP....','....FFF.......FFF...','...FFFF.......FFF...'],
          ['.......PPPPPP.......','.......pPPPPP.......','......Pp..PPP.......','.....PPp....PPP.....','....PPp......PPP....','....FFF.......FFF...','...FFFF.......FFF...']]},
  robe:{down:[['......FFF..FFF......','......FFF..FFF......'],['......FFF..FFF......','.....FFFF...FF......'],['......FFF..FFF......','......FF...FFFF.....']],
    up:[['......FFF..FFF......','......FFF..FFF......'],['......FFF..FFF......','......FF...FFFF.....'],['......FFF..FFF......','.....FFFF...FF......']],
    left:[['........FFFF........','.......FFFFF........'],['......FF...FF.......','.....FFF...FFF......'],['......FF...FF.......','.....FFF...FFF......']]},
  boots:{down:[['......PPP..PPP......','......OOO..OOO......','......OOO..OOO......','.....OOOO..OOOO.....'],['......PPP..PPP......','......OOO..OOO......','.....OOOO..OOO......','...........OOOO.....'],['......PPP..PPP......','......OOO..OOO......','......OOO..OOOO.....','.....OOOO...........']],
    up:[['......PPP..PPP......','......OOO..OOO......','......OOO..OOO......','.....OOOO..OOOO.....'],['......PPP..PPP......','......OOO..OOO......','......OOO..OOOO.....','.....OOOO...........'],['......PPP..PPP......','......OOO..OOO......','.....OOOO..OOO......','...........OOOO.....']],
    left:[['........PPPP........','........OOOO........','........OOOO........','.......OOOOO........'],['.......PP..PP.......','......OOO...OO......','....OOO......OOO....','...OOOO......OOO....'],['.......PP..PP.......','......OOO...OO......','....OOO......OOO....','...OOOO......OOO....']]},
};

/* ---------- tay: ống tay hai cột, bàn tay 2×2; tay đánh ra trước trông ngắn lại ---------- */
function arms(dir,f,len){
  const out=[],sw=f===1?1:f===2?-1:0;
  if(dir==='left'){for(let i=0;i<len;i++){const x=9-Math.round(sw*i*1.4/(len-1));out.push([x,i,'C'],[x+1,i,i<2?'C':'c'])}
    const hx=9-Math.round(sw*1.4);out.push([hx,len,'S'],[hx+1,len,'s'],[hx,len+1,'s'],[hx+1,len+1,'s']);return out}
  for(const [x,fw] of [[3,sw>0],[15,sw<0]]){const n=len-(fw?1:0);
    for(let i=0;i<n;i++)out.push([x,i,x===3?'c':'C'],[x+1,i,x===3?'C':'c']);
    out.push([x,n,'S'],[x+1,n,'S'],[x,n+1,'s'],[x+1,n+1,'s'])}
  return out}

function paint(g,ox,oy,rows,pal){for(let y=0;y<rows.length;y++){const r=rows[y];for(let x=0;x<r.length;x++){const col=pal[r[x]];if(!col)continue;g.fillStyle=col;g.fillRect(ox+x,oy+y,1,1)}}}
const overlay=(g,ox,oy,list,pal)=>{for(const [ry,row] of list)paint(g,ox,oy+ry,[row],pal)};

export function personSprite(o,dir,f){
  const key=JSON.stringify(o)+dir+f;if(cache[key])return cache[key];
  if(dir==='right')return cache[key]=flip(personSprite(o,'left',f));
  const d=dir==='left'?'left':dir==='up'?'up':'down';
  const top=o.spear?14:o.plume?11:o.hat||o.helm?8:6,[c,g]=mk(22,top+BODY_H+1),X=1,Y=top;
  const kid=o.kid,sh=o.shirt,woman=o.hair==='woman'||o.hair==='oldwoman',monk=o.hair==='monk',enemy=!!o.helm;
  const hair={old:['#e6e0d4','#ffffff','#a39a8c'],oldwoman:['#c9c2b3','#e6e0d4','#8f877a']}[o.hair]||['#2b2320','#4d3d35','#171110'];
  const B=o.belt||(o.long||woman?shade(sh,-.4):'#8a3a2a');
  const pal={S:'#f2c49b',s:'#d9a07a',b:'#ef9f8f',m:'#a8574a',K:'#2a1810',E:'#3d2516',w:'#ffffff',F:'#d9a07a',
    H:hair[0],h:hair[1],k:hair[2],C:sh,L:shade(sh,.16),c:shade(sh,-.22),d:shade(sh,-.45),B,b:shade(B,-.22),
    P:o.pants||'#4a3b2f',p:shade(o.pants||'#4a3b2f',-.28),J:'#2f2723',j:'#201a17',X:'#c0603e',O:'#3a2c22',
    Q:'#4e3122',q:'#6d4430',Y:'#e2cb8c',y:'#b9a066',R:'#c0392b',r:'#8a2420',M:'#6b727c',T:'#7a6048',t:'#56432f',W:'#eee8dc',V:'#c8c0b2'};
  const palHelm={...pal,m:'#a3aab3'};
  const type=enemy?'coat':monk?'monk':woman?'dress':o.long?'long':'shirt';
  const legType=enemy?'boots':type==='shirt'?'bare':'robe';
  const bob=f?1:0;                                  // nhún xuống khi bước
  const headY=kid?6:0,torsoY=kid?19:13;

  // ngọn giáo, vẽ trước để nằm sau người
  if(o.spear){const sx=X+(d==='left'?3:17);g.fillStyle='#6a4e2e';g.fillRect(sx,Y-11,1,BODY_H+10);g.fillStyle='#d3d7da';g.fillRect(sx-1,Y-13,3,2);g.fillStyle='#eef0f2';g.fillRect(sx,Y-14,1,1);g.fillStyle='#c0392b';g.fillRect(sx-1,Y-9,3,2)}
  // chân (trẻ con: bớt hàng cho chân ngắn)
  let legs=LEGS[legType][d][f%3];if(kid&&legType==='bare')legs=[0,3,5,6].map(i=>legs[i]);
  paint(g,X,Y+BODY_H-legs.length,legs,pal);
  // thân (trẻ con: thân ngắn)
  let torso=TORSO[type][d];if(kid)torso=torso.filter((_,i)=>i!==2&&i!==3&&i!==6);
  const sway=(type==='long'||type==='dress'||type==='monk')&&f?(f===1?1:-1):0;
  torso.forEach((r,i)=>paint(g,X+(i>=torso.length-2?sway:0),Y+torsoY+bob+i,[r],pal));
  // tay
  for(const [x,y,ch] of arms(d,f,kid?3:5)){g.fillStyle=pal[ch];g.fillRect(X+x,Y+torsoY+bob+y,1,1)}
  // đầu và phần thêm
  const hy=Y+headY+bob;
  paint(g,X,hy,(kid?KID:monk?BALD:HEAD)[d],pal);
  if(!kid&&!monk&&!woman&&!enemy&&!o.hat)overlay(g,X,hy,KNOT[d],pal);
  if(woman)overlay(g,X,hy,WRAP[d],pal);
  if(o.hair==='old')overlay(g,X,hy,BEARD[d],pal);
  if(o.band)overlay(g,X,hy,BAND[d],pal);
  if(o.hat)overlay(g,X,hy,HAT[d],pal);
  if(enemy){overlay(g,X,hy,HELM[d],palHelm);if(o.plume)overlay(g,X,hy,PLUME[d],pal)}
  outlineSel(c);c.ax=X+10;c.ay=Y+BODY_H;
  return cache[key]=c;
}
