/* Reference portal: category filters, search, sort, and authentic browser-local progress. */
(()=>{"use strict";
const cards=[...document.querySelectorAll(".portal-card[data-course-progress]")];
const grid=document.getElementById("course-grid");
const filters=[...document.querySelectorAll("[data-group-filter]")];
const queryInput=document.getElementById("course-search"), searchPanel=document.getElementById("portal-search-panel"), searchButton=document.getElementById("header-search-button");
const searchClose=document.getElementById("search-close"), searchForm=document.getElementById("portal-search-panel");
const sort=document.getElementById("course-sort"), status=document.getElementById("filter-status"), empty=document.getElementById("no-results");
let active="all";
const ROOT="rlh:read:v1:";
const totals={math:73,econometrics:36,psm:10,frontier:23,cssci:16,classics:8,speaking:126,english:168};
const prefixes={math:ROOT+"math/lessons/",psm:ROOT+"psm-did/",frontier:ROOT+"frontier/",cssci:ROOT+"cssci/lessons/",classics:ROOT+"economic-classics/lessons/"};
function stored(prefix,acceptedValue="1"){const keys=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(prefix)&&localStorage.getItem(k)===acceptedValue)keys.push(k)}}catch(_){}return keys}
function count(id){
 if(prefixes[id])return Math.min(totals[id],stored(prefixes[id]).length);
 if(id==="econometrics"){
  const ids=new Set();
  try{for(const s of JSON.parse(localStorage.getItem("econ:v2:modules:completed:20261027")||"[]"))if(/^M(?:0[1-9]|[12][0-9]|3[0-6])$/.test(s))ids.add(s)}catch(_){}
  try{for(const s of Object.keys(JSON.parse(localStorage.getItem("research-learning-hub:econometrics:completed:v1")||"{}")))if(/^M(?:0[1-9]|[12][0-9]|3[0-6])$/.test(s))ids.add(s)}catch(_){}
  return Math.min(36,ids.size);
 }
 if(id==="speaking"){
  const ids=new Set();
  for(const k of stored("speaking:lesson-complete:v1:")){const name=k.slice("speaking:lesson-complete:v1:".length);if(/^(?:am|pm):day-(?:0[1-9]|[1-5][0-9]|6[0-3])$/.test(name))ids.add(name)}
  for(const k of stored("speaking-course-complete:v1:","yes")){const m=k.match(/\/speaking\/dual-track-2026\/(am|pm)\/day-(\d{2})\.html$/);if(m)ids.add(m[1]+":day-"+m[2])}
  return Math.min(126,ids.size);
 }
 if(id==="english"){
  const ids=new Set();
  for(const k of stored(ROOT+"english:lesson:")){const m=k.match(/english:lesson:(\d{3})$/);if(m){const n=Number(m[1]);if(n>=1&&n<=168)ids.add(n)}}
  for(const k of stored("english-week")){const m=k.match(/^english-week\d{2}-(\d{3})$/);if(m){const n=Number(m[1]);if(n>=1&&n<=168)ids.add(n)}}
  return Math.min(168,ids.size);
 }
 return 0;
}
function updateProgress(){
 for(const c of cards){const id=c.dataset.courseProgress,total=totals[id];if(!total)continue;const completed=count(id),pct=Math.round(completed/total*100);
 c.dataset.progressNumeric=String(completed/total);
 const label=c.querySelector("[data-progress-percent]"),fill=c.querySelector("[data-progress-fill]"),bar=c.querySelector('[role="progressbar"]');
 if(label)label.textContent=pct+"%";
 if(fill)fill.style.width=pct+"%";
 if(bar){bar.setAttribute("aria-valuenow",String(pct));bar.setAttribute("aria-valuetext","已完成 "+completed+" / "+total)}
 }}
function render(){
 const q=(queryInput?.value||"").trim().toLocaleLowerCase();
 let visible=0;
 for(const c of cards){const categories=(c.dataset.category||"").split(/\s+/),text=((c.dataset.fullTitle||"")+" "+c.textContent).toLocaleLowerCase();
 const match=(active==="all"||categories.includes(active))&&(!q||text.includes(q));
 c.hidden=!match;if(match)visible++}
 if(status)status.textContent="显示 "+visible+" / "+cards.length+" 门课程";
 if(empty)empty.hidden=visible!==0;
}
function sortCards(){
 const mode=sort?.value||"recommended";
 const sorted=[...cards].sort((a,b)=>mode==="progress"?Number(b.dataset.progressNumeric||0)-Number(a.dataset.progressNumeric||0)||Number(a.dataset.recommended)-Number(b.dataset.recommended):mode==="title"?a.querySelector("h3").textContent.localeCompare(b.querySelector("h3").textContent,"zh-CN"):Number(a.dataset.recommended)-Number(b.dataset.recommended));
 sorted.forEach(c=>grid?.appendChild(c));
 render();
}
filters.forEach(btn=>btn.addEventListener("click",()=>{active=btn.dataset.groupFilter;filters.forEach(b=>{const selected=b===btn;b.classList.toggle("selected",selected);b.setAttribute("aria-pressed",String(selected))});render()}));
queryInput?.addEventListener("input",render);
searchForm?.addEventListener("submit",e=>{e.preventDefault();render();document.getElementById("courses")?.scrollIntoView({behavior:"smooth"})});
function toggleSearch(show){if(!searchPanel||!searchButton)return;searchPanel.hidden=!show;searchButton.setAttribute("aria-expanded",String(show));if(show)queryInput?.focus()}
searchButton?.addEventListener("click",()=>toggleSearch(searchPanel.hidden));searchClose?.addEventListener("click",()=>toggleSearch(false));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!searchPanel?.hidden)toggleSearch(false)});
sort?.addEventListener("change",sortCards);
const details=document.getElementById("tools-panel");
function openTools(){if(details)details.open=true}
document.querySelectorAll("[data-open-tools]").forEach(a=>a.addEventListener("click",openTools));
document.getElementById("avatar-expand")?.addEventListener("click",()=>{if(details){details.open=!details.open;details.scrollIntoView({behavior:"smooth",block:"start"})}});
if(location.hash==="#study-tools"||location.hash==="#overview"||location.hash==="#motivation"||location.hash==="#goals-title")openTools();
window.addEventListener("hashchange",()=>{if(["#study-tools","#overview","#motivation","#goals-title"].includes(location.hash))openTools()});
window.addEventListener("pageshow",()=>{updateProgress();sortCards()});
window.addEventListener("storage",()=>{updateProgress();if(sort?.value==="progress")sortCards()});
window.addEventListener("speaking:progress-applied",updateProgress);
updateProgress();sortCards();
})();