/* ================= người ================= */
/* Sprite người kiểu chibi (đầu to, vai rộng, chân ngắn), ghép từ các mẫu điểm ảnh viết bằng chữ: đầu 15 hàng,
   thân, tay, chân, rồi búi tóc, búi tóc cài trâm, nón lá, khăn đỏ, râu, mũ trụ. Lưới rộng 20 cột, cao 28 hàng
   (hàng 27 là bàn chân); hàng âm là phần nhô lên trên đầu. Mỗi vùng tô 3–4 tông, sáng từ trên bên trái;
   tóc có mái lởm chởm và vệt sáng; viền theo màu từng vùng (outlineSel). Khung bước: 0 đứng, 1 và 2 hai
   nhịp chân (người nhún xuống một điểm ảnh); 'right' lật từ 'left'. Mỗi chữ cái là một màu trong bảng
   màu pal bên dưới, '.' là trong suốt. */
import {flip,mk,outlineSel,shade} from './pixel.js';

export const BODY_H=28;   // chiều cao lưới thân
export const KID_HEAD=4;  // trẻ con: đầu bắt đầu ở hàng này (người thấp hơn)
const cache={};

/* ---------- đầu (15 hàng) ---------- */
const HAIR_TOP=['.......kkkkkk.......','.....kkHHhhHHkk.....','....kHhhhHHHHHgk....','...kHhhHHHHHHHHgk...','..kHHhHHHHHHHHHHgk..',
  '..kHHgHHHHgHHHHggk..'];
const HEAD={
  down:[...HAIR_TOP,
    '..kHgSgHHgSgHHgSgk..','..kgSSSgSSSSSSgSgk..','..kgSKKSSSSSSKKSgk..','..kHSSSSSSSSSSSSHk..',
    '.skgSKKSSSSSSKKSgks.','.skgSKESSSSSSEKSgks.','...ksbSSSSSSSSbsk...','....sSSSSmmSSSSs....','......sSSSSSSs......'],
  left:['........kkkkkk......','......kkHHhhHHkk....','.....kHhhhHHHHHHk...','....kHhhHHHHHHHHgk..','...kHHhHHHHHHHHHgk..',
    '..kHHgHHHHHHHHHHgk..','..kgSgHgHHHHHHHHgk..','..gSSSSgHHHHHHHHgk..','..SKKSSSgHHHHHHHgk..','..SSSSSSSsHHHHHHgk..',
    '..SKKSSSSzsHHHHHgk..','.SSKESSSSssHHHHHgk..','..SbSSSSSSsHHHHgk...','..mSSSSSSsgggk......','...ssssssss.........'],
  up:[...HAIR_TOP,
    '..kHHHgHHHHgHHHHgk..','..kHHHgHHHHgHHHHgk..','..kHHgHHHHHHgHHHgk..','..kHHgHHHHHHgHHHgk..',
    '.skHgHHHHHHHHgHHgks.','..kgHHHHHHHHHHHggk..','...kgHHHHHHHHHHgk...','....kggHHHHHHggk....','.....sSkkkkkkSs.....'],
};
// Đàn bà: rẽ ngôi giữa, tóc ôm mặt, búi sau gáy cài trâm (WBUN), mi mắt cong.
const WOMAN={
  down:[...HAIR_TOP.slice(0,5),
    '..kHHHHHHkkHHHHHHk..','..kHHHHHgSSgHHHHHk..','..kHHHgSSSSSSgHHHk..','..kHHgSSSSSSSSgHHk..','..kHgSSSSSSSSSSgHk..',
    '..kHSKKKSSSSKKKSHk..','..kgSbKESSSSEKbSgk..','...kgSSSSSSSSSSgk...','....sSSSSmmSSSSs....','......sSSSSSSs......'],
  left:['........kkkkkk......','......kkHHhhHHkk....','.....kHhhhHHHHHHk...','....kHhhHHHHHHHHgk..','...kHHhHHHHHHHHHgk..',
    '...kHHHHHHHHHHHHgk..','..kgHHHHHHHHHHHHgk..','..gSSgHHHHHHHHHHgk..','..SSSSSgHHHHHHHHgk..','..SSSSSSgHHHHHHHgk..',
    '..KKKSSSzsHHHHHHgk..','.SSKESSSssHHHHHHgk..','..SbSSSSsgHHHHHgk...','..mSSSSSsgHHHHgk....','...sssssskgHHgk.....'],
  up:[...HAIR_TOP,
    '..kHHHgHHHHgHHHHgk..','..kHHHgHHHHgHHHHgk..','..kHHgHHHHHHgHHHgk..','..kHHgHHHHHHgHHHgk..',
    '.skHgHHHHHHHHgHHgks.','..kgHHHHHHHHHHHggk..','...kgHHHHHHHHHHgk...','....kgHHHHHHHHgk....','.....sSkkggkkSs.....'],
};
// Trẻ con để chỏm: đầu cạo (u), một túm tóc trên đỉnh, má phúng phính.
const KID={
  down:['........kHHk........','.......kHhHHk.......','......luukkuuu......','....luuuuuuuuuuu....','...luuuuuuuuuuuuu...',
    '..lSSSSSSSSSSSSSSs..','..SSSSSSSSSSSSSSSs..','..SSSSSSSSSSSSSSSs..','..SSSSSSSSSSSSSSSs..','..SSSSSSSSSSSSSSSs..',
    '..SSSKKSSSSSSKKSSs..','..SSbEESSSSSSEEbSs..','..sSSSSSSmmSSSSSSs..','...sSSSSSSSSSSSSs...','.....ssssssssss.....'],
  left:['.........kHHk.......','........kHhHHk......','.......lukkuu.......','.....luuuuuuuuu.....','....luuuuuuuuuuu....',
    '...lSSSSSSSSSSSSs...','..SSSSSSSSSSSSSSs...','..SSSSSSSSSSSSSSSs..','..SSSSSSSSsSSSSSSs..','..SSSSSSSssSSSSSSs..',
    '..KKSSSSSssSSSSSSs..','.SEEbSSSSSSSSSSSs...','..mSSSSSSSSSSSSSs...','...sSSSSSSSSSSs.....','.....ssssssss.......'],
  up:['........kHHk........','.......kHhHHk.......','......luuukkuuu.....','....luuuuuuuuuuu....','...luuuuuuuuuuuuu...',
    '..lSSSSSSSSSSSSSSs..','..SSSSSSSSSSSSSSSs..','..SSSSSSSSSSSSSSSs..','..SSSSSSSSSSSSSSSs..','.sSSSSSSSSSSSSSSSss.',
    '..SSSSSSSSSSSSSSSs..','..sSSSSSSSSSSSSSSs..','..sSSSSSSSSSSSSSss..','...ssSSSSSSSSSSss...','.....ssssssssss.....'],
};
// Sư: đầu cạo trơn (đầu trẻ con bỏ chỏm và má hồng).
const BALD={};for(const d in KID)BALD[d]=KID[d].map((r,i)=>i<2?'.'.repeat(20):i===2?r.replace(/k/g,'u'):r.replace(/b/g,'S'));

/* ---------- phần thêm trên đầu (hàng tính theo đầu) ---------- */
const ALL=o=>({down:o,left:o,up:o});
const KNOT={down:[[-3,'........kkkk........'],[-2,'.......kHhHgk.......'],[-1,'.......kHHHgk.......']],
  left:[[-3,'..........kkkk......'],[-2,'.........kHhHgk.....'],[-1,'.........kHHHgk.....']],
  up:[[-3,'........kkkk........'],[-2,'.......kHhHgk.......'],[-1,'.......kHHHgk.......']]};
const WBUN={ // búi tóc đàn bà, cài trâm
  down:[[-3,'.......kkkkkk.......'],[-2,'...GGkHhhHHHgk......'],[-1,'......kHHHHHgk......']],
  left:[[-1,'..........kkkkk.....'],[0,'.........kHhHHgk....'],[1,'........GkHHHHgkGG..'],[2,'.........kgHHgk.....'],[3,'..........kkkk......']],
  up:[[-3,'.......kkkkkk.......'],[-2,'......kHhhHHHgkGG...'],[-1,'......kHHHHHgk......']]};
const BAND={down:[[6,'..rRRRRRRRRRRRRRRr..']],
  left:[[6,'..RRRRRRRRRRRRRRRr..'],[7,'.................rR.'],[8,'.................Rr.'],[9,'..................r.']],
  up:[[6,'..rRRRRRRRRRRRRRRr..'],[7,'........rRRr........'],[8,'.......Rr..rR.......'],[9,'.......r....r.......']]};
const HAT=ALL([[-5,'.........UY.........'],[-4,'........UYYy........'],[-3,'.......UYyYYy.......'],[-2,'......UYYYYYyy......'],
  [-1,'.....UYYyYYYYyy.....'],[0,'....UYYYYYYYYYyy....'],[1,'...UYYYyYYYYYYyy....'],[2,'..UYYYYYYYYYYYYYyy..'],
  [3,'.UYYYYYYYYYYYYYYYyy.'],[4,'yyyyyyyyyyyyyyyyyyyy'],[5,'..o..............o..']]);
const BEARD={down:[[13,'....sVZZZmmZZZVs....'],[14,'.....VZZZZZZZZV.....'],[15,'......VZZZZZZV......'],[16,'......VZZZZZZV......'],[17,'.......VZZZZV.......'],[18,'........VZZV........']],
  left:[[13,'..ZVVSSSs...........'],[14,'..ZZZVVs............'],[15,'..ZZZZV.............'],[16,'...ZZZV.............'],[17,'....ZV..............']],up:[]};
const HELM={
  down:[[-4,'.........mm.........'],[-3,'........MNNm........'],[-2,'.......MNMMMm.......'],[-1,'......MNMMMMMm......'],[0,'.....MNMMMMMMMm.....'],
    [1,'....MNMMMMMMMMMm....'],[2,'...MMMMMMMMMMMMMm...'],[3,'..mmmmmmmmmmmmmmmm..'],[4,'..TTTTTTTTTTTTTTTT..'],[5,'..TtTTtTTtTTtTTtTT..'],
    [6,'..tT............Tt..'],[7,'..tT............Tt..'],[8,'..tT............Tt..'],[9,'..tTT..........TTt..'],[10,'..tTT..........TTt..'],[11,'..ttT..........Ttt..'],[12,'...tt..........tt...']],
  left:[[-4,'.........mm.........'],[-3,'........MNNm........'],[-2,'.......MNMMMm.......'],[-1,'......MNMMMMMm......'],[0,'.....MNMMMMMMMm.....'],
    [1,'....MNMMMMMMMMMm....'],[2,'...MMMMMMMMMMMMMm...'],[3,'..mmmmmmmmmmmmmmmm..'],[4,'..TTTTTTTTTTTTTTTT..'],[5,'..TtTTtTTtTTtTTtTT..'],
    [6,'..........TTTTTTTt..'],[7,'..........tTTTTTTt..'],[8,'...........TTTTTTt..'],[9,'...........tTTTTTt..'],[10,'............TTTTt...'],[11,'............tttt....']],
  up:[[-4,'.........mm.........'],[-3,'........MNNm........'],[-2,'.......MNMMMm.......'],[-1,'......MNMMMMMm......'],[0,'.....MNMMMMMMMm.....'],
    [1,'....MNMMMMMMMMMm....'],[2,'...MMMMMMMMMMMMMm...'],[3,'..mmmmmmmmmmmmmmmm..'],[4,'..TTTTTTTTTTTTTTTT..'],[5,'..TtTTtTTtTTtTTtTT..'],
    [6,'..tTTTTTTTTTTTTTTt..'],[7,'..tTTtTTTTtTTTTtTt..'],[8,'..tTTTTTTTTTTTTTTt..'],[9,'..tTTTTtTTTTtTTTTt..'],[10,'..tTTTTTTTTTTTTTTt..'],[11,'..ttttttttttttttt...']]};
const MUST={down:[[12,'........KKKK........'],[13,'.......K....K.......']],left:[[12,'..KKK...............'],[13,'...K................']],up:[]}; // ria giặc
const PLUME=ALL([[-8,'.........Rr.........'],[-7,'........RRr.........'],[-6,'.........Rr.........'],[-5,'.........GG.........']]);

/* ---------- thân (không gồm tay), bắt đầu ở hàng 14 ---------- */
const TORSO={
  shirt:{ // áo cánh cổ chéo, thắt lưng vải
    down:['....LLCCAWWACCcc....','....LCCCAWWACCcc....','....LCCCCAWACCcc....','....LCCCCCAACCcc....','....LCCCCCCACCcc....',
          '....BBBBBBBBBBnn....','....LCCCCnCCCCcc....','....LCCCCnCCCCcd....','....dccccccccccd....'],
    left:['......ACCCCCcc......','......AWCCCCcc......','......CACCCCcc......','......CCACCCcc......','......CCCCCCcc......',
          '......BBBBBBnn......','......CCCCCCcc......','......CCCCCCcc......','......dccccccd......'],
    up:  ['....LLCCCCCCCCcc....','....LCCCCCCCCCcc....','....LCCCCcCCCCcc....','....LCCCCcCCCCcc....','....LCCCCcCCCCcc....',
          '....BBBBnnBBBBnn....','....LCCCCCCCCCcc....','....LCCCCCCCCCcd....','....dccccccccccd....']},
  long:{ // áo dài quá gối (thầy đồ, học trò, quan)
    down:['....LLCCAWWACCcc....','....LCCCAWWACCcc....','....LCCCCAWACCcc....','....LCCCCCAACCcc....','....LCCCCCCACCcc....',
          '....BBBBBBBBBBnn....','....LCCCCCCACCcc....','....LCCCCCCACCcc....','...LLCCCCCCACCccc...','...LCCCCCCCACCccc...',
          '...LCCCCCCCACCccc...','...dddddddddddddd...'],
    left:['......ACCCCCcc......','......AWCCCCcc......','......CACCCCcc......','......CCACCCcc......','......CCCCCCcc......',
          '......BBBBBBnn......','......ACCCCCcc......','......ACCCCCcc......','.....AACCCCCccc.....','.....ACCCCCCccc.....',
          '....AACCCCCCcccc....','....dddddddddddd....'],
    up:  ['....LLCCCCCCCCcc....','....LCCCCCCCCCcc....','....LCCCCcCCCCcc....','....LCCCCcCCCCcc....','....LCCCCcCCCCcc....',
          '....BBBBnnBBBBnn....','....LCCCCcCCCCcc....','....LCCCCcCCCCcc....','...LLCCCCcCCCCccc...','...LCCCCCcCCCCccc...',
          '...LCCCCCcCCCCccc...','...dddddddddddddd...']},
  dress:{ // áo tứ thân, yếm đỏ ở cổ, thắt lưng, váy sẫm
    down:['....LLCCAAAACCcc....','....LCCAXXXXACcc....','....LCCCAXXACCcc....','....LCCCCAACCCcc....','....BBBBBBBBBBnn....',
          '....LCCCCnnCCCcc....','....LCCCCnnCCCcc....','...JJJJJJJJJJJJJj...','...JJJJJJjJJJJJJj...','...JJJJJJjJJJJJJj...',
          '..JJJJJJJjJJJJJJjj..','..jjjjjjjjjjjjjjjj..'],
    left:['......XCCCCCcc......','......XACCCCcc......','......CACCCCcc......','......CCCCCCcc......','......BBBBBBnn......',
          '......CCCCCCcc......','......CCCCCCcc......','.....JJJJJJJJjj.....','.....JJJJJJJJjj.....','.....JJJJJJJJjj.....',
          '....JJJJJJJJJJjj....','....jjjjjjjjjjjj....'],
    up:  ['....LLCCCCCCCCcc....','....LCCCCCCCCCcc....','....LCCCCcCCCCcc....','....LCCCCcCCCCcc....','....BBBBnnBBBBnn....',
          '....LCCCCCCCCCcc....','....LCCCCCCCCCcc....','...JJJJJJJJJJJJJj...','...JJJJJJJJJJJJJj...','...JJJJJJJJJJJJJj...',
          '..JJJJJJJJJJJJJJjj..','..jjjjjjjjjjjjjjjj..']},
  monk:{ // áo nâu nhà sư, cà sa vắt chéo
    down:['....LLCCCCCCCCcc....','....LACCCCCCCCcc....','....LCACCCCCCCcc....','....LCCACCCCCCcc....','....LCCCACCCCCcc....',
          '....LCCCCACCCCcc....','....LCCCCCACCCcc....','....LCCCCCCACCcc....','...LLCCCCCCCACccc...','...LCCCCCCCCCAccc...',
          '...LCCCCCCCCCCccc...','...dddddddddddddd...'],
    left:['......CCCCCCcc......','......CCCCCAcc......','......CCCCACcc......','......CCCACCcc......','......CCACCCcc......',
          '......CACCCCcc......','......CCCCCCcc......','......CCCCCCcc......','.....CCCCCCCccc.....','.....CCCCCCCccc.....',
          '....CCCCCCCCcccc....','....dddddddddddd....'],
    up:  ['....LLCCCCCCCCcc....','....LCCCCCCCCAcc....','....LCCCCCCCACcc....','....LCCCCCCACCcc....','....LCCCCCACCCcc....',
          '....LCCCCACCCCcc....','....LCCCACCCCCcc....','....LCCACCCCCCcc....','...LLCACCCCCCCccc...','...LCACCCCCCCCccc...',
          '...LCCCCCCCCCCccc...','...dddddddddddddd...']},
  coat:{ // áo choàng giặc Nguyên: vạt chéo viền lông, đai da khóa đồng
    down:['....LCTTTTTTTTcc....','....LCCCCCTTCCcc....','....LCCCCCCTTCcc....','....LCCCCCCCTTcc....','....OOOOOGGOOOoo....',
          '....LCCCCCCCTCcc....','....LCCCCCCCTCcc....','....LCCCCCCCTCcc....','...LLCCCCCCCTCccc...','...TTTTTTTTTTTTTT...'],
    left:['......TTTTTTcc......','......TCCCCCcc......','......CTCCCCcc......','......CCTCCCcc......','......OOGOOOoo......',
          '......TCCCCCcc......','......TCCCCCcc......','......TCCCCCcc......','.....TCCCCCCccc.....','.....TTTTTTTTTT.....'],
    up:  ['....LTTTTTTTTTTc....','....LCCCCCCCCCcc....','....LCCCCCCCCCcc....','....LCCCCCCCCCcc....','....OOOOOOOOOOoo....',
          '....LCCCCcCCCCcc....','....LCCCCcCCCCcc....','....LCCCCcCCCCcc....','...LLCCCCcCCCCccc...','...TTTTTTTTTTTTTT...']},
};

/* ---------- chân: mỗi kiểu 3 khung ---------- */
const BARE_F=[
  ['.....PPPPPPPPPP.....','.....PPPp..PPPp.....','.....PPPp..PPPp.....','......SSs..SSs......','.....SSSs..SSSs.....'],
  ['.....PPPPPPPPPP.....','.....PPPp..PPPp.....','......SSs..PPPp.....','.....SSSs..SSs......','...........SSSs.....'],
  ['.....PPPPPPPPPP.....','.....PPPp..PPPp.....','.....PPPp..SSs......','......SSs..SSSs.....','.....SSSs...........']];
const LEGS={
  bare:{down:BARE_F,up:[BARE_F[0],BARE_F[2],BARE_F[1]],
    left:[['.......PPPPPP.......','.......PPPPPp.......','.......PPPPPp.......','........SSSs........','.......SSSSs........'],
          ['.......PPPPPP.......','......PPPp.PPp......','.....PPPp...PPp.....','....SSSs.....SSs....','...SSSSs.....SSSs...'],
          ['.......PPPPPP.......','.......PPP.PPp......','......PPp...PPp.....','.....SSs.....SSs....','....SSSs....SSSs....']]},
  robe:{down:[['......OOo..OOo......','.....OOOo..OOOo.....'],['......OOo..OOo......','.....OOOo...OOo.....'],['......OOo..OOo......','......OOo..OOOo.....']],
    up:[['......OOo..OOo......','.....OOOo..OOOo.....'],['......OOo..OOo......','......OOo..OOOo.....'],['......OOo..OOo......','.....OOOo...OOo.....']],
    left:[['........OOOo........','.......OOOOo........'],['......OOo..OOo......','.....OOOo..OOOo.....'],['.......OOo.OOo......','......OOOo.OOOo.....']]},
  boots:{down:[['.....PPPp..PPPp.....','.....OOOo..OOOo.....','.....OOOo..OOOo.....','....OOOOo..OOOOo....'],['.....PPPp..PPPp.....','.....OOOo..OOOo.....','....OOOOo..OOOo.....','...........OOOOo....'],['.....PPPp..PPPp.....','.....OOOo..OOOo.....','.....OOOo..OOOOo....','....OOOOo...........']],
    up:[['.....PPPp..PPPp.....','.....OOOo..OOOo.....','.....OOOo..OOOo.....','....OOOOo..OOOOo....'],['.....PPPp..PPPp.....','.....OOOo..OOOo.....','.....OOOo..OOOOo....','....OOOOo...........'],['.....PPPp..PPPp.....','.....OOOo..OOOo.....','....OOOOo..OOOo.....','...........OOOOo....']],
    left:[['.......PPPPPp.......','.......OOOOOo.......','.......OOOOOo.......','......OOOOOOo.......'],['......PPPp.PPp......','.....OOOo...OOo.....','....OOOo....OOOo....','...OOOOo....OOOOo...'],['......PPPp.PPp......','.....OOOo...OOo.....','....OOOo....OOOo....','...OOOOo....OOOOo...']]},
};

/* ---------- tay: ống tay 3 cột (sáng bên trái, tối bên phải), cổ tay viền, nắm tay 3×2 ---------- */
function arms(dir,f,len){
  const out=[],sw=f===1?1:f===2?-1:0,hand=(x,y)=>out.push([x,y,'A'],[x+1,y,'A'],[x+2,y,'a'],[x,y+1,'l'],[x+1,y+1,'S'],[x+2,y+1,'s'],[x,y+2,'S'],[x+1,y+2,'s'],[x+2,y+2,'z']);
  if(dir==='left'){ // một tay phía trước, vung theo bước
    for(let i=0;i<len;i++){const x=8-Math.round(sw*i*1.6/(len-1));out.push([x,i,'L'],[x+1,i,'C'],[x+2,i,'c'])}
    hand(8-Math.round(sw*1.6),len);return out}
  for(const [x,fw,sh] of [[2,sw>0,['L','C','c']],[15,sw<0,['C','c','d']]]){const n=len-(fw?1:0);
    out.push([x+(x===2?1:0),-1,sh[0]],[x+(x===2?2:1),-1,sh[1]]);  // đầu vai
    for(let i=0;i<n;i++)out.push([x,i,sh[0]],[x+1,i,sh[1]],[x+2,i,sh[2]]);
    hand(x,n)}
  return out}

function paint(g,ox,oy,rows,pal){for(let y=0;y<rows.length;y++){const r=rows[y];for(let x=0;x<r.length;x++){const col=pal[r[x]];if(!col)continue;g.fillStyle=col;g.fillRect(ox+x,oy+y,1,1)}}}
const overlay=(g,ox,oy,list,pal)=>{for(const [ry,row] of list)paint(g,ox,oy+ry,[row],pal)};

const HAIR={ // tối nhất, bóng, giữa, sáng
  man:['#120c0a','#2a1d18','#3d2c25','#76563f'],old:['#8a8478','#b9b2a5','#ddd7cb','#ffffff'],
  oldwoman:['#6f6860','#9d958a','#c4bcaf','#e6e0d4']};

export function personSprite(o,dir,f){
  const key=JSON.stringify(o)+dir+f;if(cache[key])return cache[key];
  if(dir==='right')return cache[key]=flip(personSprite(o,'left',f));
  const d=dir==='left'?'left':dir==='up'?'up':'down';
  const top=o.spear?14:o.plume?12:o.hat||o.helm?8:6,[c,g]=mk(22,top+BODY_H+1),X=1,Y=top;
  const kid=o.kid,sh=o.shirt,woman=o.hair==='woman'||o.hair==='oldwoman',monk=o.hair==='monk',enemy=!!o.helm;
  const hr=HAIR[o.hair]||HAIR.man;
  const B=o.belt||(woman?shade(sh,-.45):o.long?shade(sh,-.4):'#7a3a2a');
  const pal={S:'#f5c9a3',s:'#dda17b',l:'#ffe3c8',z:'#bb7a5a',u:'#e2b799',b:'#f19c8c',m:'#a84f42',K:'#2b1a14',E:'#5c3424',
    k:hr[0],g:hr[1],H:hr[2],h:hr[3],
    C:sh,L:shade(sh,.18),c:shade(sh,-.2),d:shade(sh,-.42),A:'#eadcbe',a:'#bfac88',W:'#f7f1e3',B,n:shade(B,-.3),
    P:o.pants||'#4a3b2f',p:shade(o.pants||'#4a3b2f',-.3),O:'#2f2520',o:'#1d1613',X:'#c9563b',J:'#2f2622',j:'#1f1916',
    Y:'#e8d193',y:'#b89a5c',U:'#f8eabf',R:'#c43a2b',r:'#7e2219',
    M:'#6f7782',m:'#454b55',N:'#aab3bd',T:'#5e4a3a',t:'#3b2d23',G:'#d9b25a',Z:'#f1ece2',V:'#bdb5a8'};
  const palHead={...pal,m:'#a84f42'},palHelm={...pal,m:'#454b55'};
  if(monk){pal.A=shade(sh,-.32);pal.a=shade(sh,-.45)}
  if(enemy){pal.A='#9a7a5a';pal.a='#6e563f'}
  const type=enemy?'coat':monk?'monk':woman?'dress':o.long?'long':'shirt';
  const legType=enemy?'boots':type==='shirt'?'bare':'robe';
  const bob=f?1:0;                                  // nhún xuống khi bước
  const headY=kid?KID_HEAD:0,torsoY=kid?18:14;

  // ngọn giáo, vẽ trước để nằm sau người
  if(o.spear){const sx=X+(d==='left'?4:18);g.fillStyle='#6a4e2e';g.fillRect(sx,Y-11,1,BODY_H+10);
    g.fillStyle='#c3c9ce';g.fillRect(sx-1,Y-13,3,2);g.fillStyle='#eef0f2';g.fillRect(sx,Y-14,1,2);g.fillStyle='#c0392b';g.fillRect(sx-1,Y-10,3,2)}
  // chân (trẻ con: bớt hàng cho chân ngắn)
  let legs=LEGS[legType][d][f%3];if(kid&&legType==='bare')legs=[0,2,3,4].map(i=>legs[i]);
  paint(g,X,Y+BODY_H-legs.length,legs,pal);
  const hy=Y+headY+bob;
  // thân (trẻ con: thân ngắn)
  let torso=TORSO[type][d];if(kid)torso=torso.filter((_,i)=>i!==1&&i!==3&&i!==7);
  const sway=(type==='long'||type==='dress'||type==='monk')&&f?(f===1?1:-1):0;
  torso.forEach((r,i)=>paint(g,X+(i>=torso.length-3?sway:0),Y+torsoY+bob+i,[r],pal));
  // tay
  for(const [x,y,ch] of arms(d,f,kid?2:4)){g.fillStyle=pal[ch];g.fillRect(X+x,Y+torsoY+bob+1+y,1,1)}
  // đầu và phần thêm
  paint(g,X,hy,(kid?KID:monk?BALD:woman?WOMAN:HEAD)[d],palHead);
  if(!kid&&!monk&&!woman&&!enemy&&!o.hat)overlay(g,X,hy,KNOT[d],pal);
  if(woman)overlay(g,X,hy,WBUN[d],pal);
  if(o.hair==='old')overlay(g,X,hy,BEARD[d],palHead);
  if(o.band)overlay(g,X,hy,BAND[d],pal);
  if(o.hat)overlay(g,X,hy,HAT[d],pal);
  if(enemy){overlay(g,X,hy,MUST[d],pal);overlay(g,X,hy,HELM[d],palHelm);if(o.plume)overlay(g,X,hy,PLUME[d],pal)}
  outlineSel(c,-.72);c.ax=X+10;c.ay=Y+BODY_H;
  return cache[key]=c;
}
