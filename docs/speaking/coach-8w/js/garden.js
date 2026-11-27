(function gardenApp(){
"use strict";
const $=id=>document.getElementById(id), E=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])), pad=n=>String(n).padStart(2,"0");
const KEY="speaking-coach-8w:personal:v1", GKEY="speaking-coach-8w:garden:v1", MKEY="speaking-coach-8w:garden-motion";
const oldDefault=()=>({version:1,current:1,units:{},records:[],cases:[],maintenance:[]}),newDefault=()=>({version:1,notes:{},marks:{},assessments:[],cases:[],maintenance:[]});
function read(k,f){try{let v=JSON.parse(localStorage.getItem(k)||"null");return v&&typeof v==="object"?v:f()}catch{return f()}}
let old=read(KEY,oldDefault),garden=read(GKEY,newDefault),data,transfers,unit=0,uid=0,storageOK=true,selection=null;
if(!old.units||!Array.isArray(old.records))old=oldDefault();
if(!garden.notes||!garden.marks||!Array.isArray(garden.assessments)||!Array.isArray(garden.cases)||!Array.isArray(garden.maintenance))garden=newDefault();
const labels=["破题贴题","逻辑骨架","例证画面","情境适配","声音节奏","体态目光"], weaknesses=["开口启动","思路形成","内容展开","卡壳恢复","脱稿程度"];
const weekNames=["快速启动与逻辑","故事、科普与内容展开","会议与礼仪","学术评议与高压问答","声音、节奏与体态","演讲结构与互动","五至八分钟脱稿","综合实战与终测"];
const weekColors=[["#dff7d6","#c1e4b2"],["#fff4ce","#eddc93"],["#dbf5ec","#b9e7d6"],["#e4f0ff","#c6dff6"],["#ffe8de","#f2cfc5"],["#ecf3ce","#d4e2a5"],["#eee5fb","#d9ccf1"],["#dcf4df","#bfe5c9"]];
const iconPaths={brand:"<path d='M12 20V10M12 13C6 13 3 9 3 4c5 0 9 3 9 8M12 11c0-6 4-9 9-9 0 6-3 10-9 10M6 21h12'/>",case:"<rect x='4' y='3' width='16' height='18' rx='2'/><path d='M8 8h8M8 12h8M8 16h5'/>",method:"<path d='M8 15a7 7 0 1 1 8 0v2H8zm1 5h6M12 8v5'/>",timer:"<circle cx='12' cy='13' r='8'/><path d='M12 8v5l3 2M9 2h6'/>",refs:"<path d='M3 5h6l3 2 3-2h6v14h-6l-3 2-3-2H3zM12 7v14'/>",transfer:"<path d='M3 8h17m-4-4 4 4-4 4M21 16H4m4-4-4 4 4 4'/>",notes:"<rect x='4' y='3' width='14' height='18' rx='2'/><path d='M8 7h6M8 11h6M8 15h3M15 17l6-6'/>",week:"<rect x='3' y='5' width='18' height='16' rx='3'/><path d='M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 18h2'/>",ai:"<path d='M12 2 14.5 9.5 22 12 14.5 14.5 12 22 9.5 14.5 2 12 9.5 9.5Z'/>"};
const icon=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[k]||iconPaths.case}</svg>`;
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch{storageOK=false;return false}}
function persist(){let a=write(KEY,old),b=write(GKEY,garden);storageOK=a&&b;try{window.dispatchEvent(new Event("speaking:progress-applied"))}catch{}return storageOK}
function status(message,id="page-status"){let node=$(id);if(node){node.textContent=message;node.className=storageOK?"status":"error"}}
function metaFor(n){return old.units[n]??(old.units[n]={})}
function markFor(n){return garden.marks[n]??(garden.marks[n]={})}
function current(){return data?.units[unit-1]}
const fold=(label,html,open=false)=>`<details ${open?"open":""}><summary>${E(label)}</summary><div class="detailbody">${html}</div></details>`;
const panel=(key,title,en,tone,html,ic=key)=>`<section id="g-${key}" class="panel ${tone}"><div class="phead"><span class="picon">${icon(ic)}</span><div><small>${E(en)}</small><h2>${E(title)}</h2></div></div><div class="pbody">${html}</div></section>`;
const btn=(txt,act,attr="",cl="")=>`<button type="button" class="${cl}" data-act="${act}" ${attr}>${E(txt)}</button>`;
function sourceText(s){return String(s??"").replace(/\r/g,"").replace(/([\u3400-\u9fff，。！？；：、])\n(?=[\u3400-\u9fff，。！？；：、])/g,"$1").replace(/ *\n *(?=[（(])/g,"").trim()}
const text=s=>`<div class="text">${E(sourceText(s))}</div>`;
function cleanNav(s){return String(s).split("\n").filter(x=>!/^返回(?:题卡|训练单元|课程目录|单元|完整)/.test(x.trim())&&!/^继续查看同题参考二/.test(x.trim())).join("\n")}
function sliceGuide(a,b){let g=data.guide,i=g.indexOf(a);if(i<0)return"";let j=b?g.indexOf(b,i+a.length):-1;return g.slice(i,j<0?undefined:j)}
function art(w,small=false){
 const id="g-art-"+(++uid),k=(w-1)%8;
 const palette=[["#82dcb6","#f4d768"],["#f6c974","#78ceb3"],["#79c7cd","#efb9a1"],["#85b8e6","#bce16f"],["#f0b0a0","#84dcb9"],["#b1d968","#87cbe0"],["#b9b0ed","#80d8b5"],["#70d3ab","#f7d980"]][k];
 const [c1,c2]=palette;
 const star=(x,y,r)=>`<path class="glint" d="M${x} ${y-r}Q${x+2} ${y-2} ${x+r} ${y}Q${x+2} ${y+2} ${x} ${y+r}Q${x-2} ${y+2} ${x-r} ${y}Q${x-2} ${y-2} ${x} ${y-r}" fill="#fffdea"/>`;
 const leaf=(x,y,a)=>`<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 26Q-24 2 0-23Q25 2 0 26Z" fill="url(#${id}leaf)" stroke="#faffd7" stroke-width="1"/><path d="M0 24V-18" stroke="#74ae53" stroke-width="1.2" opacity=".65"/></g>`;
 let obj;
 if([0,4,6].includes(k)){
 obj=`<g class="float" filter="url(#${id}s)"><circle cx="172" cy="113" r="66" fill="url(#${id}pearl)" stroke="#fff" stroke-width="2"/><circle cx="172" cy="113" r="54" fill="url(#${id}color)" opacity=".8"/><rect x="154" y="56" width="36" height="73" rx="18" fill="url(#${id}pearl)" stroke="#fff"/><path d="M163 69h18M163 80h18M163 91h18" stroke="#88ba8b" stroke-width="2" stroke-linecap="round"/><path d="M144 105v8a28 28 0 0 0 56 0v-8M172 141v25M152 166h40" fill="none" stroke="#4aa578" stroke-width="4" stroke-linecap="round"/></g>`;
 }else if([1,5].includes(k)){
 obj=`<g class="float" filter="url(#${id}s)"><path d="M69 82Q122 66 172 98Q222 66 275 82v88q-55-16-103 14-48-30-103-14Z" fill="url(#${id}pearl)" stroke="#fff" stroke-width="2"/><path d="M172 98v86M78 176q48-11 94 14 46-25 94-14" stroke="#80bd8b" fill="none" stroke-width="3"/><g stroke="#8eaa8a" stroke-width="2" opacity=".6">${Array.from({length:4},(_,j)=>`<path d="M87 ${100+j*14}Q124 ${94+j*14} 158 ${111+j*14}M186 ${111+j*14}Q220 ${94+j*14} 257 ${100+j*14}" fill="none"/>`).join("")}</g></g>`;
 }else if([2,3].includes(k)){
 obj=`<g class="float" filter="url(#${id}s)"><rect x="96" y="55" width="145" height="137" rx="16" fill="url(#${id}pearl)" transform="rotate(-7 96 55)" stroke="#fff"/><rect x="120" y="43" width="146" height="136" rx="15" fill="#fafff6" stroke="#fff"/><rect x="136" y="60" width="114" height="16" rx="5" fill="${c1}"/><path d="M139 91h90M139 104h70" stroke="#93bea1" stroke-width="3" stroke-linecap="round"/><circle cx="155" cy="140" r="13" fill="#83d4ac"/><path d="M149 140l4 4 8-10" fill="none" stroke="#fff" stroke-width="2"/><rect x="177" y="130" width="62" height="8" rx="3" fill="${c2}"/><rect x="177" y="145" width="48" height="8" rx="3" fill="${c1}"/></g>`;
 }else{
 obj=`<g class="float" filter="url(#${id}s)"><rect x="98" y="44" width="148" height="151" rx="18" fill="url(#${id}pearl)" stroke="#fff"/><g transform="translate(118 68)"><rect width="110" height="20" rx="6" fill="${c1}"/><rect y="34" width="28" height="61" rx="6" fill="#b6dc74"/><rect x="40" y="21" width="28" height="74" rx="6" fill="${c1}"/><rect x="80" y="6" width="28" height="89" rx="6" fill="${c2}"/><path d="M0 102h110" stroke="#89a88b" stroke-width="2"/></g></g>`;
 }
 return `<svg viewBox="0 0 340 235" aria-hidden="true"><defs><linearGradient id="${id}pearl" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset=".52" stop-color="#f2f9e2"/><stop offset="1" stop-color="#d4edd0"/></linearGradient><linearGradient id="${id}color" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff6b5"/><stop offset=".45" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><linearGradient id="${id}leaf" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dded9e"/><stop offset=".6" stop-color="#8bd27f"/><stop offset="1" stop-color="#4fb98c"/></linearGradient><filter id="${id}s"><feDropShadow dx="2" dy="7" stdDeviation="4" flood-color="#387b53" flood-opacity=".25"/></filter></defs><circle cx="172" cy="116" r="98" fill="#fff4" stroke="#fff8"/><circle cx="172" cy="116" r="85" fill="none" stroke="#fff8"/><ellipse cx="172" cy="116" rx="144" ry="67" transform="rotate(-23 172 116)" stroke="#ffffff9c" stroke-width="1.5" fill="none"/>${leaf(77,56,-36)}${leaf(278,167,48)}${leaf(72,185,-61)}${obj}<g class="float" filter="url(#${id}s)"><rect x="239" y="28" width="75" height="41" rx="12" fill="url(#${id}pearl)" stroke="#fff"/><path d="M251 68v12l18-12" fill="#e9f6dc"/><g fill="#6db889"><circle cx="257" cy="48" r="3.5"/><circle cx="277" cy="48" r="3.5"/><circle cx="296" cy="48" r="3.5"/></g></g>${star(46,86,9)}${star(307,105,10)}${star(125,211,7)}<circle cx="302" cy="195" r="6" fill="#ffe695" stroke="#fff"/></svg>`
}
const caseArt=()=>`<svg viewBox="0 0 140 136" aria-hidden="true"><rect x="22" y="13" width="96" height="109" rx="10" fill="#fffef4" stroke="#fff"/><rect x="31" y="26" width="78" height="13" rx="4" fill="#71cba2"/><path d="M34 51h59M34 61h44" stroke="#9fc4a7" stroke-width="3" stroke-linecap="round"/><circle cx="46" cy="87" r="14" fill="#84d7b2"/><path d="M39 87l5 5 9-11" stroke="#fff" stroke-width="2.5" fill="none"/><circle cx="94" cy="87" r="14" fill="#efcc72"/><path d="M94 80v10m0 4v1" stroke="#8d7134" stroke-width="2.5"/><path d="M34 110h70" stroke="#d6e9c7" stroke-width="3" stroke-linecap="round"/></svg>`;
function hero(title,sub,w,eyebrow,meta,actions=""){
 return `<header class="hero"><div class="hero-copy"><p class="eyebrow">${E(eyebrow)}</p><h1>${E(title)}</h1><p>${E(sub)}</p><div class="meta">${meta.map(x=>`<span class="pill">${E(x)}</span>`).join("")}</div>${actions?`<div class="hero-actions">${actions}</div>`:""}</div><div class="hero-art">${art(w)}</div></header>`
}
function countDone(){return data.units.filter(u=>old.units[u.id]?.complete===true).length}
function tile(u){const r=old.units[u.id]||{},m=garden.marks[u.id]||{},c=[r.complete?"done":r.mini?"mini":r.pm?"pm":"",r.real?"real":"",u.id===old.current?"current":""].filter(Boolean).join(" ");return `<a class="tile ${c}" href="#u${pad(u.id)}" title="${E(u.title)}" aria-label="第${u.id}单元 ${E(u.title)}">${pad(u.id)}</a>`}
function renderHome(){
 unit=0;selection=null;let n=countDone(),next=data.units.find(u=>old.units[u.id]?.complete!==true)||data.units[47],resume=data.units[(Number(old.current)||1)-1]||next;
 $("app").innerHTML=hero("让思路发光，让表达清晰","高校教师即兴发言与脱稿演讲 · 8周48单元个性化开放式研习",resume.week,"QINGNING GARDEN · 青柠花园",["手机自主录音录像","全程自由阅读","每题双示范"],`<a href="#u${pad(resume.id)}">继续第${pad(resume.id)}单元</a>${resume.id!==next.id?`<a href="#u${pad(next.id)}">下一未完成单元</a>`:""}`)
 +panel("weeks","八周课程地图","YOUR LEARNING PATH","lime",`<div class="home-info"><div><h3>${n} / 48 单元</h3><p class="small">仅依据本人确认的实际训练标记</p></div><span class="pill gold">${Math.round(n/48*100)}%</span></div><div class="progressline"><span style="width:${100*n/48}%"></span></div><div class="week-list" style="margin-top:12px">${weekNames.map((name,i)=>{let w=i+1,us=data.units.filter(u=>u.week===w),c=weekColors[i];return `<article class="week-card" style="--wbg:${c[0]};--wedge:${c[1]}"><div class="week-top"><div><p class="week-no">WEEK ${pad(w)}</p><h3>${E(name)}</h3></div><div class="week-art">${art(w,true)}</div></div><div class="tiles">${us.map(tile).join("")}</div>${fold("查看本周六个单元",us.map(u=>`<a class="lesson-link" href="#u${pad(u.id)}"><span>${pad(u.id)}</span><span>${E(u.title)}</span></a>`).join(""))}</article>`}).join("")}</div><div class="facts"><span>绿色：完整训练</span><span style="background:#dbeafd">蓝色：PM完成</span><span style="background:#ffe7a3">黄色：保底</span><span>右下绿点：真实应用</span></div><p class="small" style="margin-top:9px">每周第7天休整或补练；进度与9周、18周历史版本相互独立。</p>`,"week")
 +panel("tools","学习工具与历史版本","STUDY RESOURCES","blue",`<div class="actions" style="margin-top:0">${btn("56天开练指南","guide","",'primary')}${btn("成长与备份","assets")}${btn("个人训练导航","personal")}${btn("八大框架","framework")}</div><p class="small" style="margin-top:10px">首次基线请直接进入第01单元，先不阅读框架与答案。</p><hr><p><a href="../dual-track-2026/">9周63天126课旧版</a> · <a href="../legacy-18week.html">18周126课旧版</a> · <a href="../../study/#courses">研究学习中心</a></p>`,"refs");
 syncHeader();status(""); 
}
function refParts(key){
 const arr=data.refs[key];if(!arr?.length)return null;
 const marker=/\n(?:练后核对[^\n]*|练后自评依据[^\n]*)(?:\n|$)/;
 let models=[],checks=[];
 const splitOne=(body,title)=>{let raw=cleanNav(body),m=raw.match(marker),before=m?raw.slice(0,m.index):raw;if(m)checks.push(raw.slice(m.index+m[0].length).trim());let k=before.indexOf("关键词及作用");return {title,text:(k>=0?before.slice(0,k):before).trim(),keywords:k>=0?before.slice(k+"关键词及作用".length).trim():""}};
 if(arr.length===1){let b=arr[0].body,idx=b.indexOf("\n参考二\n");if(idx<0)return {raw:arr.map(x=>x.title+"\n"+x.body).join("\n\n")};models.push(splitOne(b.slice(0,idx).replace(/^参考一\s*/,""),"参考一"));models.push(splitOne(b.slice(idx+"\n参考二\n".length),"参考二"))}
 else{arr.forEach((x,i)=>models.push(splitOne(x.body,i===0?"参考一":"参考二")))}
 return {models,checks:checks.join("\n")};
}
function modelCards(models){return models.map((m,i)=>`<article class="answer ${i===1?"b":""}"><h3><span class="answer-tag">${i===0?"A":"B"}</span>${E(m.title||("参考"+(i===0?"一":"二")))}</h3><div class="spoken">${E(sourceText(m.text))}</div><div class="keywords"><b>对应关键词及作用</b>${E(sourceText(m.keywords))}</div></article>`).join("")}
function references(key,label="展开两份标准参考答案"){
 let r=refParts(key);if(!r)return "";
 if(r.raw)return fold(label,text(r.raw));
 return fold(label,modelCards(r.models)+(r.checks?`<div class="rubric"><b>练后自评依据</b>${E(sourceText(r.checks))}</div>`:""));
}
function transferRefs(t){return fold("展开本案例两份完整参考答案",modelCards(t.models)+`<div class="rubric"><b>练后自评依据</b>${E(t.checks.map((x,i)=>(i+1)+"．"+x).join("\n"))}</div>`)}
function times(prep,sec){return `<div class="time-tags"><span class="pill">${prep>0?"准备 "+prep+" 秒":"准备时间按原任务"}</span><span class="pill gold">发言 ${sec>=60&&sec%60===0?sec/60+" 分钟":sec+" 秒"}</span></div>`}
function timerButtons(task){return `<div class="timer-inline"><div><b>${task.prepare>0?task.prepare+"s ＋ ":""}${task.duration}s</b><p class="small">${E(task.label)} · 可选计时</p></div><div class="actions">${btn(task.prepare>0?"准备＋发言":"发言计时","timer",`data-key="${E(task.key)}" data-mode="both"`,"primary smallbtn")}${task.prepare>0?btn("只计发言","timer",`data-key="${E(task.key)}" data-mode="speech"`,"smallbtn"):""}</div></div>`}
function pmModule(u){
 const p=u.pm,idx=p.indexOf("反例"),j=p.indexOf("正例",idx+2);
 let html;
 if(!u.assessment&&idx>=0&&j>idx){let prefix=p.slice(0,idx).trim(),bad=p.slice(idx+2,j).replace(/^[:：]\s*/,""),pos=p.slice(j+2).replace(/^[:：]\s*/,"");html=`<p class="method-text">${E(prefix)}</p><div class="contrast"><div><b>反面表达</b>${E(bad)}</div><div><b>正面表达与静默预演</b>${E(pos)}</div></div>`}
 else html=text(p);
 const special=!u.assessment&&u.id===20?`<div class="method-grid"><div class="method-tile"><b>亮</b><small>材料中真实优点</small></div><div class="method-tile"><b>核</b><small>最重要问题</small></div><div class="method-tile"><b>建</b><small>具体改进建议</small></div></div>`:"";
 const extra=!u.assessment&&[2,4,7,9,13,14,19,22].includes(u.id)?fold("可选2分钟普通话辨音",`<p>慢读词组、短句，再自然改述；只选一组，不追求速度。</p><p class="small">完整练习见个人训练导航，正式测评不使用。</p>`+btn("个人训练工具","personal","","smallbtn")):"";
 return panel("pm","前晚 PM · 方法建模","10 MIN · EVENING","gold",fold(u.assessment?"展开设备准备（不含题目）":"展开本课思维方法与正反例",special+html+extra+`<div class="actions">${btn("记录 PM 已完成","mark-pm","","smallbtn")}${btn("可选4分钟静默预演","timer",'data-key="pm" data-mode="speech"',"smallbtn")}</div>`), "method")
}
function planCards(u){
 if(!u.cards.length)return [];
 if(selection?.unit===u.id)return selection.order;
 let order=[...u.cards];
 if([6,18,43].includes(u.id)){for(let i=order.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}}
 if(u.id===12)order=[order[Math.random()<.5?0:1]];
 selection={unit:u.id,order,index:-1};return order
}
function specialTask(u){
 let s="";
 if(u.id===31)s=`<div class="actions">${btn("15秒入口试说","timer",'data-key="entry" data-mode="speech"',"smallbtn")}${btn("45秒第一路线","timer",'data-key="main" data-mode="both"',"smallbtn")}${btn("45秒第二路线","timer",'data-key="main" data-mode="both"',"smallbtn")}</div>`;
 if(u.id===35)s=`<div class="actions">${btn("45秒首尾呼应","timer",'data-key="main" data-mode="both"',"smallbtn")}${btn("45秒行动号召","timer",'data-key="main" data-mode="both"',"smallbtn")}</div>`;
 if(u.id===38)s=`<div class="actions">${btn("专家版 20＋120秒","timer",'data-key="main" data-mode="both"',"smallbtn")}${btn("大众版 20＋120秒","timer",'data-key="main" data-mode="both"',"smallbtn")}</div>`;
 if(u.id===40)s=`<div class="actions">${btn("60秒准备＋4分钟中断演练","timer",'data-key="cut" data-mode="both"',"primary")}${btn("10秒准备＋2分钟压缩版","timer",'data-key="compressed" data-mode="both"',"smallbtn")}</div><p class="small">第2分钟响铃提示“只剩2分钟”；长稿见第37单元。</p>`;
 if(u.id===23)s=`<div class="actions">${btn("重录90秒（60秒提醒收束）","timer",'data-key="short23" data-mode="speech"',"smallbtn")}</div>`;
 return s
}
function primaryModule(u){
 let hasMain=!u.assessment||u.id===45;
 const main={key:"main",prepare:u.prepare,duration:u.duration,label:"正式题"};
 let contents=hasMain?`<div class="case-layout"><div class="case-art">${caseArt()}</div><div class="case-text"><p class="eyebrow">正式题 · 原教材</p>${text(u.task)}</div></div>${times(u.prepare,u.duration)}${u.id===40?"":timerButtons(main)}${specialTask(u)}`: `<p class="warning">按原测评规则先独立开口，再看示范。题卡逐张主动揭开，首录与复测的固定条件不变。</p>${text(u.task)}`;
 if(u.id===45)contents+="<p class='small'>主演讲完成后再看以下追问题卡。</p>";
 if(u.cards.length)contents+=`<div style="margin-top:12px" id="card-tray">${cardTray(u)}</div>`;
 return panel("case","次晨 AM · 正式案例","SPEAKING PRACTICE","",contents,"case")
}
function cardTray(u){
 let order=planCards(u),idx=selection.index;
 let txt=idx<0?`<div class="task-card"><div class="cardhead"><h3>独立题卡</h3><span class="pill gold">${order.length} 题</span></div><p class="muted" style="margin-top:8px">${u.id===12?"已随机抽取本次一题。":([1,24,45,46,47].includes(u.id)?"按原题固定顺序逐张展示。":"编号顺序已随机排列。")}点击揭题，尚不显示题目或答案。</p><div class="actions">${btn("揭开第一张题卡","card","data-index=\"0\"","primary")}${u.id===12?btn("重新抽取（未揭题时）","reshuffle","","smallbtn"):""}</div></div>`:(()=>{let k=order[idx],c=data.cards[k];return `<div class="task-card"><div class="cardhead"><h3>题卡 ${E(k)} · ${idx+1} / ${order.length}</h3><span class="pill">${c.prepare}秒 / ${c.duration}秒</span></div><div class="task">${E(c.task)}</div>${timerButtons({key:k,label:"题卡 "+k,prepare:c.prepare,duration:c.duration})}<div class="actions">${idx>0?btn("上一张","card",`data-index="${idx-1}"`,"smallbtn"):""}${idx+1<order.length?btn("下一张题卡","card",`data-index="${idx+1}"`,"primary smallbtn"):""}${btn("收起题卡","card",'data-index="-1"',"smallbtn")}${btn("本题 AI 诊断","ai",`data-key="${E(k)}"`,"smallbtn")}</div>${references(k,"本题双示范与自评依据")}</div>`})();
 return txt
}
function warmModule(u){if(u.week!==5)return"";let w=sliceGuide("第 5 周固定熟段","第 29 单元｜上台前 60 秒");let pre= u.id===29?fold("上台前60秒与五级真实场景阶梯",text(sliceGuide("第 29 单元｜上台前 60 秒","三项可观察目标"))+btn("60秒舒适准备","timer",'data-key="breath" data-mode="speech"',"smallbtn")):"";
 return panel("warm","声音与体态专项 · 先熟段","WEEK 05 · WARM-UP","coral",text(w)+`<div class="actions">${btn("2分钟舒适热身","timer",'data-key="warm2" data-mode="speech"',"smallbtn")}${btn("6分钟单一动作","timer",'data-key="warm6" data-mode="speech"',"smallbtn")}${btn("30秒熟段","timer",'data-key="warm30" data-mode="speech"',"primary smallbtn")}</div>`+pre,"timer")}
function referenceModule(u){
 let k=pad(u.id),main=data.refs[k]?references(k):"";
 let title=u.assessment?"测评题双示范":"同题双示范";
 let extra=data.extensions[k]?fold("8分钟扩展（W7D7 / W8D7 自选）",data.extensions[k].map(v=>`<h3>${E(v.title)}</h3>${text(v.body)}`).join("")+`<div class="actions">${btn("8分钟独立演讲计时","timer",'data-key="extension" data-mode="speech"',"smallbtn")}</div>`):"";
 let cards=u.cards.length?fold("按题卡编号查看练后参考（建议首录后）",u.cards.map(id=>references(id,"题卡 "+id+" · 两份参考")).join("")):"";
 let fallback=u.id===40?`<p><a href="#u37">打开第37单元五分钟原稿与双示范</a></p>`:"";
 return panel("refs",title,"TWO MODEL ANSWERS","blue",`<div class="refbanner"><div><b>同题，两条优秀表达路线</b><small>完整口语参考 · 对应关键词 · 练后核对</small></div><div class="reficon"><span>A</span><span>B</span></div></div><p class="small">建议独立发言后再看；参考答案为训练示范，不是唯一正确表达。${u.id===42?"本课仅提供两套真实经历口述支架。":""}</p>${main}${cards}${fallback}${extra}`,"refs")
}
function transferModule(u){let arr=transfers.cases[u.id]||[];return panel("transfer","陌生情境迁移与真实应用","TRANSFER PRACTICE","lime",`<div class="stack">${arr.map(t=>`<article class="task-card"><div class="cardhead"><h3>${E(t.label)}</h3><span class="pill gold">${t.duration} 秒</span></div><div class="task">${E(t.task)}</div>${t.conditionNote?`<p class="small" style="margin-top:7px">${E(t.conditionNote)}</p>`:""}${timerButtons(t)}<div class="actions">${btn("本题免费AI诊断","ai",`data-key="${E(t.key)}"`,"smallbtn")}</div>${transferRefs(t)}</article>`).join("")}</div>`,"transfer")}
function reviewModule(u){
 let n=garden.notes[u.id]||{},m=markFor(u.id),r=metaFor(u.id);
 return panel("review","单点复盘 · 自主记录","REFLECTION & PROGRESS","coral",`<div class="task"><p class="eyebrow">本课只修一处</p>${text(u.fix)}</div>${fold("20 / 25分钟建议安排（可自由调整）",`<div class="schedule">${u.schedule.map(s=>{let a=s.match(/^(\d\d:\d\d—\d\d:\d\d)\s*(.*)$/s);return `<div class="schedule-row"><b>${E(a?a[1]:"步骤")}</b><span>${E(a?a[2]:s)}</span></div>`}).join("")}</div><div class="rubric"><b>完成记录</b>${E(u.record)}</div>`)}<label class="field">一条真实观察（可选）<textarea id="lesson-note" placeholder="例如：首句重复了两次；下次直接回应问题。">${E(n.note||"")}</textarea></label><div class="actions">${btn("保存复盘","save-note","","smallbtn")}${btn("免费AI评审","ai",`data-key="${u.assessment?"": "main"}"`,"primary smallbtn")}${btn("可选六维独立自评","assessment","","smallbtn")}</div><hr><div class="splitline"><b>学习状态</b><span class="small">只记录实际完成情况，不自动判定</span></div><label class="check"><input type="checkbox" data-mark="pm" ${r.pm?"checked":""}> 已完成前晚PM</label><label class="check"><input type="checkbox" data-mark="read" ${m.read?"checked":""}> 已阅读本课材料</label><label class="check"><input type="checkbox" data-mark="mini" ${r.mini?"checked":""}> 5分钟保底（不替代正式测评）</label><label class="check"><input type="checkbox" data-mark="complete" ${r.complete?"checked":""}> 我已按本课要求实际发言、保留手机首录、独立复盘并完成必要重说或迁移（完整AM）</label><label class="check"><input type="checkbox" data-mark="real" ${r.real?"checked":""}> 本次确有真实场合发言（非模拟）</label><label class="field">听众真实反馈（没有留空）<textarea id="real-feedback" placeholder="听众复述的主旨或一条具体建议">${E(n.feedback||"")}</textarea></label><div class="actions">${btn("保存反馈","save-note","","smallbtn")}${btn("成长与备份","assets","","smallbtn")}</div><p class="small" id="page-status">记录只保存在本浏览器。未取得录音或有效证据时不要标完整测评。</p>`,"notes")
}
function syncHeader(){let a=!!current()?.assessment;$("nav-frames").hidden=a;$("nav-personal").hidden=a;try{let off=localStorage.getItem(MKEY)==="off";document.body.classList.toggle("no-motion",off);$("motion-toggle").textContent=off?"动效关":"动效开";$("motion-toggle").setAttribute("aria-pressed",String(!off))}catch{}}
function renderUnit(n){
 unit=Math.max(1,Math.min(48,n));const u=current();old.current=unit;persist();if(selection?.unit!==unit)selection=null;if(u.cards.length)planCards(u);
 const meta=[`W${pad(u.week)} · D${u.day}`,`PM 10分钟 · AM ${u.minutes}分钟`,"自主手机录音","双示范"];
 $("app").innerHTML=hero(u.title,"第"+u.week+"周 · "+weekNames[u.week-1]+"；按自己的节奏阅读与训练。",u.week,"UNIT "+pad(unit)+" / 48",meta,`<a href="#courses">课程目录</a>${u.assessment?'<a href="#g-case" data-jump="case">打开独立题卡</a>':btn("可选独立计时","timer",'data-key="main" data-mode="both"',"primary")}`)
 +`<nav class="unit-nav" aria-label="本课导航">${[["pm","前晚方法"],...(u.week===5?[["warm","熟段热身"]]:[]),["case","正式题"],["refs","双示范"],["transfer","迁移题"],["review","复盘"]].map(([k,v])=>`<a href="#g-${k}" data-jump="${k}">${v}</a>`).join("")}</nav>`
 +pmModule(u)+warmModule(u)+primaryModule(u)+referenceModule(u)+transferModule(u)+reviewModule(u)
 +`<div class="lesson-bottom">${unit>1?`<a href="#u${pad(unit-1)}">← 上一单元</a>`:'<a href="#courses">返回课程目录</a>'}${unit<48?`<a href="#u${pad(unit+1)}">下一单元 →</a>`:'<a href="#courses">返回课程目录</a>'}</div>`;
 syncHeader()
}
function route(){
 const hash=location.hash, m=hash.match(/^#u(\d{1,2})$/);if(m&&+m[1]>=1&&+m[1]<=48){renderUnit(+m[1]);window.scrollTo(0,0)}else if(!hash||hash==="#courses"||!hash.startsWith("#g-")){renderHome();window.scrollTo(0,0)}
}
function taskByKey(key){
 if(!current())return null;const u=current();
 let t=transfers.cases[u.id]?.find(x=>x.key===key);if(t)return t;
 if(data.cards[key]&&u.cards.includes(key))return {...data.cards[key],key,label:"题卡 "+key};
 const fixed={pm:[0,240,"静默预演"],warm2:[0,120,"舒适热身"],warm6:[0,360,"熟段孤立动作"],warm30:[0,30,"固定熟段"],breath:[0,60,"上台前舒适准备"],entry:[0,15,"开场入口"],cut:[60,240,"中途压缩演练"],compressed:[10,120,"完整压缩版"],short23:[0,90,"90秒收束重说"],extension:[0,480,"8分钟扩展"],revision:[0,60,"单点重说"]};
 if(fixed[key]){let [prepare,duration,label]=fixed[key];return {key,prepare,duration,label,task:u.task}}
 if(u.assessment){let k=selection?.order[selection.index];return k?taskByKey(k):null}
 return {key:"main",prepare:u.prepare,duration:u.duration,label:"U"+pad(unit)+" 正式题",task:u.task}
}
let timer=null,interval=null,sound=null;
const clock=s=>pad(Math.floor(Math.max(0,s)/60))+":"+pad(Math.max(0,s)%60);
function beep(){try{if(!sound)return;let o=sound.createOscillator(),g=sound.createGain();o.frequency.value=660;g.gain.setValueAtTime(.06,sound.currentTime);g.gain.exponentialRampToValueAtTime(.0001,sound.currentTime+.18);o.connect(g).connect(sound.destination);o.start();o.stop(sound.currentTime+.2)}catch{}}
function paint(){
 if(!timer)return;const t=timer,remaining=Math.max(0,t.remaining);$("dock").hidden=false;$("dock-clock").textContent=clock(remaining);$("dock-title").textContent="U"+pad(t.unit)+" · "+t.label;$("dock-phase").textContent=t.phase==="done"?"计时结束":(t.phase==="prep"?"准备": "发言")+(t.running?" · 计时中":" · 已暂停");$("dock-ring").setAttribute("stroke-dashoffset",175.9*(1-remaining/Math.max(1,t.total)));$("dock-pause").textContent=t.running?"暂停":"继续";$("dock-pause").disabled=t.phase==="done";$("dock-cue").textContent=t.cue||"";
}
function beginPhase(phase,seconds){if(interval)clearInterval(interval);timer.phase=phase;timer.total=timer.remaining=seconds;timer.deadline=Date.now()+seconds*1000;timer.running=true;timer.cue="";timer.cued=false;interval=setInterval(tick,160);paint()}
function startTimer(key,mode){
 let t=taskByKey(key);if(!t){status("请先揭开一张题卡，再启动计时。");let el=$("g-case");el?.scrollIntoView({behavior:"smooth"});return}
 try{sound??=new (window.AudioContext||window.webkitAudioContext)();sound.resume().catch(()=>{})}catch{}
 timer={...t,unit,initialMode:mode,phase:"",remaining:0,total:0,running:false,cue:""};beginPhase(mode==="both"&&t.prepare>0?"prep":"speech",mode==="both"&&t.prepare>0?t.prepare:t.duration)
}
function tick(){if(!timer?.running)return;let t=timer;t.remaining=Math.max(0,Math.ceil((t.deadline-Date.now())/1000));let elapsed=t.total-t.remaining;if(t.phase==="speech"&&!t.cued){if(t.unit===5&&t.key==="main"&&elapsed>=35){t.cue="主动停顿2秒，再接续";t.cued=true;beep()}if(t.key==="short23"&&elapsed>=60){t.cue="剩余30秒，收束";t.cued=true;beep()}if(t.key==="cut"&&elapsed>=120){t.cue="模拟投影中断：只剩2分钟";t.cued=true;beep()}}
 if(!t.remaining){clearInterval(interval);beep();if(t.phase==="prep"){beginPhase("speech",t.duration);return}t.running=false;t.phase="done"}paint()
}
function pauseTimer(){if(!timer||timer.phase==="done")return;if(timer.running){timer.remaining=Math.max(0,Math.ceil((timer.deadline-Date.now())/1000));timer.running=false;clearInterval(interval)}else{timer.running=true;timer.deadline=Date.now()+timer.remaining*1000;interval=setInterval(tick,160)}paint()}
function resetTimer(){if(!timer)return;clearInterval(interval);let p=timer.initialMode==="both"&&timer.prepare>0?"prep":"speech";timer.phase=p;timer.total=timer.remaining=p==="prep"?timer.prepare:timer.duration;timer.running=false;timer.cue="";timer.cued=false;paint()}
function closeTimer(){clearInterval(interval);timer=null;$("dock").hidden=true}
function openDialog(title,html){$("dialog-title").textContent=title;$("dialog-body").innerHTML=html;$("dialog").showModal()}
function closeDialog(){if($("dialog").open)$("dialog").close()}
function guideDialog(which){
 if(which==="guide")openDialog("56天开练与使用说明",text(data.guide.slice(0,data.guide.indexOf("思维框架库")))+`<p class="small">网页版采用自由阅读和手机独立录制。Word中的跳转说明以网页操作为准。</p>`);
 else if(which==="personal")openDialog("个人训练导航",text(data.personal));
 else if(which==="framework")openDialog("八大高频思维框架",text(sliceGuide("八大高频框架：1—4","6 维 12 分：统一操作量表")));
 else openDialog("课程工具 · 复盘与反馈",text(data.tools)+fold("六维量表与反馈方法",text(sliceGuide("6 维 12 分：统一操作量表","二轮精修工具：独立题卡")))+fold("四套AI陪练脚本",text(sliceGuide("脚本 1｜盲抽考官","第 5 周固定熟段"))))
}
function saveNote(){if(!unit)return;garden.notes[unit]={note:$("lesson-note")?.value||"",feedback:$("real-feedback")?.value||"",updated:new Date().toISOString()};persist();status(storageOK?"已保存到本浏览器。":"存储不可用，请复制记录或导出备份。")}
function scoringTotal(scores){return scores.length===6&&scores.every(v=>[0,1,2].includes(v))?scores.reduce((a,b)=>a+b,0):null}
function scoreDialog(){
 const u=current();if(!u)return;
 const ids=u.cards.length?u.cards:[pad(unit)];const opts=ids.map(x=>`<option value="${E(x)}">${E(x)}</option>`).join("");
 openDialog("可选六维独立自评",`<p class="muted">请在手机回看原始首录后填写。每次保存均新增独立记录，不覆盖以前的首录。</p><label class="field">记录题号<select id="score-key">${!u.assessment&&u.cards.length?`<option value="${pad(unit)}">主演讲</option>`:""}${opts}${(transfers.cases[u.id]||[]).map(t=>`<option value="${E(t.key)}">${E(t.label)} ${E(t.key)}</option>`).join("")}</select></label><label class="field">录制方式<select id="score-media"><option value="video">手机视频</option><option value="audio">手机音频</option><option value="none">无录音，仅回忆</option></select></label><div class="score-grid" style="margin-top:12px">${labels.map((v,i)=>`<label class="field">${E(v)}<select id="score-${i}"><option value="">未测</option><option value="0">0 · 未做到</option><option value="1">1 · 部分做到</option><option value="2">2 · 清楚做到</option></select></label>`).join("")}</div><p class="status" id="score-total">独立总分：未测 / 12</p>${u.week>=5?'<label class="field">口语活度（独立，不并入总分）<select id="score-oral"><option value="">未测</option><option>0</option><option>1</option><option>2</option></select></label>':""}<label class="field">最弱表现<select id="score-weak"><option value="">未选择</option>${weaknesses.map(x=>`<option>${E(x)}</option>`).join("")}</select></label><label class="field">首句实质回应耗时（秒，可空）<input type="number" min="0" step=".1" id="score-opening"></label><label class="field">实际发言时长（秒，可空）<input type="number" min="1" id="score-seconds"></label><label class="field">全段填充词次数（可空）<input type="number" min="0" id="score-filler"></label><label class="field">全段转写净字数（可空）<input type="number" min="0" id="score-chars"></label><label class="check"><input type="checkbox" id="score-familiar"> 以前接触过这道题</label><label class="field">轮次<select id="score-round"><option>首录</option><option>重录</option><option>迁移</option></select></label><label class="field">实际时间戳 / 原句 / 单点修订<textarea id="score-note"></textarea></label>${btn("保存本次独立记录","save-score","","primary")}${fold("展开原六维12分评分标准",text(sliceGuide("6 维 12 分：统一操作量表","评估与反馈")))}<p id="score-msg" class="small"></p>`)
}
function scoreValues(){let mode=$("score-media")?.value||"none";const a=labels.map((_,i)=>{let v=$("score-"+i)?.value;return v===""||v===undefined?null:+v});if(mode!=="video")a[5]=null;if(mode==="none")a[4]=null;return a}
function updateScore(){let mode=$("score-media")?.value;if(!mode)return;if(mode!=="video")$("score-5").value="";$("score-5").disabled=mode!=="video";if(mode==="none")$("score-4").value="";$("score-4").disabled=mode==="none";$("score-total").textContent="独立总分："+(scoringTotal(scoreValues())??"未测")+" / 12"}
function saveScore(){
 let v=scoreValues(),media=$("score-media").value,round=$("score-round").value,key=$("score-key").value;
 const num=id=>{let v=$(id)?.value;return v!==undefined&&v!==""&&Number.isFinite(+v)&&+v>=0?+v:null};
 let s=num("score-seconds"),o=num("score-opening"),f=num("score-filler"),c=num("score-chars");if(s===0)s=null;if(s!==null&&o!==null&&o>s){$("score-msg").textContent="启动时间不能超过实际时长。";return}
 if(media==="none"){o=f=c=null}
 let entry={id:Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7),unit,key,round,media,score:v,total:scoringTotal(v),oral:current().week>=5&&$("score-oral")?.value!==""?+($("score-oral")?.value??0):null,weak:$("score-weak").value,opening:o,seconds:s,fillerPerMin:s&&f!==null?Math.round(600*f/s)/10:null,speed:s&&c!==null?Math.round(60*c/s):null,familiar:!!$("score-familiar").checked,note:$("score-note").value,date:new Date().toISOString()};
 garden.assessments.push(entry);persist();closeDialog();status(storageOK?"独立记录已新增，原有评分未覆盖。":"未能保存，请导出备份。")
}
const providers={qwen:["千问","https://www.qianwen.com/"],deepseek:["DeepSeek","https://chat.deepseek.com/"],ima:["ima","https://ima.tencent.com/"]};
function aiDialog(key){
 if(!unit)return;let t=taskByKey(key);if(!t&&current().assessment){openDialog("免费AI评审",`<p>请先揭开需要评审的题卡，或从对应迁移题打开诊断工具。独立发言后再使用AI。</p>`);return}
 if(!t)return;
 openDialog("免费AI评审 · 自愿使用",`<p class="muted">无需API Key，不调用网页录音设备，不向任何服务自动发送内容。使用自己的已有账号，按实际支持的功能上传录音或粘贴本人核对的转写。先独立复盘，再看AI建议。</p><div class="actions">${Object.values(providers).map(([name,url])=>`<a class="link-button" href="${url}" target="_blank" rel="noopener noreferrer">${E(name)}</a>`).join("")}</div><label class="field">实际发言秒数（不确定可留空）<input type="number" min="1" id="ai-seconds"></label><label class="field">原始转写（可选；去除身份和敏感信息）<textarea id="ai-transcript" rows="5" placeholder="已有转写就粘贴，没有则在支持录音的AI里自行附上原件。"></textarea></label><label class="check"><input type="checkbox" id="ai-audio"> 我将另行提供AI确实能读取的原始声音；否则按纯文本评价。</label>${btn("生成并复制本题评审提示词","ai-copy",`data-key="${E(t.key)}"`,"primary")}<label class="field">可复制提示词<textarea readonly id="ai-prompt" rows="7"></textarea></label><p class="small" id="ai-status">禁止虚构时间戳、语速或体态。不要发送未公开研究资料、学生身份或他人录像。</p>`)
}
async function copyText(s,where){try{await navigator.clipboard.writeText(s);$(where).textContent="已复制。"}catch{if($("ai-prompt")){$("ai-prompt").focus();$("ai-prompt").select()}$(where).textContent="请手动复制。"}}
async function aiCopy(key){let t=taskByKey(key);if(!t)return;let u=current(),tr=$("ai-transcript").value.trim(),audio=$("ai-audio").checked,secs=$("ai-seconds").value;let prompt=`你是高校教师即兴发言训练教练。单元：${u.title}。\n实际题干：${t.task}\n实际发言时长：${secs?secs+"秒":"未提供"}。请只依据我提供的原始发言材料，不编造原句、数据或个人经历。${audio?"我会另附录音；只有能真正读取原声音时，才分析声音、节奏及填充词。":"只依据文字评价主旨、内容展开、逻辑、例证与情境。不能据此推断实际声音、停顿位置、破题秒数或体态。"}\n先给一个可核查的亮点，再指出唯一最影响听众理解的问题，引用实际原句并提供一句自然口语改写。按0/1/2分给六维建议（破题、结构、例证、情境、声音、体态），未测项留空；无连续视频不能评体态。没有真实材料先请我补充，不评分。不要把相关说成因果。${u.week>=5?"独立评价口语活度0—2分，不计入六维总分。":""}\n${tr?"原始转写：\n"+tr:"原始材料将由我另行提供。"}\n最后给一项可执行的重录动作。`;
 $("ai-prompt").value=prompt;await copyText(prompt,"ai-status")
}
function assetsDialog(){
 const records=garden.assessments.slice(-25).reverse(),oldCount=Array.isArray(old.records)?old.records.length:0;
 const rows=records.map(r=>`<tr><td>U${pad(r.unit)} ${E(r.key)}</td><td>${E(r.round)}</td><td>${E(r.media==="video"?"视频":r.media==="audio"?"音频":"无录音")}</td><td>${E(r.total??"未测")}</td><td>${E(r.opening??"—")}</td><td>${E(r.fillerPerMin??"—")}</td></tr>`).join("");
 const baseline=["B1","B2"].map(k=>{const v=n=>[...garden.assessments].reverse().find(r=>r.unit===n&&r.key===k&&r.round==="首录"&&r.media!=="none");let a=v(1),b=v(46);return `<p>${k}：01 ${E(a?.total??"未测")} / 12；46 ${E(b?.total??"未测")} / 12</p>`}).join("");
 openDialog("成长记录与备份",`<p class="muted">旧版互动训练的本地记录仍保留（${oldCount} 条）；本版新增独立记录 ${garden.assessments.length} 条。新旧记录不覆盖、不自动判定进步。</p><div class="table-wrap"><table><thead><tr><th>题目</th><th>轮次</th><th>媒介</th><th>总分/12</th><th>启动秒</th><th>口癖/分</th></tr></thead><tbody>${rows||'<tr><td colspan="6">暂无本版自评</td></tr>'}</tbody></table></div>${fold("01 / 46 基线同题记录",baseline+"<p class='small'>只有条件相近的有效录像才适合描述性比较；同题熟练、评分者和设备变化需另记。</p>")}${fold("个人案例库",`<p class="small">只保存去标识、本人核实的经历。</p>${garden.cases.map((c,i)=>fold("案例 "+(i+1)+" · "+(c.title||"待填写"),`<label class="field">标题<input data-case="${i}" data-field="title" value="${E(c.title)}"></label><label class="field">事实、卡点、动作、结果、启发<textarea data-case="${i}" data-field="text">${E(c.text)}</textarea></label>${btn("删除","case-delete",`data-i="${i}"`,"smallbtn")}`)).join("")}${btn("新增案例卡","case-add","","smallbtn")}`)}${fold("90天维持计划",`<p>每周一次真实应用，每月一次录像检查。没有真实场合时留待补。</p><label class="field">日期<input id="maint-date" type="date" value="${new Date().toISOString().slice(0,10)}"></label><label class="field">真实场合 / 下一次行动<textarea id="maint-text"></textarea></label>${btn("新增维护记录","maint-add","","smallbtn")}${garden.maintenance.map(x=>`<p class="small">${E(x.date)} · ${E(x.text)}</p>`).join("")}`)}<div class="actions">${btn("导出本机JSON备份","export","","primary")}${btn("导入恢复","import","","smallbtn")}${btn("完整复盘工具","tools","","smallbtn")}</div><input id="backup-file" type="file" accept=".json,application/json" hidden><p id="asset-msg" class="small">备份可能包含个人记录，仅本人保管。不含录音录像和API凭证。</p>`)
}
function exportBackup(){let file=new Blob([JSON.stringify({schema:"speaking-garden-v1",exported:new Date().toISOString(),legacy:old,garden},null,2)],{type:"application/json"}),url=URL.createObjectURL(file),a=document.createElement("a");a.href=url;a.download="speaking-garden-"+new Date().toISOString().slice(0,10)+".json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function importBackup(file){try{if(file.size>20*1024*1024)throw Error("备份文件过大");let p=JSON.parse(await file.text());if(p.schema!=="speaking-garden-v1"||!p.legacy?.units||!Array.isArray(p.legacy.records)||!p.garden?.notes||!p.garden?.marks||!Array.isArray(p.garden.assessments)||!Array.isArray(p.garden.cases)||!Array.isArray(p.garden.maintenance))throw Error("不是青柠花园备份");if(Object.keys(p.legacy.units).some(k=>!/^\d+$/.test(k)||+k<1||+k>48)||p.garden.assessments.some(x=>!x||!Number.isInteger(x.unit)||x.unit<1||x.unit>48||!Array.isArray(x.score)||x.score.length!==6||x.score.some(v=>v!==null&&![0,1,2].includes(v)))||p.garden.cases.some(x=>!x||typeof x.title!=="string"||typeof x.text!=="string")||p.garden.maintenance.some(x=>!x||typeof x.date!=="string"||typeof x.text!=="string"))throw Error("备份记录结构不正确");if(!confirm("恢复会替换此浏览器的新版记录。建议先备份当前记录，确定继续？"))return;old=p.legacy;garden=p.garden;persist();closeDialog();route()}catch(e){$("asset-msg").textContent="导入失败："+e.message}}
document.addEventListener("click",async e=>{
 const jump=e.target.closest("[data-jump]");if(jump){e.preventDefault();$("g-"+jump.dataset.jump)?.scrollIntoView({behavior:document.body.classList.contains("no-motion")?"auto":"smooth",block:"start"});return}
 const b=e.target.closest("[data-act]");if(!b||b.disabled)return;
 const act=b.dataset.act;
 if(act==="card"&&selection){selection.index=+b.dataset.index;$("card-tray").innerHTML=cardTray(current());return}
 if(act==="reshuffle"&&current()?.id===12&&selection?.index===-1){selection=null;planCards(current());$("card-tray").innerHTML=cardTray(current());return}
 switch(act){
 case "timer":startTimer(b.dataset.key,b.dataset.mode);break;
 case "pause":pauseTimer();break;case "reset":resetTimer();break;case "close-timer":closeTimer();break;
 case "mark-pm":metaFor(unit).pm=true;persist();b.textContent="PM 已记录";if(document.querySelector('[data-mark="pm"]'))document.querySelector('[data-mark="pm"]').checked=true;break;
 case "save-note":saveNote();break;case "guide":case "personal":case "framework":case "tools":guideDialog(act);break;
 case "assessment":scoreDialog();break;case "save-score":saveScore();break;case "ai":aiDialog(b.dataset.key||"main");break;case "ai-copy":await aiCopy(b.dataset.key);break;
 case "assets":assetsDialog();break;case "close-dialog":closeDialog();break;
 case "case-add":garden.cases.push({title:"",text:""});persist();closeDialog();assetsDialog();break;
 case "case-delete":if(confirm("删除这张本机案例卡？")){garden.cases.splice(+b.dataset.i,1);persist();closeDialog();assetsDialog()}break;
 case "maint-add":{let d=$("maint-date").value,t=$("maint-text").value.trim();if(d&&t){garden.maintenance.push({date:d,text:t});persist();closeDialog();assetsDialog()}}break;
 case "export":exportBackup();break;case "import":$("backup-file")?.click();break;
 case "motion":{let off=document.body.classList.toggle("no-motion");b.textContent=off?"动效关":"动效开";b.setAttribute("aria-pressed",String(!off));try{localStorage.setItem(MKEY,off?"off":"on")}catch{}}break;
 }
});
document.addEventListener("change",async e=>{
 let el=e.target;if(el.id?.startsWith("score-"))updateScore();
 if(el.dataset.mark&&unit){let field=el.dataset.mark,checked=el.checked;if(field==="complete"&&checked&&!confirm("请确认已按原题要求实际完成必要手机录音/录像及复盘。只阅读、仅计时或缺少测评录像不算完整。确认标记？")){el.checked=false;return}if(field==="real"&&checked&&!confirm("请确认确有真实场合或听众，不是模拟。")){el.checked=false;return}if(field==="read")markFor(unit).read=checked;else metaFor(unit)[field]=checked;persist();status(storageOK?"学习状态已保存。":"本机存储不可用。")}
 if(el.dataset.case!==undefined&&garden.cases[+el.dataset.case]&&["title","text"].includes(el.dataset.field)){garden.cases[+el.dataset.case][el.dataset.field]=el.value;persist()}
 if(el.id==="backup-file"&&el.files?.[0])await importBackup(el.files[0])
});
window.addEventListener("hashchange",route);
Promise.all([fetch("data/curriculum.json",{cache:"no-cache"}),fetch("data/transfer-references.json",{cache:"no-cache"})]).then(async res=>{if(res.some(x=>!x.ok))throw Error("课程数据加载失败");return Promise.all(res.map(x=>x.json()))}).then(([d,t])=>{if(d.units.length!==48||Object.keys(d.cards).length!==22||Object.keys(d.refs).length!==62||Object.keys(t.cases).length!==48||Object.values(t.cases).flat().length!==54)throw Error("课程数据不完整");data=d;transfers=t;route()}).catch(e=>{$("app").innerHTML=`<section class="panel"><div class="pbody"><h2>课程暂未载入</h2><p>${E(e.message)}</p><p>请刷新页面，或打开 <a href="../dual-track-2026/">历史课程</a>。</p></div></section>`});
})();
