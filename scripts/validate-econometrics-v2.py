from pathlib import Path
import json,re,hashlib,html,subprocess,sys,os
from html.parser import HTMLParser
R=Path(__file__).resolve().parents[1];C=R/'docs/econometrics';V=C/'v2'
class Links(HTMLParser):
    def __init__(self):super().__init__();self.links=[]
    def handle_starttag(self,t,a):
        a=dict(a)
        for k in ['href','src']:
            if k in a:self.links.append(a[k])
manifest=json.loads((V/'archive-manifest.json').read_text(encoding='utf-8'))
for id,l in manifest.items():
    assert hashlib.sha256((C/'archive/2026-10-27'/l['url']).read_bytes()).hexdigest()==l['sha256'],id
missing=[]
for p in list(V.rglob('*.html'))+[C/'lessons'/f'{id}.html' for id in json.loads((V/'mapping.json').read_text(encoding='utf-8'))['primaryRewrites'].values()]:
    s=p.read_text(encoding='utf-8');parser=Links();parser.feed(s)
    for link in parser.links:
        if re.match(r'^(https?:|mailto:|#|data:|javascript:)',link):continue
        clean=link.split('#')[0].split('?')[0]
        q=(p.parent/clean)
        if not q.exists():missing.append((str(p),link))
assert not missing,missing
assert len(list((V/'modules').glob('M*.html')))==36
mapping=json.loads((V/'mapping.json').read_text(encoding='utf-8'));assert len(mapping['byLegacy'])==120
catalog=json.loads((C/'catalog.js').read_text(encoding='utf-8').split('window.ECON_COURSE=')[1].rstrip().rstrip(';'))
for l in [l for ch in catalog['chapters'] for l in ch['lessons']]:
    s=(C/l['url']).read_text(encoding='utf-8')
    heading=f'第{l["chapter"]}章·第{l["section"]}节｜{l["title"]}'
    assert heading in s,l['id']
    if l['number']>=21:
        assert '<span class="badge">已授课</span>' in s,l['id']
        assert 'name="course-status" content="taught"' in s,l['id']
        assert len(re.findall(r'<section class="paper"',s))==7,l['id']
        assert len(re.findall(r'<pre>',s))==2,l['id']
    assert all(t in s for t in ['Stata','Python','答案']),l['id']
print('PASS: 120 archive hashes, 120 original headings/status/sections, 36 modules, all local v2 and rewritten-lecture links')
