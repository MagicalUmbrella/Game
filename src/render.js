/* ================= render ================= */
import {$,H,T,TS,W,Z,ctx,cv} from './constants.js';
import {Hs} from './pixel.js';
import {BUILDINGS,DECOR,SIGNS,TREES,isW,map} from './map.js';
import {ground} from './ground.js';
import {banyanSprite,boatSprite,buffaloSprite,buildingSprite,personSprite,propSprite,signSprite,treeSprite,wellSprite} from './sprites.js';
import {PROPS,propAt} from './scenery.js';
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
  const fx=S?S.x:titleCam,fy=S?S.y:30;
  camX=Math.max(0,Math.min(W*T-VW,fx*T-VW/2));camY=Math.max(0,Math.min(H*T-VH,fy*T-VH/2));
  camX=Math.round(camX/Z)*Z;camY=Math.round(camY/Z)*Z;
  ctx.fillStyle='#0f1311';ctx.fillRect(0,0,VW,VH);
  const s=season(),gc=ground(s);
  ctx.drawImage(gc,camX/Z,camY/Z,VW/Z,VH/Z,0,0,VW,VH);
  const x0=Math.max(0,Math.floor(camX/T)-1),y0=Math.max(0,Math.floor(camY/T)-1),x1=Math.min(W-1,Math.ceil((camX+VW)/T)+1),y1=Math.min(H-1,Math.ceil((camY+VH)/T)+2);
  if(!reduce)for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(!isW(map[y*W+x]))continue;const h=Hs(x,y,7);if(h>.45)continue;const ph=(clock*.9+h*7)%3;if(ph>1.3)continue;ctx.fillStyle='rgba(255,255,255,.55)';const gx=Math.floor(Hs(x,y,8)*11)+Math.floor(ph*2),gy=3+Math.floor(Hs(x,y,9)*10);ctx.fillRect((x*TS+gx)*Z-camX,(y*TS+gy)*Z-camY,2*Z,Z)}
  if(S&&age()<12){ctx.fillStyle='#4a2c1c';for(let x=52;x<=54;x++)ctx.fillRect((x*TS+2)*Z-camX,(19*TS+2)*Z-camY,12*Z,14*Z);for(let y=11;y<=12;y++)ctx.fillRect((70*TS+2)*Z-camX,(y*TS+1)*Z-camY,12*Z,14*Z);ctx.fillStyle='#d9b14a';for(let x=52;x<=54;x++){ctx.fillRect((x*TS+5)*Z-camX,(19*TS+8)*Z-camY,Z,Z);ctx.fillRect((x*TS+10)*Z-camX,(19*TS+8)*Z-camY,Z,Z)}}
  drawTracks();
  const list=[];
  for(const t of TREES)if(t.x>=x0-2&&t.x<=x1+2&&t.y>=y0&&t.y<=y1+4)list.push({y:t.y+.9,f:()=>{const sp=treeSprite(s,t.v),hide=S&&Math.abs(S.x-t.x-.5)<sp.width/TS/2-.3&&S.y<t.y+.9&&S.y>t.y+1-sp.height/TS+.6;
    if(hide)ctx.globalAlpha=.55;drawSprite(sp,t.x+.5,t.y+1);ctx.globalAlpha=1}});   // bạn đứng sau cây thì cây mờ đi
  for(const p of PROPS)if(p.x>=x0-1&&p.x<=x1+1&&p.y>=y0&&p.y<=y1+2){const [px,py]=propAt(p);list.push({y:py-.05,f:()=>drawSprite(propSprite(p,s),px,py)})}
  for(const b of BUILDINGS){if(b.x>x1+2||b.x+b.w<x0-2||b.y>y1+3||b.y+b.h<y0-2)continue;list.push({y:b.y+b.h,f:()=>{const c=buildingSprite(b);blit(c,b.x*TS-c.ox,b.y*TS-c.oy)}})}
  for(const d of DECOR){if(d.x<x0-3||d.x>x1+3||d.y<y0-3||d.y>y1+3)continue;list.push({y:d.y+(d.kind==='boat'?.4:1),f:()=>{if(d.kind==='banyan')drawSprite(banyanSprite(s),d.x+.5,d.y+1);else if(d.kind==='well')drawSprite(wellSprite(),d.x+.5,d.y+1);else{const bob=reduce?0:Math.round(Math.sin(clock*1.5+d.x));drawSprite(boatSprite(),d.x+.5,d.y+.6+bob/TS)}}})}
  for(const sg of SIGNS)list.push({y:sg.y+1,f:()=>drawSprite(signSprite(),sg.x+.5,sg.y+1)});
  if(S){
    const a=age();
    if(!MG)exploreDraw(list,clock,camX,camY);
    for(const n of NPCS){if(!npcOn(n))continue;if(n.x<x0-2||n.x>x1+2||n.y<y0-2||n.y>y1+2)continue;
      const look=npcLook(n),dpx=S.x-n.x,dpy=S.y-n.y;let dir=n.moving?n.face:'down';
      if(!n.moving&&Math.hypot(dpx,dpy)<3)dir=Math.abs(dpx)>Math.abs(dpy)?(dpx>0?'right':'left'):(dpy>0?'down':'up');
      const fr=n.moving?[1,0,2,0][Math.floor(clock*8)%4]:0;
      list.push({y:n.y,f:()=>{shadow(n.x,n.y,10);drawSprite(personSprite(look,dir,fr),n.x,n.y)},lab:Math.hypot(dpx,dpy)<4?[n.name,n.x,n.y-(isKid(look)?1.55:2)]:null})}
    list.push({y:S.buffalo.y,f:()=>{shadow(S.buffalo.x,S.buffalo.y,22);drawSprite(buffaloSprite(S.buffalo.dir||'left'),S.buffalo.x,S.buffalo.y)}});
    const look={id:a<14?'ban_be':S.path==='van'?'ban_van':S.path==='vo'?'ban_vo':'ban_nong'};
    const fr=MG&&MG.swing>0?(MG.swing>.17?'a0':'a1'):P.moving?[1,0,2,0][Math.floor(P.walk)%4]:0;
    list.push({y:S.y,f:()=>{if(MG&&MG.inv>0&&Math.floor(clock*14)%2)return;shadow(S.x,S.y,10);drawSprite(personSprite(look,P.dir,fr),S.x,S.y)}});
  }
  if(MG&&MG.draw)MG.draw(list);
  list.sort((p,q)=>p.y-q.y);for(const o of list)o.f();
  if(!S)return;
  if(MG&&MG.post)MG.post();
  for(const b of BUILDINGS)if(b.name&&Math.hypot(b.x+b.w/2-S.x,b.y+b.h-S.y)<7){const c=buildingSprite(b);label(b.name,(b.x*TS+b.w*TS/2)*Z-camX,(b.y*TS-c.oy+6)*Z-camY,'#efe8d4')}
  for(const o of list)if(o.lab)label(o.lab[0],o.lab[1]*T-camX,o.lab[2]*T-camY,'#e2bf72');
  for(const sg of SIGNS)if(Math.hypot(sg.x-S.x,sg.y-S.y)<5)label(sg.name,(sg.x+.5)*T-camX,(sg.y-.2)*T-camY,'#9fcaa9');
  ctx.fillStyle=['rgba(255,220,230,.04)','rgba(255,210,120,.05)','rgba(220,160,60,.07)','rgba(150,180,220,.11)'][s];ctx.fillRect(0,0,VW,VH);
  if(!reduce&&s!==1&&!(MG&&MG.post)){ctx.fillStyle=s===0?'#f3b6c4':s===2?'#d99a3a':'rgba(235,242,250,.85)';
    const PW=VW+60,PH=VH+60,fall=s===3?34:22,w=Z*(s===3?1:2);
    for(const p of parts){const sway=Math.sin(clock*1.1+p.p)*7*Z+clock*(s===2?9:4)*Z;
      const x=pmod(p.u*PW-camX+sway,PW)-30,y=pmod(p.v*PH-camY+clock*fall*p.s*Z,PH)-30;
      ctx.fillRect(Math.round(x/Z)*Z,Math.round(y/Z)*Z,w,Z)}}
  ctx.font='700 14px "Be Vietnam Pro", system-ui, sans-serif';ctx.textAlign='center';
  for(const f of floats){ctx.globalAlpha=Math.max(0,1-f.t/1.6);const fx2=f.x*T-camX,fy2=f.y*T-camY-90-f.t*26;ctx.fillStyle='#0b0d0c';ctx.fillText(f.txt,fx2+2,fy2+2);ctx.fillStyle=f.color;ctx.fillText(f.txt,fx2,fy2)}ctx.globalAlpha=1;
  if(MG&&MG.hud)MG.hud();
  drawMini();
}
const mini=$('mini'),mctx=mini.getContext('2d');
function drawMini(){mctx.imageSmoothingEnabled=true;mctx.drawImage(ground(season()),0,0,192,144);mctx.fillStyle='#6b3a28';for(const b of BUILDINGS)mctx.fillRect(b.x*2,b.y*2,b.w*2,b.h*2);
  mctx.strokeStyle='rgba(255,255,255,.6)';mctx.strokeRect(camX/T*2+.5,camY/T*2+.5,VW/T*2,VH/T*2);
  mctx.fillStyle='#fff';mctx.fillRect(S.x*2-2,S.y*2-2,4,4);mctx.fillStyle='#000';mctx.fillRect(S.x*2-1,S.y*2-1,2,2);}

export let last=performance.now();
export function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;clock+=dt;if(MG&&MG.tick)MG.tick(dt);if(!S)titleCam=48+Math.sin(clock*.08)*22;if(S)update(dt);render();requestAnimationFrame(loop)}
