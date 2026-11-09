/* Personal course progress on /study/.
   Counts only explicit browser-local completion/read marks from each course's own tracker. */
(() => {
  "use strict";
  const READ = "rlh:read:v1:";
  const SPEAK = "speaking:lesson-complete:v1:";
  const ECON = "econ:v2:modules:completed:20261027";
  const ECON_OLD = "research-learning-hub:econometrics:completed:v1";
  const configs = {
    speaking: { total:126, unit:"课", kind:"speaking", label:"已完成" },
    english: { total:168, unit:"课", kind:"english", label:"已完成" },
    econometrics: { total:36, unit:"模块", kind:"econometrics", label:"已完成" },
    psm: { total:10, unit:"节", kind:"read", prefix:READ+"psm-did/", label:"已阅读" },
    math: { total:73, unit:"节", kind:"read", prefix:READ+"math/lessons/", label:"已阅读" },
    frontier: { total:23, unit:"篇", kind:"read", prefix:READ+"frontier/", label:"已阅读" },
    cssci: { total:16, unit:"篇", kind:"read", prefix:READ+"cssci/lessons/", label:"已阅读" },
    classics: { total:8, unit:"课", kind:"read", prefix:READ+"economic-classics/lessons/", label:"已阅读" }
  };
  function keys(prefix) {
    const found=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(key&&key.startsWith(prefix)&&localStorage.getItem(key)==="1")found.push(key);
    }
    return found;
  }
  function countFor(id,c) {
    if(c.kind==="read")return keys(c.prefix).length;
    if(c.kind==="speaking"){
      return keys(SPEAK).filter(k=>/:(?:am|pm):day-(?:0[1-9]|[1-5][0-9]|6[0-3])$/.test(k)).length;
    }
    if(c.kind==="econometrics"){
      const values=JSON.parse(localStorage.getItem(ECON)||"[]");
      if(Array.isArray(values))return new Set(values.filter(x=>/^M(?:0[1-9]|[12][0-9]|3[0-6])$/.test(x))).size;
      const old=JSON.parse(localStorage.getItem(ECON_OLD)||"{}");
      return old&&typeof old==="object"?Object.keys(old).filter(x=>/^\d{2}-\d{2}$/.test(x)).length:0;
    }
    if(c.kind==="english"){
      const completed=new Set();
      for(const key of keys(READ+"english:lesson:")){
        const m=key.match(/english:lesson:(\d{3})$/);if(m)completed.add(Number(m[1]));
      }
      for(let week=1;week<=12;week++){
        const start=(week-1)*14+1;
        for(let n=start;n<start+14;n++){
          const serial=String(n).padStart(3,"0");
          if(localStorage.getItem("english-week"+String(week).padStart(2,"0")+"-"+serial)==="1")completed.add(n);
        }
      }
      return completed.size;
    }
    return 0;
  }
  function render(){
    document.querySelectorAll("[data-course-progress]").forEach(card=>{
      const id=card.dataset.courseProgress,c=configs[id];if(!c)return;
      const percent=card.querySelector("[data-progress-percent]");
      const fill=card.querySelector("[data-progress-fill]");
      const track=card.querySelector('[role="progressbar"]');
      const count=card.querySelector("[data-progress-count]");
      let done=0,available=true;
      try{done=Math.min(c.total,countFor(id,c));}catch(_){available=false;}
      const pct=available?Math.round(done/c.total*100):0;
      if(percent)percent.textContent=available?pct+"%":"—";
      if(fill)fill.style.width=available?pct+"%":"0%";
      if(track){
        if(available){track.setAttribute("aria-valuenow",String(pct));track.setAttribute("aria-valuetext",c.label+" "+done+" / "+c.total+c.unit);}
        else{track.removeAttribute("aria-valuenow");track.setAttribute("aria-valuetext","当前浏览器无法读取学习记录");}
      }
      if(count)count.textContent=available?c.label+" "+done+" / "+c.total+" "+c.unit:"当前浏览器无法读取学习记录";
    });
  }
  function safeRender(){try{render();}catch(_){document.querySelectorAll("[data-progress-percent]").forEach(x=>x.textContent="—");}}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",safeRender);else safeRender();
  window.addEventListener("pageshow",safeRender);
  window.addEventListener("storage",e=>{if(!e.key||e.key.startsWith(READ)||e.key.startsWith(SPEAK)||e.key===ECON||e.key===ECON_OLD)safeRender();});
  window.addEventListener("speaking:progress-applied",safeRender);
})();
