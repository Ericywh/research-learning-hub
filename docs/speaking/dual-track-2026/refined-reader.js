/* Optional local countdown. Does not record audio, alter tasks or set completion. */
(function(){
"use strict";
const panel=document.querySelector('.speaking-refined .practice-timer');
if(!panel)return;
const display=panel.querySelector('[data-timer-display]');
const toggle=panel.querySelector('[data-timer-toggle]');
const reset=panel.querySelector('[data-timer-reset]');
const preset=panel.querySelector('[data-timer-preset]');
const status=panel.querySelector('[data-timer-status]');
let seconds=Number(panel.dataset.timerSeconds),remaining=seconds*1000,deadline=0,tick=null;
function paint(){const s=Math.ceil(Math.max(0,remaining)/1000);display.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
function stop(){if(tick!==null)clearInterval(tick);tick=null;toggle.textContent='继续计时';if(preset)preset.disabled=false;}
function update(){remaining=Math.max(0,deadline-Date.now());paint();if(remaining===0){stop();toggle.textContent='重新开始';status.textContent='本轮计时结束，请保存录音并按课页要求继续。';}}
toggle.addEventListener('click',()=>{
 if(tick!==null){remaining=Math.max(0,deadline-Date.now());stop();paint();status.textContent='已暂停，录音请自行管理。';return;}
 if(remaining<=0)remaining=seconds*1000;
 deadline=Date.now()+remaining;tick=setInterval(update,200);toggle.textContent='暂停';if(preset)preset.disabled=true;status.textContent='正在计时，不会自动录音或标记完成。';update();
});
reset.addEventListener('click',()=>{stop();remaining=seconds*1000;paint();toggle.textContent='开始计时';status.textContent='已重置，原有录音不受影响。';});
if(preset)preset.addEventListener('change',()=>{seconds=Number(preset.value);stop();remaining=seconds*1000;paint();toggle.textContent='开始计时';status.textContent='本轮时长已切换，请仍以题目要求为准。';});
paint();
})();

/* Reversible reader controls. They never expand references or change progress. */
(function(){
"use strict";
const page=document.querySelector('.speaking-refined');
if(!page)return;
const size=document.querySelector('[data-reader-size]');
const focus=document.querySelector('[data-reader-focus]');
const status=document.querySelector('[data-reader-status]');
const position=document.querySelector('[data-reading-position]');
let pending=false;
function refresh(){
 pending=false;
 const maximum=document.documentElement.scrollHeight-window.innerHeight;
 const ratio=maximum>0?Math.max(0,Math.min(1,window.scrollY/maximum)):0;
 if(position)position.style.width=(ratio*100).toFixed(2)+'%';
 page.classList.toggle('has-scrolled',window.scrollY>500);
 const links=Array.from(document.querySelectorAll('.lesson-contents a[href^="#"]'));
 let current=null;
 for(const link of links){
  const target=document.getElementById(link.hash.slice(1));
  if(target&&target.getBoundingClientRect().top<190)current=link;
 }
 links.forEach(link=>{link.dataset.current=link===current?'true':'false';});
}
function schedule(){if(!pending){pending=true;requestAnimationFrame(refresh);}}
if(size)size.addEventListener('click',()=>{
 const on=page.classList.toggle('large-type');size.setAttribute('aria-pressed',String(on));
 size.querySelector('span').textContent=on?'标准字号':'大字阅读';
 if(status)status.textContent=on?'已切换大字阅读。':'已恢复标准字号。';schedule();
});
if(focus)focus.addEventListener('click',()=>{
 const on=page.classList.toggle('focus-reading');focus.setAttribute('aria-pressed',String(on));
 focus.querySelector('span').textContent=on?'恢复布局':'专注阅读';
 if(status)status.textContent=on?'已收起侧栏，正文及参考折叠状态保持。':'已恢复完整布局。';schedule();
});
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',schedule,{passive:true});
document.addEventListener('toggle',schedule,true);
refresh();
})();
