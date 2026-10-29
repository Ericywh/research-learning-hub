'use strict';

/**
 * A public-site build helper. No Notion token or private data is used.
 * Complete lesson HTML is the sole trigger for automatically enabling a planned
 * lesson in the DEPLOYED catalog. The 120-lesson master outline stays unchanged.
 *
 * Run on GitHub Actions after "cp -a docs/. _site/".
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = 'docs/econometrics';
const out = '_site/econometrics';
const inputPath = path.join(root, 'catalog.js');
const env = { window: {} };
vm.runInNewContext(fs.readFileSync(inputPath, 'utf8'), env, {timeout: 2000});
const course = env.window.ECON_COURSE;
if (!course || !Array.isArray(course.chapters) || course.chapters.length !== 10) {
  throw Error('Econometrics master catalog must contain 10 chapters.');
}
const lessons = course.chapters.flatMap(ch => ch.lessons || []);
if (lessons.length !== 120) throw Error('Never alter the original 120-lesson outline.');
const allIds = new Set();
const detected = [];
const lessonDir = path.join(root, 'lessons');

function getDate(html) {
  const meta = html.match(/<meta\s+name=["']course-date["']\s+content=["'](20\d{2}-\d{2}-\d{2})["']/i);
  if (meta) return meta[1];
  const m = html.match(/(20\d{2})年(\d{1,2})月(\d{1,2})日/);
  if (!m) return null;
  return m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0');
}

for (const lesson of lessons) {
  if (!/^\d{2}-\d{2}$/.test(lesson.id || '') || allIds.has(lesson.id)) {
    throw Error('Duplicate or invalid econometrics lesson ID: ' + lesson.id);
  }
  allIds.add(lesson.id);
  const url = 'lessons/' + lesson.id + '.html';
  const sourceFile = path.join(root, url);
  const deployedFile = path.join(out, url);
  // A verified Notion lesson may exist only in the Pages build artifact.
  const exists = fs.existsSync(sourceFile) || fs.existsSync(deployedFile);
  if (lesson.published && !exists) throw Error('Catalog points to a missing published lesson: ' + lesson.id);
  if (!exists) continue;

  if (lesson.published && lesson.url !== url) {
    throw Error('Published catalog URL differs from actual lecture file: ' + lesson.id);
  }
  // A prepared body is publicly readable but not yet a delivered daily lesson.
  if (lesson.prepared === true && lesson.preparedUrl === url) continue;
  if (lesson.published) continue;

  const file = fs.existsSync(deployedFile) ? deployedFile : sourceFile;
  const html = fs.readFileSync(file, 'utf8');
  const expectedHeading = '第' + lesson.chapter + '章·第' + lesson.section + '节｜' + lesson.title;
  if (html.length < 2500 || !/<!doctype html>/i.test(html) ||
      !html.includes(expectedHeading) || !html.includes('<h1') ||
      !/Stata/i.test(html) || !/Python/i.test(html) ||
      !/<pre\b/i.test(html) || !/练习/.test(html)) {
    throw Error('Unpublished course HTML is incomplete or mismatched: ' + sourceFile);
  }
  for (const heading of ['一、通俗理解','二、核心理论与公式',
    '三、实证案例与数据','四、Stata与Python实现',
    '五、初学者避坑','六、今日练习']) {
    if (!html.includes(heading)) {
      throw Error('Incomplete teaching module ' + heading + ' in ' + sourceFile);
    }
  }
  const date = getDate(html);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(date + 'T00:00:00Z'))) {
    throw Error('Course publication date missing/invalid; include a date in HTML: ' + sourceFile);
  }
  lesson.published = true;
  lesson.url = url;
  lesson.date = date;
  detected.push(lesson.id);
}

fs.writeFileSync(path.join(out, 'catalog.js'),
  '/* Generated during Pages build from the original 120-lesson plan and verified HTML files. */\n' +
  'window.ECON_COURSE=' + JSON.stringify(course, null, 2) + ';\n');

// Update non-JavaScript fallback content for the legacy catalogue. The current
// taught lesson entry is intentionally a redirect and must remain authoritative.
// Never infer real chat-teaching progress from catalog.published flags.
const published = lessons.filter(l => l.published && l.url);
if (published.length === 0) throw Error('No published econometrics lessons');
const latest = published[published.length - 1];
const next = lessons.find(l => !l.published);
let home = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
let directEntryId = null;
const currentEntry = home.match(/<meta\s+name=["']current-lesson["']\s+content=["'](\d{2}-\d{2})["']/i);
const redirectEntry = home.match(/<meta\s+http-equiv=["']refresh["']\s+content=["']0;\s*url=lessons\/(\d{2}-\d{2})\.html["']/i);
if (currentEntry || redirectEntry) {
  if (!currentEntry || !redirectEntry || currentEntry[1] !== redirectEntry[1]) {
    throw Error('Current lesson metadata and homepage redirect must point to the same lesson.');
  }
  directEntryId = currentEntry[1];
  const current = lessons.find(l => l.id === directEntryId);
  if (!current || current.url !== 'lessons/' + directEntryId + '.html') {
    throw Error('Homepage current-lesson target is not a canonical entry in the original 120-lesson plan.');
  }
  const currentFile = path.join(out, current.url);
  if (!fs.existsSync(currentFile)) throw Error('Current taught lesson file is missing: ' + currentFile);
  const currentHtml = fs.readFileSync(currentFile, 'utf8');
  const expectedHeading = '第' + current.chapter + '章·第' + current.section + '节｜' + current.title;
  if (!currentHtml.includes(expectedHeading) ||
      !currentHtml.includes('name="course-status" content="taught"') ||
      !currentHtml.includes('id="s7"')) {
    throw Error('Homepage current lesson is not a complete taught lesson: ' + directEntryId);
  }
  if (!home.includes('course-archive.html') || !home.includes('catalog.js')) {
    throw Error('Direct course entry must retain history/catalog links and the catalog cache-busting hook.');
  }
  console.log('Preserved direct entry to actually taught lesson ' + directEntryId + '; legacy catalogue is linked separately.');
} else {
  // Backward-compatible fallback for the original interactive catalogue homepage.
  const escapeHtml = text => String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  function changeText(id, newText) {
    const regexp = new RegExp('(id="' + id + '"[^>]*>)[^<]*');
    if (!regexp.test(home)) throw Error('Course homepage marker missing: ' + id);
    home = home.replace(regexp, (_, opening) => opening + escapeHtml(newText));
  }
  changeText('published-count', published.length + ' / ' + lessons.length);
  changeText('latest-meta', '已授课 · ' + (latest.date ? latest.date.replace(/-/g, '.') + ' · ' : '') +
    'DAY ' + String(latest.number).padStart(3, '0'));
  changeText('latest-title', '第' + latest.chapter + '章·第' + latest.section + '节｜' + latest.title);
  changeText('latest-description', '原120课地址保留；36模块新主线与修订状态见上方入口。代码运行状态逐项披露。');
  changeText('latest-link', '阅读第' + latest.number + '课完整讲义 ↗');
  home = home.replace(/(id="latest-link" href=")[^"]+/, '$1' + latest.url);
  changeText('next-meta', next ? '下一讲 · DAY ' + String(next.number).padStart(3,'0') : '课程已全部归档');
  changeText('next-title', next ? next.title : '120课原址保留，36处正文实质修订');
  changeText('next-description', next ?
    '下一节主题：' + next.title + (next.prepared?'。正文已提前提供，可通过目录进入。':'。完成授课并归档后开放阅读。') :
    '其余84课保留历史原稿并增加新模块导读，不代表全部120课已经实质重写。');
  changeText('next-status', next ?
    '第' + next.number + (next.prepared?'课正文已上线，尚待正式授课。':'课尚未公开归档。') : '学习完成情况与网站历史展示状态分别记录。');
  fs.writeFileSync(path.join(out, 'index.html'), home);
}
console.log('Econometrics public site: ' + published.length +
  '/120 catalogue entries; direct entry=' + (directEntryId || 'legacy catalogue fallback') +
  '; last catalogue entry=' + latest.id +
  '; automatically discovered=' + (detected.join(',') || 'none') + '.');
