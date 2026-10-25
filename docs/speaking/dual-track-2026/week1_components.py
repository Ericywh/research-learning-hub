"""Presentation components for the first-week reader; no teaching answers here."""
import html

def esc(s):return html.escape(str(s),quote=True)

PATHS={
 'sun':'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
 'moon':'<path d="M20.4 14A8.6 8.6 0 0 1 10 3.6 8.7 8.7 0 1 0 20.4 14Z"/>',
 'mic':'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/>',
 'book':'<path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15"/>',
 'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 'arrow':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 'back':'<path d="M20 12H4m6-6-6 6 6 6"/>',
 'up':'<path d="m6 11 6-6 6 6M12 5v15"/>',
 'layers':'<path d="m12 3 10 5-10 5L2 8l10-5Zm-9 10 9 5 9-5M3 18l9 5 9-5"/>',
 'speech':'<path d="M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 0 1-2-5 8 8 0 0 1 8-8h3a8 8 0 0 1 8 8Z"/><path d="M7 8h9m-9 5h6"/>',
 'route':'<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h8a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h8"/>',
 'compare':'<path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/>',
 'headphones':'<path d="M3 14v-3a9 9 0 0 1 18 0v3"/><rect x="2" y="12" width="5" height="9" rx="2"/><rect x="17" y="12" width="5" height="9" rx="2"/>',
 'target':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 'spark':'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
 'type':'<path d="m3 20 6-16 6 16M5 15h8m3 5 3-9 3 9m-5-3h4"/>',
 'focus':'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><circle cx="12" cy="12" r="3"/>',
 'shield':'<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
 'quote':'<path d="M10 5H3v8h5c0 3-1 4-4 6m17-14h-7v8h5c0 3-1 4-4 6"/>',
 'note':'<path d="M5 3h11l4 4v14H5V3Zm10 0v5h5M8 12h9m-9 4h7"/>',
}

def icon(name,extra=''):
 return '<svg class="ui-icon '+extra+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+PATHS.get(name,PATHS['note'])+'</svg>'

def scene():
 return '''<div class="speech-scene" aria-hidden="true"><svg viewBox="0 0 380 260" fill="none"><defs><linearGradient id="scene-card" x1="70" y1="30" x2="290" y2="230" gradientUnits="userSpaceOnUse"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#f7f1ff"/></linearGradient><linearGradient id="scene-wave" x1="100" y1="80" x2="290" y2="190"><stop stop-color="#a591d2"/><stop offset="1" stop-color="#7caaa0"/></linearGradient></defs><ellipse cx="200" cy="226" rx="132" ry="15" fill="#8d79b1" opacity=".09"/><circle cx="205" cy="125" r="111" stroke="white" stroke-opacity=".6"/><circle cx="205" cy="125" r="134" stroke="white" stroke-opacity=".35"/><rect x="110" y="37" width="199" height="155" rx="20" transform="rotate(8 110 37)" fill="#e3d9f3" stroke="#f9f4ff"/><rect x="69" y="57" width="235" height="160" rx="20" transform="rotate(-5 69 57)" fill="url(#scene-card)" stroke="#e3d8ef"/><circle cx="104" cy="85" r="5" fill="#b7a4d6"/><circle cx="121" cy="84" r="5" fill="#e8bfad"/><circle cx="138" cy="82" r="5" fill="#afd0bd"/><path d="M97 111 219 101M98 122l90-8" stroke="#d1c3e3" stroke-width="5" stroke-linecap="round"/><path d="M105 158v11m15-20v25m15-39v52m15-39v27m15-58v86m15-63v39m15-50v60m15-37v13m15-24v34m15-51v61m15-42v22" stroke="url(#scene-wave)" stroke-width="7" stroke-linecap="round"/><rect x="264" y="84" width="66" height="66" rx="19" fill="#fffaf4" stroke="#eadbc8"/><rect x="287" y="97" width="15" height="25" rx="7.5" stroke="#b59d85" stroke-width="2"/><path d="M281 115v3a14 14 0 0 0 28 0v-3m-14 17v8m-7 0h14" stroke="#b59d85" stroke-width="2" stroke-linecap="round"/><rect x="37" y="151" width="63" height="57" rx="17" fill="#eef7f0" stroke="#d7e8dd"/><path d="M52 170h31m-31 8h24m-24 8h17" stroke="#92b29c" stroke-width="3" stroke-linecap="round"/><circle cx="309" cy="202" r="8" fill="#c7b8dd"/><circle cx="61" cy="58" r="5" fill="#ead0c3"/><path d="m337 40 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill="#c1afd9"/></svg></div>'''

SHORT=['基线','主旨','理由','例子','脱稿','接续','周测']
def week_route(day=None,mode='am',catalog=False):
 links=[]
 for n,label in enumerate(SHORT,1):
  href=f'#d{n}' if catalog else f'../{mode}/day-{n:02}.html'
  current=' aria-current="page"' if n==day else ''
  labelhtml='<small>'+label+'</small>' if catalog else ''
  links.append(f'<a href="{href}"{current}><span>{n:02}</span>{labelhtml}</a>')
 title='第一周练习路线' if catalog else '本周位置'
 return '<nav class="week-route '+('route-full' if catalog else 'route-mini')+'" aria-label="'+title+'"><div class="route-caption">'+icon('route')+'<span>'+title+'</span>'+('' if catalog else f'<b>{day:02} / 07</b>')+'</div><div class="route-nodes">'+''.join(links)+'</div></nav>'

def mode_switch(day,mode,minutes):
 out=[]
 for m,label,time,symbol in [('am','晨间实训','18分钟','sun'),('pm','晚间精讲',f'建议{minutes}分钟','moon')]:
  state=' aria-current="page"' if m==mode else ''
  out.append(f'<a href="../{m}/day-{day:02}.html"{state}>{icon(symbol)}<span><b>{m.upper()} · {label}</b><small>{time}</small></span></a>')
 return '<nav class="mode-switch" aria-label="同日早晚课切换">'+''.join(out)+'</nav>'

def lesson_strip(mode,minutes):
 return '<div class="lesson-facts">'+''.join('<div>'+icon(symbol)+'<span><small>'+caption+'</small><b>'+value+'</b></span></div>' for symbol,caption,value in [('mic' if mode=='am' else 'book','本课方式','真实开口' if mode=='am' else '静默精讲'),('clock','学习用时',('18分钟' if mode=='am' else f'建议{minutes}分钟')),('layers','练后参考','双示范与解析')])+'</div>'

def reader_tools():
 return '<div class="reader-tools"><span class="reader-caption">'+icon('book')+'阅读工具</span><div class="reader-actions"><button type="button" data-reader-size aria-pressed="false">'+icon('type')+'<span>大字阅读</span></button><button type="button" data-reader-focus aria-pressed="false">'+icon('focus')+'<span>专注阅读</span></button><a href="#lesson-content">'+icon('arrow')+'进入正文</a></div><span class="reader-status" data-reader-status aria-live="polite"></span></div>'

def study_flow(mode,guarded):
 steps=(['独立首录','封存评分','练后教学'] if mode=='am' else ['先封存早课首录','保留独立评分','再展开晚课']) if guarded else (['独立表达','回听与重说','新情境迁移'] if mode=='am' else ['完整案例','理论与判断','迁移与解析'])
 # This repeats the prescribed order without disclosing an answer or framework.
 return '<section class="study-flow"><div>'+icon('route')+'<b>学习顺序</b></div><ol>'+''.join('<li><i>'+str(i)+'</i><span>'+s+'</span></li>' for i,s in enumerate(steps,1))+'</ol></section>'

def sequential_nav(day,mode,data):
 index=(day-1)*2+(mode=='pm');previous=index-1;following=index+1;links=[]
 for number,label in [(previous,'上一课'),(following,'下一课')]:
  if number<0:href='../chapter-01.html';name='第一周课程目录'
  elif number>=14:href='../am/day-08.html';name='第08天 · 晨间实训'
  else:
   n=number//2+1;m='am' if number%2==0 else 'pm';href=f'../{m}/day-{n:02}.html';name=f'第{n:02}天 · '+data[n-1][m+'_title']
   if day in (1,7):name=f'第{n:02}天 · '+('晨间实训' if m=='am' else '晚间精讲')
  links.append('<a href="'+href+'">'+icon('back' if label=='上一课' else 'arrow')+'<span><small>'+label+'</small><b>'+esc(name)+'</b></span></a>')
 return '<nav class="sequential-nav" aria-label="相邻课程">'+''.join(links)+'</nav>'

def panel_badge(title):
 if '错误' in title:return 'compare','EXPRESSION CHECK · 错误对照'
 if '迁移' in title:return 'route','TRANSFER · 情境迁移'
 if '主案例' in title:return 'speech','CASE STUDY · 完整案例'
 if '任务' in title or '首次' in title or '测评条件' in title:return 'target','TODAY’S TASK · 独立任务'
 if '回听' in title or '诊断' in title:return 'headphones','LISTEN & REVIEW · 回听分析'
 if '准备' in title or '表达' in title or '重说' in title:return 'mic','SPEAKING PRACTICE · 开口练习'
 if '后续' in title:return 'note','NEXT PRACTICE · 后续练习'
 return 'layers','IDEAS & STRUCTURE · 思路分析'
