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
