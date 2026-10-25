"""Build the 63 static PM seminars from topic-specific teaching content.
Run with Python 3 from this directory or elsewhere. AM and legacy HTML are not written.
"""
from pathlib import Path
import json,re,html
ROOT=Path(__file__).resolve().parent
def esc(s):return html.escape(str(s),quote=True)
def read(p):return p.read_text(encoding='utf-8')
def write(p,s):
 with p.open('w',encoding='utf-8',newline='\n') as f:f.write(s)
def flatten(folder):
 out={}
 for p in sorted(folder.glob('*.json')):
  for k,v in json.loads(read(p)).items():
   k=int(k)
   if k in out:raise ValueError('Duplicate day '+str(k))
   out[k]=v
 return out
DATA=flatten(ROOT/'pm-v6-content')
NOTES=flatten(ROOT/'pm-depth-notes')
CONTEXT={int(k):v for k,v in json.loads(read(ROOT/'pm-v6-context.json')).items()}
assert set(DATA)==set(range(1,64))
THEORIES={
 'toulmin':('Toulmin：主张、依据、论证保证与限定','https://www.cambridge.org/core/books/the-uses-of-argument/26CF801BC12004587B66778297D5567C'),
 'grice':('Grice：交谈中的关联、信息量与有据表达','https://web.stanford.edu/class/psych205/papers/Grice-1975.pdf'),
 'turn':('Sacks、Schegloff与Jefferson：会话轮次组织','https://www.conversationanalysis.org/schegloff-media-archive/simplest-systematics-for-turn-taking-language-1974/'),
 'repair':('Schegloff、Jefferson与Sacks：会话自我修复','https://doi.org/10.2307/413107'),
 'negotiation':('原则性谈判：区分人、立场、利益与判断标准','https://www.pon.harvard.edu/tag/principled-negotiation/'),
 'throughline':('Chris Anderson：让素材服务一个中心想法','https://www.ted.com/talks/chris_anderson_ted_s_secret_to_great_public_speaking'),
 'aristotle':('亚里士多德：论证、可信度与听众处境','https://classics.mit.edu/Aristotle/rhetoric.1.i.html'),
 'asa':('ASA关于p值的声明：统计证据、大小与重要性','https://doi.org/10.1080/00031305.2016.1154108')
}
REVIEWS={1,7,14,21,28,35,36,42,49,56,63}
MEASUREMENT={1,7,14,21,28,35,42,49,56,63}
MOVES={
 'toulmin':['确定主张在回答什么','检查理由怎样支持主张','看清条件与例外'],
 'grice':['回应眼前的问题','提供足以理解的信息','阻止超出事实的推断'],
 'turn':['接住上一轮的信息','保留补充和纠正的空间','根据新信息继续'],
 'repair':['辨认中断的性质','修复意思而非重背句子','需要更正时明确更正'],
 'negotiation':['把人和具体任务分开','将立场还原为目标与限制','用可执行条件推进'],
 'throughline':['找到听众要带走的意思','让过程和细节服务主线','让结果与已有材料相称'],
 'aristotle':['让问题与听众相关','以具体依据保持可信','调整表达而不夸大承诺'],
 'asa':['说明检验回答的问题','分开大小、精度和因果','把结论交还给设计与证据']
}
REVIEW_KEYS={
1:[['原始标准','补充依据','修订另存'],['证据例子','替代解释','结论范围']],
7:[['展示功能','分类时长','首测条件'],['短讲配套','预读问答','条件支持']],
14:[['使用意愿','逐轮缩小','等待回应'],['真实困难','资料位置','调整建议']],
21:[['基本宣传','核心互动','预算顺序'],['固定成本','最低方案','共同决定']],
28:[['课程任务','保留现场','限制全称'],['增加选择','组合形式','配套条件']],
35:[['迟交事实','核查原因','提前通知'],['记录日期','区分后果','不猜人格']],
36:[['版本冲突','主表责任','有限结果'],['确认规则','过程转折','工具边界']],
42:[['参与反馈','成绩未知','评价目标'],['收集范围','分清指标','比较条件']],
49:[['绿色创新','指标时间','设计条件'],['关联描述','投入承诺','其他解释']],
56:[['协调用途','周五反馈','不保节点'],['分阶段','真实可逆','复核信息']],
63:[['同条件短测','长演讲另报','原录保存'],['可听行为','条件差异','不作因果']]
}
manifest=[]
for day,d in sorted(DATA.items()):
 n=NOTES[day]
 p=ROOT/'pm'/('day-'+str(day).zfill(2)+'.html')
 page=read(p)
 title=re.search(r'<h1>(.*?)</h1>',page,re.S).group(1)
 kind='review' if day in REVIEWS else 'expert' if 37<=day<=49 else 'story' if 29<=day<=34 or 57<=day<=62 else 'dialogue' if 8<=day<=20 or 50<=day<=55 else 'argument'
 minutes=12 if day in REVIEWS else 17 if kind=='expert' or day in {58,62} else 16 if day in {57,59,60,61} else 15 if day==19 else 13
 oldarticle=re.search(r'<article\b(?=[^>]*\bclass="[^"]*\blesson\b)[\s\S]*?</article>',page).group(0)
 why=CONTEXT[day]['errorAnalysis']
 # Main case is fully specified and labelled as a teaching simulation.
 setup=d.get('setup',n['setup'])
 dialog='<div class="pm-dialogue pm-v6-dialogue">'+''.join('<p><strong>'+esc(role)+'：</strong>'+esc(speech)+'</p>' for role,speech in d['dialogue'])+'</div>'
 case='<section class="pm-section pm-v6-case"><h2>'+('测后案例｜先看一次判断怎样发生' if day in REVIEWS else '主案例｜把交流现场看完整')+'</h2><p class="pm-case-origin">课程原创模拟，不是真实人物、真实研究结果或学员的实际经历。</p><p>'+esc(setup)+'</p>'+dialog+'</section>'
 # Quotations are exact fragments from this lesson's transcript.
 speech=d['dialogue'][1][1]
 clauses=[x for x in re.split(r'(?<=[。！？；])',speech) if x]
 quotes=[clauses[0],''.join(clauses[1:]) or speech,d['dialogue'][3][1]]
 if 'moves' in d:
  movehtml=''.join('<div class="pm-v6-move"><blockquote>'+esc(q)+'</blockquote><p>'+esc(a)+'</p></div>' for q,a in d['moves'])
 else:
  comments=[d['bridge'],d.get('analysis',n['analysis']),n['limit']]
  movehtml=''.join('<div class="pm-v6-move"><h3>'+esc(label)+'</h3><blockquote>'+esc(q)+'</blockquote><p>'+esc(a)+'</p></div>' for label,q,a in zip(MOVES[d['theory']],quotes,comments))
 theorykeys=[d['theory']]+([d['extraTheory']] if d.get('extraTheory') else [])
 links='；'.join('<a href="'+esc(THEORIES[k][1])+'" target="_blank" rel="noopener noreferrer">'+esc(THEORIES[k][0])+'</a>' for k in theorykeys)
 intro='<p class="pm-v6-concept">'+esc(d['bridge'])+'</p>' if 'moves' in d else ''
 analysis='<section class="pm-section pm-v6-analysis"><h2>'+('片段剖析｜主线怎样贯穿每一部分' if kind=='story' else '案例与理论｜这些句子为什么这样安排')+'</h2>'+intro+movehtml+'<p class="pm-v6-source">理论出处：'+links+'。本页的案例映射与表达取舍为课程教学分析；链接原文供可选查阅，不计入必做任务。</p></section>'
 error='<section class="pm-section pm-v6-error"><h2>'+('复盘误区｜不要让练后表现覆盖原记录' if day in REVIEWS else '错误对照｜问题不只在语气')+'</h2><blockquote>'+esc(n['bad'])+'</blockquote><p>'+esc(why)+'</p><p class="pm-v6-reaction"><strong>在这一模拟中可能引出的反应：</strong>'+esc(n['push'])+'</p><p><strong>修改方向：</strong>'+esc(d['focus'])+'。具体处理见主案例和逐句剖析，不靠替换几个礼貌用语。</p></section>'
 if day in REVIEWS:
  task='<section class="pm-section pm-v6-review"><h2>只做本次录音复盘</h2><p>先定位早课已封存录音中的一处原句，记录秒数或片段位置。核对它回应了什么、依据在哪里、哪一步说得过强；没有录音时只阅读案例，不编造表现或评分。</p><p>只选择这一处写一个修订，不另做陌生题考试，不覆盖原始录音或原评分。本课用时包含回听、分析和下方参考阅读。</p></section>'
  answers=[d['reviewA'],d['reviewB']]
  keys=REVIEW_KEYS[day]
  ref='<details class="pm-references" data-reference-task="post-assessment"><summary>定位原录音后展开｜两种修订路径与解析</summary><div class="pm-reference-body">'
  for i in range(2):
   ref+='<section class="pm-v6-answer"><h3>路径'+('A' if i==0 else 'B')+'｜测后示例</h3><p class="pm-v6-answer-text">'+esc(answers[i])+'</p><p class="pm-key"><strong>对应关键词：</strong>'+esc('—'.join(keys[i]))+'</p><p class="pm-v6-annotation">'+esc(d['checks'][i])+'</p></section>'
  ref+='<p class="pm-v6-boundary">'+esc(d['checks'][2])+'</p></div></details>'
 else:
  assert all(x in d for x in ['transfer','A','B','ak','bk','aa','ba'])
  task='<section class="pm-section pm-v6-transfer"><h2>'+('换听众再组织｜一次有变化的迁移' if kind=='story' else '情境迁移｜改变一个实质条件')+'</h2><p class="pm-v6-task" data-transfer-question="true">'+esc(d['transfer'])+'</p><p>先独立写一段回应或在脑中完整组织，再展开解析。晚间可完全静默完成；选择一个可行版本即可，不要求把两个答案都抄写。</p></section>'
  ref='<details class="pm-references" data-reference-task="transfer"><summary>完成迁移后展开｜同一新题的两份完整表达与逐点解析</summary><div class="pm-reference-body">'
  for i,(answer,keys,comments) in enumerate([(d['A'],d['ak'],d['aa']),(d['B'],d['bk'],d['ba'])]):
   ref+='<section class="pm-v6-answer" data-answer-path="'+('A' if i==0 else 'B')+'"><h3>参考'+('一' if i==0 else '二')+'｜另一种合理路径</h3><p class="pm-v6-answer-text">'+esc(answer)+'</p><p class="pm-key"><strong>对应关键词：</strong>'+esc('—'.join(keys))+'</p><ol class="pm-v6-annotations">'+''.join('<li>'+esc(c)+'</li>' for c in comments)+'</ol></section>'
  ref+='<p class="pm-v6-boundary">两份答案回答的是上方同一迁移题，差异在信息顺序、判断入口或适用条件。核查意思是否准确，不以是否逐字相同判断完成。</p></div></details>'
 if day==63:
  nextnote='正式课程在第63天结束，不安排必做第64天任务。后续自愿巩固另行进行，不回填本轮终测。'
 elif day+1 in MEASUREMENT:
  nextnote='下一早课有无提示测评。先按原要求完成并封存首次录音与自评，再回看今晚内容；不要把复习本页作为测前提示。'
 else:
  nextnote='下次真实开口后，可检查本课讨论的一项表达选择是否用得合适。它属于后续自主验证，不增加今晚必做时长，也不替代晨课录音。'
 body=case+analysis+error+task+ref+'<p class="pm-next">'+esc(nextnote)+'</p>'
 if day in REVIEWS:
  body='<p class="pm-v6-assessment-note">本课只在早课原始录音与独立自评封存后阅读。已看提示的重录需另存，不算无提示首测。</p><div class="pm-review-body">'+body+'</div>'
 metadata='<div class="pm-metadata"><span>建议'+str(minutes)+'分钟，含练习与答案阅读</span><span>最长18分钟 · 可完全静默完成</span></div>'
 art='<article class="lesson pm-seminar pm-kind-'+kind+'" data-pm-revision="case-theory-v6-integrated" data-day="'+str(day).zfill(2)+'" data-minutes="'+str(minutes)+'">'+metadata+'<h2 class="pm-main-title">'+esc(d['focus'])+'</h2>'+body+'</article>'
 page=page.replace(oldarticle,art)
 page=re.sub(r'(<meta name="description" content=")[^"]*(">)',lambda m:m[1]+'公众表达第'+str(day)+'天晚间课：'+html.unescape(title)+'。案例与理论融合剖析，含迁移及完整解析，建议'+str(minutes)+'分钟，最长18分钟。'+m[2],page,count=1)
 hero_text='先封存早课首录与独立自评，再分析一处表达问题；不另做一次测评。' if day in REVIEWS else '围绕一个完整案例理解表达选择，再用有实质变化的情境检验。'
 page=re.sub(r'(<header class="hero">[\s\S]*?<p>)[\s\S]*?(</p>)',lambda m:m[1]+hero_text+m[2],page,count=1)
 page=re.sub(r'(<div class="pills">)[\s\S]*?(</div>)',lambda m:m[1]+'<span>PM · 晚间静默</span><span>建议'+str(minutes)+'分钟 · 最长18分钟</span><span>第'+str(day)+'天</span><span>含答案解析</span>'+m[2],page,count=1)
 page=page.replace('<link rel="stylesheet" href="../pm-v6.css">','')
 page=page.replace('<link rel="stylesheet" href="../pm-seminar.css">','<link rel="stylesheet" href="../pm-seminar.css"><link rel="stylesheet" href="../pm-v6.css">')
 side='<aside class="sidebar"><section class="paper pm-sidebox"><div class="kicker">本课阅读</div><h2>把判断放回情境</h2><p>'+esc(d['focus'])+'</p><p>所标总用时已包含练习、回听（如有）与查看答案；无需额外抄写关键词或填写重复记录。</p><p><a href="../am/day-'+str(day).zfill(2)+'.html">对应早课 →</a></p><p><a href="../index.html">双轨总目录 →</a></p></section></aside>'
 page=re.sub(r'<aside class="sidebar">[\s\S]*?</aside>',lambda _:side,page,count=1)
 assert len(re.findall('data-pm-revision="case-theory-v6-integrated"',page))==1
 assert 'data-completion-id="pm:day-'+str(day).zfill(2)+'"' in page
 write(p,page)
 plain=re.sub('<[^>]+>','',art)
 if day in REVIEWS:budget={'案例与理论':5,'定位回听与一处修订':4,'参考解析':3}
 else:budget={'完整案例':2 if minutes==13 else 3,'融合剖析':5 if minutes<=15 else minutes-10,'错误对照':1 if minutes==13 else 2,'迁移与答案解析':5}
 assert sum(budget.values())==minutes
 manifest.append({'day':day,'title':html.unescape(title),'kind':kind,'minutes':minutes,'minute_budget':budget,'characters':len(html.unescape(plain)),'theory':theorykeys,'exercise':'recording-review' if day in REVIEWS else 'changed-scenario','answers':2,'reference_default':'closed'})
write(ROOT/'pm-v6-manifest.json',json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
# The old five-module DOM converter moves children before rejecting independent
# PM seminars. Skip it before any mutation; AM takes exactly its previous branch.
js=ROOT/'dual-layout.js'
s=read(js)
needle=' const lesson=main&&main.querySelector("article.lesson");'
guard='\n if(mode==="pm"&&lesson?.classList.contains("pm-seminar"))return; // Independent PM seminars own their structure.'
if guard not in s:
 assert needle in s
 s=s.replace(needle,needle+guard,1)
 write(js,s)
print('Built '+str(len(manifest))+' independent PM lessons; minutes '+str(min(x['minutes'] for x in manifest))+'-'+str(max(x['minutes'] for x in manifest))+'.')

# First-week continuous-speaking revision takes precedence over the V6 sources.
# Keep this command PM-only: rebuilding PM never writes any AM page.
if (ROOT/'week1-content.json').exists() and (ROOT/'rebuild-week1.py').exists():
 import subprocess,sys
 subprocess.run([sys.executable,str(ROOT/'rebuild-week1.py'),'--mode','pm'],check=True)

# All evening prose stays open; only model-answer disclosures remain closed.
if (ROOT/'refine-lesson-pages.py').exists():
 import subprocess,sys
 subprocess.run([sys.executable,str(ROOT/'refine-lesson-pages.py'),'--mode','pm'],check=True)

