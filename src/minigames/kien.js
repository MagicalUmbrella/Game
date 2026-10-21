/* ================= minigame: tờ văn tự giả (đường văn, thu 1280) ================= */
/* Hư cấu. Ông Cả Lợi đưa ra một tờ văn tự, nói bà Tư đã bán thửa ruộng bờ sông cho ông từ năm nước to. Bà Tư
   không biết chữ, không nhớ đã bán. Cụ xã nhờ bạn (người có chữ trong làng) tìm chứng cứ trước buổi họp làng.
   Phần một (trên bản đồ, KIEN.T giây): đi tới các chỗ có manh mối (CLUES), bấm E để xem, đọc. Mũi tên vàng chỉ
   chỗ chưa xem gần nhất. Hết giờ hoặc bấm E ở cửa đình khi đã xem ít nhất hai chỗ thì vào họp.
   Phần hai (trong khung): chọn hai chứng cứ đưa ra trước làng, mỗi chứng cứ có sức nặng (w). Tổng từ KIEN.WIN
   trở lên thì thắng. Văn từ KIEN.VAN_HINT thì bạn nhận ra chứng cứ nào yếu (ghi chú bên cạnh).
   Kết cục ghi S.flags.kien: 'thang' (bà Tư giữ ruộng, ông Cả mất mặt: chuc.js xaScore cộng thêm) | 'thua'. */
import {FI,ctx} from '../constants.js';
import {get} from '../map.js';
import {MG,P,S,save,setMG} from '../state.js';
import {floatAt,gain,setKeys,showModal} from '../ui.js';
import {VW} from '../render.js';
import {hudBar,hudBox,mark} from './flood.js';
import {endMG,goalArrow,pickTiles,twinkle} from './chung.js';

export const KIEN={T:48,WIN:6,VAN_HINT:40};   // 10/2026: ít giờ hơn, phải đủ hai chứng cứ mạnh nhất (sổ ruộng, người làm chứng vắng làng)
const DINH={x:34.5,y:56.4};
/* manh mối: chỗ, lời kể khi xem, chứng cứ có được (w: sức nặng trước làng) */
function clues(){const moc=pickTiles(43,70,52,72,70,84,(x,y)=>get(x,y)===FI,1,1)[0]||{x:60.5,y:76.5};
  return[
    {id:'so',x:DINH.x,y:DINH.y,name:'Sổ ruộng ở đình',see:'Cuốn sổ ruộng của làng vẫn ghi thửa bờ sông dưới tên chồng bà Tư, chưa hề sang tên ai.',proof:'Sổ ruộng của làng chưa sang tên',w:3},
    {id:'thue',x:50.5,y:69.4,name:'Nhà bà Tư',see:'Bà Tư lục rương, đưa ra mấy tờ biên nhận nộp thuế thửa ruộng ấy, năm nào cũng có, năm ngoái vẫn còn.',proof:'Biên nhận thuế bà Tư nộp đến tận năm ngoái',w:2},
    {id:'chung',x:44.5,y:63.6,name:'Giếng làng',see:'Mấy bà gánh nước kể: năm nước to, ông Ba (người ký làm chứng trong văn tự) đi phu đắp đê ở xa cả năm, không có ở làng.',proof:'Người làm chứng vắng làng đúng năm ký văn tự',w:3},
    {id:'moc',x:moc.x,y:moc.y,name:'Cột mốc ruộng',see:'Cột mốc ở góc thửa ruộng còn khắc chữ họ nhà bà Tư, nhưng chữ đã mờ, khắc từ đời nào không rõ.',proof:'Cột mốc khắc họ nhà bà Tư',w:1}]}
const DECOY={id:'khoc',proof:'Bà Tư khóc, thề là không bán',w:0};

export function startKien(){
  setMG({type:'kien',t:0,cl:clues(),seen:{},hideNPC:false,
    update:kUpdate,findTarget:kTarget,draw:kDraw,hud:kHud,goal:kGoal});
  S.x=DINH.x;S.y=DINH.y+.6;P.dir='down';document.body.classList.add('mg');
  setKeys('<span><kbd>E</kbd> xem manh mối</span><span><kbd>Shift</kbd> chạy</span><span>Xem xong thì về cửa đình, bấm E để vào họp</span>');
}
const nSeen=()=>Object.keys(MG.seen).length;
function kUpdate(dt){const M=MG;M.t+=dt;if(M.t>=KIEN.T)hop()}
function kTarget(){const M=MG;
  for(const c of M.cl)if(!M.seen[c.id]&&Math.hypot(c.x-S.x,c.y-S.y)<1.4)return{label:'Xem: '+c.name,act:()=>{M.seen[c.id]=true;showModal({kicker:'Tìm chứng cứ',title:c.name,body:`<p>${c.see}</p>`})}};
  if(nSeen()>=2&&Math.hypot(DINH.x-S.x,DINH.y-S.y)<1.4)return{label:'Vào đình họp làng',act:hop};
  return null}
function kGoal(){const M=MG;let b=null,bd=1e9;for(const c of M.cl)if(!M.seen[c.id]){const d=Math.hypot(c.x-S.x,c.y-S.y);if(d<bd){bd=d;b=c}}
  return b?[b.x,b.y]:[DINH.x,DINH.y]}
function kDraw(list){const M=MG;
  for(const c of M.cl)if(!M.seen[c.id])list.push({y:c.y,f:()=>{twinkle(c.x,c.y-.2);mark(c.x,c.y-1.4,'#e2bf72')},lab:Math.hypot(c.x-S.x,c.y-S.y)<4?[c.name,c.x,c.y-2.4]:null})}
function kHud(){const M=MG,w=Math.min(440,VW-32),x=Math.round(VW/2-w/2);hudBox(x,16,w,64);
  ctx.font='600 12px "Be Vietnam Pro", system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#e2bf72';ctx.fillText('Tới giờ họp',x+12,32);hudBar(x+96,26,w-108,M.t/KIEN.T,M.t>KIEN.T*.75?'#e0402a':'#d98a3a');
  ctx.fillStyle='#efe8d4';ctx.fillText(`Manh mối đã xem ${nSeen()}/${M.cl.length}`+(nSeen()>=2?' · về cửa đình để vào họp':''),x+12,56);goalArrow()}

/* ---------- họp làng: chọn hai chứng cứ ---------- */
function hop(){const M=MG;if(!M||M.type!=='kien'||M.hop)return;M.hop=true;const found=M.cl.filter(c=>M.seen[c.id]);endMG();
  const pool=[...found,DECOY],hint=S.van>=KIEN.VAN_HINT,picked=[];
  const ask=()=>showModal({kicker:'Họp làng ở đình',title:picked.length?'Chứng cứ thứ hai':'Chứng cứ thứ nhất',
    body:`<p>${picked.length?'Ông Cả Lợi cười nhạt: "Thế thôi à?" Bạn đưa ra thêm một điều nữa.':'Cả làng ngồi chật sân đình. Ông Cả Lợi giơ tờ văn tự có điểm chỉ, có người làm chứng. Các cụ quay sang bạn: "Cháu có chữ, cháu nói xem."'}</p>${hint?'<p class="note">Bạn đọc kỹ từng điều: chứng cứ nào làng phải tin, chứng cứ nào chỉ là lời nói.</p>':''}`,
    choices:pool.filter(c=>!picked.includes(c)).map(c=>({label:c.proof,note:hint?(c.w>=3?'chứng cứ mạnh':c.w>=2?'khá vững':'yếu, dễ bị bác'):'',fn:()=>{picked.push(c);if(picked.length<2&&pool.length>picked.length)ask();else verdict(picked)}}))});
  ask();save()}
function verdict(picked){const sum=picked.reduce((a,c)=>a+c.w,0),win=sum>=KIEN.WIN;S.flags.kien=win?'thang':'thua';
  if(win){gain('tieng',4);gain('duc',2);gain('van',2);showModal({kicker:'Họp làng ở đình',title:'Tờ văn tự giả',body:'<p>Các cụ chuyền tay nhau cuốn sổ, hỏi lại chuyện ông Ba đi phu. Ông Cả Lợi đỏ mặt, gấp tờ văn tự lại, bảo "chắc người nhà viết nhầm". Bà Tư giữ được thửa ruộng. Từ hôm ấy, nhà nào có giấy tờ cũng mang sang nhờ bạn đọc giúp.</p><p class="note">Hư cấu. Ông Cả mất mặt trước làng.</p>'})}
  else{gain('tieng',-1);S.rel.thao=Math.max(0,S.rel.thao-1);showModal({kicker:'Họp làng ở đình',title:'Bà Tư mất ruộng',body:'<p>Các cụ bàn đi bàn lại. Lời bạn nói không đủ nặng bằng tờ giấy có điểm chỉ. Thửa ruộng bờ sông về tay ông Cả Lợi. Bà Tư không trách ai, chỉ ngồi lặng ở hiên nhà.</p><p class="note">Hư cấu. Từ nay bà Tư, Thảo túng hơn.</p>'})}
  save()}
