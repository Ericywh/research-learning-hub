function pmRedesign(html,n,nextTitle){
 const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 const txt=s=>String(s||"").replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim();
 const art=html.match(/<article class="lesson pm-masterclass"[\s\S]*?<\/article>/)?.[0];if(!art)throw Error("No PM version on day "+n);
 const g=(re)=>txt(art.match(re)?.[1]||"");
 const title=txt(html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]||"");
 const scene=g(/data-case-scene="([^"]*)"/), question=g(/data-case-question="([^"]*)"/);
 const aim=g(/<p class="pm-lesson-aim">[\s\S]*?<strong>今天只学一件事：[^\n]*?<\/strong>([\s\S]*?)<\/p>/);
 const action=g(/<strong>可以立即执行的动作[：:]<\/strong>([\s\S]*?)<\/p>/)||aim;
 const why=g(/<strong>起作用的原因[：:]<\/strong>([\s\S]*?)<\/p>/);
 const bad=g(/<strong>需要纠正的原课错误[：:]<\/strong>([\s\S]*?)<\/p>/);
 const badwhy=g(/<strong>为什么有问题[：:]<\/strong>([\s\S]*?)<\/p>/);
 const good=g(/<section class="depth-analysis pm-revised-example">[\s\S]*?<h4>[^<]*<\/h4>\s*<p>([\s\S]*?)<\/p>/);
 const original=g(/本课原创模拟表达[：:]([^。]*[。][^<]*?)这[是为]/);
 const goodcase=/上方原创微案例已经给出/.test(good)?original:good;
 const originalCaseParagraph=g(/<p><strong>真实资料（分析性转述，不是演讲原话）[：:]<\/strong>([\s\S]*?)<\/p>/);
 const oldHref=art.match(/<p class="pm-source-reference">[\s\S]*?<a href="([^"]+)"/)?.[1]||"";
 const oldSourceName=g(/<p class="pm-source-reference">[\s\S]*?<a[^>]+>([\s\S]*?)<\/a>/);
 const transfer=g(/<strong>换题（2分钟）[：:]<\/strong>([\s\S]*?)先不看示范/).trim() || g(/<strong>换题（2分钟）[：:]<\/strong>([\s\S]*?)<\/p>/);
 const answer=art.match(/<details>[\s\S]*?<\/details>/)?.[0]||"";
 const getAnswer=label=>g(new RegExp("<strong>"+label+"[：:]<\\/strong>\\s*([^\\n<]+)"));
 const r1=getAnswer("参考一"),r2=getAnswer("参考二"),k1=getAnswer("关键词一").split("。")[0],k2=getAnswer("关键词二").split("。")[0];
 const target=g(/<strong>核查标准[：:]<\/strong>([\s\S]*?)\n/).split("。")[0]||"能否把核心意思说完整";
 if([title,scene,question,action,why,bad,goodcase,r1,r2].some(x=>x.length<4))throw Error("Missing content day "+n+" "+JSON.stringify({title,scene,question,action,why,bad,goodcase,r1,r2}));
 const assess=new Set([1,7,14,21,28,35,42,49,56,63]);
 const type=assess.has(n)?"review":(n>=8&&n<=21||n>=50&&n<=56)?"dialogue":(n>=29&&n<=36||n>=57&&n<=62)?"story":(n>=37&&n<=49)?"expert":"argument";
 const topics={
 grice:{title:"Grice的会话合作原则",url:"https://plato.stanford.edu/entries/grice/",meaning:"交谈中的信息量、关联性、真实性和表达方式，应与当下交流目的相适应。这不是要求永远简短，而是让听众容易判断你在回答什么。",apply:"先问听众此刻最需要哪一条信息，再判断是否该给理由、追问或保留不确定性。"},
 toulmin:{title:"Toulmin论证模型：主张—依据—推理桥梁",url:"https://owl.purdue.edu/owl/general_writing/academic_writing/historical_perspectives_on_argumentation/toulmin_argument.html",meaning:"有结论和理由还不够：必须解释为什么该理由能够支撑结论，这一连接关系称为warrant（论证保证）；结论还有适用条件与反驳空间。",apply:"在案例里找出具体主张、实际依据和二者之间的隐含前提；如果无法说出前提，就先缩小结论。"},
 turn:{title:"会话分析：轮次与回应位置",url:"https://www.conversationanalysis.org/schegloff-media-archive/simplest-systematics-for-turn-taking-language-1974/",meaning:"谈话不是多个人轮流作独白。一次回复既承接前一轮，也为下一轮留下可回应的位置；追问和简短确认因此有独立功能。",apply:"圈出对方说出的关键词，随后判断自己的第一句话是回应、转话题还是夺回话轮。"},
 negotiate:{title:"原则性谈判：问题与关系分开",url:"https://www.pon.harvard.edu/tag/principled-negotiation/",meaning:"区分“人”与“问题”，再区分表面立场与真正利益。反对一项办法，不必否定提出该办法的人；尊重也不等于接受所有建议。",apply:"把一句对人的评价改成对具体方案、约束或共同目标的讨论，避免只用客套话掩盖真实分歧。"},
 aristotle:{title:"亚里士多德修辞学：论证、可信度与听众",url:"https://plato.stanford.edu/entries/aristotle-rhetoric/",meaning:"有效劝说不仅涉及论证内容（logos），还涉及讲话者呈现出的可信度（ethos）与听众的判断处境（pathos）；它们不是强行煽情的三步公式。",apply:"考察这段话的主张与依据是否可靠、措辞是否使人愿意继续听、是否尊重听众已有信息。"},
 anderson:{title:"Chris Anderson：围绕一个中心想法组织演讲",url:"https://www.ted.com/talks/chris_anderson_ted_s_secret_to_great_public_speaking",meaning:"一个演讲可以使用场景、故事、对比和实例，但这些素材需要服务于一个可被听众带走的中心想法。不是素材越丰富越好。",apply:"删去不改变中心观点的背景；突出听众应记住的一次变化、一项判断或一条可行动的建议。"}
 };
 let key="grice";
 if(type==="argument")key=[1,4,5,6].includes(n)?"grice":"toulmin";
 if(type==="dialogue")key=[15,16,17,18,19,20,50,51,54,55].includes(n)?"negotiate":(n%2?"turn":"grice");
 if(type==="story")key=(n>=57&&n%2===1)?"aristotle":"anderson";
 if(type==="expert")key=[37,38,39,40,41].includes(n)?"grice":"toulmin";
 if(type==="review")key=[1,42,49,63].includes(n)?"toulmin":([14,21,35,56].includes(n)?"grice":"aristotle");
 const theory=topics[key];
 const time={review:"10—14分钟",argument:"12—15分钟",dialogue:"12—16分钟",story:"13—17分钟",expert:"15—18分钟"}[type];
 const problem=type==="review"?"如何从原始表现中辨认一个可靠、可改进的表达问题？":type==="dialogue"?"这句话怎样接住对方，又不模糊自己的意思？":type==="story"?"听众应该记住什么转折、画面或中心判断？":type==="expert"?"哪些结论有依据，哪些只是从事实跳出的推断？":"为什么同一件事，有的表达能迅速让听众听懂？";
 const spoken=(goodcase.includes("这是为本课题目创作")?goodcase.split("这是为本课题目")[0]:goodcase);
 const chunks=spoken.split(/(?<=[。！？；])/).map(s=>s.trim()).filter(Boolean);
 const first=chunks[0]||spoken,rest=chunks.slice(1).join(" ")||"（本案例只有一句话，重点核对一句中的主张、依据和条件。）";
 let caseSection=`<section class="pm-section"><h2>案例｜先看两种说法的差距</h2><p class="pm-scene"><b>情境</b>${esc(scene)}</p><p class="pm-scene"><b>具体问题</b>${esc(question)}</p><div class="pm-contrast"><div class="pm-sample pm-miss"><span>表达缺陷</span><p>${esc(bad)}</p></div><div class="pm-sample pm-hit"><span>更好的说法 · 课程原创</span><p>${esc(spoken)}</p></div></div><p class="pm-case-diagnosis"><strong>差异不在“词藻”：</strong>${esc(badwhy||why)}</p></section>`;
 let core=`<section class="pm-section pm-analysis"><h2>剖析｜哪一句在发挥作用</h2>
 <div class="pm-move"><span>01 · 直接承担的功能</span><p>${esc(first)}</p><small>判断这一句是在给结论、回应感受、陈述事实还是提出行动；它必须与本课问题相符。</small></div>
 <div class="pm-move"><span>02 · 推动理解的内容</span><p>${esc(rest)}</p><small>检查后半部分是否补了理由、例子、条件或后续动作；不是越长越完整。</small></div>
 <p><strong>本题的关键：</strong>${esc(why)} </p></section>`;
 let theoryCard=`<div class="pm-theory"><div class="pm-theory-kicker">THEORY NOTE · 理论只讲与本题有关的部分</div><h3>${esc(theory.title)}</h3><p>${esc(theory.meaning)}</p><p><strong>落在今天的案例：</strong>${esc(theory.apply)} ${esc(why)}</p><a href="${theory.url}" target="_blank" rel="noopener noreferrer">查看理论出处及进一步说明 ↗</a></div>`;
 let practice = "";
 if(type==="dialogue")practice=`<section class="pm-section"><h2>应用｜只改下一轮回应</h2><p>请把错误表达改成<strong>两句自然的现场回应</strong>：第一句承接对方已经说出的事实、困难或目标；第二句给自己的判断、合适的追问或明确请求。不要为了礼貌重复一长段客套话。</p><p class="pm-task"><b>替代场景</b>${esc(transfer)}</p><p>选择其中一个改变（听众、关系、限制或目标），再修正两句话中的一处措辞。<strong>成果：</strong>两句回复＋一句说明为什么这样接话。</p></section>`;
 else if(type==="story")practice=`<section class="pm-section"><h2>应用｜留一个画面，删一段铺垫</h2><p>把这个例子压缩为<strong>起点—变化—听众应记住的意思</strong>，最多写100字。具体细节只能来自题干或明确标为虚构的训练场景；发生在后面的事不自动是由前面事件造成的。</p><p class="pm-task"><b>迁移问题</b>${esc(transfer)}</p><p>再删去一个不影响中心意思的细节。<strong>成果：</strong>一段更紧凑的故事或发言开头。</p></section>`;
 else if(type==="expert")practice=`<section class="pm-section"><h2>应用｜给专业判断加上证据边界</h2><p>用<strong>“我能确认……；这还不能说明……；建议下一步核查……”</strong>的逻辑，针对本题写80—120字。可以改变措辞，但不能把相关写成因果、把建议写成已证实的效果。</p><p class="pm-task"><b>变化条件</b>${esc(transfer)}</p><p>指出这一变化会影响哪一个判断前提，并删掉一句空泛评价。<strong>成果：</strong>一段适用于真实汇报或点评的谨慎回应。</p></section>`;
 else practice=`<section class="pm-section"><h2>应用｜只修复一个关键句</h2><p>针对“${esc(question)}”，先写一句明确回应，再用一句具体信息支撑。完成后检查有没有多加题目没有提供的事实。不要写两份几乎相同的提纲。</p><p class="pm-task"><b>换个条件</b>${esc(transfer)}</p><p>决定是否需要改变第一句，而不是整段照搬。<strong>成果：</strong>一条可直接开口使用的改写。</p></section>`;
 const refHtml=`<details class="pm-references"><summary>写完之后再看｜两份完整参考表达与关键词</summary><div class="pm-reference-body"><p><strong>路径 A：</strong>${esc(r1)}</p><p class="pm-key"><b>提示词：</b>${esc(k1)}</p><p><strong>路径 B：</strong>${esc(r2)}</p><p class="pm-key"><b>提示词：</b>${esc(k2)}</p><p class="pm-compare">比较两个版本回答的侧重点和必要条件，不以是否照抄为评分标准。</p></div></details>`;
 let nextNote="";
 if(n===63)nextNote="正式课程至此结束，不新增第64天。若次日进行课外巩固，抽取此前未见过的题目，按同等时长无提示录音；不与180秒终测直接比较总分。";
 else if(assess.has(n+1))nextNote=`明早第${String(n+1).padStart(2,"0")}天是无提示测评。<strong>先按原题独立完成并封存首次录音、评分，再回到今晚笔记核查</strong>；不能提前复习本页案例与关键词。`;
 else nextNote=`<a href="../am/day-${String(n+1).padStart(2,"0")}.html">明早第${String(n+1).padStart(2,"0")}天「${esc(nextTitle)}」</a>，首次开口后回听一处可核查行为：${esc(target)}。今晚只记录验证问题，不做代替录音的模拟评分。`;
 const classic=originalCaseParagraph&&oldHref?`<details class="pm-source-extra"><summary>可选延伸｜关联的真实演讲或研究案例</summary><p>${esc(originalCaseParagraph)}</p><p><a href="${esc(oldHref)}" target="_blank" rel="noopener noreferrer">${esc(oldSourceName||"查阅原作")} ↗</a></p><small>这是对真实资料的概括，而非演讲原话。课外选读，不计入本节建议用时。</small></details>`:"";
 let lessonBody="";
 if(type==="review") {
   lessonBody=`<h2 class="pm-main-title">晚间复盘：看清差距，不重复做一次考试</h2><p class="pm-lead">${esc(problem)} <strong>仅限早课原始录音与自评已经完成后阅读。</strong></p>
 <section class="pm-section"><h2>一个典型误判</h2><p><strong>原题情境：</strong>${esc(scene)}</p><div class="pm-contrast"><div class="pm-sample pm-miss"><span>原课错误 / 测评风险</span><p>${esc(bad)}</p></div><div class="pm-sample pm-hit"><span>练后讨论用的示例 · 课程原创</span><p>${esc(spoken)}</p></div></div><p>${esc(badwhy||why)}</p></section>
 ${theoryCard}
 <section class="pm-section"><h2>只做一次录音复盘</h2><p>回听早晨已封存的原始录音：写下<strong>发生在第几秒的一处具体表达问题</strong>，对照“${esc(action)}”说明怎样改一句。没有实际录音，不填写分数、不标记复测进步。</p><p><strong>分析边界：</strong>本题属于测评/复盘，练后看范例所得的顺畅感不能回填为首次表现。${esc(why)}</p><p class="pm-task"><b>本次只留下</b> 原始录音定位（秒数）＋一条修订策略＋下一次同条件应检验的指标。</p></section>
 ${refHtml}
 <p class="pm-next"><strong>后续：</strong>${nextNote}</p>${classic}`;
 } else if(type==="dialogue"){
   lessonBody=`<h2 class="pm-main-title">晚间沟通案例研习</h2><p class="pm-lead">${esc(problem)}</p>${caseSection}${theoryCard}${practice}${refHtml}<p class="pm-next"><strong>带到下一早课：</strong>${nextNote}</p>${classic}`;
 } else if(type==="story"){
   lessonBody=`<h2 class="pm-main-title">晚间叙事与演讲工作坊</h2><p class="pm-lead">${esc(problem)}</p>${caseSection}${core}${theoryCard}${practice}${refHtml}<p class="pm-next"><strong>复用技能：</strong>${nextNote}</p>${classic}`;
 } else if(type==="expert"){
   lessonBody=`<h2 class="pm-main-title">晚间专业表达诊断室</h2><p class="pm-lead">${esc(problem)}</p>${caseSection}${theoryCard}${core}${practice}${refHtml}<p class="pm-next"><strong>下一次真实开口：</strong>${nextNote}</p>${classic}`;
 } else {
   lessonBody=`<h2 class="pm-main-title">晚间表达案例研习</h2><p class="pm-lead">${esc(problem)}</p>${caseSection}${core}${theoryCard}${practice}${refHtml}<p class="pm-next"><strong>明早听自己的录音：</strong>${nextNote}</p>${classic}`;
 }
 const metadata=`<div class="pm-metadata"><span>${time} · 完成即可结束</span><span>静默案例研习 · 不代替早课录音</span></div>`;
 const outArticle=`<article class="lesson pm-seminar pm-kind-${type}" data-pm-revision="case-theory-v3" data-day="${String(n).padStart(2,"0")}">${metadata}${lessonBody}</article>`;
 let updated=html.replace(art,outArticle);
 if(!updated.includes('href="../pm-seminar.css"'))updated=updated.replace('<link rel="stylesheet" href="../course-page.css">','<link rel="stylesheet" href="../course-page.css"><link rel="stylesheet" href="../pm-seminar.css">');
 updated=updated.replace('<body><div class="wrap">','<body class="pm-independent"><div class="wrap">');
 updated=updated.replace(/<header class="hero">([\s\S]*?)<p>[^<]*<\/p>/,(m,x)=>`<header class="hero">${x}<p>从一则案例看清表达机制；理论讲透一处难点，只做必要的修订练习。</p>`);
 updated=updated.replace(/<div class="pills">([\s\S]*?)<\/div>/,(m,x)=>`<div class="pills">${x.replace(/<span>18分钟<\/span>/,`<span>${time}</span>`).replace(/<span>无需发声<\/span>/,"<span>一课一题 · 按需学习</span>")}</div>`);
 updated=updated.replace(/<aside class="sidebar">[\s\S]*?<\/aside>/,`<aside class="sidebar"><section class="paper pm-sidebox"><div class="kicker">THIS EVENING</div><h2>今晚只带走一件事</h2><p>${esc(action)}</p><p class="pm-side-small">当前主题：${esc(title)}。无需填写多项重复记录。</p><p><a href="../am/day-${String(n).padStart(2,"0")}.html">查看对应早课 →</a></p><p><a href="../index.html">返回双轨目录 →</a></p></section></aside>`);
 return {html:updated,n,type,time,title,good:spoken,bad,theme:theory.title,refs:[k1,k2],theoryURL:theory.url};
}