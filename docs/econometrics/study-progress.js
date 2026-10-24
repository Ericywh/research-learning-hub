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


  // Render-only enhancements of the lesson body. The canonical progress tracker
  // below remains independent of the former "七、学习进度" lesson section.
  function polishLesson() {
    const root = document.querySelector("main");
    if (!root || root.dataset.econPolished === "true") return;
    root.dataset.econPolished = "true";

    // Future lessons imported at build time can still contain this obsolete
    // editorial progress section: remove that single section, not other material.
    const oldProgress = /^(?:(?:[一二三四五六七八九十]+|\d+)[、.．]\s*)?(?:学习进度|知识卡片与(?:学习)?进度|知识与进度)$/;
    for (const h of Array.from(root.querySelectorAll("h2,h3"))) {
      if (!oldProgress.test((h.textContent || "").replace(/\s+/g,"").trim())) continue;
      const section = h.closest("section");
      if (section && section !== root) section.remove();
      else {
        // Fallback for a lecture without section wrappers: remove this heading
        // and its siblings up to the next heading or navigation, not the footer.
        let next = h.nextSibling;
        while (next && !(next.nodeType === 1 && /^(H2|H3|NAV|FOOTER|SECTION)$/.test(next.nodeName))) {
          const after = next.nextSibling;
          next.remove();
          next = after;
        }
        h.remove();
      }
    }
    for (const a of root.querySelectorAll('a[href="#progress"]')) {
      const nav = a.closest("nav");
      if (nav) a.remove();
    }

    // A compact, low-contrast reading companion replaces visual repetition.
    const guide = document.createElement("aside");
    guide.className = "econ-reading-guide";
    guide.setAttribute("aria-label","本节阅读提示");
    const label = document.createElement("span");
    label.className = "econ-reading-guide-label";
    label.textContent = "READING COMPANION · 阅读指引";
    const line = document.createElement("p");
    line.textContent = "先建立直觉，再核对公式与数据，最后运行代码并独立作答。";
    const chips = document.createElement("div");
    chips.className = "econ-reading-guide-chips";
    for (const t of ["01 理解问题","02 核对模型","03 动手复现","04 自测后查看答案"]) {
      const chip = document.createElement("span");
      chip.textContent = t;
      chips.append(chip);
    }
    guide.append(label,line,chips);
    const first = root.querySelector(".cr-lesson-unit,section.paper,.econ-section");
    if (first && first.parentNode) first.parentNode.insertBefore(guide,first);
    else root.prepend(guide);

    // Exercise material is often stored in one <p> containing two questions
    // and two answers separated only by <br>. Split by explicit strong labels,
    // keeping each question visible and each answer behind its own <details>.
    const answerLabels = /^(?:参考答案|正确答案|答案|参考解答|答案解析|解析)\s*[：:]?$/;
    const questionLabels = /^(?:概念题|理论题|计算题|实操题|应用题|思考题|实操[／/]解释题|分析题)\s*[：:]?$/;
    function kind(node) {
      if (node.nodeType !== 1 || !/^(STRONG|B)$/.test(node.tagName)) return null;
      const t = (node.textContent || "").replace(/\s+/g,"").trim();
      if (answerLabels.test(t)) return "answer";
      if (questionLabels.test(t)) return "question";
      return null;
    }
    function makeAnswer(nodes, template) {
      const disclosure = document.createElement("details");
      disclosure.className = "econ-answer-fold";
      disclosure.open = false;
      const summary = document.createElement("summary");
      summary.textContent = "查看参考答案";
      const answerBody = document.createElement("div");
      answerBody.className = "econ-answer-content";
      const p = template.cloneNode(false);
      nodes.forEach(n => p.append(n));
      answerBody.append(p);
      disclosure.append(summary,answerBody);
      return disclosure;
    }
    for (const heading of root.querySelectorAll("h2,h3")) {
      if (!/练习|自测|习题|课后题|考核/.test(heading.textContent || "")) continue;
      const section = heading.closest("section");
      if (!section || !root.contains(section)) continue;
      for (const existing of section.querySelectorAll("details")) {
        if (!existing.classList.contains("cr-reader-codefold") &&
            !existing.classList.contains("code") &&
            !existing.classList.contains("econ-code-preview")) {
          existing.open = false;
          existing.classList.add("econ-existing-answer");
        }
      }
      for (const p of Array.from(section.querySelectorAll("p"))) {
        if (p.closest("details")) continue;
        const items = [...p.childNodes];
        if (!items.some(node => kind(node) === "answer")) continue;
        const parts = [];
        let current = {type:"question",nodes:[]};
        for (const node of items) {
          const label = kind(node);
          if (label && current.nodes.length) {
            parts.push(current);
            current = {type:label,nodes:[]};
          } else if (label) {
            current.type = label;
          }
          current.nodes.push(node);
        }
        if (current.nodes.length) parts.push(current);
        const fragment = document.createDocumentFragment();
        let finalAnswer = null;
        for (const part of parts) {
          if (part.type === "answer") {
            const disclosure = makeAnswer(part.nodes,p);
            fragment.append(disclosure);
            finalAnswer = disclosure;
          } else {
            const visible = p.cloneNode(false);
            part.nodes.forEach(n => visible.append(n));
            fragment.append(visible);
            finalAnswer = null;
          }
        }
        const following = p.nextElementSibling;
        p.replaceWith(fragment);
        // Some lessons put a list or Stata/Python code immediately after
        // a short "参考答案：" paragraph. Keep that continuation hidden too.
        if (finalAnswer) {
          let next = following;
          let movedCode = false;
          while (next && (
            /^(OL|UL|PRE)$/.test(next.tagName) ||
            (next.tagName === "DETAILS" && /^(cr-reader-codefold|econ-code-preview)$/.test(next.className)) ||
            (next.classList && next.classList.contains("cr-reader-codebar"))
          )) {
            const after = next.nextElementSibling;
            finalAnswer.querySelector(".econ-answer-content").append(next);
            movedCode = true;
            next = after;
          }
          if (movedCode && next?.tagName === "P" &&
              !Array.from(next.querySelectorAll("strong,b")).some(x =>
                /题\s*[：:]/.test(x.textContent || ""))) {
            finalAnswer.querySelector(".econ-answer-content").append(next);
          }
        }
      }
    }
  }

  function ready() { if (id) { polishLesson(); lesson(); } else catalog(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, {once:true});
  else ready();
})();
