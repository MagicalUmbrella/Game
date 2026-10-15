/* ================= lời thoại ================= */
/* Hư cấu. Cho người trong làng có giọng riêng: mỗi người một kho câu nói (LOI), câu nào cũng có điều kiện (tuổi,
   mùa, đường đời, chuyện đã qua). voice(id, base) chọn câu để nói khi bắt chuyện:
   1. câu "một lần" (once) hợp hoàn cảnh mà chưa nói: nói ngay, ghi S.loiSeen (những lúc người ta nhắc lại chuyện cũ);
   2. còn lại: câu theo tình hình (base, do dialogs.js đưa vào) hoặc một câu trong kho, tránh lặp câu vừa nói.
   Giọng: mẹ thương con, hay lo ăn mặc, hay nói ca dao; cha ít lời, nói chuyện trời đất ruộng nương; thầy Chu nho nhã,
   hay dẫn sách; lão võ sư cộc, nói ngắn; sư cụ chậm rãi; bà Tư lẩm cẩm, nhớ chồng; cụ xã nói chuyện lệ làng;
   Cò bông lơn, thật bụng; Thảo ít nói. Câu dẫn sách, ca dao là câu ai cũng biết, không bịa lời người xưa. */
import {S,age} from './state.js';

const dead=()=>!S.cha,yr=y=>S.year>=y,ss=n=>S.season===n,path=p=>S.path===p,ch=id=>(S.chains||{})[id]||{};
/* t: lời (chuỗi hoặc hàm); when: điều kiện; once: nói một lần (khóa riêng) */
export const LOI={
  me:[
    {t:'Đi đâu thì về trước khi gà lên chuồng, con nhé.',when:()=>age()<12},
    {t:'Mẹ để phần con củ khoai lùi trong bếp đấy. Còn nóng.',when:()=>age()<14},
    {t:'Ăn cơm đừng bỏ thừa hạt nào. Một hạt thóc là một giọt mồ hôi của cha con.',when:()=>age()<14},
    {t:'Ra giêng rồi, cả làng đi lễ đình. Con mặc cái áo mới mẹ may vào.',when:()=>ss(0)},
    {t:'Trưa nắng thế này đừng ra đồng đầu trần, đội cái nón của cha vào.',when:()=>ss(1)},
    {t:'Gió heo may về rồi. Tối nay mẹ khâu lại cái áo kép cho con.',when:()=>ss(2)},
    {t:'Rét thế này, tối về mẹ nấu nồi cháo hành cho cả nhà.',when:()=>ss(3)},
    {t:'Con dạo này gầy đi đấy. Học thì học, cơm phải ăn cho đủ bữa.',when:()=>S.the<50},
    {t:'"Công cha như núi Thái Sơn, nghĩa mẹ như nước trong nguồn chảy ra." Mẹ không đòi gì, chỉ mong con sống cho tử tế.',when:()=>age()>=14},
    {t:'Con viết chữ đẹp lắm. Mẹ không biết chữ, mà nhìn cũng thấy nét nó ngay ngắn.',when:()=>path('van')},
    {t:'Mỗi lần con đi tập về, mẹ lại lén xem tay chân con có vết bầm nào không.',when:()=>path('vo')},
    {t:'Con với cha con giống nhau như đúc: đã đứng trên ruộng là không ai gọi về được.',when:()=>path('nong')&&!dead()},
    {t:'Đêm qua mẹ nằm mơ thấy cha con ngồi vấn thuốc ở hiên. Mẹ chưa kịp gọi thì tỉnh.',when:dead},
    {t:'Năm nước to ấy, nhà mình ăn cháo cả mùa. Con còn bé mà không kêu một tiếng.',when:()=>S.flags.de==='lost'&&yr(1271)},
    {t:'Mẹ thằng Cò sang đây khóc mấy lần. Con có tin gì của nó không?',when:()=>S.co==='army'},
    {t:'Bé Sen giống con hồi nhỏ như đúc, thấy vũng nước là nhảy xuống.',when:()=>S.child},
    {t:'Người ta đồn giặc phương bắc lại sắp sang. Mẹ chỉ mong nhà mình được yên ổn.',when:()=>yr(1282)},
    {once:'me_cuoi',t:'Hôm cưới, mẹ nhìn con dắt Thảo qua ngõ mà cứ ngỡ mới hôm qua con còn bò lê dưới chõng tre.',when:()=>S.thao==='wife'&&yr(1279)},
  ],
  cha:[
    {t:'Ruộng không phụ người. Mình bỏ công bao nhiêu, nó trả bấy nhiêu.'},
    {t:'"Chuồn chuồn bay thấp thì mưa, bay cao thì nắng, bay vừa thì râm." Hôm nay chúng bay thấp đấy.',when:()=>ss(0)||ss(1)},
    {t:'Nước ruộng nóng như nước ấm. Lúa đang thì con gái, phải giữ nước cho đều.',when:()=>ss(1)},
    {t:'Gặt xong phải phơi cho thật kỹ. Thóc còn ẩm mà đổ vào bồ là mọc mầm hết.',when:()=>ss(2)},
    {t:'Đông này cày ải cho sớm. Đất được phơi cái nắng hanh thì mùa sau lúa mới tốt.',when:()=>ss(3)},
    {t:'Con trâu nhà mình già rồi mà vẫn khôn. Nó biết đường về chuồng hơn cả người.',when:()=>S.quests.trau==='done'},
    {t:'Lưng cha giờ cúi lâu không được nữa. Ruộng nhà trông cả vào con.',when:()=>yr(1280)},
    {t:'Con chọn ở nhà làm ruộng. Cha không nói ra, nhưng cha mừng.',when:()=>path('nong')},
    {t:'Cha không biết chữ. Nhưng mỗi lần con đọc thư cho cả xóm nghe, cha thấy nở mày nở mặt.',when:()=>path('van')},
    {t:'Hồi giặc Mông Cổ sang, mẹ con đang mang bầu con. Cha cũng cầm gậy theo trai làng ra bờ sông. Giờ đến lượt con.',when:()=>path('vo')},
    {once:'cha_de',t:'Năm nước to, con đứng ngoài đê cả đêm. Từ hôm ấy cha thôi coi con là trẻ con.',when:()=>S.flags.de==='saved'&&yr(1271)},
  ],
  thay:[
    {t:'"Học nhi thời tập chi, bất diệc duyệt hồ." Học rồi đem ra tập, chẳng vui lắm sao? Câu đầu sách Luận ngữ đấy, trò nhớ lấy.'},
    {t:'"Ngọc bất trác, bất thành khí; nhân bất học, bất tri đạo." Ngọc không mài không thành đồ quý, người không học không biết đạo.'},
    {t:'Cầm bút phải như cầm chén nước đầy: chặt quá thì đổ, lỏng quá thì rơi.',when:()=>age()<12},
    {t:'Chữ của trò hôm nay ngay ngắn hơn hôm qua. Nét chữ ngay thì lòng người cũng ngay.'},
    {t:'Trời rét, mực đóng cứng cả nghiên. Trò hà hơi vào mà mài.',when:()=>ss(3)},
    {t:'Ông Lê Văn Hưu soạn xong bộ Đại Việt sử ký rồi đấy. Đời thầy chỉ mong được đọc một lần.',when:()=>yr(1272)},
    {t:'(Thầy ho một tràng dài.) Không sao, già rồi, trái gió trở trời thôi.',when:()=>yr(1278)},
    {t:'Thằng Cò giờ đọc được câu đối ở đình rồi. Trò dạy nó còn giỏi hơn thầy.',when:()=>ch('co').st==='done'},
    {once:'thay_tamThu',t:'Bộ Tứ thư trò biếu, đêm nào thầy cũng giở ra đọc dưới ngọn đèn dầu. Già rồi mà vẫn thấy có cái mới.',when:()=>S.thayBonus},
  ],
  vosu:[
    {t:'Đứng tấn cho vững đã. Gốc không chắc thì cành nào cũng gãy.'},
    {t:'Đánh người thì dễ. Biết lúc nào không đánh mới khó.'},
    {t:'Mồ hôi đổ trên sân tập thì máu bớt đổ ngoài trận.'},
    {t:'Cuối năm Đinh Tỵ, ta cầm giáo đứng ở bãi sông nhìn thuyền giặc kéo đến. Cái rét tháng chạp năm ấy ta nhớ mãi.'},
    {t:'Tay còn yếu. Chiều nay gánh nước đầy chum cho ta, thay bài tập.',when:()=>S.vo<20&&age()>=8},
    {t:'Ba chục năm dạy võ, ta mới gặp vài đứa ra đòn được như trò.',when:()=>S.vo>=50},
    {t:'(Lão xoa đầu gối.) Sắp mưa đấy. Cái chân này báo trước còn đúng hơn ông thầy bói.',when:()=>yr(1276)},
  ],
  su:[
    {t:'Nước trong lu, múc ra mới biết còn bao nhiêu. Lòng người cũng vậy, cho đi rồi mới biết mình có những gì.'},
    {t:'Chuông chiều đánh lên không phải để gọi Phật. Là để gọi người về với chính mình.'},
    {t:'Con đi đâu cũng được, miễn nhớ đường về.'},
    {t:'Hoa sen mọc dưới bùn mà không hôi mùi bùn. Ở đời cũng thế, con ạ.'},
    {t:'Nghe nói giặc lại sắp sang. Chùa nhỏ này, ai bị thương cứ đưa về đây.',when:()=>yr(1282)},
  ],
  batu:[
    {t:'Cháu ngồi xuống đây với bà một lát. Bà nhai trầu, cháu nghe bà kể chuyện.'},
    {t:'Ông nhà bà ngày xưa cũng to cao như cháu. Đi phu đắp đê rồi không về nữa.',when:()=>age()>=12},
    {t:'Con Thảo nó ít nói, nhưng thương ai là thương thật lòng đấy.',when:()=>S.ev.thao&&S.thao!=='wife'},
    {t:'Rét quá, bà phải đốt ổ rơm mà sưởi. Già rồi, cái rét nó vào tận xương.',when:()=>ss(3)},
    {t:'Năm nay mận nhà bà sai quả lắm. Lát về bứt mấy quả mà ăn.',when:()=>ss(1)},
    {t:'Mái nhà cháu với con Thảo lợp, mưa to mấy cũng không dột giọt nào.',when:()=>ch('thao').st==='done'},
    {once:'batu_kien',t:'Thửa ruộng bờ sông giữ được là nhờ cháu. Bà không biết chữ, nhưng bà biết ơn.',when:()=>S.flags.kien==='thang'},
    {t:'Mất thửa ruộng rồi, nhà bà với con Thảo ăn độn khoai. Thôi, của đi thay người.',when:()=>S.flags.kien==='thua'||S.flags.kien==='bo'},
  ],
  ly:[
    {t:'Phép vua thua lệ làng. Nhưng lệ làng cũng phải có lý thì người ta mới theo.'},
    {t:'"Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao." Làng mình cũng thế.'},
    {t:'Đình làng mình dựng từ đời các cụ. Toàn gỗ lim, trăm năm chưa mọt.'},
    {t:'Năm nay thuế má nặng, làng phải bàn cho khéo, đừng để nhà nghèo gánh hết.',when:()=>ss(2)},
    {t:'Hội xuân năm nay, ta định mời phường chèo làng bên sang hát.',when:()=>ss(0)},
    {once:'ly_de',t:'Năm nước to, làng giữ được đê là nhờ mấy đứa trẻ như cháu. Ta ghi tên cháu vào sổ công của làng rồi.',when:()=>S.flags.de==='saved'&&yr(1271)},
  ],
  co:[
    {t:'Tớ vừa bắt được con cá chuối to bằng bắp tay, thả lại rồi, tiếc đứt ruột!',when:()=>age()<12},
    {t:'Mai ra bãi sông đá cầu không? Tớ mới làm quả cầu lông gà.',when:()=>age()<12},
    {t:'Cha tớ bảo tớ phải theo nghề cày. Nhưng tớ thích cưỡi ngựa cơ.',when:()=>age()>=12&&age()<18},
    {t:'Cậu thấy Thảo hôm nay có... à thôi, tớ hỏi vớ vẩn.',when:()=>S.ev.thao&&S.thao==='none'&&age()>=16},
    {t:'Tớ đọc được tên mình rồi này. Chữ "Cò" cũng không khó lắm. Nhờ cậu đấy.',when:()=>ch('co').st==='done'},
    {t:'Nghe nói Hoài Văn hầu còn trẻ hơn tớ mà đã tự dựng cờ. Tớ thì vẫn ở đây chăn trâu.',when:()=>yr(1282)&&S.co==='village'},
    {t:'Con dế cậu cho tớ đá thắng cả xóm Đông đấy!',when:()=>S.rel.co>=4&&age()<16},
    {t:'Hôm qua tớ trèo cây đa, suýt nữa thì gãy cành. Đừng kể với mẹ tớ nhé!',when:()=>age()<14},
    {t:'Trâu nhà tớ hôm nay húc đổ cả hàng rào nhà ông Cả. Tớ trốn ra đây đấy.',when:()=>age()<16},
    {t:'Ruộng nhà tớ năm nay được mùa. Lúc nào cậu sang, tớ đãi một bữa cơm mới.',when:()=>age()>=16&&ss(2)},
    {t:'Có hôm tớ nằm trên đê nhìn sông Hồng, nghĩ bên kia có gì. Chắc cũng ruộng với trâu như mình thôi nhỉ.',when:()=>age()>=14},
    {t:'Làm bạn với cậu lâu thế mà cậu chưa thắng tớ ván cờ gánh nào.',when:()=>S.rel.co>=4},
    {t:'Thảo nấu canh cua ngon nhất làng. Cậu không được nói với ai là tớ khen đâu đấy.',when:()=>S.thao==='co'},
    {once:'co_dieu',t:'Còn nhớ hôm trốn học thả diều không? Bị phạt quỳ mà tớ vẫn thấy đáng.',when:()=>S.flags.dieu==='di'&&age()>=14},
  ],
  thao:[
    {t:'(Thảo cúi đầu, tay mân mê vạt áo.) Anh... anh sang có việc gì ạ?',when:()=>S.rel.thao<2&&S.thao==='none'},
    {t:'Mẹ em ngày trước dạy em thêu khăn. Giờ em thêu cho bà, bà khen mãi.',when:()=>S.thao==='none'},
    {t:'Chiều nay em ra bờ ao hái rau muống. Anh có thích ăn rau muống luộc không?',when:()=>S.rel.thao>=3&&S.thao==='none'},
    {t:'Mẹ anh dạy em muối dưa. Lần đầu em muối, chua quá, cả nhà cứ cười.',when:()=>S.thao==='wife'},
    {t:'Có hôm em ngồi khâu áo cho anh, nghĩ tới năm nước to. Giờ em có nhà rồi.',when:()=>S.thao==='wife'},
    {t:'Bà em dạo này hay quên. Hôm qua bà đi tìm cái ống nhổ trầu cả buổi, mà nó ở ngay trong tay.',when:()=>S.thao!=='wife'},
    {t:'Sáng nay em ra giếng sớm, sương còn đọng trên lá khoai. Đẹp lắm.',when:()=>ss(0)||ss(2)},
    {t:'Anh ăn gì chưa? Em có để phần bát canh cua.',when:()=>S.thao==='wife'},
    {t:'Bé Sen đêm qua nói mơ, cứ gọi "cha ơi". Anh về sớm với con.',when:()=>S.child},
  ],
  sach:[
    {t:'Sách chép tay, sách in ván đủ cả. Mua đi cậu, chữ nghĩa không bao giờ thừa.'},
    {t:'Bộ sách này ta chép mất ba tháng, mỗi chữ một nét không sai. Cầm nhẹ tay thôi cậu.'},
    {t:'Học trò Quốc học viện hay ghé đây. Có anh mua sách không nổi, đứng đọc nhờ cả buổi, ta cũng để yên.'},
  ],
  ren:[
    {t:'Lò rèn nóng lắm, đứng xa ra một chút.'},
    {t:'Sắt tốt hay xấu, nghe tiếng búa là biết. Tiếng trong là sắt tốt, tiếng đục là sắt non.'},
    {t:'Dạo này người ta đặt rèn dao, rèn giáo nhiều hơn rèn cày cuốc. Thời buổi gì không biết.',when:()=>yr(1282)},
  ],
  laido:[
    {t:'Sông Hồng hiền lúc cạn, dữ lúc lũ. Sống với nó cả đời mà ta chưa dám nói là hiểu nó.'},
    {t:'Nhìn màu nước là biết thượng nguồn mưa hay không. Hôm nay nước đỏ quạch, đêm nay sông lên đấy.',when:()=>ss(1)||ss(2)},
    {t:'Ngày ta còn trẻ, bến này đông lắm. Thuyền buôn đậu kín một khúc sông.'},
    {t:'Khách qua đò bao nhiêu người, ta quên hết mặt. Chỉ nhớ người nào trả tiền bằng một câu cảm ơn.'},
  ],
};

const last={};
/* chọn lời cho người id; base là câu theo tình hình (có thể null) */
export function voice(id,base){const all=LOI[id]||[],ok=all.filter(l=>!l.when||l.when()),seen=S.loiSeen||(S.loiSeen={});
  const once=ok.find(l=>l.once&&!seen[l.once]);if(once){seen[once.once]=1;return txt(once)}
  const pool=ok.filter(l=>!l.once).map(txt).filter(t=>t!==last[id]);
  let t=base&&(Math.random()<.45||!pool.length)?base:pool[Math.floor(Math.random()*pool.length)]||base;
  last[id]=t;return t}
const txt=l=>typeof l.t==='function'?l.t():l.t;
