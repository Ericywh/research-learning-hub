'use strict';
/*
 * Automatic publication from the explicitly shared Notion ECONOMETRICS course.
 * Grant a dedicated read-only Notion integration access to the course root;
 * save its token as a GitHub Actions repository secret ECON_NOTION_READ_TOKEN.
 * The token and private blocks are never logged or committed.
 * Only pages whose original chapter, section and title match the fixed
 * 120-lesson catalog are eligible. Files are generated inside _site only.
 */
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
const root='3f4b5482-3a12-81cc-97f2-fa77f2717001';
const token=process.env.ECON_NOTION_READ_TOKEN;
const out='_site/econometrics/lessons';
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function rich(arr){
  return (arr||[]).map(x=>{
    if(x.type==='equation')return '<span class="math">\\('+esc(x.equation?.expression||'')+'\\)</span>';
    let t=esc(x.plain_text??x.text?.content??'');
    if(x.annotations?.code)t='<code>'+t+'</code>';
    if(x.annotations?.bold)t='<strong>'+t+'</strong>';
    if(x.annotations?.italic)t='<em>'+t+'</em>';
    const href=x.href||x.text?.link?.url;
    if(href && /^https?:\/\//i.test(href))t='<a href="'+esc(href)+'" rel="noopener noreferrer">'+t+'</a>';
    return t;
  }).join('');
}
const plain=arr=>(arr||[]).map(x=>x.plain_text??x.text?.content??'').join('');
function convert(b){
  const obj=b[b.type]||{}, t=rich(obj.rich_text);
  switch(b.type){
    case 'heading_1': case 'heading_2': return '<h2>'+t+'</h2>';
    case 'heading_3': return '<h3>'+t+'</h3>';
    case 'paragraph': return t?'<p>'+t+'</p>':'';
    case 'code':
      return '<pre><code class="language-'+esc(String(obj.language||'text').toLowerCase().replace(/[^a-z0-9_-]/g,'-'))+'">'+esc(plain(obj.rich_text))+'</code></pre>';
    case 'equation': return '<div class="equation">$$'+esc(obj.expression||'')+'$$</div>';
    case 'bulleted_list_item': return '<p class="list-item">• '+t+'</p>';
    case 'numbered_list_item': return '<p class="list-item">'+t+'</p>';
    case 'quote': return '<blockquote>'+t+'</blockquote>';
    case 'callout': return '<aside>'+t+'</aside>';
    case 'divider': return '<hr>';
    default: return ''; // Never expose attachments, private subpages, embeds or mentions.
  }
}
async function children(id){
  let result=[],cursor;
  do{
    const u=new URL('https://api.notion.com/v1/blocks/'+encodeURIComponent(id)+'/children');
    u.searchParams.set('page_size','100');
    if(cursor)u.searchParams.set('start_cursor',cursor);
    let response;
    for(let attempt=0;attempt<4;attempt++){
      response=await fetch(u,{headers:{'Authorization':'Bearer '+token,'Notion-Version':'2022-06-28'}});
      if(response.status!==429&&response.status<500)break;
      await new Promise(done=>setTimeout(done,1200*(attempt+1)));
    }
    if(!response.ok)throw Error('Notion HTTP '+response.status+' reading a course page. Check read-only integration access.');
    const payload=await response.json();
    if(!Array.isArray(payload.results))throw Error('Invalid Notion page contents');
    result.push(...payload.results);
    cursor=payload.has_more?payload.next_cursor:null;
  }while(cursor);
  return result;
}
function teachingDate(blocks){
  const t=blocks.map(x=>plain((x[x.type]||{}).rich_text)).join('\n');
  let m=t.match(/(?:授课日期|课程日期|发布日期)\s*[：:]?\s*(20\d{2})年(\d{1,2})月(\d{1,2})日/)||
        t.match(/(20\d{2})年(\d{1,2})月(\d{1,2})日/);
  if(!m)return null;
  const d=m[1]+'-'+m[2].padStart(2,'0')+'-'+m[3].padStart(2,'0');
  const tms=Date.parse(d+'T00:00:00Z');
  return Number.isFinite(tms)&&new Date(tms).toISOString().slice(0,10)===d?d:null;
}
function titleParts(str){
  const match=String(str||'').match(/^第\s*(\d+)\s*章[·.．]\s*第\s*(\d+)\s*节[｜|]\s*(.+?)\s*(?:[（(]全课程第\d+课[）)])?\s*$/);
  return match?{chapter:+match[1],section:+match[2],title:match[3].trim()}:null;
}
const css=':root{font:15px/1.9 system-ui,sans-serif;background:#f6f8f7;color:#213b45}*{box-sizing:border-box}body{margin:0}header,main,footer{max-width:950px;margin:auto;padding:16px}a{color:#186b65}header{display:flex;gap:22px;flex-wrap:wrap;font-size:13px}.hero{background:#e8f3ef;border-radius:16px;padding:26px;margin:15px 0}h1{font-size:clamp(24px,4vw,34px)}h2{font-size:21px;color:#195f59}h3{font-size:17px;color:#28625d}section{background:white;border:1px solid #dce7e2;border-radius:14px;padding:25px;margin:16px 0}pre{background:#1b303d;color:#eaf4f6;padding:18px;border-radius:10px;overflow-x:auto;font:12px/1.8 monospace}p code{background:#eef3f1;padding:2px 4px;border-radius:4px}.equation{background:#f0f5f3;border-radius:8px;padding:16px;text-align:center;overflow-x:auto}nav{display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px}footer{color:#617778;font-size:12px}@media(max-width:650px){section,.hero{padding:17px}pre{font-size:11px}}';
function htmlFor(l,date,blocks){
  const head='第'+l.chapter+'章·第'+l.section+'节｜'+l.title;
  const body=blocks.map(convert).filter(Boolean).join('\n');
  const headings=['一、通俗理解','二、核心理论与公式','三、实证案例与数据','四、Stata与Python实现','五、初学者避坑','六、今日练习','七、学习进度'];
  if(!headings.every(h=>body.includes(h))||body.length<1800||!body.includes('<pre')||
     !/Stata/i.test(body)||!/Python/i.test(body)||!body.includes('参考答案')){
    throw Error('Notion lesson '+l.id+' failed seven-section completeness checks');
  }
  const prev=l.section>1?'<a href="'+String(l.chapter).padStart(2,'0')+'-'+String(l.section-1).padStart(2,'0')+'.html">← 上一课</a>':'';
  return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">'+
    '<meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<meta name="course-date" content="'+date+'"><title>'+esc(head)+'</title><style>'+css+'</style>'+
    '<script>window.MathJax={tex:{inlineMath:[["\\\\(","\\\\)"]],displayMath:[["$$","$$"]]},svg:{fontCache:"global"}};</script>'+
    '<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script></head><body>'+
    '<header><a href="../">← 120节课程目录</a><a href="../../study/">学习中心</a></header>'+
    '<main><div class="hero"><small>DAY '+l.number+' / 120 · '+date+'</small><h1>'+esc(head)+'</h1>'+
    '<p>预计学习时间：10—15分钟</p><p>授课日期：'+date.replace(/-/g,'年').replace(/年(\d\d)年/,'年$1月')+'日</p></div>'+
    '<section>'+body+'</section><nav>'+prev+'<a href="../">课程目录 →</a></nav></main>'+
    '<footer>计量经济学120天系统课程 · 根据已授课Notion页面自动生成</footer></body></html>';
}
async function main(){
  if(!token){console.log('Notion read-only integration not configured; preserving existing checked-in course HTML.');return;}
  const ctx={window:{}};
  vm.runInNewContext(fs.readFileSync('docs/econometrics/catalog.js','utf8'),ctx,{timeout:2000});
  const lessons=ctx.window.ECON_COURSE?.chapters?.flatMap(c=>c.lessons);
  if(lessons?.length!==120)throw Error('Original 120-lesson catalog missing or altered');
  const bySection=new Map(lessons.map(l=>[l.chapter+'-'+l.section,l]));
  const roots=await children(root);
  const chapterPages=roots.filter(b=>b.type==='child_page'&&/第\s*0?\d+\s*章/.test(b.child_page?.title||''));
  if(!chapterPages.length)throw Error('Notion course root cannot list chapter pages; configure integration access.');
  let published=0,kept=0;
  for(const ch of chapterPages){
    const n=Number(ch.child_page.title.match(/第\s*0?(\d+)\s*章/)[1]);
    if(n<1||n>10)continue;
    for(const p of await children(ch.id)){
      if(p.type!=='child_page')continue;
      const parsed=titleParts(p.child_page?.title);
      if(!parsed||parsed.chapter!==n)continue;
      const l=bySection.get(parsed.chapter+'-'+parsed.section);
      if(!l||parsed.title!==l.title)continue;
      const target=path.join(out,l.id+'.html');
      if(fs.existsSync(target)){kept++;continue;}
      const blocks=await children(p.id),date=teachingDate(blocks);
      if(!date)throw Error('Lesson '+l.id+' lacks valid explicit teaching date');
      const content=htmlFor(l,date,blocks);
      if(content.length<2500)throw Error('Generated lesson '+l.id+' too short');
      fs.mkdirSync(out,{recursive:true});
      fs.writeFileSync(target,content,'utf8');
      published++;
      console.log('Notion lesson '+l.id+' prepared for public Pages build, date '+date);
    }
  }
  console.log('Econometrics Notion import: '+published+' new full lessons; '+kept+' existing files preserved.');
}
if(require.main===module)main().catch(err=>{console.error(String(err));process.exitCode=1;});
module.exports={rich,convert,teachingDate,titleParts,htmlFor};
