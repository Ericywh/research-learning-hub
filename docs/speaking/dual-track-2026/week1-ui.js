/* Optional local countdown. Does not record audio, alter tasks or set completion. */
(function(){
"use strict";
const panel=document.querySelector('.week1-page .practice-timer');
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
