/* ================= chuyện đời thường ================= */
/* Hư cấu. Chuyện nhỏ trong làng chen vào những mùa không có sự kiện lịch sử, để đời không trôi qua
   trống trơn. Mỗi chuyện xảy ra một lần, theo tuổi và mùa; lựa chọn ghi vào S.life[id] (có thể là
   kết quả ngẫu nhiên, ví dụ 'tu_khoi'), có hậu quả về chỉ số, tiền, quan hệ, đôi khi ảnh hưởng chuyện
   khác (lá thuốc, trâu yếu, trai làng được dạy võ), và một dòng ngắn trong biên niên (lifeChronicle).
   maybeLife() được gọi sau mỗi lần sang mùa (events.js), cứ khoảng 1–2 mùa có một chuyện. */
import {S,age,has} from './state.js';
import {gain,renderHUD,showModal,toast} from './ui.js';
import {K} from './events.js';
import {practice} from './nghe.js';
import {gainThe} from './stats.js';

const sucDown=n=>{S.suc=Math.max(0,S.suc-n);renderHUD()};
const useItem=it=>{const i=S.items.indexOf(it);if(i>=0)S.items.splice(i,1)};
const pay=n=>{S.tien=Math.max(0,S.tien-n);renderHUD()};
const roll=p=>Math.random()<p;

/* age: [từ, đến] tuổi; s: mùa (0 Xuân … 3 Đông) nếu chỉ xảy ra mùa đó; when: điều kiện thêm.
   ch: lựa chọn {k, label, note, dis (khóa), show (ẩn), fn (hậu quả; trả về khóa kết quả nếu khác k)}.
   res: lời kể sau khi chọn, theo khóa kết quả. chron: dòng biên niên, theo khóa kết quả. */
export const LIFE=[
  // ---------- tuổi thơ ----------
  {id:'de',age:[7,11],s:1,title:'Bắt dế chọi',body:'Sau trận mưa rào, Cò chạy sang gọi: "Bờ ruộng đầy dế than! Đi bắt con nào to về chọi đi!"',
    ch:[{k:'di',label:'Đi bắt dế với Cò',note:'−1 Sức · Cò thân hơn',fn:()=>{sucDown(1);S.rel.co++}},
        {k:'hoc',label:'Ở nhà ôn bài',note:'+1 Văn',fn:()=>gain('van',1)}],
    res:{di:'Hai đứa bắt được một con dế than cánh bóng, đặt tên là Tướng Quân.'},
    chron:{di:'cùng Cò bắt dế chọi',hoc:'ở nhà ôn bài thay vì đi bắt dế'}},
  {id:'ga',age:[7,12],title:'Con gà mái nhà bà Tư',body:'Bà Tư mất con gà mái đang đẻ. Có người bảo sáng nay thấy thằng Cò lảng vảng sau vườn nhà bà.',
    ch:[{k:'tim',label:'Đi tìm con gà',note:'−1 Sức · +1 Đức · +1 Tiếng',fn:()=>{sucDown(1);gain('duc',1);gain('tieng',1);S.rel.co++}},
        {k:'bene',label:'Đứng ra bênh Cò',note:'Cò thân hơn',fn:()=>{S.rel.co++}},
        {k:'im',label:'Không xen vào',note:'Cò buồn',fn:()=>{S.rel.co=Math.max(0,S.rel.co-1)}}],
    res:{tim:'Bạn tìm thấy con gà đang ấp trứng trong bụi tre. Bà Tư xoa đầu Cò, cho hai đứa mỗi đứa một quả trứng luộc.',bene:'Bà Tư bán tín bán nghi, nhưng Cò nhìn bạn rất lâu.'},
    chron:{tim:'tìm được gà cho bà Tư, minh oan cho Cò',bene:'đứng ra bênh Cò khi bị nghi bắt gà',im:'im lặng khi Cò bị nghi oan'}},
  {id:'ao',age:[8,13],s:1,title:'Tiếng kêu ở bờ ao',body:'Trưa hè, đứa em nhà hàng xóm trượt chân ngã xuống ao, chới với giữa dòng nước.',
    ch:[{k:'nhay',label:'Nhảy xuống kéo lên',note:'+2 Đức · +2 Tiếng · +1 Võ',fn:()=>{gain('duc',2);gain('tieng',2);gain('vo',1);practice('boi',2)}},
        {k:'goi',label:'Chạy đi gọi người lớn',note:'+1 Tiếng',fn:()=>gain('tieng',1)}],
    res:{nhay:'Bạn kéo được đứa bé vào bờ. Mẹ nó khóc, ôm chầm lấy bạn.',goi:'Người lớn chạy ra kịp. Đứa bé uống mấy ngụm nước nhưng không sao.'},
    chron:{nhay:'nhảy xuống ao cứu em bé nhà hàng xóm',goi:'chạy đi gọi người cứu em bé ngã ao'}},
  {id:'phat',age:[7,12],when:()=>S.quests.hoc==='done'&&S.thay,title:'Chép phạt',body:'Bạn nói chuyện trong giờ học. Thầy Chu bắt về chép phạt mười lần bài vừa giảng.',
    ch:[{k:'chep',label:'Chép đủ mười lần',note:'−1 Sức · +2 Văn',fn:()=>{sucDown(1);gain('van',2)}},
        {k:'nho',label:'Nhờ Cò chép hộ một nửa',note:'Cò thân hơn · có thể bị phát hiện',fn:()=>{S.rel.co++;if(roll(.6)){gain('duc',-1);return'nho_lo'}}}],
    res:{nho_lo:'Thầy nhìn qua là nhận ra nét chữ nguệch ngoạc của Cò. Hai đứa bị đứng góc lớp cả buổi.',nho:'Thầy không nhận ra. Cò cười khì: "Lần sau đến lượt cậu chép cho tớ."'},
    chron:{chep:'chép phạt đủ mười lần',nho:'nhờ Cò chép phạt hộ, thầy không biết',nho_lo:'nhờ Cò chép phạt hộ, bị thầy phát hiện'}},
  {id:'banhchung',age:[6,15],s:0,title:'Nồi bánh chưng',body:'Tết đến. Mẹ gói bánh chưng, bắc nồi luộc suốt đêm. Ngoài đình, trai làng dựng cây đu.',
    ch:[{k:'canh',label:'Ngồi canh nồi bánh với mẹ',note:'mẹ vui',fn:()=>{}},
        {k:'du',label:'Chạy ra đình xem đánh đu',note:'+1 Võ',fn:()=>gain('vo',1)}],
    res:{canh:'Mẹ kể chuyện ngày xưa cho bạn nghe đến gần sáng.'},
    chron:{canh:'canh nồi bánh chưng với mẹ đêm ba mươi',du:'Tết năm ấy mải ra đình xem đánh đu'}},
  {id:'ram7',age:[9,30],s:2,title:'Rằm tháng Bảy',body:'Rằm tháng Bảy, nhà nhà cúng cô hồn. Lũ trẻ nhà nghèo đứng ngoài ngõ chờ cướp lộc.',
    ch:[{k:'chia',label:'Mang bánh trái ra chia',note:'−1 quan · +1 Đức · +1 Tiếng',dis:()=>S.tien<1,fn:()=>{pay(1);gain('duc',1);gain('tieng',1)}},
        {k:'giu',label:'Ở nhà phụ mẹ cúng',fn:()=>{}}],
    chron:{chia:'rằm tháng Bảy mang bánh chia cho trẻ nghèo',giu:'rằm tháng Bảy ở nhà phụ mẹ cúng'}},
  {id:'chim',age:[6,11],title:'Con chim sẻ gãy cánh',body:'Bạn nhặt được một con chim sẻ gãy cánh dưới gốc đa, nó run rẩy trong lòng bàn tay.',
    ch:[{k:'nuoi',label:'Mang về nuôi cho lành',note:'−1 Sức · +2 Đức',fn:()=>{sucDown(1);gain('duc',2)}},
        {k:'tha',label:'Đặt lại vào bụi cây',fn:()=>{}}],
    res:{nuoi:'Nửa tháng sau, con sẻ bay được. Sáng nào nó cũng về đậu trên mái nhà.'},
    chron:{nuoi:'nuôi lành con chim sẻ gãy cánh',tha:'để con chim sẻ gãy cánh lại dưới gốc đa'}},
  {id:'chantrau',age:[8,13],when:()=>S.quests.trau==='done',title:'Bãi cỏ ven sông',body:'Dắt trâu ra bãi, bạn gặp lũ trẻ chăn trâu làng bên đòi chiếm bãi cỏ non.',
    ch:[{k:'nhuong',label:'Nhường, dắt trâu đi chỗ khác',note:'+1 Đức',fn:()=>gain('duc',1)},
        {k:'tranh',label:'Đứng ra tranh bãi',note:()=>S.vo>=10?'Võ đủ để giữ bãi':'Võ dưới 10, dễ thua',fn:()=>{if(S.vo>=10){gain('vo',1);return'tranh_thang'}return'tranh_thua'}},
        {k:'co',label:'Gọi Cò ra cùng',note:'Cò thân hơn',fn:()=>{S.rel.co++}}],
    res:{tranh_thang:'Lũ trẻ làng bên rút đi. Từ đó trâu nhà bạn được ăn bãi cỏ non.',tranh_thua:'Bạn bị xô ngã xuống bùn, về nhà mẹ phải giặt áo cả buổi.',co:'Hai đứa đứng cạnh nhau, lũ trẻ làng bên chùn bước.'},
    chron:{nhuong:'nhường bãi cỏ cho trẻ chăn trâu làng bên',tranh_thang:'giữ được bãi cỏ ven sông',tranh_thua:'tranh bãi cỏ với trẻ làng bên, bị xô ngã xuống bùn',co:'cùng Cò giữ bãi cỏ ven sông'}},
  {id:'trungthu',age:[6,13],s:2,title:'Trung thu',body:'Đêm rằm tháng Tám, trăng sáng vằng vặc. Lũ trẻ trong xóm rủ nhau phá cỗ ở sân đình.',
    ch:[{k:'co',label:'Cùng Cò bày cỗ',note:'Cò thân hơn',fn:()=>{S.rel.co++}},
        {k:'me',label:'Ở nhà ngắm trăng với mẹ',note:'mẹ vui',fn:()=>{}}],
    chron:{co:'cùng Cò bày cỗ trông trăng',me:'đêm trung thu ở nhà ngắm trăng với mẹ'}},
  {id:'caotrom',age:[8,12],title:'Ao nhà ông Cả',body:'Cò thì thầm: "Ao nhà ông Cả cá rô nhiều lắm, tối nay đi câu trộm không?"',
    ch:[{k:'di',label:'Đi câu trộm',note:'Cò thân hơn · có thể bị bắt',fn:()=>{S.rel.co++;if(roll(.5)){gain('tieng',-2);gain('duc',-1);return'di_bat'}gain('tien',1)}},
        {k:'khuyen',label:'Khuyên Cò thôi',note:'+1 Đức',fn:()=>gain('duc',1)}],
    res:{di_bat:'Ông Cả cầm gậy đuổi ra tận đầu ngõ. Hôm sau ông sang mách mẹ.',di:'Hai đứa câu được mấy con rô, nướng ăn ngay bờ ao.',khuyen:'Cò bĩu môi nhưng rồi cũng thôi.'},
    chron:{di:'đi câu trộm ao nhà ông Cả với Cò',di_bat:'đi câu trộm ao nhà ông Cả, bị bắt quả tang',khuyen:'khuyên Cò thôi đi câu trộm'}},
  {id:'sachchua',age:[9,13],title:'Quyển sách ở chùa',body:'Quét sân chùa, bạn nhặt được một quyển kinh rách gáy rơi dưới gầm bàn.',
    ch:[{k:'tra',label:'Mang trả sư cụ',note:'+2 Đức',fn:()=>gain('duc',2)},
        {k:'doc',label:'Giấu về đọc',note:'+2 Văn',fn:()=>gain('van',2)}],
    res:{tra:'Sư cụ khâu lại gáy sách, bảo bạn rảnh thì lên chùa đọc.'},
    chron:{tra:'mang trả quyển kinh nhặt được ở chùa',doc:'giấu quyển kinh nhặt được ở chùa về đọc'}},
  {id:'batnat',age:[9,13],title:'Bị bắt nạt',body:'Trên đường đi học về, mấy đứa lớn làng bên chặn đường đòi cái nón của bạn.',
    ch:[{k:'danh',label:'Đánh lại',note:()=>S.vo>=12?'Võ đủ để thắng':'Võ dưới 12, dễ thua',fn:()=>{if(S.vo>=12){gain('vo',1);return'danh_thang'}return'danh_thua'}},
        {k:'nhin',label:'Đưa nón, về kể với cha',note:'+1 Đức',fn:()=>gain('duc',1)}],
    res:{danh_thang:'Mấy đứa kia bỏ chạy. Hôm sau cả lớp nhìn bạn khác hẳn.',danh_thua:'Bạn về nhà với con mắt tím bầm.',nhin:'Cha sang làng bên nói chuyện. Hôm sau cái nón được mang trả.'},
    chron:{danh_thang:'đánh lại mấy đứa lớn bắt nạt',danh_thua:'đánh lại mấy đứa lớn bắt nạt, về nhà tím mắt',nhin:'bị bắt nạt, về nhờ cha phân xử'}},
  // ---------- tuổi thiếu niên ----------
  {id:'moctui',age:[12,17],when:()=>S.tien>=2,title:'Chợ kinh',body:'Đang xem hàng ở chợ phường Nhai Tuân, bạn thấy túi tiền bên hông nhẹ bẫng. Một bóng người lách vội vào đám đông.',
    ch:[{k:'duoi',label:'Đuổi theo',note:()=>S.vo>=15?'Võ đủ để đuổi kịp':'Võ dưới 15, khó đuổi kịp',fn:()=>{if(S.vo>=15){gain('vo',1);return'duoi_kip'}pay(2);return'duoi_truot'}},
        {k:'linh',label:'Kêu lính gác',note:'lấy lại được một nửa',fn:()=>pay(1)}],
    res:{duoi_kip:'Bạn túm được vạt áo kẻ cắp ở đầu ngõ, lấy lại túi tiền.',duoi_truot:'Kẻ cắp lẩn mất. Bạn mất 2 quan.',linh:'Lính gác bắt được hắn nhưng tiền đã tiêu mất một nửa.'},
    chron:{duoi_kip:'đuổi kịp kẻ móc túi ở chợ kinh',duoi_truot:'bị móc túi ở chợ kinh, đuổi không kịp',linh:'bị móc túi ở chợ kinh, nhờ lính gác lấy lại được một nửa'}},
  {id:'vat',age:[13,22],s:0,title:'Sới vật hội làng',body:'Hội làng đầu xuân mở sới vật. Trai các làng bên kéo sang, cởi trần, thắt khố, đấu tay đôi.',
    ch:[{k:'vao',label:'Ra sới',note:()=>S.vo>=25?'Võ đủ để thắng':'Võ dưới 25, khó thắng',fn:()=>{if(S.vo>=25){gain('tien',2);gain('tieng',2);return'vao_thang'}gain('vo',2);return'vao_thua'}},
        {k:'xem',label:'Đứng xem cùng Cò',note:'Cò thân hơn',fn:()=>{S.rel.co++}}],
    res:{vao_thang:'Bạn quật ngã ba đối thủ, được thưởng 2 quan và một tấm khăn đỏ.',vao_thua:'Bạn bị vật ngã ngay hiệp đầu, nhưng học được mấy miếng hay.'},
    chron:{vao_thang:'thắng sới vật hội làng',vao_thua:'ra sới vật hội làng, thua nhưng không nản',xem:'đứng xem hội vật cùng Cò'}},
  {id:'tho',age:[12,17],when:()=>S.thay&&S.quests.hoc==='done',title:'Đề thơ của thầy',body:'Thầy Chu ra đề: "Vịnh cảnh sông Tô Lịch." Cả lớp cắn bút.',
    ch:[{k:'canh',label:'Tả cảnh sông nước',fn:()=>{if(S.van>=30){gain('van',3);gain('tieng',1);return'canh_hay'}gain('van',1)}},
        {k:'nguoi',label:'Tả người đánh cá trên sông',fn:()=>{if(S.van>=30){gain('van',3);gain('tieng',1);return'nguoi_hay'}gain('van',1)}}],
    res:{canh_hay:'Thầy khen bài của bạn trước cả lớp.',nguoi_hay:'Thầy gật gù: "Có lòng thương người thì chữ mới có hồn."',canh:'Thầy chữa từng chữ cho bạn.',nguoi:'Thầy chữa từng chữ cho bạn.'},
    chron:{canh_hay:'được thầy khen bài thơ vịnh sông Tô Lịch',nguoi_hay:'được thầy khen bài thơ về người đánh cá',canh:'làm thơ vịnh sông Tô Lịch',nguoi:'làm thơ về người đánh cá'}},
  {id:'trauom',age:[10,26],when:()=>S.quests.trau==='done',title:'Trâu bỏ ăn',body:'Con trâu nhà mình bỏ ăn mấy hôm, nằm thở dốc trong chuồng. Cha lo lắm.',
    ch:[{k:'lang',label:'Mời thầy lang',note:'3 quan',dis:()=>S.tien<3,fn:()=>pay(3)},
        {k:'thuoc',label:'Dùng lá thuốc hái trong rừng',show:()=>has('Lá thuốc'),fn:()=>{useItem('Lá thuốc');practice('thuoc')}},
        {k:'tu',label:'Tự chữa theo mẹo dân gian',note:'may thì khỏi',fn:()=>{if(roll(.5))return'tu_khoi';S.trauYeu=S.year+1;return'tu_yeu'}}],
    res:{lang:'Thầy lang bốc thuốc, mấy hôm sau trâu ăn lại.',thuoc:'Lá thuốc đắng nhưng hiệu nghiệm. Trâu khỏi hẳn.',tu_khoi:'Trâu khỏi. Cha bảo bạn khéo tay.',tu_yeu:'Trâu qua khỏi nhưng yếu hẳn. Đến hết năm sau, làm đồng được ít đi.'},
    chron:{lang:'mời thầy lang chữa trâu',thuoc:'chữa trâu bằng lá thuốc hái trong rừng',tu_khoi:'tự chữa khỏi cho trâu',tu_yeu:'tự chữa trâu, trâu yếu hẳn một thời gian'}},
  {id:'han',age:[12,30],s:1,title:'Năm hạn',body:'Trời không mưa cả tháng. Ruộng nứt nẻ, lúa bắt đầu héo.',
    ch:[{k:'tat',label:'Thức đêm tát nước cứu lúa',note:'−2 Sức · +3 quan cuối vụ · thức đêm, yếu đi',fn:()=>{sucDown(2);gain('tien',3);gain('vo',1);gainThe(-3)}},
        {k:'bo',label:'Đành chờ mưa',note:'mất nửa vụ (−2 quan) · nhà ăn độn, yếu đi',fn:()=>{pay(2);gainThe(-2)}}],
    chron:{tat:'năm hạn, thức đêm tát nước cứu lúa',bo:'năm hạn, ruộng nhà mất nửa vụ'}},
  {id:'sach',age:[12,30],when:()=>S.tien>=2,title:'Gánh sách cũ',body:'Một ông đồ nghèo gánh sách cũ đi bán qua làng, mời bạn xem.',
    ch:[{k:'mua',label:'Mua một quyển',note:'2 quan · +2 Văn',fn:()=>{pay(2);gain('van',2)}},
        {k:'khong',label:'Lắc đầu',fn:()=>{}}],
    chron:{mua:'mua sách cũ của ông đồ nghèo',khong:null}},
  {id:'thuyen',age:[14,30],title:'Thuyền mắc cạn',body:'Một chiếc thuyền buôn mắc cạn ở bãi sông Hồng. Nhà thuyền hô người ra đẩy giúp.',
    ch:[{k:'day',label:'Ra đẩy thuyền',note:'−1 Sức · +1 Võ · được trả công',fn:()=>{sucDown(1);gain('vo',1);gain('tien',2);practice('boi',2)}},
        {k:'thoi',label:'Mặc kệ',note:'−1 Đức',fn:()=>gain('duc',-1)}],
    chron:{day:'ra bãi sông Hồng đẩy thuyền mắc cạn',thoi:'mặc kệ thuyền buôn mắc cạn'}},
  // ---------- tuổi trưởng thành ----------
  {id:'chay',age:[16,30],s:3,title:'Cháy xóm bên',body:'Đêm hanh khô, nhà ông Cả xóm bên bốc cháy. Gió thổi tàn lửa bay sang cả mái nhà mình.',
    ch:[{k:'dap',label:'Chạy sang dập lửa',note:'−1 Sức · +3 Tiếng · +1 Đức',fn:()=>{sucDown(1);gain('tieng',3);gain('duc',1)}},
        {k:'nha',label:'Ở lại giữ nhà mình',note:'−3 Tiếng',fn:()=>gain('tieng',-3)}],
    res:{dap:'Cả xóm xếp hàng chuyền nước. Gần sáng, lửa tắt. Ông Cả cảm ơn bạn mãi.'},
    chron:{dap:'chạy sang dập lửa cứu nhà ông Cả',nha:'ở lại giữ nhà khi xóm bên cháy'}},
  {id:'trom',age:[17,30],title:'Kẻ trộm thóc',body:'Trai làng bắt được kẻ trộm thóc. Hóa ra là một người làng bên, nhà có ba đứa con đang đói.',
    ch:[{k:'dinh',label:'Giải ra đình cho làng xử',note:'+2 Tiếng · nhà kia đói',fn:()=>gain('tieng',2)},
        {k:'tha',label:'Xin tha, cho ít gạo',note:'−1 quan · +3 Đức · −1 Tiếng, làng chê bạn mềm lòng',dis:()=>S.tien<1,fn:()=>{pay(1);gain('duc',3);gain('tieng',-1)}}],
    chron:{dinh:'giải kẻ trộm thóc ra đình',tha:'xin tha cho kẻ trộm đói, còn cho ít gạo'}},
  {id:'chovay',age:[18,30],when:()=>S.tien>=5&&S.year<=1283,title:'Hàng xóm hỏi vay',body:'Nhà bác Ba bên cạnh có người ốm, sang hỏi vay 5 quan, hẹn sang năm trả.',
    ch:[{k:'cho',label:'Cho vay',note:'−5 quan',fn:()=>{pay(5);S.vayYear=S.year}},
        {k:'khong',label:'Từ chối',note:'−1 Đức',fn:()=>gain('duc',-1)}],
    chron:{cho:null,khong:'từ chối cho hàng xóm vay tiền lúc ốm đau'}},
  {id:'travay',age:[18,40],when:()=>S.life.chovay==='cho'&&S.year>=S.vayYear+1,title:'Món nợ cũ',body:'Một năm đã qua kể từ ngày bác Ba hỏi vay tiền.',
    ch:[{k:'cho',label:'Sang hỏi thăm',fn:()=>{if(roll(.7)){gain('tien',6);return'tra'}return'khong'}},
        {k:'xoa',label:'Thôi, coi như giúp nhà bác',note:'mất 5 quan · +3 Đức',fn:()=>gain('duc',3)}],
    res:{tra:'Bác Ba trả đủ 5 quan, biếu thêm một quan và con gà trống.',khong:'Nhà bác Ba đã dọn đi nơi khác từ lúc nào. Món nợ coi như mất.',xoa:'Bạn không nhắc chuyện tiền. Hôm sau bác Ba sang, đứng ở ngõ mãi mới nói được câu cảm ơn.'},
    chron:{tra:'cho hàng xóm vay tiền lúc ốm đau, được trả đủ',khong:'cho hàng xóm vay tiền, họ dọn đi không trả',xoa:'cho hàng xóm vay tiền rồi xóa nợ cho họ'}},
  {id:'dinh',age:[18,30],s:0,title:'Hội đình',body:'Làng mở hội tế Thành hoàng. Mỗi nhà góp hai quan làm cỗ.',
    ch:[{k:'gop',label:'Góp hai quan',note:'+2 Tiếng',dis:()=>S.tien<2,fn:()=>{pay(2);gain('tieng',2)}},
        {k:'khong',label:'Không góp',note:'−2 Tiếng',fn:()=>gain('tieng',-2)}],
    chron:{gop:'góp tiền làm cỗ hội đình',khong:'không góp tiền hội đình'}},
  {id:'khach',age:[16,30],title:'Khách đêm mưa',body:'Đêm mưa to, một nhà sư đi hành cước gõ cửa xin ngủ nhờ.',
    ch:[{k:'cho',label:'Mời vào, dọn cơm',note:'+2 Đức',fn:()=>{gain('duc',2);S.items.push('Lá thuốc');practice('thuoc')}},
        {k:'tu',label:'Từ chối',fn:()=>{}}],
    res:{cho:'Sáng ra, nhà sư để lại một gói lá thuốc: "Phòng khi người hay vật trong nhà ốm."'},
    chron:{cho:'cho nhà sư đi hành cước ngủ nhờ đêm mưa',tu:'đóng cửa không cho người lạ ngủ nhờ'}},
  {id:'sau',age:[18,30],s:2,title:'Sâu cắn lúa',body:'Sâu cắn lúa trắng cả một góc đồng. Phải bắt ngay kẻo lan sang cả cánh.',
    ch:[{k:'bat',label:'Ra đồng bắt sâu',note:'−2 Sức · giữ được vụ',fn:()=>{sucDown(2);gain('tien',2)}},
        {k:'mac',label:'Mặc kệ',note:'−2 quan',fn:()=>pay(2)}],
    chron:{bat:'ra đồng bắt sâu giữ vụ lúa',mac:'để sâu cắn mất một góc ruộng'}},
  {id:'daytre',age:[18,30],when:()=>S.van>=30,title:'Dạy chữ cho trẻ',body:'Mấy nhà nghèo trong làng không có tiền cho con đi học, nhờ bạn dạy cho chúng biết chữ.',
    ch:[{k:'day',label:'Nhận dạy',note:'−1 Sức · +2 Tiếng · +1 Đức · +1 Văn',fn:()=>{sucDown(1);gain('tieng',2);gain('duc',1);gain('van',1)}},
        {k:'khong',label:'Bận việc, từ chối',fn:()=>{}}],
    chron:{day:'dạy chữ cho trẻ nhà nghèo trong làng',khong:'không nhận dạy chữ cho trẻ nhà nghèo'}},
  {id:'dayvo',age:[20,30],when:()=>S.vo>=30&&S.year>=1280,title:'Dạy võ cho trai làng',body:'Nghe tin phương bắc lăm le, trai làng rủ nhau tập võ, nhờ bạn chỉ cho mấy đường côn.',
    ch:[{k:'day',label:'Nhận dạy',note:'−1 Sức · +2 Tiếng · trai làng vững hơn',fn:()=>{sucDown(1);gain('tieng',2)}},
        {k:'khong',label:'Từ chối',fn:()=>{}}],
    chron:{day:'dạy võ cho trai làng; đêm giặc đến họ đỡ đòn vững hơn',khong:'không nhận dạy võ cho trai làng'}},
  {id:'chaom',age:[20,30],s:3,when:()=>S.cha&&S.year>=1279,title:'Cha trở trời',body:'Trời trở lạnh, cha ho mấy hôm liền, nằm không dậy được.',
    ch:[{k:'cham',label:'Ở nhà sắc thuốc chăm cha',note:'−2 Sức · +2 Đức',fn:()=>{sucDown(2);gain('duc',2);gainThe(-1)}},
        {k:'thuoc',label:'Mua thuốc bắc',note:'3 quan',dis:()=>S.tien<3,fn:()=>pay(3)},
        {k:'la',label:'Sắc lá thuốc hái trong rừng',show:()=>has('Lá thuốc'),fn:()=>{useItem('Lá thuốc');gain('duc',1);practice('thuoc')}}],
    res:{cham:'Cha khỏi dần. Ông bảo: "Có con ở nhà, cha yên tâm."'},
    chron:{cham:'ở nhà chăm cha những ngày trở trời',thuoc:'mua thuốc bắc chữa ho cho cha',la:'sắc lá thuốc hái trong rừng chữa ho cho cha'}},
];

// Trai làng đã được dạy võ: thêm 1 máu ở đêm 1285.
export function lifeClimax(al){if(S.life&&S.life.dayvo==='day')for(const a of al)if(a.id.startsWith('trai'))a.hp+=1}
// Trâu yếu sau khi tự chữa hỏng: làm đồng bớt 1 quan đến hết năm sau.
export const trauYeu=()=>!!S.trauYeu&&S.year<=S.trauYeu;

export function lifeChronicle(){
  const out=[];
  for(const e of LIFE){const k=S.life&&S.life[e.id];if(k==null)continue;const t=e.chron[k];if(t)out.push(t)}
  return out;
}

export function runLife(e){
  showModal({kicker:K(S.season,S.year)+' · chuyện đời thường',title:e.title,body:`<p>${e.body}</p>`,
    choices:e.ch.filter(c=>!c.show||c.show()).map(c=>({label:c.label,note:typeof c.note==='function'?c.note():c.note,disabled:!!(c.dis&&c.dis()),fn:()=>{
      const k=(c.fn&&c.fn())||c.k;S.life[e.id]=k;renderHUD();const r=e.res&&e.res[k];if(r)toast(r,5600)}}))});
}

const eligible=e=>{const a=age();return S.life[e.id]==null&&a>=e.age[0]&&a<=e.age[1]&&(e.s==null||e.s===S.season)&&(!e.when||e.when())};

/* Gọi sau khi sang mùa, khi mùa này không có sự kiện lịch sử. Mỗi chuyện xong thì nghỉ 1–2 mùa;
   đã 4 mùa liền không có chuyện gì (kể cả sự kiện lịch sử) thì chắc chắn có một chuyện. */
export function maybeLife(){
  if(S.year>=1285)return;
  const now=S.year*4+S.season,quiet=now-(S.lastEv??now);if(S.lastEv==null)S.lastEv=now;
  if((S.lifeWait=(S.lifeWait||0)-1)>0&&quiet<4)return;
  const pool=LIFE.filter(eligible);
  if(!pool.length||(quiet<4&&Math.random()>.75))return;
  S.lastEv=now;
  S.lifeWait=1+Math.floor(Math.random()*2);
  runLife(pool[Math.floor(Math.random()*pool.length)]);
}
