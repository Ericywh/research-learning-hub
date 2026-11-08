#!/usr/bin/env node
'use strict';
/* Apply a consistent, course-specific visual system to copied Pages HTML.
 * This changes only generated _site files; authored lessons remain intact.
 */
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve('_site');
const themes={
  'econometrics':'econometrics',
  'math':'math',
  'cssci':'cssci',
  'frontier':'frontier',
  'economic-classics':'classics',
  'psm-did':'psm-did'
};
const asset=path.join(root,'assets','course-themes.css');
const readerCss=path.join(root,'assets','lesson-reader.css');
const readerJs=path.join(root,'assets','lesson-reader.js');
const progressJs=path.join(root,'econometrics','study-progress.js');
const progressCss=path.join(root,'econometrics','study-progress.css');
for(const p of [progressJs,progressCss]) {
  if(!fs.existsSync(p))throw Error('Missing econometrics completion asset: '+p);
}
for(const file of [readerCss,readerJs]){
  if(!fs.existsSync(file) || fs.statSync(file).size<4000)
    throw Error('Missing or unexpectedly short lesson reader asset: '+file);
}
if(!fs.existsSync(asset))throw Error('Course styles missing from build artifact: '+asset);
if(fs.statSync(asset).size<7000)throw Error('Course design system unexpectedly short');
const sha=(process.env.DEPLOY_SHA||'').slice(0,12).replace(/[^a-f0-9]/gi,'');
const counts={};
let total=0;let lessonTotal=0;
function scan(dir,files=[]){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,ent.name);
    if(ent.isDirectory())scan(file,files);
    else if(ent.isFile()&&ent.name.toLowerCase().endsWith('.html'))files.push(file);
  }
  return files;
}
for(const [directory,theme] of Object.entries(themes)){
  const courseRoot=path.join(root,directory);
  if(!fs.existsSync(courseRoot))throw Error('Expected course missing from site: '+directory);
  const pages=scan(courseRoot);
  if(pages.length<2)throw Error('Too few HTML pages for '+directory+': '+pages.length);
  let styled=0;let lessons=0;
  for(const file of pages){
    const original=fs.readFileSync(file,'utf8');
    // Revised lectures own their responsive layout. Preserve exact archive HTML.
    if(directory==='econometrics' &&
       (path.relative(courseRoot,file).split(path.sep).some(s=>s==='v2'||s==='archive') ||
        original.includes('name="course-revision"'))){
      styled++;
      continue;
    }
    // PSM-DID uses its own static, speaking-inspired lesson layout. Do not
    // inject the shared reader: its runtime TOC/card wrappers overlap our
    // existing directory and can hide the published lesson body.
    if(directory==='psm-did'){
      if(!/<body\b/i.test(original) || !/<\/body>/i.test(original))
        throw Error('PSM-DID source HTML is invalid: '+file);
      const lesson=path.resolve(file)!==path.join(courseRoot,'index.html');
      if(lesson && (!original.includes('speaking-layout.css') ||
                    !original.includes('class="speaking-study"') ||
                    !original.includes('class="study-layout"')))
        throw Error('PSM-DID independent lesson layout missing: '+file);
      if(/data-course-theme=|data-course-lesson=|lesson-reader\.js|course-themes\.css/.test(original))
        throw Error('PSM-DID must not load global reader assets: '+file);
      styled++;
      continue;
    }
    if(!/<head\b[^>]*>/i.test(original)||!/<\/head\s*>/i.test(original)||!/<body\b/i.test(original)){
      throw Error('HTML structure cannot be themed: '+path.relative(root,file));
    }
    if(/data-course-theme\s*=/.test(original)||/course-themes\.css/.test(original)){
      throw Error('Unexpected prethemed lesson in source: '+path.relative(root,file));
    }
    const href=path.relative(path.dirname(file),asset).split(path.sep).join('/');
    const target=path.resolve(path.dirname(file),href);
    if(target!==asset)throw Error('Asset link escaped expected build directory');
    const link='<link rel="stylesheet" href="'+href+(sha?'?v='+sha:'')+'">';
    const isLesson=path.resolve(file)!==path.join(courseRoot,'index.html');
    const extra=isLesson?
      '<link rel="stylesheet" href="'+path.relative(path.dirname(file),readerCss).split(path.sep).join('/')+(sha?'?v='+sha:'')+'">'+
      '<script defer src="'+path.relative(path.dirname(file),readerJs).split(path.sep).join('/')+(sha?'?v='+sha:'')+'"><\\/script>'.replace('\\/','/'):
      '';
    const progress=directory==='econometrics'?
      '<link rel="stylesheet" href="'+path.relative(path.dirname(file),progressCss).split(path.sep).join('/')+(sha?'?v='+sha:'')+'">'+
      '<script defer src="'+path.relative(path.dirname(file),progressJs).split(path.sep).join('/')+(sha?'?v='+sha:'')+'"></script>':
      '';
    let html=original.replace(/<\/head\s*>/i,link+'\\n'+extra+'\\n'+progress+'\\n</head>');
    html=html.replace(/<body(\s[^>]*?)?>/i,(_,attrs='')=>'<body'+attrs+' data-course-theme="'+theme+'">');
    if(isLesson){
      const home=path.relative(path.dirname(file),path.join(courseRoot,'index.html')).split(path.sep).join('/');
      html=html.replace('data-course-theme="'+theme+'"','data-course-theme="'+theme+'" data-course-lesson="true" data-course-home="'+home+'"');
      if(!html.includes('lesson-reader.js')||!html.includes('lesson-reader.css'))throw Error('Lesson reader missing: '+file);
      lessons++;
    }
    if(!html.includes(link)||!html.includes('data-course-theme="'+theme+'"'))
      throw Error('Failed style injection: '+file);
    fs.writeFileSync(file,html,'utf8');styled++;
  }
  counts[directory]=styled;total+=styled;lessonTotal+=lessons;
}
if(lessonTotal<45)throw Error('Too few enhanced lessons: '+lessonTotal);
console.log('Course design system applied to '+total+' HTML pages:',JSON.stringify(counts));
console.log('Lesson reader enhanced '+lessonTotal+' independently published lesson HTML pages.');


// Selected burgundy/lilac course designs; source lesson bodies are not modified.
// Apply after the existing general styling, including revised econometrics modules.
const selectedCss={
  speaking:path.join(root,'assets','selected-burgundy.css'),
  econometrics:path.join(root,'assets','selected-lilac.css')
};
const selectedJS=path.join(root,'assets','selected-course-ui.js');
for(const assetFile of [...Object.values(selectedCss),selectedJS]){
 if(!fs.existsSync(assetFile) || fs.statSync(assetFile).size<4000)
   throw Error('Missing approved course design asset: '+assetFile);
}
const selectedCounts={};
for(const course of ['speaking','econometrics']){
 const courseRoot=path.join(root,course);
 if(!fs.existsSync(courseRoot))throw Error('Selected course missing: '+course);
 let n=0;
 for(const file of scan(courseRoot)){
   const rel=path.relative(courseRoot,file).split(path.sep).join('/');
   if(course==='econometrics' && rel.startsWith('archive/'))continue;
   const original=fs.readFileSync(file,'utf8');
   if(!/<head\b[^>]*>/.test(original)||!/<\/head\s*>/i.test(original)||!/<body\b/i.test(original))
     throw Error('Invalid selected course HTML: '+file);
   if(/data-selected-theme=|selected-course-ui\.js|selected-burgundy\.css|selected-lilac\.css/.test(original))
     throw Error('Selected theme source already injected: '+file);
   const href=path.relative(path.dirname(file),selectedCss[course]).split(path.sep).join('/');
   const jsHref=path.relative(path.dirname(file),selectedJS).split(path.sep).join('/');
   const marker=course==='speaking'?'burgundy':'lilac';
   const css='<link rel="stylesheet" href="'+href+(sha?'?v='+sha:'')+'" data-selected-course-css="'+marker+'">';
   const js='<script defer src="'+jsHref+(sha?'?v='+sha:'')+'"></script>';
   let html=original.replace(/<\/head\s*>/i,css+'\n'+js+'\n</head>');
   html=html.replace(/<body(\s[^>]*?)?>/i,(_,attrs='')=>
     '<body'+attrs+' data-selected-theme="'+marker+'">');
   if(!html.includes('data-selected-theme="'+marker+'"')||!html.includes('selected-course-ui.js'))
     throw Error('Selected theme injection failed: '+file);
   fs.writeFileSync(file,html,'utf8');
   n++;
 }
 if(n<12)throw Error('Too few selected pages: '+course+' '+n);
 selectedCounts[course]=n;
}
console.log('Selected visual designs deployed without altering lecture bodies:',JSON.stringify(selectedCounts));


// ECONOMETRICS SCREENSHOT BUILD: add accessible three-column course layout
// to original 120-lesson pages and to the independent 36-module extension.
// Use the checked-in catalog as the only 120-lesson syllabus; do not modify it.
{
 const style=path.join(root,'assets','econ-screenshot.css');
 const interaction=path.join(root,'assets','econ-screenshot.js');
 for(const asset of [style,interaction]){
   if(!fs.existsSync(asset)||fs.statSync(asset).size<6000)
     throw Error('Econometrics screenshot asset missing or unexpectedly short: '+asset);
 }
 const catalogText=fs.readFileSync(path.join('docs','econometrics','catalog.js'),'utf8');
 if(!catalogText.includes('window.ECON_COURSE'))throw Error('Canonical course data missing');
 const catalog=JSON.parse(catalogText.slice(catalogText.indexOf('{'),catalogText.lastIndexOf('}')+1));
 if(catalog.chapters.length!==10||catalog.chapters.flatMap(c=>c.lessons).length!==120)
   throw Error('Econometrics catalog must remain ten chapters / 120 lessons');
 const modules=[];
 for(let i=1;i<=36;i++){
   const id='M'+String(i).padStart(2,'0');
   const page=fs.readFileSync(path.join('docs','econometrics','v2','modules',id+'.html'),'utf8');
   const title=page.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
   if(!title)throw Error('Optional module title missing: '+id);
   modules.push({id,week:Math.ceil(i/6),title:title.replace(/^M\d\d\s*[·:：—-]\s*/,'').replace(/&amp;/g,'&').trim()});
 }
 const map={
   chapters:catalog.chapters.map(ch=>({
     number:ch.number,title:ch.title,
     lessons:ch.lessons.map(l=>({
       id:l.id,number:l.number,chapter:l.chapter,section:l.section,
       title:l.title,published:l.published===true,url:l.url||null
     }))
   })),
   modules,
   weekTitles:['线性模型与投影','大样本与稳健推断','内生性、IV与GMM',
               'MLE与选择模型','面板与政策评估','RDD、时间序列与复现']
 };
 const mapFile=path.join(root,'assets','econ-screenshot-map.js');
 fs.writeFileSync(mapFile,'window.ECON_SCREENSHOT_MAP='+JSON.stringify(map).replace(/</g,'\\u003c')+';\n','utf8');
 const econRoot=path.join(root,'econometrics');
 let count=0,lessons=0,modulesCount=0;
 for(const file of scan(econRoot)){
   const rel=path.relative(econRoot,file).split(path.sep).join('/');
   const lesson=/^lessons\/\d\d-\d\d\.html$/.test(rel);
   const module=/^v2\/modules\/M\d\d\.html$/.test(rel);
   if(!lesson&&!module&&rel!=='index.html'&&rel!=='v2/index.html')continue;
   const original=fs.readFileSync(file,'utf8');
   if(!original.includes('data-selected-theme="lilac"'))
     throw Error('Selected lilac design must load before screenshot layout: '+rel);
   if(!/<\/head>/i.test(original)||!/<body\b/i.test(original))
     throw Error('Cannot enhance invalid HTML: '+rel);
   const relative=asset=>path.relative(path.dirname(file),asset).split(path.sep).join('/');
   const query=sha?'?v='+sha:'';
   const links=[
     '<link rel="stylesheet" href="'+relative(style)+query+'" data-econ-screenshot-style>',
     '<script defer src="'+relative(mapFile)+query+'"></script>',
     '<script defer src="'+relative(interaction)+query+'"></script>'
   ].join('\n');
   const html=original.replace(/<\/head\s*>/i,links+'\n</head>');
   if(html===original||!html.includes('econ-screenshot-map.js')||!html.includes('econ-screenshot.css'))
     throw Error('Screenshot design not inserted: '+rel);
   fs.writeFileSync(file,html,'utf8');
   count++;if(lesson)lessons++;if(module)modulesCount++;
 }
 if(lessons!==120||modulesCount!==36||count!==158)
   throw Error('Incomplete screenshot enhancement: '+JSON.stringify({count,lessons,modulesCount}));
 console.log('Econometrics screenshot reference applied:',JSON.stringify({pages:count,lessons,modules:modulesCount,indices:2}));
}
