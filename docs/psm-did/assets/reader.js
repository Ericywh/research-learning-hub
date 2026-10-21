
(function(){
 "use strict";
 var root=document.documentElement;
 function storeGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
 function storeSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
 var toggle=document.querySelector("[data-theme-toggle]");
 var saved=storeGet("psmdid-theme");
 if(saved==="dark"||saved==="light")root.setAttribute("data-theme",saved);
 function updateToggle(){if(!toggle)return;var t=root.getAttribute("data-theme");var dark=t==="dark"||(!t&&window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches);toggle.textContent=dark?"☀":"◐";toggle.setAttribute("aria-label",dark?"切换浅色模式":"切换深色模式");toggle.title=toggle.getAttribute("aria-label")}
 updateToggle();
 if(toggle)toggle.addEventListener("click",function(){var t=root.getAttribute("data-theme");if(!t)t=window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";var next=t==="dark"?"light":"dark";root.setAttribute("data-theme",next);storeSet("psmdid-theme",next);updateToggle()});
 var scale=Number(storeGet("psmdid-font")||1);if(!isFinite(scale))scale=1;
 function setScale(n){scale=Math.max(.90,Math.min(1.18,n));root.style.setProperty("--reader-size",(16*scale).toFixed(2)+"px");storeSet("psmdid-font",String(scale))}
 setScale(scale);
 var fontDown=document.querySelector("[data-text-down]"),fontUp=document.querySelector("[data-text-up]");
 if(fontDown)fontDown.addEventListener("click",function(){setScale(Math.round((scale-.06)*100)/100)});
 if(fontUp)fontUp.addEventListener("click",function(){setScale(Math.round((scale+.06)*100)/100)});
 var meter=document.querySelector(".reader-meter span");
 if(meter){var pending=false;function updateProgress(){var max=document.documentElement.scrollHeight-window.innerHeight;meter.style.transform="scaleX("+(max?Math.max(0,Math.min(1,window.scrollY/max)):1)+")";pending=false}
 window.addEventListener("scroll",function(){if(!pending){pending=true;requestAnimationFrame(updateProgress)}},{passive:true});window.addEventListener("resize",updateProgress);updateProgress()}
 var article=document.querySelector(".course-grid>main");if(!article)return;
 var listDesktop=document.getElementById("lesson-outline"),listMobile=document.getElementById("mobile-outline");
 var headings=Array.prototype.slice.call(article.querySelectorAll("h2"));
 headings.forEach(function(h,i){if(!h.id)h.id="section-"+String(i+1).padStart(2,"0");
 [listDesktop,listMobile].forEach(function(list){if(!list)return;var li=document.createElement("li"),a=document.createElement("a");a.href="#"+h.id;a.textContent=h.textContent.trim();li.appendChild(a);list.appendChild(li)})});
 var disclosure=document.querySelector(".mobile-outline");
 if(disclosure)disclosure.addEventListener("click",function(e){if(e.target.closest("a"))disclosure.open=false});
 if("IntersectionObserver" in window&&headings.length){var visible=new Set();
 var observer=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting)visible.add(e.target.id);else visible.delete(e.target.id)});
 var active=headings.filter(function(h){return visible.has(h.id)}).pop()||headings.filter(function(h){return h.getBoundingClientRect().top<=130}).pop();
 if(active)[listDesktop,listMobile].forEach(function(list){if(!list)return;list.querySelectorAll("a").forEach(function(a){var cur=a.getAttribute("href")==="#"+active.id;a.classList.toggle("current",cur);if(cur)a.setAttribute("aria-current","location");else a.removeAttribute("aria-current")})})
 },{rootMargin:"-88px 0px -69% 0px",threshold:0});
 headings.forEach(function(h){observer.observe(h)})}
 article.querySelectorAll("table").forEach(function(table){if(table.parentNode.classList.contains("table-scroll"))return;var wrap=document.createElement("div");wrap.className="table-scroll";wrap.tabIndex=0;wrap.setAttribute("role","region");wrap.setAttribute("aria-label","可横向滚动的数据表格");table.parentNode.insertBefore(wrap,table);wrap.appendChild(table)});
 article.querySelectorAll("pre").forEach(function(pre){if(pre.parentNode.classList.contains("code-shell"))return;
 var code=pre.textContent||"",rawclass=(pre.className||"")+" "+((pre.querySelector("code")||{}).className||"");
 var lang=/python/i.test(rawclass)||/\bimport pandas\b|\bfrom sklearn\b|\bimport numpy\b/.test(code)?"Python":/stata/i.test(rawclass)||/\bclear all\b|\bimport delimited\b|\bset more off\b/.test(code)?"Stata":"代码";
 var shell=document.createElement("div");shell.className="code-shell";
 var bar=document.createElement("div");bar.className="code-head";
 var label=document.createElement("span");label.textContent=lang+" / 完整示例";
 var actions=document.createElement("div");actions.className="actions";
 var expand=document.createElement("button");expand.type="button";expand.textContent="展开";expand.setAttribute("aria-label","展开或收起代码");
 expand.addEventListener("click",function(){var on=pre.classList.toggle("all-code");expand.textContent=on?"收起":"展开"});
 var copy=document.createElement("button");copy.type="button";copy.textContent="复制";
 copy.addEventListener("click",function(){if(!navigator.clipboard||!navigator.clipboard.writeText){copy.textContent="请手动选择";return}navigator.clipboard.writeText(code).then(function(){copy.textContent="已复制";setTimeout(function(){copy.textContent="复制"},1400)},function(){copy.textContent="复制失败"})});
 actions.appendChild(expand);actions.appendChild(copy);bar.appendChild(label);bar.appendChild(actions);
 pre.parentNode.insertBefore(shell,pre);shell.appendChild(bar);shell.appendChild(pre);
 });
})();
