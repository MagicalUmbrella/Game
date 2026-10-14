/* ================= UI ================= */
import {$,SEASONS,canchi} from './constants.js';
import {QUESTS,S,age} from './state.js';

export let dialogOpen=false,modalOpen=false,curOpts=[],modalQueue=[];
export const floats=[];
const KEYS_DEFAULT=$('keys').innerHTML;
export function setKeys(html){$('keys').innerHTML=html||KEYS_DEFAULT}
export function toast(msg,ms=3600){const t=$('toast');t.textContent=msg;t.hidden=false;t.style.opacity=1;clearTimeout(toast._t);toast._t=setTimeout(()=>{t.style.opacity=0;setTimeout(()=>t.hidden=true,300)},ms)}
export function floatAt(txt,x,y,color){floats.push({txt,color:color||'#ece6d4',x,y,t:0})}
export function floatText(txt,color){floatAt(txt,S.x,S.y,color)}
export function gain(k,n){const lab={van:'Văn',vo:'Võ',duc:'Đức',tien:'quan'}[k];S[k]=Math.max(0,Math.min(k==='tien'?999:100,S[k]+n));floatText((n>0?'+':'')+n+' '+lab,{van:'#9cc7e0',vo:'#f0a27f',duc:'#e2bf72',tien:'#c9e0a0'}[k]);renderHUD()}
export function spend(n=1){if(S.suc<n){toast('Bạn đã mệt. Về nhà ngủ để sang mùa mới.');return false}S.suc-=n;renderHUD();return true}
export function startQuest(id){if(S.quests[id])return;S.quests[id]='active';toast('Việc mới: '+QUESTS[id].title);renderHUD()}
export function doneQuest(id){S.quests[id]='done';toast('Hoàn thành: '+QUESTS[id].title);renderHUD()}
export function say(who,text,choices){
  dialogOpen=true;const d=$('dialog');d.hidden=false;
  d.querySelector('.who').textContent=who;d.querySelector('.txt').textContent=text;
  curOpts=choices&&choices.length?[...choices,{label:'Tạm biệt'}]:[{label:'Tạm biệt'}];
  const o=d.querySelector('.opts');o.innerHTML='';
  curOpts.forEach((c,i)=>{const b=document.createElement('button');b.className='opt';b.id='opt'+i;b.disabled=!!c.disabled;
    b.innerHTML=`<span class="k">${i+1}</span><span></span>${c.note?'<small></small>':''}`;b.children[1].textContent=c.label;if(c.note)b.querySelector('small').textContent=c.note;b.onclick=()=>pick(i);o.appendChild(b)});
}
export function closeDialog(){dialogOpen=false;$('dialog').hidden=true}
export function pick(i){const c=curOpts[i];if(!c||c.disabled)return;closeDialog();if(c.fn)c.fn()}
export function showModal(m){modalQueue.push(m);if(!modalOpen)nextModal()}
export function nextModal(){
  const m=modalQueue.shift();if(!m){modalOpen=false;$('modal').hidden=true;return}
  modalOpen=true;closeDialog();const box=$('modal');box.hidden=false;const c=box.querySelector('.card');c.classList.toggle('wide',!!m.wide);
  c.innerHTML=`${m.kicker?`<div class="kicker">${m.kicker}</div>`:''}${m.big?`<h1>${m.title}</h1>`:`<h2>${m.title}</h2>`}<div class="body">${m.body||''}</div><div class="opts"></div>`;
  const ch=m.choices||[{label:'Tiếp tục'}];curOpts=ch;const o=c.querySelector('.opts');
  ch.forEach((x,i)=>{const b=document.createElement('button');b.className='opt';b.id='mopt'+i;b.disabled=!!x.disabled;
    b.innerHTML=`<span class="k">${i+1}</span><span></span>${x.note?'<small></small>':''}`;b.children[1].textContent=x.label;if(x.note)b.querySelector('small').textContent=x.note;b.onclick=()=>mpick(i);o.appendChild(b)});
  setTimeout(()=>{const f=c.querySelector('input')||c.querySelector('.opt:not(:disabled)');f&&f.focus()},30);
}
export function mpick(i){const x=curOpts[i];if(!x||x.disabled)return;if(x.fn&&x.fn()===false)return;nextModal()}
export function renderHUD(){
  if(!S)return;const a=age();
  const pathName={van:S.dothi?'Thái học sinh':'Sĩ tử · Quốc học viện',vo:'Hương binh',nong:'Nhà nông'}[S.path]||'';
  const hearts=n=>'♥'.repeat(Math.max(0,Math.min(8,n)))||'–';
  const rels=[S.co==='village'||S.co==='army'?`Cò ${hearts(S.rel.co)}`:'',S.ev.thao&&S.thao!=='gone'?`Thảo ${S.thao==='wife'?'(vợ)':S.thao==='co'?'(vợ Cò)':hearts(S.rel.thao)}`:''].filter(Boolean).join(' · ');
  $('status').innerHTML=`<div><div class="name"></div><div class="sub"><span>${a} tuổi</span><span>Làng An Phú</span></div></div>
   <div class="date">${SEASONS[S.season]} · ${canchi(S.year)} ${S.year}</div>
   <div class="suc">Sức&nbsp;${[0,1,2,3].map(i=>`<i class="${i<S.suc?'on':''}"></i>`).join('')}</div>
   <div class="stats"><div class="stat"><span>Văn</span><b>${S.van}</b></div><div class="stat"><span>Võ</span><b>${S.vo}</b></div><div class="stat"><span>Đức</span><b>${S.duc}</b></div><div class="stat"><span>Tiền</span><b>${S.tien} quan</b></div></div>
   ${pathName?`<div class="path">${pathName}</div>`:''}${rels?`<div class="sub"><span>${rels}</span></div>`:''}${S.items.length?`<div class="sub"><span>Hành trang: ${S.items.join(', ')}</span></div>`:''}`;
  $('status').querySelector('.name').textContent=S.name;
  const qs=Object.entries(S.quests);
  $('quests').innerHTML=`<h3>Việc cần làm</h3>`+(qs.length?qs.sort((x,y)=>(x[1]==='done')-(y[1]==='done')).map(([id,st])=>`<div class="q ${st}"><b>${QUESTS[id].title}</b>${st==='active'?`<span>${QUESTS[id].hint}</span>`:''}</div>`).join(''):`<div class="q"><span>Đi gặp mọi người trong làng để nhận việc.</span></div>`)+`<div class="q"><span>Về nhà để ngủ sang mùa mới, hoặc chọn việc chính và cho thời gian trôi nhanh.</span></div>`;
}
