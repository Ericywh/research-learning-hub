#!/usr/bin/env node
'use strict';
/* Publish PSM-DID mathematics as STATIC KaTeX HTML + MathML.
 * Motivation: client MathJax config and third-party script availability have
 * left raw TeX delimiters visible on some lesson pages.
 * Only edits _site build artifacts, never authored lesson content.
 */
const fs = require('node:fs');
const path = require('node:path');
const katex = require('katex');
const site = path.resolve('_site/psm-did');
const cssDir = path.join(site,'assets');
const srcCss = path.join(path.dirname(require.resolve('katex')),'katex.min.css');
const srcFonts = path.join(path.dirname(srcCss),'fonts');
fs.mkdirSync(cssDir,{recursive:true});
fs.copyFileSync(srcCss,path.join(cssDir,'katex.min.css'));
fs.cpSync(srcFonts,path.join(cssDir,'fonts'),{recursive:true});
let pages=0,display=0,inline=0;
const escapeEntities = tex=>tex
 .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')
 .replace(/&quot;/g,'"').replace(/&#39;|&#x27;/gi,"'");
function math(tex,isDisplay,file){
  let markup;
  try {
    markup=katex.renderToString(escapeEntities(tex),{
      displayMode:isDisplay,throwOnError:true,strict:'ignore',
      trust:false,output:'htmlAndMathml',macros:{}
    });
  } catch(err) {
    throw new Error('Invalid TeX in '+file+': '+JSON.stringify(tex.slice(0,160))+' -- '+err.message);
  }
  if(isDisplay)display++;else inline++;
  return markup;
}
const pageList=[];
for(const chapter of fs.readdirSync(site)) {
  if(!/^chapter-\d\d$/.test(chapter))continue;
  for(const lesson of fs.readdirSync(path.join(site,chapter))) {
    if(!/^lesson-\d\d$/.test(lesson))continue;
    const file=path.join(site,chapter,lesson,'index.html');
    if(fs.existsSync(file))pageList.push(file);
  }
}
if(pageList.length!==10)throw Error('Expected 10 PSM-DID lessons, found '+pageList.length);
for(const file of pageList){
  let html=fs.readFileSync(file,'utf8');
  if(!html.includes('class="speaking-study"'))throw Error('Unexpected PSM-DID lesson template: '+file);
  // Remove obsolete MathJax bootstrapping from the BUILT page only.
  html=html.replace(/<script>\s*window\.MathJax\s*=[\s\S]*?<\/script>\s*/gi,'');
  html=html.replace(/<script\b[^>]*src="https:\/\/cdn\.jsdelivr\.net\/npm\/mathjax@3\/es5\/tex-chtml\.js"[^>]*><\/script>\s*/gi,'');
  // Code examples must never be math-rendered.
  const holds=[];
  html=html.replace(/<(?:pre|script|style)\b[^>]*>[\s\S]*?<\/(?:pre|script|style)>/gi,block=>{
    const token='@@PSMDID-PROTECTED-'+holds.length+'@@';holds.push(block);return token;
  });
  // Historical inline math such as $<code>Y_1(1)</code>$ is textual math,
  // not a programming example. Keep the larger <pre> blocks protected.
  html=html.replace(/\$<code\b[^>]*>([^<]+)<\/code>\$/g,(_,tex)=>'$'+tex+'$');
  html=html.replace(/\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g,(_,dollar,bracket)=>
    math(dollar??bracket,true,file));
  html=html.replace(/(?<!\\)\$([^$<>\n]{1,300})\$/g,(_,tex)=>math(tex,false,file));
  html=html.replace(/\\\(([^<>\n]+?)\\\)/g,(_,tex)=>math(tex,false,file));
  html=html.replace(/@@PSMDID-PROTECTED-(\d+)@@/g,(_,number)=>holds[Number(number)]);
  if(holds.length===0)throw Error('Lost code blocks in '+file);
  const css='<link rel="stylesheet" href="../../assets/katex.min.css">';
  if(!html.includes('</head>'))throw Error('Missing head: '+file);
  html=html.replace('</head>',css+'</head>');
  if(/<div class="(?:formula|math-display|equation)">\s*(?:\\\[|\$\$)/.test(html))
    throw Error('Raw display TeX survived in '+file);
  fs.writeFileSync(file,html,'utf8');
  pages++;
}
if(display<10)throw Error('Unexpectedly few math displays: '+display);
console.log('Static PSM-DID KaTeX: '+pages+' pages, '+display+' display formulas, '+inline+' inline formulas.');
