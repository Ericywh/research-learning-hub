from pathlib import Path
import hashlib,json,re,subprocess
from html.parser import HTMLParser
R=Path(__file__).resolve().parents[1];V=R/'docs/econometrics/v2'
manifest=json.loads((V/'archive-manifest.json').read_text(encoding='utf-8'))
for k,x in manifest.items():
 b=subprocess.check_output(['git','show','HEAD:docs/econometrics/archive/2026-10-27/'+x['url']],cwd=R)
 assert hashlib.sha256(b).hexdigest()==x['sha256'],k
class Links(HTMLParser):
 def handle_starttag(self,t,a):
  for k,v in a:
   if k in ('href','src') and v and not re.match(r'^(https?:|#|data:|mailto:|javascript:)',v):
    assert (self.base/v.split('#')[0].split('?')[0]).exists(),(self.base,v)
for p in V.rglob('*.html'):
 q=Links();q.base=p.parent;q.feed(p.read_text(encoding='utf-8'))
for p in (V/'modules').glob('M*.html'):
 s=p.read_text(encoding='utf-8');assert s.count('id="deepening"')==1,p
assert len(json.loads((V/'modules.json').read_text(encoding='utf-8')))==36
print('PASS: original Git archive hashes, local HTML links, 36 unique supplements, module metadata')
