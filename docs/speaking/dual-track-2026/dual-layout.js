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
function prepareAnswer(original){
 if(!original)return null;
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
  // The two demonstrations, their own keywords and three reflection criteria
  // stay together behind the same closed disclosure.
  const reviewTitle=element("h3","","练后对照要点");
  const reviewList=element("ol","check");
  const checks=mode==="am"?[
   "是否先准确回答本题，且理由或情境细节紧扣对方的具体问题？",
   "是否避免编造个人经历或将缺乏证据的推测说成确定结论？",
   "首次录音、自评与修改后练习是否分别保存，迁移题是否独立完成？"
  ]:[
   "两条参考路径能否分别提炼出真正对应的具体关键词？",
   "是否辨清已知事实、合理假设与证据边界，没有将静默练习当成晨间录音？",
   "能否不看范例，针对另一种情境调整表达结构与关键词？"
  ];
  checks.forEach(x=>reviewList.appendChild(element("li","",x)));
  body.append(reviewTitle,reviewList);
 }
 const reveal=element("section","reveal");
 reveal.appendChild(element("div","kicker","AFTER PRACTICE · 练后对照"));
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
 const box=card("READY-TO-USE MATERIAL · 今日素材",mode==="am"?"今天要回应的情境":"今天要分析的同题案例","dual-material-card");
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
  box.appendChild(element("p","small","只需阅读本页给出的材料，无需另外查找新闻或案例。若为无提示测评，请先按原题完成首次录音，再进行分析。"));
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
  box.appendChild(element("p","small","素材来自本课原有案例描述，用于无声辨析；请区分已知条件与未经核实的推断，不把模拟情境写成真实新闻。"));
 }
 return box;
}
function keyReminderCard(){
 const box=card("IMPORTANT · 重要提醒","开始前必须注意的要求","dual-reminder-card");
 const points=mode==="am"?
  (assessmentDays.has(day)?
    ["本日为无提示基线或阶段复测：首次录音前只阅读原题与必要情境，不打开参考区，也不提前使用示范关键词或结构提示。","严格执行原题规定的准备与发言时长，单独保留首次录音和原始评分；测后重录不能替代测评成绩。","本课模拟情境只用于训练；不编造个人经历、数据、政策效果或未经证实的因果结论。"]:
    ["先独立开口并保存首次录音，之后再回听、修订；练习前不要展开参考示范。","优先修正一个具体问题，并将同一表达方法迁移到陌生情境，不照读范文。","依据给出的事实表达；模拟情境不是实际新闻或个人经历。"]) :
  ["晚间为独立的静默技巧课：可以思考或书写，不以默读替代早晨的真实录音与评分。","先完成同题推演、反例诊断与关键词整理，再打开练后参考，避免预先看到标准表达。","分析时区分情境已知信息、作者假设与待核实事实，不凭空补充案例数据。"];
 const list=element("ul","dual-reminder-list");
 points.forEach(v=>list.appendChild(element("li","",v)));
 box.appendChild(list);
 return box;
}
function todaysOutcomesCard(){
 const box=card("TODAY'S OUTPUT · 今日成果",mode==="am"?"完成本课后应保留什么":"完成晚间学习后应留下什么","dual-outcome-card");
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
 box.appendChild(element("p","small","这是本课18分钟内的学习产出核对清单，不另增训练时长；完成状态仍由下方原有按钮记录。"));
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
 const note=element("div","notice","请按原题要求保存首次录音，回听、自评后再展开下面的示范。无提示测评不得提前查看关键词。");
 practice.appendChild(note);
 const reference=prepareAnswer(details);
 const completion=main.querySelector(".course-completion[data-completion-id]");
 if(!completion||!reference)return false;
 main.replaceChildren(taskPart,material,keyReminderCard(),practice,todaysOutcomesCard(),reference,completion);
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
 const reference=prepareAnswer(details);
 if(!reference)return false;
 main.replaceChildren(intro,material,keyReminderCard(),...sections,todaysOutcomesCard(),reference,completion);
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