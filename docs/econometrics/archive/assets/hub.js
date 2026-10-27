(()=>{'use strict';
function progress(data,key){if(!data||!Array.isArray(data.chapters))return;const all=data.chapters.flatMap(c=>c.lessons||[]),live=all.filter(l=>l.published&&l.url).length;document.querySelectorAll('[data-progress="'+key+'"]').forEach(el=>{el.textContent=live+' / '+all.length+' 节已归档'});}
progress(window.MATH_COURSE,'math');progress(window.ECON_COURSE,'econ');
// Keep the public latest-lecture link synchronized with the canonical catalog.
// Both the site home and the six-course hub use this shared script.
function updateLatestEconometrics(data){
  if(!data || !Array.isArray(data.chapters)) return;
  const lessons=data.chapters.flatMap(c=>c.lessons||[]);
  const latest=lessons.filter(l=>l.published && /^lessons\/\d{2}-\d{2}\.html$/.test(l.url||'')).at(-1);
  const link=document.querySelector('.latest-list a[href*="econometrics/lessons/"]');
  if(!latest || !link) return;
  const prefix=link.getAttribute('href').startsWith('../')?'../':'';
  link.href=prefix+'econometrics/'+latest.url;
  const label=link.querySelector('span');
  if(!label) return;
  const small=document.createElement('small');
  small.textContent=latest.title;
  label.replaceChildren(document.createTextNode('计量经济学 · 第'+latest.chapter+'章第'+latest.section+'节'),document.createElement('br'),small);
}
updateLatestEconometrics(window.ECON_COURSE);

const search=document.getElementById('course-search');const pills=[...document.querySelectorAll('[data-group-filter]')];const cards=[...document.querySelectorAll('.course-card[data-group]')];const status=document.getElementById('filter-status');const empty=document.getElementById('no-results');let active='all';
function render(){if(!cards.length)return;const q=search?search.value.trim().toLocaleLowerCase():'';let shown=0;for(const card of cards){const text=card.textContent.toLocaleLowerCase();const match=(active==='all'||card.dataset.group===active)&&(!q||text.includes(q));card.hidden=!match;if(match)shown++;}
if(status)status.textContent='显示 '+shown+' / '+cards.length+' 门课程';if(empty)empty.hidden=shown!==0;}
if(search)search.addEventListener('input',render);for(const btn of pills)btn.addEventListener('click',()=>{active=btn.dataset.groupFilter;for(const item of pills)item.setAttribute('aria-pressed',String(item===btn));render()});render();
})();