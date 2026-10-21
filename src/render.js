/* ================= render ================= */
import {drawMoored} from './minigames/cheo.js';
import {$,H,T,TS,W,Z,ctx,cv} from './constants.js';
import {Hs} from './pixel.js';
import {BUILDINGS,DECOR,SIGNS,TREES,isW,map} from './map.js';
import {drawGround,overview} from './ground.js';
import {PLACES,REGIONS,regionId,regionOpen} from './world.js';
import {CAMP as CAMP_R,campUp,drawCamp,hideProp as campHide} from './trai.js';
import {GATES_K,KINH,cityFolk} from './kinhthanh.js';
import {cityDecorSprite} from './kinhthanh_ve.js';
import {banyanSprite,boatSprite,buffaloSprite,buildingSprite,personSprite,propSprite,signSprite,treeSprite,wellSprite} from './sprites.js';
import {PROPS,propAt} from './scenery.js';
import {TOWERS,WALLS,towerSprite,wallSprite} from './walls.js';
import {MG,NPCS,P,S,age,npcLook,npcOn} from './state.js';
import {isKid} from './person.js';
import {floats} from './ui.js';
import {drawTracks} from './dialogs.js';
import {update} from './input.js';
import {exploreDraw} from './explore.js';

export let VW=0,VH=0,DPR=1,camX=0,camY=0,clock=0,titleCam=48;
function resize(){DPR=Math.min(2,devicePixelRatio||1);VW=innerWidth;VH=innerHeight;cv.width=Math.round(VW*DPR);cv.height=Math.round(VH*DPR);cv.style.width=VW+'px';cv.style.height=VH+'px'}
addEventListener('resize',resize);resize();
const season=()=>S?S.season:0;
function blit(c,ax,ay){ctx.drawImage(c,Math.round(ax)*Z-camX,Math.round(ay)*Z-camY,c.width*Z,c.height*Z)}
export function drawSprite(c,wx,wy){blit(c,wx*TS-c.ax,wy*TS-c.ay)}
export function shadow(wx,wy,w){const ax=Math.round(wx*TS),ay=Math.round(wy*TS);ctx.fillStyle='rgba(20,15,10,.28)';ctx.fillRect((ax-w/2+1)*Z-camX,(ay-1)*Z-camY,(w-2)*Z,Z);ctx.fillRect((ax-w/2)*Z-camX,ay*Z-camY,w*Z,Z);ctx.fillRect((ax-w/2+1)*Z-camX,(ay+1)*Z-camY,(w-2)*Z,Z)}
function label(txt,x,y,col){ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';const w=Math.ceil(ctx.measureText(txt).width)+12;x=Math.round(x);y=Math.round(y);ctx.fillStyle='#0b0d0c';ctx.fillRect(x-w/2-2,y-11,w+4,22);ctx.fillStyle='#1d221f';ctx.fillRect(x-w/2,y-9,w,18);ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,x,y+.5)}
export const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* Hạt hiệu ứng mùa (cánh hoa xuân, lá thu, hạt lạnh đông). Vị trí tính thẳng từ đồng hồ và camera, không cộng
   dồn theo khung hình: hạt gắn với cảnh (đi thì cảnh trôi qua cả hạt), rơi đều theo giây, ra khỏi mép thì vòng lại. */
const parts=Array.from({length:60},()=>({u:Math.random(),v:Math.random(),s:.6+Math.random()*.8,p:Math.random()*6.283}));
const pmod=(a,m)=>((a%m)+m)%m;

function render(){
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=false;
  const cm=MG&&MG.cam?MG.cam():null;let fx=cm?cm[0]:S?S.x:titleCam,fy=cm?cm[1]:S?S.y:30;   // màn chơi có thể đặt chỗ máy quay nhìn (MG.cam)
  fx=Math.round(fx*TS)/TS;fy=Math.round(fy*TS)/TS;   // camera theo điểm ảnh của người chơi: người đứng yên trên màn hình, không rung một điểm ảnh khi đi, khi ngồi thuyền
  camX=Math.max(0,Math.min(W*T-VW,fx*T-VW/2));camY=Math.max(0,Math.min(H*T-VH,fy*T-VH/2));
  camX=Math.round(camX/Z)*Z;camY=Math.round(camY/Z)*Z;
  if(MG&&MG.shake>0&&!reduce){const k=MG.shake*7;camX+=Math.round((Math.random()-.5)*k)*Z;camY+=Math.round((Math.random()-.5)*k)*Z}   // rung màn hình khi trúng đòn, nhà cháy
  ctx.fillStyle='#0f1311';ctx.fillRect(0,0,VW,VH);
  if(MG&&MG.render){MG.render();ctx.setTransform(DPR,0,0,DPR,0,0);if(MG&&MG.hud)MG.hud();return}   // trận lớn vẽ bãi riêng (chapter2/chientruong.js)
  const s=season();
  drawGround(ctx,s,camX/Z,camY/Z,VW/Z,VH/Z,Z);   // nền vẽ theo mảnh (ground.js)
  const x0=Math.max(0,Math.floor(camX/T)-1),y0=Math.max(0,Math.floor(camY/T)-1),x1=Math.min(W-1,Math.ceil((camX+VW)/T)+1),y1=Math.min(H-1,Math.ceil((camY+VH)/T)+2);
  if(!reduce)for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(!isW(map[y*W+x]))continue;const h=Hs(x,y,7);if(h>.45)continue;const ph=(clock*.9+h*7)%3;if(ph>1.3)continue;ctx.fillStyle='rgba(255,255,255,.55)';const gx=Math.floor(Hs(x,y,8)*11)+Math.floor(ph*2),gy=3+Math.floor(Hs(x,y,9)*10);ctx.fillRect((x*TS+gx)*Z-camX,(y*TS+gy)*Z-camY,2*Z,Z)}
  if(S&&age()<12){const door=(x,y)=>{ctx.fillStyle='#4a2c1c';ctx.fillRect((x*TS+2)*Z-camX,(y*TS+2)*Z-camY,12*Z,14*Z);ctx.fillStyle='#d9b14a';ctx.fillRect((x*TS+5)*Z-camX,(y*TS+8)*Z-camY,Z,Z);ctx.fillRect((x*TS+10)*Z-camX,(y*TS+8)*Z-camY,Z,Z)};   // trẻ con: cổng thành đóng
    for(const x of [...GATES_K.nam,...GATES_K.namPhu])door(x,KINH.y1);for(const y of GATES_K.dong)door(KINH.x1,y)}
  drawTracks();
  const list=[];
  for(const t of near(TREES,x0-2,y0,x1+2,y1+4))if(t.x>=x0-2&&t.x<=x1+2&&t.y>=y0&&t.y<=y1+4&&!(MG&&MG.hideTree&&MG.hideTree(t)))list.push({y:t.y+.9,f:()=>{const sp=treeSprite(s,t.v),hide=S&&Math.abs(S.x-t.x-.5)<sp.width/TS/2-.3&&S.y<t.y+.9&&S.y>t.y+1-sp.height/TS+.6;
    if(hide)ctx.globalAlpha=.55;drawSprite(sp,t.x+.5,t.y+1);ctx.globalAlpha=1}});   // bạn đứng sau cây thì cây mờ đi
  for(const w of WALLS)if(w.x>=x0-1&&w.x<=x1+1&&w.y>=y0-1&&w.y<=y1+2)list.push({y:w.y+.99,f:()=>drawSprite(wallSprite(w),w.x+.5,w.y+1)});
  for(const t of TOWERS)if(t.x+t.n>=x0-2&&t.x<=x1+2&&t.y>=y0-2&&t.y<=y1+3)list.push({y:t.y+1.02,f:()=>drawSprite(towerSprite(t),t.x+t.n/2,t.y-.1)});
  for(const p of near(PROPS,x0-1,y0,x1+1,y1+2))if(p.x>=x0-1&&p.x<=x1+1&&p.y>=y0&&p.y<=y1+2&&!(MG&&MG.hideProp&&MG.hideProp(p))&&!campHide(p)){const [px,py]=propAt(p);list.push({y:py-.05,f:()=>drawSprite(propSprite(p,s),px,py)})}
  for(const b of near(BUILDINGS,x0-8,y0-6,x1+2,y1+3)){if(b.x>x1+2||b.x+b.w<x0-2||b.y>y1+3||b.y+b.h<y0-2)continue;list.push({y:b.y+b.h,f:()=>{const c=buildingSprite(b);blit(c,b.x*TS-c.ox,b.y*TS-c.oy)}})}
  for(const d of near(DECOR,x0-3,y0-3,x1+3,y1+3)){if(d.x<x0-3||d.x>x1+3||d.y<y0-3||d.y>y1+3)continue;list.push({y:d.y+(d.kind==='boat'?.4:d.kind==='them'?-5:1),f:()=>{if(d.kind==='banyan')drawSprite(banyanSprite(s),d.x+.5,d.y+1);else if(d.kind==='well')drawSprite(wellSprite(),d.x+.5,d.y+1);else if(d.city){const c=cityDecorSprite(d);if(c)drawSprite(c,d.x+.5,d.y+(d.kind==='them'?1.05:1))}else{const bob=reduce?0:Math.round(Math.sin(clock*1.5+d.x));drawSprite(boatSprite(),d.x+.5,d.y+.6+bob/TS)}}})}
  for(const sg of near(SIGNS,x0-1,y0-1,x1+1,y1+2))list.push({y:sg.y+1,f:()=>drawSprite(signSprite(),sg.x+.5,sg.y+1)});
  if(S){
    const a=age();
    if(!MG){exploreDraw(list,clock,camX,camY);drawMoored(list)}   // thuyền ông lái đò đậu ở bến sông Hồng
    for(const n of NPCS){if(!npcOn(n))continue;if(S.res&&S.res.lost&&S.res.lost.includes(n.name))continue;   // người đã bị giặc bắt đi thì không còn ở làng
      if(n.x<x0-2||n.x>x1+2||n.y<y0-2||n.y>y1+2)continue;
      const look=npcLook(n),dpx=S.x-n.x,dpy=S.y-n.y;let dir=n.moving?n.face:'down';
      if(!n.moving&&Math.hypot(dpx,dpy)<3)dir=Math.abs(dpx)>Math.abs(dpy)?(dpx>0?'right':'left'):(dpy>0?'down':'up');
      const fr=n.moving?[1,0,2,0][Math.floor(clock*8)%4]:0;
      list.push({y:n.y,f:()=>{shadow(n.x,n.y,10);drawSprite(personSprite(look,dir,fr),n.x,n.y)},lab:Math.hypot(dpx,dpy)<4?[n.name,n.x,n.y-(isKid(look)?1.55:2)]:null})}
    if(!(MG&&MG.hideNPC)&&x0<KINH.x1+3&&y0<KINH.y1+3)for(const o of cityFolk(clock)){if(o.x<x0-1||o.x>x1+1||o.y<y0-1||o.y>y1+2)continue;   // người trong kinh thành
      const fr=o.frame!==undefined&&o.frame!==0?o.frame:o.moving?[1,0,2,0][Math.floor(o.walk)%4]:0;list.push({y:o.y,f:()=>{shadow(o.x,o.y,10);drawSprite(personSprite(o.look,o.dir,fr),o.x,o.y)}})}
    list.push({y:S.buffalo.y,f:()=>{shadow(S.buffalo.x,S.buffalo.y,22);drawSprite(buffaloSprite(S.buffalo.dir||'left'),S.buffalo.x,S.buffalo.y)}});
    const look={id:a<14?'ban_be':S.path==='van'?'ban_van':S.path==='vo'?'ban_vo':'ban_nong'};
    const fr=MG&&MG.swing>0?(MG.swing>.17?'a0':'a1'):P.moving?[1,0,2,0][Math.floor(P.walk)%4]:0;
    const ms=MG&&MG.meSort?MG.meSort():null;   // ngồi trên thuyền: vẽ giữa thân thuyền và mạn trước, không bóng
    list.push({y:ms?ms.y:S.y,f:()=>{if(MG&&MG.inv>0&&Math.floor(clock*14)%2)return;if(!ms)shadow(S.x,S.y,10);drawSprite(personSprite(look,P.dir,fr),S.x,S.y+(ms?ms.dy:0))}});
  }
  if(S&&campUp()&&!(MG&&MG.draw&&(MG.type==='escort'||MG.type==='camp'||MG.type==='tron')))drawCamp(list);   // doanh trại giặc ở Gia Lâm (từ đêm 1285)
  if(MG&&MG.draw)MG.draw(list);
  list.sort((p,q)=>p.y-q.y);for(const o of list)o.f();
  if(!S)return;
  if(MG&&MG.post)MG.post();
  for(const b of near(BUILDINGS,x0-8,y0-6,x1+2,y1+3))if(b.name&&Math.hypot(b.x+b.w/2-S.x,b.y+b.h-S.y)<7){const c=buildingSprite(b);label(b.name,(b.x*TS+b.w*TS/2)*Z-camX,(b.y*TS-c.oy+6)*Z-camY,'#efe8d4')}
  for(const o of list)if(o.lab)label(o.lab[0],o.lab[1]*T-camX,o.lab[2]*T-camY,'#e2bf72');
  for(const sg of near(SIGNS,x0-1,y0-1,x1+1,y1+2))if(Math.hypot(sg.x-S.x,sg.y-S.y)<5)label(sg.name,(sg.x+.5)*T-camX,(sg.y-.2)*T-camY,'#9fcaa9');
  ctx.fillStyle=['rgba(255,220,230,.04)','rgba(255,210,120,.05)','rgba(220,160,60,.07)','rgba(150,180,220,.11)'][s];ctx.fillRect(0,0,VW,VH);
  if(S&&S.res&&!MG){ctx.fillStyle='rgba(70,45,50,.32)';ctx.fillRect(0,0,VW,VH)}   // sau đêm 1285: trời hửng, khói làng cháy
  if(!reduce&&s!==1&&!(MG&&MG.post)){ctx.fillStyle=s===0?'#f3b6c4':s===2?'#d99a3a':'rgba(205,218,230,.5)';   // đông: mưa phùn (vệt mảnh, rơi nhanh), không phải tuyết
    const PW=VW+60,PH=VH+60,fall=s===3?120:22,w=Z*(s===3?1:2),hh=Z*(s===3?3:1);
    for(const p of parts){const sway=Math.sin(clock*1.1+p.p)*7*Z+clock*(s===2?9:4)*Z;
      const x=pmod(p.u*PW-camX+sway,PW)-30,y=pmod(p.v*PH-camY+clock*fall*p.s*Z,PH)-30;
      ctx.fillRect(Math.round(x/Z)*Z,Math.round(y/Z)*Z,w,hh)}}
  ctx.font='700 14px "Be Vietnam Pro", system-ui, sans-serif';ctx.textAlign='center';
  for(const f of floats){ctx.globalAlpha=Math.max(0,1-f.t/1.6);const fx2=f.x*T-camX,fy2=f.y*T-camY-90-f.t*26-(f.dy||0);ctx.fillStyle='#0b0d0c';ctx.fillText(f.txt,fx2+2,fy2+2);ctx.fillStyle=f.color;ctx.fillText(f.txt,fx2,fy2)}ctx.globalAlpha=1;
  if(MG&&MG.hud)MG.hud();
  drawMini();
  if(worldMapOpen)drawWorldMap();
}
/* Chia đồ vật theo ô lưới BK×BK để mỗi khung chỉ duyệt những thứ gần màn hình (bản đồ thế giới có hàng vạn cây). */
const BK=16,buckets=new Map();
function near(arr,x0,y0,x1,y1){let g=buckets.get(arr);
  if(!g||g.n!==arr.length){g={n:arr.length,m:new Map()};for(const o of arr){const k=Math.floor(o.x/BK)+','+Math.floor(o.y/BK);let l=g.m.get(k);if(!l)g.m.set(k,l=[]);l.push(o)}buckets.set(arr,g)}
  const out=[];for(let by=Math.floor(y0/BK);by<=Math.floor(y1/BK);by++)for(let bx=Math.floor(x0/BK);bx<=Math.floor(x1/BK);bx++){const l=g.m.get(bx+','+by);if(l)for(const o of l)out.push(o)}return out}

/* lớp tô tối các vùng chưa mở (một điểm ảnh mỗi ô), tính lại khi danh sách vùng mở đổi */
let lockC=null,lockKey='';
function lockLayer(){const key=S?(S.regions||[]).join(','):'';if(lockC&&key===lockKey)return lockC;lockKey=key;
  lockC=document.createElement('canvas');lockC.width=W;lockC.height=H;const g=lockC.getContext('2d'),img=g.createImageData(W,H),D=img.data;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!regionOpen(S,regionId(x,y))){const j=(y*W+x)*4;D[j]=8;D[j+1]=10;D[j+2]=9;D[j+3]=150}
  g.putImageData(img,0,0);return lockC}
/* bản đồ nhỏ: cửa sổ MW×MH ô quanh người chơi, mỗi ô 2 điểm ảnh */
const mini=$('mini'),mctx=mini.getContext('2d'),MW=128,MH=72;
export let miniX=0,miniY=0;
function drawMini(){const ox=Math.max(0,Math.min(W-MW,Math.round(S.x-MW/2))),oy=Math.max(0,Math.min(H-MH,Math.round(S.y-MH/2)));miniX=ox;miniY=oy;
  mctx.imageSmoothingEnabled=false;mctx.fillStyle='#111';mctx.fillRect(0,0,MW*2,MH*2);
  mctx.drawImage(overview(season()),ox,oy,MW,MH,0,0,MW*2,MH*2);mctx.drawImage(lockLayer(),ox,oy,MW,MH,0,0,MW*2,MH*2);
  mctx.save();mctx.translate(-ox*2,-oy*2);
  mctx.strokeStyle='rgba(255,255,255,.6)';mctx.strokeRect(camX/T*2+.5,camY/T*2+.5,VW/T*2,VH/T*2);
  if(MG&&MG.mini)MG.mini(mctx);mctx.fillStyle='#fff';mctx.fillRect(S.x*2-2,S.y*2-2,4,4);mctx.fillStyle='#000';mctx.fillRect(S.x*2-1,S.y*2-1,2,2);mctx.restore()}

/* bản đồ thế giới (phím M): cả bản đồ, vùng chưa mở tô tối, tên địa danh, chỗ mình đứng */
export let worldMapOpen=false;
export function toggleWorldMap(){worldMapOpen=!worldMapOpen;document.body.classList.toggle('wm',worldMapOpen)}
function drawWorldMap(){const pad=28,top=64,sc=Math.max(1,Math.min((VW-pad*2)/W,(VH-top-pad-30)/H)),mw=W*sc,mh=H*sc,ox=Math.round((VW-mw)/2),oy=top;
  ctx.fillStyle='rgba(8,10,9,.86)';ctx.fillRect(0,0,VW,VH);
  ctx.fillStyle='#0b0d0c';ctx.fillRect(ox-6,oy-6,mw+12,mh+12);ctx.fillStyle='#8a6a3a';ctx.fillRect(ox-4,oy-4,mw+8,mh+8);
  ctx.imageSmoothingEnabled=false;ctx.drawImage(overview(season()),ox,oy,mw,mh);ctx.drawImage(lockLayer(),ox,oy,mw,mh);
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font='700 22px "Alegreya SC", Georgia, serif';ctx.fillStyle='#e2bf72';ctx.fillText('Bản đồ Đại Việt',VW/2,30);
  ctx.font='12px "Be Vietnam Pro", system-ui, sans-serif';ctx.fillStyle='#cfc6ad';ctx.fillText('Khoảng cách đã thu nhỏ, không đúng tỉ lệ. Vùng tối: chưa tới lúc đến. M hoặc Esc để đóng.',VW/2,50);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';
  for(const p of PLACES){const x=ox+(p.x+.5)*sc,y=oy+(p.y+.5)*sc,w=ctx.measureText(p.name).width+10;
    if(!p.river){ctx.fillStyle='#0b0d0c';ctx.fillRect(x-3,y-3,6,6);ctx.fillStyle='#e2bf72';ctx.fillRect(x-2,y-2,4,4)}
    ctx.fillStyle='rgba(11,13,12,.78)';ctx.fillRect(x-w/2,y-22,w,16);ctx.fillStyle=p.river?'#a9d4dc':'#efe8d4';ctx.fillText(p.name,x,y-14)}
  if(S&&campUp()){const C=CAMP_R,x=ox+(C.x0+C.x1)/2*sc,y=oy+(C.y0+C.y1)/2*sc;ctx.strokeStyle='#a83a32';ctx.lineWidth=2;ctx.strokeRect(ox+C.x0*sc,oy+C.y0*sc,(C.x1-C.x0+1)*sc,(C.y1-C.y0+1)*sc);ctx.fillStyle='rgba(11,13,12,.78)';const w=ctx.measureText('Trại giặc').width+10;ctx.fillRect(x-w/2,y-8,w,16);ctx.fillStyle='#e88a6a';ctx.fillText('Trại giặc',x,y)}
  if(S){const x=ox+S.x*sc,y=oy+S.y*sc,b=Math.floor(clock*3)%2;ctx.fillStyle='#0b0d0c';ctx.fillRect(x-5,y-5,10,10);ctx.fillStyle=b?'#ff5a3c':'#fff';ctx.fillRect(x-3,y-3,6,6);
    const r=REGIONS[regionId(Math.floor(S.x),Math.floor(S.y))];ctx.font='600 13px "Be Vietnam Pro", system-ui, sans-serif';ctx.fillStyle='#efe8d4';ctx.fillText('Bạn đang ở: '+r.name,VW/2,oy+mh+20)}}

export let last=performance.now();
export function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;clock+=dt;if(MG&&MG.tick)MG.tick(dt);if(!S)titleCam=48+Math.sin(clock*.08)*22;if(S)update(dt);render();requestAnimationFrame(loop)}
