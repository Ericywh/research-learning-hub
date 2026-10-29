(()=>{
'use strict';
const storageKey='econ:v2:modules:completed:20261027';
const themeKey='econ-dark';
let done=new Set();
try{done=new Set(JSON.parse(localStorage.getItem(storageKey)||'[]'))}catch{}
const valid=/^M(0[1-9]|[12][0-9]|3[0-6])$/;
done=new Set([...done].filter(x=>valid.test(x)));
function renderProgress(){
 document.querySelectorAll('[data-module-check]').forEach(x=>{x.checked=done.has(x.dataset.moduleCheck)});
 document.querySelectorAll('[data-progress]').forEach(x=>{x.textContent=done.size+' / 36 模块'});
 document.querySelectorAll('progress').forEach(x=>{x.value=done.size});
}
function saveProgress(){
 try{localStorage.setItem(storageKey,JSON.stringify([...done]))}catch{}
 renderProgress();
}
document.querySelectorAll('[data-module-check]').forEach(x=>x.addEventListener('change',()=>{
 x.checked?done.add(x.dataset.moduleCheck):done.delete(x.dataset.moduleCheck);saveProgress();
}));
renderProgress();
const search=document.querySelector('#module-search');
if(search)search.addEventListener('input',()=>{
 const term=search.value.toLowerCase().trim();
 document.querySelectorAll('.module').forEach(el=>{
  el.hidden=!(el.textContent+' '+(el.dataset.search||'')).toLowerCase().includes(term);
 });
});
async function copyText(value){
 if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(value);return}
 const area=document.createElement('textarea');area.value=value;area.setAttribute('readonly','');
 area.style.position='fixed';area.style.opacity='0';area.style.pointerEvents='none';
 document.body.appendChild(area);area.select();
 let ok=false;try{ok=document.execCommand('copy')}finally{area.remove()}
 if(!ok)throw new Error('Clipboard unavailable');
}
function flash(button,message){
 const previous=button.textContent;button.textContent=message;
 window.setTimeout(()=>{button.textContent=previous},1500);
}
function enhanceCode(){
 document.querySelectorAll('pre').forEach(pre=>{
  if(pre.dataset.econDecorated==='true')return;
  const code=pre.querySelector('code');
  const value=(code?code.innerText:pre.innerText||pre.textContent||'').trim();
  if(!value)return;
  if(pre.previousElementSibling&&pre.previousElementSibling.classList.contains('code-toolbar')){
   pre.dataset.econDecorated='true';return;
  }
  const hint=[pre.dataset.language,pre.className,code?code.className:''].join(' ').toLowerCase();
  let language='代码示例';
  if(/\bstata\b/.test(hint)||/^\s*(clear all|sysuse|set seed|program define|regress|quietly|xtset|xtreg|ivreghdfe|summarize|lincom|nlcom|gen(?:erate)?\s|capture\s|local\s|global\s)/im.test(value))language='STATA';
  else if(/\bpython\b/.test(hint)||/^\s*(import (numpy|pandas|statsmodels|scipy|matplotlib)|from (numpy|pandas|statsmodels|scipy|linearmodels)|def\s|class\s|print\(|rng\s*=|np\.)/im.test(value))language='PYTHON';
  const bar=document.createElement('div');bar.className='code-toolbar';
  const label=document.createElement('span');label.className='code-language';label.textContent=language;
  const note=document.createElement('span');note.className='code-hint';note.textContent='可复制 · 建议先检查数据路径与依赖';
  const button=document.createElement('button');button.type='button';button.className='code-copy';button.textContent='复制代码';
  button.addEventListener('click',async()=>{
   try{await copyText(code?code.innerText:pre.innerText||pre.textContent||'');flash(button,'已复制')}
   catch(e){flash(button,'请手动选择复制')}
  });
  bar.append(label,note,button);pre.before(bar);pre.classList.add('econ-code-block');pre.dataset.econDecorated='true';
 });
}
function bindExistingCopyButtons(){
 document.querySelectorAll('[data-copy]').forEach(button=>{
  if(button.dataset.econCopyBound==='true')return;
  button.dataset.econCopyBound='true';
  button.addEventListener('click',async()=>{
   const parent=button.parentElement;
   const localCode=parent?parent.querySelector('code'):null;
   const localPre=parent?parent.querySelector('pre'):null;
   const scope=button.closest('.code-card,details,section')||parent;
   const code=localCode||(scope?scope.querySelector('code'):null);
   const pre=localPre||(scope?scope.querySelector('pre'):null);
   const value=code?code.innerText:pre?(pre.innerText||pre.textContent):'';
   if(!value){flash(button,'未找到代码');return}
   try{await copyText(value);flash(button,'已复制')}catch(e){flash(button,'请手动复制')}
  });
 });
}
function addAutoToc(){
 const main=document.querySelector('main');
 if(!main||main.querySelector('.toc'))return;
 const sections=[...main.querySelectorAll('section.paper[id^="s"]')].filter(section=>section.querySelector('h2'));
 if(sections.length<3)return;
 const nav=document.createElement('nav');nav.className='toc econ-auto-toc';nav.setAttribute('aria-label','本课章节导航');
 sections.forEach(section=>{
  const heading=section.querySelector('h2');const link=document.createElement('a');
  link.href='#'+section.id;link.textContent=heading.textContent.replace(/^\s*\d+\s*[·.、]?\s*/,'').trim()||heading.textContent;
  nav.appendChild(link);
 });
 const hero=main.querySelector('.hero');
 if(hero)hero.insertAdjacentElement('afterend',nav);else sections[0].before(nav);
}
function addReadingControls(){
 const bar=document.createElement('div');bar.className='econ-reading-progress';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
 const top=document.createElement('button');top.type='button';top.className='econ-back-top';top.textContent='↑';top.setAttribute('aria-label','回到页面顶部');top.title='回到页面顶部';
 top.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
 document.body.appendChild(top);
 let scheduled=false;
 const update=()=>{
  if(scheduled)return;scheduled=true;
  window.requestAnimationFrame(()=>{
   scheduled=false;
   const max=document.documentElement.scrollHeight-window.innerHeight;
   const ratio=max>0?Math.min(1,Math.max(0,window.scrollY/max)):0;
   bar.style.transform='scaleX('+ratio+')';
   top.classList.toggle('is-visible',window.scrollY>420);
  });
 };
 window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update,{passive:true});update();
}
function addThemeToggle(){
 const header=document.querySelector('body>header');
 if(!header||header.querySelector('.econ-theme-toggle'))return;
 const button=document.createElement('button');button.type='button';button.className='econ-theme-toggle';
 const apply=dark=>{
  document.body.dataset.econDark=String(dark);
  button.textContent=dark?'☀ 浅色模式':'◐ 深色模式';
  button.setAttribute('aria-pressed',String(dark));
 };
 let dark=false;try{dark=localStorage.getItem(themeKey)==='true'}catch{}
 apply(dark);
 button.addEventListener('click',()=>{
  const next=document.body.dataset.econDark!=='true';apply(next);
  try{localStorage.setItem(themeKey,String(next))}catch{}
 });
 header.appendChild(button);
}
function init(){
 addAutoToc();enhanceCode();bindExistingCopyButtons();addReadingControls();addThemeToggle();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();