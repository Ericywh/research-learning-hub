"""Presentation-only reflow of existing AM/PM pages; never generates new lessons.

AM concealment stays intact. PM unwraps every disclosure except model answers.
Run --mode am|pm|both, with optional --start/--end, after source generators.
"""
from pathlib import Path
from html.parser import HTMLParser
import argparse,html,re,json
ROOT=Path(__file__).resolve().parent
VERSION='20261025-am-pm-v2'
VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

class Node:
 def __init__(self,tag='root',attrs=None,children=None):self.tag=tag;self.attrs=dict(attrs or []);self.children=children or []
 def text(self):return ''.join(x if isinstance(x,str) else x.text() for x in self.children)
 def has(self,cls):return cls in self.attrs.get('class','').split()
 def addclass(self,cls):self.attrs['class']=' '.join(dict.fromkeys((self.attrs.get('class','')+' '+cls).split()))
 def serialize(self):
  content=''.join(html.escape(x,quote=False) if isinstance(x,str) else x.serialize() for x in self.children)
  if self.tag=='root':return content
  attrs=''.join(' '+k+('' if v is None else '="'+html.escape(v,quote=True)+'"') for k,v in self.attrs.items())
  return '<'+self.tag+attrs+'>'+('' if self.tag in VOID else content+'</'+self.tag+'>')

class Tree(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.root=Node();self.stack=[self.root]
 def handle_starttag(self,tag,attrs):
  n=Node(tag,attrs);self.stack[-1].children.append(n)
  if tag not in VOID:self.stack.append(n)
 def handle_startendtag(self,tag,attrs):self.stack[-1].children.append(Node(tag,attrs))
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==tag:self.stack=self.stack[:i];break
 def handle_data(self,data):self.stack[-1].children.append(data)

def parse(s):
 p=Tree();p.feed(s);return p.root
def walk(n):
 yield n
 for child in n.children:
  if isinstance(child,Node):yield from walk(child)
def summary(n):return next((x.text() for x in n.children if isinstance(x,Node) and x.tag=='summary'),'')
def is_reference(n):
 if n.tag!='details':return False
 if n.has('pm-references'):return True
 return bool(re.search(r'参考|示范|答案|修订路径|两种修订|两种完整|两种建议|两种恢复|两种恢复路径',summary(n)))

def pm_open(n,removed):
 result=[]
 for child in n.children:
  if not isinstance(child,Node):result.append(child);continue
  pm_open(child,removed)
  if child.tag=='details' and not is_reference(child):
   removed.append(summary(child))
   for part in child.children:
    if isinstance(part,Node) and part.tag=='summary':continue
    if isinstance(part,Node) and (part.has('disclosure-body') or part.has('pm-review-body')):result.extend(part.children)
    else:result.append(part)
  elif n.tag!='details' and (child.has('pm-review-body') or child.has('disclosure-body')):result.extend(child.children)
  else:
   if child.tag=='details':child.attrs.pop('open',None);child.addclass('reference-only')
   result.append(child)
 n.children=result

def am_cards(article):
 if any(isinstance(x,Node) and x.has('training-step') for x in article.children):return
 result=[];step=None;content=None;number=0
 for child in article.children:
  if isinstance(child,Node) and child.tag in {'strong','b'} and re.match(r'\s*\d+\s*[—–-]\s*\d+\s*分钟',child.text()):
   number+=1;step=Node('section',{'class':'training-step step-tone-'+str((number-1)%5+1)})
   rail=Node('span',{'class':'training-step-number','aria-hidden':'true','data-decoration':'true'},[str(number).zfill(2)])
   content=Node('div',{'class':'training-step-content'},[Node('h3',children=[child])])
   step.children=[rail,content];result.append(step)
  elif isinstance(child,Node) and child.tag=='details':result.append(child);step=None;content=None
  elif content is not None:
   if isinstance(child,str) and child.strip():content.children.append(Node('p',{'class':'training-instruction'},[child]))
   else:content.children.append(child)
  else:result.append(child)
 first_step=next((i for i,x in enumerate(result) if isinstance(x,Node) and x.has('training-step')),len(result))
 leading=result[:first_step]
 if any(isinstance(x,Node) and x.tag in ('strong','b') for x in leading):
  title=[x for x in leading if isinstance(x,Node) and x.tag=='h2']
  material=[x for x in leading if not (isinstance(x,Node) and x.tag=='h2')]
  result=title+[Node('section',{'class':'morning-material'},material)]+result[first_step:]
 article.children=result
 for node in walk(article):
  if node.has('lesson-panel'):
   title=next((x.text() for x in node.children if isinstance(x,Node) and x.tag=='h2'),'')
   if re.search(r'任务|准备|首录|回听|重说|迁移|修订',title):node.addclass('morning-module')

def am_answers(article):
 for detail in list(walk(article)):
  if detail.tag!='details':continue
  body=next((x for x in detail.children if isinstance(x,Node) and (x.has('answer') or x.has('answertext'))),None)
  if body is None or any(isinstance(x,Node) and x.has('refined-answer-card') for x in body.children):continue
  result=[];card=None
  for child in body.children:
   if isinstance(child,Node) and child.tag in ('strong','b') and re.match(r'(?:参考|示范)[一二][：:]',child.text()):
    which='a' if '一' in child.text() else 'b'
    card=Node('section',{'class':'refined-answer-card answer-'+which},[Node('h4',children=[child])]);result.append(card)
   elif card is not None:
    if isinstance(child,str) and child.strip():card.children.append(Node('p',{'class':'answer-paragraph'},[child]))
    else:card.children.append(child)
   else:result.append(child)
  body.children=result

def task_fields(article):
 for node in walk(article):
  if not (node.has('lesson-task-card') or node.has('morning-material')):continue
  if any(isinstance(x,Node) and x.has('task-field') for x in node.children):continue
  result=[];field=None
  for child in node.children:
   if isinstance(child,Node) and child.tag in ('strong','b'):
    field=Node('p',{'class':'task-field'},[child]);result.append(field)
   elif field is not None:field.children.append(child)
   else:result.append(child)
  node.children=result

def block_kinds(article,mode):
 for node in walk(article):
  if node.tag=='section' and not node.has('training-step'):
   title=next((x.text() for x in node.children if isinstance(x,Node) and x.tag in ('h2','h3')),'')
   if not title:continue
   kind='case' if re.search('案例|任务',title) else 'error' if re.search('错误|误区',title) else 'transfer' if re.search('迁移|后续|复盘',title) else 'analysis'
   node.attrs['data-reading-block']=kind
  if mode=='pm' and node.has('pm-dialogue'):node.addclass('evening-transcript')

def timer(article,day):
 plain=article.text();stem=re.split(r'\d+\s*[—–-]\s*\d+\s*分钟',plain,maxsplit=1)[0]
 found=re.search(r'首次(?:无提示)?录音\s*(\d+)\s*秒|无提示\s*(\d+)\s*秒|(?:录音|发言|讲)\s*(\d+)\s*秒',stem)
 seconds=int(next(x for x in found.groups() if x)) if found else 60
 if day==1:seconds=60
 if day==7:seconds=90
 if day==63:seconds=180
 fixed=day in (1,7,63)
 options=''.join('<option value="'+str(s)+'"'+(' selected' if s==seconds else '')+'>'+str(s)+'秒</option>' for s in sorted(set([30,45,60,75,90,120,180,300,seconds])))
 preset='<p class="timer-fixed">本题首次发言：'+str(seconds)+'秒</p>' if fixed else '<label class="timer-preset">以题目规定时长为准<select data-timer-preset>'+options+'</select></label>'
 return '<section class="paper practice-timer refined-tool" data-timer-seconds="'+str(seconds)+'"><div class="kicker">晨间练习工具</div><h2>独立发言计时</h2><div class="timer-display" data-timer-display aria-label="剩余时间">'+str(seconds//60).zfill(2)+':'+str(seconds%60).zfill(2)+'</div>'+preset+'<div class="timer-controls"><button type="button" data-timer-toggle>开始计时</button><button type="button" data-timer-reset>重置</button></div><p class="timer-status" data-timer-status aria-live="polite">计时器不录音，原始录音请自行保存。</p></section>'

def reflow(path,mode,day):
 s=path.read_text('utf8');match=re.search(r'<article\b[^>]*class="[^"]*\blesson\b[^"]*"[^>]*>[\s\S]*?</article>',s)
 if not match:raise ValueError('No lesson article: '+str(path))
 root=parse(match[0]);article=next(x for x in root.children if isinstance(x,Node));removed=[]
 if mode=='pm':pm_open(article,removed)
 else:am_cards(article);am_answers(article);task_fields(article)
 block_kinds(article,mode);article.addclass('refined-lesson');article.attrs['data-layout-version']=VERSION
 if 'id' not in article.attrs:article.attrs['id']='lesson-content'
 s=s[:match.start()]+article.serialize()+s[match.end():]
 # Remove only the empty presentation shell around the article.
 s=re.sub(r'<section class="paper">\s*(<article\b[\s\S]*?</article>)\s*</section>',lambda m:m[1],s,count=1)
 def bodytag(m):
  attrs=m[1];classes=re.search(r'\bclass="([^"]*)"',attrs)
  add='speaking-refined speaking-'+mode
  if classes:
   value=' '.join(dict.fromkeys((classes[1]+' '+add).split()));attrs=attrs[:classes.start()]+f'class="{value}"'+attrs[classes.end():]
  else:attrs+=' class="'+add+'"'
  return '<body'+attrs+'>'
 s=re.sub(r'<body([^>]*)>',bodytag,s,count=1)
 s=re.sub(r'<script\b[^>]*src="\.\./(?:week1-ui|refined-reader)\.js[^\"]*"[^>]*></script>','',s)
 s=re.sub(r'<link\b[^>]*href="\.\./refined-lessons\.css[^\"]*"[^>]*>','',s)
 assets='<link rel="stylesheet" href="../refined-lessons.css?v='+VERSION+'"><script defer src="../refined-reader.js?v='+VERSION+'"></script>'
 s=s.replace('</head>',assets+'</head>',1)
 if mode=='am' and 'data-timer-seconds=' not in s:
  s=s.replace('<aside class="sidebar">','<aside class="sidebar">'+timer(article,day),1)
 if 'data-reader-size' not in s:
  tools='<div class="reader-tools refined-reading-tools"><span class="reader-caption">阅读工具</span><div class="reader-actions"><button type="button" data-reader-size aria-pressed="false"><span>大字阅读</span></button><button type="button" data-reader-focus aria-pressed="false"><span>专注阅读</span></button><a href="#lesson-content">进入正文 →</a></div><span class="reader-status" data-reader-status aria-live="polite"></span></div>'
  s=s.replace('<div class="layout">',tools+'<div class="layout">',1)
 if mode=='pm':
  s=s.replace('再展开晚课','再阅读晚课')
  if 'class="evening-reading-note"' not in s:
   note='<p class="evening-reading-note">正文直接阅读；仅参考答案默认收起。若要保持早课首测独立，请先完成早课原始录音与自评，再阅读本课案例。</p>'
   s=s.replace('<div class="layout">',note+'<div class="layout">',1)
 with path.open('w',encoding='utf8',newline='\n') as f:f.write(s)
 return {'day':day,'mode':mode,'non_answer_disclosures_removed':removed,'answer_disclosures':sum(1 for x in walk(article) if x.tag=='details'),'steps':sum(1 for x in walk(article) if x.has('training-step'))}

def main():
 p=argparse.ArgumentParser();p.add_argument('--mode',choices=['am','pm','both'],default='both');p.add_argument('--start',type=int,default=1);p.add_argument('--end',type=int,default=63);args=p.parse_args()
 rows=[]
 for mode in (['am','pm'] if args.mode=='both' else [args.mode]):
  for day in range(args.start,args.end+1):rows.append(reflow(ROOT/mode/f'day-{day:02}.html',mode,day))
 print(json.dumps({'reflowed':len(rows),'pm_non_answer_gates_removed':sum(len(x['non_answer_disclosures_removed']) for x in rows),'modes':args.mode},ensure_ascii=False))
if __name__=='__main__':main()
