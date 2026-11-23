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
