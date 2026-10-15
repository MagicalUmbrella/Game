/* ================= dialogs ================= */
import {voice} from './loi.js';
import {VAT_OPP,hoiVat,vatOpen,vatState} from './minigames/vat.js';
import {fieldBonus,homeChoices,lyChoices,truongChoices} from './chuc.js';
import {BI,H,MO,PA,SEASONS,TR,TS,W,WA,WL,WR,Z,canchi,ctx} from './constants.js';
import {locked} from './world.js';
import {bsolid,get,map} from './map.js';
import {P,S,age,has,save} from './state.js';
import {doneQuest,floatAt,floatText,gain,modalOpen,renderHUD,say,spend,startQuest,toast} from './ui.js';
import {advance,advanceOne,nguHint} from './events.js';
import {prepChoice} from './prep.js';
import {dailyReward,startDrill,startField,startFishing,startWriting} from './minigames/daily.js';
import {keys,solidAt} from './input.js';
import {camX,camY} from './render.js';
import {DUC_CHUA_CAP,TIENG_FF_CAP,gainThe,growth,sucMax,vanPetition,voTeach} from './stats.js';
import {knows,practice} from './nghe.js';
import {trauYeu} from './life.js';
import {chainChoices} from './chains.js';
import {step4} from './pathfind.js';

export const pickR=a=>a[Math.floor(Math.random()*a.length)];
/* Làm hết Sức mùa này một lần: chơi một màn ngắn, kết quả nhân với số buổi. Đỡ phải bấm đi bấm lại cùng một việc
   (chủ dự án thấy quãng giữa game lặp). Còn từ 2 Sức trở lên mới hiện. run(k) chạy màn chơi, tính k buổi. */
export function allSuc(label,run){const n=S.suc;if(n<2)return[];
  return[{label:`${label} hết Sức mùa này (${n} buổi một lần)`,note:'chơi một lần, tính cho cả mùa',fn:()=>{S.suc=0;renderHUD();run(n)}}]}
/* Về nhà ngủ từ bất cứ đâu (phím N): đỡ phải đi bộ về khi đã hết việc. */
export function goSleep(){S.x=43.5;S.y=49.6;advance(1)}   // cửa nhà mình
function vanLesson(){const v=S.van;return v<10?'Thầy dạy chữ trên khay cát, từng nét một.':v<25?'Thầy giảng sách dạy đạo làm người.':v<45?'Bạn đọc Luận ngữ, tập viết văn sách.':v<70?'Bạn học Kinh Thi, Kinh Thư, bình luận chuyện xưa.':'Bạn đọc Đại Việt sử ký, bàn về phép trị nước.'}
function voLesson(){const v=S.vo;return v<10?'Đứng tấn đến run cả chân.':v<25?'Tập côn pháp, múa gậy quanh sân.':v<45?'Tập đao pháp đến mỏi tay.':v<70?'Tập cưỡi ngựa, bắn cung.':'Học bày trận, đọc binh thư.'}
export function talkMe(){
  const a=age(),ch=[];
  if(!S.quests.hoc){startQuest('hoc');return say('Mẹ',a<9?'Con lên sáu rồi, phải đi học chữ thôi. Trường làng ở phía tây bắc, ngay dưới đình làng. Con đến chào thầy đồ Chu nhé.':'Con lớn ngần này rồi mà chưa ra trường làng. Học được chữ nào hay chữ ấy, con ra chào thầy đồ Chu đi. Trường ở phía tây bắc, ngay dưới đình làng.')}
  if(!S.cha){const pc=prepChoice('catThoc');if(pc)ch.push(pc)}
  if(!S.ate)ch.push({label:'Ăn cơm mẹ nấu',note:'+1 Sức · khỏe lên',fn:()=>{S.ate=true;S.suc=Math.min(sucMax(),S.suc+1);gainThe(1,70);renderHUD();floatText('+1 Sức','#9fcaa9');toast('Cơm gạo mới, canh rau, cà muối. Bạn thấy khỏe hẳn.')}});
  if(S.year>=1275&&a>=17&&!S.quests.lua)startQuest('lua');
  if(S.quests.lua==='active'&&has('Lụa'))ch.push({label:'Biếu mẹ tấm lụa',fn:()=>{S.items.splice(S.items.indexOf('Lụa'),1);doneQuest('lua');gain('duc',2);say('Mẹ','Lụa đẹp quá con ạ. Mẹ để dành may áo đi lễ chùa.')}});
  let t;
  if(!S.cha)t=S.year<1280?'Từ ngày cha con mất, nhà mình vắng hẳn. Mẹ chỉ còn mỗi con thôi.':'Mẹ già rồi. Mỗi lần thắp hương cho cha con, mẹ lại kể chuyện con cho ông ấy nghe.';
  else if(S.thao==='wife')t=S.child?'Bé Sen giống con hồi nhỏ như đúc. Mẹ trông cháu, hai đứa cứ yên tâm làm ăn.':'Có Thảo về làm dâu, mẹ đỡ hẳn. Con bé chịu khó lắm.';
  else if(S.flags.de==='lost'&&S.year<1272)t='Năm nay mất mùa, nhà mình ăn độn khoai. Con chịu khó nhé.';
  else t=a<10?'Đi chơi thì đừng ra gần sông một mình nhé con.':a<16?'Con lớn nhanh quá. Cha con bảo ra đồng phụ được rồi đấy.':S.path==='vo'?'Mẹ may thêm cho con cái áo. Tập luyện thì giữ sức khỏe.':S.path==='van'?'Học hành trên kinh có vất vả không con? Nhớ về thăm nhà.':'Có con ở nhà, cha mẹ đỡ vất vả nhiều.';
  say('Mẹ',voice('me',t),ch);
}
export function talkCha(){
  const a=age(),b=S.buffalo;
  if(S.quests.trau==='active'&&b.st==='follow'&&Math.hypot(b.x-S.x,b.y-S.y)<4){b.st='pen';b.stop=false;b.x=PEN.x;b.y=PEN.y;b.tracks=[];doneQuest('trau');gain('tieng',1);gain('tien',3);return say('Cha',(b.bolts?'Nghe nói con làm nó giật mình chạy mấy bận mà vẫn tìm về được. ':'')+'Giỏi lắm! Không có trâu thì nhà mình không cày được. Cầm lấy mấy quan tiền mà tiêu.')}
  if(a>=7&&!S.quests.trau){startQuest('trau');loseBuffalo();return say('Cha','Sáng nay con trâu đứt thừng, giẫm nát cả bờ ruộng rồi chạy vào rừng phía tây. Con lần theo dấu chân nó mà tìm. Nhớ là trâu nhát lắm, lại gần thì đi khẽ thôi.')}
  if(a<8)return say('Cha','Ruộng nhà mình đây. Tám tuổi con ra phụ cha được rồi.');
  {const pc=prepChoice('catThoc');if(pc)return say('Cha','Giặc mà sang thì thóc trong kho khó giữ. Hay nhà mình thuê người gánh bớt vào rừng, chôn kỹ từ bây giờ?',[pc])}
  if(S.flags.daumua&&S.year<1281)return say('Cha',S.flags.daumua==='cham'?'Năm dịch, con bỏ cả việc để ngồi bên giường cha. Cha nhớ mãi.':S.flags.daumua==='nam'?'Thang thuốc nam con sắc năm ấy, hàng xóm còn nhắc mãi.':S.flags.daumua==='muon'?'Chân cha giờ yếu lắm, ra đồng một lúc đã phải ngồi nghỉ. Nhưng còn sống là quý rồi con ạ.':'Nhờ thuốc của người Tống mà cha qua khỏi. Con biết lo xa lắm.');
  say('Cha',voice('cha',['Xuân thì cấy, hạ làm cỏ, thu gặt, đông cày ải. Đứng trên ruộng rồi bấm E mà làm.','Năm nào nước sông lên to là lo lắm. Phải giữ đê cho chắc.','Được mùa thì phải nhớ để dành thóc giống.'][S.season%3]));
}
export function talkThay(){
  const a=age(),ch=[];
  if(S.quests.hoc==='active'){doneQuest('hoc');gain('van',2)}
  const hoc=k=>startWriting(q=>{gain('van',k*(dailyReward(2,q)+(S.thayBonus?1:0)),true);toast(vanLesson())});
  ch.push({label:'Học chữ',note:'−1 Sức · tập viết · +Văn',fn:()=>{if(!spend())return;hoc(1)}},...allSuc('Học chữ',hoc));
  ch.push(...chainChoices('thay'));
  if(a>=12&&!S.quests.sach)ch.push({label:'Thầy có cần con giúp gì không?',fn:()=>{startQuest('sach');say('Thầy đồ Chu','Bộ Tứ thư của thầy mối mọt hết rồi. Trong kinh thành có hàng sách bán bản mới, giá sáu quan. Con mua giúp thầy được không?')}});
  if(S.quests.sach==='active'&&has('Tứ thư'))ch.push({label:'Biếu thầy bộ Tứ thư',fn:()=>{S.items=S.items.filter(i=>i!=='Tứ thư');doneQuest('sach');S.thayBonus=true;gain('van',5);gain('duc',1);say('Thầy đồ Chu','Quý hóa quá! Từ nay thầy kèm riêng cho con. Từ nay mỗi buổi học con tiến nhanh hơn, đi thi sẽ vững vàng hơn.')}});
  say('Thầy đồ Chu',voice('thay',S.path==='van'?'Học trò của thầy đã vào Quốc học viện rồi. Thầy mừng lắm.':S.flags.dieu==='di'&&a<12?'Hôm trước trò trốn học đi thả diều phải không? Lần này thầy bỏ qua.':a<10?'Muốn biết chữ thì phải chăm. Mỗi lần đến, thầy dạy con một bài.':'Học để hiểu đạo lý, không phải chỉ để thi đỗ đâu con.'),ch);
}
export function talkVo(){
  if(age()<8)return say('Lão võ sư Hoàng','Tay chân còn mềm lắm. Đợi tám tuổi hẵng đến đây, ta dạy cho.');
  const n=(S.path==='vo'?3:2)+(has('Kiếm sắt')?1:0);
  const luyen=k=>startDrill(q=>{gain('vo',k*dailyReward(n,q,5/6),true);if(!S.theTrain){S.theTrain=true;gainThe(1,90)}toast(voLesson())});
  const ch=[{label:S.path==='vo'?'Tập trận':'Luyện võ',note:'−1 Sức · +Võ'+(S.theTrain?'':' · khỏe lên'),fn:()=>{if(!spend())return;luyen(1)}},...allSuc(S.path==='vo'?'Tập trận':'Luyện võ',luyen)];
  // Võ 60: luyện trai làng thành đội, ba buổi (mỗi mùa một buổi); đêm giặc đến trai làng ra đòn nhanh hơn
  const dv=S.flags.doi||0,now=S.year*4+S.season;
  if((voTeach()||S.career.doi)&&age()>=18&&dv<3)ch.push({label:`Luyện trai làng thành đội (${dv}/3)`,note:S.doiAt===now?'mùa này đã luyện':'−1 Sức · +1 Tiếng'+(S.career.doi?' · việc của đội trưởng':' · cần Võ 60'),disabled:S.doiAt===now,fn:()=>{if(!spend())return;S.doiAt=now;S.flags.doi=dv+1;gain('tieng',1);
    toast(dv+1>=3?'Ba buổi tập xong, trai làng đã biết giữ hàng, đánh theo hiệu lệnh. Đêm giặc đến, họ sẽ ra đòn nhanh hơn.':'Bạn cho trai làng tập giữ hàng, tiến lui theo tiếng mõ. Lão võ sư đứng xem, gật gù.',4600)}});
  say('Lão võ sư Hoàng',voice('vosu',dv>=3?'Trò luyện trai làng thành đội ra dáng lắm. Võ truyền đi được thì làng mới vững.':S.path==='vo'?'Hương binh thì phải luyện mỗi ngày. Người phương bắc chưa bao giờ thôi dòm ngó nước ta.':'Võ không phải để bắt nạt người. Võ để giữ làng, giữ nước.'),ch);
}
export function talkSu(){const now=S.year*4+S.season,done=S.chua===now;say('Sư cụ',voice('su','A Di Đà Phật. Chùa nhỏ nhưng cửa luôn mở. Con có muốn ngồi nghe kinh một lát không?'),[{label:'Thắp hương, nghe giảng',note:done?'mùa này đã đến':S.duc>=DUC_CHUA_CAP?'−1 Sức · lòng nhẹ nhõm':'−1 Sức · +1 Đức · mỗi mùa một lần',disabled:done,fn:()=>{if(!spend())return;S.chua=now;if(S.duc<DUC_CHUA_CAP)gain('duc',1);toast(pickR(['Sư cụ giảng về lòng từ bi.','Bạn quét sân chùa, lòng nhẹ nhõm.','Tiếng chuông chiều vang khắp xóm.']))}},
  ...(age()>=12&&!knows('thuoc')?[{label:'Học sư cụ cách dùng cây thuốc',note:done?'mùa này đã đến':'−1 Sức · học nghề thuốc nam',disabled:done,fn:()=>{if(!spend())return;S.chua=now;
    // nhớ đúng thứ tự cây sư cụ chỉ mới tính một bước nghề
    startWriting(q=>{if(q>=1){practice('thuoc');toast(pickR(['Sư cụ chỉ cho bạn lá ngải cứu, lá tía tô, cách sắc thuốc giải cảm.','Sư cụ dạy bạn đắp lá giã nát lên vết thương cho cầm máu.','Bạn theo sư cụ ra vườn chùa nhận mặt từng loại lá.']),4600)}else toast('Bạn nhầm lá ngải với lá cúc tần. Sư cụ cười: "Mai lại ra vườn." (chưa tính vào nghề)',4600)},
      {title:'Nhận mặt cây thuốc',kicker:'Vườn thuốc nhà chùa',intro:'Sư cụ chỉ lần lượt từng luống cây thuốc. Nhớ thứ tự hướng sư cụ chỉ, rồi đi lại đúng thứ tự bằng <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>. Đạt từ khá trở lên mới tính vào nghề.'})}}]:[])])}
export function talkBaTu(){
  if(!S.quests.ca){startQuest('ca');return say('Bà Tư',age()<14?'Cháu ngoan. Bà già rồi, không ra sông được, thèm bát canh cá quá. Cháu câu giúp bà một con nhé.':'Anh ơi, bà già rồi, không ra sông được, thèm bát canh cá quá. Anh câu giúp bà một con nhé.')}
  if(S.quests.ca==='active'&&has('Cá')){S.items.splice(S.items.indexOf('Cá'),1);doneQuest('ca');gain('duc',2);gain('tien',1);S.rel.thao++;return say('Bà Tư','Ôi con cá rô to quá! Bà nấu canh chua ngay. '+(age()<14?'Cầm quan tiền này mua kẹo nhé.':'Bà gửi quan tiền, anh cầm lấy cho bà vui.'))}
  say('Bà Tư',voice('batu',S.thao==='wife'?'Giao con Thảo cho cháu, bà yên lòng nhắm mắt được rồi.':age()<14?'Lớn nhanh quá, mới ngày nào còn để chỏm.':'Làng mình may có những đứa như cháu.'));
}
export function talkThao(){
  if(S.thao==='wife')return say('Thảo',voice('thao',S.year>=1282?'Nghe tin giặc sắp sang, em lo lắm. Có chuyện gì, anh nhớ lo cho mẹ và con trước.':S.child?'Bé Sen hôm nay biết gọi bà nội rồi đấy anh.':'Em đã quen việc nhà mình rồi. Anh cứ yên tâm lo việc ngoài.'));
  if(S.thao==='co')return say('Thảo','Anh Cò nhà em hay nhắc anh lắm. Bạn bè lâu năm, đừng để mất nhau nhé.');
  const ch=[],r=S.rel.thao;
  if(!S.thaoHelped)ch.push({label:'Giúp Thảo gánh nước',note:'−1 Sức · thân thiết hơn',fn:()=>{if(!spend())return;S.thaoHelped=true;S.rel.thao++;renderHUD();toast('Hai người vừa gánh nước vừa chuyện trò. Thảo cười nhiều hơn.')}});
  if(has('Lụa'))ch.push({label:'Tặng Thảo tấm lụa',note:'thân thiết hơn nhiều',fn:()=>{S.items.splice(S.items.indexOf('Lụa'),1);S.rel.thao+=3;renderHUD();say('Thảo','Lụa của người Tống ở phường Nhai Tuân phải không? Em... em cảm ơn anh.')}});
  ch.push(...chainChoices('thao'));
  if(has('Sỏi trắng'))ch.push({label:'Tặng Thảo hòn sỏi trắng',note:'thân thiết hơn',fn:()=>{S.items.splice(S.items.indexOf('Sỏi trắng'),1);S.rel.thao++;renderHUD();say('Thảo','Tròn như quả trứng... Em sẽ để trên bậu cửa sổ.')}});
  say('Thảo',voice('thao',r<2?'Em là Thảo, cháu bà Tư. Cha mẹ em mất sau năm nước to, em lên đây ở với bà.':r<5?'Hôm nay anh lại sang à? Bà em khen anh mãi.':'Anh mà đi xa, em... em sẽ nhớ anh đấy.'),ch);
}
export function talkLy(){
  const ch=[];if(age()>=10)ch.push({label:'Giúp việc làng',note:'−1 Sức · +Tiếng · +1 quan',fn:()=>{if(!spend())return;gain('tieng',3,true);gain('tien',1);toast(pickR(['Bạn cùng trai làng đắp lại đoạn đê.','Bạn giúp dọn sân đình chuẩn bị lễ hội.','Bạn đi báo tin cho các xóm.']))}});
  {const pc=prepChoice('lan');if(pc)ch.push(pc)}
  ch.push(...lyChoices());
  // Văn 50: viết đơn xin quan trên giảm sưu thuế năm mất mùa cho làng (một lần, hư cấu)
  if(vanPetition()&&age()>=16&&!S.flags.don)ch.push({label:'Viết đơn cho làng xin giảm sưu thuế năm mất mùa',note:'−1 Sức · +5 Tiếng · cần Văn 50',fn:()=>{if(!spend())return;S.flags.don=true;gain('tieng',5);
    say('Cụ xã','Chữ nghĩa cháu đâu ra đấy, lý lẽ chặt chẽ. Ta đóng dấu của làng, mai đưa lên huyện. Cả làng phải cảm ơn cháu.')}});
  say('Cụ xã',voice('ly',S.career.xa==='win'?'Việc làng giờ trong tay cháu. Ta già rồi, chỉ ngồi uống nước, ngó trẻ con chơi.':S.flags.dh==='hoa'?'Trước Diên Hồng, cháu lại bảo nên hòa. Ta không trách, nhưng trai làng nghe thế thì nản lòng.':S.year>=1282?'Tin từ kinh thành không lành. Người Nguyên đòi mượn đường sang đánh Chiêm Thành. Làng mình phải sẵn sàng.':S.tieng>=40?'Làng An Phú nhớ công cháu. Có việc gì, trai làng sẵn lòng theo cháu.':S.flags.de==='home'?'Năm nước to, nhà cháu lo dọn đồ, còn đê làng thì vỡ. Ta vẫn nhớ đấy.':'Làng An Phú ta ruộng tốt, người hiền. Ai có sức thì góp sức với làng.'),ch);
}
export function talkCo(){
  const a=age(),ch=[];let t;
  if(S.thao==='co')t='Thảo nhà tớ dạo này hay nhắc cậu đấy. Bạn bè mình chẳng bao giờ phai.';
  else if(S.year>=1282)t=S.rel.co>=4?'Giặc mà sang thì tớ với cậu đứng cùng một hàng.':'Nghe nói con cháu nhà quan đang chiêu mộ người. Tớ muốn đi, ở làng chán lắm.';
  else if(S.flags.rival&&S.thao==='none')t='Chuyện Thảo... thôi, để cô ấy chọn. Nhưng cậu đừng tưởng tớ chịu thua đâu.';
  else if(S.flags.exam==='khoe')t='Ông Thái học sinh lại về làng à? Thôi, tôi đi làm ruộng đây.';
  else t=a<10?'Ê! Chiều nay ra bờ sông bắt cá không? Đừng để mẹ cậu biết đấy.':a<16?'Tớ nghe nói trong kinh thành có chợ to lắm. Lần nào đi rủ tớ với.':'Làm trai phải có chí, cậu nhỉ. Tớ thì chỉ mong ruộng nhà được mùa.';
  if(!S.coPlayed)ch.push({label:a<14?'Rủ Cò đi chơi':'Ngồi uống nước với Cò',note:'−1 Sức · thân thiết hơn',fn:()=>{if(!spend())return;S.coPlayed=true;S.rel.co++;renderHUD();toast(a<14?'Hai đứa lội ruộng bắt cua đến tối mịt.':'Hai người ngồi dưới gốc đa, nói đủ thứ chuyện trên trời dưới biển.')}});
  ch.push(...chainChoices('co'));
  if(has('Dế chọi'))ch.push({label:'Tặng Cò con dế chọi',note:'Cò thân hơn nhiều',fn:()=>{S.items.splice(S.items.indexOf('Dế chọi'),1);S.rel.co+=2;renderHUD();toast('Cò mắt sáng rỡ: "Con này đá thì nhất xóm!"')}});
  say('Cò',voice('co',t),ch);
}
export function talkSach(){
  const ch=[{label:'Mua Tứ thư',note:'6 quan',disabled:S.tien<6||has('Tứ thư'),fn:()=>{S.tien-=6;S.items.push('Tứ thư');renderHUD();toast('Bạn mua một bộ Tứ thư.')}},
    {label:'Mua giấy bút',note:S.paper?'mùa này đã mua':'3 quan · +Văn · mỗi mùa một lần',disabled:S.tien<3||S.paper,fn:()=>{S.tien-=3;S.paper=true;gain('van',2,true)}}];
  if(age()>=14&&!S.path)ch.push({label:'Mua binh thư chép tay',note:'8 quan · +Võ, +Văn · đường võ chỉ cần Võ 12',disabled:S.tien<8||has('Binh thư'),fn:()=>{S.tien-=8;S.items.push('Binh thư');gain('vo',3);gain('van',1);toast('Có binh thư, đến tuổi 16 bạn có thể theo đường võ dù Võ chỉ cần 12.')}});
  say('Chủ hàng sách',voice('sach'),ch);
}
export function talkRen(){if(age()<14)return say('Bác thợ rèn','Lò rèn nóng lắm, nhóc đứng xa ra! Lớn lên rồi hãy quay lại.');
  const pc=prepChoice('giao'),rk=has('Kiếm gỉ')&&!has('Kiếm sắt')?[{label:knows('ren')?'Tự rèn lại thanh kiếm gỉ':'Rèn lại thanh kiếm gỉ',note:knows('ren')?'biết nghề rèn · không mất tiền':'3 quan · thành kiếm sắt',disabled:!knows('ren')&&S.tien<3,fn:()=>{if(!knows('ren'))S.tien-=3;S.items.splice(S.items.indexOf('Kiếm gỉ'),1);S.items.push('Kiếm sắt');S.flags.kiemRen=true;renderHUD();toast('Bác thợ rèn nung đỏ, quai búa cả buổi. Thanh kiếm gỉ sáng loáng trở lại.')}}]:[];say('Bác thợ rèn',pc?'Nghe tin giặc, làng nào cũng đặt rèn giáo. Làng mình có góp không, cậu?':voice('ren','Thanh kiếm này rèn từ sắt tốt, tôi đi tôi lại cả tháng trời.'),[{label:'Mua kiếm sắt',note:'8 quan · đánh mạnh hơn',disabled:S.tien<8||has('Kiếm sắt'),fn:()=>{S.tien-=8;S.items.push('Kiếm sắt');renderHUD();toast('Mỗi lần luyện võ được thêm 1 Võ, và khi đánh nhau ra đòn mạnh hơn.')}},...rk,...(pc?[pc]:[]),
    ...(!knows('ren')?[{label:'Phụ bác quai búa',note:S.renAt===S.year*4+S.season?'mùa này đã phụ':'−1 Sức · +1 quan · học nghề rèn',disabled:S.renAt===S.year*4+S.season,fn:()=>{if(!spend())return;S.renAt=S.year*4+S.season;gain('tien',1);
      // quai búa đúng nhịp búa tạ của bác thợ mới tính một bước nghề (vùng sáng hẹp, không theo Võ)
      startDrill(q=>{if(q>=1){practice('ren');toast(['Bạn gõ búa con theo nhịp búa tạ, không lệch nhát nào.','Bác thợ rèn gật đầu: "Nghe tiếng búa là biết tay có nghề."','Bạn học cách nhìn màu sắt nung mà biết lúc nào đem tôi.','Bác khen: "Tay cậu chắc rồi đấy. Nghề này cậu theo được."','Bạn tự tay tôi một lưỡi liềm.','Bác giao cho bạn rèn nguyên một lưỡi cuốc.'][Math.min(5,(S.nghe.ren||1)-1)],4200)}else toast('Búa lệch nhịp, tóe lửa ra ngoài. Bác thợ rèn lắc đầu: "Hôm nay kéo bễ thôi." (chưa tính vào nghề)',4600)},
        {title:'Quai búa',kicker:'Phụ bác thợ rèn',zw:40,intro:'Bác thợ rèn nện búa tạ, bạn gõ búa con theo. Bấm <kbd>Space</kbd> hoặc <kbd>E</kbd> khi đầu búa ở vùng sáng trên đe. Đạt từ khá trở lên mới tính vào nghề.'})}}]:[])])}
export function talkTong(){
  say('Lái buôn người Tống',voice('tong'),[
    {label:'Mua thuốc bổ',note:S.tonic?'mùa này đã mua':'5 quan · +2 Sức · khỏe lên · mỗi mùa một lần',disabled:S.tien<5||S.tonic,fn:()=>{S.tien-=5;S.tonic=true;gainThe(2,85);S.suc=Math.min(sucMax(),S.suc+2);renderHUD();floatText('+2 Sức','#9fcaa9')}},
    {label:'Mua tấm lụa',note:'7 quan',disabled:S.tien<7||has('Lụa'),fn:()=>{S.tien-=7;S.items.push('Lụa');renderHUD();toast('Một tấm lụa mềm. Biếu mẹ hay tặng ai đó, tùy bạn.')}}]);
}
export function talkLinh(){say('Lính gác',age()<12?'Đứng lại! Trẻ con không được một mình vào kinh. Đợi mười hai tuổi hẵng đến.':voice('linh','Vào đi. Trong kinh thành phải giữ phép tắc, không được chạy nhảy ồn ào.'))}
export function talkHocQuan(){
  if(S.path==='van')return say('Học quan',voice('hocquan',S.dothi?'Thái học sinh mà vẫn chăm đến đây, tốt lắm.':'Sĩ tử của Quốc học viện phải đọc nhiều, viết nhiều.'),(()=>{const hoc=k=>startWriting(q=>{gain('van',k*(dailyReward(3,q)+(S.thayBonus?1:0)),KINH);toast(vanLesson())});return[{label:'Học tại Quốc học viện',note:'−1 Sức · tập viết · +Văn',fn:()=>{if(!spend())return;hoc(1)}},...allSuc('Học',hoc)]})());
  say('Học quan','Quốc học viện lập từ năm Quý Sửu (1253), thờ Khổng Tử, Chu Công, Mạnh Tử, giảng Tứ thư, Lục kinh. Muốn vào học phải giỏi chữ trước đã.');
}
export function talkVoQuan(){
  if(S.path==='vo')return say('Võ quan',voice('voquan','Giảng võ đường lập cùng năm với Quốc học viện. Hương binh giỏi thì được luyện ở đây.'),(()=>{const luyen=k=>startDrill(q=>{gain('vo',k*dailyReward(4+(has('Kiếm sắt')?1:0),q,5/6),KINH);if(q>=1)practice('ngua',k);toast(voLesson())});return[{label:'Luyện tại Giảng võ đường',note:'−1 Sức · +Võ · học cưỡi ngựa',fn:()=>{if(!spend())return;luyen(1)}},...allSuc('Luyện',luyen)]})());
  say('Võ quan','Giảng võ đường lập mùa thu năm Quý Sửu (1253). Chỉ người đã vào quân mới được luyện ở đây.');
}
export {talkNgu} from './ngu.js';   // anh Ngũ: xem ngu.js
export const PEN={x:44.5,y:58.6};
let reachOK=null,hintT=0;
export function walkable(x,y){return x>=0&&y>=0&&x<W&&y<H&&![WA,WR,BI,MO,TR,WL].includes(map[y*W+x])&&!bsolid[y*W+x]}
export function bfs(sx,sy){const prev=new Int32Array(W*H).fill(-2),s=sy*W+sx;prev[s]=-1;const q=[s];let h=0;while(h<q.length){const i=q[h++],x=i%W,y=(i/W)|0;for(const[a,c]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+c,j=ny*W+nx;if(prev[j]===-2&&walkable(nx,ny)&&!locked(S,nx,ny)){prev[j]=i;q.push(j)}}}return prev}   // chỉ trong các vùng đã mở
export function hideSpots(){if(!reachOK)reachOK=bfs(43,50);const c=[];
  for(let y=32;y<70;y++)for(let x=6;x<23;x++){if(reachOK[y*W+x]===-2||get(x,y)===PA)continue;let tr=0,road=false;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const t=get(x+dx,y+dy);if(t===TR)tr++;else if(t===PA)road=true}if(tr>=11&&!road)c.push([x,y])}
  if(c.length<3)for(let y=32;y<70;y++)for(let x=6;x<23;x++)if(reachOK[y*W+x]!==-2&&get(x,y)!==PA)c.push([x,y]);return c}
export function pathTo(sx,sy,tx,ty){const prev=bfs(sx,sy),t=ty*W+tx;if(prev[t]===-2)return[];const out=[];for(let i=t;i!==-1;i=prev[i])out.push(i);return out.reverse()}
function sendBuffalo(fx,fy,minD,maxD){const b=S.buffalo,sp=hideSpots();let pool=sp.filter(([x,y])=>{const d=Math.hypot(x-fx,y-fy);return d>=minD&&d<=maxD});if(!pool.length)pool=sp;
  const[hx,hy]=pool[Math.floor(Math.random()*pool.length)],path=pathTo(Math.floor(fx),Math.floor(fy),hx,hy);
  b.run=path;b.ri=0;b.st='run';b.tracks=(b.tracks||[]).concat(path.filter((_,i)=>i%2===1).map(i=>[i%W,(i/W)|0]))}
export function loseBuffalo(){const b=S.buffalo;b.tracks=[];b.bolts=0;b.stop=false;b.x=PEN.x;b.y=PEN.y;sendBuffalo(PEN.x,PEN.y,14,60);
  const last=b.run[b.run.length-1];if(last!=null){b.x=last%W+.5;b.y=((last/W)|0)+.6}b.st='lost';b.run=null}
export function buffaloUpdate(dt){const b=S.buffalo,d=Math.hypot(S.x-b.x,S.y-b.y);
  if(b.st==='run'&&b.run){const i=b.run[b.ri];if(i==null){b.st='lost';b.run=null;return}const tx=i%W+.5,ty=((i/W)|0)+.6,dx=tx-b.x,dy=ty-b.y,dd=Math.hypot(dx,dy);
    if(dd<.15)b.ri++;else{const [mx,my]=step4(b,tx,ty,6*dt);b.x+=mx;b.y+=my;if(Math.abs(mx)>1e-4)b.dir=mx>0?'right':'left'}return}
  if(b.st==='lost'&&S.quests.trau==='active'){
    if(d<3.6&&P.moving&&keys.shift&&(b.bolts||0)<2){b.bolts=(b.bolts||0)+1;sendBuffalo(b.x,b.y,6,14);toast('Con trâu giật mình, rống lên rồi chạy mất vào rừng sâu! Lại gần thì đi chậm thôi, đừng giữ Shift.',4600);return}
    hintT-=dt;if(hintT<=0&&d<11){hintT=6;const dir=Math.abs(b.x-S.x)>Math.abs(b.y-S.y)?(b.x>S.x?'phía đông':'phía tây'):(b.y>S.y?'phía nam':'phía bắc');
      toast(d<4?'Tiếng mõ trâu lốc cốc ngay sát đây!':d<7?`Bạn nghe tiếng mõ trâu khá gần, ở ${dir}.`:`Văng vẳng tiếng mõ trâu đâu đó ${dir}.`,3000)}
    return}
  if(b.st==='follow'){
    if(!b.stop){b.gz=(b.gz??8)-dt;if(b.gz<=0){b.stop=true;toast('Con trâu dừng lại gặm cỏ, nhất định không đi. Lại gần bấm E để kéo thừng.',4000)}}
    if(!b.stop&&d>1.4){const [mx,my]=step4(b,S.x,S.y,Math.min(d-1.3,4.2*dt*(keys.shift?1.6:1))),nx=b.x+mx,ny=b.y+my;if(Math.abs(mx)>1e-4)b.dir=mx>0?'right':'left';if(!solidAt(nx,ny)){b.x=nx;b.y=ny}else if(d>6){b.x=S.x-.8;b.y=S.y}}
    if(b.stop&&d>9){b.stop=false;b.st='lost';b.bolts=2;toast('Bạn bỏ con trâu lại quá xa, nó lại lang thang mất rồi. Quay lại tìm đi!',4200)}}}
export function buffaloLabel(){const b=S.buffalo;if(b.st==='lost')return S.quests.trau==='active'?'Nắm thừng dắt trâu':null;if(b.st==='follow')return b.stop?'Kéo thừng':null;if(b.st==='pen')return'Xem con trâu';return null}
export function talkBuffalo(){const b=S.buffalo;
  if(b.st==='lost'){b.st='follow';b.stop=false;b.gz=6+Math.random()*5;b.tracks=[];toast('Bạn nắm được sợi thừng! Dắt trâu về chỗ cha ngoài ruộng. Trâu hay dừng lại gặm cỏ, nhớ kéo thừng.',4600);return}
  if(b.st==='follow'&&b.stop){b.stop=false;b.gz=6+Math.random()*6;floatAt('Ọ ọ!',b.x,b.y,'#e2bf72');return}
  say('Con trâu',age()<7?'Con trâu nhà mình đang thong thả gặm cỏ bên bờ ruộng. Nó to gấp mấy lần bạn.':'Con trâu nhà mình. Ọ ọ...')}
export function drawTracks(){if(!S)return;const b=S.buffalo;if(!b.tracks||!b.tracks.length||b.st==='pen'||b.st==='follow')return;
  for(let k=0;k<b.tracks.length;k++){const[x,y]=b.tracks[k],d=Math.hypot(x+.5-S.x,y+.5-S.y);if(d>6)continue;ctx.fillStyle=`rgba(58,40,22,${(1-d/6)*.75})`;
    const px=x*TS+8+(k%2?3:-3),py=y*TS+8;ctx.fillRect((px-2)*Z-camX,(py-2)*Z-camY,2*Z,2*Z);ctx.fillRect((px+1)*Z-camX,(py-2)*Z-camY,2*Z,2*Z);ctx.fillRect((px-1)*Z-camX,(py+3)*Z-camY,Z,Z);ctx.fillRect((px+1)*Z-camX,(py+3)*Z-camY,Z,Z)}}
export function doorAction(b){
  if(b.id==='home')return say('Nhà mình','Gian nhà tranh ba gian, vách đất, có bàn thờ tổ tiên ở giữa.',[
    {label:'Ngủ, sang mùa mới',fn:()=>advance(1)},...homeChoices(),{label:'Chọn việc chính, cho thời gian trôi',note:'đến chuyện quan trọng tiếp theo',fn:chooseFocus},{label:'Lưu game',fn:()=>{save();toast('Đã lưu. Lần sau mở game chọn "Tiếp tục".')}}]);
  if(b.id==='cung')return say('Hoàng thành','Cổng Hoàng thành canh gác nghiêm ngặt. Bên trong là cung điện của vua Trần. Dân thường không được vào.');
  if(b.id==='thap')return say('Tháp Báo Thiên','Ngọn tháp cao nhất kinh thành. Toàn thư chép: mùa thu tháng 8 năm Mậu Ngọ (1258), năm bạn ra đời, gió to làm đỉnh tháp rơi xuống.');
  if(b.id==='chua')return talkSu();
  if(b.id==='dinh'){const V=vatState();return say('Đình làng',vatOpen()?'Sân đình mở hội xuân. Trống chầu thùng thùng, sới vật đã khoanh vôi, trai các làng cởi trần ngồi chờ.':V.do?'Đình làng thờ Thành hoàng. Ở góc sân, các cụ còn treo tấm lụa đỏ giải vật năm nào của bạn.':'Đình làng thờ Thành hoàng, là nơi dân làng họp bàn việc chung.',
    vatOpen()?[{label:`Vào sới vật (gặp ${VAT_OPP[V.lv].name})`,note:'mỗi năm một keo · thắng ba đô thì thành đô vật của làng',fn:hoiVat}]:[])}
  if(b.id==='truong'){const tc=truongChoices();return say('Trường làng',tc.length?(S.thay?'Lũ trẻ ngồi chờ trên chiếu. Thầy Chu gật đầu với bạn: "Hôm nay trò giảng nhé."':'Lũ trẻ ngồi chờ trên chiếu, khay cát đã san phẳng. Từ ngày thầy Chu mất, trường làng trông cả vào bạn.'):'Lớp học có mấy chiếc chiếu, khay cát để tập viết. Thầy đồ đang đứng trước cửa.',tc)}
}
/* Tự học ở nhà chậm và có trần: muốn giỏi phải đến lớp, đến sân võ (mỗi mùa ở đó được 8 điểm trở lên). */
const KINH=1.5;   // học, luyện trong kinh thành được gấp rưỡi điểm
/* tự học ở nhà: điểm thô mỗi mùa (qua growth, như việc lặp lại), gần bằng đến lớp cả mùa (đến lớp hơn không quá 1,1 lần) */
const FF_RATE={van:()=>7.6,vo:()=>S.path==='vo'?11:7.6},FF_CAP={van:()=>S.path==='van'?50:30,vo:()=>S.path==='vo'?50:30};
function ffNote(k){const lab=k==='van'?'Văn':'Võ',c=FF_CAP[k]();return S[k]>=c?`tự ${k==='van'?'học':'luyện'} chỉ đến ${c} ${lab}`:`tối đa ${c} ${lab}`}
export function chooseFocus(){const a=age();say('Những năm tới','Bạn dồn sức vào việc gì? Thời gian sẽ trôi cho đến khi có chuyện quan trọng xảy ra. Bạn sẽ bỏ lỡ những lần gặp gỡ bạn bè trong thời gian ấy. Tự học, tự luyện ở nhà tiến bộ chậm; đến lớp thầy đồ hay sân võ thì nhanh hơn nhiều.',[
  {label:'Tự học ở nhà',note:ffNote('van'),fn:()=>fastForward('van')},
  {label:'Tự luyện võ',note:a<8?'cần 8 tuổi':ffNote('vo'),disabled:a<8,fn:()=>fastForward('vo')},
  {label:'Làm ruộng',note:a<8?'cần 8 tuổi':`+${S.path==='nong'?3+fieldBonus():2} quan mỗi mùa`,disabled:a<8,fn:()=>fastForward('tien')},
  {label:'Lo việc làng',note:a<10?'cần 10 tuổi':S.tieng>=TIENG_FF_CAP?`ở nhà lo việc làng chỉ tới ${TIENG_FF_CAP} Tiếng`:`tiến chậm, tối đa ${TIENG_FF_CAP} Tiếng`,disabled:a<10,fn:()=>fastForward('lang')}])}
export function fastForward(k){let n=0;
  for(let i=0;i<60;i++){
    /* mùa đang dở chỉ tính phần Sức còn lại, tránh vừa học ở lớp vừa được cộng thêm */
    const part=i?1:S.suc/sucMax();
    // tự học, lo việc làng ở nhà: chậm như việc lặp lại (growth), lại có trần riêng
    if(k==='van'||k==='vo'){const c=FF_CAP[k]();if(S[k]<c)S[k]=Math.min(c,S[k]+growth(k,FF_RATE[k]()*part,true).d)}
    else if(k==='tien')S.tien+=Math.round((S.path==='nong'?3+fieldBonus():2)*part);else if(S.tieng<TIENG_FF_CAP)S.tieng=Math.min(TIENG_FF_CAP,S.tieng+growth('tieng',4*part,true).d)
    n++;advanceOne();if(modalOpen||S.ended)break}
  if(!modalOpen)nguHint();
  toast(`${n} mùa trôi qua. Bây giờ là ${SEASONS[S.season].toLowerCase()} năm ${canchi(S.year)} (${S.year}), bạn ${age()} tuổi.`,4600);save();renderHUD()}
export function fishAction(){if(!spend())return;
  startFishing(q=>{const ok=q==null?Math.random()<.5:q>=1;if(ok)practice('boi');   // lội xuống gỡ cá mới tính vào nghề bơi
    if(!ok)return toast(q==null?'Ngồi cả buổi mà cá không cắn câu.':'Lần sau canh phao kỹ hơn.');
    if(S.quests.ca==='active'&&!has('Cá')){S.items.push('Cá');renderHUD();toast('Bạn câu được một con cá rô. Mang cho bà Tư thôi!')}
    else if(q===1&&Math.random()<.25){gain('tien',2);toast('Một con cá chép to! Đem bán được hai quan.')}
    else{gain('tien',1);toast('Câu được mấy con cá, đem bán được một quan.')}})}
/* đứng trên ruộng bấm E: còn nhiều Sức thì hỏi làm một buổi hay làm hết Sức */
export function fieldMenu(){if(S.suc<2)return fieldAction();say('Ruộng nhà','Đất đã ngấu, nước vừa ruộng.',[{label:'Làm một buổi',note:'−1 Sức',fn:()=>fieldAction()},...allSuc('Làm đồng',k=>fieldAction(k))])}
/* làm đồng một buổi (k = số buổi gộp lại khi làm hết Sức) */
export function fieldAction(k=1){if(k===1&&!spend())return;const n=Math.max(1,(S.path==='nong'?3+fieldBonus():2)-(trauYeu()?1:0));
  startField(q=>{gain('tien',k*dailyReward(n,q,.875));
    toast(['Bạn cùng cha cấy lúa, lưng mỏi nhừ.','Bạn làm cỏ, tát nước vào ruộng.','Mùa gặt! Lúa vàng trĩu bông.','Bạn cày ải, phơi đất cho vụ sau.'][S.season])})}
