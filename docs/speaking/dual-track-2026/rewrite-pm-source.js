function rewritePM(html, n, nextTitle) {
  const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const plain=s=>String(s||"").replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim();
  const take=(source,labels)=>{const m=source.match(new RegExp("<(?:strong|b)>\\s*(?:"+labels+")[：:]\\s*<\\/(?:strong|b)>\\s*([\\s\\S]*?)(?=<(?:strong|b)>|<\\/div>)","i"));return m?plain(m[1]):"";};
  const article=html.match(/<article class="lesson">([\s\S]*?)<\/article>/)?.[1];if(!article)throw Error("missing article "+n);
  const details=article.match(/<details>[\s\S]*?<\/details>/)?.[0];if(!details)throw Error("missing reference "+n);
  const q=article.match(/情境是[“"]([\s\S]*?)[”"]\s*[；;,，]?\s*实际问题是[“"]([\s\S]*?)[”"]/);if(!q)throw Error("missing task "+n);
  const scene=plain(q[1]), question=plain(q[2]);
  const title=plain(html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]);
  const r1=take(details,"路径一|路线一|路线甲"),r2=take(details,"路径二|路线二|路线乙");
  const k1=take(details,"参考关键词一").split(/[。；]/)[0],k2=take(details,"参考关键词二").split(/[。；]/)[0];
  if([r1,r2,k1,k2].some(x=>x.length<7))throw Error("reference incomplete "+n);
  const lead=plain(article.match(/<h3>0[—–-]4分钟[^<]*<\/h3>([\s\S]*?)<section class="depth-analysis"/)?.[1]||"").split(/[。！？]/)[0]+"。";
  const method=plain(article.match(/<strong>组织机制[：:]<\/strong>([\s\S]*?)<\/p>/)?.[1]||"").replace(/\s*写一条不超过25字[\s\S]*$/,"");
  const wrongSection=article.match(/<h3>4[—–-]8分钟[^<]*<\/h3>([\s\S]*?)<h3>8[—–-]13分钟/)?.[1]||"";
  const wrong=take(wrongSection,"有问题的做法|典型失误|反面表达|错误做法").split(/。(?=\s)/)[0]||"";
  if(!wrong)throw Error("missing error "+n);
  const part=article.match(/<h3>8[—–-]13分钟[^<]*<\/h3>([\s\S]*?)<h3>13[—–-]16分钟/)?.[1]||"";
  const transfer=take(part,"换题|进阶迁移|迁移升级").split(/(?:先尝试|先在心中|可以默写|最后辨认)/)[0]||"请把今天的技能放进一个不同听众的情境，重新选择信息。";
  const a=k1.split(/[—–\-、，]/).map(s=>s.trim()).filter(Boolean);
  const b=k2.split(/[—–\-、，]/).map(s=>s.trim()).filter(Boolean);
  const sentences=r1.split(/(?<=[。！？；])/u).map(s=>s.trim()).filter(Boolean);
  const showSteps=x=>x.slice(0,3).map(s=>"<strong>"+esc(s)+"</strong>").join(" → ");
  const quoted=wrong.match(/[‘“](.{4,90}?)[’”]/);
  let wrongQuote=quoted?.[1];
  if(!wrongQuote) {
    if(/测前|无提示|录音|评[分测]/.test(wrong))wrongQuote="我先把参考提纲看完，再做所谓的无提示录音。";
    else if(/建议|步骤|可执行/.test(wrong))wrongQuote="这个问题值得重视，建议进一步优化和完善相关工作。";
    else if(/回应|接话|对方|聊天/.test(wrong))wrongQuote="你说得很有意思，不过我还是先完整说一遍自己的想法吧。";
    else if(/数字|百分|证据|显著|因果|相关/.test(wrong))wrongQuote="数据已经充分证明这个办法一定有效。";
    else wrongQuote="这件事非常重要，情况也很复杂，我们必须高度重视。";
  }
  const isTest=new Set([1,7,14,21,28,35,42,49,56,63]);
  const assessment=isTest.has(n)?'<p><strong>测评保护：</strong>本晚课仅在早间首次无提示录音与自评完成后学习，后续改写不得覆盖原始测评。</p>':"";
  const next = n<63?
`<p>次日早课：<a href="../am/day-${String(n+1).padStart(2,"0")}.html">第${String(n+1).padStart(2,"0")}天「${esc(nextTitle)}」</a>。检验三件事：是否直接回应新问题、是否有一条具体支撑、是否说清不能推断的内容。</p>
<p>${isTest.has(n+1)?"<strong>明日无提示测评：</strong>首次录音前不得查看今晚案例或关键词。依原题、原准备时长与原录音要求完成并保存成绩，之后才能回看本页核对。":"把今天的技巧用于早课原题，完成首轮独立录音后再回听核对。不要用今晚的静默表现代替真实开口记录。"}</p>`:
`<p>本课程在第63天结束，不存在正式第64天早课。可以在次日早晨进行<strong>课外自主验证</strong>：抽取一个未练过的话题，先无提示录音，再回听并用今天的标准自评。此练习不计入126课，也不能覆盖结课测评。</p>`;
  const htmlBody=`
<h2>🌙 晚间静默深度课｜经典案例 → 技巧拆解 → 错误对比 → 独立改写 → 次日早课验证</h2>
<p><strong>教学主题：</strong>${esc(title)}。本课用18分钟完成深度阅读、静默分析与独立书面改写，不要求发声。晚课记录与早间真实录音分开。</p>
${assessment}
<h3>0—4分钟｜① 经典案例：完整表达与具体情境</h3>
<p><strong>课程原创情境：</strong>${esc(scene)}</p><p><strong>完整问题：</strong>${esc(question)}</p>
<section class="depth-analysis" style="border-left:4px solid #8670b7;background:#f7f5ff;padding:14px 18px;border-radius:8px;margin:12px 0">
<h4>经典表达案例（课程原创教学范例，并非历史名人引文）</h4><p>${esc(r1)}</p></section>
<p><strong>观察任务：</strong>标出第一句怎样回应提问、哪部分提供了依据、哪一句说明必要条件。思考：如果删掉其中一项，听众会失去什么？案例用于理解技巧，而非背诵。</p>
<h3>4—8分钟｜② 拆解表达技巧：逐句还原有效机制</h3>
<p><strong>原理：</strong>${esc(lead)}</p><p><strong>判断依据：</strong>${esc(method||"区分已知事实、合理解释与仍待核实的条件；用尽量少的句子使听众把握完整意思。")}</p>
<section class="depth-analysis" style="border-left:4px solid #438c91;background:#eef9f8;padding:13px 17px;border-radius:8px;margin:12px 0">
<h4>逐层拆解</h4>
<ol><li><strong>回应问题：</strong>“${esc(sentences[0]||r1)}”让听众获得该题的核心判断或重点，而不是先听漫长铺垫。</li>
<li><strong>展开依据：</strong>${esc(sentences.slice(1).join(" ")||"案例后续语句为判断补充理由、例子或执行步骤。")} 注意这里的内容是否真正服务于第一句。</li>
<li><strong>抽取结构：</strong>${showSteps(a)}。逐项指出这三个具体关键词在原文中各自发挥什么作用。</li>
<li><strong>核查边界：</strong>题目未提供的数字、动机和因果证据不得自行补充；必要时将确定性判断改成条件性判断。</li></ol></section>
<h3>8—11分钟｜③ 对比错误表达：判别缺失的信息</h3>
<p><strong>原课典型错误：</strong>${esc(wrong)}</p>
<blockquote><p><strong>错误话术示例：</strong>“${esc(wrongQuote)}”</p></blockquote>
<p><strong>有针对性的比较：</strong>优质案例有“${esc(a[0]||"明确回应")}”作为入口，以“${esc(a[1]||"具体依据")}”推进；错误案例${/测前|无提示|录音|评[分测]/.test(wrong)?"破坏无提示测评的操作顺序":"让听众无法核查理由、区分新信息或判断适用条件"}。写下错误发生的具体位置、遗漏的信息和一处最小修改，不能只写“表达不够好”。</p>
<h3>11—16分钟｜④ 独立改写：不看示范完成两轮迁移</h3>
<p><strong>任务A（3分钟）：</strong>合上经典案例。针对“${esc(scene)}”，将上述错误表达改写为一段60—100字的自然口语稿，开头要回答“${esc(question)}”，至少有一项具体理由或可执行步骤，并注明一项限制。写完删去一处多余铺垫，不能抄范文。</p>
<p><strong>任务B（2分钟）：</strong>${esc(transfer)} 分别写出主场景与新场景的3个关键词，并注明哪一项必须调整。不要凭空创造新的案例事实。</p>
<p><strong>交付物：</strong>一段自主改写稿、两组三词提纲、一条错误诊断。完成前不展开以下参考区。</p>
<details><summary>练后展开｜两份完整参考及各自3个关键词</summary><div class="answer">
<p><strong>参考路径一：</strong>${esc(r1)}</p><p><strong>关键词一：</strong>${esc(k1)}</p>
<p><strong>参考路径二：</strong>${esc(r2)}</p><p><strong>关键词二：</strong>${esc(k2)}</p>
<p><strong>两条路径的实质差异：</strong>路径一以“${esc(a[0]||"直接判断")}”起步，沿 ${showSteps(a)} 展开；路径二从“${esc(b[0]||"另一条件")}”切入，沿 ${showSteps(b)} 组织。注意它们在观点、依据和适用条件上的不同，而非机械拼接两份答案。</p>
<p><strong>错误对照：</strong>${esc(wrong)}。再读自己的改写，核对是否真正补上遗漏的信息。</p>
<p><strong>四项自评：</strong>回应是否贴题；理由或例子是否具体；事实与推测是否区分；语言是否比原错误表达更清楚。</p>
</div></details>
<h3>16—18分钟｜⑤ 次日早课验证：形成可观测的口头表现</h3>
${next}
<p><strong>离开页面前：</strong>不打开参考区复看，用自己的话写下一项明早应观察的行为及一项需要改进的具体问题。今晚懂得原理不等于明早已经说得出来。</p>
<p><strong>完成依据：</strong>PM保留案例拆解、错误对比、自主改写和验证指标；AM另行完成并保存独立录音与自评，两者不得互相替代。</p>`;
  let newer=html.replace(/(<article class="lesson">)[\s\S]*?(<\/article>)/,(whole,a,b)=>a+htmlBody+b);
  newer=newer.replace(/<header class="hero">([\s\S]*?)<p>[^<]*<\/p>/,(whole,head)=>`<header class="hero">${head}<p>完整案例、拆解技巧、对照错误、独立改写，次日早课验证。</p>`);
  newer=newer.replace(/<h2>晚间技巧课的完成依据<\/h2><p>[^<]*<\/p>/,`<h2>晚间技巧课的完成依据</h2><p>一页案例拆解、一段自主改写、两组三词结构和一条次日口头验证指标。</p>`);
  return {html:newer,title,scene,question,r1,r2,k1,k2,wrong,transfer};
}