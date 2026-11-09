/* Aggregate course completion for the Forest Morning learning rail.
   Reads the same browser-local completion markers as each course page. */
(() => {
  "use strict";
  const READ = "rlh:read:v1:";
  const SPEAK_NEW = "speaking:lesson-complete:v1:";
  const SPEAK_OLD = "speaking-course-complete:v1:";
  const ECON = "econ:v2:modules:completed:20261027";
  const ECON_OLD = "research-learning-hub:econometrics:completed:v1";
  const TOTALS = { speaking:126, english:168, econometrics:36, psm:10, math:73, frontier:23, cssci:16, classics:8 };
  const TOTAL = Object.values(TOTALS).reduce((a,b)=>a+b,0);

  function localKeys(prefix, value) {
    const out=[];
    try {
      for(let i=0;i<localStorage.length;i++){
        const key=localStorage.key(i);
        if(key&&key.startsWith(prefix)&&(value===undefined||localStorage.getItem(key)===value))out.push(key);
      }
    } catch (_) {}
    return out;
  }
  function countSpeaking(){
    const ids=new Set();
    for(const key of localKeys(SPEAK_NEW,"1")){
      const id=key.slice(SPEAK_NEW.length);
      if(/^(?:am|pm):day-(?:0[1-9]|[1-5][0-9]|6[0-3])$/.test(id))ids.add(id);
    }
    for(const key of localKeys(SPEAK_OLD,"yes")){
      const path=key.slice(SPEAK_OLD.length);
      const m=path.match(/\/speaking\/dual-track-2026\/(am|pm)\/day-(\d{2})\.html$/);
      if(m)ids.add(m[1]+":day-"+m[2]);
    }
    return Math.min(TOTALS.speaking,ids.size);
  }
  function countEnglish(){
    const ids=new Set();
    for(const key of localKeys("english-week")){
      if(localStorage.getItem(key)!=="1")continue;
      const m=key.match(/^english-week\d{2}-(\d{3})$/);
      if(m){const n=Number(m[1]);if(n>=1&&n<=168)ids.add(n);}
    }
    for(const key of localKeys(READ+"english:lesson:","1")){
      const m=key.match(/english:lesson:(\d{3})$/);
      if(m){const n=Number(m[1]);if(n>=1&&n<=168)ids.add(n);}
    }
    return Math.min(TOTALS.english,ids.size);
  }
  function countEconometrics(){
    const ids=new Set();
    try{
      const value=JSON.parse(localStorage.getItem(ECON)||"[]");
      if(Array.isArray(value))value.forEach(x=>{if(/^M(?:0[1-9]|[12][0-9]|3[0-6])$/.test(x))ids.add(x);});
    }catch(_){}
    try{
      const old=JSON.parse(localStorage.getItem(ECON_OLD)||"{}");
      if(old&&typeof old==="object")Object.keys(old).forEach(x=>{if(/^M(?:0[1-9]|[12][0-9]|3[0-6])$/.test(x))ids.add(x);});
    }catch(_){}
    return Math.min(TOTALS.econometrics,ids.size);
  }
  function countRead(prefix,total){
    return Math.min(total,localKeys(READ+prefix,"1").length);
  }
  function calculate(){
    const counts={
      speaking:countSpeaking(),
      english:countEnglish(),
      econometrics:countEconometrics(),
      psm:countRead("psm-did/",TOTALS.psm),
      math:countRead("math/lessons/",TOTALS.math),
      frontier:countRead("frontier/",TOTALS.frontier),
      cssci:countRead("cssci/lessons/",TOTALS.cssci),
      classics:countRead("economic-classics/lessons/",TOTALS.classics)
    };
    const done=Object.values(counts).reduce((a,b)=>a+b,0);
    return {done,total:TOTAL,percent:done/TOTAL*100,counts};
  }
  function render(){
    const data=calculate();
    const count=document.querySelector("[data-overall-count]");
    const total=document.querySelector("[data-overall-total]");
    const percent=document.querySelector("[data-overall-percent]");
    const detail=document.querySelector("[data-overall-detail]");
    const ring=document.querySelector("[data-overall-ring]");
    const bar=document.querySelector("[data-overall-bar]");
    if(count)count.textContent=String(data.done);
    if(total)total.textContent="共 "+data.total+" 个学习单元";
    if(percent)percent.textContent=data.percent.toFixed(1)+"%";
    if(detail)detail.textContent="已完成 "+data.done+" / "+data.total+" 个学习单元";
    if(ring){ring.style.setProperty("--progress",String(data.percent));ring.setAttribute("aria-label","整体学习进度 "+data.percent.toFixed(1)+"%");}
    if(bar)bar.style.width=data.percent+"%";
  }
  function safeRender(){try{render();}catch(_){}}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",safeRender,{once:true});else safeRender();
  window.addEventListener("pageshow",safeRender);
  window.addEventListener("storage",safeRender);
  window.addEventListener("speaking:progress-applied",safeRender);
  window.addEventListener("speaking:completion-local-change",safeRender);
  const searchButton=document.getElementById("header-search-button");
  if(searchButton)searchButton.addEventListener("click",()=>document.getElementById("course-search")?.focus());
})();
