#!/usr/bin/env python3
"""Repair the public mathematics lesson catalog from complete dated HTML lessons.

This program intentionally touches only docs/math/catalog.js. Old lessons and
all other course catalogs remain unchanged. Safe to run repeatedly.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

CATALOG = Path("docs/math/catalog.js")
LESSON_DIR = Path("docs/math/lessons")
NAME = re.compile(r"^(?P<date>\d{4}-\d{2}-\d{2})-(?P<chapter>\d{2})-(?P<section>\d{2})\.html$")
SOURCE = CATALOG.read_text(encoding="utf-8")
MATCH = re.fullmatch(r"\s*window\.MATH_COURSE\s*=\s*(\{.*\})\s*;\s*", SOURCE, re.S)
if not MATCH:
    raise SystemExit("Unexpected mathematics catalog format; refusing to overwrite.")
course = json.loads(MATCH.group(1))
chapters = course.get("chapters", [])
if len(chapters) != 6 or [len(c["lessons"]) for c in chapters] != [12,14,12,9,16,10]:
    raise SystemExit("The planned six chapters/73 lessons changed; refusing to overwrite.")

registry = {}
for chapter in chapters:
    for lesson in chapter["lessons"]:
        key = (lesson["chapter"], lesson["section"])
        if key in registry:
            raise SystemExit("Duplicate lesson key: " + str(key))
        registry[key] = lesson

latest = {}
for page in LESSON_DIR.glob("*.html"):
    match = NAME.fullmatch(page.name)
    if not match:
        continue  # legacy lessons remain untouched
    key = (int(match["chapter"]), int(match["section"]))
    lesson = registry.get(key)
    if lesson is None:
        raise SystemExit(f"Unexpected chapter/section in {page}")
    content = page.read_text(encoding="utf-8")
    if len(content) < 1500 or "<html" not in content.lower() or lesson["title"] not in content:
        raise SystemExit(f"Incomplete or mismatched mathematics lesson: {page}")
    candidate = (match["date"], page.name)
    if key not in latest or candidate > latest[key]:
        latest[key] = candidate

changes = []
for key, (date, filename) in sorted(latest.items()):
    lesson = registry[key]
    url = "lessons/" + filename
    if (lesson.get("published"), lesson.get("date"), lesson.get("url")) != (True, date, url):
        lesson.update(published=True, date=date, url=url)
        changes.append(f"{key[0]}-{key[1]} -> {url}")

for key, lesson in registry.items():
    if lesson.get("published"):
        url = lesson.get("url")
        if not isinstance(url, str) or not re.fullmatch(r"lessons/[\w.-]+\.html", url):
            raise SystemExit(f"Invalid published path for {key}: {url!r}")
        if not (Path("docs/math") / url).is_file():
            raise SystemExit(f"Published file missing for {key}: {url}")

if changes:
    CATALOG.write_text("window.MATH_COURSE=" + json.dumps(course, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print("Updated mathematics catalog:", *changes, sep="\n  ")
else:
    print("Mathematics catalog already matches all versioned lesson files.")
print(f"Validated {len(registry)} planned lessons; {sum(bool(x.get('published')) for x in registry.values())} indexed.")
