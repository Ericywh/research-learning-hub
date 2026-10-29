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


// Keep the full interactive course catalogue as the homepage. The latest taught
// lesson is selected explicitly in index.html; never infer chat progress from
// catalog.published, which only indicates website archive availability.
const catalogAvailableCount = lessons.filter(l => l.published && l.url).length;
if (catalogAvailableCount === 0) throw Error('No archived econometrics lessons');
const homePath = path.join(out, 'index.html');
let home = fs.readFileSync(homePath, 'utf8');
const currentEntry = home.match(/<meta\s+name=["']current-lesson["']\s+content=["'](\d{2}-\d{2})["']/i);
if (!currentEntry) throw Error('Homepage must explicitly identify the latest taught lesson.');
if (/http-equiv=["']refresh/i.test(home) || /window\.location\.replace\s*\(/i.test(home)) {
  throw Error('Econometrics homepage must show the full course catalogue; automatic lesson redirects are not allowed.');
}
const currentId = currentEntry[1];
const current = lessons.find(l => l.id === currentId);
if (!current || current.url !== 'lessons/' + currentId + '.html') {
  throw Error('Homepage current lesson is not a canonical entry in the original 120-lesson plan.');
}
const currentFile = path.join(out, current.url);
if (!fs.existsSync(currentFile)) throw Error('Current taught lesson file is missing: ' + currentFile);
const currentHtml = fs.readFileSync(currentFile, 'utf8');
const expectedHeading = '第' + current.chapter + '章·第' + current.section + '节｜' + current.title;
if (!currentHtml.includes(expectedHeading) ||
    !currentHtml.includes('name="course-status" content="taught"') ||
    !currentHtml.includes('id="s7"')) {
  throw Error('Current entry is not a complete taught lesson: ' + currentId);
}
for (const marker of ['id="catalog"', 'id="results"', 'id="current-lesson-link"', 'course-archive.html', 'catalog.js']) {
  if (!home.includes(marker)) throw Error('Complete course homepage is missing required navigation marker: ' + marker);
}
const anchorMatch = home.match(/<a\b[^>]*\bid=["']current-lesson-link["'][^>]*>/i);
if (!anchorMatch || !anchorMatch[0].includes('href="' + current.url + '"')) {
  throw Error('Current lesson button does not link to the explicitly selected taught lesson: ' + currentId);
}
const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function replaceElementText(id, value) {
  const re = new RegExp('(<([a-z][a-z0-9]*)\\b[^>]*\\bid="' + id + '"[^>]*>)[\\s\\S]*?(<\\/\\2>)', 'i');
  if (!re.test(home)) throw Error('Current lesson card element missing: ' + id);
  home = home.replace(re, (_, opening, tag, closing) => opening + escapeHtml(value) + closing);
}
replaceElementText('current-lesson-meta',
  '最新正式授课 · 全课程第' + current.number + '课 / 共120课' + (current.date ? ' · ' + current.date : ''));
replaceElementText('current-lesson-title', expectedHeading);
replaceElementText('current-lesson-description',
  '本课已完整讲授，包含通俗解释、核心公式、公开教学数据、Stata与Python实现、常见误区及练习答案。');
replaceElementText('current-lesson-link', '阅读第' + current.number + '课完整讲义 ↗');
replaceElementText('current-lesson-number', current.number + ' / 120');
const linkRe = /<a\b[^>]*\bid=["']current-lesson-link["'][^>]*>/i;
const updatedLink = home.match(linkRe)[0].replace(/\bhref=["'][^"']*["']/i, 'href="' + current.url + '"');
home = home.replace(linkRe, updatedLink);
const fillRe = /(<span\b[^>]*\bid=["']current-progress-fill["'][^>]*\bstyle=["']width:)[^"']*(["'][^>]*>)/i;
if (!fillRe.test(home)) throw Error('Current progress bar is missing.');
home = home.replace(fillRe, (_, before, after) => before + (current.number / 120 * 100).toFixed(2) + '%' + after);
const progressRe = /(<div\b[^>]*class=["']current-progress["'][^>]*aria-valuenow=["'])\d+(["'][^>]*>)/i;
if (!progressRe.test(home)) throw Error('Current lesson progress accessibility metadata is missing.');
home = home.replace(progressRe, (_, before, after) => before + current.number + after);
fs.writeFileSync(homePath, home);
console.log('Preserved full 10-chapter / 120-lesson catalogue; current taught lesson=' + currentId +
  ' (course lesson ' + current.number + '); archive-available pages=' + catalogAvailableCount + '.');
console.log('Econometrics public site: ' + catalogAvailableCount + '/120 catalogue pages available; current taught lesson explicitly marked=' + currentId +
  '; automatically discovered=' + (detected.join(',') || 'none') + '.');
