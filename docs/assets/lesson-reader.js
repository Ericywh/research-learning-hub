/* Research Learning Hub | Lesson Reader 2026-10-21
 * Enhances only published lesson pages. Never removes lesson content.
 * Keeps original links, formulas, Stata/Python samples and answers.
 */
(() => {
  "use strict";
  const ready = () => {
    const body = document.body;
    if (!body || body.getAttribute("data-course-lesson") !== "true") return;
    const main = document.querySelector("main");
    const fallback = document.querySelector("article.sheet");
    if (!main && !fallback) return;

    const root = (main && (
      main.querySelector(".layout > article") ||
      main.querySelector(".body > article") ||
      main.querySelector(".layout > div:not(.side):not(.toc)") ||
      main.querySelector("article.article")
    )) || fallback || main;
    if (!root) return;
    body.classList.add("cr-reader-ready");
    root.classList.add("cr-lesson-content");
    if (main) main.classList.add("cr-reader-main");

    // Group top-level headings into individually styled cards.
    // Existing <section> wrappers remain untouched, so their IDs and links work.
    let units = Array.from(root.children).filter(el =>
      el.tagName === "SECTION" &&
      !el.classList.contains("hero") &&
      !el.classList.contains("intro") &&
      (el.querySelector(":scope > h2") || el.querySelector(":scope > h3"))
    );
    if (units.length < 2) {
      const children = Array.from(root.children);
      const h2 = children.filter(el => el.tagName === "H2").length;
      const h3 = children.filter(el => el.tagName === "H3").length;
      const level = h2 >= 2 ? "H2" : h3 >= 2 ? "H3" : null;
      if (level) {
        let current = null;
        for (const node of Array.from(root.childNodes)) {
          if (node.nodeType === 1 && node.tagName === level) {
            current = document.createElement("section");
            current.className = "cr-lesson-unit";
            root.insertBefore(current, node);
            current.appendChild(node);
          } else if (current && node.nodeType === 1 &&
                     /^(NAV|FOOTER|HEADER)$/.test(node.tagName)) {
            current = null;
          } else if (current) {
            current.appendChild(node);
          }
        }
      }
      units = Array.from(root.children).filter(el =>
        el.classList.contains("cr-lesson-unit") ||
        (el.tagName === "SECTION" &&
         !el.classList.contains("hero") &&
         !el.classList.contains("intro") &&
         (el.querySelector(":scope > h2") || el.querySelector(":scope > h3")))
      );
    }
    if (units.length < 2) {
      // Some older pages have direct, independent paper sections.
      units = Array.from(root.children).filter(el =>
        el.tagName === "SECTION" && el.querySelector("h2, h3"));
    }

    const themes = [
      ["#5266d3", "#edf0ff"],
      ["#118e87", "#ebfaf6"],
      ["#c08a38", "#fff7e8"],
      ["#b85486", "#fff0f7"],
      ["#7652b7", "#f4efff"]
    ];
    const toc = [];
    for (const unit of units) {
      const heading = unit.querySelector(":scope > h2, :scope > h3") ||
                      unit.querySelector("h2, h3");
      if (!heading) continue;
      const n = toc.length;
      const clean = (heading.textContent || "").trim().replace(/\s+/g, " ");
      if (!clean) continue;
      const anchor = heading.id || unit.id || "course-section-" + String(n + 1).padStart(2, "0");
      if (!heading.id && !unit.id) heading.id = anchor;
      const swatch = themes[n % themes.length];
      unit.classList.add("cr-lesson-unit");
      unit.style.setProperty("--cr-unit-ink", swatch[0]);
      unit.style.setProperty("--cr-unit-soft", swatch[1]);
      unit.setAttribute("data-cr-number", String(n + 1).padStart(2, "0"));
      unit.setAttribute("data-cr-variant", /练习|自测|题目|复习|思考|答案/.test(clean) ?
        "practice" : /Stata|Python|代码|实现|实操|软件/.test(clean) ?
        "coding" : /公式|理论|模型|推断/.test(clean) ? "theory" : "reading");
      heading.classList.add("cr-unit-heading");
      heading.setAttribute("data-reader-anchor", anchor);
      toc.push({ anchor, label: clean.length > 34 ? clean.slice(0, 33) + "…" : clean, unit });
    }
    if (!toc.length) return;

    // Create a compact navigation strip and responsive chapter index.
    const header = document.createElement("div");
    header.className = "cr-reader-banner";
    const a = document.createElement("a");
    a.href = body.getAttribute("data-course-home") || "../";
    a.className = "cr-reader-home";
    a.textContent = "↖ 返回课程目录";
    const label = document.createElement("span");
    label.className = "cr-reader-banner-title";
    label.textContent = "逐节精读  /  课程阅读器";
    const page = document.createElement("span");
    page.className = "cr-reader-total";
    page.textContent = toc.length + " 个知识板块";
    header.append(a, label, page);

    const nav = document.createElement("nav");
    nav.className = "cr-reader-toc";
    nav.setAttribute("aria-label", "本节课知识板块导航");
    const navTitle = document.createElement("div");
    navTitle.className = "cr-reader-toc-title";
    navTitle.textContent = "ON THIS LESSON";
    const links = document.createElement("div");
    links.className = "cr-reader-toc-links";
    const tocLinks = [];
    toc.forEach((item, i) => {
      const link = document.createElement("a");
      link.href = "#" + encodeURIComponent(item.anchor);
      link.setAttribute("data-reader-nav", item.anchor);
      const digit = document.createElement("span");
      digit.className = "cr-reader-toc-digit";
      digit.textContent = String(i + 1).padStart(2, "0");
      const text = document.createElement("span");
      text.textContent = item.label;
      link.append(digit, text);
      link.addEventListener("click", ev => {
        ev.preventDefault();
        item.unit.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ?
            "instant" : "smooth",
          block: "start"
        });
        if (history.replaceState) history.replaceState(null, "", "#" + encodeURIComponent(item.anchor));
      });
      links.append(link);
      tocLinks.push(link);
    });
    nav.append(navTitle, links);

    const meter = document.createElement("div");
    meter.className = "cr-reader-progress";
    meter.setAttribute("aria-hidden", "true");
    const meterFill = document.createElement("div");
    meterFill.className = "cr-reader-progress-fill";
    meter.append(meterFill);

    const point = main || fallback;
    point.parentNode.insertBefore(header, point);
    point.parentNode.insertBefore(nav, point);
    body.append(meter);

    const back = document.createElement("button");
    back.type = "button";
    back.className = "cr-reader-up";
    back.setAttribute("aria-label", "返回本课顶部");
    back.textContent = "↑";
    back.addEventListener("click", () => window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ?
        "instant" : "smooth"
    }));
    body.append(back);

    // Preserve original Stata and Python code while making each example
    // a native, keyboard-accessible disclosure that is closed on first load.
    // Non-Stata/Python blocks and scripts not running JS remain visible.
    const findCodeLanguage = (pre,code) => {
      const className = typeof code?.className === "string" ? code.className : "";
      const tagged = className.match(/(?:^|\s)language-(stata|python)(?=\s|$)/i);
      if (tagged) return tagged[1].toLowerCase();
      const source = (code || pre).textContent || "";
      // Match code syntax before nearby prose, since old archives have
      // incorrect language-javascript tags on Stata blocks.
      if (/(?:^|\n)\s*(?:import\s+(?:numpy|pandas|matplotlib|statsmodels)\b|from\s+(?:numpy|pandas|matplotlib|statsmodels)\s+import\b)/m.test(source) ||
          /\b(?:pd\.read_stata|sm\.OLS|smf\.ols|np\.log|pandas\.DataFrame)\s*\(/.test(source)) return "python";
      if (/(?:^|\n)\s*(?:sysuse\s+|regress\s+|xtreg\s+|ivregress\s+|bysort\s+|egen\s+|generate\s+|keep\s+if\s+|vce\(robust\)|clear\s+all\s*$)/m.test(source) ||
          /(?:^|\n)\s*\*\s*[^\n]*Stata/i.test(source)) return "stata";
      // A few preformatted examples have no language class or distinctive
      // syntax. Their immediately preceding code label is authoritative.
      let previous = pre.previousElementSibling;
      for (let n=0;previous && n<5;n++,previous=previous.previousElementSibling) {
        if (previous.matches("pre,.cr-reader-codebar,details")) break;
        const label = previous.textContent?.trim().replace(/\s+/g," ") || "";
        if (/^(?:\d+(?:\.\d+)?[\s.:、-]*)?Stata(?:\s*代码|\s*示例|\s*实现|[：:])?$/i.test(label)) return "stata";
        if (/^(?:\d+(?:\.\d+)?[\s.:、-]*)?Python(?:\s*代码|\s*示例|\s*实现|[：:])?$/i.test(label)) return "python";
      }
      return null;
    };
    const codeAreas = root.querySelectorAll("pre");
    let collapsedExamples = 0;
    for (let i=0;i<codeAreas.length;i++) {
      const pre = codeAreas[i];
      if (pre.previousElementSibling?.classList?.contains("cr-reader-codebar")) continue;
      const code = pre.querySelector("code");
      const foldLang = findCodeLanguage(pre,code);
      const lang = foldLang || code?.className?.match(/language-(stata|python|r|javascript|bash|text)\b/i)?.[1];
      const bar = document.createElement("div");
      bar.className = "cr-reader-codebar";
      const caption = document.createElement("span");
      caption.textContent = lang ? lang.toUpperCase() + " · 可复制示例" : "CODE · 可复制示例";
      const copy = document.createElement("button");
      copy.type = "button";
      copy.textContent = "复制代码";
      copy.setAttribute("aria-label", "复制此处代码");
      copy.addEventListener("click", async () => {
        const source = (code || pre).textContent || "";
        try {
          await navigator.clipboard.writeText(source);
          copy.textContent = "已复制 ✓";
        } catch (_) {
          copy.textContent = "复制受限，请手动选择";
        }
        window.setTimeout(() => { copy.textContent = "复制代码"; }, 1800);
      });
      bar.append(caption,copy);
      pre.parentNode.insertBefore(bar,pre);

      if (foldLang) {
        const disclosure = document.createElement("details");
        disclosure.className = "cr-reader-codefold";
        disclosure.setAttribute("data-code-language",foldLang);
        disclosure.open = false;
        const summary = document.createElement("summary");
        const name = document.createElement("span");
        name.className = "cr-reader-fold-label";
        name.textContent = foldLang === "stata" ? "Stata 代码" : "Python 代码";
        const hint = document.createElement("span");
        hint.className = "cr-reader-fold-hint";
        hint.textContent = "点击展开 · 查看完整代码";
        const chevron = document.createElement("span");
        chevron.className = "cr-reader-fold-chevron";
        chevron.setAttribute("aria-hidden","true");
        chevron.textContent = "⌄";
        summary.append(name,hint,chevron);
        bar.parentNode.insertBefore(disclosure,bar);
        disclosure.append(summary,bar,pre);
        disclosure.addEventListener("toggle",() => {
          hint.textContent = disclosure.open ? "点击收起 · 已展开完整代码" : "点击展开 · 查看完整代码";
        });
        collapsedExamples++;
      }
    }
    console.info("Research Learning Hub: foldable Stata/Python examples",collapsedExamples);

    const setActive = (idx) => {
      tocLinks.forEach((el, i) => {
        el.classList.toggle("is-active", i === idx);
        if (i === idx) el.setAttribute("aria-current", "location");
        else el.removeAttribute("aria-current");
      });
    };
    setActive(0);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        const seen = entries.filter(e => e.isIntersecting).sort((a, b) =>
          a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen.length) {
          const idx = toc.findIndex(t => t.unit === seen[0].target);
          if (idx >= 0) setActive(idx);
        }
      }, { rootMargin: "-14% 0px -62% 0px", threshold: 0 });
      toc.forEach(t => observer.observe(t.unit));
    }
    let ticking = false;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const fraction = Math.max(0, Math.min(1, window.scrollY / max));
      meterFill.style.transform = "scaleX(" + fraction + ")";
      back.classList.toggle("is-visible", window.scrollY > 520);
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
    console.info("Research Learning Hub: reader enhanced", toc.length, "sections");
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true });
  else ready();
})();
