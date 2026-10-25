"""Render existing first-week AM/PM lessons from week1-content.json.

No lesson numbers or completion keys are created or reset. The PM V6 builder
calls this file with --mode pm to retain the newer first-week content.
"""
from pathlib import Path
import argparse,html,json,re,sys,xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parent
if str(ROOT) not in sys.path:sys.path.insert(0,str(ROOT))
from week1_components import icon,scene,week_route,mode_switch,lesson_strip,reader_tools,study_flow,sequential_nav,panel_badge
REVISION='continuous-speaking-week1-v1'
DATA=json.loads((ROOT/'week1-content.json').read_text(encoding='utf-8'))['days']

def write(path,text):
 path.parent.mkdir(parents=True,exist_ok=True)
 with path.open('w',encoding='utf-8',newline='\n') as f:f.write(text)

def inline(text):
 text=html.escape(text,quote=True)
 text=re.sub(r'\[([^\]]+)\]\((https://[^\s)]+)\)',r'<a href="\2" target="_blank" rel="noopener noreferrer">\1</a>',text)
 return re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',text)

def render(text):
 """Restricted Markdown renderer: authors use paragraphs, headings and toggles."""
 out=[];paragraph=[];listing=False
 def flush():
  if paragraph:out.append('<p>'+inline(' '.join(paragraph))+'</p>');paragraph.clear()
 def endlist():
  nonlocal listing
  if listing:out.append('</ul>');listing=False
 for raw in text.splitlines():
  line=raw.strip()
  if not line:flush();endlist();continue
  if line in ('<details>','</details>') or line.startswith('<summary>'):
   flush();endlist()
   out.append(line if not line.startswith('<summary>') else '<summary>'+inline(line[9:-10])+'</summary>')
  elif line.startswith('### ') or line.startswith('## '):
   flush();endlist();level=len(line)-len(line.lstrip('#'))
   out.append(f'<h{level}>'+inline(line[level+1:])+f'</h{level}>')
  elif line.startswith('> '):
   flush();endlist();out.append('<blockquote><p>'+inline(line[2:])+'</p></blockquote>')
  elif line.startswith('- '):
   flush()
   if not listing:out.append('<ul>');listing=True
   out.append('<li>'+inline(line[2:])+'</li>')
  else:paragraph.append(line)
 flush();endlist()
 return '\n'.join(out)

def notion(text):
 """Native Notion toggles require tab-indented children at every nesting level."""
 out=[];depth=0
 for raw in text.splitlines():
  line=raw.strip()
  if line=='</details>':depth-=1
  if line:out.append('\t'*depth+line)
  if line.startswith('<summary>'):depth+=1
  assert depth>=0
 assert depth==0
 return '\n'.join(out)

def editorial(text):
 """Group the unchanged lesson blocks into cards without moving across gates."""
 root=ET.fromstring('<div>'+render(text)+'</div>')
 serial=0
 def tone(title):
  if '错误' in title:return 'peach'
  if '迁移' in title or '完成' in title or '后续' in title:return 'mint'
  if '任务' in title or '主案例' in title:return 'blue'
  return 'lilac'
 def group(nodes,level=2):
  nonlocal serial
  result=[];panel=None;sub=None
  for node in nodes:
   title=''.join(node.itertext())
   if node.tag=='details':
    children=list(node);summary=children[0]
    node.set('class','lesson-disclosure')
    content=ET.Element('div',{'class':'disclosure-body'})
    content.extend(group(children[1:],level))
    node[:]=[summary,content]
   elif node.tag=='p':
    if title.startswith('对应关键词：'):
     node.set('class','keyword-note')
     if not list(node):
      first,sep,rest=title[len('对应关键词：'):].partition('。')
      node.text='';label=ET.SubElement(node,'span',{'class':'keyword-caption'});label.text='对应关键词：'
      for i,term in enumerate(first.split('—')):
       if i:
        join=ET.SubElement(node,'span',{'class':'keyword-separator'});join.text='—'
       chip=ET.SubElement(node,'span',{'class':'keyword-chip'});chip.text=term
      if sep:
       explanation=ET.SubElement(node,'span',{'class':'keyword-explanation'});explanation.text=sep+rest
    elif title.startswith('迁移题参考：') or title.startswith('迁移核查示例：'):node.set('class','transfer-answer')
    elif title.startswith('可选') or '可选出处：' in title:node.set('class','source-note')
    elif title.startswith('完成依据：'):node.set('class','completion-note')
   if node.tag=='h2':
    serial+=1;panel=ET.Element('section',{'class':'lesson-panel tone-'+tone(title),'id':'section-'+str(serial)})
    symbol,caption=panel_badge(title)
    badge=ET.SubElement(panel,'div',{'class':'panel-badge','aria-hidden':'true','data-decoration':'true'})
    badge.append(ET.fromstring(icon(symbol)));badge.tail=None
    small=ET.SubElement(badge,'span');small.text=caption
    panel.append(node);result.append(panel);sub=None
   elif node.tag=='h3':
    sub=ET.Element('section',{'class':'lesson-subsection'})
    if title.startswith(('参考一','修订一')):sub.set('class','lesson-subsection model-answer model-a')
    elif title.startswith(('参考二','修订二')):sub.set('class','lesson-subsection model-answer model-b')
    sub.append(node)
    if panel is not None:panel.append(sub)
    else:result.append(sub)
   elif sub is not None:sub.append(node)
   elif panel is not None:panel.append(node)
   else:result.append(node)
  return result
 root[:]=group(list(root))
 return ''.join(ET.tostring(x,encoding='unicode',method='html') for x in root)

def lesson_contents(rendered):
 root=ET.fromstring('<div>'+rendered+'</div>')
 entries=[]
 for node in list(root):
  if node.tag=='section' and node.get('id'):
   heading=node.find('h2')
   if heading is not None:entries.append((node.get('id'),''.join(heading.itertext())))
 if len(entries)<2:return ''
 links=''.join('<a href="#'+key+'">'+esc(label)+'</a>' for key,label in entries)
 return '<nav class="paper lesson-contents" aria-label="本课内容"><div class="kicker">阅读导航</div><h2>本课内容</h2>'+links+'</nav>'

def esc(text):return html.escape(str(text),quote=True)

def page(d,mode):
 n=d['day'];dd=f'{n:02}';am=mode=='am';title=d[mode+'_title'];minutes=d[mode+'_minutes']
 label='早晨开口实训' if am else '晚间案例精讲'
 duration='18分钟 · 真实开口' if am else f'建议{minutes}分钟 · 最长18分钟'
 other='pm' if am else 'am';otherlabel='同日晚课' if am else '对应早课'
 desc='以真实录音、回听和针对性重说训练连续表达。' if am else '从完整发言理解信息组织、依据和表达取舍，可静默完成。'
 side='首次表达、自评与修改分别保留；正常停顿不等于卡壳。' if am else '用时包含练习与答案阅读；不要求重复抄写关键词。'
 if n in (1,7):side='先完成早课首录并封存独立评分，再展开教学与示范。'
 rendered=editorial(d[mode]);contents=lesson_contents(rendered)
 guarded=n in (1,7)
 route=week_route(n,mode)
 flow=study_flow(mode,guarded)
 if am:
  seconds=60 if n==1 else 90
  options=''.join(f'<option value="{s}"'+(' selected' if s==seconds else '')+f'>{s}秒</option>' for s in [45,60,90])
  preset=f'<p class="timer-fixed">本题首次发言：{seconds}秒</p>' if n in (1,7) else '<label class="timer-preset">选择本轮时长<select data-timer-preset>'+options+'</select></label>'
  tool=f'''<section class="paper practice-timer" data-timer-seconds="{seconds}"><div class="kicker">晨间练习</div><h2>独立发言计时</h2><div class="timer-display" data-timer-display aria-label="剩余时间">{seconds//60:02}:{seconds%60:02}</div>{preset}<div class="timer-controls"><button type="button" data-timer-toggle>开始计时</button><button type="button" data-timer-reset>重置</button></div><p class="timer-status" data-timer-status aria-live="polite">计时器不录音，请自行保存录音。</p></section>'''
 else:
  tool=f'''<section class="paper reading-guide"><div class="kicker">晚间阅读</div><h2>今晚的学习节奏</h2><div class="reading-duration">{minutes}<span>分钟</span></div><p>包含练习与答案阅读<br>最长18分钟 · 可静默完成</p></section>'''
 completion=f'''<section class="course-completion" data-completion-id="{mode}:day-{dd}" aria-label="课程完成标记"><div class="course-completion-head"><h2 class="course-completion-title">本课学习状态</h2><button class="course-completion-button" type="button" aria-pressed="false">○ 标记本课已完成</button></div><p class="course-completion-status" aria-live="polite">既往完成状态保留；本次修订不代表你已经复练。</p></section>'''
 return f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="第{dd}天{label}：{title}。第一周连续表达修订，{duration}。"><title>第{dd}天{label}｜{title}</title><link rel="stylesheet" href="../course-page.css"><link rel="stylesheet" href="../../lesson-completion.css"><link rel="stylesheet" href="../week1.css?v=20261024-editorial"><link rel="stylesheet" href="../week1-upgrade.css?v=20261025-studio"><script defer src="../../lesson-completion.js?v=week1-20261024"></script><script defer src="../week1-ui.js?v=20261025-studio"></script></head>
<body class="week1-page week1-{mode} studio-page" id="page-top"><div class="reading-position" aria-hidden="true"><span data-reading-position></span></div><div class="wrap"><nav class="top"><a href="../chapter-01.html">{icon('back')}第一周课程目录</a><span>第{n}天 · {mode.upper()} · 全课程第{2*n-1 if am else 2*n:03}课</span></nav><header class="hero"><div class="hero-copy"><div class="eyebrow">{icon('mic' if am else 'book')} WEEK 1 · {mode.upper()} · DAY {dd} / 63</div><h1>{title}</h1><p>{desc}</p><div class="pills"><span>{duration}</span><span>演讲 · 汇报 · 临时发言</span></div></div>{scene()}</header>{lesson_strip(mode,minutes)}{mode_switch(n,mode,d['pm_minutes'])}{reader_tools()}
<div class="layout"><main class="main"><article id="lesson-content" class="lesson week1-lesson" data-revision="{REVISION}" data-day="{dd}" data-mode="{mode}" data-minutes="{minutes}">{rendered}</article>{completion}{sequential_nav(n,mode,DATA)}<nav class="paper week1-bottom"><a href="../{other}/day-{dd}.html">{otherlabel} →</a><a href="../chapter-01.html">第一周目录 →</a></nav></main><aside class="sidebar">{route}{tool}{flow}{contents}<section class="paper study-note"><div class="kicker">本课学习</div><h2>{'真实表达' if am else '理解与判断'}</h2><p>{side}</p><p>个人录音和评分自行保管。页面更新不新增课次，不自动勾选完成。</p><p><a href="../index.html">63天总目录 →</a></p></section></aside></div><footer class="footer">公众表达与脱稿演讲｜第一周既有14课修订 · 早18分钟，晚最长18分钟 · <a href="https://github.com/Ericywh/research-learning-hub/blob/65a936db86d8c7b9826d1a2075148417eef38c89/docs/speaking/dual-track-2026/{mode}/day-{dd}.html">修订前课文</a></footer></div><a class="back-to-top" href="#page-top" aria-label="返回顶部">{icon('up')}</a></body></html>
'''

def build(mode='both'):
 modes=['am','pm'] if mode=='both' else [mode]
 manifest=[]
 for d in DATA:
  for m in ['am','pm']:
   row={'day':d['day'],'mode':m,'lesson_number':2*d['day']-(m=='am'),'title':d[m+'_title'],'minutes':d[m+'_minutes'],'reference_default':'closed','revision':REVISION,'path':f'{m}/day-{d["day"]:02}.html','characters':len(re.sub(r'[\s<>/a-z]','',d[m]))}
   manifest.append(row)
   if m in modes:write(ROOT/row['path'],page(d,m))
 write(ROOT/'week1-manifest.json',json.dumps({'revision':REVISION,'days':7,'lessons':14,'new_lessons':0,'entries':manifest},ensure_ascii=False,indent=2)+'\n')
 p=ROOT/'pm-v6-manifest.json'
 if 'pm' in modes and p.exists():
  old=json.loads(p.read_text(encoding='utf-8'))
  rows=old if isinstance(old,list) else old.get('lessons',old.get('entries',[]))
  for row in rows:
   n=int(row['day'])
   if n<=7:
    d=DATA[n-1]
    budget={'案例与理论':6,'定位回听':3,'参考与解析':5,'后续任务':2} if n==7 else {'案例与理论':6,'错误对照':d['pm_minutes']-13,'静默迁移':3,'参考与解析':4}
    row.update(title=d['pm_title'],kind='recording-review' if n==7 else 'continuous-speech',minutes=d['pm_minutes'],minute_budget=budget,revision=REVISION,generator='rebuild-week1.py',exercise='首录封存后复盘' if n==7 else '静默结构重建与情境迁移',answers=2,reference_default='closed',characters=len(d['pm']))
  write(p,json.dumps(old,ensure_ascii=False,indent=2)+'\n')
 print('Rendered',len(DATA)*len(modes),'first-week lessons; completion IDs retained')
 if (ROOT/'refine-lesson-pages.py').exists():
  import subprocess
  subprocess.run([sys.executable,str(ROOT/'refine-lesson-pages.py'),'--mode',mode,'--end','7'],check=True)

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--mode',choices=['am','pm','both'],default='both')
 build(parser.parse_args().mode)
