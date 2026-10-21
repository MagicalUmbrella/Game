/* ================= khám phá ================= */
/* Hư cấu (trừ chuyện ông lái đò kể, theo Toàn thư như ở màn mở đầu). Những chỗ hay rải khắp bản đồ:
   lại gần thấy lấp lánh, bấm E để xem. Có chỗ cho đồ dùng được ở chuyện khác (lá thuốc, dế chọi,
   kiếm gỉ, sỏi trắng), có chỗ cho chỉ số, có chỗ chỉ để nghỉ chân. S.found[id] ghi lần tìm thấy:
   chỗ tìm một lần ghi true, chỗ quay lại được ghi năm hoặc mùa đã dùng. */
import {TS,Z,ctx} from './constants.js';
import {S,age,has} from './state.js';
import {gain,renderHUD,showModal,toast} from './ui.js';
import {tre} from './chains.js';
import {TREES} from './map.js';
import {knows,practice} from './nghe.js';
import {gainThe,sucMax} from './stats.js';

const src=t=>`<p class="src">Toàn thư chép: ${t}</p>`;
const now=()=>S.year*4+S.season;
const give=(it,msg)=>{S.items.push(it);renderHUD();return msg};

/* x, y: tâm điểm (ô); when: điều kiện để thấy; ready: còn dùng được không (mặc định: chưa tìm thấy);
   act(): áp hậu quả, trả về đoạn kể. once: false là chỗ quay lại được. */
export const SPOTS=[
  {id:'tien',x:15.5,y:57.5,name:'Gốc tre già',when:()=>age()>=8,
    act:()=>{gain('tien',8);gain('van',2);return'Dưới gốc tre có một cái hũ sành vỡ miệng, bên trong còn mấy xâu tiền đồng đã xỉn màu. Chẳng biết ai chôn từ bao giờ. Bạn được 5 quan.'}},
  {id:'thuoc',x:10.5,y:79.5,name:'Bụi lá thuốc',once:false,when:()=>age()>=8,ready:()=>S.found.thuoc!==S.year&&!has('Lá thuốc'),
    act:()=>{S.found.thuoc=S.year;practice('thuoc');gain('van',1);gain('duc',1);return give('Lá thuốc','Bụi lá thuốc sư cụ vẫn hay hái mọc um tùm dưới tán cây. Bạn hái một nắm mang về. Mỗi năm cây lại ra lá mới.')}},
  {id:'de',x:29.5,y:75.5,name:'Hang dế bờ ruộng',when:()=>age()<=14,
    act:()=>(gain('vo',3),give('Dế chọi','Bạn đổ nước vào hang, một con dế than cánh bóng nhảy vọt ra. Cò mà thấy con này chắc mê lắm.'))},
  {id:'bia',x:18.5,y:62.5,name:'Tấm bia đá',ready:()=>!S.found.bia,
    act:()=>{if(S.van<30)return{text:'Chữ khắc trên bia đã mờ, nét chữ cổ khó đọc. Học thêm đã (cần 30 Văn) rồi quay lại.',keep:true};
      gain('van',8);gain('tieng',4);return'Bia ghi công dân làng đời trước góp sức đắp đê, dặn con cháu năm nào cũng phải giữ đê cho chắc. Đọc xong, bạn đứng lặng một lúc lâu.'}},
  {id:'kiem',x:10.5,y:60.5,name:'Bụi rậm chân núi',when:()=>age()>=10,
    act:()=>(gain('vo',4),give('Kiếm gỉ','Trong bụi rậm có một thanh kiếm gỉ sét, chuôi đã mục. Mang ra lò rèn, có khi rèn lại được.'))},
  {id:'thuyen',x:79.5,y:66.5,name:'Thuyền nan trên bãi',once:false,ready:()=>S.found.thuyen!==now()&&S.suc<sucMax(),
    act:()=>{S.found.thuyen=now();gain('van',1);S.suc=Math.min(sucMax(),S.suc+1);renderHUD();return'Bạn nằm trên chiếc thuyền nan ai bỏ lại trên bãi, nghe sóng sông Hồng vỗ mạn. Mệt mỏi tan dần. (+1 Sức, mỗi mùa một lần)'}},
  {id:'to',x:37.5,y:63.6,name:'Tổ chim trên cây đa',when:()=>age()<=12,
    act:()=>{gain('duc',4);gain('vo',2);return'Bạn trèo lên cây đa, thấy tổ chim có ba quả trứng lốm đốm. Bạn chỉ nhìn rồi trèo xuống, không động vào.'}},
  {id:'soi',x:51.5,y:47.5,name:'Bãi sỏi ven sông',
    act:()=>(gain('duc',3),give('Sỏi trắng','Giữa bãi sỏi có một hòn sỏi trắng tròn, nhẵn như quả trứng. Bạn bỏ vào túi, nghĩ bụng sẽ tặng ai đó.'))},
  // bước chặt tre của chuỗi "Mái nhà bà Tư" (chains.js); không tính vào số nơi khám phá
  {id:'tre',x:17.5,y:69.5,name:'Bụi tre',quest:true,once:false,when:()=>tre().st==='on'&&tre().n<3,ready:()=>tre().last!==now(),
    act:()=>{if(S.suc<1)return{text:'Bạn mệt rồi, về nghỉ đã rồi hãy chặt.',keep:true};const c=tre();S.suc--;c.n++;c.last=now();renderHUD();
      return c.n<3?`Bạn chặt được một bó tre thẳng, vác về đầu ngõ nhà bà Tư. Đã có ${c.n}/3 bó (mỗi mùa chặt một bó).`:'Đủ ba bó tre rồi. Sang nhà bà Tư cùng Thảo lợp mái thôi.'}},
  {id:'do',x:55.5,y:47.5,name:'Bến đò cũ',when:()=>age()>=8,
    act:()=>{practice('boi');gain('vo',3);gainThe(1,90);return'Bến đò nhỏ trên sông Tô Lịch giờ vắng khách, chỉ còn lũ trẻ tắm sông. Chúng bảo ông lái đò già đã ra mở bến bên sông Hồng, phía đông làng, ngay dưới chân đê. Bạn lội xuống tắm cùng một lúc.'}},
];

const visible=p=>(!p.when||p.when())&&(p.ready?p.ready():!S.found[p.id]);
export const foundCount=()=>SPOTS.filter(p=>!p.quest&&S.found[p.id]!=null).length;
export const spotTotal=()=>SPOTS.filter(p=>!p.quest).length;

function open(p){
  let r=p.act();const keep=typeof r==='object'&&r.keep;if(typeof r==='object')r=r.text;
  if(!keep&&p.once!==false)S.found[p.id]=true;
  showModal({kicker:p.quest?'Việc cần làm':`Khám phá · ${foundCount()}/${spotTotal()} nơi`,title:p.name,body:`<p>${r}</p>`});
}

/* Gọi từ findTarget (input.js): chỗ gần nhất trong bán kính best, hoặc null. */
export function exploreTarget(best){
  let t=null;
  for(const p of SPOTS){if(!visible(p))continue;const d=Math.hypot(p.x-S.x,p.y-S.y);if(d<best){best=d;t={d,label:'Xem: '+p.name,act:()=>open(p)}}}
  // đang lo mái nhà bà Tư: bụi tre nào cũng chặt được (đứng sát gốc)
  const ts=TRE_SPOT();if(ts&&visible(ts))for(const b of TREES){if(b.v!==1)continue;const d=Math.hypot(b.x+.5-S.x,b.y+.6-S.y);if(d<Math.min(best,1.3)){best=d;t={d,label:'Chặt tre',act:()=>open(ts)}}}
  return t;
}

const TRE_SPOT=()=>SPOTS.find(p=>p.id==='tre');
/* Lấp lánh ở những chỗ còn xem được, khi người chơi ở gần (render.js). Lần đầu thấy thì nhắc. */
export function exploreDraw(list,clock,camX,camY){
  const ts=TRE_SPOT(),pts=SPOTS.filter(visible);
  // bụi tre gần nhất (trong 6 ô) cũng lấp lánh khi đang cần chặt tre
  if(ts&&visible(ts)){let bb=null,bd=6;for(const b of TREES)if(b.v===1){const d=Math.hypot(b.x+.5-S.x,b.y+.6-S.y);if(d<bd){bd=d;bb=b}}if(bb)pts.push({x:bb.x+.5,y:bb.y-1.6,top:true})}
  for(const p of pts){const d=Math.hypot(p.x-S.x,p.y-S.y);if(d>7)continue;
    if(!S.flags.sparkHint&&d<5){S.flags.sparkHint=true;toast('Có gì đó lấp lánh gần đây. Lại gần bấm E mà xem.',4200)}
    list.push({y:p.top?p.y+3.6:p.id==='tre'?p.y+1.5:p.y,f:()=>{const a=Math.max(0,1-d/7),ph=(clock*2+p.x)%1,sx=Math.round(p.x*TS)*Z-camX,sy=Math.round((p.y-.4)*TS)*Z-camY;
      const k=.55+.45*Math.sin(ph*Math.PI*2),r=k>.8?4:3;ctx.globalAlpha=Math.min(1,a*1.4);
      ctx.fillStyle='rgba(30,20,10,.55)';ctx.fillRect(sx-2*Z,sy-(r+1)*Z,4*Z,(2*r+2)*Z);ctx.fillRect(sx-(r+1)*Z,sy-2*Z,(2*r+2)*Z,4*Z);
      ctx.fillStyle='#ffd86b';ctx.fillRect(sx-Z,sy-r*Z,2*Z,2*r*Z);ctx.fillRect(sx-r*Z,sy-Z,2*r*Z,2*Z);ctx.fillStyle='#fffbe8';ctx.fillRect(sx-Z,sy-Z,2*Z,2*Z);ctx.globalAlpha=1}});
  }
}

/* Dòng biên niên theo số nơi đã khám phá, cùng vài chuyện đáng nhớ. */
export function exploreChronicle(){
  const n=foundCount(),L=[];
  L.push(n>=7?'Bạn thuộc từng gốc tre, bờ ruộng quanh làng; chẳng có chỗ nào bạn chưa đặt chân tới.':n>=4?'Bạn hay đi đây đi đó, biết nhiều chỗ hay quanh làng.':n<=1?'Bạn ít khi đi đâu xa khỏi nhà.':'');
  if(S.flags.kiemRen)L.push('Bạn nhặt được thanh kiếm gỉ trong bụi rậm, mang ra lò rèn rèn lại.');
  return L.filter(Boolean);
}
