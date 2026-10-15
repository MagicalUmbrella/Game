/* ================= chức danh, thăng tiến ================= */
/* Danh vị của nhân vật (hiện trên bảng trạng thái) và các nấc thăng tiến của từng đường đời ở chương một.
   Toàn bộ chức việc ở làng, ở huyện của nhân vật là hư cấu; chỉ các lệ chung (đặt xã quan năm 1242, thi lại viên
   năm 1261) là theo Toàn thư.
   S.career = {
     van:  null | 'hoc' (ở lại Quốc học viện) | 'day' (về làng dạy học) | 'lai' (làm lại viên ở huyện): chọn sau khi trượt thi,
     hoctro: số buổi dạy trẻ trong làng, laiN: số buổi làm việc ở huyện,
     boBut: bỏ bút theo kiếm năm 1283 (đường văn chuyển sang đường võ),
     doi:  lên đội trưởng hương binh sau buổi tập trận 1283,
     ruong: số thửa ruộng nhà (bắt đầu 2, đường nông mua thêm được tới RUONG_MAX), mua: lần mua gần nhất (năm*4+mùa),
     xa:   null | 'win' | 'lose' | 'no': việc làng chọn người đứng đầu năm 1283 }
   Chương hai đọc S.career để nối tiếp (thăng chức nhờ chiến công, đi sứ, khoa thi 1304). */
import {S,age} from './state.js';
import {gain,showModal,spend,toast,renderHUD} from './ui.js';

export const RUONG_MAX=6;
export const HOCTRO_NEED=6;   // dạy đủ ngần này buổi thì có học trò lớn đứng ra cùng bạn đêm giặc đến
export const LAI_VAN=30;      // làm lại viên cần biết chữ đến đây
const src=t=>`<p class="src">Toàn thư chép: ${t}</p>`;
const C=()=>S.career||(S.career=newCareer());
export const newCareer=()=>({van:null,hoctro:0,laiN:0,boBut:false,doi:false,ruong:2,mua:0,xa:null});

/* ---------- danh vị ---------- */
export function chucName(){const c=C();let t='';
  if(S.path==='van')t=S.dothi?'Thái học sinh':c.van==='day'?(S.thay?'Trợ giáo trường làng':'Thầy đồ làng An Phú'):c.van==='lai'?'Lại viên ở huyện':S.flags.exam==='fail'?'Học trò Quốc học viện':'Sĩ tử · Quốc học viện';
  else if(S.path==='vo')t=c.doi?'Đội trưởng hương binh':'Hương binh';
  else if(S.path==='nong')t=c.ruong>=6?'Nhà nhiều ruộng':c.ruong>=4?'Nhà nông khá giả':'Nhà nông';
  if(c.xa==='win')t=(t?t+' · ':'')+'Xã chính';
  return t}

/* ---------- đường văn: sau khi trượt thi ---------- */
export const vanFailOpen=()=>S.path==='van'&&S.flags.exam==='fail'&&!C().van&&!S.ended;
export function vanFailChoice(){
  showModal({kicker:'Sau ngày xướng danh',title:'Trượt rồi, đi đường nào?',body:`<p>Bảng vàng không có tên mình. Khoa thi sau chưa biết đến bao giờ mới mở. Thầy đồ Chu nhắn lên kinh: "Học là để làm người, đâu chỉ để đỗ."</p>
    <p class="note">Lựa chọn sau đây là hư cấu. Từ sau khoa năm 1275, Toàn thư không chép khoa thi Thái học sinh nào cho đến năm 1304.</p>`,choices:[
    {label:'Ở lại Quốc học viện, học tiếp',note:'giữ việc học ở kinh',fn:()=>{C().van='hoc';toast('Bạn ở lại kinh, sáng đèn sách, tối chép bài.',4200)}},
    {label:'Về làng phụ thầy Chu dạy trẻ',note:'+2 Tiếng · dạy học ở trường làng',fn:()=>{C().van='day';gain('tieng',2);toast('Bạn về làng. Thầy Chu cười: "Ta già rồi, có trò đỡ cho thì tốt quá." Vào trường làng bấm E để dạy học.',5600)}},
    {label:'Xin làm lại viên ở huyện',note:S.van>=LAI_VAN?'+1 Tiếng · làm giấy tờ, có lương':`cần Văn ${LAI_VAN}`,disabled:S.van<LAI_VAN,fn:()=>{C().van='lai';gain('tieng',1);
      showModal({kicker:'Ở huyện',title:'Lại viên',body:`<p>Quan huyện thử bạn viết một tờ công văn, tính một bài thóc thuế. Bạn được nhận vào làm việc giấy tờ: chép sổ đinh, sổ ruộng, làm đơn từ.</p>${src('năm 1261 triều đình thi chọn lại viên bằng viết chữ và làm tính, người đỗ được bổ làm chức lại.')}<p class="note">Việc bạn làm lại viên là hư cấu. Ở nhà bấm E để lên huyện làm việc.</p>`})}}]})}
/* thầy Chu mất (1281): trợ giáo thành thầy đồ */
export function thayMatCareer(){if(C().van!=='day')return;
  showModal({kicker:'Sau đám tang',title:'Trường làng không thể bỏ',body:'<p>Lũ trẻ vẫn ngồi chờ trên chiếu, khay cát còn nguyên nét chữ thầy viết dở. Cụ xã đến nhà bạn: "Làng trông vào cháu. Từ nay cháu là thầy đồ của làng."</p><p class="note">Hư cấu. Bạn thành thầy đồ làng An Phú. Dạy học từ nay mỗi buổi được các nhà biếu một quan.</p>'})}
/* cửa trường làng */
export function truongChoices(){const c=C();if(S.path!=='van'||c.van!=='day')return[];
  return[{label:'Dạy lũ trẻ trong làng',note:`−1 Sức · +Văn · +Tiếng${S.thay?'':' · +1 quan'} · đã dạy ${c.hoctro} buổi`,fn:()=>{if(!spend())return;c.hoctro++;gain('van',1,true);gain('tieng',2,true);if(!S.thay)gain('tien',1);
    toast(c.hoctro===HOCTRO_NEED?'Thằng Mõ, học trò lớn nhất của bạn, nay đã biết viết thư cho cả xóm. Nó bảo: "Thầy có việc gì, con đi ngay."':['Bạn dạy lũ trẻ đọc Tam tự kinh, tiếng đọc vang ra tận ngõ.','Bạn cầm tay một đứa nhỏ viết chữ "nhân" trên khay cát.','Bạn kể lũ trẻ nghe chuyện Lý Thường Kiệt đánh Tống.','Bạn chữa bài cho mấy đứa lớn, đứa nào cũng muốn đi thi.'][c.hoctro%4],5000)}}]}
/* cửa nhà: lại viên lên huyện làm việc */
export function homeChoices(){const c=C(),ch=[];
  if(S.path==='van'&&c.van==='lai')ch.push({label:'Lên huyện làm việc giấy tờ',note:'−1 Sức · +2 quan · +Văn',fn:()=>{if(!spend())return;c.laiN++;gain('tien',2);gain('van',1,true);
    toast(['Bạn chép sổ đinh cả buổi, tên từng nhà trong huyện thuộc làu.','Bạn tính thóc thuế cho mấy xã, bàn tính lách cách đến chiều.','Bạn viết hộ đơn cho một bà cụ kiện đất, không lấy tiền.','Bạn thảo công văn gửi lên lộ, quan huyện khen chữ đẹp.'][c.laiN%4],4600)}});
  if(vanFailOpen())ch.push({label:'Nghĩ xem trượt thi rồi thì đi đường nào',fn:vanFailChoice});
  return ch}

/* ---------- đường võ ---------- */
/* sau buổi tập trận 1283: đứng đầu, hoặc đạt mà có Võ 50, Tiếng 30, thì lên đội trưởng */
export function trainPromote(){const c=C(),f=S.flags.train;if(c.doi||S.path!=='vo')return;
  if(f==='top'||f==='ok'&&S.vo>=50&&S.tieng>=30){c.doi=true;gain('tieng',2);
    showModal({kicker:'Tan buổi tập',title:'Đội trưởng hương binh',body:`<p>Võ quan gọi tên bạn ra trước hàng: "${f==='top'?'Đánh giỏi nhất bãi':'Đánh vững, lại được trai làng nể'}. Từ nay cho làm đội trưởng, coi trai làng An Phú."</p><p class="note">Hư cấu. Đêm giặc đến thêm một trai làng theo bạn. Lão võ sư cho bạn luyện trai làng thành đội mà không cần Võ 60.</p>`})}
  else if(f==='ok')showModal({kicker:'Tan buổi tập',title:'Chưa đến lượt',body:`<p>Đội trưởng mới được chọn là người khác. Võ quan bảo: "Tay giáo được, nhưng ${S.vo<50?'võ còn non':'trai làng chưa mấy ai biết tên cậu'}."</p><p class="note">Lên đội trưởng cần đứng đầu buổi tập, hoặc đạt yêu cầu mà có Võ 50, Tiếng 30.</p>`})}
/* đường văn chưa đỗ: bỏ bút theo kiếm năm 1283 */
export const boButOpen=()=>S.path==='van'&&!S.dothi&&S.vo>=15;

/* ---------- đường nông: ruộng nhà ---------- */
export const ruong=()=>C().ruong;
export const ruongCost=()=>6+2*(C().ruong-2);
/* làm đồng một buổi: 2 thửa đầu như cũ, cứ thêm 2 thửa được thêm 1 quan */
export const fieldBonus=()=>Math.floor((C().ruong-2)/2);
export function lyChoices(){const c=C(),ch=[],now=S.year*4+S.season;
  if(S.path==='nong'&&age()>=16&&c.ruong<RUONG_MAX){const cost=ruongCost();
    ch.push({label:`Mua thêm một thửa ruộng (đang có ${c.ruong})`,note:c.mua===now?'mùa này đã mua':S.tien>=cost?`${cost} quan · mùa thu thu hoạch thêm`:`cần ${cost} quan`,disabled:S.tien<cost||c.mua===now,fn:()=>{S.tien-=cost;c.ruong++;c.mua=now;renderHUD();
      toast(c.ruong===4?'Nhà bạn đã có bốn thửa ruộng. Mùa gặt phải thuê thêm người gặt.':c.ruong===RUONG_MAX?'Sáu thửa ruộng, nhà bạn thành nhà nhiều ruộng nhất xóm.':'Cụ xã ghi tên bạn vào sổ ruộng của làng.',5000)}})}
  return ch}
/* thu hoạch mùa thu (gọi khi sang đông): mỗi thửa ngoài hai thửa đầu được 1,5 quan; từ thửa thứ tư phải thuê người gặt (cứ hai thửa thêm một quan) */
export function harvest(){const c=C();if(S.path!=='nong'||c.ruong<=2)return;
  const r=Math.random(),k=S.year===1280&&S.flags.sau?{giu:1.5,vua:1,mat:.5,bo:.5}[S.flags.sau]:r<.2?.5:r>.8?1.5:1,extra=c.ruong-2,hire=Math.floor(Math.max(0,c.ruong-3)/2),n=Math.max(0,Math.round(extra*1.5*k)-hire);
  S.tien+=n;
  toast((k<1?'Mùa thu sâu bệnh, ruộng nhà kém. ':k>1?'Được mùa! Lúa trĩu bông. ':'Mùa gặt xong. ')+`Ruộng nhà thu thêm ${n} quan`+(hire?` (đã trả ${hire} quan thuê người gặt).`:'.'),5200)}

/* ---------- việc làng năm 1283: chọn người đứng đầu ---------- */
export const XA_RIVAL=45;
export const xaScore=()=>S.tieng+Math.round(S.duc/2)+(S.path==='nong'?15:0)+(S.flags.de==='saved'?5:0)+(C().van==='day'?5:0)+(C().ruong>=4?5:0)+(S.flags.cuop==='win'?8:0)+(S.flags.kien==='thang'?8:0);   // giữ trâu cho ông Cả, vạch tờ văn tự giả của ông ấy
export function xaEvent(K){if(age()<20)return;const sc=xaScore();
  showModal({kicker:K,title:'Cụ xã xin thôi việc làng',body:`<p>Cụ xã già yếu, xin thôi coi việc làng. Các cụ họp ở đình chọn người thay. Ông Cả Lợi nhà giàu nhất xóm đã đánh tiếng muốn làm, mấy cụ lại nhắc đến tên bạn.</p>
    ${src('năm 1242 triều đình đặt chức đại tư xã, tiểu tư xã ở các xã; cùng với xã chính, xã sử, xã giám, gọi chung là xã quan.')}
    <p class="note">Hư cấu: việc làng An Phú chọn người, ông Cả Lợi. Làng xét theo Tiếng, Đức; nhà nông được làng tin hơn; việc bạn từng làm với ông Cả cũng được nhắc lại.</p>`,choices:[
    {label:'Ra nhận việc làng',note:sc>=XA_RIVAL?'nhiều cụ ủng hộ bạn':'ông Cả có vẻ được lòng hơn',fn:()=>{
      if(sc>=XA_RIVAL){C().xa='win';gain('tieng',3);showModal({kicker:'Ở đình làng',title:'Xã chính làng An Phú',body:'<p>Các cụ giơ tay gần hết. Cụ xã trao cho bạn sổ đinh, sổ ruộng của làng: "Từ nay cháu lo việc chung. Ta chỉ ngồi uống nước thôi."</p><p class="note">Hư cấu. Từ nay góp dựng lán trong rừng chỉ còn 10 quan (lấy quỹ làng), đêm giặc đến thêm một trai làng theo bạn.</p>'})}
      else{C().xa='lose';gain('tieng',-1);showModal({kicker:'Ở đình làng',title:'Ông Cả Lợi được chọn',body:'<p>Ông Cả mổ lợn đãi cả làng từ hôm trước. Lúc giơ tay, phần đông giơ cho ông. Mấy cụ quen nhìn bạn, lắc đầu: "Còn trẻ, để năm khác."</p>'})}}},
    {label:'Nhường cho người khác',note:'không ra tranh',fn:()=>{C().xa='no';toast('Bạn xin để các cụ chọn người lớn tuổi hơn. Ông Cả Lợi được chọn.',4600)}}]})}

/* ---------- đêm 1285 ---------- */
// số trai làng thêm nhờ chức việc (cộng vào nLang trong climax.js, vẫn chung trần 4)
export const careerTrai=()=>{const c=C();return(c.doi?1:0)+(c.xa==='win'?1:0)+(c.van==='day'&&c.hoctro>=HOCTRO_NEED?1:0)};
// lại viên chép sổ đinh, biết mặt từng nhà: dân làng tin và đi theo nhanh hơn
export const laiFollow=()=>C().van==='lai'&&C().laiN>=4;
export const lanCut=()=>C().xa==='win'?10:0;

/* ---------- biên niên ---------- */
export function careerChronicle(){const c=C(),L=[];
  if(c.van==='hoc')L.push('Trượt thi, bạn ở lại Quốc học viện học tiếp, chờ khoa sau.');
  if(c.van==='day')L.push(S.thay?`Trượt thi, bạn về làng phụ thầy Chu dạy trẻ (${c.hoctro} buổi).`:`Trượt thi, bạn về làng dạy trẻ. Thầy Chu mất, bạn thành thầy đồ làng An Phú (${c.hoctro} buổi dạy).`);
  if(c.van==='day'&&c.hoctro>=HOCTRO_NEED)L.push('Học trò cũ của bạn đêm giặc đến cầm gậy đứng ra cùng thầy.');
  if(c.van==='lai')L.push(`Trượt thi, bạn làm lại viên ở huyện${c.laiN>=4?', thuộc sổ đinh từng nhà. Đêm giặc đến, dân làng nghe bạn gọi là đi':''}.`);
  if(c.boBut)L.push('Năm 1283 bạn bỏ bút theo kiếm, vào hương binh.');
  if(c.doi)L.push('Sau buổi tập trận 1283, bạn lên đội trưởng hương binh, coi trai làng An Phú.');
  if(S.path==='nong')L.push(c.ruong>=6?'Nhà bạn từ hai thửa ruộng thành sáu thửa, nhiều ruộng nhất xóm.':c.ruong>=4?`Nhà bạn mua thêm ruộng, có ${c.ruong} thửa, mùa gặt phải thuê người.`:'Nhà bạn vẫn hai thửa ruộng như thời cha ông.');
  if(c.xa==='win')L.push('Năm 1283 làng chọn bạn làm xã chính. Đêm giặc đến, bạn lấy quỹ làng dựng lán, gọi trai làng đứng ra.');
  else if(c.xa==='lose')L.push('Năm 1283 bạn ra nhận việc làng nhưng làng chọn ông Cả Lợi.');
  else if(c.xa==='no')L.push('Năm 1283 bạn nhường việc làng cho ông Cả Lợi.');
  return L}
