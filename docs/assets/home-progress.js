/* Course progress bars for the homepage.
   Counts only the user's explicit local reading/completion marks; never infers completion from publication. */
(() => {
  "use strict";
  const READ = "rlh:read:v1:";
  const configs = {
    math: { total:73, unit:"节", kind:"read", prefix:READ+"math/lessons/" },
    econometrics: { total:120, unit:"节", kind:"econ", key:"research-learning-hub:econometrics:completed:v1" },
    psm: { total:10, unit:"节", kind:"read", prefix:READ+"psm-did/chapter-" },
    frontier: { total:23, unit:"篇", kind:"read", prefix:READ+"frontier/" },
    cssci: { total:16, unit:"篇", kind:"read", prefix:READ+"cssci/lessons/" },
    classics: { total:8, unit:"课", kind:"read", prefix:READ+"economic-classics/lessons/" },
    speaking: { total:126, unit:"课", kind:"speaking", prefix:"speaking-course-complete:v1:" },
    english: { total:70, unit:"课", kind:"read", prefix:READ+"english:lesson:" }
  };
  function readCount(config) {
    try {
      if (config.kind === "econ") {
        const value = JSON.parse(localStorage.getItem(config.key) || "{}");
        return value && typeof value === "object" ? Object.keys(value).filter(k => /^\d{2}-\d{2}$/.test(k)).length : 0;
      }
      let n = 0;
      for (let i=0;i<localStorage.length;i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(config.prefix)) {
          const value = localStorage.getItem(key);
          if (config.kind === "speaking" ? value === "yes" : value === "1") n++;
        }
      }
      return n;
    } catch (_) { return 0; }
  }
  function render() {
    document.querySelectorAll("[data-progress-id]").forEach(card => {
      const id = card.dataset.progressId;
      const config = configs[id];
      if (!config) return;
      const done = Math.min(config.total, readCount(config));
      const pct = Math.round(done / config.total * 100);
      const value = card.querySelector("[data-progress-value]");
      const fill = card.querySelector("[data-progress-fill]");
      const track = card.querySelector('[role="progressbar"]');
      const detail = card.querySelector("[data-progress-detail]");
      if (value) value.textContent = pct + "%";
      if (fill) fill.style.width = pct + "%";
      if (track) track.setAttribute("aria-valuenow", String(pct));
      if (detail) detail.textContent = (config.kind === "speaking" || config.kind === "econ" ? "已完成 " : "已阅读 ") + done + " / " + config.total + " " + config.unit;
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
  window.addEventListener("pageshow", render);
  window.addEventListener("storage", render);
})();
