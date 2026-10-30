/* Reading status | Research Learning Hub
   A deliberate read/unread toggle, separate from course exercise completion.
   Persisted locally. No external requests, tracking or accounts. */
(() => {
  "use strict";
  if (window.__rlhReadingStatusLoaded) return;
  window.__rlhReadingStatusLoaded = true;
  const PREFIX = "rlh:read:v1:";
  const ROOT = /\/research-learning-hub\//;
  const allowed = [
    /\/math\/lessons\/[^/]+\.html$/,
    /\/econometrics\/(?:v2\/modules\/M\d{2}|lessons\/\d{2}-\d{2})\.html$/,
    /\/speaking\/(?:dual-track-2026\/(?:am|pm)\/day-\d{2}|lessons\/\d{2}-\d{2})\.html$/,
    /\/psm-did\/chapter-\d{2}\/lesson-\d{2}\/$/,
    /\/cssci\/lessons\/[^/]+\.html$/,
    /\/frontier\/20\d{2}-\d{2}-\d{2}(?:-\d{2})?\.html$/,
    /\/economic-classics\/lessons\/[^/]+\.html$/
  ];
  const english = /\/english\/(?:index\.html|week-\d{2}\.html)?$/;
  const isAllowed = path => allowed.some(re => re.test(path));
  function canonical(url) {
    try {
      const u = new URL(url, location.href);
      if (u.origin !== location.origin || !ROOT.test(u.pathname)) return null;
      let path = decodeURIComponent(u.pathname).replace(/\/index\.html$/, "/");
      if (english.test(path) && /^#lesson-\d{1,3}$/.test(u.hash)) {
        // English week selectors include lesson IDs in the URL fragment.
        return "english:lesson:" + String(Number(u.hash.slice(8))).padStart(3,"0");
      }
      if (!isAllowed(path)) return null;
      return path.replace(/^.*?\/research-learning-hub\//, "");
    } catch (_) { return null; }
  }
  function currentLesson() {
    const lesson = canonical(location.href);
    if (lesson) return lesson;
    return null;
  }
  function stored(id) {
    try { return localStorage.getItem(PREFIX + id) === "1"; }
    catch (_) { return false; }
  }
  function save(id, yes) {
    try { if (yes) localStorage.setItem(PREFIX + id, "1"); else localStorage.removeItem(PREFIX + id); return true; }
    catch (_) { return false; }
  }
  const CSS = `
    .rlh-read-control{display:inline-flex;align-items:center;gap:7px;flex-wrap:wrap;margin:6px 0 6px 10px;vertical-align:middle;position:relative;z-index:2}
    .rlh-read-toggle{font:650 12px/1.4 system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif!important;
      background:#fff!important;color:#37465f!important;border:1px solid #aeb9cc!important;
      border-radius:999px!important;padding:6px 11px!important;white-space:nowrap!important;cursor:pointer!important;
      box-shadow:0 2px 7px rgba(36,55,87,.08)!important;max-width:100%}
    .rlh-read-toggle:hover{background:#eef3fc!important;border-color:#778cbd!important}
    .rlh-read-toggle[aria-pressed="true"]{background:#e4f4ec!important;border-color:#83b8a1!important;color:#18583e!important}
    .rlh-read-toggle:focus-visible{outline:3px solid #759cc5!important;outline-offset:2px!important}
    .rlh-read-panel{margin:24px auto 20px;padding:18px 20px;max-width:960px;
      background:linear-gradient(120deg,#f3f6ff,#f0f9f5)!important;border:1px solid #c5d7df!important;
      border-radius:16px!important;color:#25354f!important;box-shadow:0 8px 22px rgba(46,66,94,.09)!important}
    .rlh-read-panel h2{font:750 19px/1.5 system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif!important;
      color:#24364b!important;margin:0 0 8px!important}
    .rlh-read-panel p{font:400 12px/1.7 system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif!important;
      margin:0 0 10px!important;color:#52627b!important}
    .rlh-read-panel .rlh-read-control{margin:0}
    .rlh-read-progress{font:650 12px/1.55 system-ui,-apple-system,"PingFang SC",sans-serif!important;
      color:#334d70!important;background:rgba(255,255,255,.78)!important;border:1px solid #cbd5e7!important;
      padding:8px 12px!important;border-radius:12px!important;display:inline-block;margin:12px 0!important}
    @media(max-width:650px){.rlh-read-control{margin-left:6px;margin-right:4px}.rlh-read-toggle{font-size:11px!important;padding:6px 9px!important}}
  `;
  const style = document.createElement("style");
  style.id = "rlh-read-styles";
  style.textContent = CSS;
  document.head.appendChild(style);
  const buttons = new Map();
  let progress;
  function register(id, button) {
    let list = buttons.get(id);
    if (!list) { list = new Set(); buttons.set(id,list); }
    list.add(button);
    update(id);
  }
  function update(id) {
    for (const el of buttons.get(id) || []) {
      const yes = stored(id);
      el.setAttribute("aria-pressed", String(yes));
      el.textContent = yes ? "✓ 已阅读" : "○ 未阅读";
      el.setAttribute("aria-label", (yes ? "撤销已阅读标记：" : "标记为已阅读：") + (el.dataset.lessonTitle || "本课"));
      el.title = yes ? "点击恢复未阅读" : "点击标记本课已阅读";
    }
  }
  function refreshProgress() {
    if (!progress) return;
    const ids = new Set([...buttons.keys()]);
    let count = 0;
    ids.forEach(id => { if (stored(id)) count++; });
    progress.textContent = "本页已阅读 " + count + " / " + ids.size + " 项 · 状态仅保存在此浏览器";
  }
  function makeToggle(id, title) {
    const wrap = document.createElement("span");
    wrap.className = "rlh-read-control";
    const b = document.createElement("button");
    b.className = "rlh-read-toggle";
    b.type = "button";
    b.dataset.lessonTitle = title.slice(0,100);
    b.addEventListener("click", e => {
      e.preventDefault(); e.stopPropagation();
      if (!save(id, !stored(id))) {
        window.alert("无法保存阅读状态。请检查浏览器的存储权限。"); return;
      }
      update(id); refreshProgress();
    });
    wrap.appendChild(b); register(id,b);
    return wrap;
  }
  function ensureEnglishToggle() {
    if (!/\/english\//.test(location.pathname)) return;
    const el = document.getElementById("lesson-number");
    if (!el) return;
    const match = el.textContent.match(/第\s*(\d+)\s*课/);
    if (!match) return;
    const id = "english:lesson:" + String(Number(match[1])).padStart(3,"0");
    const prior = document.querySelector(".rlh-english-current");
    if (prior && prior.dataset.readId === id) return;
    if (prior) prior.remove();
    const control = makeToggle(id, "英语表达第" + match[1] + "课");
    control.classList.add("rlh-english-current");
    control.dataset.readId = id;
    el.insertAdjacentElement("afterend", control);
  }
  function scan() {
    const root = document.querySelector("main") || document.body;
    for (const a of root.querySelectorAll("a[href]:not([data-rlh-read-scanned])")) {
      a.dataset.rlhReadScanned = "1";
      const id = canonical(a.getAttribute("href"));
      if (!id) continue;
      // Keep buttons distinct from source links and other completion checkboxes.
      const title = a.textContent.trim().replace(/\s+/g," ") || id;
      const parent = a.parentElement;
      if (!parent) continue;
      const holder = makeToggle(id, title);
      a.insertAdjacentElement("afterend", holder);
    }
    ensureEnglishToggle();
    if (!currentLesson() && buttons.size && !progress) addProgress();
    refreshProgress();
  }
  function addProgress() {
    const root = document.querySelector("#catalog") || document.querySelector("#courses") ||
      document.querySelector("main") || document.body;
    progress = document.createElement("p");
    progress.className = "rlh-read-progress";
    progress.setAttribute("role","status");
    progress.setAttribute("aria-live","polite");
    if (root.id === "catalog" || root.id === "courses") root.insertAdjacentElement("afterbegin",progress);
    else root.insertAdjacentElement("afterbegin",progress);
    refreshProgress();
  }
  function addCurrentLesson() {
    const id = currentLesson();
    if (!id || document.querySelector("[data-rlh-current-lesson]")) return;
    const main = document.querySelector("main") || document.querySelector("article");
    if (!main) return;
    const panel = document.createElement("section");
    panel.className = "rlh-read-panel";
    panel.dataset.rlhCurrentLesson = "1";
    panel.setAttribute("aria-label","阅读状态");
    const h = document.createElement("h2"); h.textContent = "本课阅读记录";
    const p = document.createElement("p"); p.textContent = "读完后点击标记；再次点击可撤销。阅读记录保存在当前浏览器，与训练完成情况分开。";
    panel.append(h,p,makeToggle(id,document.title));
    main.appendChild(panel);
  }
  function init() {
    if (!document.body) return;
    addCurrentLesson();
    // Catalog pages: list entries get an independent read/unread control.
    scan();
    let scheduled = false;
    const observer = new MutationObserver(muts => {
      if (scheduled || !muts.some(m => (m.type === "characterData" && m.target.parentElement?.closest?.("#lesson-number")) || (m.type === "childList" && (m.target.id === "lesson-number" || [...m.addedNodes].some(n => n.nodeType === 1 && !n.classList?.contains("rlh-read-control")))))) return;
      scheduled=true;
      requestAnimationFrame(() => { scheduled=false;scan(); });
    });
    observer.observe(document.querySelector("main") || document.body,{childList:true,subtree:true});
    window.addEventListener("storage", e => {
      if (e.key && e.key.startsWith(PREFIX)) { buttons.forEach((_,id) => update(id));refreshProgress(); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();