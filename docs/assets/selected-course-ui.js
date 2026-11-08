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

/* STAGE_REFERENCE_V4 — Editorial adaptation of the selected burgundy-gold
   screenshot. Runs after existing Speaking lesson enhancement scripts.
   Does not change exercises, time limits, completion state or reference answers. */
(() => {
  "use strict";
  const stageTitles = [["先留下真实的一分钟","一句主旨怎样带动整段发言"],["开头给出判断，再把意思讲完整","结论先说，怎样避免草率和空泛"],["把一条理由讲到听众能够理解","从判断到依据，中间缺了哪一步"],["用具体过程把一个判断讲清楚","细节怎样帮助听众理解，而不冲淡主旨"],["只凭三词完成有依据的点评","关键词怎样提示意思，而不是触发背稿"],["中断以后，从当前意思接回去","区分忘词、思路丢失与事实纠正"],["先独立完成周测，再分析与修订","用录音证据确定下一步练什么"],["自然开场依靠共同场景","自然开场依靠共同场景"],["认真接住对方原话","认真接住对方原话"],["追问让聊天继续","追问让聊天继续"],["复述理解而非抢答","复述理解而非抢答"],["介绍自己不过度堆砌","介绍自己不过度堆砌"],["分享近况有重点","分享近况有重点"],["对话综合迁移测评","对话综合迁移测评"],["不同意但先明确分歧","不同意但先明确分歧"],["先认同合理处再补充","先认同合理处再补充"],["清楚表达不确定性","清楚表达不确定性"],["请求应让对方容易行动","请求应让对方容易行动"],["拒绝请求保留关系","拒绝请求保留关系"],["澄清误会先辨认事实","澄清误会先辨认事实"],["第3周协商迁移测评","第3周协商迁移测评"],["陌生话题十秒形成判断","陌生话题十秒形成判断"],["一条理由讲透","一条理由讲透"],["两个理由怎样不重复","两个理由怎样不重复"],["反例与条件不是自我否定","反例与条件不是自我否定"],["类比解释不能越界","类比解释不能越界"],["用数字让论证可理解","用数字让论证可理解"],["第4周陌生立场测评","第4周陌生立场测评"],["讲一件小事先选重点","讲一件小事先选重点"],["用人事时地帮助听众定位","用人事时地帮助听众定位"],["故事从关键转折切入","故事从关键转折切入"],["时间顺序与因果顺序分开","时间顺序与因果顺序分开"],["让抽象故事有一个画面","让抽象故事有一个画面"],["故事细节要服务中心","故事细节要服务中心"],["叙事与评价区分","叙事与评价区分"],["第5周两分钟故事测评","第5周两分钟故事测评"],["抽象概念用生活语言解释","抽象概念用生活语言解释"],["复杂问题先整体后分层","复杂问题先整体后分层"],["类比的相似处与限制","类比的相似处与限制"],["把百分数讲对","把百分数讲对"],["向非专业者解释回归结果","向非专业者解释回归结果"],["先说已知再说未知","先说已知再说未知"],["点评先肯定可核查的亮点","点评先肯定可核查的亮点"],["找出最影响解释的一个问题","找出最影响解释的一个问题"],["将问题变成可执行建议","将问题变成可执行建议"],["学术表达中清楚分辨相关与因果","学术表达中清楚分辨相关与因果"],["尊重表达者但指出问题","尊重表达者但指出问题"],["九十秒完整评委点评","九十秒完整评委点评"],["第7周学术点评陌生测评","第7周学术点评陌生测评"],["会议汇报先报告需要决策的事","会议汇报先报告需要决策的事"],["一分钟向上级请求决策","一分钟向上级请求决策"],["面对质疑先回答主问题","面对质疑先回答主问题"],["对批评做事实核查和回应","对批评做事实核查和回应"],["协调分歧先找共同目标","协调分歧先找共同目标"],["用两分钟回应多轮追问","用两分钟回应多轮追问"],["第8周压力情境测评","第8周压力情境测评"],["演讲开场抓住真实问题","演讲开场抓住真实问题"],["三段式演讲结构有主线","三段式演讲结构有主线"],["过渡句让听众跟得上","过渡句让听众跟得上"],["例证和数据应为同一论点服务","例证和数据应为同一论点服务"],["结尾形成可行动的记忆点","结尾形成可行动的记忆点"],["完整演讲排练与替代情境","完整演讲排练与替代情境"],["第63天终测与下一轮计划","第63天终测与下一轮计划"]];
  const chapterNames = [
    "表达起步与结构控制","自然对话与关系分寸","即兴观点与叙述",
    "清晰解释与学术点评","会议与高压问答","公众演讲与综合迁移"
  ];
  const chapterRanges = [[1,7],[8,21],[22,35],[36,49],[50,56],[57,63]];
  const make=(tag,cls,value)=>{
    const n=document.createElement(tag);
    if(cls)n.className=cls;
    if(value!==undefined)n.textContent=value;
    return n;
  };
  const anchor=(cls,value,href)=>{
    const a=make("a",cls,value);a.href=href;return a;
  };
  function rootPath(){
    const pathname=location.pathname;
    const i=pathname.indexOf("/speaking/");
    return i>=0?pathname.slice(0,i+1):"/";
  }
  function header(){
    const base=rootPath();
    const mast=make("header","st-stage-masthead");
    const bar=make("div","st-stage-navbar");
    bar.append(anchor("st-brand","▤ 研究学习中心",base+"study/"));
    const nav=make("nav","st-mast-nav");nav.setAttribute("aria-label","研究学习中心课程导航");
    [["首页","study/"],["公众表达","speaking/dual-track-2026/"],["计量经济学","econometrics/"],
     ["数学微课程","math/"],["CSSCI精读","cssci/"],["研究前沿","frontier/"],
     ["经济学经典","economic-classics/"],["PSM-DID","psm-did/"]].forEach(([label,href])=>{
      const a=anchor("st-mast-link"+(label==="公众表达"?" is-current":""),label,base+href);
      if(label==="公众表达")a.setAttribute("aria-current","page");
      nav.append(a);
    });
    bar.append(nav);
    mast.append(bar);
    const banner=make("div","st-stage-banner");
    const copy=make("div","st-stage-banner-copy");
    const kicker=make("span","st-stage-kicker","THE ART OF PUBLIC SPEAKING");
    const title=make("div","st-stage-course-title","公众表达与脱稿演讲系统训练");
    const sub=make("p","st-stage-subtitle","表达能力   ·   演讲结构   ·   脱稿表达   ·   舞台实战   ·   影响力提升");
    copy.append(kicker,title,sub);
    const ornament=make("div","st-stage-ornament");
    ornament.setAttribute("aria-hidden","true");
    ornament.innerHTML='<svg viewBox="0 0 1000 125" preserveAspectRatio="none"><defs><linearGradient id="stgold" x1="0" x2="1"><stop stop-color="#d7a76f" stop-opacity="0"/><stop offset=".5" stop-color="#f8d2a0" stop-opacity=".85"/><stop offset="1" stop-color="#d2945e" stop-opacity="0"/></linearGradient></defs><path d="M-70 70C170-10 250 151 465 65S770 70 1050 28" fill="none" stroke="url(#stgold)" stroke-width="1.8"/><path d="M-70 82C170 2 250 163 465 77S770 82 1050 40" fill="none" stroke="url(#stgold)" stroke-width="1"/><path d="M-70 95C170 15 250 176 465 90S770 95 1050 53" fill="none" stroke="url(#stgold)" stroke-width=".9"/></svg>';
    banner.append(copy,ornament);mast.append(banner);
    return mast;
  }
  const concise=t=>{
    const raw=(t||"").trim().replace(/\s+/g," ");
    const m=raw.match(/^.{8,100}?[。！？；]/u);
    return m?m[0]:(raw.length>90?raw.slice(0,89)+"…":raw);
  };
  function buildRail(rail,day,chapter,mode){
    rail.replaceChildren();
    const root=rootPath();
    rail.append(make("div","st-rail-head","▤ 课程目录（六章 · 126课）"));
    rail.append(anchor("st-rail-top","全部课程总目录",root+"speaking/dual-track-2026/"));
    chapterNames.forEach((name,i)=>{
      const details=make("details","st-stage-chapter"+(chapter===i+1?" is-current":""));
      if(chapter===i+1)details.open=true;
      const summary=make("summary","","第"+(i+1)+"章  "+name);
      details.append(summary);
      const chapterLink=anchor("st-rail-chapter-index","查看本章课程 →",root+"speaking/dual-track-2026/chapter-"+String(i+1).padStart(2,"0")+".html");
      details.append(chapterLink);
      const [begin,end]=chapterRanges[i];
      for(let n=begin;n<=end;n++){
        const box=make("div","st-rail-day"+(n===day?" is-current":""));
        box.append(make("div","st-rail-day-no","DAY "+String(n).padStart(2,"0")));
        const id=String(n).padStart(2,"0");
        ["am","pm"].forEach((which,j)=>{
          const label=which==="am"?"早":"晚";
          const a=anchor("st-rail-lesson"+(n===day&&mode===which?" is-active":""),
            label+" · "+stageTitles[n-1][j],
            root+"speaking/dual-track-2026/"+which+"/day-"+id+".html");
          if(n===day&&mode===which)a.setAttribute("aria-current","page");
          box.append(a);
        });
        details.append(box);
      }
      rail.append(details);
    });
    rail.append(anchor("st-rail-bottom","← 返回学习中心",root+"study/"));
  }
  function buildPhoto(){
    const figure=make("figure","st-stage-photo");
    figure.setAttribute("aria-label","舞台演讲场景和表达练习寄语");
    const quote=make("blockquote","","自信的表达，\n不是天生的天赋，\n而是可以训练的能力。");
    const cite=make("figcaption","","COURSE MOTTO · 练习寄语");
    figure.append(quote,cite);
    return figure;
  }
  function buildTabs(article){
    const nav=make("nav","st-lesson-tabs");
    nav.setAttribute("aria-label","本课内容导航");
    const sections=Array.from(article.querySelectorAll(":scope > section, :scope > div > section"))
      .filter(s=>s.querySelector("h2"));
    nav.append(anchor("st-tab is-current","◉ 课程导览","#lesson-content"));
    for(const section of sections.slice(0,7)){
      const h=section.querySelector("h2");if(!h)continue;
      if(!section.id)section.id="st-tab-"+String(nav.children.length).padStart(2,"0");
      const text=h.textContent.trim().replace(/\s+/g," ").slice(0,19);
      if(text)nav.append(anchor("st-tab",text,"#"+section.id));
    }
    return nav;
  }
  function addProgressCard(sidebar){
    const existing=sidebar.querySelector(".soft-progress");
    if(!existing)return;
    sidebar.insertBefore(existing,sidebar.firstElementChild);
    existing.classList.add("st-reading-progress-card");
    const head=make("div","st-progress-card-title","▥ 学习进度");
    const circle=make("div","st-progress-donut");
    circle.setAttribute("role","img");
    circle.setAttribute("aria-label","本浏览器已完成课程比例");
    const pct=make("strong","st-progress-percentage","—");
    circle.append(pct);
    const caption=make("div","st-progress-caption","已完成课次 / 126（本浏览器）");
    const inner=make("div","st-progress-presentation");
    inner.append(circle,caption);
    existing.prepend(inner);existing.prepend(head);
    const original=existing.querySelector("[data-soft-completed]");
    const refresh=()=>{
      const n=Number((original?.textContent||"").trim());
      if(!original||!Number.isFinite(n)||n<0||n>126)return;
      const percent=Math.round(n/126*100);
      pct.textContent=percent+"%";
      circle.style.setProperty("--st-progress",percent+"%");
      circle.setAttribute("aria-label","本浏览器已完成"+n+"课，共126课");
      caption.textContent="已学习 "+n+" 课 / 全课程126课";
    };
    if(original){
      new MutationObserver(refresh).observe(original,{childList:true,subtree:true,characterData:true});
      refresh();
    }
  }
  function addTips(sidebar,wrap){
    const texts=[];
    const notice=wrap.querySelector(".rv-notice");
    if(notice)texts.push(concise(notice.textContent));
    for(const x of wrap.querySelectorAll(".rv-main .rv-step-body p, .rv-main .rv-section p")){
      if(x.closest("details"))continue;
      const t=concise(x.textContent);
      if(t&&t.length>10&&!texts.includes(t))texts.push(t);
      if(texts.length>=3)break;
    }
    if(!texts.length)return;
    const card=make("section","st-training-card");
    card.append(make("h2","","◎ 本课练习提示"));
    const ul=make("ul");
    texts.slice(0,3).forEach(t=>ul.append(make("li","",t)));
    card.append(ul);
    const progress=sidebar.querySelector(".soft-progress");
    if(progress)progress.insertAdjacentElement("afterend",card);
    else sidebar.prepend(card);
  }
  function addQuote(sidebar){
    const aside=make("aside","st-inspiration-panel");
    aside.setAttribute("aria-label","演讲练习寄语");
    aside.append(make("div","st-inspiration-mark","“"));
    aside.append(make("blockquote","","每一次勇敢开口，\n都是自信增长的阶梯。"));
    const scene=make("div","st-inspiration-landscape");
    scene.setAttribute("aria-hidden","true");
    scene.innerHTML='<svg viewBox="0 0 300 130" preserveAspectRatio="none"><defs><linearGradient id="stpeak" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a78d8c"/><stop offset="1" stop-color="#5d5664"/></linearGradient></defs><path fill="#f3dac5" d="M0 100L40 72 78 92 121 51 166 81 206 34 252 77 300 49V130H0Z"/><path fill="#c0aaa3" opacity=".72" d="M0 116L52 90 100 115 149 74 203 103 252 66 300 98V130H0Z"/><path fill="url(#stpeak)" d="M0 130L40 115 92 123 139 93 184 118 221 79 268 108 300 106V130H0Z"/><path d="M260 56v-23M260 39l-13 10M260 39l13 10M260 59l-6 16M260 59l6 16" stroke="#74413a" stroke-width="3" stroke-linecap="round"/><circle cx="260" cy="26" r="5" fill="#74413a"/></svg>';
    aside.append(scene);sidebar.append(aside);
  }
  function buildLesson(){
    const body=document.body;
    const dayStr=body.dataset.day;
    const day=Number(dayStr);
    const chapter=Number(body.dataset.chapter);
    const mode=body.dataset.mode;
    const wrap=body.querySelector(".rv-wrap");
    const layout=wrap?.querySelector(".rv-layout");
    const main=layout?.querySelector(".rv-main");
    const sidebar=layout?.querySelector(".rv-sidebar");
    const rail=layout?.querySelector(".st-speaking-rail");
    const hero=wrap?.querySelector(".rv-hero");
    const article=main?.querySelector(".rv-article");
    if(!day||!main||!sidebar||!rail||!hero||!article)return;
    body.classList.add("st-speaking-reference");
    wrap.insertAdjacentElement("beforebegin",header());
    buildRail(rail,day,chapter,mode);
    const breadcrumb=wrap.querySelector(".rv-topnav");
    if(breadcrumb){breadcrumb.classList.add("st-reference-breadcrumb");main.prepend(breadcrumb);}
    if(breadcrumb)breadcrumb.insertAdjacentElement("afterend",hero);else main.prepend(hero);
    hero.classList.add("st-lesson-title-hero");
    const tool=wrap.querySelector(".rv-tools");
    if(tool){hero.insertAdjacentElement("afterend",tool);}
    const note=wrap.querySelector(".rv-notice");
    if(note){(tool||hero).insertAdjacentElement("afterend",note);}
    const photo=buildPhoto();
    (note||tool||hero).insertAdjacentElement("afterend",photo);
    photo.insertAdjacentElement("afterend",buildTabs(article));
    addProgressCard(sidebar);
    addTips(sidebar,wrap);
    addQuote(sidebar);
  }
  function buildCatalog(){
    const body=document.body;
    if(!body.classList.contains("rv-catalog"))return;
    body.classList.add("st-speaking-reference","st-speaking-catalog");
    const shell=body.querySelector(".rv-shell");
    if(shell)shell.insertAdjacentElement("beforebegin",header());
    const topbar=shell?.querySelector(".rv-topbar");
    if(topbar)topbar.classList.add("st-reference-breadcrumb");
  }
  function start(){
    const body=document.body;
    if(body?.getAttribute("data-selected-theme")!=="burgundy"||
      !location.pathname.includes("/speaking/dual-track-2026/"))return;
    if(body.dataset.day)buildLesson();
    else buildCatalog();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
