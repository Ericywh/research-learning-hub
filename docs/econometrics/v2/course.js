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

function addCompletionPanel(){
 const main=document.querySelector('main');
 const existing=main&&main.querySelector('[data-module-check]');
 if(!existing||!valid.test(existing.dataset.moduleCheck)||!document.querySelector('.hero h1'))return;
 // Catalogs contain multiple module checks; only a lesson has one unique module.
 const ids=new Set([...main.querySelectorAll('[data-module-check]')].map(x=>x.dataset.moduleCheck));
 if(ids.size!==1)return;
 const id=existing.dataset.moduleCheck;
 const panel=document.createElement('section');panel.className='paper lesson-completion';panel.id='lesson-completion';
 const title=document.createElement('h2');title.textContent='本节学习完成情况';
 const note=document.createElement('p');note.textContent='完成阅读、推导和练习后，可在这里记录学习状态。随时取消勾选，即可恢复为未完成。';
 const label=document.createElement('label');label.className='completion-choice';
 const check=document.createElement('input');check.type='checkbox';check.dataset.moduleCheck=id;
 const text=document.createElement('span');text.textContent='我已完成本节课程学习';
 label.append(check,text);
 const status=document.createElement('p');status.className='completion-status';status.setAttribute('role','status');
 const update=()=>{const complete=done.has(id);panel.classList.toggle('is-complete',complete);status.textContent=complete?'已完成 · 目录进度已同步':'尚未完成 · 可以下次继续学习';};
 const privacy=document.createElement('small');privacy.textContent='进度保存在当前浏览器，不会跨设备同步。';
 panel.append(title,note,label,status,privacy);
 const nav=main.querySelector('nav.nav');if(nav)nav.before(panel);else main.append(panel);
 check.addEventListener('change',()=>{check.checked?done.add(id):done.delete(id);saveProgress();update();});
 existing.addEventListener('change',update);
 window.addEventListener('storage',event=>{if(event.key!==storageKey)return;try{const values=JSON.parse(event.newValue||'[]');done=new Set(Array.isArray(values)?values.filter(x=>valid.test(x)):[]);renderProgress();update();}catch{}});
 renderProgress();update();
 const toc=main.querySelector('.toc');
 if(toc&&!toc.querySelector('[href="#deepening"]')&&main.querySelector('#deepening')){const a=document.createElement('a');a.href='#deepening';a.textContent='进阶讲义';toc.append(a);}
}

function init(){
 addAutoToc();addCompletionPanel();enhanceCode();bindExistingCopyButtons();addReadingControls();addThemeToggle();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();