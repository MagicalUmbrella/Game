/* ================= dialogs ================= */
import {H,MO,PA,SEASONS,TR,TS,W,WA,WL,WR,Z,canchi,ctx} from './constants.js';
import {bsolid,get,map} from './map.js';
import {P,S,age,has,save} from './state.js';
import {doneQuest,floatAt,floatText,gain,modalOpen,renderHUD,say,spend,startQuest,toast} from './ui.js';
import {advance,advanceOne} from './events.js';
import {keys,solidAt} from './input.js';
import {camX,camY} from './render.js';

export const pickR=a=>a[Math.floor(Math.random()*a.length)];
function vanLesson(){const v=S.van;return v<10?'Thầy dạy chữ trên khay cát, từng nét một.':v<25?'Thầy giảng sách dạy đạo làm người.':v<45?'Bạn đọc Luận ngữ, tập viết văn sách.':v<70?'Bạn học Kinh Thi, Kinh Thư, bình luận chuyện xưa.':'Bạn đọc Đại Việt sử ký, bàn về phép trị nước.'}
function voLesson(){const v=S.vo;return v<10?'Đứng tấn đến run cả chân.':v<25?'Tập côn pháp, múa gậy quanh sân.':v<45?'Tập đao pháp đến mỏi tay.':v<70?'Tập cưỡi ngựa, bắn cung.':'Học bày trận, đọc binh thư.'}
export function talkMe(){
  const a=age(),ch=[];
  if(!S.quests.hoc){startQuest('hoc');return say('Mẹ','Con lên sáu rồi, phải đi học chữ thôi. Trường làng ở phía tây bắc, ngay dưới đình làng. Con đến chào thầy đồ Chu nhé.')}
  if(!S.ate)ch.push({label:'Ăn cơm mẹ nấu',note:'+1 Sức',fn:()=>{S.ate=true;S.suc=Math.min(4,S.suc+1);renderHUD();floatText('+1 Sức','#9fcaa9');toast('Cơm gạo mới, canh rau, cà muối. Bạn thấy khỏe hẳn.')}});
  if(S.year>=1275&&a>=17&&!S.quests.lua)startQuest('lua');
  if(S.quests.lua==='active'&&has('Lụa'))ch.push({label:'Biếu mẹ tấm lụa',fn:()=>{S.items.splice(S.items.indexOf('Lụa'),1);doneQuest('lua');gain('duc',4);say('Mẹ','Lụa đẹp quá con ạ. Mẹ để dành may áo đi lễ chùa.')}});
  let t;
  if(!S.cha)t=S.year<1280?'Từ ngày cha con mất, nhà mình vắng hẳn. Mẹ chỉ còn mỗi con thôi.':'Mẹ già rồi. Mỗi lần thắp hương cho cha con, mẹ lại kể chuyện con cho ông ấy nghe.';
  else if(S.thao==='wife')t=S.child?'Bé Sen giống con hồi nhỏ như đúc. Mẹ trông cháu, hai đứa cứ yên tâm làm ăn.':'Có Thảo về làm dâu, mẹ đỡ hẳn. Con bé chịu khó lắm.';
  else if(S.flags.de==='lost'&&S.year<1272)t='Năm nay mất mùa, nhà mình ăn độn khoai. Con chịu khó nhé.';
  else t=a<10?'Đi chơi thì đừng ra gần sông một mình nhé con.':a<16?'Con lớn nhanh quá. Cha con bảo ra đồng phụ được rồi đấy.':S.path==='vo'?'Mẹ may thêm cho con cái áo. Tập luyện thì giữ sức khỏe.':S.path==='van'?'Học hành trên kinh có vất vả không con? Nhớ về thăm nhà.':'Có con ở nhà, cha mẹ đỡ vất vả nhiều.';
  say('Mẹ',t,ch);
}
export function talkCha(){
  const a=age(),b=S.buffalo;
  if(S.quests.trau==='active'&&b.st==='follow'&&Math.hypot(b.x-S.x,b.y-S.y)<4){b.st='pen';b.stop=false;b.x=PEN.x;b.y=PEN.y;b.tracks=[];doneQuest('trau');gain('duc',3);gain('tien',3);return say('Cha',(b.bolts?'Nghe nói con làm nó giật mình chạy mấy bận mà vẫn tìm về được. ':'')+'Giỏi lắm! Không có trâu thì nhà mình không cày được. Cầm lấy mấy quan tiền mà tiêu.')}
  if(a>=7&&!S.quests.trau){startQuest('trau');loseBuffalo();return say('Cha','Sáng nay con trâu đứt thừng, giẫm nát cả bờ ruộng rồi chạy vào rừng phía tây. Con lần theo dấu chân nó mà tìm. Nhớ là trâu nhát lắm, lại gần thì đi khẽ thôi.')}
  if(a<8)return say('Cha','Ruộng nhà mình đây. Tám tuổi con ra phụ cha được rồi.');
  if(S.flags.daumua&&S.year<1281)return say('Cha',S.flags.daumua==='cham'?'Năm dịch, con bỏ cả việc để ngồi bên giường cha. Cha nhớ mãi.':'Nhờ thuốc của người Tống mà cha qua khỏi. Con biết lo xa lắm.');
  say('Cha',['Xuân thì cấy, hạ làm cỏ, thu gặt, đông cày ải. Đứng trên ruộng rồi bấm E mà làm.','Năm nào nước sông lên to là lo lắm. Phải giữ đê cho chắc.','Được mùa thì phải nhớ để dành thóc giống.'][S.season%3]);
}
export function talkThay(){
  const a=age(),ch=[];
  if(S.quests.hoc==='active'){doneQuest('hoc');gain('van',2)}
  ch.push({label:'Học chữ',note:'−1 Sức · +Văn',fn:()=>{if(!spend())return;gain('van',2+(S.thayBonus?1:0));toast(vanLesson())}});
  if(a>=12&&!S.quests.sach)ch.push({label:'Thầy có cần con giúp gì không?',fn:()=>{startQuest('sach');say('Thầy đồ Chu','Bộ Tứ thư của thầy mối mọt hết rồi. Trong kinh thành có hàng sách bán bản mới, giá sáu quan. Con mua giúp thầy được không?')}});
  if(S.quests.sach==='active'&&has('Tứ thư'))ch.push({label:'Biếu thầy bộ Tứ thư',fn:()=>{S.items=S.items.filter(i=>i!=='Tứ thư');doneQuest('sach');S.thayBonus=true;gain('van',5);gain('duc',2);say('Thầy đồ Chu','Quý hóa quá! Từ nay thầy kèm riêng cho con. Mỗi buổi học con được thêm một điểm Văn, và đi thi sẽ vững vàng hơn.')}});
  say('Thầy đồ Chu',S.path==='van'?'Học trò của thầy đã vào Quốc học viện rồi. Thầy mừng lắm.':S.flags.dieu==='di'&&a<12?'Hôm trước trò trốn học đi thả diều phải không? Lần này thầy bỏ qua.':a<10?'Muốn biết chữ thì phải chăm. Mỗi lần đến, thầy dạy con một bài.':'Học để hiểu đạo lý, không phải chỉ để thi đỗ đâu con.',ch);
}
export function talkVo(){
  if(age()<8)return say('Lão võ sư Hoàng','Tay chân còn mềm lắm. Đợi tám tuổi hẵng đến đây, ta dạy cho.');
  const n=(S.path==='vo'?3:2)+(has('Kiếm sắt')?1:0);
  say('Lão võ sư Hoàng',S.path==='vo'?'Hương binh thì phải luyện mỗi ngày. Người phương bắc chưa bao giờ thôi dòm ngó nước ta.':'Võ không phải để bắt nạt người. Võ để giữ làng, giữ nước.',[{label:S.path==='vo'?'Tập trận':'Luyện võ',note:'−1 Sức · +Võ',fn:()=>{if(!spend())return;gain('vo',n);toast(voLesson())}}]);
}
export function talkSu(){say('Sư cụ','A Di Đà Phật. Chùa nhỏ nhưng cửa luôn mở. Con có muốn ngồi nghe kinh một lát không?',[{label:'Thắp hương, nghe giảng',note:'−1 Sức · +Đức',fn:()=>{if(!spend())return;gain('duc',2);toast(pickR(['Sư cụ giảng về lòng từ bi.','Bạn quét sân chùa, lòng nhẹ nhõm.','Tiếng chuông chiều vang khắp xóm.']))}}])}
export function talkBaTu(){
  if(!S.quests.ca){startQuest('ca');return say('Bà Tư','Cháu ngoan. Bà già rồi, không ra sông được, thèm bát canh cá quá. Cháu câu giúp bà một con nhé.')}
  if(S.quests.ca==='active'&&has('Cá')){S.items.splice(S.items.indexOf('Cá'),1);doneQuest('ca');gain('duc',3);gain('tien',1);S.rel.thao++;return say('Bà Tư','Ôi con cá rô to quá! Bà nấu canh chua ngay. Cầm quan tiền này mua kẹo nhé.')}
  say('Bà Tư',S.thao==='wife'?'Giao con Thảo cho cháu, bà yên lòng nhắm mắt được rồi.':age()<14?'Lớn nhanh quá, mới ngày nào còn để chỏm.':'Làng mình may có những đứa như cháu.');
}
export function talkThao(){
  if(S.thao==='wife')return say('Thảo',S.year>=1282?'Nghe tin giặc sắp sang, em lo lắm. Có chuyện gì, anh nhớ lo cho mẹ và con trước.':S.child?'Bé Sen hôm nay biết gọi bà nội rồi đấy anh.':'Em đã quen việc nhà mình rồi. Anh cứ yên tâm lo việc ngoài.');
  if(S.thao==='co')return say('Thảo','Anh Cò nhà em hay nhắc anh lắm. Bạn bè lâu năm, đừng để mất nhau nhé.');
  const ch=[],r=S.rel.thao;
  if(!S.thaoHelped)ch.push({label:'Giúp Thảo gánh nước',note:'−1 Sức · thân thiết hơn',fn:()=>{if(!spend())return;S.thaoHelped=true;S.rel.thao++;renderHUD();toast('Hai người vừa gánh nước vừa chuyện trò. Thảo cười nhiều hơn.')}});
  if(has('Lụa'))ch.push({label:'Tặng Thảo tấm lụa',note:'thân thiết hơn nhiều',fn:()=>{S.items.splice(S.items.indexOf('Lụa'),1);S.rel.thao+=3;renderHUD();say('Thảo','Lụa của người Tống ở phường Nhai Tuân phải không? Em... em cảm ơn anh.')}});
  say('Thảo',r<2?'Em là Thảo, cháu bà Tư. Bố mẹ em mất sau năm nước to, em lên đây ở với bà.':r<5?'Hôm nay anh lại sang à? Bà em khen anh mãi.':'Anh mà đi xa, em... em sẽ nhớ anh đấy.',ch);
}
export function talkLy(){
  const ch=[];if(age()>=10)ch.push({label:'Giúp việc làng',note:'−1 Sức · +Đức · +1 quan · làng quý',fn:()=>{if(!spend())return;S.flags.lang++;gain('duc',2);gain('tien',1);toast(pickR(['Bạn cùng trai làng đắp lại đoạn đê.','Bạn giúp dọn sân đình chuẩn bị lễ hội.','Bạn đi báo tin cho các xóm.']))}});
  const L=S.flags.lang;
  say('Cụ lý trưởng',S.flags.dh==='hoa'?'Trước Diên Hồng, cháu lại bảo nên hòa. Ta không trách, nhưng trai làng nghe thế thì nản lòng.':S.year>=1282?'Tin từ kinh thành không lành. Người Nguyên đòi mượn đường sang đánh Chiêm Thành. Làng mình phải sẵn sàng.':L>=6?'Làng An Phú nhớ công cháu. Có việc gì, trai làng sẵn lòng theo cháu.':S.flags.de==='home'?'Năm nước to, nhà cháu lo dọn đồ, còn đê làng thì vỡ. Ta vẫn nhớ đấy.':'Làng An Phú ta ruộng tốt, người hiền. Ai có sức thì góp sức với làng.',ch);
}
export function talkCo(){
  const a=age(),ch=[];let t;
  if(S.thao==='co')t='Thảo nhà tớ dạo này hay nhắc cậu đấy. Bạn bè mình chẳng bao giờ phai.';
  else if(S.year>=1282)t=S.rel.co>=4?'Giặc mà sang thì tớ với cậu đứng cùng một hàng.':'Nghe nói con cháu nhà quan đang chiêu mộ người. Tớ muốn đi, ở làng chán lắm.';
  else if(S.flags.rival&&S.thao==='none')t='Chuyện Thảo... thôi, để cô ấy chọn. Nhưng cậu đừng tưởng tớ chịu thua đâu.';
  else if(S.flags.exam==='khoe')t='Ông Thái học sinh lại về làng à? Thôi, tôi đi làm ruộng đây.';
  else t=a<10?'Ê! Chiều nay ra bờ sông bắt cá không? Đừng để mẹ cậu biết đấy.':a<16?'Tớ nghe nói trong kinh thành có chợ to lắm. Lần nào đi rủ tớ với.':'Làm trai phải có chí, cậu nhỉ. Tớ thì chỉ mong ruộng nhà được mùa.';
  if(!S.coPlayed)ch.push({label:a<14?'Rủ Cò đi chơi':'Ngồi uống nước với Cò',note:'−1 Sức · thân thiết hơn',fn:()=>{if(!spend())return;S.coPlayed=true;S.rel.co++;renderHUD();toast(a<14?'Hai đứa lội ruộng bắt cua đến tối mịt.':'Hai người ngồi dưới gốc đa, nói đủ thứ chuyện trên trời dưới biển.')}});
  say('Cò',t,ch);
}
export function talkSach(){
  const ch=[{label:'Mua Tứ thư',note:'6 quan',disabled:S.tien<6||has('Tứ thư'),fn:()=>{S.tien-=6;S.items.push('Tứ thư');renderHUD();toast('Bạn mua một bộ Tứ thư.')}},
    {label:'Mua giấy bút',note:'3 quan · +2 Văn',disabled:S.tien<3,fn:()=>{S.tien-=3;gain('van',2)}}];
  if(age()>=14)ch.push({label:'Mua binh thư chép tay',note:'8 quan · +3 Võ · mở đường võ',disabled:S.tien<8||has('Binh thư'),fn:()=>{S.tien-=8;S.items.push('Binh thư');gain('vo',3);gain('van',1);toast('Có binh thư, đến tuổi 16 bạn có thể theo đường võ dù Võ chỉ cần 12.')}});
  say('Chủ hàng sách','Sách chép tay, sách in ván đủ cả. Mua đi cậu, chữ nghĩa không bao giờ thừa.',ch);
}
export function talkRen(){if(age()<14)return say('Bác thợ rèn','Lò rèn nóng lắm, nhóc đứng xa ra! Lớn lên rồi hãy quay lại.');
  say('Bác thợ rèn','Thanh kiếm này rèn từ sắt tốt, tôi đi tôi lại cả tháng trời.',[{label:'Mua kiếm sắt',note:'8 quan · đánh mạnh hơn',disabled:S.tien<8||has('Kiếm sắt'),fn:()=>{S.tien-=8;S.items.push('Kiếm sắt');renderHUD();toast('Mỗi lần luyện võ được thêm 1 Võ, và khi đánh nhau ra đòn mạnh hơn.')}}])}
export function talkTong(){
  say('Lái buôn người Tống','Nhà tôi vượt biển sang đây, được vua cho ở phường Nhai Tuân này. Tôi bán vải lụa và thuốc bắc.',[
    {label:'Mua thuốc bổ',note:'5 quan · +2 Sức',disabled:S.tien<5,fn:()=>{S.tien-=5;S.suc=Math.min(4,S.suc+2);renderHUD();floatText('+2 Sức','#9fcaa9')}},
    {label:'Mua tấm lụa',note:'7 quan',disabled:S.tien<7||has('Lụa'),fn:()=>{S.tien-=7;S.items.push('Lụa');renderHUD();toast('Một tấm lụa mềm. Biếu mẹ hay tặng ai đó, tùy bạn.')}}]);
}
export function talkLinh(){say('Lính gác',age()<12?'Đứng lại! Trẻ con không được một mình vào kinh. Đợi mười hai tuổi hẵng đến.':'Vào đi. Trong kinh thành phải giữ phép tắc, không được chạy nhảy ồn ào.')}
export function talkHocQuan(){
  if(S.path==='van')return say('Học quan',S.dothi?'Thái học sinh mà vẫn chăm đến đây, tốt lắm.':'Sĩ tử của Quốc học viện phải đọc nhiều, viết nhiều.',[{label:'Học tại Quốc học viện',note:'−1 Sức · +3 Văn',fn:()=>{if(!spend())return;gain('van',3+(S.thayBonus?1:0));toast(vanLesson())}}]);
  say('Học quan','Quốc học viện lập từ năm Quý Sửu (1253), thờ Khổng Tử, Chu Công, Mạnh Tử, giảng Tứ thư, Lục kinh. Muốn vào học phải giỏi chữ trước đã.');
}
export function talkVoQuan(){
  if(S.path==='vo')return say('Võ quan','Giảng võ đường lập cùng năm với Quốc học viện. Hương binh giỏi thì được luyện ở đây.',[{label:'Luyện tại Giảng võ đường',note:'−1 Sức · +4 Võ',fn:()=>{if(!spend())return;gain('vo',4+(has('Kiếm sắt')?1:0));toast(voLesson())}}]);
  say('Võ quan','Giảng võ đường lập mùa thu năm Quý Sửu (1253). Chỉ người đã vào quân mới được luyện ở đây.');
}
export function talkNgu(){
  const first=!S.nguMet;S.nguMet=true;
  say('Chàng trai đọc sách',first?'Một chàng trai to khỏe ngồi bên vệ đường đọc sách, thỉnh thoảng lại ngâm nga mấy câu thơ. Anh tên Ngũ, người làng Phù Ủng. Anh bảo làm trai mà chưa lập được công danh thì còn thẹn lắm.':'Anh Ngũ vẫn ngồi đọc sách, miệng ngâm: "Hoành sáo giang sơn cáp kỷ thu..."',
    first?[{label:'Ngồi nghe anh bàn chuyện binh pháp',fn:()=>{gain('vo',2);gain('van',1);toast('Bạn thấy trong lòng sục sôi chí lớn. Anh Ngũ sẽ nhớ mặt bạn.')}}]:[]);
}
const PEN={x:44.5,y:58.6};
let reachOK=null,hintT=0;
function walkable(x,y){return x>=0&&y>=0&&x<W&&y<H&&![WA,WR,MO,TR,WL].includes(map[y*W+x])&&!bsolid[y*W+x]}
function bfs(sx,sy){const prev=new Int32Array(W*H).fill(-2),s=sy*W+sx;prev[s]=-1;const q=[s];let h=0;while(h<q.length){const i=q[h++],x=i%W,y=(i/W)|0;for(const[a,c]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+c,j=ny*W+nx;if(walkable(nx,ny)&&prev[j]===-2){prev[j]=i;q.push(j)}}}return prev}
function hideSpots(){if(!reachOK)reachOK=bfs(43,50);const c=[];
  for(let y=32;y<70;y++)for(let x=6;x<23;x++){if(reachOK[y*W+x]===-2||get(x,y)===PA)continue;let tr=0,road=false;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const t=get(x+dx,y+dy);if(t===TR)tr++;else if(t===PA)road=true}if(tr>=11&&!road)c.push([x,y])}
  if(c.length<3)for(let y=32;y<70;y++)for(let x=6;x<23;x++)if(reachOK[y*W+x]!==-2&&get(x,y)!==PA)c.push([x,y]);return c}
function pathTo(sx,sy,tx,ty){const prev=bfs(sx,sy),t=ty*W+tx;if(prev[t]===-2)return[];const out=[];for(let i=t;i!==-1;i=prev[i])out.push(i);return out.reverse()}
function sendBuffalo(fx,fy,minD,maxD){const b=S.buffalo,sp=hideSpots();let pool=sp.filter(([x,y])=>{const d=Math.hypot(x-fx,y-fy);return d>=minD&&d<=maxD});if(!pool.length)pool=sp;
  const[hx,hy]=pool[Math.floor(Math.random()*pool.length)],path=pathTo(Math.floor(fx),Math.floor(fy),hx,hy);
  b.run=path;b.ri=0;b.st='run';b.tracks=(b.tracks||[]).concat(path.filter((_,i)=>i%2===1).map(i=>[i%W,(i/W)|0]))}
export function loseBuffalo(){const b=S.buffalo;b.tracks=[];b.bolts=0;b.stop=false;b.x=PEN.x;b.y=PEN.y;sendBuffalo(PEN.x,PEN.y,14,60);
  const last=b.run[b.run.length-1];if(last!=null){b.x=last%W+.5;b.y=((last/W)|0)+.6}b.st='lost';b.run=null}
export function buffaloUpdate(dt){const b=S.buffalo,d=Math.hypot(S.x-b.x,S.y-b.y);
  if(b.st==='run'&&b.run){const i=b.run[b.ri];if(i==null){b.st='lost';b.run=null;return}const tx=i%W+.5,ty=((i/W)|0)+.6,dx=tx-b.x,dy=ty-b.y,dd=Math.hypot(dx,dy);
    if(dd<.15)b.ri++;else{const m=Math.min(dd,6*dt);b.x+=dx/dd*m;b.y+=dy/dd*m;if(Math.abs(dx)>.05)b.dir=dx>0?'right':'left'}return}
  if(b.st==='lost'&&S.quests.trau==='active'){
    if(d<3.6&&P.moving&&keys.shift&&(b.bolts||0)<2){b.bolts=(b.bolts||0)+1;sendBuffalo(b.x,b.y,6,14);toast('Con trâu giật mình, rống lên rồi chạy mất vào rừng sâu! Lại gần thì đi chậm thôi, đừng giữ Shift.',4600);return}
    hintT-=dt;if(hintT<=0&&d<11){hintT=6;const dir=Math.abs(b.x-S.x)>Math.abs(b.y-S.y)?(b.x>S.x?'phía đông':'phía tây'):(b.y>S.y?'phía nam':'phía bắc');
      toast(d<4?'Tiếng mõ trâu lốc cốc ngay sát đây!':d<7?`Bạn nghe tiếng mõ trâu khá gần, ở ${dir}.`:`Văng vẳng tiếng mõ trâu đâu đó ${dir}.`,3000)}
    return}
  if(b.st==='follow'){
    if(!b.stop){b.gz=(b.gz??8)-dt;if(b.gz<=0){b.stop=true;toast('Con trâu dừng lại gặm cỏ, nhất định không đi. Lại gần bấm E để kéo thừng.',4000)}}
    if(!b.stop&&d>1.4){const m=Math.min(d-1.3,4.2*dt*(keys.shift?1.6:1)),nx=b.x+(S.x-b.x)/d*m,ny=b.y+(S.y-b.y)/d*m;b.dir=S.x>b.x?'right':'left';if(!solidAt(nx,ny)){b.x=nx;b.y=ny}else if(d>6){b.x=S.x-.8;b.y=S.y}}
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
    {label:'Ngủ, sang mùa mới',fn:()=>advance(1)},{label:'Chọn việc chính, cho thời gian trôi',note:'đến chuyện quan trọng tiếp theo',fn:chooseFocus},{label:'Lưu game',fn:()=>{save();toast('Đã lưu. Lần sau mở game chọn "Tiếp tục".')}}]);
  if(b.id==='cung')return say('Hoàng thành','Cổng Hoàng thành canh gác nghiêm ngặt. Bên trong là cung điện của vua Trần. Dân thường không được vào.');
  if(b.id==='thap')return say('Tháp Báo Thiên','Ngọn tháp cao nhất kinh thành. Toàn thư chép: mùa thu tháng 8 năm Mậu Ngọ (1258), năm bạn ra đời, gió to làm đỉnh tháp rơi xuống.');
  if(b.id==='chua')return talkSu();
  if(b.id==='dinh')return say('Đình làng','Đình làng thờ Thành hoàng, là nơi dân làng họp bàn việc chung.');
  if(b.id==='truong')return say('Trường làng','Lớp học có mấy chiếc chiếu, khay cát để tập viết. Thầy đồ đang đứng trước cửa.');
}
/* Tự học ở nhà chậm và có trần: muốn giỏi phải đến lớp, đến sân võ (mỗi mùa ở đó được 8 điểm trở lên). */
const FF_RATE={van:()=>S.path==='van'?2:1,vo:()=>S.path==='vo'?2:1},FF_CAP={van:()=>S.path==='van'?45:25,vo:()=>S.path==='vo'?45:25};
function ffNote(k){const lab=k==='van'?'Văn':'Võ',c=FF_CAP[k]();return S[k]>=c?`tự ${k==='van'?'học':'luyện'} chỉ đến ${c} ${lab}`:`+${FF_RATE[k]()} ${lab} mỗi mùa, tối đa ${c}`}
export function chooseFocus(){const a=age();say('Những năm tới','Bạn dồn sức vào việc gì? Thời gian sẽ trôi cho đến khi có chuyện quan trọng xảy ra. Bạn sẽ bỏ lỡ những lần gặp gỡ bạn bè trong thời gian ấy. Tự học, tự luyện ở nhà tiến bộ chậm; đến lớp thầy đồ hay sân võ thì nhanh hơn nhiều.',[
  {label:'Tự học ở nhà',note:ffNote('van'),fn:()=>fastForward('van')},
  {label:'Tự luyện võ',note:a<8?'cần 8 tuổi':ffNote('vo'),disabled:a<8,fn:()=>fastForward('vo')},
  {label:'Làm ruộng',note:a<8?'cần 8 tuổi':`+${S.path==='nong'?3:2} quan mỗi mùa`,disabled:a<8,fn:()=>fastForward('tien')},
  {label:'Lo việc làng',note:a<10?'cần 10 tuổi':'+1 Đức mỗi mùa, làng quý hơn',disabled:a<10,fn:()=>fastForward('lang')}])}
export function fastForward(k){let n=0;
  for(let i=0;i<60;i++){
    /* mùa đang dở chỉ tính phần Sức còn lại, tránh vừa học ở lớp vừa được cộng thêm */
    const part=i?1:S.suc/4;
    if(k==='van'||k==='vo'){const c=FF_CAP[k]();if(S[k]<c&&Math.random()<part)S[k]=Math.min(c,S[k]+FF_RATE[k]())}
    else if(k==='tien')S.tien+=Math.round((S.path==='nong'?3:2)*part);else{if(Math.random()<part)S.duc=Math.min(100,S.duc+1);if(i%2)S.flags.lang++}
    n++;advanceOne();if(modalOpen||S.ended)break}
  toast(`${n} mùa trôi qua. Bây giờ là ${SEASONS[S.season].toLowerCase()} năm ${canchi(S.year)} (${S.year}), bạn ${age()} tuổi.`,4600);save();renderHUD()}
export function fishAction(){if(!spend())return;
  if(Math.random()<.62){if(S.quests.ca==='active'&&!has('Cá')){S.items.push('Cá');renderHUD();toast('Bạn câu được một con cá rô. Mang cho bà Tư thôi!')}else{gain('tien',1);toast('Câu được mấy con cá, đem bán được một quan.')}}
  else toast('Cá không cắn câu. Lần sau may hơn.')}
export function fieldAction(){if(!spend())return;const n=S.path==='nong'?3:2;gain('tien',n);if(S.path==='nong')gain('duc',1);
  toast(['Bạn cùng cha cấy lúa, lưng mỏi nhừ.','Bạn làm cỏ, tát nước vào ruộng.','Mùa gặt! Lúa vàng trĩu bông.','Bạn cày ải, phơi đất cho vụ sau.'][S.season])}
