/* ================= khám phá ================= */
/* Hư cấu (trừ chuyện ông lái đò kể, theo Toàn thư như ở màn mở đầu). Những chỗ hay rải khắp bản đồ:
   lại gần thấy lấp lánh, bấm E để xem. Có chỗ cho đồ dùng được ở chuyện khác (lá thuốc, dế chọi,
   kiếm gỉ, sỏi trắng), có chỗ cho chỉ số, có chỗ chỉ để nghỉ chân. S.found[id] ghi lần tìm thấy:
   chỗ tìm một lần ghi true, chỗ quay lại được ghi năm hoặc mùa đã dùng. */
import {TS,Z,ctx} from './constants.js';
import {S,age,has} from './state.js';
import {gain,renderHUD,showModal,toast} from './ui.js';

const src=t=>`<p class="src">Toàn thư chép: ${t}</p>`;
const now=()=>S.year*4+S.season;
const give=(it,msg)=>{S.items.push(it);renderHUD();return msg};

/* x, y: tâm điểm (ô); when: điều kiện để thấy; ready: còn dùng được không (mặc định: chưa tìm thấy);
   act(): áp hậu quả, trả về đoạn kể. once: false là chỗ quay lại được. */
export const SPOTS=[
  {id:'tien',x:15.5,y:37.5,name:'Gốc tre già',when:()=>age()>=8,
    act:()=>{gain('tien',5);return'Dưới gốc tre có một cái hũ sành vỡ miệng, bên trong còn mấy xâu tiền đồng đã xỉn màu. Chẳng biết ai chôn từ bao giờ. Bạn được 5 quan.'}},
  {id:'thuoc',x:10.5,y:59.5,name:'Bụi lá thuốc',once:false,when:()=>age()>=8,ready:()=>S.found.thuoc!==S.year&&!has('Lá thuốc'),
    act:()=>{S.found.thuoc=S.year;return give('Lá thuốc','Bụi lá thuốc sư cụ vẫn hay hái mọc um tùm dưới tán cây. Bạn hái một nắm mang về. Mỗi năm cây lại ra lá mới.')}},
  {id:'de',x:29.5,y:55.5,name:'Hang dế bờ ruộng',when:()=>age()<=14,
    act:()=>give('Dế chọi','Bạn đổ nước vào hang, một con dế than cánh bóng nhảy vọt ra. Cò mà thấy con này chắc mê lắm.')},
  {id:'bia',x:19.5,y:12.5,name:'Tấm bia đá',ready:()=>!S.found.bia,
    act:()=>{if(S.van<30)return{text:'Chữ khắc trên bia đã mờ, nét chữ cổ khó đọc. Học thêm đã (cần 30 Văn) rồi quay lại.',keep:true};
      gain('van',2);return'Bia ghi công dân làng đời trước góp sức đắp đê, dặn con cháu năm nào cũng phải giữ đê cho chắc. Đọc xong, bạn đứng lặng một lúc lâu.'}},
  {id:'kiem',x:10.5,y:40.5,name:'Bụi rậm chân núi',when:()=>age()>=10,
    act:()=>give('Kiếm gỉ','Trong bụi rậm có một thanh kiếm gỉ sét, chuôi đã mục. Mang ra lò rèn, có khi rèn lại được.')},
  {id:'thuyen',x:79.5,y:46.5,name:'Thuyền nan trên bãi',once:false,ready:()=>S.found.thuyen!==now()&&S.suc<4,
    act:()=>{S.found.thuyen=now();S.suc=Math.min(4,S.suc+1);renderHUD();return'Bạn nằm trên chiếc thuyền nan ai bỏ lại trên bãi, nghe sóng sông Hồng vỗ mạn. Mệt mỏi tan dần. (+1 Sức, mỗi mùa một lần)'}},
  {id:'to',x:37.5,y:43.6,name:'Tổ chim trên cây đa',when:()=>age()<=12,
    act:()=>{gain('duc',1);return'Bạn trèo lên cây đa, thấy tổ chim có ba quả trứng lốm đốm. Bạn chỉ nhìn rồi trèo xuống, không động vào.'}},
  {id:'soi',x:51.5,y:27.5,name:'Bãi sỏi ven sông',
    act:()=>give('Sỏi trắng','Giữa bãi sỏi có một hòn sỏi trắng tròn, nhẵn như quả trứng. Bạn bỏ vào túi, nghĩ bụng sẽ tặng ai đó.')},
  {id:'do',x:55.5,y:27.5,name:'Bến đò',when:()=>age()>=8,
    act:()=>{gain('van',1);gain('vo',1);return'Ông lái đò già ngồi hút thuốc lào, kể chuyện năm bạn ra đời: vua Thái Tông cùng Thái tử ngự lâu thuyền xuôi dòng, đánh tan quân Mông Cổ ở bến Đông Bộ Đầu. "Thuyền của ta khi ấy cũng chở quân đấy," ông cười.'+src('vua Trần Thái Tông cùng Thái tử ngự lâu thuyền tiến đến bến Đông Bộ Đầu, phá tan quân Mông Cổ.')}},
];

const visible=p=>(!p.when||p.when())&&(p.ready?p.ready():!S.found[p.id]);
export const foundCount=()=>SPOTS.filter(p=>S.found[p.id]!=null).length;

function open(p){
  let r=p.act();const keep=typeof r==='object'&&r.keep;if(typeof r==='object')r=r.text;
  if(!keep&&p.once!==false)S.found[p.id]=true;
  showModal({kicker:`Khám phá · ${foundCount()}/${SPOTS.length} nơi`,title:p.name,body:`<p>${r}</p>`});
}

/* Gọi từ findTarget (input.js): chỗ gần nhất trong bán kính best, hoặc null. */
export function exploreTarget(best){
  let t=null;
  for(const p of SPOTS){if(!visible(p))continue;const d=Math.hypot(p.x-S.x,p.y-S.y);if(d<best){best=d;t={d,label:'Xem: '+p.name,act:()=>open(p)}}}
  return t;
}

/* Lấp lánh ở những chỗ còn xem được, khi người chơi ở gần (render.js). Lần đầu thấy thì nhắc. */
export function exploreDraw(list,clock,camX,camY){
  for(const p of SPOTS){if(!visible(p))continue;const d=Math.hypot(p.x-S.x,p.y-S.y);if(d>7)continue;
    if(!S.flags.sparkHint&&d<5){S.flags.sparkHint=true;toast('Có gì đó lấp lánh gần đây. Lại gần bấm E mà xem.',4200)}
    list.push({y:p.y,f:()=>{const a=Math.max(0,1-d/7),ph=(clock*2+p.x)%1,sx=Math.round(p.x*TS)*Z-camX,sy=Math.round((p.y-.4)*TS)*Z-camY;
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
