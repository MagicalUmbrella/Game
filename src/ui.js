/* ================= UI ================= */
import {$,SEASONS,canchi} from './constants.js';
import {QUESTS,S,age} from './state.js';
import {REGIONS,regionId} from './world.js';
import {chips,ico} from './icons.js';
import {banner,portrait} from './portrait.js';
import {statProgress} from './stats.js';

export let dialogOpen=false,modalOpen=false,curOpts=[],modalQueue=[];
export const floats=[];
const KEYS_DEFAULT=$('keys').innerHTML;
export function setKeys(html){$('keys').innerHTML=html||KEYS_DEFAULT}
export function toast(msg,ms=3600){const t=$('toast');t.textContent=msg;t.hidden=false;t.style.opacity=1;clearTimeout(toast._t);toast._t=setTimeout(()=>{t.style.opacity=0;setTimeout(()=>t.hidden=true,300)},ms)}
export function floatAt(txt,x,y,color){const k=floats.filter(f=>f.t<1&&Math.abs(f.x-x)<.6&&Math.abs(f.y-y)<.6).length;floats.push({txt,color:color||'#ece6d4',x,y,t:0,dy:k*22})}   // nhiều chữ cùng chỗ thì xếp lệch dòng
export function floatText(txt,color){floatAt(txt,S.x,S.y,color)}
export function gain(k,n){const lab={van:'Văn',vo:'Võ',duc:'Đức',tien:'quan'}[k];S[k]=Math.max(0,Math.min(k==='tien'?999:100,S[k]+n));floatText((n>0?'+':'')+n+' '+lab,{van:'#9cc7e0',vo:'#f0a27f',duc:'#e2bf72',tien:'#c9e0a0'}[k]);renderHUD()}
export function spend(n=1){if(S.suc<n){toast('Bạn đã mệt. Về nhà ngủ để sang mùa mới.');return false}S.suc-=n;renderHUD();return true}
export function startQuest(id){if(S.quests[id])return;S.quests[id]='active';toast('Việc mới: '+QUESTS[id].title);renderHUD()}
export function doneQuest(id){S.quests[id]='done';toast('Hoàn thành: '+QUESTS[id].title);renderHUD()}
export function say(who,text,choices){
  dialogOpen=true;const d=$('dialog');d.hidden=false;
  const pic=portrait(who),pe=d.querySelector('.pic');pe.hidden=!pic;d.classList.toggle('haspic',!!pic);if(pic)pe.style.backgroundImage=`url(${pic})`;
  d.querySelector('.who').textContent=who;typeText(d.querySelector('.txt'),text);
  curOpts=choices&&choices.length?[...choices,{label:'Tạm biệt'}]:[{label:'Tạm biệt'}];
  const o=d.querySelector('.opts');o.innerHTML='';
  curOpts.forEach((c,i)=>{const b=document.createElement('button');b.className='opt';b.id='opt'+i;b.disabled=!!c.disabled;
    b.innerHTML=`<span class="k">${i+1}</span><span></span>${c.note?`<small>${chips(c.note)}</small>`:''}`;b.children[1].textContent=c.label;b.onclick=()=>pick(i);o.appendChild(b)});
}
/* Chữ hiện dần như đang nói (nhanh; bấm vào đoạn chữ để hiện hết). Tắt khi người dùng chọn giảm chuyển động. */
let typing=null;
function typeText(el,text){clearInterval(typing);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=text;return}
  let i=0;el.textContent='';el.onclick=()=>{clearInterval(typing);el.textContent=text};
  typing=setInterval(()=>{i+=3;el.textContent=text.slice(0,i);if(i>=text.length)clearInterval(typing)},16)}
export function closeDialog(){dialogOpen=false;$('dialog').hidden=true}
export function pick(i){const c=curOpts[i];if(!c||c.disabled)return;closeDialog();if(c.fn)c.fn()}
export function showModal(m){modalQueue.push(m);if(!modalOpen)nextModal()}
export function nextModal(){
  const m=modalQueue.shift();if(!m){modalOpen=false;$('modal').hidden=true;return}
  modalOpen=true;closeDialog();const box=$('modal');box.hidden=false;const c=box.querySelector('.card');c.classList.toggle('wide',!!m.wide);
  const si=['Xuân','Hạ','Thu','Đông'].indexOf((m.kicker||'').split(' ')[0]),season=m.big?0:si;
  c.innerHTML=`${season>=0&&m.banner!==false?`<div class="banner" style="background-image:url(${banner(season)})"></div>`:''}${m.kicker?`<div class="kicker">${si>=0?ico('s'+si,1):''}<span>${m.kicker}</span></div>`:''}${m.big?`<h1>${m.title}</h1>`:`<h2>${m.title}</h2>`}<div class="body">${m.body||''}</div><div class="opts"></div>`;
  const ch=m.choices||[{label:'Tiếp tục'}];curOpts=ch;const o=c.querySelector('.opts');
  ch.forEach((x,i)=>{const b=document.createElement('button');b.className='opt';b.id='mopt'+i;b.disabled=!!x.disabled;
    b.innerHTML=`<span class="k">${i+1}</span><span></span>${x.note?`<small>${chips(x.note)}</small>`:''}`;b.children[1].textContent=x.label;b.onclick=()=>mpick(i);o.appendChild(b)});
  setTimeout(()=>{const f=c.querySelector('input')||c.querySelector('.opt:not(:disabled)');f&&f.focus()},30);
}
export function mpick(i){const x=curOpts[i];if(!x||x.disabled)return;if(x.fn&&x.fn()===false)return;nextModal()}
let questsMini=false;try{questsMini=localStorage.getItem('dvmd-quests-mini')==='1'}catch(e){}
export function toggleQuests(){questsMini=!questsMini;try{localStorage.setItem('dvmd-quests-mini',questsMini?'1':'0')}catch(e){}renderHUD()}
export function renderHUD(){
  if(!S)return;const a=age();
  const pathName={van:S.dothi?'Thái học sinh':'Sĩ tử · Quốc học viện',vo:'Hương binh',nong:'Nhà nông'}[S.path]||'';
  const hearts=n=>Array.from({length:5},(_,i)=>ico(i<Math.min(5,n)?'heart':'heartEmpty',1)).join('');
  const rel=(name,v)=>`<span class="rel">${name} ${typeof v==='string'?v:hearts(v)}</span>`;
  const rels=[S.co==='village'||S.co==='army'?rel('Cò',S.rel.co):'',S.ev.thao&&S.thao!=='gone'?rel('Thảo',S.thao==='wife'?'(vợ)':S.thao==='co'?'(vợ Cò)':S.rel.thao):''].filter(Boolean).join('');
  const stat=(k,lab,val)=>{const p=statProgress(k);return`<div class="stat">${ico(k,1)}<span>${lab}</span><b>${val}</b>${p?`<i class="bar" title="${p.next?'mốc kế tiếp: '+p.next:'đã qua mọi mốc'}"><i style="width:${p.pct}%"></i></i>`:''}</div>`};
  $('status').innerHTML=`<div><div class="name"></div><div class="sub"><span>${a} tuổi</span><span>${REGIONS[regionId(Math.floor(S.x),Math.floor(S.y))].short}</span></div></div>
   <div class="date">${ico('s'+S.season,2)}<span>${SEASONS[S.season]} · ${canchi(S.year)} ${S.year}</span></div>
   <div class="suc"><span>Sức</span>${[0,1,2,3].map(i=>ico(i<S.suc?'suc':'sucEmpty',2)).join('')}</div>
   <div class="stats">${stat('van','Văn',S.van)}${stat('vo','Võ',S.vo)}${stat('duc','Đức',S.duc)}${stat('tien','Tiền',S.tien+' quan')}</div>
   ${pathName?`<div class="path">${pathName}</div>`:''}${rels?`<div class="rels">${rels}</div>`:''}${S.items.length?`<div class="items">${S.items.map(x=>`<span>${x}</span>`).join('')}</div>`:''}`;
  $('status').querySelector('.name').textContent=S.name;
  const qs=Object.entries(S.quests);
  // chỉ hiện việc đang làm; việc đã xong gom thành một dòng. Bấm tiêu đề (hoặc phím J) để thu gọn khung cho khỏi che bản đồ.
  const act=qs.filter(q=>q[1]==='active'),nDone=qs.length-act.length;
  $('quests').classList.toggle('mini',questsMini);
  $('quests').innerHTML=`<h3 role="button" tabindex="0" title="Thu gọn hoặc mở rộng (J)">Việc cần làm <span class="tog">${questsMini?'▸':'▾'}</span>${questsMini&&act.length?` <span class="cnt">${act.length}</span>`:''}</h3>`+(questsMini?'':
    (act.length?act.map(([id])=>`<div class="q active"><b>${QUESTS[id].title}</b><span>${typeof QUESTS[id].hint==='function'?QUESTS[id].hint():QUESTS[id].hint}</span></div>`).join(''):qs.length?'':`<div class="q"><span>Đi gặp mọi người trong làng để nhận việc.</span></div>`)
    +(nDone?`<div class="q done"><b>${ico('done',1)}Đã xong ${nDone} việc</b></div>`:'')
    +`<div class="q"><span>Về nhà để ngủ sang mùa mới, hoặc chọn việc chính và cho thời gian trôi nhanh.</span></div>`);
  const h=$('quests').querySelector('h3');h.onclick=toggleQuests;h.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleQuests()}};
}
