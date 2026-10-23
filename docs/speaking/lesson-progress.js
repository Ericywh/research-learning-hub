(()=>{"use strict";
const PREFIX="speaking-course-complete:v1:";
const LESSON_RE=/\/speaking\/(?:lessons\/(?:01|02)-\d{2}|dual-track-2026\/(?:am|pm)\/day-\d{2})\.html$/;
const fullPath=(value)=>{try{return new URL(value,location.href).pathname;}catch{return "";}};
const state=(path)=>{try{return localStorage.getItem(PREFIX+path)==="yes";}catch{return false;}};
const put=(path,done)=>{try{if(done)localStorage.setItem(PREFIX+path,"yes");else localStorage.removeItem(PREFIX+path);return true;}catch{return false;}};
const lessonPath=location.pathname;
const onLesson=LESSON_RE.test(lessonPath);
function make(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;}
function refreshLinks(){
 let links=[...document.querySelectorAll("a[href]")].filter(a=>LESSON_RE.test(fullPath(a.getAttribute("href"))));
 let unique=new Set();
 links.forEach(a=>{
   const p=fullPath(a.getAttribute("href"));unique.add(p);
   let chip=a.querySelector(".course-link-completion");
   if(!chip){chip=make("span","course-link-completion");a.appendChild(chip);}
   const done=state(p);chip.textContent=done?" ✓ 已完成":"";
   chip.classList.toggle("is-complete",done);
   if(done)a.setAttribute("data-course-done","yes");else a.removeAttribute("data-course-done");
 });
 const summary=document.querySelector("[data-completion-summary]");
 if(summary){const num=[...unique].filter(state).length;const count=summary.querySelector("[data-completion-count]");if(count)count.textContent="本页课程进度："+num+" / "+unique.size+" 节已完成";}
 return unique.size;
}
function lessonControl(){
 const main=document.querySelector("main");
 if(!main)return;
 // The legacy lesson-completion.js renders the existing completion card.
 // Do not insert a second card when that canonical control is present.
 if(main.querySelector(".course-completion[data-completion-id]"))return;
 let panel=main.querySelector("[data-lesson-completion]");
 if(!panel){panel=make("section","course-finish-panel");panel.setAttribute("data-lesson-completion","");
   const label=make("div","course-finish-label","本课完成状态 · 学完后手动标记");
   const row=make("div","course-finish-row");
   const button=make("button","course-finish-button");button.type="button";button.setAttribute("data-course-finish-button","");button.setAttribute("aria-pressed","false");
   const info=make("span","course-finish-state");info.setAttribute("aria-live","polite");
   row.append(button,info);
   const note=make("p","course-finish-note","可随时撤销，重新学习后再标记。记录仅存于当前浏览器；清除浏览器数据后可能丢失，不跨设备同步。");
   panel.append(label,row,note);main.appendChild(panel);
 }
 const button=panel.querySelector("[data-course-finish-button]"),info=panel.querySelector(".course-finish-state");
 function redraw(message){
   const done=state(lessonPath);
   button.textContent=done?"✓ 已完成 · 点击撤销":"标记已完成";
   button.setAttribute("aria-pressed",String(done));
   button.classList.toggle("is-complete",done);
   info.textContent=message||(done?"已完成，可再学一遍":"尚未标记完成");
 }
 button.addEventListener("click",()=>{
   const newState=!state(lessonPath);
   if(!put(lessonPath,newState)){redraw("无法保存：请检查浏览器是否允许本地存储");return;}
   redraw(newState?"已保存完成状态":"已撤销，可重新学习");
   refreshLinks();
 });
 redraw();
}
function progressSummary(){
 const links=[...document.querySelectorAll("a[href]")].filter(a=>LESSON_RE.test(fullPath(a.getAttribute("href"))));
 if(!links.length)return;
 let container=document.querySelector("[data-completion-summary]");
 if(!container){container=make("section","course-progress-summary");container.setAttribute("data-completion-summary","");
  const title=make("span","course-progress-text");title.setAttribute("data-completion-count","");
  const hint=make("span","course-progress-hint","✓ 表示已完成；点击课程进入后可撤销");
  container.append(title,hint);
  const anchor=document.querySelector("header.hero")||document.querySelector(".hero")||document.querySelector("main")||document.body;
  anchor.insertAdjacentElement("afterend",container);
 }
 refreshLinks();
}
function run(){if(onLesson)lessonControl();else progressSummary();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
window.addEventListener("storage",event=>{if(event.key&&event.key.startsWith(PREFIX)){if(onLesson){const b=document.querySelector("[data-course-finish-button]");if(b){const done=state(lessonPath);b.textContent=done?"✓ 已完成 · 点击撤销":"标记已完成";b.setAttribute("aria-pressed",String(done));b.classList.toggle("is-complete",done);}}refreshLinks();}});
})();