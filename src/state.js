/* ================= state ================= */
import {say} from './ui.js';
import {pickR,talkBaTu,talkCha,talkCo,talkHocQuan,talkLinh,talkLy,talkMe,talkNgu,talkRen,talkSach,talkSu,talkThao,talkThay,talkTong,talkVo,talkVoQuan} from './dialogs.js';
import {chainHint} from './chains.js';

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
  cco:{title:'Dạy Cò biết chữ',hint:()=>chainHint('co')},
  cthao:{title:'Mái nhà bà Tư',hint:()=>chainHint('thao')},
  cthay:{title:'Chép sách cho thầy',hint:()=>chainHint('thay')},
  lua:{title:'Tấm lụa cho mẹ',hint:'Mua lụa của lái buôn người Tống ở phường Nhai Tuân, mang về biếu mẹ. (Cũng có thể tặng Thảo.)'},
};
export function newState(name){return{name,year:1264,season:0,suc:4,van:0,vo:0,duc:0,tien:3,items:[],quests:{},path:null,ev:{},x:43.5,y:50.4,ate:false,
  buffalo:{x:44.5,y:58.6,st:'pen',tracks:[],bolts:0},nguMet:false,thayBonus:false,dothi:false,ended:false,
  rel:{co:2,thao:0},flags:{},ducMerged:true,cha:true,thay:true,co:'village',thao:'none',married:false,child:false,thaoHelped:false,coPlayed:false,paper:false,tonic:false,life:{},lifeWait:2,found:{},chains:{},toi:'',pending:null}}
export function save(){try{localStorage.setItem('dvmd-save',JSON.stringify(S))}catch(e){}}
export function loadSave(){try{const s=localStorage.getItem('dvmd-save');if(!s)return null;const o=JSON.parse(s),b=newState('');const r=Object.assign(b,o);r.rel=Object.assign(newState('').rel,o.rel||{});r.flags=Object.assign({},o.flags||{});if(!r.buffalo||!r.buffalo.st){r.buffalo={x:44.5,y:58.6,st:'pen',tracks:[],bolts:0};if(r.quests&&r.quests.trau==='active')r._reLose=true}
  // bản lưu cũ còn uy tín làng riêng (flags.lang): quy sang Đức, mỗi điểm uy tín bằng 3 Đức
  if(!o.ducMerged){r.duc=Math.max(0,Math.min(100,r.duc+3*(r.flags.lang||0)));r.ducMerged=true}delete r.flags.lang;
  // bản lưu cũ đã qua tin Toa Đô mà chưa có việc "Lo trước ngày giặc đến"
  if(r.ev&&r.ev.toado&&!r.quests.lo&&r.year<1285)r.quests.lo='active';
  // bản lưu cũ: việc Tứ thư còn dở khi thầy đã mất, việc lo trước còn dở khi đã sang 1285
  if(!r.thay&&r.quests.sach==='active')delete r.quests.sach;if(r.year>=1285&&r.quests.lo==='active')delete r.quests.lo;return r}catch(e){return null}}

export const P={dir:'down',walk:0,moving:false};
export const LOOK_THAO={id:'thao'};
export const NPCS=[
 {id:'me',name:'Mẹ',x:45.5,y:50.4,look:{id:'me'},talk:talkMe},
 {id:'cha',name:'Cha',x:42.5,y:56.4,look:{id:'cha'},talk:talkCha,show:()=>S.cha},
 {id:'thay',name:'Thầy đồ Chu',x:33.8,y:42.7,look:{id:'thay'},talk:talkThay,show:()=>S.thay},
 {id:'vosu',name:'Lão võ sư Hoàng',x:48.5,y:38.5,look:{id:'vosu'},talk:talkVo},
 {id:'su',name:'Sư cụ',x:24.6,y:14.4,look:{id:'su'},talk:talkSu},
 {id:'batu',name:'Bà Tư',x:52.4,y:49.9,look:{id:'batu'},talk:talkBaTu},
 {id:'thao',name:'Thảo',x:49.3,y:50.6,look:LOOK_THAO,talk:talkThao,show:()=>!!S.ev.thao&&S.thao!=='gone',at:()=>S.thao==='wife'?[47.4,50.7]:S.thao==='co'?[36.4,49.7]:[49.3,50.6]},
 {id:'sen',name:'Bé Sen',x:46.6,y:51.7,look:{id:'sen',kid:true},talk:()=>say('Bé Sen',pickR(['Cha ơi, bế con!','Cha ơi, mẹ Thảo bảo tối nay có canh cua.','Con biết đếm đến mười rồi đấy!'])),show:()=>S.child},
 {id:'ly',name:'Cụ lý trưởng',x:35.8,y:36.9,look:{id:'ly'},talk:talkLy},
 {id:'co',name:'Cò',x:38.5,y:45.2,wander:true,home:[38.5,45.2],talk:talkCo,show:()=>S.co==='village'},
 {id:'hsach',name:'Chủ hàng sách',x:39.6,y:15.6,look:{id:'hsach'},talk:talkSach},
 {id:'hren',name:'Bác thợ rèn',x:44.6,y:15.6,look:{id:'hren'},talk:talkRen},
 {id:'tong',name:'Lái buôn người Tống',x:59.6,y:15.6,look:{id:'tong'},talk:talkTong,show:()=>S.year>=1275},
 {id:'dan1',name:'Người bán hàng',x:59.6,y:15.6,look:{id:'dan1'},talk:()=>say('Người bán hàng',S.year>=1274?'Gian hàng này sắp có người mới thuê đấy. Nghe đâu là người phương bắc.':'Kim chỉ, quạt nan, nón lá đủ cả. Cậu xem có món nào mua về cho mẹ không?'),show:()=>S.year<1275},
 {id:'gom',name:'Bà hàng gốm',x:63.6,y:18.5,look:{id:'gom'},talk:()=>say('Bà hàng gốm','Bát đĩa men ngọc, gốm hoa nâu đây con. Mua về cho mẹ đựng cà muối.')},
 {id:'linh1',name:'Lính gác',x:51.3,y:20.5,look:{id:'linh'},talk:talkLinh},
 {id:'linh2',name:'Lính gác',x:55.7,y:20.5,look:{id:'linh'},talk:talkLinh},
 {id:'hocquan',name:'Học quan',x:42.6,y:8.8,look:{id:'hocquan'},talk:talkHocQuan},
 {id:'voquan',name:'Võ quan',x:66.4,y:12.8,look:{id:'voquan'},talk:talkVoQuan},
 {id:'ngu',name:'Chàng trai đọc sách',x:74.5,y:30.4,look:{id:'ngu'},talk:talkNgu,show:()=>S.year>=1272&&S.year<=1277},
];
export const coLook=()=>age()<14?{id:'co_be',kid:true}:{id:S.year>=1284?'co_do':'co'};
/* Hình người của NPC lúc này: Cò lớn lên, cha mẹ già đi. */
export const npcLook=n=>n.id==='co'?coLook():(n.id==='me'||n.id==='cha')&&S&&S.year>=1280?{id:n.id+'_gia'}:n.look;
export function npcOn(n){if(MG&&MG.hideNPC)return false;if(n.show&&!n.show())return false;if(n.at){const p=n.at();n.x=p[0];n.y=p[1]}return true}


export function setS(v){S=v}
export function setMG(v){MG=v}
