function expandPM(html, day, n) {
 const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 const review=html.includes("pm-kind-review"),dialog=html.includes("pm-kind-dialogue");
 const time=review||dialog?"12—16分钟":"14—18分钟";
 if(!html.includes('data-pm-revision="case-theory-v4"')||!html.includes('class="pm-case-deep"')||!html.includes('class="pm-theory-bridge"')||!html.includes('class="pm-reference-body"')) throw Error("Unsupported page "+day);
 let a=html.replace('data-pm-revision="case-theory-v4"','data-pm-revision="case-theory-v5-deep"');
 let block='<div class="pm-case-deep"><div class="pm-deep-kicker">CASE STUDY · 深入情境及追问</div><h3>还原交流现场</h3><p>'+esc(n.setup)+'</p><div class="pm-dialogue"><p><strong>容易失效的说法：</strong>'+esc(n.bad)+'</p><p><strong>对方的追问或现场反应：</strong>'+esc(n.push)+'</p></div><p class="pm-guiding-question"><strong>观察重点：</strong>对比上方有效版本，分析它怎样改善听众理解，又有哪些推断不能超出已知事实。</p></div>';
 a=a.replace(/<div class="pm-case-deep">[\s\S]*?<\/div>(?=<\/section>)/,block);
 a=a.replace(/<div class="pm-sample pm-miss">[\s\S]*?<\/div>/,'<div class="pm-sample pm-miss"><span>欠妥话术 · 课程原创示意</span><p>'+esc(n.bad)+'</p></div>');
 a=a.replace(/(<h4>理论如何解释这个案例<\/h4>\s*<p>[\s\S]*?<\/p>)/,'$1<h4>逐句解剖：理论落实在什么表达动作上</h4><p>'+esc(n.analysis)+'</p>');
 a=a.replace(/(<h4>适用范围与例外<\/h4>\s*<p>[\s\S]*?<\/p>)/,'$1<p><strong>本题特别要注意：</strong>'+esc(n.limit)+'</p>');
 a=a.replace(/<div class="pm-insight-verify">[\s\S]*?<\/div>/,"");
 a=a.replace(/<\/section>(\s*<details class="pm-references">)/,'<p class="pm-transfer-challenge"><strong>本题深度迁移：</strong>'+esc(n.task)+'</p></section>$1');
 a=a.replace(/<p class="pm-compare">[\s\S]*?<\/p>/,'<div class="pm-answer-analysis"><h4>答案解析｜不只是看范文</h4><p><strong>路径 A 的表达机制：</strong>'+esc(n.a)+'</p><p><strong>路径 B 的表达机制：</strong>'+esc(n.b)+'</p><p><strong>错误对照与选用条件：</strong>'+esc(n.limit)+'</p><p class="pm-answer-takeaway">核对时检查贴题程度、理由与行动建议，以及有没有越出已知事实。两种路径不必强行选出唯一标准答案。</p></div>');
 a=a.replace(/<div class="pm-metadata"><span>[\s\S]*?<\/span>/,'<div class="pm-metadata"><span>建议 '+time+' · 最多18分钟，完成核心任务即可结束</span>');
 a=a.replace(/<div class="pills">([\s\S]*?)<\/div>/,(full,inner)=>'<div class="pills">'+inner.replace(/<span>18分钟<\/span>/g,'<span>建议'+time+' · ≤18分钟</span>')+'</div>');
 const article=(a.match(/<article class="lesson[^"]*"[\s\S]*?<\/article>/)||[])[0]||"";
 const pure=article.replace(/<[^>]*>/g,"").replace(/&[^;]+;/g," ");
 const fields=["CASE STUDY","pm-transfer-challenge","pm-answer-analysis","pm-theory-bridge","pm-references",'data-completion-id="pm:day-'+String(day).padStart(2,"0")+'"'];
 if(!fields.every(x=>a.includes(x))||pure.length<930) throw Error("Validation failed "+day+" chars "+pure.length+" missing "+fields.filter(x=>!a.includes(x)));
 return {html:a,plainLength:pure.length,time};
}