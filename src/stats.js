/* ================= chỉ số ================= */
/* Mốc của từng chỉ số và tác dụng của chúng. Đêm 1285 (climax.js) đọc các hàm ở đây, bảng chỉ số
   (phím C, showStats) cũng đọc ở đây, nên con số chỉ nằm một chỗ.
   Đức gộp cả uy tín với làng: giúp làng, lo việc chung thì tăng; bỏ mặc làng, nói "hòa" thì giảm. */
import {S} from './state.js';
import {showModal} from './ui.js';
import {foundCount,spotTotal} from './explore.js';

// Đêm 1285
export const traiFromDuc=()=>S.duc>=60?3:S.duc>=40?2:S.duc>=20?1:0; // số trai làng đứng ra vì Đức
export const followFast=()=>S.duc>=60;                               // dân làng đi theo nhanh hơn
export const voHp=()=>(S.vo>=25?1:0)+(S.vo>=75?1:0);                 // máu thêm theo Võ, mọi đường
export const voDmg=()=>S.vo>=50?1:0;                                 // sát thương thêm theo Võ
export const voFast=()=>S.vo>=75;                                    // ra đòn nhanh hơn
// Tự lo việc làng ở nhà (Chọn việc chính) chỉ đưa Đức tới đây; cao hơn phải làm việc thật.
export const DUC_FF_CAP=40;

const STATS=[
  {k:'van',name:'Văn',marks:[[20,'Đủ vào Quốc học viện năm 16 tuổi'],[25,'Viết được câu đối'],[30,'Đọc hết tủ sách thầy đồ để lại'],
    [35,'Đi thi: loại được 1 đáp án sai'],[55,'Đi thi: loại được 2 đáp án sai']],
    note:()=>S.path==='van'?'Đường văn, đêm giặc đến: 2 cây đuốc nghi binh, cứ 25 Văn thêm một (tối đa 5), đỗ thêm một.':'Đường văn có thêm đuốc nghi binh theo điểm Văn.'},
  {k:'vo',name:'Võ',marks:[[12,'Có binh thư thì đủ vào hương binh'],[20,'Đủ vào hương binh năm 16 tuổi'],[25,'Đêm giặc đến: thêm 1 máu'],
    [50,'Đêm giặc đến: đánh mạnh hơn'],[75,'Đêm giặc đến: thêm 1 máu, ra đòn nhanh hơn']],
    note:()=>'Tập trận năm 1283: Võ càng cao, vùng trúng càng rộng. Đường võ còn thêm 2 máu và đánh mạnh hơn.'},
  {k:'duc',name:'Đức',marks:[[20,'Đêm giặc đến: 1 trai làng đứng ra cùng bạn'],[40,'Đêm giặc đến: 2 trai làng'],[60,'Đêm giặc đến: 3 trai làng, dân làng đi theo bạn nhanh hơn']],
    note:()=>'Giúp làng, lo việc chung thì Đức tăng; bỏ mặc làng thì giảm. Giữ được đê năm 1270 và theo đường nông, mỗi điều thêm một trai làng; nói "hòa" ở Diên Hồng thì bớt một.'},
];

function block(st){
  const v=S[st.k],next=st.marks.find(([m])=>v<m),prev=[...st.marks].reverse().find(([m])=>v>=m),lo=prev?prev[0]:0,hi=next?next[0]:100;
  const pct=Math.round(100*Math.min(1,(v-lo)/Math.max(1,hi-lo)));
  const rows=st.marks.map(([m,t])=>`<li class="${v>=m?'got':m===(next&&next[0])?'next':''}"><b>${m}</b><span>${t}</span></li>`).join('');
  return`<div class="stat-block"><div class="stat-head"><span>${st.name}</span><b>${v}</b><small>${next?`còn ${next[0]-v} nữa tới mốc ${next[0]}`:'đã qua mọi mốc'}</small></div>
    <div class="stat-bar"><i style="width:${pct}%"></i></div><ul>${rows}</ul><p class="note">${st.note()}</p></div>`;
}

export function showStats(){
  showModal({wide:true,kicker:'Bảng chỉ số',title:S.name,body:'<div class="stat-grid">'+STATS.map(block).join('')+'</div>'+
    '<p class="note"><b>Sức:</b> mỗi mùa 4, mỗi việc (học, luyện, làm đồng, giúp làng) tốn 1. Ăn cơm mẹ +1, thuốc bổ +2 (mỗi mùa một lần). '+
    '<b>Tiền:</b> mua sách, kiếm, lụa, thuốc; từ thu 1282 đến hết 1284 dùng để lo trước ngày giặc đến. '+
    `<b>Khám phá:</b> ${foundCount()}/${spotTotal()} nơi. Thấy lấp lánh thì lại gần bấm E.</p>`,
    choices:[{label:'Đóng'}]});
}
