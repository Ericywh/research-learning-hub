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


// The canonical homepage is the 6-week / 36-module learning path.
// The original 10-chapter / 120-lesson outline remains available only through
// course-archive.html; its catalog publication flags are not the homepage state.
const catalogAvailableCount = lessons.filter(l => l.published && l.url).length;
if (catalogAvailableCount === 0) throw Error('No archived econometrics lessons');
const homePath = path.join(out, 'index.html');
const archivePath = path.join(out, 'course-archive.html');
const home = fs.readFileSync(homePath, 'utf8');
const archive = fs.readFileSync(archivePath, 'utf8');
for (const marker of [
  'name="course-revision" content="2026-10-27-v2"',
  'data-module-check="M01"',
  'data-module-check="M36"',
  'href="v2/modules/M01.html"',
  'href="v2/modules/M36.html"',
  'href="course-archive.html"'
]) {
  if (!home.includes(marker)) throw Error('36-module mainline homepage missing marker: ' + marker);
}
if (home.includes('id="catalog"') || home.includes('id="current-lesson-link"') ||
    home.includes('工资影响因素综合实操') || home.includes('第2章·第15节')) {
  throw Error('Legacy 120-lesson directory or its latest lesson is incorrectly displayed on the mainline homepage.');
}
const moduleIds = new Set([...home.matchAll(/href=["']v2\/modules\/(M\d{2})\.html["']/g)].map(m => m[1]));
if (moduleIds.size !== 36) throw Error('Mainline homepage must link to all 36 modules; found ' + moduleIds.size);
for (let i = 1; i <= 36; i++) {
  const id = 'M' + String(i).padStart(2, '0');
  if (!fs.existsSync(path.join(out, 'v2', 'modules', id + '.html'))) {
    throw Error('Mainline module page missing: ' + id);
  }
}
if (!archive.includes('id="catalog"') || !archive.includes('id="results"') ||
    !archive.includes('name="legacy-current-lesson"')) {
  throw Error('Legacy 120-course archive is missing its catalogue or progress marker.');
}
const currentEntry = archive.match(/<meta\s+name=["']legacy-current-lesson["']\s+content=["'](\d{2}-\d{2})["']/i);
if (!currentEntry) throw Error('Legacy archive must explicitly identify the latest taught lesson for historical exports.');
const currentId = currentEntry[1];
const current = lessons.find(l => l.id === currentId);
if (!current || current.url !== 'lessons/' + currentId + '.html') {
  throw Error('Legacy current lesson is not a canonical entry in the original 120-lesson plan.');
}
const currentFile = path.join(out, current.url);
if (!fs.existsSync(currentFile)) throw Error('Legacy current lesson file is missing: ' + currentFile);
const currentHtml = fs.readFileSync(currentFile, 'utf8');
const expectedHeading = '第' + current.chapter + '章·第' + current.section + '节｜' + current.title;
if (!currentHtml.includes(expectedHeading) ||
    !currentHtml.includes('name="course-status" content="taught"') ||
    !currentHtml.includes('id="s7"')) {
  throw Error('Legacy current lesson is not a complete taught lesson: ' + currentId);
}
console.log('Econometrics homepage: verified 36-module mainline; original 120-lesson directory is isolated at course-archive.html.');
console.log('Legacy archive pages available=' + catalogAvailableCount + '; explicitly tracked legacy taught lesson=' +
  currentId + ' (course lesson ' + current.number + '); automatically discovered=' + (detected.join(',') || 'none') + '.');
