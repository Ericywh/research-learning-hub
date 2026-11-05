/* Local study dashboard for Research Learning Hub.
   Study sessions and reading marks stay in this browser; no remote tracking. */
(() => {
  "use strict";
  const SESSION_KEY = "rlh:study:sessions:v1";
  const ACTIVE_KEY = "rlh:study:active:v1";
  const READ_PREFIX = "rlh:read:v1:";
  const $ = (selector) => document.querySelector(selector);

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function storageSet(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (_) { return false; }
  }
  function storageRemove(key) {
    try { localStorage.removeItem(key); return true; } catch (_) { return false; }
  }
  function getSessions() {
    try {
      const value = JSON.parse(storageGet(SESSION_KEY) || "[]");
      if (!Array.isArray(value)) return [];
      return value.filter((item) =>
        Number.isFinite(Number(item.startAt)) &&
        Number.isFinite(Number(item.endAt)) &&
        Number(item.endAt) > Number(item.startAt)
      ).map((item) => ({
        startAt: Number(item.startAt),
        endAt: Number(item.endAt)
      }));
    } catch (_) { return []; }
  }
  function getActive() {
    try {
      const value = JSON.parse(storageGet(ACTIVE_KEY) || "null");
      if (!value || !Number.isFinite(Number(value.startedAt))) return null;
      return { startedAt: Number(value.startedAt) };
    } catch (_) { return null; }
  }
  function dayKey(timestamp) {
    const date = new Date(timestamp);
    return date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  }
  function addInterval(totals, startAt, endAt) {
    let cursor = startAt;
    while (cursor < endAt) {
      const date = new Date(cursor);
      const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime();
      const segmentEnd = Math.min(endAt, nextDay);
      const key = dayKey(cursor);
      totals.set(key, (totals.get(key) || 0) + segmentEnd - cursor);
      cursor = segmentEnd;
    }
  }
  function buildDailyTotals(sessions, active, now) {
    const totals = new Map();
    sessions.forEach((session) => addInterval(totals, session.startAt, session.endAt));
    if (active && now > active.startedAt) addInterval(totals, active.startedAt, now);
    return totals;
  }
  function formatDuration(milliseconds) {
    const minutes = Math.max(0, Math.round(milliseconds / 60000));
    if (minutes < 60) return minutes + " 分钟";
    return (milliseconds / 3600000).toFixed(1) + " 小时";
  }
  function formatClock(milliseconds) {
    const seconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const rest = seconds % 60;
    return [hours, minutes, rest].map((value) => String(value).padStart(2, "0")).join(":");
  }
  function updateReadingProgress() {
    const count = $("[data-reading-count]");
    if (!count) return;
    let completed = 0;
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (key && key.startsWith(READ_PREFIX) && localStorage.getItem(key) === "1") completed += 1;
      }
    } catch (_) {}
    count.textContent = completed + " 项";
  }
  function updateTimer() {
    const active = getActive();
    const elapsed = $("[data-study-elapsed]");
    const state = $("[data-study-state]");
    const start = $("[data-study-start]");
    const stop = $("[data-study-stop]");
    if (elapsed) elapsed.textContent = active ? formatClock(Date.now() - active.startedAt) : "00:00:00";
    if (state) state.textContent = active ? "计时进行中 · 结束后自动累计" : "尚未开始计时";
    if (start) start.disabled = Boolean(active);
    if (stop) stop.disabled = !active;
  }
  function streakLength(dailyTotals, now) {
    const days = new Set(Array.from(dailyTotals.entries()).filter((entry) => entry[1] > 0).map((entry) => entry[0]));
    const cursor = new Date(now);
    cursor.setHours(0, 0, 0, 0);
    let key = dayKey(cursor.getTime());
    if (!days.has(key)) {
      cursor.setDate(cursor.getDate() - 1);
      key = dayKey(cursor.getTime());
      if (!days.has(key)) return 0;
    }
    let streak = 0;
    while (days.has(dayKey(cursor.getTime()))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }
  function renderWeekChart(dailyTotals, now) {
    const chart = $("[data-week-chart]");
    if (!chart) return;
    chart.replaceChildren();
    const days = [];
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    for (let index = 0; index < 7; index += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = dayKey(date.getTime());
      days.push({ date: date, key: key, value: dailyTotals.get(key) || 0 });
    }
    const maximum = Math.max(1800000, ...days.map((day) => day.value));
    days.forEach((day) => {
      const column = document.createElement("div");
      column.className = "week-column";
      const value = document.createElement("span");
      value.className = "week-value";
      value.textContent = day.value ? formatDuration(day.value) : "—";
      const track = document.createElement("div");
      track.className = "week-bar-track";
      const fill = document.createElement("span");
      fill.className = "week-bar-fill";
      fill.style.height = day.value ? Math.max(5, day.value / maximum * 100) + "%" : "0";
      track.appendChild(fill);
      const label = document.createElement("span");
      label.className = "week-day";
      label.textContent = (day.date.getMonth() + 1) + "/" + day.date.getDate() +
        " 周" + ["日", "一", "二", "三", "四", "五", "六"][day.date.getDay()];
      column.title = day.date.getFullYear() + "-" + day.key.slice(5) + " · " + formatDuration(day.value);
      column.append(value, track, label);
      chart.appendChild(column);
    });
  }
  function renderStats() {
    const now = Date.now();
    const sessions = getSessions();
    const active = getActive();
    const total = sessions.reduce((sum, session) => sum + session.endAt - session.startAt, 0) +
      (active ? Math.max(0, now - active.startedAt) : 0);
    const dailyTotals = buildDailyTotals(sessions, active, now);
    let weekTotal = 0;
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekStartKey = dayKey(weekStart.getTime());
    dailyTotals.forEach((value, key) => {
      if (key >= weekStartKey && key <= dayKey(now)) weekTotal += value;
    });
    const totalEl = $("[data-total-time]");
    const weekEl = $("[data-week-time]");
    const streakEl = $("[data-study-streak]");
    const weekTotalEl = $("[data-week-total]");
    if (totalEl) totalEl.textContent = formatDuration(total);
    if (weekEl) weekEl.textContent = formatDuration(weekTotal);
    if (streakEl) streakEl.textContent = streakLength(dailyTotals, now) + " 天";
    if (weekTotalEl) weekTotalEl.textContent = "近7天 " + formatDuration(weekTotal);
    updateReadingProgress();
    renderWeekChart(dailyTotals, now);
    updateTimer();
  }
  function startSession() {
    if (getActive()) return;
    const ok = storageSet(ACTIVE_KEY, JSON.stringify({ startedAt: Date.now() }));
    if (!ok) {
      const state = $("[data-study-state]");
      if (state) state.textContent = "浏览器存储不可用，无法保存计时";
      return;
    }
    renderStats();
  }
  function stopSession() {
    const active = getActive();
    if (!active) return;
    const endAt = Date.now();
    const sessions = getSessions();
    if (endAt > active.startedAt) {
      sessions.push({ startAt: active.startedAt, endAt: endAt });
      if (!storageSet(SESSION_KEY, JSON.stringify(sessions.slice(-2000)))) {
        const state = $("[data-study-state]");
        if (state) state.textContent = "保存失败，请检查浏览器存储权限";
        return;
      }
    }
    storageRemove(ACTIVE_KEY);
    renderStats();
  }
  function init() {
    const start = $("[data-study-start]");
    const stop = $("[data-study-stop]");
    if (start) start.addEventListener("click", startSession);
    if (stop) stop.addEventListener("click", stopSession);
    renderStats();
    window.setInterval(updateTimer, 1000);
    window.setInterval(renderStats, 15000);
    window.addEventListener("storage", renderStats);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();