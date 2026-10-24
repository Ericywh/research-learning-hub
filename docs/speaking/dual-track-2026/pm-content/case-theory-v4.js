function enhancePMCaseTheoryV4(page,n,extra){
 const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 const unhtml=s=>String(s??"").replace(/<[^>]*>/g,"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/\s+/g," ").trim();
 const parts=["unfold","bridge","limit"];
 if(parts.some(x=>!extra||!extra[x]||extra[x].length<35))throw Error("Missing deep case content day "+n);
 if(!page.includes('data-pm-revision="case-theory-v3"'))throw Error("Input is not expected v3 version day "+n);
 const oldArt=page.match(/<article class="lesson pm-seminar[^"]*" data-pm-revision="case-theory-v3"[^>]*>[\s\S]*?<\/article>/)?.[0];
 if(!oldArt)throw Error("Cannot locate seminar day "+n);
 const scene=unhtml(oldArt.match(/<p class="pm-scene"><b>情境<\/b>([\s\S]*?)<\/p>/)?.[1]);
 const question=unhtml(oldArt.match(/<p class="pm-scene"><b>具体问题<\/b>([\s\S]*?)<\/p>/)?.[1]);
 const review=oldArt.includes('pm-kind-review');
 if(!review&&(!scene||!question))throw Error("Missing case scene/question "+n);
 if((oldArt.match(/<details class="pm-references"/g)||[]).length!==1)throw Error("Reference integrity failed day "+n);
 let art=oldArt.replace('data-pm-revision="case-theory-v3"','data-pm-revision="case-theory-v4"');
 // Case: develop a narrative of the actual dilemma rather than adding abstract recaps.
 const detail=`<div class="pm-case-deep">
 <div class="pm-deep-kicker">CASE IN CONTEXT · 把案例看完整</div>
 <h3>情境背后的选择与听众理解</h3>
 <p>${esc(extra.unfold)}</p>
 <p class="pm-guiding-question"><strong>带着一个问题阅读：</strong>${esc(review?
 "首次测评中的哪个行为能直接在原始录音中找到证据？不要用练后印象代替录音。":
 "与较弱的版本相比，哪一处信息真正减少了听众必须自己补充的推断？")}</p>
 </div>`;
 const firstSection=art.match(/<section class="pm-section">[\s\S]*?<\/section>/)?.[0];
 if(!firstSection)throw Error("No suitable case section day "+n);
 art=art.replace(firstSection,firstSection.replace(/<\/section>$/,detail+"</section>"));
 // Theory is not a dictionary entry: demonstrate how it accounts for this one case.
 const replacedTheory=art.replace(
  /<p><strong>落在今天的案例：<\/strong>[\s\S]*?<\/p>/,
  `<div class="pm-theory-bridge">
    <h4>理论如何解释这个案例</h4>
    <p>${esc(extra.bridge)}</p>
    <h4>适用范围与例外</h4>
    <p>${esc(extra.limit)}</p>
   </div>`
 );
 if(replacedTheory===art)throw Error("Original theory card could not be upgraded "+n);
 art=replacedTheory;
 const rule=`<div class="pm-insight-verify">
 <strong>用一句话验证是否学会：</strong>不复述理论名称，而是说明这道题里“哪个表达动作—怎样帮助听众—在什么条件下失效”。如果只能说出术语，还需要返回案例核对。
 </div>`;
 if(art.includes('<div class="pm-theory">')){
   art=art.replace(/(<div class="pm-theory">[\s\S]*?)(<\/div>)(?=<section class="pm-section"|<div class="pm-theory"|<details class="pm-references")/,
    (whole,body,end)=>body+end+rule);
 }else throw Error("Missing theory "+n);
 // Respect single native closed reference; no extra required checklist.
 art=art.replace(/(<div class="pm-metadata"><span>)[^<]*(<\/span>)/,
  '$1 18分钟 · 案例与理论整合精讲$2');
 // Assessment lessons should never show examples before AM original recording.
 if(review&&!art.includes("早课原始录音与自评已经完成后阅读"))throw Error("Assessment protection missing "+n);
 if(/<details class="pm-references"[^>]+open\b/.test(art))throw Error("Reference unexpectedly opened "+n);
 let output=page.replace(oldArt,art);
 output=output.replace(/(<header class="hero">[\s\S]*?<div class="pills">[\s\S]*?)<span>(?:10|12|13|15)[—–-]\d+分钟<\/span>/,
  '$1<span>18分钟</span>');
 output=output.replace('https://plato.stanford.edu/entries/grice/','https://plato.stanford.edu/entries/implicature/');
 if(output===page||!output.includes('data-pm-revision="case-theory-v4"'))throw Error("V4 update did not apply "+n);
 return {html:output,day:n,charsBefore:unhtml(oldArt).length,charsAfter:unhtml(art).length,sourceOnlyReference:(art.match(/<details class="pm-references"/g)||[]).length===1};
}