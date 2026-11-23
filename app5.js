/* ---- paper ---- */
function renderPaper(){
  const n=+profile.pages||3, sel=profile.topics.map(t=>SUB[t].name);
  const rows=[['1','Front page','Stocks, markets and IPOs'],['2','Entertainment','Movies and OTT'],['3','Sport','Scorecard, football and NBA']].slice(0,n);
  $('#v-paper').innerHTML='<div class="pad"><h1>'+esc(profile.name)+'’s edition</h1><p class="lede">'+esc(EDITION.date)+'. '+n+' pages in '+(profile.style==='plain'?'plain black and white':'colour')+', for '+esc(profile.name)+'.</p>'+
   '<div class="sum"><b>Topics</b>: '+esc(sel.join(', '))+'</div>'+rows.map(r=>'<div class="pg"><i>'+r[0]+'</i><div><b>'+esc(r[1])+'</b><span class="hint">'+esc(r[2])+'</span></div></div>').join('')+
   '<p class="hint" style="margin-top:16px">The personal PDF edition is not connected yet in this test. Your cards are updated twice a day.</p></div>';
}

/* ---- sign-up wizard ---- */
const STEPS=['Your name','Your age','Your privacy','Your interests','Final touches'];
let wiz=null;
function newWiz(){return Object.assign({step:0,name:'',age:'',email:'',consent:false,guardian:false,topics:[],other:'',avoid:'',pages:3,style:'colour',err:''},profile?{...profile,consent:true,guardian:!!profile.guardian,step:0,err:''}:{})}
function renderWizard(){
  if(!wiz)wiz=newWiz(); const w=wiz, minor=isMinor(w.age);
  const prog='<div class="prog" aria-hidden="true">'+STEPS.map((_,i)=>'<i class="'+(i<=w.step?'on':'')+'"></i>').join('')+'</div><div class="stepno">Step '+(w.step+1)+' of '+STEPS.length+'</div>';
  let b='';
  if(w.step===0)b='<h1>Welcome. What should we call you?</h1><p class="lede">We build your edition around you.</p><div class="fld"><label for="name">Name</label><input type="text" id="name" autocomplete="given-name" maxlength="40" value="'+esc(w.name)+'"></div>';
  if(w.step===1)b='<h1>How old are you?</h1><p class="lede">Readers under 18 get a safer set of topics and learning notes on money stories.</p><div class="fld"><label for="age">Age</label><input type="number" id="age" inputmode="numeric" min="8" max="100" value="'+esc(w.age)+'"></div>';
  if(w.step===2)b='<h1>Your privacy</h1><p class="lede">This is a test version. Here is exactly what happens to your details.</p><div class="sum"><div><b>Stays on your phone</b>: your name, age and interests are saved only on this device.</div><div><b>Not collected</b>: we do not ask for your email, and your details are never sent anywhere.</div><div><b>Your control</b>: you can change or delete everything from the Profile tab at any time.</div></div><p class="hint">Stories come from public news feeds. We do not track what you read.</p>';
  if(w.step===3)b='<h1>What do you like to read?</h1><p class="lede">Open a heading and tick what interests you. Pick at least one.</p>'+HEADS.map(h=>{const n=h.subs.filter(s=>w.topics.includes(s.id)).length;
    return '<details class="head" style="--c:'+h.c+'"'+(n||h.id==='biz'?' open':'')+'><summary><span class="dot"></span>'+esc(h.name)+'<span class="cnt">'+(n?n+' selected':'')+'</span><svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></summary>'+
    (h.civ&&minor?'<div class="civ">For readers under 18 this covers civics and policy only. No crime, violence or divisive stories.</div>':'')+
    '<div class="chips" data-h="'+h.id+'">'+h.subs.map(s=>'<button type="button" class="ch" data-t="'+s.id+'" aria-pressed="'+w.topics.includes(s.id)+'">'+esc(s.name)+(s.wip?'<span class="soon">in progress</span>':'')+'</button>').join('')+(h.subs.some(s=>s.wip)?'<p class="hint">In progress: we are still finding reliable sources. Tick them anyway and we will add them as they go live.</p>':'')+'</div></details>'}).join('');
  if(w.step===4)b='<h1>Anything else?</h1><p class="lede">All optional. We match what you type to a section we already cover, and add new ones once we find reliable sources.</p>'+
    '<div class="fld"><label for="other">Something you want to read about</label><textarea id="other" maxlength="120" placeholder="Up to two topics, for example F1 or chess">'+esc(w.other)+'</textarea></div>'+
    '<div class="fld"><label for="avoid">Anything you do not want to see?</label><input type="text" id="avoid" maxlength="80" value="'+esc(w.avoid)+'"></div>'+
    '<div class="fld"><span class="lab">Paper length</span><div class="seg" id="len"><button type="button" class="ch" data-n="2" aria-pressed="'+(+w.pages===2)+'">2 pages</button><button type="button" class="ch" data-n="3" aria-pressed="'+(+w.pages===3)+'">3 pages</button></div></div>'+
    '<div class="fld"><span class="lab">Style</span><div class="seg" id="sty"><button type="button" class="ch" data-s="colour" aria-pressed="'+(w.style!=='plain')+'">Colour</button><button type="button" class="ch" data-s="plain" aria-pressed="'+(w.style==='plain')+'">Plain</button></div></div>';
  const last=w.step===STEPS.length-1;
  $('#v-profile').innerHTML='<form class="pad" id="form" novalidate>'+prog+b+(w.err?'<div class="note bad" role="alert">'+esc(w.err)+'</div>':'')+
   '<div class="nav2'+(w.step===0&&!profile?' one':'')+'">'+(w.step>0||profile?'<button type="button" class="btn ghost" id="back">'+(w.step>0?'Back':'Cancel')+'</button>':'')+'<button class="btn" type="submit">'+(last?(profile?'Save changes':'Build my edition'):'Continue')+'</button></div></form>';
  bindWizard();
}
function bindWizard(){
  const w=wiz, on=(id,ev,f)=>{const e=$(id);if(e)e[ev]=f};
  on('#name','oninput',e=>w.name=e.target.value); on('#age','oninput',e=>w.age=e.target.value); on('#email','oninput',e=>w.email=e.target.value);
  on('#consent','onchange',e=>w.consent=e.target.checked); on('#guardian','onchange',e=>w.guardian=e.target.checked);
  on('#other','oninput',e=>w.other=e.target.value); on('#avoid','oninput',e=>w.avoid=e.target.value);
  on('#len','onclick',e=>{const b=e.target.closest('button');if(!b)return;w.pages=+b.dataset.n;[...$('#len').children].forEach(x=>x.setAttribute('aria-pressed',String(x===b)))});
  on('#sty','onclick',e=>{const b=e.target.closest('button');if(!b)return;w.style=b.dataset.s;[...$('#sty').children].forEach(x=>x.setAttribute('aria-pressed',String(x===b)))});
  document.querySelectorAll('.head .chips').forEach(c=>c.onclick=e=>{const b=e.target.closest('button');if(!b)return;const id=b.dataset.t,i=w.topics.indexOf(id);if(i<0)w.topics.push(id);else w.topics.splice(i,1);b.setAttribute('aria-pressed',String(i<0));
    const h=HEADS.find(x=>x.id===c.dataset.h),n=h.subs.filter(s=>w.topics.includes(s.id)).length;c.closest('.head').querySelector('.cnt').textContent=n?n+' selected':''});
  on('#back','onclick',()=>{if(w.step>0){w.step--;w.err='';renderWizard()}else{wiz=null;route()}});
  on('#form','onsubmit',next);
  const f=$('#name,#age,#email'); if(f&&!f.value)f.focus();
}
async function next(e){
  e.preventDefault(); const w=wiz; w.err='';
  if(w.step===0&&!w.name.trim())w.err='Add your name so we can address your edition.';
  else if(w.step===1&&!(+w.age>=8&&+w.age<=100))w.err='Enter an age between 8 and 100.';
  else if(w.step===3&&!w.topics.length)w.err='Pick at least one interest to continue.';
  if(w.err){renderWizard();return}
  if(w.step<STEPS.length-1){w.step++;renderWizard();$('#v-profile').scrollTop=0;return}
  await finish();
}
async function finish(){
  const w=wiz, age=+w.age, minor=age<18; let topics=[...w.topics];
  const items=w.other.split(/[,;\n]| and /i).map(s=>s.trim()).filter(Boolean).slice(0,2);
  const blocked=[],pending=[],matched=[];
  items.forEach(it=>{
    if(minor&&BLOCK.test(it)){blocked.push(it);return}
    const m=matchTopics(it); if(m.length){m.forEach(id=>{if(!topics.includes(id)){topics.push(id);matched.push(SUB[id].name)}})}else pending.push(it)});
  const p={name:w.name.trim(),age,email:w.email.trim(),guardian:minor&&w.guardian,topics,other:items.join(', '),pending,avoid:w.avoid.trim(),pages:w.pages,style:w.style,savedAt:Date.now()};
  await saveEverywhere(p); wiz=null;
  const bits=[]; if(blocked.length)bits.push('We skipped "'+blocked.join('", "')+'" because it is not available for readers under 18.');
  if(pending.length)bits.push('We noted "'+pending.join('", "')+'" and will add it once we find reliable sources.');
  if(matched.length)bits.push('Matched your request to '+matched.join(', ')+'.');
  if(signupMsg)bits.push(signupMsg);
  tab='cards'; route();
  if(bits.length){const d=document.createElement('div');d.className='pad';d.innerHTML='<div class="note good" style="margin:0">'+bits.map(esc).join(' ')+'</div>';$('#v-cards').prepend(d)}
}

/* ---- profile tab ---- */
function renderProfile(){
  const p=profile, names=p.topics.map(t=>SUB[t].name);
  $('#v-profile').innerHTML='<div class="pad"><h1>Your profile</h1><p class="lede">Check or change your details any time.</p>'+
   '<div class="sum"><div><b>Name</b>: '+esc(p.name)+'</div><div><b>Age</b>: '+esc(p.age)+'</div><div><b>Interests</b>: '+esc(names.join(', '))+'</div>'+
   (p.pending&&p.pending.length?'<div><b>Requested</b>: '+esc(p.pending.join(', '))+' (waiting for reliable sources)</div>':'')+(p.avoid?'<div><b>Hidden</b>: '+esc(p.avoid)+'</div>':'')+
   '<div><b>Paper</b>: '+p.pages+' pages, '+esc(p.style)+'</div></div>'+
   (signupMsg?'<div class="note">'+esc(signupMsg)+'</div>':'')+
   '<div class="nav2 one" style="gap:10px"><button class="btn" id="edit">Edit my details</button><button class="btn danger" id="del">Delete my data</button></div>'+
   '<p class="hint" style="margin-top:12px">Deleting removes your profile from this device. Nothing is stored anywhere else.</p></div>';
  $('#edit').onclick=()=>{wiz=newWiz();renderWizard()};
  $('#del').onclick=function(){if(this.dataset.sure){wipe()}else{this.dataset.sure=1;this.textContent='Tap again to delete everything'}};
}
