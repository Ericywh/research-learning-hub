/* Speaking-course completion: reversible local status, separate for legacy / AM / PM.
   Stored only in this browser's localStorage; does not transmit any data. */
(function(){
"use strict";
const prefix="speaking:lesson-complete:v1:";
function storageKey(id){return prefix+id;}
function read(id){
  try{return localStorage.getItem(storageKey(id))==="1";}catch(e){return false;}
}
function write(id,done){
  try{if(done)localStorage.setItem(storageKey(id),"1");else localStorage.removeItem(storageKey(id));return true;}
  catch(e){return false;}
}
function lessonIdFromLink(a){
  let path;
  try{const u=new URL(a.getAttribute("href"),location.href);if(u.origin!==location.origin)return null;path=decodeURIComponent(u.pathname);}
  catch(e){return null;}
  let m=path.match(/\/speaking\/lessons\/(\d{2})-(\d{2})\.html$/);
  if(m)return "legacy:"+m[1]+"-"+m[2];
  m=path.match(/\/speaking\/dual-track-2026\/(am|pm)\/day-(\d{2})\.html$/);
  if(m)return m[1]+":day-"+m[2];
  return null;
}
function updateDirectory(){
  document.querySelectorAll('a[href$=".html"]').forEach(a=>{
    const id=lessonIdFromLink(a);
    if(!id)return;
    const complete=read(id);
    let mark=a.querySelector(".course-completion-mark");
    if(complete&&!mark){
      mark=document.createElement("span");
      mark.className="course-completion-mark";
      mark.textContent="✓ 已完成";
      a.appendChild(mark);
    }else if(!complete&&mark){mark.remove();}
    a.dataset.completed=complete?"true":"false";
  });
}
function setupLesson(){
  document.querySelectorAll(".course-completion[data-completion-id]").forEach(node=>{
    const id=node.dataset.completionId;
    const button=node.querySelector(".course-completion-button");
    const status=node.querySelector(".course-completion-status");
    if(!id||!button||!status)return;
    let fallback=null;
    const state=()=>fallback===null?read(id):fallback;
    function paint(message){
      const yes=state();
      node.dataset.complete=yes?"true":"false";
      button.setAttribute("aria-pressed",yes?"true":"false");
      button.textContent=yes?"✓ 已完成 · 点击撤销":"○ 标记本课已完成";
      status.textContent=message||(yes?"本课已标记完成；想再学一遍，可点击撤销。":"完成本课后点击标记；以后打开仍可查看或撤销。");
    }
    paint();
    button.addEventListener("click",()=>{
      const next=!state();
      const ok=write(id,next);
      fallback=ok?null:next;
      paint(ok?null:"当前浏览器禁止保存，标记可能在刷新后丢失。");
      updateDirectory();
    });
    window.addEventListener("storage",e=>{if(e.key===storageKey(id)){fallback=null;paint();}});
  });
}
function init(){setupLesson();updateDirectory();window.addEventListener("storage",updateDirectory);window.addEventListener("pageshow",updateDirectory);}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

/* Load the canonical legacy-style body layout only for 2026 AM/PM lesson pages.
   The directory and 18-week archive retain their own existing components. */
(function(){
"use strict";
if(!/\/speaking\/dual-track-2026\/(?:am|pm)\/day-\d{2}\.html$/.test(location.pathname))return;
const origin=document.currentScript;
if(!origin||!origin.src)return;
const node=document.createElement("script");
node.src=new URL("./dual-track-2026/dual-layout.js?v=20261023-material-v2",origin.src).href;
node.async=true;
document.head.appendChild(node);
})();
