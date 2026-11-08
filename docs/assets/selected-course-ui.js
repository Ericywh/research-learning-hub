/* Selected course UI | Burgundy Speaking + Lilac Econometrics.
 * Progressive enhancement: original lectures, exercises and data remain intact.
 */
(() => {
 "use strict";
 const el=(tag,cls,txt)=>{
   const n=document.createElement(tag);
   if(cls)n.className=cls;
   if(txt!==undefined)n.textContent=txt;
   return n;
 };
 function speaking(){
   const body=document.body;
   const layout=document.querySelector(".rv-layout");
   const day=body.dataset.day;
   if(!layout||!day||layout.querySelector(".st-speaking-rail"))return;
   const chapter=Number(body.dataset.chapter)||1;
   const rail=el("aside","st-speaking-rail");
   rail.setAttribute("aria-label","公众表达课程章节目录");
   rail.append(el("div","st-rail-head","课程目录 · 六章126课"));
   const names=["表达起步与结构控制","自然对话与关系分寸","即兴观点与叙述","清晰解释与学术点评","会议与高压问答","公众演讲与综合迁移"];
   names.forEach((name,i)=>{
     const a=el("a","st-rail-chapter"+(chapter===i+1?" is-current":""),"第"+(i+1)+"章 · "+name);
     a.href="../chapter-"+String(i+1).padStart(2,"0")+".html";
     if(chapter===i+1)a.setAttribute("aria-current","page");
     rail.append(a);
   });
   rail.append(el("span","st-rail-label","当天早晚课"));
   for(const [mode,label] of [["am","早间实训"],["pm","晚间精讲"]]){
      const a=el("a","st-rail-mode"+(body.dataset.mode===mode?" is-current":""),label+" · 第"+Number(day)+"天");
      a.href="../"+mode+"/day-"+day+".html";
      rail.append(a);
   }
   const main=layout.querySelector(":scope > .rv-main");
   if(!main)return;
   layout.insertBefore(rail,main);
   body.classList.add("st-speaking-lesson");
 }
 function codeFolds(root){
   for(const pre of root.querySelectorAll("pre")){
     if(pre.closest("details"))continue;
     const code=pre.querySelector("code");
     const source=(code||pre).textContent||"";
     const cl=((code&&code.className)||"").toString().toLowerCase();
     let lang=/language-stata|\bstata\b/.test(cl)?"stata":
              /language-python|\bpython\b/.test(cl)?"python":null;
     if(!lang && /(?:^|\n)\s*(?:sysuse|regress|xtreg|ivregress|egen|generate|clear all|use ["'])\b/m.test(source))lang="stata";
     if(!lang && /(?:^|\n)\s*(?:import (?:numpy|pandas|statsmodels|matplotlib)|from (?:numpy|pandas|statsmodels|matplotlib) import)\b/m.test(source))lang="python";
     if(!lang){
       const prev=pre.previousElementSibling?.textContent?.trim()||"";
       if(/^(?:\d+(?:\.\d+)?[.\s、]*)?stata(?:\s*代码|\s*示例|\s*实现)?$/i.test(prev))lang="stata";
       else if(/^(?:\d+(?:\.\d+)?[.\s、]*)?python(?:\s*代码|\s*示例|\s*实现)?$/i.test(prev))lang="python";
     }
     if(!lang)continue;
     const details=el("details","st-folded-code");
     details.setAttribute("data-code-language",lang);
     const summary=el("summary","",lang==="stata"?"Stata代码 · 点击展开":"Python代码 · 点击展开");
     details.append(summary);
     pre.parentNode.insertBefore(details,pre);
     details.append(pre);
     details.addEventListener("toggle",()=>{
       summary.textContent=lang==="stata"?
         (details.open?"Stata代码 · 点击收起":"Stata代码 · 点击展开"):
         (details.open?"Python代码 · 点击收起":"Python代码 · 点击展开");
     });
   }
 }
 function econ(){
   const body=document.body,main=document.querySelector("main");
   if(!main)return;
   const p=location.pathname;
   const isLesson=/\/econometrics\/lessons\/\d{2}-\d{2}\.html$/.test(p)||
                  /\/econometrics\/v2\/modules\/M\d{2}\.html$/.test(p);
   if(!isLesson)return;
   body.classList.add("st-econ-lesson");
   const headings=Array.from(main.querySelectorAll("h2,h3"))
      .filter(h=>!h.closest("details") && !h.closest(".concept-primer") && h.textContent?.trim());
   const h2s=headings.filter(h=>h.tagName==="H2");
   const top=h2s.length>=3?h2s:headings.filter(h=>h.tagName==="H3").slice(0,12);
   if(top.length<2)return;
   const nav=el("nav","st-econ-rail");nav.setAttribute("aria-label","本课章节索引");
   nav.append(el("h2","","本节导航"));
   const links=[];
   top.slice(0,14).forEach((h,i)=>{
     if(!h.id)h.id="lilac-part-"+String(i+1).padStart(2,"0");
     const a=el("a",i===0?"is-active":"",String(i+1).padStart(2,"0")+"  "+h.textContent.trim().replace(/\s+/g," ").slice(0,36));
     a.href="#"+h.id;nav.append(a);links.push(a);
   });
   const tools=el("aside","st-econ-tools");
   tools.setAttribute("aria-label","学习提示与阅读进度");
   tools.append(el("h2","","学习进度"));
   tools.append(el("div","st-econ-stat","本页阅读进度（不代表已掌握）"));
   const bar=el("div","st-econ-progress");
   bar.setAttribute("role","progressbar");
   bar.setAttribute("aria-label","本页阅读进度");
   bar.setAttribute("aria-valuemin","0");
   bar.setAttribute("aria-valuemax","100");
   const fill=el("span");bar.append(fill);tools.append(bar);
   const numeric=el("div","st-econ-stat","0% 已阅读");tools.append(numeric);
   tools.append(el("h2","","阅读提示"));
   tools.append(el("div","st-econ-tip","先辨认研究问题与参数，再核对假设、公式和证据；Stata与Python代码默认折叠，按需展开。"));
   const href=p.includes("/v2/")?"../index.html":"../index.html";
   const back=el("a","","返回课程目录");
   back.href=href;tools.append(back);
   document.body.append(nav,tools);
   codeFolds(main);
   let ticking=false;
   const update=()=>{
     const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
     const value=Math.max(0,Math.min(100,Math.round(100*scrollY/max)));
     fill.style.transform="scaleX("+(value/100)+")";
     numeric.textContent=value+"% 已阅读";
     bar.setAttribute("aria-valuenow",String(value));
     ticking=false;
   };
   addEventListener("scroll",()=>{
     if(!ticking){ticking=true;requestAnimationFrame(update);}
   },{passive:true});
   update();
   if("IntersectionObserver" in window){
     const obs=new IntersectionObserver(entries=>{
       for(const entry of entries){
         if(entry.isIntersecting){
           const i=top.indexOf(entry.target);
           links.forEach((a,j)=>a.classList.toggle("is-active",i===j));
           break;
         }
       }
     },{rootMargin:"-18% 0px -70% 0px",threshold:0});
     top.forEach(h=>obs.observe(h));
   }
 }
 function run(){
   const theme=document.body?.getAttribute("data-selected-theme");
   if(theme==="burgundy")speaking();
   if(theme==="lilac")econ();
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});
 else run();
})();