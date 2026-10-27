/* Enhancements do not rewrite lesson text, reveal reference answers, or record audio. */
(function(){
  "use strict";
  function init(){
    const body=document.body;
    if(!body.classList.contains("rv-page"))return;
    const q=s=>document.querySelector(s),qa=s=>Array.from(document.querySelectorAll(s));
    const read=k=>{try{return localStorage.getItem("speaking:reviewed-reader:"+k);}catch(_){return null;}};
    const save=(k,v)=>{try{localStorage.setItem("speaking:reviewed-reader:"+k,v);}catch(_){}};
    const announce=t=>{const n=q("[data-rv-status],[data-rv-reader-status]");if(n)n.textContent=t;};
    [["size","rv-large","大字阅读"],["focus","rv-focus","专注阅读"]].forEach(([key,cls,label])=>{
      const button=q("[data-rv-"+key+"]");
      if(!button)return;
      let active=read(key)==="1";
      const paint=()=>{body.classList.toggle(cls,active);button.setAttribute("aria-pressed",String(active));};
      paint();
      button.addEventListener("click",()=>{active=!active;paint();save(key,active?"1":"0");announce(label+(active?"已开启":"已关闭"));});
    });

    // Only top-level, visible section headings enter the directory. Hidden reference
    // headings and keywords never leak into navigation before an answer is opened.
    const article=q(".rv-article"),toc=q(".rv-toc");
    const headings=article?Array.from(article.querySelectorAll("h2")).filter(h=>!h.closest("details")&&!h.hidden):[];
    if(toc&&!toc.children.length){
      headings.forEach((h,i)=>{
        if(!h.id)h.id="rv-section-"+(i+1);
        const a=document.createElement("a");a.href="#"+h.id;a.textContent=h.textContent.trim();toc.appendChild(a);
      });
    }
    if(toc){
      const links=Array.from(toc.querySelectorAll('a[href^="#"]'));
      const setCurrent=id=>links.forEach(a=>{if(a.getAttribute("href")==="#"+id)a.setAttribute("aria-current","location");else a.removeAttribute("aria-current");});
      if("IntersectionObserver" in window){
        const visible=new Set();
        const observer=new IntersectionObserver(entries=>{
          entries.forEach(e=>{if(e.isIntersecting)visible.add(e.target);else visible.delete(e.target);});
          const current=headings.find(h=>visible.has(h));
          if(current)setCurrent(current.id);
        },{rootMargin:"-10% 0px -65% 0px",threshold:0});
        headings.forEach(h=>observer.observe(h));
      }
      links.forEach(a=>a.addEventListener("click",()=>setCurrent(a.hash.slice(1))));
    }

    const progress=document.createElement("div");progress.className="rv-progress";progress.setAttribute("aria-hidden","true");
    const progressFill=document.createElement("span");progress.appendChild(progressFill);body.prepend(progress);
    const back=document.createElement("button");back.type="button";back.className="rv-backtop";back.textContent="↑";back.setAttribute("aria-label","返回页面顶部");back.hidden=true;
    back.addEventListener("click",()=>{window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});});body.appendChild(back);
    let scheduled=false;
    function paintProgress(){
      scheduled=false;const max=document.documentElement.scrollHeight-window.innerHeight;
      progressFill.style.transform="scaleX("+(max>0?Math.min(1,Math.max(0,window.scrollY/max)):0)+")";
      back.hidden=window.scrollY<800;
    }
    function schedule(){if(!scheduled){scheduled=true;window.requestAnimationFrame(paintProgress);}}
    window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule,{passive:true});
    qa("details").forEach(n=>n.addEventListener("toggle",schedule));paintProgress();

    // The timer is an optional clock. Task preparation and speaking conditions remain
    // in the lesson text; no presets are inferred or substituted for those conditions.
    qa("[data-rv-timer]").forEach(timer=>{
      const value=timer.querySelector("[data-rv-timer-value]"),display=timer.querySelector("[data-rv-timer-display]"),toggle=timer.querySelector("[data-rv-timer-toggle]"),reset=timer.querySelector("[data-rv-timer-reset]"),status=timer.querySelector("[data-rv-timer-status]");
      if(!value||!display||!toggle||!reset)return;
      let remaining=Number(value.value)||60,deadline=0,interval=null;
      const show=()=>{const sec=Math.max(0,Math.ceil(remaining));display.textContent=String(Math.floor(sec/60)).padStart(2,"0")+":"+String(sec%60).padStart(2,"0");};
      const note=t=>{if(status)status.textContent=t;};
      function stop(){if(interval!==null){clearInterval(interval);interval=null;}toggle.textContent="继续计时";toggle.setAttribute("aria-pressed","false");value.disabled=false;}
      function tick(){remaining=Math.max(0,(deadline-Date.now())/1000);show();if(remaining<=0){stop();toggle.textContent="重新计时";note("本段计时结束。请自行保存录音，并按课文继续。");}}
      toggle.addEventListener("click",()=>{
        if(interval!==null){remaining=Math.max(0,(deadline-Date.now())/1000);stop();show();note("计时已暂停。");return;}
        if(remaining<=0)remaining=Number(value.value)||60;
        deadline=Date.now()+remaining*1000;interval=window.setInterval(tick,200);toggle.textContent="暂停计时";toggle.setAttribute("aria-pressed","true");value.disabled=true;note("正在计时；本工具不录音。");tick();
      });
      function resetTimer(){stop();remaining=Number(value.value)||60;show();toggle.textContent="开始计时";note("按题面选择时长；计时器不录音。");}
      reset.addEventListener("click",resetTimer);value.addEventListener("change",resetTimer);show();
      window.addEventListener("pagehide",()=>{if(interval!==null){remaining=Math.max(0,(deadline-Date.now())/1000);stop();show();}});
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
