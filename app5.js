let io=null;
function watchPos(n,m){
  if(io)io.disconnect();
  io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>.5){const i=+e.target.dataset.i;$('#pos').textContent=i<n?(i+1)+' of '+n:i===n?'All caught up':'Suggested '+(i-n)+' of '+m}})},{root:$('#v-cards'),threshold:[.5]});
  $('#v-cards').querySelectorAll('.card').forEach(c=>io.observe(c));
  $('#pos').textContent=n?'1 of '+n:'';
}

/* ---- paper ---- */
function bodyOf(s){return s.card&&!/^Read the full report/.test(s.card)?s.card:''}
function pStory(s,lead){
  const h=HEAD[s.topic],body=bodyOf(s),u=s.sources&&s.sources[0]&&s.sources[0].url,l=labelOf(s),acc=ACCENT[h.id]||'#F6D34A';
  const tag=l==='multi'?'Two or more sources':l==='data'?'Live data':'Single source';
  const src=s.sources&&s.sources.length?s.sources.slice(0,2).map(x=>x.outlet).join(', '):s.source;
  const hd=u?'<a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+esc(s.headline)+'</a>':esc(s.headline);
  return '<article class="ps'+(lead?' lead':'')+'" style="--c:'+h.c+'">'+
   (lead?'<div class="lart" style="--c:'+h.c+'">'+artSvg(s.topic,acc,s.id||s.headline)+'</div>':'')+
   '<div class="pk">'+esc(s.kicker)+'</div><h3>'+hd+'</h3>'+(s.sub?'<p class="psub">'+esc(s.sub)+'</p>':'')+(body?'<p>'+esc(lead?body:body.length>150?body.slice(0,150).replace(/\s+\S*$/,'')+'…':body)+'</p>':'')+
   '<div class="pm">'+esc(src)+' · '+tag+'</div></article>'}
function buildPaper(){
  const n=Math.max(2,+profile.pages||3),list=visibleStories();
  if(!list.length)return null;
  const lead=list[0],front=list.slice(1,5),picked=list.slice(5,5+(n-1)*10),by={};
  picked.forEach(s=>{const k=HEAD[s.topic].id;(by[k]=by[k]||[]).push(s)});
  const heads=HEADS.filter(h=>by[h.id]).sort((a,b)=>by[b.id].length-by[a.id].length);
  const pages=Array.from({length:n-1},()=>({heads:[],cnt:0}));
  heads.forEach(h=>{const q=pages.reduce((x,y)=>y.cnt<x.cnt?y:x);q.heads.push(h);q.cnt+=by[h.id].length});
  pages.forEach(q=>q.heads.sort((x,y)=>HEADS.indexOf(x)-HEADS.indexOf(y)));
  return {lead,front,by,pages:pages.filter(q=>q.heads.length)}}
function renderPaper(){
  const v=$('#v-paper'),P=buildPaper(),foot='<div class="pfoot">Every headline links to its source. Stories from one outlet are marked “Single source”.</div>';
  if(!P){v.innerHTML='<div class="pad"><h1>Your paper</h1><p class="lede">There are no verified stories for your topics yet. Check back after the next update.</p></div>';return}
  const dl=(pg)=>'<div class="dl"><span>'+esc(EDITION.date)+'</span><span>'+esc(EDITION.stamp)+'</span><span>Page '+pg+'</span></div>';
  const inside=P.pages.map((q,i)=>q.heads.map(h=>h.name).join(', ')+' p.'+(i+2)).join(' · ');
  let h='<div class="paper'+(profile.style==='plain'?' plain':'')+'"><div class="pbar"><button class="btn" id="pdf">Download as PDF</button></div>'+
   '<section class="sheet"><header class="mast"><div class="kick">Prepared for '+esc(profile.name)+'</div><h2>T.S Times</h2></header>'+dl(1)+
   (inside?'<div class="inside"><b>Inside</b> '+esc(inside)+'</div>':'')+pStory(P.lead,true)+
   (P.front.length?'<div class="secbar">Top stories for you</div><div class="cols">'+P.front.map(x=>pStory(x)).join('')+'</div>':'')+foot+'</section>';
  P.pages.forEach((q,i)=>{h+='<section class="sheet"><div class="runhead"><span class="fr">T.S Times</span><span>'+esc(profile.name)+'’s edition</span></div>'+dl(i+2)+
    q.heads.map(hd=>'<div class="secbar" style="--c:'+hd.c+'">'+esc(hd.name)+'</div><div class="cols">'+P.by[hd.id].map(x=>pStory(x)).join('')+'</div>').join('')+foot+'</section>'});
  v.innerHTML=h+'</div>'; v.scrollTop=0;
  $('#pdf').onclick=()=>{window.print()};
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