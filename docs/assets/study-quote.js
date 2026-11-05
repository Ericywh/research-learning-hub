/* One new original study prompt on each page load. */
(() => {
  "use strict";
  const KEY = "rlh:motivation:last-index:v1";
  const quotes = [
    "稳定前进的人，最后往往走得更远。",
    "把复杂的问题拆小，把重要的事情做深。",
    "今天理解的一点点，终会成为明天研究的底气。",
    "真正的进步，来自持续而诚实的积累。",
    "先把问题问清楚，再让方法回答问题。",
    "不必追赶所有进度，持续完成自己的研究路径。",
    "每一次认真推导，都是在为独立判断打基础。",
    "阅读让视野变宽，写作让思想变清楚。",
    "把时间投入难而正确的事情，答案会逐渐显现。",
    "研究的价值，常常藏在反复核验的细节里。",
    "今天多弄懂一个概念，明天就少一分含糊。",
    "不要只追求做得快，也要追求理解得准。",
    "好的研究始于好问题，也成于耐心求证。",
    "把方法学扎实，把证据看仔细，把结论说准确。",
    "长期主义不是等待结果，而是每天推进一点。",
    "学习不是收集答案，而是训练提出好问题的能力。",
    "每一次专注，都在缩短想法与成果之间的距离。",
    "不急于求成，先让每一步都有依据。",
    "能解释清楚的知识，才真正成为自己的知识。",
    "持续阅读、独立思考、认真写作，研究能力由此生长。",
    "让好奇心决定方向，让证据决定结论。",
    "难题不会因回避而变简单，但会因拆解而变清晰。",
    "把今天的专注留给值得长期投入的事情。",
    "不以一时进度判断自己，以长期积累衡量成长。"
  ];
  function readLast() {
    try { return Number(localStorage.getItem(KEY)); } catch (_) { return -1; }
  }
  function saveLast(index) {
    try { localStorage.setItem(KEY, String(index)); } catch (_) {}
  }
  function choose() {
    const last = readLast();
    let index = Math.floor(Math.random() * quotes.length);
    if (quotes.length > 1 && index === last) index = (index + 1 + Math.floor(Math.random() * (quotes.length - 1))) % quotes.length;
    saveLast(index);
    return index;
  }
  function render() {
    const text = document.querySelector("[data-motivation-text]");
    if (!text) return;
    const source = document.querySelector("[data-motivation-source]");
    const button = document.querySelector("[data-motivation-refresh]");
    const setQuote = () => {
      const index = choose();
      text.textContent = quotes[index];
      if (source) source.textContent = "研究札记 · 每日一语";
    };
    setQuote();
    if (button) button.addEventListener("click", setQuote);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render, {once:true});
  else render();
})();
