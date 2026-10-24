/* Econometrics 120: private browser-only lesson completion records.
   No server writes, no automatic completion based on published lessons. */
(() => {
  "use strict";
  const KEY = "research-learning-hub:econometrics:completed:v1";
  const ID = /\/econometrics\/lessons\/(\d{2}-\d{2})\.html$/;
  const id = (location.pathname.match(ID) || [])[1];
  const isCatalog = /\/econometrics\/(?:index\.html)?$/.test(location.pathname);
  if (!id && !isCatalog) return;

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      if (!data || Array.isArray(data) || typeof data !== "object") return {};
      const valid = {};
      for (const [k, v] of Object.entries(data)) {
        if (/^\d{2}-\d{2}$/.test(k) && typeof v === "string" && !Number.isNaN(Date.parse(v))) valid[k] = v;
      }
      return valid;
    } catch (_) { return {}; }
  }

  function write(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (_) { return false; }
  }

  function lesson() {
    const main = document.querySelector("main");
    if (!main || document.getElementById("econ-complete-panel")) return;
    const panel = document.createElement("section");
    panel.id = "econ-complete-panel";
    panel.className = "econ-complete-panel";
    panel.setAttribute("aria-label", "本节个人学习记录");
    const tag = document.createElement("span");
    tag.className = "econ-complete-eyebrow";
    tag.textContent = "PERSONAL LEARNING RECORD / 个人学习记录";
    const heading = document.createElement("h2");
    heading.textContent = "这一节学完了吗？";
    const hint = document.createElement("p");
    hint.textContent = "阅读并练习后再标记。标记仅代表你的个人学习记录，不影响课程官方授课或归档进度。";
    const row = document.createElement("div");
    row.className = "econ-complete-actions";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "econ-complete-button";
    btn.setAttribute("aria-pressed", "false");
    const status = document.createElement("span");
    status.className = "econ-complete-message";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const link = document.createElement("a");
    link.className = "econ-complete-back";
    link.href = "../#catalog";
    link.textContent = "返回课程目录，查看个人进度 →";
    const note = document.createElement("p");
    note.className = "econ-complete-footnote";
    note.textContent = "仅保存在当前浏览器；清理网站数据、更换浏览器或设备后不会自动同步。";
    const paint = (data, announce = false) => {
      const checked = Boolean(data[id]);
      panel.dataset.completed = String(checked);
      btn.setAttribute("aria-pressed", String(checked));
      btn.textContent = checked ? "✓ 本节已学完 · 点击可撤销" : "○ 标记本节已学完";
      status.textContent = checked ? "已记录完成" + (announce ? " ✓" : "") : (announce ? "已撤销本节标记" : "尚未标记");
    };
    btn.addEventListener("click", () => {
      const data = read();
      if (data[id]) delete data[id];
      else data[id] = new Date().toISOString();
      if (write(data)) paint(data, true);
      else status.textContent = "保存失败：当前浏览器可能禁止本地存储，请检查浏览器设置。";
    });
    row.append(btn, status);
    panel.append(tag, heading, hint, row, link, note);
    main.append(panel);
    paint(read());
    window.addEventListener("storage", (event) => { if (event.key === KEY) paint(read()); });
  }

  function catalog() {
    const target = document.getElementById("catalog");
    const results = document.getElementById("results");
    if (!target || !results || document.getElementById("econ-my-learning")) return;
    const box = document.createElement("section");
    box.id = "econ-my-learning";
    box.className = "econ-my-learning";
    box.setAttribute("aria-label", "当前浏览器的个人学习进度");
    const eyebrow = document.createElement("span");
    eyebrow.className = "econ-complete-eyebrow";
    eyebrow.textContent = "MY PROGRESS · 个人阅读标记";
    const title = document.createElement("strong");
    const detail = document.createElement("p");
    const links = document.createElement("div");
    links.className = "econ-my-learning-links";
    const warning = document.createElement("small");
    warning.textContent = "与“已归档”不同：这里仅统计你主动点选的“已学完”，记录保存在当前浏览器。";
    box.append(eyebrow, title, detail, links, warning);
    const toolbar = target.querySelector(".toolbar");
    if (toolbar) toolbar.before(box);
    else results.before(box);
    const all = () => (window.ECON_COURSE?.chapters || []).flatMap(ch => ch.lessons || []);
    function refresh() {
      const data = read();
      const list = all();
      const known = new Set(list.map(x => x.id));
      const completed = list.filter(x => data[x.id]);
      title.textContent = "我的学习记录：" + completed.length + " / 120 节已学完";
      const last = completed.slice().sort((a, b) => Date.parse(data[b.id]) - Date.parse(data[a.id]))[0];
      detail.textContent = last ? "最近标记：全课程第" + last.number + "课 · " + last.title : "还没有个人完成记录。从任意已公开讲义末尾开始标记。";
      links.replaceChildren();
      if (last?.published && last.url) {
        const a = document.createElement("a");
        a.href = last.url;
        a.textContent = "回看最近学完的第" + last.number + "课 ↗";
        links.append(a);
      }
      const next = last
        ? list.find(x => x.number > last.number && x.published && x.url && !data[x.id])
        : list.find(x => x.published && x.url && !data[x.id]);
      if (next) {
        const a = document.createElement("a");
        a.href = next.url;
        a.textContent = "继续阅读：第" + next.number + "课 ↗";
        links.append(a);
      }
      for (const row of results.querySelectorAll(".lesson")) {
        const anchor = row.querySelector("a.name");
        const found = (anchor?.getAttribute("href") || "").match(/lessons\/(\d{2}-\d{2})\.html/);
        const num = row.querySelector(".num")?.textContent?.match(/DAY\s+(\d+)/i);
        const item = found ? list.find(x => x.id === found[1]) : num ? list.find(x => x.number === Number(num[1])) : null;
        const marked = Boolean(item && known.has(item.id) && data[item.id]);
        row.classList.toggle("econ-lesson-completed", marked);
        let indicator = row.querySelector(".econ-learned-mark");
        if (marked && !indicator) {
          indicator = document.createElement("span");
          indicator.className = "econ-learned-mark";
          indicator.textContent = "✓ 已学完";
          indicator.setAttribute("aria-label", "个人标记：已学完");
          row.append(indicator);
        } else if (!marked && indicator) indicator.remove();
      }
    }
    // The existing catalog redraws rows when searched or filtered.
    // Observe only that container; adding one badge causes at most one additional pass.
    const observer = new MutationObserver(() => refresh());
    observer.observe(results, {childList:true,subtree:true});
    refresh();
    window.addEventListener("load", refresh);
    window.addEventListener("storage", (event) => { if (event.key === KEY) refresh(); });
  }

  function ready() { if (id) lesson(); else catalog(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, {once:true});
  else ready();
})();
