/* ================= nền đất ================= */
/* Vẽ sẵn toàn bộ nền bản đồ ra một canvas cho mỗi mùa (cache). Tô từng điểm ảnh: cỏ loang nhiều tông theo
   nhiễu mịn, khóm cỏ, hoa, sỏi; đường đất có vệt sẫm và đá; ranh giới cỏ với đường, cát lượn theo nhiễu chứ
   không vuông theo ô; nước sâu nông theo khoảng cách tới bờ, có bọt ven bờ và vệt sóng; ruộng có bờ, lúa
   theo mùa; núi đá có vách; tường thành gạch có lỗ châu mai; sân lát đá. Không đổi ô nào của bản đồ. */
import {BR,FI,G,GA,H,MO,PA,SA,ST,TR,TS,W,WA,WL,WR} from './constants.js';
import {Hs,mk} from './pixel.js';
import {get,map} from './map.js';

const PW=W*TS,PH=H*TS;
const rgb={};const C=h=>rgb[h]||(rgb[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);

/* nhiễu giá trị mịn (0..1), tỉ lệ sc điểm ảnh một ô lưới */
function vn(x,y,sc,k){const gx=x/sc,gy=y/sc,x0=Math.floor(gx),y0=Math.floor(gy),fx=gx-x0,fy=gy-y0,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
  const a=Hs(x0,y0,k),b=Hs(x0+1,y0,k),c=Hs(x0,y0+1,k),d=Hs(x0+1,y0+1,k);return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}
const fbm=(x,y,k)=>vn(x,y,22,k)*.6+vn(x,y,8,k+5)*.3+vn(x,y,3,k+9)*.1;

/* ---- vật liệu từng điểm ảnh và khoảng cách tới vật liệu khác (tính một lần) ---- */
const K={grass:0,path:1,sand:2,water:3,field:4,rock:5,wall:6,stone:7};
const kindOf=t=>t===G||t===TR?K.grass:t===PA?K.path:t===SA?K.sand:t===WA||t===WR||t===BR?K.water:t===FI?K.field:t===MO?K.rock:t===WL?K.wall:K.stone;
let mat=null,dist={};
function prep(){
  if(mat)return;mat=new Uint8Array(PW*PH);
  for(let y=0;y<PH;y++)for(let x=0;x<PW;x++)mat[y*PW+x]=kindOf(map[(y>>4)*W+(x>>4)]);
}
/* khoảng cách (điểm ảnh, tối đa lim) từ mỗi điểm tới điểm gần nhất thỏa src(kind) */
function distTo(name,src,lim){
  if(dist[name])return dist[name];prep();
  const d=new Uint8Array(PW*PH).fill(255),q=new Int32Array(PW*PH);let h=0,t=0;
  for(let i=0;i<PW*PH;i++)if(src(mat[i])){d[i]=0;q[t++]=i}
  while(h<t){const i=q[h++],v=d[i]+1;if(v>lim)continue;const x=i%PW;
    if(x>0&&d[i-1]>v){d[i-1]=v;q[t++]=i-1}if(x<PW-1&&d[i+1]>v){d[i+1]=v;q[t++]=i+1}
    if(i>=PW&&d[i-PW]>v){d[i-PW]=v;q[t++]=i-PW}if(i<PW*(PH-1)&&d[i+PW]>v){d[i+PW]=v;q[t++]=i+PW}}
  return dist[name]=d}

/* ---- bảng màu theo mùa ---- */
const GRASS=[['#5d9a3e','#78b24d','#93c45d','#4c8434'],['#4d8c35','#62a043','#7cb552','#3f772c'],['#8d9a42','#a3ad4f','#bcbf63','#76823a'],['#7a8d64','#8c9e73','#a3b388','#66785a']];
const FLOWER=[['#f4a9bc','#fff4e2'],['#f4d84c','#fff4e2'],['#e3893a','#f4c04a'],null];
const TOLICH=[['#4f9fb5','#3f8aa6','#33789a','#a8dde6'],['#459cb8','#378aa8','#2b7799','#a2dbe8'],['#5096a8','#418299','#357189','#a9d4dc'],['#5a8fa0','#4b7f90','#3f6f80','#b5d3da']];
const HONG=[['#b98058','#a96e4a','#965f3e','#dcb592'],['#be7a4e','#ad6a40','#985a35','#e0b48e'],['#b1835e','#a07250','#8c6244','#d8b998'],['#a6826a','#94725c','#80634f','#cfb9a8']];
const FIELD=[{g:'#79a998',d:'#6a9a8a',l:'#93c0ae'},{g:'#4a7a36',d:'#3c682c',l:'#5a8a40'},{g:'#8c7a44',d:'#776737',l:'#a08c52'},{g:'#76614a',d:'#62503c',l:'#8a7258'}];

const groundCache={};
export function ground(s){if(groundCache[s])return groundCache[s];
  prep();
  const dW=distTo('w',k=>k===K.water,26),dL=distTo('l',k=>k!==K.water,26),dG=distTo('g',k=>k===K.grass,6),dF=distTo('f',k=>k!==K.field,4),
    dP=distTo('p',k=>k===K.path||k===K.stone,4),dR=distTo('r',k=>k!==K.rock,8);
  const [c,g]=mk(PW,PH),img=g.createImageData(PW,PH),D=img.data;
  const gr=GRASS[s],tl=TOLICH[s],hg=HONG[s],fd=FIELD[s];
  const put=(i,h)=>{const v=C(h),j=i*4;D[j]=v[0];D[j+1]=v[1];D[j+2]=v[2];D[j+3]=255};
  for(let y=0;y<PH;y++)for(let x=0;x<PW;x++){const i=y*PW+x;let k=mat[i];const n=fbm(x,y,3),e=vn(x,y,4,17);
    // ranh giới lượn: đường, cát, sân đá sát cỏ thì cỏ lấn vào 0–3 điểm ảnh theo nhiễu
    if((k===K.path||k===K.sand)&&dG[i]<=1+Math.floor(e*3))k=K.grass;
    switch(k){
    case K.grass:{const v=n+(Hs(x,y,1)-.5)*.08;let col=v<.3?gr[0]:v<.66?gr[1]:gr[2];
      if(dW[i]<=2+Math.floor(e*2))col=dW[i]<=1?'#5b4a32':gr[3];     // bờ đất ẩm sát nước
      else if(dP[i]===1&&e<.5)col=gr[3];                              // cỏ sẫm men theo mép đường
      put(i,col);break}
    case K.path:{const v=n+(Hs(x,y,2)-.5)*.1;put(i,dG[i]<=3+Math.floor(e*3)?(v<.5?'#9d8150':'#ad9160'):v<.38?'#ad9160':v<.7?'#c1a46e':'#cfb582');break}
    case K.sand:{const r=Math.sin((x+vn(x,y,10,4)*14)/3+y/9);put(i,r>.82?'#e9dcae':n<.35?'#c9b47c':'#dbc896');break}
    case K.water:{if(dL[i]<=Math.floor(e*3.2)){const st=shoreTile(x,y);if(st===SA){put(i,n<.35?'#c9b47c':'#dbc896');break}if(st===G){put(i,'#5b4a32');break}}   // bờ lượn, bớt gãy khúc theo ô
      const hong=map[(y>>4)*W+(x>>4)]===WR||isHongBridge(x>>4,y>>4),p=hong?hg:tl,dd=dL[i]+(e-.5)*3;
      let col=dd<1.6?p[3]:dd<4?p[0]:dd<11?p[1]:p[2];
      if(dd>=2&&Math.sin(x/5+vn(x,y,30,8)*9+(y%9)*1.7)>.93&&Hs(x,y,5)<.7)col=dd<4?p[3]:p[0];   // vệt sóng
      put(i,col);break}
    case K.field:{const tx=x>>4,ty=y>>4,lx=x&15;
      const bund=dF[i]<2||(tx%6===0&&lx<2&&get(tx-1,ty)===FI);
      if(bund){put(i,dF[i]===0||lx===0?'#6b5a3a':Hs(x,y,3)<.5?gr[1]:gr[2]);break}
      const v=n+(Hs(x,y,6)-.5)*.1;put(i,v<.4?fd.d:v<.75?fd.g:fd.l);break}
    case K.rock:{const v=fbm(x*1.6,y*1.6,11),cliff=dR[i]<=6&&isCliff(x,y);
      let col=v<.35?'#5f6656':v<.62?'#737b67':'#8a927c';if(cliff)col=((x+Math.floor(vn(x,y,6,2)*3))%4===0)?'#3c4136':'#4d5345';
      if(!cliff&&Math.abs(vn(x,y,7,13)-.5)<.025)col='#4a5143';    // vết nứt
      put(i,col);break}
    case K.wall:{const ly=y&15,row=ly>>2,bx=(x+(row%2?4:0))&7;let col=(ly&3)===0||bx===0?'#5e3826':Hs(x>>3,y>>2,4)<.3?'#9a6444':'#8a5636';
      if(get(x>>4,(y>>4)-1)!==WL&&ly<4)col=(x&7)<4?'#a87150':'#7a4a30';put(i,col);break}
    default:{const lx=x&15,ly=y&15,sx=(x+(((y>>3)&1)?5:0))%11,col=ly%8===0||sx===0?'#7d776a':vn(x,y,9,21)<.45?'#a49d8e':'#b3ac9c';put(i,col)}
    }
  }
  g.putImageData(img,0,0);
  details(g,s);
  return groundCache[s]=c}
const isHongBridge=(tx,ty)=>get(tx,ty)===BR&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>get(tx+a,ty+b)===WR);
/* ô đất liền sát điểm nước này (theo hướng gần nhất trong ô) */
function shoreTile(x,y){const tx=x>>4,ty=y>>4,lx=x&15,ly=y&15,c=[[lx,-1,0],[15-lx,1,0],[ly,0,-1],[15-ly,0,1]].sort((a,b)=>a[0]-b[0]);
  for(const [,a,b] of c){const t=get(tx+a,ty+b);if(t===SA)return SA;if(t===G||t===TR)return G}return -1}
const isCliff=(x,y)=>get(x>>4,(y+6)>>4)!==MO;

/* ---- chi tiết đặt lên trên: khóm cỏ, hoa, sỏi, lúa, cầu, cổng ---- */
function details(g,s){
  const p=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  const gr=GRASS[s],fl=FLOWER[s],fd=FIELD[s];
  for(let ty=0;ty<H;ty++)for(let tx=0;tx<W;tx++){const t=map[ty*W+tx],ox=tx*TS,oy=ty*TS;
    if(t===G||t===TR){
      for(let i=0;i<3;i++){if(Hs(tx,ty,40+i)>.55)continue;const x=ox+1+Math.floor(Hs(tx,ty,50+i)*13),y=oy+3+Math.floor(Hs(tx,ty,60+i)*12);
        p(x,y,1,2,gr[3]);p(x+2,y,1,2,gr[3]);p(x+1,y-1,1,3,gr[3]);p(x+1,y-2,1,1,gr[2]);p(x-1,y+1,1,1,gr[3])}     // khóm cỏ
      if(fl&&Hs(tx,ty,99)<.09){const x=ox+2+Math.floor(Hs(tx,ty,98)*11),y=oy+2+Math.floor(Hs(tx,ty,97)*11);
        for(const[a,b]of[[0,0],[5,2],[2,5]])if(Hs(tx+a,ty+b,96)<.7){p(x+a,y+b-1,1,1,fl[0]);p(x+a-1,y+b,3,1,fl[0]);p(x+a,y+b+1,1,1,fl[0]);p(x+a,y+b,1,1,fl[1])}}
      if(Hs(tx,ty,91)<.05){const x=ox+3+Math.floor(Hs(tx,ty,92)*9),y=oy+4+Math.floor(Hs(tx,ty,93)*9);p(x,y,3,2,'#8e8a7c');p(x,y,2,1,'#b4b0a2');p(x,y+2,3,1,'#4e5a3c')}   // đá nhỏ
    }
    else if(t===PA){for(let i=0;i<3;i++){if(Hs(tx,ty,70+i)>.5)continue;const x=ox+2+Math.floor(Hs(tx,ty,71+i)*11),y=oy+2+Math.floor(Hs(tx,ty,72+i)*11);
        p(x,y,2,1,'#e0caa0');p(x,y+1,2,1,'#8a7046')}}                                              // sỏi
    else if(t===SA){if(Hs(tx,ty,80)<.15){const x=ox+3+Math.floor(Hs(tx,ty,81)*9),y=oy+3+Math.floor(Hs(tx,ty,82)*9);p(x,y,2,1,'#f7efd8');p(x,y+1,2,1,'#b39e6a')}}
    else if(t===FI){
      for(let r=0;r<4;r++)for(let c2=0;c2<4;c2++){const ax=ox+2+c2*4+(r%2),ay=oy+2+r*4;
        if((tx%6===0&&c2===0)||ax<ox+2&&false)continue;
        if(s===0){p(ax,ay+1,1,2,'#7fbf55');p(ax+1,ay,1,3,'#a6d86e');p(ax+2,ay+1,1,2,'#7fbf55');p(ax,ay+3,3,1,'#5a8f8c')}          // mạ non trên nước
        else if(s===1){p(ax-1,ay,4,4,'#3f7a2e');p(ax,ay-1,1,3,'#68ad4a');p(ax+2,ay-1,1,2,'#68ad4a');p(ax+1,ay,1,1,'#8ccc62')}   // lúa xanh rậm
        else if(s===2){p(ax-1,ay,4,4,'#b8902c');p(ax,ay-1,2,2,'#e8c34c');p(ax+2,ay,1,2,'#f2d878');p(ax-1,ay+3,1,1,'#8c6a22')}   // lúa chín trĩu
        else{p(ax,ay+1,1,2,'#9a8460');p(ax+2,ay+1,1,2,'#9a8460');if(Hs(tx+r,ty+c2,5)<.2)p(ax-1,ay+3,4,1,'#8fa8b0')}               // rạ và vũng nước
      }}
    else if(t===WA&&s<3&&Hs(tx,ty,61)<.3&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const n=get(tx+a,ty+b);return n!==WA&&n!==BR})){   // sen, bèo ven bờ
      for(let i=0;i<3;i++){const x=ox+2+Math.floor(Hs(tx,ty,62+i)*10),y=oy+3+Math.floor(Hs(tx,ty,65+i)*9);
        p(x,y,4,2,'#3f7d32');p(x+1,y-1,3,1,'#5d9a3e');p(x+1,y,2,1,'#79b34e');p(x+3,y,1,1,'#2e5a26');
        if(s===1&&i===0){p(x+1,y-3,2,2,'#f08aa8');p(x,y-2,1,1,'#f8b8cc');p(x+3,y-2,1,1,'#d8708e');p(x+1,y-3,1,1,'#ffd0dc')}}}
    else if(t===BR){p(ox+1,oy,14,16,'#9a7044');for(let j=0;j<16;j+=4){p(ox+1,oy+j,14,1,'#6c4e2b');p(ox+1,oy+j+1,14,1,'#b08454')}
      p(ox,oy,1,16,'#4a331e');p(ox+15,oy,1,16,'#4a331e');p(ox+1,oy,1,16,'#7a5532');p(ox+14,oy,1,16,'#7a5532');for(const yy of[2,10]){p(ox,oy+yy,2,3,'#3a2818');p(ox+14,oy+yy,2,3,'#3a2818')}}
    else if(t===GA){p(ox,oy,16,16,'#4e3020');p(ox+2,oy+2,12,14,'#2a1a10');p(ox,oy,16,2,'#7a4a30');p(ox+7,oy+2,2,14,'#6a4028');p(ox+3,oy+7,1,2,'#d9b14a');p(ox+12,oy+7,1,2,'#d9b14a')}
  }
}
