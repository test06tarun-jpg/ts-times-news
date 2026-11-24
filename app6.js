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
  const p={name:w.name.trim(),age,email:w.email.trim(),guardian:minor&&w.guardian,topics,other:items.join(', '),pending,avoid:w.avoid.trim(),fav:(profile?.fav||[]).filter(t=>topics.includes(t)),pages:w.pages,style:w.style,savedAt:Date.now()};
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
   '<div class="sum"><b>Your top picks</b> <span class="hint">Up to 3. They lead your cards and your paper.</span><div class="chips" id="favs" style="margin-top:8px">'+p.topics.map(t=>'<button type="button" class="ch" data-t="'+t+'" aria-pressed="'+((p.fav||[]).includes(t))+'">'+esc(SUB[t].name)+'</button>').join('')+'</div></div>'+
   (signupMsg?'<div class="note">'+esc(signupMsg)+'</div>':'')+
   '<div class="nav2 one" style="gap:10px"><button class="btn" id="edit">Edit my details</button><button class="btn danger" id="del">Delete my data</button></div>'+
   '<p class="hint" style="margin-top:12px">Deleting removes your profile from this device. Nothing is stored anywhere else.</p></div>';
  document.querySelectorAll('#favs .ch').forEach(b=>b.onclick=()=>{const f=new Set(profile.fav||[]),t=b.dataset.t;if(f.has(t))f.delete(t);else if(f.size<3)f.add(t);profile.fav=[...f];saveEverywhere(profile);renderProfile()});
  $('#edit').onclick=()=>{wiz=newWiz();renderWizard()};
  $('#del').onclick=function(){if(this.dataset.sure){wipe()}else{this.dataset.sure=1;this.textContent='Tap again to delete everything'}};
}

/* ---- shell ---- */
function route(){
  const onboarding=!profile||wiz;
  $('#nav').hidden=!!onboarding;
  ['cards','paper','profile'].forEach(k=>{$('#v-'+k).hidden=onboarding?k!=='profile':k!==tab;$('#t-'+k).setAttribute('aria-selected',String(k===tab))});
  if(onboarding){$('#pos').textContent='';renderWizard();return}
  if(tab==='cards')renderCards(); else{$('#pos').textContent='';tab==='paper'?renderPaper():renderProfile()}
}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{tab=b.dataset.v;route()});
profile=lsGet(); route(); initDb(); loadLive();
