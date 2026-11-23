function hashOf(t){let h=0;for(const c of String(t))h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)}
const WORDS={stocks:'STOCKS',ipos:'IPOS',finance:'FINANCE',f1:'F1',ott:'OTT',gadgets:'GADGETS',fashion:'FASHION',exams:'EXAMS',careers:'CAREERS',climate:'CLIMATE',world:'WORLD',courts:'COURTS',policy:'POLICY',nba:'NBA',ai:'AI'};
function trimUri(c){const svg="<svg xmlns='http://www.w3.org/2000/svg' width='36' height='16' viewBox='0 0 36 16'><g fill='"+c+"'><path d='M4 8C4 2 12 1 13 6C14 11 7 13 4 8Z'/><circle cx='22' cy='8' r='2.6'/><path d='M30 8l3-4 3 4-3 4Z'/></g></svg>";return "url('data:image/svg+xml,"+encodeURIComponent(svg).replace(/'/g,'%27')+"')"}
function wordSvg(sub,acc){const w=WORDS[sub]||(SUB[sub]?SUB[sub].name.split(/[ &·]/)[0]:'NEWS').toUpperCase();const fs=Math.min(124,Math.floor(380/(0.64*w.length)));return '<svg class="gw" viewBox="0 0 400 120" aria-hidden="true"><text x="8" y="'+(fs>100?102:fs+8)+'" font-family="Playfair Display,Georgia,serif" font-weight="900" font-size="'+fs+'" letter-spacing="-3" fill="'+acc+'">'+w+'</text></svg>'}
function arcsSvg(acc){return '<svg class="arcs" viewBox="0 0 300 300" aria-hidden="true"><g fill="none" stroke="'+acc+'" stroke-width="22"><circle cx="260" cy="290" r="110" stroke-opacity=".22"/><circle cx="260" cy="290" r="160" stroke-opacity=".14"/><circle cx="260" cy="290" r="210" stroke-opacity=".09"/></g></svg>'}
function artSvg(sub,acc,seed){const rot=(hashOf(seed)%9)-4;const g=(ART[sub]||ART.world).replace(/ACC/g,acc).replace(/DK/g,'rgba(0,0,0,.25)');return '<svg class="bg" viewBox="0 0 380 330" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g transform="rotate('+rot+' 190 165)">'+g+'</g></svg>'}

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let profile=null, tab='cards', signupMsg='';

/* ---- storage: this browser always; shared store when the viewer is signed in ---- */
function lsGet(){try{return JSON.parse(localStorage.getItem('tst-profile')||'null')}catch(e){return null}}
function lsSet(p){try{if(p)localStorage.setItem('tst-profile',JSON.stringify(p));else localStorage.removeItem('tst-profile')}catch(e){}}
let dbh=null, uid=null;
async function initDb(){
  try{
    const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);
    if(!db||!user)return;
    uid=await user.id(); if(!uid)return;
    dbh=db;
    const snap=await Promise.race([db.collection('data/users/'+uid).doc('profile').get(),new Promise(r=>setTimeout(()=>r(null),8000))]);
    if(snap&&snap.exists&&!profile){profile=snap.data();lsSet(profile);route()}
  }catch(e){dbh=null}
}
async function saveEverywhere(p){
  profile=p; lsSet(p); signupMsg='';
  if(!dbh||!uid){return}
  try{
    await dbh.collection('data/users/'+uid).doc('profile').set(p);
    await dbh.collection('signups').doc(uid).set({name:p.name,email:p.email,age:p.age,topics:p.topics,consent:true,guardian:!!p.guardian,pages:p.pages,style:p.style,other:p.other,avoid:p.avoid,ts:Date.now()});
  }catch(e){signupMsg='Your profile is saved on this device, but the sign-up record could not be updated. Try again from the Profile tab.'}
}
async function wipe(){
  try{if(dbh&&uid){await dbh.collection('signups').doc(uid).delete();await dbh.collection('data/users/'+uid).doc('profile').delete()}}catch(e){}
  profile=null; lsSet(null); wiz=null; route();
}

const isMinor=a=>a!=null&&a!==''&&+a<18;
function matchTopics(text){return Object.values(SUB).filter(s=>s.kw.test(text)).map(s=>s.id)}

/* ---- cards ---- */
const FEED_URL='https://raw.githubusercontent.com/test06tarun-jpg/ts-times-news/main/stories.json'; /* set to the stories.json address once the news pipeline is running */
function okForReader(s){return !(s.sensitive&&isMinor(profile.age))}
function visibleStories(){const sel=new Set(profile?.topics||[]);return STORIES.filter(s=>sel.has(s.topic)&&okForReader(s))}
async function loadLive(){
  if(!FEED_URL)return;
  try{
    const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),8000);
    const r=await fetch(FEED_URL+'?t='+Date.now(),{signal:ctl.signal,cache:'no-store'});clearTimeout(t);
    const d=await r.json(); if(!d.stories||!d.stories.length)return;
    STORIES=d.stories.filter(x=>SUB[x.topic]); EDITION={date:d.date,stamp:d.stamp,sample:false};
    if(profile&&tab==='cards')renderCards();
  }catch(e){/* keep the sample edition if the live file cannot be loaded */}
}
function labelOf(s){return /SportRadar/i.test(s.source)?'data':s.label}
function chip(s){const l=labelOf(s);
  const t={multi:'Two or more sources',single:'Single source',data:'Live data feed'}[l];
  const ic=l==='multi'?'<path d="M5 12l4 4 10-10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>':l==='single'?'<circle cx="12" cy="12" r="4" fill="currentColor"/>':'<path d="M4 12h4l3-6 3 12 3-6h3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>';
  return '<span class="chip '+l+'"><svg width="13" height="13" viewBox="0 0 24 24">'+ic+'</svg>'+t+'</span>'}
function cardHtml(s,i,sug){
  const extra=(s.full||[]).filter(p=>!s.card.includes(p.trim()));
  const sub=SUB[s.topic]||SUB.stocks, h=HEAD[s.topic]||HEADS[0];
  const edu=isMinor(profile.age)&&sub.edu?'<div class="edu">For learning only. This is not advice to buy or sell.</div>':'';
  const img=s.img?'<img src="'+esc(s.img)+'" alt="" loading="lazy">'+(s.credit?'<span class="credit">'+esc(s.credit)+'</span>':''):'';
  const ic='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(ICON[s.topic]||'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>')+'</svg>';
  const body=s.card&&!/^Read the full report/.test(s.card)?s.card:'', hl=s.headline.length, hc=(hl<=50?'h-s':hl<=90?'h-m':'h-l')+(body?'':' nobody'), acc=ACCENT[h.id]||'#F6D34A';
  return '<article class="card" data-i="'+i+'"><div class="cardin" style="--c:'+h.c+';--a:'+acc+';--trim:'+trimUri(acc)+'">'+wordSvg(s.topic,acc)+
   '<div class="art">'+arcsSvg(acc)+artSvg(s.topic,acc,s.id||s.headline)+img+'<div class="tagrow">'+ic+'<span>'+esc(s.kicker)+'</span>'+(sug?'<span class="sug">Suggested</span>':'')+'</div></div>'+
   '<div class="cbody"><h2 class="'+hc+'">'+esc(s.headline)+'</h2>'+(s.sub?'<p class="sub">'+esc(s.sub)+'</p>':'')+
   (body?'<p>'+esc(body)+'</p>':'')+'<div class="meta">'+chip(s)+'<span>'+(s.sources&&s.sources.length?s.sources.map(o=>'<a href="'+esc(o.url)+'" target="_blank" rel="noopener noreferrer">'+esc(o.outlet)+'</a>').join(', ')+' · '+esc((s.source.match(/\(([^)]*)\)$/)||[,''])[1]):esc(s.source))+'</span></div>'+
   (s.why?'<div class="why"><b>Why it matters</b>'+esc(s.why)+'</div>':'')+edu+
   (extra.length?'<div class="full" hidden>'+extra.map(p=>'<p>'+esc(p)+'</p>').join('')+'</div>'+
   '<button class="more" aria-expanded="false"><span>More detail</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button>':'')+'</div></div></article>';
}
function renderCards(){
  const v=$('#v-cards'), list=visibleStories(), have=new Set(list.map(s=>s.topic));
  const quiet=(profile.topics||[]).filter(t=>!have.has(t)).map(t=>SUB[t].name);
  const pool=STORIES.filter(x=>!(profile.topics||[]).includes(x.topic)&&okForReader(x)&&(profile.age>=18||!BLOCK.test(x.headline+' '+x.card)));
  const seen=new Set(), sug=[...pool.filter(x=>!seen.has(HEAD[x.topic].id)&&seen.add(HEAD[x.topic].id)),...pool].filter((x,i,a)=>a.indexOf(x)===i).slice(0,4);
  let h=list.map((x,i)=>cardHtml(x,i)).join('');
  h+='<article class="card end" data-i="'+list.length+'"><div class="cardin"><div class="tick"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 12l4 4 10-10"/></svg></div>'+
   '<h2>You’re all caught up</h2><p>'+(list.length?'You have read every verified story we have for your topics today.':'We have no verified stories for your topics yet.')+'</p><p class="hint">'+(EDITION.sample?'Sample edition. ':'')+esc(EDITION.stamp)+', '+esc(EDITION.date)+'.</p>'+
   (quiet.length?'<div class="quiet"><b>Still being researched:</b> '+esc(quiet.join(', '))+'. We are finding reliable sources for these and will show them once they pass our checks.</div>':'')+
   (sug.length?'<div class="quiet"><b>Want a bit more?</b> Scroll down for '+sug.length+' stories from other topics.</div>':'')+'</div></article>';
  h+=sug.map((x,i)=>cardHtml(x,list.length+1+i,true)).join('');
  v.innerHTML=h; v.scrollTop=0;
  v.querySelectorAll('.more').forEach(b=>b.onclick=()=>{const f=b.parentElement.querySelector('.full');const o=f.hidden;f.hidden=!o;b.setAttribute('aria-expanded',String(o));b.firstElementChild.textContent=o?'Show less':'More detail'});
  watchPos(list.length,sug.length);
}
let io=null;
function watchPos(n,m){
  if(io)io.disconnect();
  io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>.5){const i=+e.target.dataset.i;$('#pos').textContent=i<n?(i+1)+' of '+n:i===n?'All caught up':'Suggested '+(i-n)+' of '+m}})},{root:$('#v-cards'),threshold:[.5]});
  $('#v-cards').querySelectorAll('.card').forEach(c=>io.observe(c));
  $('#pos').textContent=n?'1 of '+n:'';
}
