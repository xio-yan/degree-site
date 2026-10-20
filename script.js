'use strict';
const PROGRAMS=['互動遊戲設計','數位 3D 動畫設計','AR/VR 體感科技','遊戲美術設計'];
const KEY='usc112-checked-v1';
let checked=new Set();
try {const saved=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(saved)) checked=new Set(saved.filter(x=>COURSES.some(c=>c.code===x)));}catch(_){}
const el=id=>document.getElementById(id);
function persist(){try{localStorage.setItem(KEY,JSON.stringify([...checked]));}catch(_){}}
// Exact b-matching: each completed programme requires four distinct 3-credit courses.
// The single 2-credit course cannot complete 12 credits with fewer than four 3-credit courses.
function matchSubset(selected,ids){
 const eligible=COURSES.filter(c=>checked.has(c.code)&&c.credit===3&&c.programs.some(k=>ids.includes(k)));
 const n=eligible.length,k=ids.length,source=0,cBase=1,pBase=cBase+n,sink=pBase+k,N=sink+1;
 const adj=Array.from({length:N},()=>[]);
 function edge(a,b,cap){let f={to:b,cap,rev:adj[b].length},r={to:a,cap:0,rev:adj[a].length};adj[a].push(f);adj[b].push(r);}
 eligible.forEach((c,i)=>{edge(source,cBase+i,1);ids.forEach((id,j)=>{if(c.programs.includes(id))edge(cBase+i,pBase+j,1);});});
 ids.forEach((id,j)=>edge(pBase+j,sink,4));
 let flow=0;while(true){const prev=Array(N).fill(null),queue=[source];prev[source]=[-1,-1];for(let h=0;h<queue.length&&!prev[sink];h++){let v=queue[h];for(let z=0;z<adj[v].length;z++){const e=adj[v][z];if(e.cap>0&&!prev[e.to]){prev[e.to]=[v,z];queue.push(e.to);}}}if(!prev[sink])break;let v=sink;while(v!==source){let [u,z]=prev[v],e=adj[u][z];e.cap--;adj[v][e.rev].cap++;v=u;}flow++;}
 if(flow!==4*k)return null;
 const allocation=ids.map(id=>({id,courses:[]}));eligible.forEach((c,i)=>{for(let j=0;j<k;j++){const e=adj[cBase+i].find(x=>x.to===pBase+j);if(e&&e.cap===0)allocation[j].courses.push(c);}});
 return allocation;
}
function solve(){let best=null;for(let mask=1;mask<16;mask++){const ids=[0,1,2,3].filter(i=>mask&(1<<i));if(best&&ids.length<best.length)continue;const a=matchSubset(checked,ids);if(a&&(!best||a.length>best.length||(a.length===best.length&&a.flatMap(x=>x.courses).reduce((s,c)=>s+Number(c.code.slice(-3)||0),0)<best.flatMap(x=>x.courses).reduce((s,c)=>s+Number(c.code.slice(-3)||0),0))))best=a;}return best||[];}
function renderDashboard(){let done=COURSES.filter(c=>checked.has(c.code));let best=solve();el('courseCount').innerHTML=done.length+' <small>門</small>';el('creditCount').innerHTML=done.reduce((a,c)=>a+c.credit,0)+' <small>學分</small>';el('programCount').innerHTML=best.length+' <small>/ 4</small>';el('graduation').textContent=best.length>=2?'已達兩學程門檻':'尚未達成';el('graduation').classList.toggle('pass',best.length>=2);
 const earned=(id)=>done.filter(c=>c.programs.includes(id)).reduce((s,c)=>s+c.credit,0);
 el('programCards').innerHTML=PROGRAMS.map((name,id)=>{const used=best.find(a=>a.id===id),potential=earned(id);return `<article class="programCard ${used?'active':''}"><h3>${name}</h3><strong>${used?'12': '0'} <span class="minor">/ 12 學分（最佳認列）</span></strong><div class="track"><div class="fill" style="width:${used?'100':'0'}%"></div></div><span class="chip ${used?'good':''}">${used?'✓ 最佳解完成':'未納入最佳解'}</span><p class="minor">已修可用：${potential} 學分（含重複資格）</p></article>`}).join('');
 el('bestDescription').textContent=best.length?'已找到 '+best.length+' 個學程同時達標的不重複認列方案。每門課最多出現一次。':'目前無法在不重複認列下完成任何學程。';
 el('assignments').innerHTML=best.length?best.map(x=>`<article class="assigned"><h3>✓ ${PROGRAMS[x.id]} · 12 / 12 學分</h3><ul>${x.courses.map(c=>`<li>${c.name} <small>（${c.credit} 學分）</small></li>`).join('')}</ul></article>`).join(''):'<div class="empty">尚無完整認列方案。先到下方勾選已修過的選修課程。</div>';
}
function renderTable(){const q=el('search').value.trim().toLowerCase(),g=el('grade').value,p=el('program').value,only=el('onlyDone').checked;
 const list=COURSES.filter(c=>(!q||(c.name+c.code).toLowerCase().includes(q))&&(!g||c.grade===g)&&(!p||c.programs.includes(Number(p)))&&(!only||checked.has(c.code)));
 const tbody=el('courseRows');tbody.replaceChildren();list.forEach(c=>{const tr=document.createElement('tr');if(checked.has(c.code))tr.className='done';const td=document.createElement('td'),input=document.createElement('input');input.type='checkbox';input.checked=checked.has(c.code);input.setAttribute('aria-label','已修過 '+c.name);input.addEventListener('change',()=>{input.checked?checked.add(c.code):checked.delete(c.code);persist();render();});td.append(input);tr.append(td);[c.grade,c.term,c.code,c.name,c.credit,c.programs.map(i=>PROGRAMS[i]).join('、')||'—'].forEach(v=>{let t=document.createElement('td');t.textContent=v;tr.append(t)});tbody.append(tr);});}
function render(){renderDashboard();renderTable();}
['search','grade','program','onlyDone'].forEach(id=>el(id).addEventListener('input',renderTable));
el('selectAll').addEventListener('click',()=>{const all=checked.size===COURSES.length;checked=all?new Set():new Set(COURSES.map(c=>c.code));persist();render();el('selectAll').textContent=all?'全部勾選':'取消全選';});
el('clearBtn').addEventListener('click',()=>{if(confirm('確定要清除所有已勾選課程？')){checked.clear();persist();render();}});
el('exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({version:1,checked:[...checked]},null,2)],{type:'application/json'}),a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='112級修課紀錄.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
el('importFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data.checked))throw Error();checked=new Set(data.checked.filter(x=>COURSES.some(c=>c.code===x)));persist();render();alert('匯入成功');}catch(_){alert('無法讀取修課紀錄，請選擇此網站匯出的 JSON 檔案。');}e.target.value='';});
render();
