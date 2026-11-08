/* ECONOMETRICS SCREENSHOT READER · 2026-11-08
   Actual ten-chapter catalog + separate six-week supplement.
   Moves original lecture main nodes unchanged; no content rewrites. */
(function(){
"use strict";
function start(){
  const body=document.body,path=location.pathname;
  if(body.dataset.selectedTheme!=="lilac")return;
  const pos=path.indexOf("/econometrics/");if(pos<0)return;
  const base=path.slice(0,pos),root=base+"/econometrics/",site=base+"/";
  const lessonMatch=path.match(/\/econometrics\/lessons\/(\d\d-\d\d)\.html$/);
  const moduleMatch=path.match(/\/econometrics\/v2\/modules\/(M\d\d)\.html$/);
  const mainHome=/\/econometrics\/(?:index\.html)?$/.test(path);
  const v2Home=/\/econometrics\/v2\/(?:index\.html)?$/.test(path);
  const mode=lessonMatch?"lesson":moduleMatch?"module":mainHome?"home":v2Home?"module-home":null;
  if(!mode)return;
  const data=window.ECON_SCREENSHOT_MAP;
  if(!data || !Array.isArray(data.chapters) || data.chapters.length!==10 ||
     !Array.isArray(data.modules) || data.modules.length!==36){
    console.error("Econometrics reading map missing");return;
  }
  const main=document.querySelector("body > main");if(!main)return;
  const id=lessonMatch?lessonMatch[1]:moduleMatch?moduleMatch[1]:"";
  const all=data.chapters.flatMap(c=>c.lessons);
  const isModule=mode==="module"||mode==="module-home";
  const isLesson=Boolean(lessonMatch||moduleMatch);
  const current=isModule?data.modules.find(x=>x.id===id):all.find(x=>x.id===id);
  const chapter=current&&!isModule?data.chapters.find(x=>x.number===current.chapter):null;
  const e=(tag,cls,value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=value;return x;};
  const a=(label,href,cls)=>{const x=e("a",cls,label);x.href=href;return x;};
  const short=(txt,n=85)=>{const t=(txt||"").trim().replace(/\s+/g," ");return t.length>n?t.slice(0,n-1)+"…":t;};
  const bannerSvg='<svg viewBox="0 0 350 155" fill="none" aria-hidden="true"><defs><linearGradient id="econV4" x1="0" x2="1"><stop stop-color="#ffbcdf"/><stop offset=".5" stop-color="#a4d4ff"/><stop offset="1" stop-color="#ffe6ad"/></linearGradient></defs><g stroke="#f4dfff" opacity=".3"><path d="M10 30H340M10 68H340M10 106H340M55 15V145M115 15V145M175 15V145M235 15V145M295 15V145"/></g><path d="M21 139C86 110 113 122 168 85S268 40 331 28" stroke="url(#econV4)" stroke-width="6" stroke-linecap="round"/><g fill="#fcd3ea"><circle cx="43" cy="131" r="6"/><circle cx="88" cy="108" r="5"/><circle cx="125" cy="106" r="5"/><circle cx="175" cy="79" r="6"/><circle cx="216" cy="75" r="5"/><circle cx="267" cy="43" r="6"/><circle cx="315" cy="36" r="6"/></g><g opacity=".3" fill="#c5bfff"><rect x="87" y="47" width="23" height="60" rx="6"/><rect x="125" y="30" width="23" height="77" rx="6"/><rect x="163" y="56" width="23" height="51" rx="6"/></g></svg>';
  const sidebarSvg='<svg viewBox="0 0 260 125" aria-hidden="true"><path d="M0 94C27 79 60 106 92 88S162 67 193 89 234 112 260 92V125H0Z" fill="#b8aae8"/><path d="M0 110C54 84 69 114 105 102S167 75 216 100 247 103 260 95V125H0Z" fill="#8f7dd2" opacity=".48"/><path d="M29 92V22M29 92H231M37 83C84 73 119 64 156 55S204 33 225 33" stroke="#6a55b3" stroke-width="3" fill="none"/><g fill="#b772d1"><circle cx="55" cy="80" r="5"/><circle cx="105" cy="65" r="5"/><circle cx="157" cy="55" r="5"/><circle cx="204" cy="38" r="5"/></g></svg>';
  // Lavender header and the wide illustration banner from the supplied reference.
  const mast=e("header","econ-screenshot-head");
  const top=e("div","econ-screenshot-nav");
  const brand=e("div","econ-screenshot-brand");
  brand.append(e("span","econ-screenshot-logo","▧"),a("研究学习中心",site+"study/"));
  brand.append(e("small","","计量经济学120天系统课程"));
  top.append(brand);
  const nav=e("nav");nav.setAttribute("aria-label","学习中心导航");
  [["⌂ 首页",site+"study/"],["▤ 全部课程",site],
    ["◈ 120课原纲",root],["✧ 36模块",root+"v2/"],["▥ 学习进度","#econ-screenshot-progress"]].forEach(([name,href],i)=>{
    const link=a(name,href);
    if((i===2&&!isModule)||(i===3&&isModule))link.setAttribute("aria-current","page");
    nav.append(link);
  });
  top.append(nav);const avatar=e("span","econ-screenshot-avatar","●");avatar.title="学习进度仅保存在本浏览器";avatar.setAttribute("aria-label","本地个人学习记录");top.append(avatar);mast.append(top);
  const cover=e("section","econ-screenshot-cover");
  cover.setAttribute("aria-label","计量经济学课程横幅");
  const inner=e("div","econ-screenshot-cover-inner");
  const text=e("div","econ-screenshot-cover-copy");
  text.append(e("div","econ-screenshot-cover-kicker","ECONOMETRICS · STATISTICAL REASONING"));
  text.append(e("h1","","计量经济学120天系统课程"));
  text.append(e("p","",isModule?"六周36模块拓展 · 推断、估计与现代因果识别":"十章120节固定原纲 · 从经典回归到因果推断 · Stata与Python"));
  const chips=e("div","econ-screenshot-chips");
  ["◈　模型估计","▥　统计推断","◇　因果识别","✦　实证复现"].forEach(s=>chips.append(e("span","",s)));
  text.append(chips);inner.append(text);
  const plot=e("div","econ-screenshot-plot");plot.innerHTML=bannerSvg;inner.append(plot);
  cover.append(inner);mast.append(cover);
  // Wrap the original main node without rebuilding lesson text or formulas.
  const grid=e("div","econ-screenshot-grid");
  const left=e("aside","econ-screenshot-left");left.setAttribute("aria-label","课程目录");
  const center=e("div","econ-screenshot-center");
  const right=e("aside","econ-screenshot-right");right.setAttribute("aria-label","课程学习状态及练习");
  grid.append(left,center,right);
  const oldHeader=document.querySelector("body > header");
  body.insertBefore(mast,oldHeader||main);
  body.insertBefore(grid,oldHeader||main);
  body.dataset.econLayout=mode;
  const archive=body.querySelector(":scope > aside.archive-note");
  if(archive)center.append(archive);
  // The left accordion is generated from the canonical 120-lesson catalog.
  const sideBox=e("section","econ-screenshot-sidebox");
  sideBox.append(e("div","econ-screenshot-side-title",isModule?"☷　六周模块目录":"☷　十章课程目录"));
  const tree=e("div","econ-screenshot-tree");
  if(!isModule){
    data.chapters.forEach(ch=>{
      const d=e("details");
      if((chapter&&chapter.number===ch.number)||(mode==="home"&&ch.number===1))d.open=true;
      d.append(e("summary","","第"+ch.number+"章　"+ch.title));
      const items=e("div","econ-screenshot-lessons");
      ch.lessons.forEach(l=>{
        const label=ch.number+"."+l.section+"　"+l.title;
        if(l.published&&l.url){
          const link=a(label,root+l.url,l.id===id?"is-active":"");
          if(l.id===id)link.setAttribute("aria-current","page");
          items.append(link);
        }else items.append(e("span","",label));
      });
      d.append(items);tree.append(d);
    });
  }else{
    for(let week=1;week<=6;week++){
      const d=e("details");
      if((current&&current.week===week)||(mode==="module-home"&&week===1))d.open=true;
      d.append(e("summary","","第"+week+"周　"+data.weekTitles[week-1]));
      const items=e("div","econ-screenshot-lessons");
      data.modules.filter(x=>x.week===week).forEach(m=>{
        const link=a(m.id+"　"+m.title,root+"v2/modules/"+m.id+".html",m.id===id?"is-active":"");
        if(m.id===id)link.setAttribute("aria-current","page");
        items.append(link);
      });
      d.append(items);tree.append(d);
    }
  }
  sideBox.append(tree);left.append(sideBox);
  const decor=e("div","econ-screenshot-decoration");
  decor.setAttribute("aria-hidden","true");decor.innerHTML=sidebarSvg;left.append(decor);
  // Breadcrumbs and actual next/previous course navigation.
  const breadcrumb=e("nav","econ-screenshot-crumb");
  breadcrumb.setAttribute("aria-label","课程位置");
  breadcrumb.append(a("⌂ 课程首页",root));
  const sep=()=>breadcrumb.append(e("span","econ-screenshot-sep","›"));
  if(isModule){
    sep();breadcrumb.append(a("36模块拓展",root+"v2/"));
  }else if(chapter){
    sep();breadcrumb.append(a("第"+chapter.number+"章 · "+chapter.title,root+"#catalog"));
  }
  if(current){sep();breadcrumb.append(e("span","",isModule?id+" · "+short(current.title,23):"第"+current.section+"节 · "+short(current.title,25)));}
  else{sep();breadcrumb.append(e("span","",isModule?"六周36模块目录":"十章120课目录"));}
  if(current){
    const list=isModule?data.modules:all;
    const index=list.findIndex(x=>x.id===id);
    const switcher=e("div","econ-screenshot-switch");
    if(index>0){
      const prev=list[index-1];switcher.append(a("〈 上一课",isModule?root+"v2/modules/"+prev.id+".html":root+prev.url));
    }
    if(index<list.length-1){
      const next=list[index+1];switcher.append(a("下一课 〉",isModule?root+"v2/modules/"+next.id+".html":root+next.url));
    }
    breadcrumb.append(switcher);
  }
  center.append(breadcrumb,main);
  const primary=Array.from(main.querySelectorAll("section.paper")).filter(s=>Boolean(s.querySelector("h2")));
  const sections=primary.filter(s=>!s.parentElement.closest("section.paper"));
  const parts=sections.length>2?sections:primary;
  const palettes=[
    ["#8549c5","#f5eafe","♧"],["#478fc6","#e8f3ff","▤"],
    ["#32a08a","#ecf8f4","▥"],["#6d5acb","#efedff","⌘"],
    ["#ce9253","#fff4e6","!"],["#d56f9e","#fff0f8","✎"],
    ["#3c9db1","#eef8ff","✓"]];
  parts.forEach((section,i)=>{
    const [color,tint,icon]=palettes[i%palettes.length];
    section.classList.add("econ-screenshot-part");
    section.style.setProperty("--e-part",color);section.style.setProperty("--e-tint",tint);
    const h2=section.querySelector("h2");
    if(h2)h2.dataset.eIcon=icon;
    if(!section.id)section.id="econ-screenshot-part-"+(i+1);
  });

  // Display the reference's illustrated opening card using the existing lesson paragraph.
  // The paragraph is moved once, never cloned or rewritten.
  if(isLesson&&parts.length){
    const first=parts[0];
    let lead=Array.from(first.children).find(x=>x.tagName==="P"&&x.textContent?.trim().length>35);
    if(!lead){
      const primer=first.querySelector(".concept-primer");
      if(primer)lead=Array.from(primer.children).find(x=>x.tagName==="P"&&x.textContent?.trim().length>35);
    }
    if(lead){
      const row=e("div","econ-screenshot-intro");
      const visual=e("figure","econ-screenshot-concept-art");
      visual.setAttribute("role","img");
      visual.setAttribute("aria-label","散点及趋势线的统计示意图");
      visual.innerHTML='<svg viewBox="0 0 310 185" aria-hidden="true"><defs><linearGradient id="econIntro" x1="0" x2="1" y2="1"><stop stop-color="#f0c0ff"/><stop offset="1" stop-color="#9dcfff"/></linearGradient></defs><rect width="310" height="185" rx="9" fill="#28396f"/><g stroke="#b3c6ec" opacity=".23"><path d="M29 26H283M29 62H283M29 98H283M29 134H283M66 17V156M129 17V156M192 17V156M255 17V156"/></g><path d="M29 17V157H283" stroke="#a4bce7" stroke-width="2"/><path d="M42 135C103 126 153 89 266 43" stroke="url(#econIntro)" fill="none" stroke-width="5" stroke-linecap="round"/><g fill="#efc6f4"><circle cx="55" cy="127" r="5"/><circle cx="77" cy="127" r="5"/><circle cx="94" cy="109" r="4"/><circle cx="121" cy="112" r="5"/><circle cx="140" cy="85" r="4"/><circle cx="164" cy="82" r="5"/><circle cx="186" cy="92" r="4"/><circle cx="206" cy="64" r="5"/><circle cx="241" cy="58" r="4"/><circle cx="266" cy="39" r="5"/></g><g font-family="sans-serif" font-size="11" fill="#e9ebff"><text x="41" y="17">DATA × MODEL</text><text x="275" y="172">X</text><text x="15" y="24">Y</text></g></svg>';
      const prose=e("div","econ-screenshot-intro-prose");
      lead.parentNode.insertBefore(row,lead);
      row.append(visual,prose);prose.append(lead);
    }
    // Three varied color tiles navigate to real headings, without inventing content.
    if(parts.length>=3){
      const section=parts[1],heading=section.querySelector(":scope > h2");
      const tiles=e("nav","econ-screenshot-pillars");
      tiles.setAttribute("aria-label","本课知识结构");
      [parts[0],parts[1],parts[2]].forEach((part,i)=>{
        if(!part.id)part.id="econ-screenshot-content-"+(i+1);
        const tile=a("","#"+part.id,"econ-screenshot-pillar");
        tile.append(e("span","econ-screenshot-pillar-icon",["◇","☷","◎"][i]));
        const texts=e("span","econ-screenshot-pillar-copy");
        texts.append(e("strong","",short(part.querySelector("h2")?.textContent||"本课内容",23)));
        texts.append(e("small","",short(part.querySelector("p")?.textContent||"进入知识板块",42)));
        tile.append(texts);tiles.append(tile);
      });
      if(heading)heading.insertAdjacentElement("afterend",tiles);
    }
  }
  if(isLesson){
    const meta=e("div","econ-screenshot-facts");
    const chips=isModule?["◇ "+id+" · 第"+current.week+"周","◷ 按理解进度学习","▤ 独立36模块拓展","◈ 理论 · 案例 · 练习"]:
      ["◇ 第"+current.chapter+"章 · 第"+current.section+"节","◷ 建议分段学习","▤ 全课程第"+current.number+"课 / 120","◈ Stata · Python"];
    chips.forEach(t=>meta.append(e("span","",t)));
    const oldHero=main.querySelector(".hero");
    if(oldHero)oldHero.insertAdjacentElement("afterend",meta);else main.prepend(meta);
    if(parts.length){
      const tabs=e("nav","econ-screenshot-mini");
      tabs.setAttribute("aria-label","本节讲义结构");
      tabs.append(a("◉ 课程导览","#econ-screenshot-progress"));
      parts.slice(0,7).forEach(p=>tabs.append(a(short(p.querySelector("h2")?.textContent||"课程内容",16),"#"+p.id)));
      meta.insertAdjacentElement("afterend",tabs);
    }
  }
  // Right-side progress: only three MANUAL lesson checklist items, never inferred from published.
  const progress=e("section","econ-screenshot-rightbox");
  progress.id="econ-screenshot-progress";
  const title=e("div","econ-screenshot-right-title");
  title.append(e("span","","▥　学习进度"));
  const percentage=e("small","",isLesson?"本课完成度：0%":"课程索引");
  title.append(percentage);progress.append(title);
  const progressContent=e("div","econ-screenshot-progress-body");
  if(isLesson){
    const meter=e("div","econ-screenshot-meter");
    const fill=e("span");meter.append(fill);
    meter.setAttribute("role","progressbar");
    meter.setAttribute("aria-label","本课自评完成度");
    meter.setAttribute("aria-valuemin","0");meter.setAttribute("aria-valuemax","100");
    progressContent.append(meter);
    const checks=e("div","econ-screenshot-ticks");
    let state=[false,false,false];
    const storageKey="econ:screen:progress:"+mode+":"+id;
    try{const val=JSON.parse(localStorage.getItem(storageKey)||"null");if(Array.isArray(val)&&val.length===3)state=val.map(Boolean);}catch(_){}
    const update=()=>{
      const n=state.filter(Boolean).length,percent=Math.round(n*100/3);
      percentage.textContent="本课完成度："+percent+"%";
      fill.style.transform="scaleX("+(percent/100)+")";
      meter.setAttribute("aria-valuenow",String(percent));
    };
    ["阅读并理解本课内容","检查数据与代码示例","完成练习并复盘"].forEach((label,i)=>{
      const item=e("label");
      const input=e("input");input.type="checkbox";input.checked=state[i];input.setAttribute("aria-label",label);
      input.addEventListener("change",()=>{state[i]=input.checked;try{localStorage.setItem(storageKey,JSON.stringify(state));}catch(_){}update();});
      item.append(input,e("span","",label));checks.append(item);
    });
    progressContent.append(checks);update();
  }else{
    progressContent.append(e("p","","按真实课次学习；网页已发布数量不等于个人实际完成数量。"));
    const meter=e("div","econ-screenshot-meter");meter.append(e("span"));progressContent.append(meter);
  }
  progress.append(progressContent);
  if(isLesson){
    const art=e("span","econ-screenshot-progress-art");
    art.setAttribute("aria-hidden","true");
    art.innerHTML='<svg viewBox="0 0 85 105" fill="none"><rect x="14" y="15" width="60" height="80" rx="9" fill="#d7c5f9" stroke="#9977d5" stroke-width="4" transform="rotate(9 43 55)"/><rect x="27" y="7" width="26" height="14" rx="4" fill="#8864ca"/><g stroke="#8862c9" stroke-width="3.5" stroke-linecap="round"><path d="m23 34 6 5 9-12M44 37h20M24 55l6 5 9-12M45 58h18M25 76l6 5 9-12M46 79h17"/></g></svg>';
    progress.append(art);
  }
  right.append(progress);
  if(isLesson){
    // Practice excerpts come ONLY from the lesson's question section, not the answer blocks.
    const practice=parts.find(s=>/练习|习题|自测|思考题|应用任务/.test(s.querySelector("h2")?.textContent||""));
    const box=e("section","econ-screenshot-rightbox is-exercises");
    box.append(e("div","econ-screenshot-right-title","◎　今日练习"));
    const rows=e("div","econ-screenshot-exercise-list");
    let questions=[];
    if(practice){
      for(const node of practice.querySelectorAll("h3,li,p")){
        if(node.closest("details,.exercise-answer,.model-answer,.answer"))continue;
        const txt=short(node.textContent,109);
        if(txt.length<15||/^(参考)?答案|^解答|^解析|^评分标准/.test(txt))continue;
        if(!questions.includes(txt))questions.push(txt);
        if(questions.length===2)break;
      }
    }
    if(!questions.length)questions=["依据正文给出的概念或模型，完成本课的练习并复核答案。"];
    questions.forEach((q,i)=>{
      const row=e("div","econ-screenshot-exercise");
      row.append(e("span","econ-screenshot-exercise-num",String(i+1)),e("div","",q));rows.append(row);
    });
    box.append(rows);
    if(practice)box.append(a("前往练习与参考答案 →","#"+practice.id));
    right.append(box);
    const takeaways=e("section","econ-screenshot-rightbox is-notes");
    takeaways.append(e("div","econ-screenshot-right-title","✧　本课学习要点"));
    const points=e("div","econ-screenshot-notes");
    const choices=[parts[0],parts[1],practice||parts[parts.length-1]].filter(Boolean);
    choices.forEach(p=>points.append(a(short(p.querySelector("h2")?.textContent||"重点内容",40),"#"+p.id)));
    takeaways.append(points);right.append(takeaways);
  }else{
    const box=e("section","econ-screenshot-rightbox is-notes");
    box.append(e("div","econ-screenshot-right-title","✧　课程资源"));
    const items=e("div","econ-screenshot-aside-text");
    items.append(e("p","","原120课主线与36模块拓展相互独立。点击左侧章节进入讲义，学习进度以个人实际完成情况为准。"));
    items.append(a("十章120课目录",root+"#catalog"),a("六周36模块拓展",root+"v2/"));
    box.append(items);right.append(box);
  }
  console.info("Screenshot-style econometrics reader active",mode,id||"index",parts.length);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
else start();
})();
