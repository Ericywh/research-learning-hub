
/* ECONOMETRICS 120 | non-destructive UI enhancements */
(()=>{"use strict";
function start(){
 const b=document.body,main=document.querySelector("main");if(!main||b.classList.contains("econ-theme"))return;
 b.classList.add("econ-theme");const catalog=!!document.getElementById("catalog");
 const top=document.querySelector("body>header");if(top){
 const title=document.createElement("a");title.className="econ-brand";title.href=catalog?"./":"../";title.textContent="∑ ECONOMETRICS 120";
 if(top.querySelector(".top-inner"))top.querySelector(".top-inner").prepend(title);else top.prepend(title);
 const toggle=document.createElement("button");toggle.className="econ-toggle";toggle.type="button";toggle.textContent="◐ 深色模式";
 const apply=dark=>{b.dataset.econDark=String(dark);toggle.textContent=dark?"☀ 浅色模式":"◐ 深色模式"};
 try{apply(localStorage.getItem("econ-dark")==="true")}catch(e){apply(false)}
 toggle.addEventListener("click",()=>{const dark=b.dataset.econDark!=="true";apply(dark);try{localStorage.setItem("econ-dark",String(dark))}catch(e){}});
 top.append(toggle);
 }
 const bar=document.createElement("div");bar.className="econ-readingbar";bar.setAttribute("aria-hidden","true");b.prepend(bar);
 let ticking=false;function progress(){if(ticking)return;ticking=true;requestAnimationFrame(()=>{const h=document.documentElement.scrollHeight-innerHeight;bar.style.width=(h>0?Math.min(100,100*scrollY/h):100)+"%";ticking=false})}window.addEventListener("scroll",progress,{passive:true});progress();
 if(catalog)return;
 let hero=main.querySelector(":scope > .hero");
 if(!hero){const heading=main.querySelector(":scope > h1");if(heading){hero=document.createElement("section");hero.className="econ-hero";const label=document.createElement("div");label.className="econ-hero-label";label.textContent="ACADEMIC STUDIO · ECONOMETRICS";hero.append(label,heading);const meta=main.querySelector(":scope > .meta");if(meta)hero.append(meta);main.prepend(hero)}}
 if(hero){const pills=document.createElement("div");pills.className="econ-pills";["10—15分钟","理论 × 数据 × 识别","Stata + Python"].forEach(t=>{const s=document.createElement("span");s.textContent=t;pills.append(s)});hero.append(pills);
 const text=hero.textContent+" "+main.textContent.slice(0,250);
 const m=text.match(/(?:全课程第|LESSON\s*)(\d+)\s*(?:课|\/\s*120)/i);
 if(m){const meter=document.createElement("div");meter.className="econ-meter";const i=document.createElement("i");i.style.width=(Math.max(0,Math.min(120,Number(m[1])))/120*100)+"%";meter.append(i);hero.append(meter)}
 }
 let holder=main.querySelector(":scope > .layout"),article;
 if(holder){article=holder.querySelector(":scope > div:last-child");if(article)article.classList.add("econ-article")}
 else{
   holder=document.createElement("div");holder.className="econ-layout layout";
   article=document.createElement("div");article.className="econ-article";
   const children=[...main.children].filter(n=>n!==hero);
   let section=null,sectionNo=0;
   for(const node of children){
     const h3=node.matches&&node.matches("h3")&&/^[一二三四五六七八九十]+[、.．]/.test(node.textContent.trim());
     if(h3){section=document.createElement("section");section.className="econ-section";section.id="econ-section-"+(++sectionNo);article.append(section)}
     if(node.matches&&node.matches("section")&&!node.classList.contains("hero")){node.classList.add("econ-section");section=null;article.append(node)}
     else if(section){section.append(node)}
     else{article.append(node)}
   }
   holder.append(article);main.append(holder);
 }
 if(!article)return;
 const sections=[...article.querySelectorAll(":scope > section")].filter(x=>x.querySelector("h2,h3"));
 const nav=holder.querySelector(":scope > nav")||document.createElement("nav");if(!nav.parentElement){nav.className="econ-aside";nav.setAttribute("aria-label","课内导航");holder.prepend(nav)}
 if(!nav.querySelector("a")){const heading=document.createElement("div");heading.className="econ-aside-title";heading.textContent="本课阅读目录";nav.append(heading);
 sections.forEach((section,i)=>{const h=section.querySelector("h2,h3");if(!section.id)section.id="section-"+(i+1);const a=document.createElement("a");a.href="#"+section.id;a.textContent=h.textContent.trim().slice(0,31);nav.append(a)})}
 // The build-level lesson reader handles all code blocks; avoid duplicate toolbars.
 // Without the build-level reader (static HTML previews), use native closed disclosures.
 if (!b.hasAttribute("data-course-lesson")) {
 for(const pre of article.querySelectorAll("pre")){if(pre.closest("details.econ-code-preview"))continue;
 const code=pre.querySelector("code"),cls=code?.className||"",language=/python/i.test(cls)?"Python":/stata/i.test(cls)?"Stata":"代码";
 const head=document.createElement("div");head.className="econ-code-top";const label=document.createElement("span");label.textContent="⌘ "+language;head.append(label);
 const copy=document.createElement("button");copy.type="button";copy.textContent="复制代码";copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(code?.innerText||pre.innerText);copy.textContent="已复制";setTimeout(()=>copy.textContent="复制代码",1800)}catch(e){copy.textContent="请手动复制"}});head.append(copy);
 const disclosure=document.createElement("details");
 disclosure.className="econ-code-preview";
 const summary=document.createElement("summary");summary.textContent="点击展开 · "+language+"代码";
 pre.before(disclosure);disclosure.append(summary,head,pre);
 }
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
