function rewritePMv2(page,n,lesson,nextTopic){
 const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 const strip=s=>String(s??"").replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/\s+/g," ").trim();
 const clean=s=>strip(s).replace(/\s*分别写出主场景与新场景[\s\S]*$/,"").trim();
 const SOURCES={
  ASA:["美国统计学会｜2016年统计显著性与p值声明","https://magazine.amstat.org/blog/2016/03/07/pvalue-mar16/","声明强调统计显著性不能代替效应大小、科学重要性或有效的研究设计。"],
  JOBS:["乔布斯｜2005年斯坦福毕业演讲","https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says","演讲开场说明将以三个故事组织讲话，之后通过个人经历连接主题。"],
  ROSLING:["汉斯·罗斯林｜2006年TED数据演讲","https://www.ted.com/talks/hans_rosling_the_best_stats_you_ve_ever_seen","通过有动态变化和比较关系的数据展示，挑战听众对全球发展状况的笼统印象。"],
  DUARTE:["南希·杜尔特｜伟大演讲的结构","https://www.ted.com/talks/nancy_duarte_the_secret_structure_of_great_talks","2011年TEDx分享以现状与可能状态之间的对比分析演讲如何推动观点。"],
  HEADLEE:["塞莱斯特·海德莉｜如何更好地交谈","https://www.ted.com/talks/celeste_headlee_10_ways_to_have_a_better_conversation","结合采访经验讨论专注倾听、简洁清晰及真正回应谈话对象的重要性。"],
  PON:["哈佛谈判项目｜原则性谈判","https://www.pon.harvard.edu/daily/negotiation-skills-daily/six-guidelines-for-getting-to-yes/","《Getting to Yes》相关分析强调区分人和问题、理解立场背后的利益并考虑客观标准与方案。"],
  ANDERSON:["克里斯·安德森｜TED演讲的核心","https://www.ted.com/talks/chris_anderson_ted_s_secret_to_great_public_speaking","2016年TED演讲反对单一固定公式，强调围绕一个值得传递的想法组织内容。"],
  SINEK:["西蒙·斯涅克｜从“为什么”开始","https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action","2009年TEDx演讲以“为什么”这一层讨论动机如何帮助他人理解行动。"],
  TREASURE:["朱利安·特雷热｜让听众愿意倾听","https://www.ted.com/talks/julian_treasure_how_to_speak_so_that_people_want_to_listen","2013年TED演讲讨论倾听与声音表达，演示声音变化对信息接收的作用。"],
  ADICHIE:["奇玛曼达·阿迪契｜单一故事的危险","https://www.ted.com/talks/chimamanda_ngozi_adichie_the_danger_of_a_single_story","2009年TED演讲结合个人经历讨论依赖单一叙事理解他人及社会时的误判风险。"],
  CAIN:["苏珊·凯恩｜内向者的力量","https://www.ted.com/talks/susan_cain_the_power_of_introverts","2012年TED演讲质疑将外向性格视为唯一理想的倾向，强调不同表达方式的价值。"],
  DUDLEY:["德鲁·达德利｜日常领导力","https://www.ted.com/talks/drew_dudley_everyday_leadership","2010年TEDx演讲以日常细小互动重新讨论影响他人的意义。"],
  ROBINSON:["肯·罗宾逊｜学校扼杀创造力吗？","https://www.ted.com/talks/sir_ken_robinson_do_schools_kill_creativity","2006年TED演讲以教育与创造力这一具体问题展开论证，并运用幽默和例子。"]
 };
 const classics=new Set([1,2,4,5,6,8,9,11,12,15,17,20,21,23,25,27,29,30,31,32,35,37,39,40,41,44,46,47,49,51,54,55,57,58,59,61,62,63]);
 const original=page.match(/<article class="lesson">([\s\S]*?)<\/article>/);
 if(!original)throw Error("Original lesson body missing "+n);
 if(page.includes('data-pm-revision="case-coach-2026-v2"'))throw Error("Already v2 "+n);
 const body=original[1];
 const scene=strip(body.match(/课程原创情境：<\/strong>\s*([^<]+)/)?.[1]);
 const question=strip(body.match(/完整问题：<\/strong>\s*([^<]+)/)?.[1]);
 const error=strip(body.match(/原课典型错误：<\/strong>\s*([^<]+)/)?.[1]);
 const transfer=clean(body.match(/任务B（2分钟）：<\/strong>\s*([^<]+)/)?.[1]);
 const title=strip(page.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]);
 const ans=body.match(/<details>[\s\S]*?<\/details>/)?.[0];
 function extract(tag){return strip(ans?.match(new RegExp('<strong>'+tag+'：</strong>\\s*([^<]+)'))?.[1]);}
 const a=extract("参考路径一"),b=extract("参考路径二"),ka=extract("关键词一"),kb=extract("关键词二");
 if(!scene||!question||!title||!error||!a||!b||!ka||!kb||!transfer)throw Error("Required original data missing day "+n+" "+JSON.stringify({scene,question,title,error,a,b,ka,kb,transfer}));
 for(const field of ["src","lens","move","why","good","diagnosis","task","measure"]){if(!lesson[field]||lesson[field].length<18)throw Error("Missing field "+field+" day "+n);}
 const external=SOURCES[lesson.src];if(!external)throw Error("Unknown source "+lesson.src);
 const isClassic=classics.has(n);
 const kind=isClassic?"REAL CASE · 真实经典案例":"ORIGINAL CASE · 课程原创微案例";
 const caseText=isClassic
  ?'<p><strong>真实资料（分析性转述，不是演讲原话）：</strong>'+esc(external[2])+'</p><p class="pm-source-reference">来源：<a href="'+esc(external[1])+'" target="_blank" rel="noopener noreferrer">'+esc(external[0])+'</a>。页面提供了本课所需分析摘要，完整原作属于课外延伸，不计入18分钟。</p>'
  :'<p><strong>本课原创模拟表达：</strong>'+esc(lesson.good)+'</p><p class="pm-source-reference">这是为本课题目创作的训练文本，不是假托名人或真实参与者的引文。</p>';
 const testDays=new Set([1,7,14,21,28,35,42,49,56,63]);
 const testNotice=testDays.has(n)?'<p class="pm-assessment-notice"><strong>测评资料保护：</strong>只在当日AM首次无提示录音、计时及原始自评已经保存后学习本课；晚课示范和改写不得回填为首测成绩。</p>':"";
 const tomorrow=n<63
  ?'<p><strong>对应的次日早课：</strong><a href="../am/day-'+String(n+1).padStart(2,"0")+'.html">第'+String(n+1).padStart(2,"0")+'天 · '+esc(nextTopic||"早间开口训练")+'</a>。听第一次录音时，专门核对：'+esc(lesson.measure)+'</p>'
  :'<p><strong>课程结课：</strong>没有第64天正式课。可自选一题再录60秒，条件保持一致并与等长基线比较，不计入126课或覆盖终测成绩。</p><p><strong>自主口头复测指标：</strong>'+esc(lesson.measure)+'</p>';
 const reference='<details><summary>完成独立改写后再展开｜两份参考与关键词</summary><div class="answer">\n'+
  '<strong>参考一：</strong>'+esc(a)+'\n\n<strong>关键词一：</strong>'+esc(ka)+'。只提示第一种表达顺序，不必复制其立场。\n\n'+
  '<strong>参考二：</strong>'+esc(b)+'\n\n<strong>关键词二：</strong>'+esc(kb)+'。请检查其与第一种路径的切入点和条件有什么不同。\n\n'+
  '<strong>对照讲解：</strong>本课动作是“'+esc(lesson.move)+'”。回看两份示范，判定各自如何做到、哪里还可能需要事实支持。\n\n'+
  '<strong>纠错结论：</strong>'+esc(lesson.diagnosis)+'\n\n'+
  '<strong>核查标准：</strong>'+esc(lesson.measure)+'\n</div></details>';
 const content=`
<h2>🌙 一课一技｜案例解剖与表达修复</h2>
<p class="pm-lesson-aim"><strong>今天只学一件事：</strong>${esc(lesson.move)}</p>
${testNotice}
<h3>0—3分钟｜① ${kind}：先看表达动作</h3>
<section class="depth-analysis pm-core-case"><h4>${isClassic?"经典材料怎样帮助我们理解本课技巧":"本课情境下的有效表达"}</h4>
${caseText}
<p><strong>观察视角：</strong>${esc(lesson.lens)}</p></section>
<p><strong>初始诊断：</strong>先回想今早对应题目或首次录音里最不满意的一句话，写下一个具体问题；没有AM录音时，用下方模拟错误独立判断，不把这次静默练习算成早课完成。</p>
<h3>3—6分钟｜② 技巧拆解：为什么这种说法有用</h3>
<p><strong>可以立即执行的动作：</strong>${esc(lesson.move)}</p>
<p><strong>起作用的原因：</strong>${esc(lesson.why)}</p>
<section class="depth-analysis pm-revised-example"><h4>课程改写范例 · 为本题原创，非经典原作引文</h4>
<p>${esc(lesson.good)}</p>
<p><strong>请做一处定位：</strong>划出范例中真正回应问题的短句，再指出哪一句承担理由、条件、细节或行动建议；如果两句都删不掉，应说明各自独立的作用。</p></section>
<h3>6—10分钟｜③ 错误诊断：找到缺口并修复</h3>
<p><strong>需要纠正的原课错误：</strong>${esc(error)}</p>
<p><strong>为什么有问题：</strong>${esc(lesson.diagnosis)}</p>
<p><strong>此刻独立练习：</strong>${esc(lesson.task)}。先写出自己的修改版本，再比较上面的原创范例；不能只回答“应该更自然”或改用更高级的词。</p>
<h3>10—15分钟｜④ 同题改写与陌生场景迁移</h3>
<p><strong>同题（3分钟）：</strong>针对本页“今日素材”给出的情境与问题，写一段可以说出口的简短回应，必须体现今天的动作；禁止加入题目没有给出的数字、履历和动机。</p>
<p><strong>换题（2分钟）：</strong>${esc(transfer)}。先不看示范，写出需要保持不变的一个技能步骤，以及因为场景改变必须调整的一项信息。</p>
<p><strong>完成后才能展开：</strong>自己先留下<strong>一段独立改写、一项错误诊断、一个换题调整</strong>。参考区只用于比对，不是背诵答案。</p>
${reference}
<h3>15—18分钟｜⑤ 闭卷提取与明早验证</h3>
<p><strong>闭卷小测：</strong>不看经典来源、改写示范和参考区，用一句话解释今天的技能为何有效，再写出一个不适用或需要调整的条件。</p>
${tomorrow}
<p class="pm-outcome-compact"><strong>今晚仅留三项成果：</strong>错误诊断｜修订后的自然口语句｜次日可听出来的验证指标。晚课不强制开口，不增加18分钟之外的任务；录音及评分仍归对应AM课程单独完成。</p>`;
 const updated=page.replace(/<article class="lesson">[\s\S]*?<\/article>/,
  '<article class="lesson pm-masterclass" data-pm-revision="case-coach-2026-v2" data-case-scene="'+esc(scene)+'" data-case-question="'+esc(question)+'">'+content+'</article>');
 if(updated===page)throw Error("No replacement "+n);
 const addLead=updated.replace(/(<header class="hero">[\s\S]*?<h1>[\s\S]*?<\/h1>)<p>[^<]*<\/p>/,
  '$1<p>案例观察、专项纠错、独立改写与次日可检验的技能目标；每晚聚焦一个表达动作。</p>');
 return {html:addLead,kind:isClassic?"sourced":"simulation",source:isClassic?external[0]:null,title,scene,question,referenceCount:2};
}