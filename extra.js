'use strict';
const EXTRA_KEY='usc112-extra-v2';
let extra={courses:[],interest:[],free:[]};
try {const v=JSON.parse(localStorage.getItem(EXTRA_KEY)||'{}');extra={courses:Array.isArray(v.courses)?v.courses:[],interest:Array.isArray(v.interest)?v.interest:[],free:Array.isArray(v.free)?v.free:[]};}catch(_){}
function persistExtra(){localStorage.setItem(EXTRA_KEY,JSON.stringify(extra));}
const englishCodes=ENGLISH.map(x=>x[0]);
const ordinaryRequired=Object.entries(REQUIRED).flatMap(([kind,items])=>items.filter(c=>!englishCodes.includes(c[0])).map(c=>({kind,code:c[0],name:c[1],credit:c[2]})));
function total(items){return items.reduce((v,x)=>v+(+x.credit||0),0);}
function interestCheck(){const selected=extra.interest.filter(x=>x.done);return {credits:total(selected),count:selected.length,fields:new Set(selected.map(x=>x.field)).size};}
function extraSnapshot(){const req=ordinaryRequired.filter(x=>extra.courses.includes(x.code));const english=ENGLISH.filter(x=>extra.courses.includes(x[0]));const category=k=>total(req.filter(x=>x.kind===k));const interest=interestCheck();const free=total(extra.free.filter(x=>x.done));const sys=COURSES.filter(c=>checked.has(c.code)).reduce((a,c)=>a+c.credit,0);const school=category('校訂必修')+Math.min(8,english.length*2);const reqAll=school+category('院訂必修')+category('系訂必修');return {english:english.length,school,dept:category('系訂必修'),college:category('院訂必修'),interest,free,sys,grand:reqAll+interest.credits+free+sys};}
function addRow(area){if(area==='interest'){extra.interest.push({name:'',field:INTEREST_FIELDS[0],credit:2,done:false});}else {extra.free.push({name:'',credit:2,done:false});}persistExtra();renderExtra();}
function renderExtra(){const snap=extraSnapshot();let panels=['校訂必修','院訂必修','系訂必修'].map(kind=>{
 const list=ordinaryRequired.filter(c=>c.kind===kind); const target=kind==='校訂必修'?10:kind==='院訂必修'?8:51;
 const earned=total(list.filter(c=>extra.courses.includes(c.code)));
 return `<article class="extraPanel"><h3>${kind} <span class="muted">${earned}/${target} 學分（不含英文）</span></h3><div class="courseOptions">${list.map(c=>`<label><input type="checkbox" data-req="${c.code}" ${extra.courses.includes(c.code)?'checked':''}> ${c.name} <small>（${c.credit}）</small></label>`).join('')}</div></article>`;
 });
 el('requiredPanels').innerHTML=panels.join('');
 el('englishPanel').innerHTML=`<article class="extraPanel"><h3>大學英文：${Math.min(snap.english,4)}/4 門 · ${Math.min(snap.english*2,8)}/8 學分</h3><p class="minor">十門不同課程任選四門通過；新舊混搭均可。超過四門不重複計入這組必修。</p><div class="courseOptions">${ENGLISH.map(([code,name])=>`<label><input type="checkbox" data-req="${code}" ${extra.courses.includes(code)?'checked':''}> ${name} <small>（2）</small></label>`).join('')}</div></article>`;
 el('interestRows').innerHTML=extra.interest.map((x,i)=>`<div class="customRow"><input aria-label="興趣自選課程名稱" placeholder="課程名稱" data-list="interest" data-i="${i}" data-f="name" value="${escapeAttr(x.name)}"><select data-list="interest" data-i="${i}" data-f="field">${INTEREST_FIELDS.map(v=>`<option ${x.field===v?'selected':''}>${v}</option>`).join('')}</select><input type="number" min="0" max="20" step="0.5" aria-label="學分" data-list="interest" data-i="${i}" data-f="credit" value="${x.credit}"><label><input type="checkbox" data-list="interest" data-i="${i}" data-f="done" ${x.done?'checked':''}> 通過</label><button data-remove="interest" data-i="${i}" aria-label="刪除">✕</button></div>`).join('');
 el('freeRows').innerHTML=extra.free.map((x,i)=>`<div class="customRow"><input aria-label="自由選修課程名稱" placeholder="課程名稱" data-list="free" data-i="${i}" data-f="name" value="${escapeAttr(x.name)}"><input type="number" min="0" max="20" step="0.5" data-list="free" data-i="${i}" data-f="credit" value="${x.credit}"><label><input type="checkbox" data-list="free" data-i="${i}" data-f="done" ${x.done?'checked':''}> 通過</label><button data-remove="free" data-i="${i}" aria-label="刪除">✕</button></div>`).join('');
 el('extraSummary').innerHTML=[['校訂必修（含英文）',snap.school,18],['院訂必修',snap.college,8],['系訂必修',snap.dept,51],['興趣自選',snap.interest.credits,10],['系選修',snap.sys,12],['自由選修／外系課程',snap.free,null],['已登錄總學分',snap.grand,128]].map(([n,v,t])=>`<div class="summaryLine"><span>${n}</span><strong>${v}${t!==null?' / '+t:''}</strong></div>`).join('')+`<p class="minor">興趣自選已通過 ${snap.interest.count}/5 門、跨 ${snap.interest.fields}/4 領域；兩學程 ${solve().length>=2?'達標':'未達標'}。總學分僅計網站內登錄項目，其他抵免需自行核對。</p>`;
 el('allGraduated').textContent=snap.grand>=128&&snap.school>=18&&snap.college>=8&&snap.dept>=51&&snap.interest.credits>=10&&snap.interest.count>=5&&snap.interest.fields>=4&&solve().length>=2&&snap.sys+snap.free>=41?'已符合網站檢核條件（仍須學校審核）':'尚有畢業條件未達成';
}
function escapeAttr(s){return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');}
function handleExtra(e){const t=e.target;if(t.dataset.req){extra.courses=t.checked?[...new Set([...extra.courses,t.dataset.req])]:extra.courses.filter(x=>x!==t.dataset.req);}else if(t.dataset.remove){extra[t.dataset.remove].splice(Number(t.dataset.i),1);}else if(t.dataset.list){const obj=extra[t.dataset.list][Number(t.dataset.i)];obj[t.dataset.f]=t.dataset.f==='done'?t.checked:t.dataset.f==='credit'?Number(t.value):t.value;}else return;persistExtra();renderExtra();}
['requiredPanels','englishPanel','interestRows','freeRows'].forEach(id=>{el(id).addEventListener('change',handleExtra);el(id).addEventListener('click',e=>{if(e.target.dataset.remove)handleExtra(e);});});
el('addInterest').addEventListener('click',()=>addRow('interest'));el('addFree').addEventListener('click',()=>addRow('free'));
const originalRender=render;render=function(){originalRender();renderExtra();};
renderExtra();
