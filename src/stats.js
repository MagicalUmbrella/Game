/* ================= chỉ số ================= */
/* Mốc của từng chỉ số và tác dụng của chúng. Đêm 1285 (climax.js), trại giặc (camp.js), hội thoại (dialogs.js) đọc
   các hàm ở đây, bảng chỉ số (phím C, showStats) cũng đọc ở đây, nên con số chỉ nằm một chỗ.
   - Văn, Võ: học, luyện mà có. Mốc mở ra việc làm được (viết đơn cho làng, cõng người, dạy võ trai làng).
   - Đức: lòng mình. Tăng khi làm điều đúng mà chịu thiệt, kể cả khi không ai biết. Quyết định người thân tin bạn
     đến đâu, và vài lựa chọn khó.
   - Tiếng: uy tín với làng. Tăng khi người khác thấy việc bạn làm cho làng, giảm khi bỏ mặc làng. Quyết định bao
     nhiêu trai làng đứng ra cùng bạn đêm giặc đến.
   - Thể trạng: sức khỏe lâu dài. Quyết định Sức mỗi mùa (3–5) và máu đêm giặc đến.
   - Nghề: xem nghe.js. */
import {S} from './state.js';
import {showModal,renderHUD,floatText} from './ui.js';
import {foundCount,spotTotal} from './explore.js';
import {NGHE,knows} from './nghe.js';

// Đêm 1285
export const traiFromTieng=()=>S.tieng>=60?3:S.tieng>=40?2:S.tieng>=20?1:0; // số trai làng đứng ra vì Tiếng
export const followFast=()=>S.tieng>=60;                               // dân làng đi theo nhanh hơn
export const carryWeak=()=>S.vo>=40;                                   // cõng người già, trẻ nhỏ: họ đi theo nhanh như người khỏe
export const voHp=()=>(S.vo>=25?1:0)+(S.vo>=75?1:0);                   // máu thêm theo Võ, mọi đường
export const voDmg=()=>S.vo>=50?1:0;                                   // sát thương thêm theo Võ
export const voFast=()=>S.vo>=75;                                      // ra đòn nhanh hơn
export const theHp=()=>(S.the>=75?1:0)-(S.the<30?1:0);                 // thể trạng: khỏe thêm 1 máu, yếu bớt 1
export const ducKin=()=>S.duc>=25;                                     // người nhà tin lời: chỉ đường là tự đi
export const ducTrust=()=>S.duc>=45;                                   // người bị bắt cùng tin bạn (chương hai)
export const ducShield=()=>S.duc>=60;                                  // ở trại giặc dám đứng ra nhận thay người khác
export const vanPetition=()=>S.van>=50;                                // viết đơn cho làng (cụ xã)
export const voTeach=()=>S.vo>=60;                                     // luyện trai làng thành đội (võ sư)
// Tự lo việc làng ở nhà (Chọn việc chính) chỉ đưa Tiếng tới đây; cao hơn phải làm việc thật.
export const TIENG_FF_CAP=40;
// Thắp hương nghe kinh chỉ đưa Đức tới đây; cao hơn phải sống ngay thật qua những lựa chọn khó.
export const DUC_CHUA_CAP=20;
/* ---------- nhịp tăng chỉ số (làm chậm 10/2026: 7 tuổi từng có 51 Văn) ----------
   Văn, Võ, Đức, Tiếng tăng qua growth():
   - việc làm lặp lại được (học, luyện, giúp việc làng, dạy học, mua giấy bút, tự học ở nhà) gọi gain(k, n, true):
     n là "điểm thô" như cũ, nhân GROW_RATE nên mỗi buổi chỉ được vài phần mười điểm, cộng dồn ở S.frac[k];
   - việc một lần (sự kiện, lựa chọn, khám phá) giữ nguyên số điểm;
   - cả hai đều chậm dần khi chỉ số cao (dim: dưới 25 đủ, 25–45 còn 0,7, 45–65 còn 0,5, trên 65 còn 0,3);
   - và không vượt trần theo tuổi (statCap): trẻ con học giỏi mấy cũng có hạn.
   Mức nhắm (chơi chăm, dồn một chỉ số): 7 tuổi khoảng 5, 12 tuổi khoảng 20, 16 tuổi khoảng 35, đêm 1285 (27 tuổi)
   khoảng 70; chơi lơ là thì khoảng một nửa. Bảng "nhịp chỉ số" trong npm test canh việc này. */
/* GROW: rate (điểm thật mỗi điểm thô của việc lặp lại), budget (điểm thô mỗi mùa mỗi chỉ số được đủ rate, khoảng hai buổi
   học), late (hệ số cho phần vượt budget: cày hết Sức vẫn hơn nhưng không bỏ xa người chơi chia Sức đi khám phá). */
export const GROW={rate:.17,budget:6,late:.6};
export const GROW_RATE=GROW.rate;
export const dim=v=>v<30?1:v<50?.85:v<70?.7:.5;
export function statCap(k){const a=S.year-1258;
  // trẻ con tiến chậm (3 điểm mỗi năm tuổi), từ 16 tuổi 4,5 điểm: 7 tuổi 8, 12 tuổi 23, 16 tuổi 35, 20 tuổi 53, 27 tuổi 84
  const kid=(base,per)=>a<16?base+3*(a-6):base+30+Math.floor(4.5*(a-16));
  return Math.min(100,k==='van'||k==='vo'?kid(5,3):k==='tieng'?Math.max(2,kid(-1,3)):k==='duc'?kid(8,3):100)}
/* điểm thô việc lặp lại đã nhận mùa này của chỉ số k (S.lapPts, đặt lại khi sang mùa) */
function lapRate(k,n){const now=S.year*4+S.season;if(S.lapAt!==now){S.lapAt=now;S.lapPts={}}
  const used=S.lapPts[k]||0,full=Math.max(0,Math.min(n,GROW.budget-used));S.lapPts[k]=used+n;
  return n>0?(full+(n-full)*GROW.late)/n*GROW.rate:GROW.rate}
/* tính phần tăng thật của n điểm (lap: việc lặp lại); trả {d: số nguyên cộng vào, eff: phần tăng kể cả lẻ, capped} */
export function growth(k,n,lap){const v=S[k]||0,cap=statCap(k);if(v>=cap)return{d:0,eff:0,capped:true};
  const eff=n*(lap?lapRate(k,n):1)*dim(v),fr=S.frac||(S.frac={}),f=(fr[k]||0)+eff,d=Math.min(Math.floor(f),cap-v);
  fr[k]=d<Math.floor(f)?0:f-Math.floor(f);return{d,eff,capped:false}}
/* Sức tối đa mỗi mùa theo thể trạng */
export const sucMax=()=>3+(S.the>=40?1:0)+(S.the>=75?1:0);
/* đổi thể trạng (cap: chỉ tăng tới mức này, ví dụ ăn uống không đưa quá 70) */
export function gainThe(n,cap=100){const old=S.the;S.the=n>0?Math.max(old,Math.min(cap,old+n)):Math.max(0,old+n);const d=S.the-old;if(d)floatText((d>0?'+':'')+d+' Thể trạng',d>0?'#9fcaa9':'#e07f6b');S.suc=Math.min(S.suc,sucMax());renderHUD()}

export const STATS=[
  {k:'van',name:'Văn',marks:[[20,'Đủ vào Quốc học viện năm 16 tuổi'],[25,'Viết được câu đối'],[30,'Đọc được bia đá, giấy tờ cũ'],
    [35,'Đi thi: loại được 1 đáp án sai'],[50,'Viết đơn xin cho làng (gặp cụ xã)'],[55,'Đi thi: loại được 2 đáp án sai']],
    note:()=>S.path==='van'?'Đường văn, đêm giặc đến: 2 cây đuốc nghi binh, cứ 25 Văn thêm một (tối đa 5), đỗ thêm một.':'Đường văn có thêm đuốc nghi binh theo điểm Văn.'},
  {k:'vo',name:'Võ',marks:[[12,'Có binh thư thì đủ vào hương binh'],[20,'Đủ vào hương binh năm 16 tuổi'],[25,'Đêm giặc đến: thêm 1 máu'],
    [40,'Cõng được người già, trẻ nhỏ: họ theo bạn nhanh hơn'],[50,'Đêm giặc đến: đánh mạnh hơn'],[60,'Luyện trai làng thành đội (gặp lão võ sư): đêm giặc đến họ ra đòn nhanh hơn'],[75,'Đêm giặc đến: thêm 1 máu, ra đòn nhanh hơn']],
    note:()=>'Tập trận năm 1283: Võ càng cao, vùng trúng càng rộng. Đường võ còn thêm 2 máu và đánh mạnh hơn.'},
  {k:'duc',name:'Đức',marks:[[25,'Người nhà tin lời bạn: đêm giặc đến, chỉ đường là cha mẹ, vợ con tự tìm vào rừng'],[45,'Người bị bắt cùng tin bạn, nghe bạn'],[60,'Dám đứng ra nhận đòn thay người khác']],
    note:()=>`Đức là lòng mình: làm điều đúng mà chịu thiệt, kể cả khi không ai biết. Người ngoài không thấy được Đức, chỉ người gần bạn mới biết. Nghe kinh ở chùa chỉ đưa Đức tới ${DUC_CHUA_CAP}.`},
  {k:'tieng',name:'Tiếng',marks:[[20,'Đêm giặc đến: 1 trai làng đứng ra cùng bạn'],[40,'Đêm giặc đến: 2 trai làng'],[60,'Đêm giặc đến: 3 trai làng, dân làng đi theo bạn nhanh hơn']],
    note:()=>`Tiếng là uy tín với làng: việc bạn làm cho làng mà người ta thấy. Bỏ mặc làng thì mất tiếng. Ở nhà lo việc làng chỉ đưa Tiếng tới ${TIENG_FF_CAP}. Giữ được đê năm 1270 và theo đường nông, mỗi điều thêm một trai làng; nói "hòa" ở Diên Hồng thì bớt một.`},
  {k:'the',name:'Thể trạng',marks:[[30,'Từ 30: đủ sức đánh (dưới 30, đêm giặc đến bớt 1 máu)'],[40,'Mỗi mùa 4 Sức'],[75,'Mỗi mùa 5 Sức, đêm giặc đến thêm 1 máu']],
    note:()=>'Ăn cơm mẹ nấu, thuốc bổ, luyện võ thì khỏe lên; thức đêm, đói kém, ốm đau, làm quá sức thì yếu đi. Thể trạng thấp hơn 40 thì mỗi mùa chỉ có 3 Sức.'},
];

/* Tiến độ của chỉ số k tới mốc kế tiếp (cho HUD): {pct, next} hoặc null nếu không có mốc. */
export function statProgress(k){const st=STATS.find(x=>x.k===k);if(!st)return null;const v=S[k],next=st.marks.find(([m])=>v<m),prev=[...st.marks].reverse().find(([m])=>v>=m),lo=prev?prev[0]:0,hi=next?next[0]:lo;
  return{pct:next?Math.round(100*(v-lo)/Math.max(1,hi-lo)):100,next:next&&next[0]}}

function block(st){
  const v=S[st.k],next=st.marks.find(([m])=>v<m),prev=[...st.marks].reverse().find(([m])=>v>=m),lo=prev?prev[0]:0,hi=next?next[0]:100;
  const pct=next?Math.round(100*Math.min(1,(v-lo)/Math.max(1,hi-lo))):100;
  const rows=st.marks.map(([m,t])=>`<li class="${v>=m?'got':m===(next&&next[0])?'next':''}"><b>${m}</b><span>${t}</span></li>`).join('');
  return`<div class="stat-block"><div class="stat-head"><span>${st.name}</span><b>${v}</b><small>${next?`còn ${next[0]-v} nữa tới mốc ${next[0]}`:'đã qua mọi mốc'}</small></div>
    <div class="stat-bar"><i style="width:${pct}%"></i></div><ul>${rows}</ul><p class="note">${st.note()}</p></div>`;
}
function ngheBlock(){
  const rows=Object.entries(NGHE).map(([id,n])=>{const p=(S.nghe||{})[id]||0,ok=knows(id);
    return`<li class="${ok?'got':p?'next':''}"><b>${ok?'biết':p+'/'+n.need}</b><span><b class="nm">${n.name}</b>: ${ok?n.effect:'học bằng cách '+n.how+'.'}</span></li>`}).join('');
  return`<div class="stat-block nghe"><div class="stat-head"><span>Nghề</span><small>học qua việc làm, không có điểm</small></div><ul>${rows}</ul></div>`}

export function showStats(){
  showModal({wide:true,kicker:'Bảng chỉ số',title:S.name,body:'<div class="stat-grid">'+STATS.map(block).join('')+ngheBlock()+'</div>'+
    `<p class="note"><b>Sức:</b> mỗi mùa ${sucMax()} (theo thể trạng), mỗi việc (học, luyện, làm đồng, giúp làng) tốn 1. Ăn cơm mẹ +1, thuốc bổ +2 (mỗi mùa một lần). `+
    '<b>Tiền:</b> mua sách, kiếm, lụa, thuốc; từ thu 1282 đến hết 1284 dùng để lo trước ngày giặc đến. '+
    `<b>Khám phá:</b> ${foundCount()}/${spotTotal()} nơi. Thấy lấp lánh thì lại gần bấm E.</p>`,
    choices:[{label:'Đóng'}]});
}
/* Dòng biên niên về Đức và Tiếng: hai chỉ số lệch nhau thì nói ra */
export function soulChronicle(){const d=S.duc,t=S.tieng;
  if(d>=45&&t<25)return'Bạn sống ngay thẳng, làm nhiều điều tốt mà ít ai trong làng biết đến.';
  if(t>=45&&d<25)return'Cả làng trọng bạn. Nhưng những gì bạn làm khi không ai nhìn thấy, chỉ mình bạn biết.';
  if(d>=45&&t>=45)return'Lòng ngay mà tiếng cũng tốt: người trong nhà tin bạn, người trong làng nể bạn.';
  if(d<15&&t<15)return'Bạn sống cho mình, ít nghĩ đến ai. Làng chẳng trông cậy gì, người nhà cũng chẳng dám dựa.';
  return'Bạn sống như bao người trong làng: có lúc tốt, có lúc vì mình.'}
