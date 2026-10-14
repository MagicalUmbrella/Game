/* ================= bản đồ thế giới ================= */
/* Một bản đồ liền chứa mọi chương. Khoảng cách thật được nén lại (không đúng tỉ lệ), nhưng giữ đúng vị trí
   tương đối theo Toàn thư và chú thích của bản dịch:
   - Góc tây bắc (x < W0, y < H0) là phần bản đồ gốc: làng An Phú, kinh thành Thăng Long, bến Đông Bộ Đầu.
     Phần này sinh ở map.js, không đổi.
   - Bờ đông sông Hồng đối diện kinh thành là Gia Lâm (giặc đánh vào ngày 12 tháng giêng 1285), có doanh
     trại quân Nguyên (CAMP) và thủy trại (THUY).
   - Sông Hồng chảy xuống đông nam: bến Chương Dương (bờ tây, Thường Tín), rồi Tây Kết, Hàm Tử quan, sông
     Thiên Mạc (bờ đông, vùng Châu Giang), xa hơn là phủ Long Hưng (bờ đông, lăng nhà Trần) và phủ Thiên
     Trường (bờ tây).
   - Một nhánh sông chảy từ sông Hồng sang đông tới Bình Than (khúc sông Lục Đầu, Chí Linh), nơi có Vạn Kiếp,
     núi Phả Lại. Từ đó sông Thái Bình chảy xuống nam, sông Kinh Thầy chảy sang đông thành sông Bạch Đằng
     ra biển; gần cửa biển là trại Yên Hưng, ngoài biển là Vân Đồn.
   Module này chỉ import constants.js (map.js gọi buildWorld, không có vòng import). */
import {BI,BR,DK,FI,G,H,H0,MO,PA,SA,TR,W,W0,WA,WR} from './constants.js';

/* hash cố định theo tọa độ (giống pixel.js, chép lại để module này đứng riêng) */
const hs=(x,y,k)=>{let h=(x|0)*374761393+(y|0)*668265263+(k|0)*2147483647;h=(h^(h>>>13))*1274126177;h=h^(h>>>16);return (h>>>0)/4294967296};
/* nhiễu giá trị mịn theo ô, tỉ lệ sc ô một mắt lưới */
function vn(x,y,sc,k){const gx=x/sc,gy=y/sc,x0=Math.floor(gx),y0=Math.floor(gy),fx=gx-x0,fy=gy-y0,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
  const a=hs(x0,y0,k),b=hs(x0+1,y0,k),c=hs(x0,y0+1,k),d=hs(x0+1,y0+1,k);return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}
const delta=(x,y)=>y>40&&x<395&&x>8;   // đồng bằng: nhiều ruộng, ao
const smooth=t=>t<=0?0:t>=1?1:t*t*(3-2*t);

/* ---- sông ---- */
/* Sông Hồng: tâm dòng theo hàng y. Phần gốc (y < H0) giữ công thức cũ; xuống dưới thì trôi dần sang đông nam. */
export const hongX=y=>{const b=84+3*Math.sin(y/9);if(y<H0)return b;const u=y-H0;return b+.0029*u*u+5*Math.sin(u/23)*Math.min(1,u/40)};
export const hongHW=y=>y<H0?2.6:2.6+Math.min(1.3,(y-H0)/110);              // nửa bề rộng (theo phương ngang)
const slope=(f,v)=>(f(v+.5)-f(v-.5));
/* các sông khác: mỗi sông là hàm tâm dòng theo một trục, có khoảng chạy và nửa bề rộng */
export const RIVERS=[
  {id:'nhanh',axis:'x',a:86,b:331,c:x=>57-10*(1-Math.exp(-(x-86)/50))+2*Math.sin(x/19)*smooth((x-96)/20),hw:x=>1.5+.4*smooth((x-200)/120),t:WR},   // nhánh sang đông tới Bình Than
  {id:'bac1',axis:'y',a:-1,b:47,c:y=>300+30*Math.pow(Math.max(0,y)/47,1.3)+3*Math.sin(y/8),hw:()=>1.4,t:WR},
  {id:'bac2',axis:'y',a:-1,b:47,c:y=>372-40*Math.pow(Math.max(0,y)/47,1.2)+3*Math.sin(y/7),hw:()=>1.4,t:WR},
  {id:'thaibinh',axis:'y',a:46,b:H+1,c:y=>331-.25*(y-47)+6*Math.sin((y-47)/21),hw:y=>1.9+Math.min(.8,(y-47)/200),t:WR},
  {id:'luoc',axis:'x',a:118,b:298,c:x=>185+6*Math.sin((x-119)/25)*smooth((x-122)/12),hw:()=>1.3,t:WR},
  {id:'bachdang',axis:'x',a:331,b:W+1,c:x=>47+83*Math.pow(Math.max(0,x-332)/112,1.6)+3*Math.sin(x/13)*smooth((x-340)/20),hw:x=>1.8+1.9*smooth((x-370)/60),t:x=>x<392?WR:WA},
];
const RV=Object.fromEntries(RIVERS.map(r=>[r.id,r]));
export const riverC=(id,v)=>RV[id].c(v);
/* bờ biển phía đông: biển ở x > coastX(y) */
export const coastX=y=>452-8*Math.sin(y/30)-Math.max(0,y-100)*.12;
/* đảo Vân Đồn ngoài biển */
const ISLES=[[468,20,6],[474,38,5],[464,58,4],[476,8,3]];

/* ---- vùng đất và khóa theo cốt truyện ---- */
/* Vùng chưa tới lúc thì người chơi không bước vào được (input.js, dialogs.bfs). Mở vùng bằng openRegion(S,id)
   khi truyện đi tới (chương hai). Màn chơi có MG.roam (giải tù, trại giặc) thì bỏ qua khóa. */
export const REGIONS={
  anphu:{name:'Làng An Phú, kinh thành Thăng Long',short:'Làng An Phú',ch:1},
  gialam:{name:'Gia Lâm, bờ đông sông Hồng',short:'Gia Lâm',ch:2,hint:'Muốn sang sông phải có đò.'},
  phianam:{name:'Đường xuống Chương Dương, Thiên Trường',short:'Chương Dương',ch:2,hint:'Đường xuôi phía nam còn vắng, chưa có việc gì đưa bạn đi xa nhà.'},
  hamtu:{name:'Hàm Tử, Tây Kết, Long Hưng',short:'Hàm Tử',ch:2},
  vankiep:{name:'Vạn Kiếp, Bình Than',short:'Vạn Kiếp',ch:3},
  bachdang:{name:'Sông Bạch Đằng, Yên Hưng, Vân Đồn',short:'Bạch Đằng',ch:3},
};
const eastOfHong=(x,y)=>x+.5>hongX(y);
export function regionAt(x,y){
  if(x>=400)return'bachdang';
  if(!eastOfHong(x,y))return y<H0?'anphu':'phianam';
  if(x>=290){if(y>47&&x<riverC('thaibinh',y))return'hamtu';return'vankiep'}
  return y<riverC('nhanh',Math.max(86,x))?'gialam':'hamtu'}
/* ?mo=het trên địa chỉ trang: mở mọi vùng để xem bản đồ (dùng khi làm game) */
const OPEN_ALL=typeof location!=='undefined'&&/[?&]mo=het\b/.test(location.search);
export const regionOpen=(S,id)=>OPEN_ALL||id==='anphu'||!!(S&&S.regions&&S.regions.includes(id));
export function openRegion(S,id){if(!S.regions)S.regions=[];if(!S.regions.includes(id))S.regions.push(id)}
const regionCache=new Uint8Array(W*H);const RIDS=Object.keys(REGIONS);
export function regionId(x,y){if(x<0||y<0||x>=W||y>=H)return'anphu';const i=y*W+x;if(!regionCache[i])regionCache[i]=RIDS.indexOf(regionAt(x,y))+1;return RIDS[regionCache[i]-1]}
export const locked=(S,x,y)=>!regionOpen(S,regionId(x,y));

/* ---- công trình quân Nguyên năm 1285 ---- */
export const CAMP={x0:128,y0:4,x1:170,y1:38};        // doanh trại Ô Mã Nhi ở Gia Lâm, cổng tây ở y 11–13, cổng đông ở y 19–21
export const THUY={x0:89,y0:5,x1:100,y1:20};          // thủy trại: bến thuyền giặc ở bờ đông, đối diện bến Đông Bộ Đầu

/* ---- địa danh, làng, bến đò ---- */
/* Biển địa danh chỉ ghi vị trí (theo chú thích bản dịch Toàn thư), không kể trước sự việc chương sau. */
export const WSIGNS=[];
export const PLACES=[];   // nhãn trên bản đồ thế giới (phím M)
export const WBUILD=[],WDECOR=[];
/* bến đò: bấm E ở một đầu để sang đầu kia (cả hai vùng phải mở) */
export const FERRIES=[];

/* ---- sinh địa hình ---- */
export function buildWorld(api){
  const {map,bsolid,road}=api;
  const old=(x,y)=>x<W0&&y<H0;
  // trong phần bản đồ gốc chỉ được sửa bờ đông sông Hồng (phía bên kia sông, người chơi chương một không tới được)
  const okSet=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&(!old(x,y)||x+.5>hongX(y)+hongHW(y)+.2);
  const set=(x,y,v)=>{if(okSet(x,y))map[y*W+x]=v};
  const get=(x,y)=>(x<0||y<0||x>=W||y>=H)?MO:map[y*W+x];
  const fill=(x0,y0,x1,y1,v)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)set(x,y,v)};
  const isWat=t=>t===WA||t===WR||t===BI;
  const inCamp=(x,y,m=0)=>x>=CAMP.x0-m&&x<=CAMP.x1+m&&y>=CAMP.y0-m&&y<=CAMP.y1+m;
  const inThuy=(x,y,m=0)=>x>=THUY.x0-m&&x<=THUY.x1+m&&y>=THUY.y0-m&&y<=THUY.y1+m;

  // 1. nền: cỏ, đồi núi rìa bắc, rìa tây; rừng, ruộng theo nhiễu
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(old(x,y))continue;
    let t=G;const f=vn(x,y,11,3),r=vn(x,y,7,9);
    if(x<6&&x<4+Math.round(2*Math.sin(y/5)+hs(x,y,1)*2))t=MO;                                  // núi rìa tây (tiếp phần gốc)
    else if(y<2+Math.round(vn(x,0,9,4)*3)&&x>=W0)t=MO;                                          // đồi rìa bắc
    else if(x>=280&&x<400&&y<26&&vn(x,y,8,5)>.62)t=MO;                                          // đồi Chí Linh
    else if(x>=400&&y<80&&vn(x,y,5,6)>.74)t=MO;                                                 // núi đá vôi gần Bạch Đằng
    else if(f>(delta(x,y)?.76:.62)&&hs(x,y,2)<.6)t=TR;                                          // rừng: đồng bằng ít, gần đồi nhiều
    else if(r<(delta(x,y)?.5:.3)&&y>8)t=FI;                                                     // ruộng: đồng bằng nhiều
    else if(delta(x,y)&&vn(x,y,5,21)>.84&&hs(x,y,4)<.9)t=WA;                                    // ao, đầm
    else if(hs(x,y,3)<.035)t=TR;                                                                // cây lẻ
    map[y*W+x]=t}
  // núi Phả Lại cạnh Bình Than
  for(let y=18;y<40;y++)for(let x=335;x<360;x++){const d=Math.hypot((x-347)/1.3,y-28)+vn(x,y,3,7)*3;if(d<7)set(x,y,MO);else if(d<9&&get(x,y)===FI)set(x,y,G)}

  // 2. sông Hồng phần mới (y ≥ H0), bãi cát hai bên, đê bờ tây
  for(let y=H0;y<H;y++){const c=hongX(y),k=Math.sqrt(1+slope(hongX,y)**2),hw=hongHW(y)*k;
    for(let x=Math.floor(c-hw-4*k);x<=Math.ceil(c+hw+4*k);x++){const d=Math.abs(x+.5-c);if(d<=hw)set(x,y,WR);else if(d<=hw+1.1*k&&!isWat(get(x,y)))set(x,y,SA)}}
  let px=null;
  for(let y=H0;y<H;y++){const k=Math.sqrt(1+slope(hongX,y)**2),x=Math.ceil(hongX(y)-(hongHW(y)+2.6)*k);
    for(let xx=(px===null?x:Math.min(px,x))-1;xx<=(px===null?x:Math.max(px,x));xx++){const t=get(xx,y);if(t!==WR&&t!==WA&&t!==SA&&t!==MO)set(xx,y,DK)}
    px=x}
  // 3. các sông khác
  for(const r of RIVERS){const f=r.c;
    for(let v=Math.max(r.a,r.axis==='x'?0:-1);v<Math.min(r.b,r.axis==='x'?W:H);v++){const vv=Math.max(0,v),c=f(vv+.5),k=Math.sqrt(1+slope(f,vv)**2),hw=r.hw(vv)*k,tt=typeof r.t==='function'?r.t(vv):r.t;
      for(let u=Math.floor(c-hw-3*k);u<=Math.ceil(c+hw+3*k);u++){const d=Math.abs(u+.5-c),[x,y]=r.axis==='x'?[vv,u]:[u,vv];
        if(d<=hw)set(x,y,tt);else if(d<=hw+1*k&&!isWat(get(x,y))&&get(x,y)!==DK)set(x,y,SA)}}}
  // 4. biển, bãi bồi, đảo
  for(let y=0;y<H;y++){const cx=coastX(y);for(let x=Math.floor(cx-4);x<W;x++){const d=x+.5-cx+(vn(x,y,4,12)-.5)*3;
    if(d>0)set(x,y,BI);else if(d>-2.2&&!isWat(get(x,y)))set(x,y,SA)}}
  for(const [cx,cy,r] of ISLES)for(let y=cy-r-3;y<=cy+r+3;y++)for(let x=cx-r-3;x<=cx+r+3;x++){const d=Math.hypot(x-cx,(y-cy)*1.2)+(vn(x,y,3,13)-.5)*3;
    if(d<r*.45)set(x,y,MO);else if(d<r)set(x,y,hs(x,y,14)<.35?TR:G);else if(d<r+1.3)set(x,y,SA)}

  // 5. đường sá (đi theo các điểm mốc, chữ L giữa hai mốc; qua sông nhỏ thì thành cầu)
  const way=(pts,noBridge)=>{for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i];
    if(noBridge){for(const [a,b,c,d] of [[x0,y0,x1,y0],[x1,y0,x1,y1]])for(let y=Math.min(b,d);y<=Math.max(b,d);y++)for(let x=Math.min(a,c);x<=Math.max(a,c);x++)if(!isWat(get(x,y))&&get(x,y)!==MO)set(x,y,PA)}
    else{road(x0,y0,x1,y0);road(x1,y0,x1,y1)}}};
  const wx=(y,side,off)=>Math.round(hongX(y)+side*(hongHW(y)+off)*Math.sqrt(1+slope(hongX,y)**2));   // điểm sát bờ sông Hồng
  // bờ tây: từ làng xuôi theo chân đê xuống Chương Dương, Thiên Trường
  way([[40,H0],[40,86],[62,86],[62,104],[wx(112,-1,4.2),104],[wx(112,-1,4.2),112],[wx(112,-1,1.6),112]]);
  way([[wx(112,-1,4.2),112],[wx(112,-1,4.2)-8,112],[wx(112,-1,4.2)-8,150],[70,150],[70,196],[96,196],[96,226],[wx(226,-1,1.6),226]]);
  // bờ đông: thủy trại → doanh trại → làng Gia Lâm → cầu qua nhánh sông → Hàm Tử, Long Hưng
  const LX=Math.ceil(hongX(12)+hongHW(12)+1.2);
  way([[LX,12],[CAMP.x0,12]]);
  way([[CAMP.x1,20],[184,20],[184,30],[112,30],[112,40],[118,40]]);
  way([[184,30],[184,64],[150,64],[150,96],[wx(112,1,1.6)+3,96],[wx(112,1,1.6)+3,112],[wx(112,1,1.6),112]]);
  way([[150,96],[150,140],[wx(165,1,3),140],[wx(165,1,3),165],[wx(165,1,1.6),165]]);
  way([[wx(165,1,3),165],[wx(165,1,3),178]]);
  way([[150,140],[200,140],[200,218],[wx(222,1,4),218],[wx(222,1,4),222],[wx(222,1,1.6),222]]);
  // đông: Gia Lâm → Vạn Kiếp → Bình Than; Kinh Thầy → Bạch Đằng → Yên Hưng
  way([[184,20],[260,20],[260,34],[316,34]]);
  way([[316,34],[322,34]],true);
  way([[338,52],[338,60],[372,60],[372,46],[404,46],[404,64],[418,64]]);
  way([[418,64],[432,64],[432,70]],true);
  way([[260,34],[260,40],[296,40]]);   // xuống bến sông Thái Bình... tới bờ tây Bình Than
  way([[200,140],[300,140]],true);      // tới bờ tây sông Thái Bình (đò sang)
  way([[330,140],[360,140],[360,110],[380,110]]);   // bờ đông Thái Bình
  way([[430,120],[430,104],[412,104]]);  // bờ nam Bạch Đằng (Thủy Nguyên)

  // 6. làng (hư cấu, chỉ để cảnh có người ở): nhà, giếng, lũy tre, ruộng quanh
  const VILLAGES=[[112,36,'Làng Gia Lâm'],[176,46,''],[230,28,''],[206,52,''],[262,58,''],[48,96,''],[24,124,''],[84,132,'Làng Chương Dương'],[36,152,''],[60,170,''],[30,200,''],[110,212,''],[64,222,''],
    [166,104,''],[214,82,''],[256,96,''],[134,150,'Làng Hàm Tử'],[190,128,''],[236,156,''],[176,198,''],[220,196,''],[262,212,''],[216,228,'Làng Long Hưng'],
    [312,30,'Làng Vạn Kiếp'],[360,96,''],[352,140,''],[380,184,''],[340,214,''],[412,58,'Làng Yên Hưng'],[432,112,''],[412,150,''],[244,120,'']];
  const PAGODA=new Set([3,7,10,17,21,24,29]);   // làng có chùa (thứ tự trong danh sách, đếm từ 1)
  let vi=0;
  for(const [cx,cy,nm] of VILLAGES){vi++;
    for(let y=cy-6;y<=cy+6;y++)for(let x=cx-9;x<=cx+9;x++){const t=get(x,y);if(t===TR||t===FI||t===MO)set(x,y,G)}
    for(let y=cy-7;y<=cy+7;y++)for(let x=cx-10;x<=cx+10;x++){const e=Math.max(Math.abs(x-cx)/10,Math.abs(y-cy)/7);if(e>.93&&hs(x,y,vi)<.5&&get(x,y)===G)set(x,y,TR)}   // lũy tre
    for(let y=cy+8;y<=cy+12;y++)for(let x=cx-8;x<=cx+8;x++)if(get(x,y)===G)set(x,y,FI);
    const spots=[[-7,-4],[-1,-4],[5,-4],[-7,1],[4,1]];
    for(let i=0;i<spots.length;i++){if(hs(cx,cy,i)<.2)continue;const [dx,dy]=spots[i],b={id:'w'+vi+'_'+i,name:'',x:cx+dx,y:cy+dy,w:4,h:i%2?2:3,kind:'house'};
      let ok=true;for(let y=b.y-1;y<=b.y+b.h;y++)for(let x=b.x-1;x<=b.x+b.w;x++){const t=get(x,y);if(isWat(t)||t===MO||t===DK||t===PA)ok=false}
      if(ok)WBUILD.push(b)}
    if(PAGODA.has(vi)){const b={id:'wc'+vi,name:'',x:cx+10,y:cy-3,w:6,h:4,kind:'pagoda'};let ok=true;
      for(let y=b.y-1;y<=b.y+b.h+1;y++)for(let x=b.x-1;x<=b.x+b.w;x++){const t=get(x,y);if(isWat(t)||t===MO||t===DK)ok=false}
      if(ok){for(let y=b.y-1;y<=b.y+b.h+1;y++)for(let x=b.x-1;x<=b.x+b.w;x++)set(x,y,G);WBUILD.push(b)}}
    WDECOR.push({kind:'well',x:cx-2,y:cy+4,solid:1});
    road(cx-9,cy+2,cx+9,cy+2);
    if(nm)WSIGNS.push({x:cx+1,y:cy+3,name:nm,text:nm+' (hư cấu): một làng nhỏ, nhà tranh, lũy tre, ruộng lúa quanh làng.'})}

  // 7. dọn chỗ cho công trình quân Nguyên: đất trống trong rào, đường trong trại; thủy trại sát bờ
  for(let y=CAMP.y0-2;y<=CAMP.y1+2;y++)for(let x=CAMP.x0-2;x<=CAMP.x1+2;x++)set(x,y,G);
  road(CAMP.x0,12,CAMP.x1,12);road(CAMP.x0+1,20,CAMP.x1,20);road(153,12,153,CAMP.y1);road(CAMP.x0+2,30,CAMP.x1-2,30);
  for(let y=THUY.y0;y<=THUY.y1;y++)for(let x=THUY.x0;x<=THUY.x1;x++){const t=get(x,y);if(t===TR||t===FI)set(x,y,G)}
  for(let y=THUY.y0;y<=THUY.y1;y++)for(let x=LX-1;x<=THUY.x1;x++){const t=get(x,y);if(t===G&&x<LX+2)set(x,y,SA)}
  // cầu tàu thủy trại: hai dãy ván chìa ra sông
  // (ghi thẳng vào map: nửa sông phía đông thuộc phần bản đồ gốc nhưng okSet không cho sửa)
  for(const y of [8,16])for(let x=Math.floor(hongX(y)+hongHW(y)-1.6);x<=LX;x++){const t=get(x,y);if((t===WR&&x+.5>hongX(y))||t===SA)map[y*W+x]=BR}

  // 8. biển địa danh
  const sign=(x,y,name,text,place)=>{WSIGNS.push({x,y,name,text});if(place!==false)PLACES.push({name:place||name,x,y})};
  sign(LX+2,15,'Bãi Gia Lâm','Bãi Gia Lâm, bờ đông sông Hồng, đối diện kinh thành Thăng Long.','Gia Lâm');
  sign(wx(112,-1,4.2)+1,110,'Bến Chương Dương','Bến Chương Dương bên sông Hồng, xuôi về phía nam kinh thành.','Chương Dương');
  sign(wx(165,1,3)+1,162,'Hàm Tử quan','Hàm Tử quan, cửa ải bên sông Hồng.','Hàm Tử');
  sign(wx(150,1,3)+1,150,'Bến Tây Kết','Bến Tây Kết, ven sông Hồng.','Tây Kết');
  sign(wx(178,1,3)+2,180,'Sông Thiên Mạc','Khúc sông Hồng này gọi là sông Thiên Mạc, chảy qua vùng bãi Mạn Trù.','Thiên Mạc');
  sign(wx(222,1,4)+1,220,'Phủ Long Hưng','Phủ Long Hưng, nơi có lăng mộ các vua nhà Trần.','Long Hưng');
  sign(94,224,'Phủ Thiên Trường','Phủ Thiên Trường, có hành cung để các vua Trần ngự về.','Thiên Trường');
  sign(318,32,'Bến Vạn Kiếp','Bến Vạn Kiếp, vùng Chí Linh.','Vạn Kiếp');
  sign(346,38,'Núi Phả Lại','Núi Phả Lại, cạnh khúc sông Lục Đầu.','Phả Lại');
  sign(336,56,'Bình Than','Bình Than là khúc sông Lục Đầu chảy qua đất Chí Linh, chỗ nhiều dòng sông gặp nhau.','Bình Than');
  sign(406,62,'Sông Bạch Đằng','Sông Bạch Đằng, còn gọi là sông Rừng, chảy ra biển.','Bạch Đằng');
  sign(414,56,'Trại Yên Hưng','Trại Yên Hưng, vùng gần cửa biển.',false);
  sign(466,26,'Vân Đồn','Vân Đồn, vùng đảo ngoài biển phía đông bắc.','Vân Đồn');
  PLACES.push({name:'Thăng Long',x:53,y:11},{name:'An Phú',x:40,y:44},{name:'Đông Bộ Đầu',x:80,y:9},{name:'Thái Bình',x:312,y:150,river:1},{name:'Sông Hồng',x:110,y:186,river:1});
  // 9. bến đò (đầu đò là ô cát sát nước; người chơi đứng gần bấm E)
  const fer=(name,a,b)=>FERRIES.push({name,a,b});
  fer('Đò Đông Bộ Đầu – Gia Lâm',[82.5,12.5],[LX+.5,12.5]);
  fer('Đò Chương Dương',[wx(112,-1,1.6)+.5,112.5],[wx(112,1,1.6)+.5,112.5]);
  fer('Đò Hàm Tử',[wx(165,-1,1.6)+.5,165.5],[wx(165,1,1.6)+.5,165.5]);
  fer('Đò Thiên Trường – Long Hưng',[wx(226,-1,1.6)+.5,226.5],[wx(222,1,1.6)+.5,222.5]);
  const tb=y=>riverC('thaibinh',y),thw=y=>RV.thaibinh.hw(y)*Math.sqrt(1+slope(RV.thaibinh.c,y)**2);
  fer('Đò sông Thái Bình',[Math.floor(tb(140)-thw(140)-1.6)+.5,140.5],[Math.floor(tb(140)+thw(140)+1.6)+.5,140.5]);
  const bd=x=>riverC('bachdang',x),bhw=x=>RV.bachdang.hw(x)*Math.sqrt(1+slope(RV.bachdang.c,x)**2);
  fer('Đò Bạch Đằng',[432.5,Math.floor(bd(432)-bhw(432)-1.6)+.5],[430.5,Math.ceil(bd(430)+bhw(430)+1.6)-.5]);
  fer('Thuyền ra Vân Đồn',[Math.floor(coastX(30))-2.5,30.5],[462.5,22.5]);
  // đầu đò: nối đường tới mép nước cho chắc đứng được
  for(const f of FERRIES)for(const [x,y] of [f.a,f.b]){const tx=Math.floor(x),ty=Math.floor(y);if(isWat(get(tx,ty))||get(tx,ty)===MO||get(tx,ty)===TR||get(tx,ty)===DK)set(tx,ty,SA)}

  // 10. bsolid cho nhà, giếng, biển
  for(const b of WBUILD)for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)bsolid[y*W+x]=1;
  for(const d of WDECOR)if(d.solid)bsolid[d.y*W+d.x]=1;
  for(const s of WSIGNS)bsolid[s.y*W+s.x]=1;
}
