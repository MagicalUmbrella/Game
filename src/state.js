/* ================= state ================= */
import {say} from './ui.js';
import {pickR,talkBaTu,talkCha,talkCo,talkHocQuan,talkLinh,talkLy,talkMe,talkNgu,talkRen,talkSach,talkSu,talkThao,talkThay,talkTong,talkVo,talkVoQuan} from './dialogs.js';

export let S=null,MG=null;
export const age=()=>S.year-1258;
export const has=it=>S.items.includes(it);
export const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
export const QUESTS={
  hoc:{title:'Đến trường làng',hint:'Gặp thầy đồ Chu trước cửa trường làng, phía nam đình làng.'},
  trau:{title:'Con trâu lạc',hint:'Lần theo dấu chân trâu từ ruộng vào rừng phía tây. Nghe tiếng mõ trâu để biết gần hay xa. Lại gần thì đi chậm, đừng giữ Shift kẻo trâu giật mình chạy mất. Dắt về thì trâu hay dừng gặm cỏ, bấm E để kéo thừng.'},
  ca:{title:'Bát canh cá',hint:'Đứng sát mép sông, quay mặt ra nước, bấm E để câu cá, rồi mang cho bà Tư.'},
  sach:{title:'Bộ Tứ thư cho thầy',hint:'Lên kinh thành Thăng Long (phía bắc, qua cầu), mua ở Hàng sách. Biếu thầy thì kỳ thi sau này dễ hơn.'},
  lo:{title:'Lo trước ngày giặc đến',hint:'Từ nay đến hết năm 1284, có tiền thì lo trước cho đêm giặc đến: góp tiền dựng lán trong rừng (cụ lý trưởng, 12 quan), rèn giáo cho trai làng (bác thợ rèn, 10 quan), cất bớt thóc vào rừng (cha, hoặc mẹ nếu cha đã mất; 6 quan).'},
  lua:{title:'Tấm lụa cho mẹ',hint:'Mua lụa của lái buôn người Tống ở phường Nhai Tuân, mang về biếu mẹ. (Cũng có thể tặng Thảo.)'},
};
export function newState(name){return{name,year:1264,season:0,suc:4,van:0,vo:0,duc:0,tien:3,items:[],quests:{},path:null,ev:{},x:43.5,y:50.4,ate:false,
  buffalo:{x:44.5,y:58.6,st:'pen',tracks:[],bolts:0},nguMet:false,thayBonus:false,dothi:false,ended:false,
  rel:{co:2,thao:0},flags:{},ducMerged:true,cha:true,thay:true,co:'village',thao:'none',married:false,child:false,thaoHelped:false,coPlayed:false,paper:false,tonic:false,life:{},lifeWait:2,toi:'',pending:null}}
export function save(){try{localStorage.setItem('dvmd-save',JSON.stringify(S))}catch(e){}}
export function loadSave(){try{const s=localStorage.getItem('dvmd-save');if(!s)return null;const o=JSON.parse(s),b=newState('');const r=Object.assign(b,o);r.rel=Object.assign(newState('').rel,o.rel||{});r.flags=Object.assign({},o.flags||{});if(!r.buffalo||!r.buffalo.st){r.buffalo={x:44.5,y:58.6,st:'pen',tracks:[],bolts:0};if(r.quests&&r.quests.trau==='active')r._reLose=true}
  // bản lưu cũ còn uy tín làng riêng (flags.lang): quy sang Đức, mỗi điểm uy tín bằng 3 Đức
  if(!o.ducMerged){r.duc=Math.max(0,Math.min(100,r.duc+3*(r.flags.lang||0)));r.ducMerged=true}delete r.flags.lang;
  // bản lưu cũ đã qua tin Toa Đô mà chưa có việc "Lo trước ngày giặc đến"
  if(r.ev&&r.ev.toado&&!r.quests.lo&&r.year<1285)r.quests.lo='active';return r}catch(e){return null}}

export const P={dir:'down',walk:0,moving:false};
export const LOOK_THAO={shirt:'#4f7a5a',hair:'woman'};
export const NPCS=[
 {id:'me',name:'Mẹ',x:45.5,y:50.4,look:{shirt:'#7b4656',hair:'woman'},talk:talkMe},
 {id:'cha',name:'Cha',x:42.5,y:56.4,look:{shirt:'#5b4a35',hair:'man',hat:true},talk:talkCha,show:()=>S.cha},
 {id:'thay',name:'Thầy đồ Chu',x:33.8,y:42.7,look:{shirt:'#33505c',hair:'old',long:true},talk:talkThay,show:()=>S.thay},
 {id:'vosu',name:'Lão võ sư Hoàng',x:48.5,y:38.5,look:{shirt:'#6e2f26',hair:'old',band:true},talk:talkVo},
 {id:'su',name:'Sư cụ',x:24.6,y:14.4,look:{shirt:'#a8692d',hair:'monk'},talk:talkSu},
 {id:'batu',name:'Bà Tư',x:52.4,y:49.9,look:{shirt:'#4f4a3c',hair:'oldwoman'},talk:talkBaTu},
 {id:'thao',name:'Thảo',x:49.3,y:50.6,look:LOOK_THAO,talk:talkThao,show:()=>!!S.ev.thao&&S.thao!=='gone',at:()=>S.thao==='wife'?[47.4,50.7]:S.thao==='co'?[36.4,49.7]:[49.3,50.6]},
 {id:'sen',name:'Bé Sen',x:46.6,y:51.7,look:{shirt:'#c9785a',hair:'kid',kid:true},talk:()=>say('Bé Sen',pickR(['Bố ơi, bế con!','Bố ơi, mẹ Thảo bảo tối nay có canh cua.','Con biết đếm đến mười rồi đấy!'])),show:()=>S.child},
 {id:'ly',name:'Cụ lý trưởng',x:35.8,y:36.9,look:{shirt:'#2c3a45',hair:'old',long:true},talk:talkLy},
 {id:'co',name:'Cò',x:38.5,y:45.2,wander:true,home:[38.5,45.2],talk:talkCo,show:()=>S.co==='village'},
 {id:'hsach',name:'Chủ hàng sách',x:39.6,y:15.6,look:{shirt:'#3a4a3a',hair:'man'},talk:talkSach},
 {id:'hren',name:'Bác thợ rèn',x:44.6,y:15.6,look:{shirt:'#4a3a30',hair:'man',band:true},talk:talkRen},
 {id:'tong',name:'Lái buôn người Tống',x:59.6,y:15.6,look:{shirt:'#3f6f9a',hair:'man',long:true},talk:talkTong,show:()=>S.year>=1275},
 {id:'dan1',name:'Người bán hàng',x:59.6,y:15.6,look:{shirt:'#6a5a7a',hair:'woman'},talk:()=>say('Người bán hàng','Gian hàng này sắp có người mới thuê đấy. Nghe đâu là người phương bắc.'),show:()=>S.year<1275},
 {id:'gom',name:'Bà hàng gốm',x:63.6,y:18.5,look:{shirt:'#5a6a5a',hair:'oldwoman'},talk:()=>say('Bà hàng gốm','Bát đĩa men ngọc, gốm hoa nâu đây con. Mua về cho mẹ đựng cà muối.')},
 {id:'linh1',name:'Lính gác',x:51.3,y:20.5,look:{shirt:'#7a2b22',hair:'man',band:true,spear:true},talk:talkLinh},
 {id:'linh2',name:'Lính gác',x:55.7,y:20.5,look:{shirt:'#7a2b22',hair:'man',band:true,spear:true},talk:talkLinh},
 {id:'hocquan',name:'Học quan',x:42.6,y:8.8,look:{shirt:'#24425a',hair:'old',long:true},talk:talkHocQuan},
 {id:'voquan',name:'Võ quan',x:66.4,y:12.8,look:{shirt:'#7a2b22',hair:'man',band:true},talk:talkVoQuan},
 {id:'ngu',name:'Chàng trai đọc sách',x:74.5,y:30.4,look:{shirt:'#5a5040',hair:'man'},talk:talkNgu,show:()=>S.year>=1272&&S.year<=1277},
];
export const coLook=()=>age()<14?{shirt:'#7a6a3a',hair:'kid',kid:true}:{shirt:'#7a6a3a',hair:'man',band:S.year>=1284};
export function npcOn(n){if(MG&&MG.hideNPC)return false;if(n.show&&!n.show())return false;if(n.at){const p=n.at();n.x=p[0];n.y=p[1]}return true}


export function setS(v){S=v}
export function setMG(v){MG=v}
