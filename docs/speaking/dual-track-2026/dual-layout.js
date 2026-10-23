/* Canonical 022-style layout for 2026 dual-track AM/PM lesson pages.
   Presentation only: preserves source text, assessment order and reference concealment. */
(function(){
"use strict";
const found=location.pathname.match(/\/speaking\/dual-track-2026\/(am|pm)\/day-(\d{2})\.html$/);
if(!found)return;
const mode=found[1],day=found[2];
const palette=[
 ["#528bc8","#edf5ff"],["#b98444","#fff7ed"],["#399a86","#eefaf4"],
 ["#8069bd","#f4f0ff"],["#ba658d","#fff2f7"]
];
function element(tag,cls,text){
 const e=document.createElement(tag);
 if(cls)e.className=cls;
 if(text!==undefined&&text!==null)e.textContent=text;
 return e;
}
function card(kicker,title,cls){
 const s=element("section","card"+(cls?" "+cls:""));
 if(kicker)s.appendChild(element("div","kicker",kicker));
 if(title)s.appendChild(element("h2","",title));
 return s;
}
function coloredStep(time,label,body,i){
 const color=palette[i%palette.length];
 const step=element("div","step");
 step.style.setProperty("--accent",color[0]);
 step.style.setProperty("--wash",color[1]);
 step.appendChild(element("div","when",time));
 const content=element("div","step-content");
 content.appendChild(element("h3","",label||"独立训练"));
 const p=element("p","",body);
 content.appendChild(p);
 step.appendChild(content);
 return step;
}
function splitTimeSteps(text){
 const regex=/(\d{1,2}\s*[—–-]\s*\d{1,2}\s*分钟)(?:\s*[｜|]\s*([^：:\n]{1,75}))?\s*[：:]/g;
 const marks=Array.from(text.matchAll(regex));
 const head=marks.length?text.slice(0,marks[0].index).trim():text.trim();
 const items=[];
 for(let i=0;i<marks.length;i++){
  const hit=marks[i],end=i+1<marks.length?marks[i+1].index:text.length;
  items.push({when:hit[1].replace(/\s/g,""),title:(hit[2]||"独立训练").trim(),text:text.slice(hit.index+hit[0].length,end).trim()});
 }
 return {head,items};
}
function firstPhrase(text){
 const s=String(text||"").replace(/\s+/g," ").trim();
 return s.split(/[。；]/)[0].replace(/[，、]\s*$/,"").trim();
}
function shortQuoted(text,max){
 const s=String(text||"").replace(/\s+/g," ").trim();
 return s.length>max?s.slice(0,max-1)+"…":s;
}
function referenceKeyTerms(text){
 const first=firstPhrase(text);
 return first.split(/[—–→]/).map(x=>x.trim()).filter(Boolean).slice(0,5);
}
function prepareAnswer(original,ctx){
 if(!original)return null;
 const context=ctx||{};
 original.open=false;
 original.removeAttribute("open");
 original.classList.add("answer");
 const body=original.querySelector(".answer");
 if(body){
  body.classList.remove("answer");
  body.classList.add("answer-body");
  const nodes=Array.from(body.childNodes);
  const frag=document.createDocumentFragment();
  let current=null;
  for(const n of nodes){
   const isLabel=n.nodeType===1&&/^(STRONG|B)$/.test(n.nodeName)&&/[：:]$/.test((n.textContent||"").trim());
   if(isLabel){
    const label=(n.textContent||"").trim();
    const isKeyword=/关键词/.test(label),isWarning=/纠错|反例/.test(label);
    const block=element("div",isKeyword?"hint":isWarning?"notice":"utter");
    block.appendChild(element("div","speaker",label));
    current=element("p","");
    block.appendChild(current);
    frag.appendChild(block);
   }else{
    if(current)current.appendChild(n);
    else if((n.textContent||"").trim()){
     const note=element("p","small");
     note.appendChild(n);
     frag.appendChild(note);
    }
   }
  }
  body.replaceChildren(frag);

  // All comparison material is appended INSIDE the same initially closed details.
  // Derive contrasting emphases from this lesson's own two samples and keyword sets.
  const demos=Array.from(body.querySelectorAll(".utter"));
  const hints=Array.from(body.querySelectorAll(".hint"));
  const keys=hints.slice(0,2).map(h=>referenceKeyTerms(h.querySelector("p")?.textContent));
  if(demos.length>=2&&keys.length===2&&keys.every(arr=>arr.length>=2)){
   const a=keys[0],b=keys[1];
   const compare=element("section","reference-contrast");
   compare.appendChild(element("h3","","两种路径的重点在哪里"));
   const grid=element("div","reference-path-grid");
   const paths=[
    {start:a[0],end:a[a.length-1],name:"第一份示范"},
    {start:b[0],end:b[b.length-1],name:"第二份示范"}
   ];
   paths.forEach((route,i)=>{
    const item=element("div","reference-path");
    item.appendChild(element("h4","",route.name+"｜起点不同"));
    item.appendChild(element("p","",
     "提纲先抓「"+route.start+"」，再逐步推进到「"+route.end+"」。核对示范中的中间论据是否真正支持这一收束，而不是只记住关键词。"));
    grid.appendChild(item);
   });
   compare.appendChild(grid);
   if(context.question){
    compare.appendChild(element("p","reference-specific-question",
     "回到本课问题「"+shortQuoted(context.question,70)+"」：两份示范并非简单换词。请判断自己的回答采用了哪种切入点，是否具备支撑它的具体信息。"));
   }
   body.appendChild(compare);

   const practice=element("section","reference-transfer");
   practice.appendChild(element("h3","","针对性改写｜只改一句"));
   practice.appendChild(element("p","",
    mode==="am"?
     "从第一次录音中找一句含糊或跳跃的表达，将它修改成可顺接「"+a[0]+"」或「"+b[0]+"」的具体理由；再确认修改后没有声称题目未给出的事实。":
     "从自己的两组三词方案中选一组，把一句抽象判断改成有明确依据或适用条件的表达；重点检查「"+a[a.length-1]+"」与「"+b[b.length-1]+"」这两种收束是否各自成立。"));
   if(context.transfer){
    practice.appendChild(element("p","reference-transfer-question",
     "换到原课的迁移情境「"+shortQuoted(context.transfer,92)+"」，哪一条路径还能沿用？应替换哪个关键词？只写下一个具体调整，不增加新的训练时长。"));
   }
   body.appendChild(practice);

   const reviewTitle=element("h3","","练后自评｜三项判断");
   const reviewList=element("ol","check");
   const checks=[
    "能否说明第一份以「"+a[0]+"」切入、第二份以「"+b[0]+"」切入的差别，而不是把两段示范拼起来？",
    "你的理由或例子是否支撑了「"+a[a.length-1]+"」或「"+b[b.length-1]+"」这样的结尾？哪里仍需要条件或证据？",
    mode==="am"?
      "改写后重新听一次：是否比首次录音更贴合这道题，且不以重录成绩覆盖初测？":
      "关掉示范后，能否不照抄三词提纲，自行说清其中一条路径的逻辑和边界？"
   ];
   checks.forEach(x=>reviewList.appendChild(element("li","",x)));
   body.append(reviewTitle,reviewList);
  }else{
   // Preserve the full original demonstrations. Never invent missing keywords.
   const fallback=element("p","reference-fallback",
    "两份示范及其关键词请按原文比较：核查判断是否贴题、理由是否足够、结尾是否保留必要条件。");
   body.appendChild(fallback);
  }
 }
 const reveal=element("section","reveal");
 reveal.appendChild(element("div","kicker","AFTER PRACTICE · 练后对照"));
 const summary=original.querySelector("summary");
 if(summary&&!summary.querySelector(".reference-subtitle")){
  summary.appendChild(element("small","reference-subtitle","两份示范 · 路径比较 · 只改一句 · 自评三项"));
 }
 reveal.appendChild(original);
 return reveal;
}
function extractBodyText(lesson,withoutTask){
 const clone=lesson.cloneNode(true);
 clone.querySelectorAll("h2,details").forEach(n=>n.remove());
 if(withoutTask)clone.querySelectorAll(".lesson-task-card").forEach(n=>n.remove());
 return clone.textContent||"";
}
function taskCard(task,title,prefix){
 const section=card("本课任务 · TODAY'S QUESTION","先独立完成今天的题目","task-panel");
 const q=element("div","question");
 if(task){
  task.querySelectorAll(".task-kicker").forEach(n=>n.remove());
  while(task.firstChild)q.appendChild(task.firstChild);
  if(prefix){
   const p=element("p","task-extra",prefix);
   q.appendChild(p);
  }
 }else{
  q.textContent=prefix||"请依据本课原题完成训练，不提前查看示范。";
 }
 section.appendChild(q);
 return section;
}
function timerPanel(aside,taskText){
 const durationHit=String(taskText||"").match(/连续录音\s*(\d+)秒/)||
  String(taskText||"").match(/首次录音\s*(\d+)秒/)||
  String(taskText||"").match(/录音\s*(\d+)秒/);
 const secondsFromTask=durationHit?Number(durationHit[1]):60;
 const defaultSeconds=[45,60,75,90,120,180,240].includes(secondsFromTask)?secondsFromTask:60;
 const panel=card("TIMER · 早晨开口","独立发言倒计时");
 panel.classList.add("dual-timer-panel");
 const clock=element("div","timer","01:00");
 clock.setAttribute("aria-live","off");
 const select=element("select","dual-timer-preset");
 select.setAttribute("aria-label","选择发言时长");
 for(const seconds of [45,60,75,90,120,180,240]){
  const opt=element("option","",seconds+"秒");
  opt.value=String(seconds);
  if(seconds===defaultSeconds)opt.selected=true;
  select.appendChild(opt);
 }
 const buttons=element("div","buttons");
 const start=element("button","btn","开始"),reset=element("button","btn secondary","重置");
 start.type=reset.type="button";
 buttons.append(start,reset);
 const status=element("div","status");
 status.setAttribute("role","status");
 const tip=element("p","small","计时器不会录音；请使用设备自带录音工具，测评课严格按原题指定时长执行。");
 panel.append(clock,select,buttons,status,tip);
 aside.prepend(panel);
 let remaining=defaultSeconds,interval=null,endAt=0;
 function paint(){clock.textContent=String(Math.floor(remaining/60)).padStart(2,"0")+":"+String(remaining%60).padStart(2,"0");}
 function halt(){if(interval!==null){clearInterval(interval);interval=null;}}
 function tick(){
  remaining=Math.max(0,Math.ceil((endAt-Date.now())/1000));paint();
  if(!remaining){halt();start.textContent="再计一次";status.textContent="时间结束，请保存录音。";}
 }
 start.addEventListener("click",function(){
  if(interval!==null){tick();halt();start.textContent="继续";return;}
  if(!remaining)remaining=Number(select.value);
  endAt=Date.now()+remaining*1000;
  interval=setInterval(tick,200);
  start.textContent="暂停";
  status.textContent="";
  paint();
 });
 reset.addEventListener("click",function(){halt();remaining=Number(select.value);paint();start.textContent="开始";status.textContent="";});
 select.addEventListener("change",function(){halt();remaining=Number(select.value);paint();start.textContent="开始";status.textContent="";});
 paint();
}
function reviewPanel(aside){
 const panel=card("SELF-CHECK · 个人复盘",mode==="am"?"完成录音后自评":"静默练习后自评");
 const tasks=mode==="am"?["已保存首次录音","已回听并记录一个具体问题","已完成修改后表达","已完成陌生话题迁移"]:["已完成同题静默构思","已区分主要问题与证据边界","已完成错误纠正","已写下明日迁移要点"];
 const checks=element("div","checks"),status=element("div","status");
 const key="speaking:dual-layout-check:"+mode+":"+day;
 let saved=[];
 try{saved=JSON.parse(localStorage.getItem(key)||"[]")}catch(e){}
 for(let i=0;i<tasks.length;i++){
  const row=element("label","");
  const input=document.createElement("input");input.type="checkbox";input.checked=!!saved[i];
  row.append(input,document.createTextNode(tasks[i]));
  checks.appendChild(row);
  input.addEventListener("change",function(){
   const vals=Array.from(checks.querySelectorAll("input")).map(x=>x.checked);
   try{localStorage.setItem(key,JSON.stringify(vals));}catch(e){}
   draw();
  });
 }
 function draw(){
  status.textContent="已自评 "+Array.from(checks.querySelectorAll("input")).filter(x=>x.checked).length+" / "+tasks.length+" 项";
 }
 draw();
 panel.append(checks,status,element("p","small","记录只保存在当前浏览器，不上传个人录音或评分。"));
 aside.appendChild(panel);
}

// The learning cards below use only the scenario and question already printed in this lesson.
// They add presentation and an evidence-aware workflow; never reveal example answers.
const assessmentDays=new Set(["01","07","14","21","28","35","42","49","56","63"]);
const inputLabels=["训练目标","场景","模拟场景","原创模拟情境","完整模拟材料",
 "模拟情境","情境材料","情境","直接回答的完整题目","完整口头任务",
 "口头练习题","明确问题","本课任务","题目","完整题目","任务要求","口头任务"];
function labeledPart(raw,labels){
 const value=String(raw||"").replace(/\s+/g," ").trim();
 for(const label of labels){
  const mark=label+"：";
  let at=value.indexOf(mark);
  let size=mark.length;
  if(at<0){const alternate=label+":";at=value.indexOf(alternate);size=alternate.length;}
  if(at<0)continue;
  let end=value.length;
  for(const next of inputLabels){
   let start=value.indexOf(next+"：",at+size);
   if(start<0)start=value.indexOf(next+":",at+size);
   if(start>=0&&start<end)end=start;
  }
  const answer=value.slice(at+size,end).trim();
  if(answer)return answer;
 }
 return "";
}
function materialLine(title,value,tone){
 const wrap=element("div","material"+(tone?" "+tone:""));
 wrap.appendChild(element("b","",title));
 wrap.appendChild(element("p","",value));
 return wrap;
}
function learningMaterialCard(lesson,task,prelude){
 const box=card("READY-TO-USE MATERIAL · 无需另找","今日素材","dual-material-card");
 if(mode==="am"){
  const supplied=((task&&task.textContent)||"")+"\n"+String(prelude||"");
  const situation=labeledPart(supplied,["完整模拟材料","原创模拟情境","情境材料","模拟情境","模拟场景","场景","情境"]);
  const question=labeledPart(supplied,["直接回答的完整题目","完整口头任务","口头练习题","明确问题","完整题目","口头任务","任务要求"]);
  if(situation)box.appendChild(materialLine("已给出的场景材料",situation,""));
  if(question)box.appendChild(materialLine("需要独立回答的问题",question,"alt"));
  if(!situation&&!question){
   const original=String(prelude||"").trim()||((task&&task.textContent)||"").trim();
   box.appendChild(materialLine("本课提供的练习题目",original||"按原题所列情境完成开口训练。",""));
  }
 }else{
  const paragraph=lesson.querySelector(".depth-analysis p");
  const info=paragraph?paragraph.textContent:"";
  // First paragraph of the existing deep analysis states “情境是……”；“实际问题是……”.
  const match=info.match(/情境是[“"]([\s\S]*?)[”"]\s*[；;,，]?\s*实际问题是[“"]([\s\S]*?)[”"]/);
  if(match){
   box.appendChild(materialLine("同题情境（原课材料）",match[1].trim(),""));
   box.appendChild(materialLine("本课需要分析的问题",match[2].trim(),"alt"));
  }else{
   // Do not fabricate a scenario when a source field is unavailable.
   const quoted=info.replace(/^\s*信息分层[：:]\s*/,"").trim();
   box.appendChild(materialLine("本课已有案例与研究问题",quoted||"请依据下面的本题信息—机制—边界分析材料独立辨析。",""));
  }
 }
 return box;
}
function keyReminderCard(material){
 // Important Reminders are deliberately NOT a compulsory card on every lesson.
 // The basic recording, privacy and practice rules are already explained in the
 // actual training steps and course overview; avoid repeating them 126 times.
 const prompt=(material?.textContent||"").replace(/\s+/g," ").trim();
 let points=[];
 if(assessmentDays.has(day)){
  points=mode==="am"?[
   "无提示测评：首次录音前只看原题和必要情境，不看参考答案、示范关键词或测后结构提示。",
   "按本题指定时长保存第一次录音和原始评分。之后的改述不能替换或回填原始成绩。"
  ]:[
   "今天是测评日的晚课：分析应基于已封存的早间首次录音；练后改写和新评分不得回填为初测。"
  ];
 }else if(mode==="am"){
  // A single prompt-specific caveat only when the source creates a real risk.
  if(/正相关|统计关联|因果|必然促进|必然导致/.test(prompt)){
   points=["若题目仅给出统计关联，就不能断言“必然导致”或“已经证明”。先指出需要检验的其他解释。"];
  }else if(/数据缺失|分组方法|样本选取|变量测量|统计数字/.test(prompt)){
   points=["材料没有交代的缺失原因、分组条件或样本信息不得自行补全；提出疑问而非编造处理结果。"];
  }else if(/推断动机|不负责任|不配合|故意|传闻|隐私|私人信息/.test(prompt)){
   points=["只陈述情境已知的行为或影响，不推断他人的动机与责任；建议先核实具体情况。"];
  }else if(/预算有限|折中方案|预算分配|资源冲突/.test(prompt)){
   points=["折中不是各退一半；必须交代共同目标、取舍依据及尚未确定的条件。"];
  }else if(/截止时间|提前一天|更改期限|临时改变/.test(prompt)){
   points=["时间安排的建议应考虑原有预期与过渡条件，不默认每个人都能立即调整。"];
  }else if(/指出错误|具体反馈|给出点评|评价学生/.test(prompt)){
   points=["建议针对可观察的具体表现，不将一次表达失误泛化为对个人能力的判断。"];
  }
 }
 if(points.length===0)return null;
 const box=card("IMPORTANT · CASE-SPECIFIC","重要提醒","dual-reminder-card");
 const list=element("ul","dual-reminder-list");
 points.forEach(v=>list.appendChild(element("li","",v)));
 box.appendChild(list);
 return box;
}
function todaysOutcomesCard(){
 const box=card("TODAY'S OUTPUT · LEARNING RECORD","今日成果","dual-outcome-card");
 const outputs=mode==="am"?
  ["首次录音：按原题时长保存音频，复测课同时记录原始准备时间和评分。",
   "回听记录：明确指出一处贴题、结构、理由、准确性或表达自然度问题。",
   "修改与迁移：保留重录结果，完成一段换题口头回应，不覆盖首次录音。",
   "下次改进点：记录一条具体、可执行的表达调整。"]:
  ["两套结构：针对同一题目，自拟两组不同的关键词或简短论证路线。",
   "反例修订：指出至少一处不当表达及其原因，写出更准确的替换说法。",
   "迁移记录：写下一条适用于新情境的表达原则及其边界。",
   "独立归档：晚课纸笔成果单独记录，不能代替早课录音。"];
 const list=element("ol","dual-outcome-list");
 outputs.forEach(v=>list.appendChild(element("li","",v)));
 box.appendChild(list);
 return box;
}
function transformMorning(lesson,main,aside){
 const details=lesson.querySelector("details");
 if(!details)return false;
 const task=lesson.querySelector(".lesson-task-card");
 const sourceText=extractBodyText(lesson,!!task);
 const parsed=splitTimeSteps(sourceText);
 if(parsed.items.length!==5)return false;
 const heading=lesson.querySelector("h2");
 const title=heading?heading.textContent:"早晨独立开口训练";
 const material=learningMaterialCard(lesson,task,parsed.head);
 const taskPart=taskCard(task,title,parsed.head);
 const practice=card("18-MINUTE PRACTICE · 五步训练",title);
 const steps=element("div","steps");
 parsed.items.forEach((x,i)=>steps.appendChild(coloredStep(x.when,x.title,x.text,i)));
 practice.appendChild(steps);
 const reference=prepareAnswer(details,{
  question:material.querySelector(".material.alt p")?.textContent||material.querySelector(".material p")?.textContent||parsed.head,
  transfer:parsed.items[4].text
 });
 const completion=main.querySelector(".course-completion[data-completion-id]");
 if(!completion||!reference)return false;
 const note=keyReminderCard(material);
 main.replaceChildren(taskPart,material,...(note?[note]:[]),practice,todaysOutcomesCard(),reference,completion);
 timerPanel(aside,(task?task.textContent:parsed.head)||"");
 reviewPanel(aside);
 return true;
}
function normalizeLooseParagraphs(section){
 const head=Array.from(section.childNodes).slice(0,2);
 const tail=Array.from(section.childNodes).slice(2);
 const fragment=document.createDocumentFragment();
 let paragraph=null;
 for(const node of tail){
  const block=node.nodeType===1&&/^(P|DIV|SECTION|OL|UL|TABLE|PRE|BLOCKQUOTE|DETAILS|ARTICLE)$/.test(node.nodeName);
  if(block){paragraph=null;fragment.appendChild(node);continue;}
  if(node.nodeType===3&&!node.textContent.trim()&&!paragraph)continue;
  if(!paragraph){paragraph=element("p","dual-paragraph");fragment.appendChild(paragraph);}
  paragraph.appendChild(node);
 }
 section.replaceChildren(...head,fragment);
}
function transformEvening(lesson,main,aside){
 const details=lesson.querySelector("details");
 const completion=main.querySelector(".course-completion[data-completion-id]");
 if(!details||!completion)return false;
 const material=learningMaterialCard(lesson,null,"");
 const nodes=Array.from(lesson.childNodes);
 const sections=[];
 const header=nodes.find(n=>n.nodeType===1&&n.nodeName==="H2");
 const intro=card("PM STUDY · 静默技巧学习",header?header.textContent:"18分钟静默训练");
 intro.classList.add("dual-intro");
 let active=intro,haveModules=0;
 for(const node of nodes){
  if(node===header||node===details)continue;
  if(node.nodeType===1&&node.nodeName==="H3"&&/\d{1,2}[—–-]\d{1,2}分钟/.test(node.textContent||"")){
   const part=card("PM · 分时训练",node.textContent);
   const pair=palette[haveModules%palette.length];
   part.classList.add("dual-module");
   part.style.setProperty("--module-accent",pair[0]);
   part.style.setProperty("--module-wash",pair[1]);
   sections.push(part);
   active=part;
   haveModules++;
  }else{
   active.appendChild(node);
  }
 }
 if(haveModules!==5)return false;
 normalizeLooseParagraphs(intro);
 sections.forEach(normalizeLooseParagraphs);
 const sourceForTransfer=lesson.textContent||"";
 const transferMatch=sourceForTransfer.match(/(?:换题|进阶迁移|迁移升级)[：:]\s*([^\n]{8,160})/);
 const questionFromMaterial=material.querySelector(".material.alt p")?.textContent||"";
 const reference=prepareAnswer(details,{
  question:questionFromMaterial,
  transfer:transferMatch?transferMatch[1]:""
 });
 if(!reference)return false;
 const note=keyReminderCard(material);
 main.replaceChildren(intro,material,...(note?[note]:[]),...sections,todaysOutcomesCard(),reference,completion);
 reviewPanel(aside);
 return true;
}
function ensureMorningEveningLink(main){
 if(mode!=="am"||!main||main.querySelector("[data-evening-next]"))return;
 const eveningHref="../pm/day-"+day+".html";
 const nav=element("nav","card dual-evening-nav");
 nav.setAttribute("aria-label","同日晚间课程跳转");
 nav.setAttribute("data-evening-next",day);
 nav.appendChild(element("div","kicker","NEXT LESSON · 同日晚间课"));
 nav.appendChild(element("h2","","继续第"+Number(day)+"天的晚间技巧课"));
 nav.appendChild(element("p","dual-evening-explanation","完成早间真实开口和自评后，可直接进入对应晚间课，学习技巧分析和静默练习；两课的完成状态分别记录。"));
 const link=element("a","dual-evening-action","🌙 点击进入第"+Number(day)+"天晚间课 →");
 link.setAttribute("href",eveningHref);
 link.setAttribute("aria-label","进入第"+Number(day)+"天晚间技巧精讲与静默练习");
 nav.appendChild(link);
 const completion=main.querySelector(".course-completion[data-completion-id]");
 if(completion)completion.insertAdjacentElement("beforebegin",nav);
 else main.appendChild(nav);
}
function initialize(){
 const main=document.querySelector(".layout > main.main");
 const aside=document.querySelector(".layout > aside.sidebar");
 const lesson=main&&main.querySelector("article.lesson");
 if(!main||!aside||!lesson||main.dataset.layoutStandardized)return;
 // Build only for the known 63+63 dual-track pages, never the legacy 18-week archive.
 const ok=mode==="am"?transformMorning(lesson,main,aside):transformEvening(lesson,main,aside);
 ensureMorningEveningLink(main);
 if(!ok)return;
 main.dataset.layoutStandardized="022-standard";
 document.documentElement.classList.remove("speaking-layout-v2");
 document.documentElement.classList.add("speaking-legacy-standard");
 document.body.classList.add("dual-layout-ready","dual-"+mode);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
})();