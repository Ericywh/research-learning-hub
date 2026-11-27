(function speakingApp(){
"use strict";
const KEY="speaking-coach-8w:personal:v1", PREF="speaking-coach-8w:preferences:v1", SECRET="speaking-coach-8w:session-credential";
const $=id=>document.getElementById(id), E=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad=n=>String(n).padStart(2,"0"), clock=s=>pad(Math.floor(Math.max(0,s)/60))+":"+pad(Math.max(0,s)%60);
const labels=["破题贴题","逻辑骨架","例证画面","情境适配","声音节奏","体态目光"], keys=["opening","structure","evidence","context","voice","posture"];
const weakLabels=["开口启动","思路形成","内容展开","卡壳恢复","脱稿程度"];
const warmText="有时候，我们准备了很多材料，却忘了听众真正想知道什么。先问一句：他现在最需要什么？如果答案还不清楚，就找一个具体场景。把重点讲明白，留一点时间让对方思考，再告诉他下一步可以怎样做。";
const defaults=()=>({version:1,current:1,units:{},records:[],cases:[],maintenance:[]});
const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||"null")??f()}catch{return f()}};
let state=load(KEY,defaults), pref=load(PREF,()=>({mode:"local",endpoint:"",model:"",auto:false,reveal:"strict",frames:false})),credential={};
try{credential=JSON.parse(sessionStorage.getItem(SECRET)||"{}")}catch{}
if(!state.units||!Array.isArray(state.records))state=defaults();
let data,unit=1,mode="full",view="home",session=null,current=null,stream=null,rec=null,audioRec=null,ticker=null,auxTimer=null,beeper=null,storageWarn="",activeReview=0,phase="",epoch=0,preparing=false,stopping=false;
const app=$("app"),dialog=$("drawer"),body=$("drawer-body");
const U=()=>data.units[unit-1], R=n=>state.units[n]??(state.units[n]={}), baselineOK=()=>state.units[1]?.complete===true;
const busy=()=>["prepare","record"].includes(phase)||stopping||preparing;
const aiReady=()=>pref.mode==="worker"?!!(pref.endpoint&&credential.token):pref.mode==="gemini"?!!(pref.model&&credential.key):false;
function persist(){
 try{localStorage.setItem(KEY,JSON.stringify(state));storageWarn=""}catch{storageWarn="本机存储不足或被禁用，请及时导出JSON备份。"}
 window.dispatchEvent(new Event("speaking:progress-applied"));
}
function savePref(){try{localStorage.setItem(PREF,JSON.stringify(pref))}catch{}}
function notice(m,cls="error"){const el=$("message");if(el){el.className=cls;el.textContent=m}else alert(m)}
const primary=(label,act,attrs="")=>`<button class="primary" data-action="${act}" ${attrs}>${E(label)}</button>`;
const secondary=(label,act,attrs="")=>`<button class="secondary" data-action="${act}" ${attrs}>${E(label)}</button>`;
const details=(title,content)=>`<details><summary>${E(title)}</summary><div class="inner">${content}</div></details>`;
const textBlock=s=>`<div class="source-text">${E(s)}</div>`;
function syncNav(){const a=data&&U().assessment&&!session?.unlocked;$("framework").hidden=!baselineOK()||a;$("assets").hidden=!!a;$("settings").disabled=busy();$("rules").disabled=busy()}
function show(html){app.innerHTML=(session&&!session.finished&&!["home","pm"].includes(view)?`<div class="session-budget"><span>本轮 AM ${session.mode==="mini"?5:U().minutes} 分钟 · 已用 <b id="session-elapsed">00:00</b></span></div>`:"")+html+(storageWarn?`<p class="warning">${E(storageWarn)}</p>`:"");syncNav();window.scrollTo({top:0,behavior:"instant"})}
function stopTracks(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
function clearClock(){if(ticker)clearInterval(ticker);ticker=null}
function clearAux(){if(auxTimer)clearInterval(auxTimer);auxTimer=null}
function closeDrawer(){if(dialog.open)dialog.close()}
function drawer(title,html){$("drawer-title").textContent=title;body.innerHTML=html;dialog.showModal()}
function recordMeta(r){return state.records.find(x=>x.id===r.id)}
function updateMeta(r,fields){const row=recordMeta(r);if(row)Object.assign(row,fields);persist()}
function completeCount(){return data.units.filter(x=>state.units[x.id]?.complete).length}
function chooseUnit(n){unit=Math.max(1,Math.min(48,Number(n)||1));state.current=unit;persist();view="home";renderHome()}
function tileClasses(n){let x=state.units[n]||{};return [x.complete?"done":x.mini?"mini":x.pm?"pm":"",x.real?"real":"",n===unit?"current":""].filter(Boolean).join(" ")}
function renderHome(){
 view="home";phase="";syncNav();const u=U(),num=completeCount(),miniOK=!u.assessment&&u.id!==45&&u.week!==5&&u.duration<=90&&![31,35,42,44,48].includes(u.id);
 if(mode==="mini"&&!miniOK)mode="full";
 const stages=["即兴急救","故事与科普","会议与礼仪","评议与问答","声音与台风","演讲结构","长演讲","综合实战"];
 let grid="";for(let w=1;w<=8;w++){grid+=`<div class="week"><label>W${w} · ${stages[w-1]}</label><div class="tiles">`;for(let d=1;d<=6;d++){let n=(w-1)*6+d;grid+=`<button class="tile ${tileClasses(n)}" data-action="unit" data-n="${n}" title="${E(data.units[n-1].title)}" aria-label="第${n}单元">${pad(n)}</button>`}grid+="</div></div>"}
 show(`<section class="card hero"><p class="kicker">TODAY'S PRACTICE · W${u.week} / D${u.day}</p><div class="row"><span class="pill">第${pad(unit)}单元 / 48</span><span class="pill">${u.assessment?"独立测评":u.week===5?"声画专项":"核心训练"}</span>${R(unit).complete?'<span class="pill">已完整训练</span>':""}</div><h1 style="margin-top:18px">${E(u.title)}</h1><p class="muted">前晚10分钟轻建模 · 次晨${u.minutes}分钟开口</p><div class="mode">${["full","combined","mini"].map((m,i)=>`<button data-action="mode" data-mode="${m}" class="${mode===m?"selected":""}" ${m==="mini"&&!miniOK?"disabled":""}>${["完整训练","一站式","5分钟保底"][i]}</button>`).join("")}</div><div class="actions">${secondary(R(unit).pm?"复习 PM（已记录）":"前晚 PM · 10 分钟","pm")}${primary(mode==="mini"?"开始保底练习":mode==="combined"?"开始一站式训练":"开始 AM 开口","am")}</div>${u.assessment?'<p class="small" style="margin-top:12px">题卡按规定逐张揭示，框架及练后示范不会提前显示。</p>':""}<p id="message"></p></section><section class="card"><div class="section-title"><h3>八周训练进度</h3><span class="muted">${num} / 48 完整训练</span></div><div class="bar"><span style="width:${100*num/48}%"></span></div><div class="week-grid">${grid}</div><div class="legend"><span><i style="background:#dce8ff"></i>PM 已完成</span><span><i style="background:#ccece0"></i>AM 完整</span><span><i style="background:#fbe9c8"></i>保底</span><span><i style="background:#0f766e"></i>真实应用已记录</span></div><p class="small">每周第7天为休整或补练。已阅读不等于已训练；历史课程不计入本版进度。</p></section>`);
}
function startAux(seconds,onEnd){
 clearAux();let end=performance.now()+seconds*1000;const draw=()=>{let left=Math.max(0,Math.ceil((end-performance.now())/1000));let e=$("aux-clock");if(e)e.textContent=clock(left);let t=$("aux-track");if(t)t.style.width=(100*(seconds-left)/seconds)+"%";if(!left){clearAux();if(onEnd)onEnd()}};draw();auxTimer=setInterval(draw,200);
}
function renderPM(){
 view="pm";let u=U(),pm=u.pm.split(/计时[:：]/)[0].trim(),pieces=pm.match(/^(.*?)反例[：:](.*?)正例[：:](.*)$/s);
 show(`<section class="card"><p class="kicker">U${pad(unit)} · PM</p><h2>${u.assessment?"前晚设备检查":"轻建模 · "+E(u.title)}</h2>${u.assessment?`<div class="pm-text">${E(pm)}</div><label class="check"><input type="checkbox" id="device-check">手机、支架、收音、独立计时器和存档目录已准备</label>`:pieces?`<h3>核心方法</h3><div class="pm-text">${E(pieces[1])}</div><div class="panel"><h3>反例</h3><p>${E(pieces[2])}</p><h3>正例与静默预演</h3><p>${E(pieces[3])}</p></div>`:`<div class="pm-text">${E(pm)}</div>`}${u.assessment?"":`<div class="timer" id="aux-clock">${mode==="combined"?"02:00":"04:00"}</div><p class="timer-label">静默预演 · ${mode==="combined"?"一站式5分钟中的预演":"PM最后4分钟"}</p><div class="track"><div id="aux-track" style="width:0"></div></div>${secondary("开始静默计时","pm-timer")}`}<div class="actions">${secondary("返回今日","home")}${primary(u.assessment?"设备已检查":"已完成脑内预演","pm-done")}</div><p id="message"></p></section>`)
}
function shuffle(a){let b=[...a];for(let i=b.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function taskCard(c){const x=data.cards[c];return {key:c,label:"题卡 "+c,task:x.task,prep:x.prepare,seconds:x.duration,kind:"first",sealed:true}}
function mainTask(u,key="U"+pad(u.id),label="正式题",seconds=u.duration,prep=u.prepare,task=u.task){return {key,label,task,prep,seconds,kind:"first",sealed:u.assessment}}
function makePlan(u,m){
 if(m==="mini")return [mainTask(u,"U"+pad(u.id),"保底首录",60,10)];
 if([1,46,24,47].includes(u.id))return u.cards.map(taskCard);
 if([6,18,43].includes(u.id))return shuffle(u.cards).map(taskCard);
 if(u.id===12)return [taskCard(u.cards[Math.random()<.5?0:1])];
 if(u.id===45)return [mainTask(u,"U45","主演讲",300,60),...u.cards.map(taskCard)];
 if(u.id===40)return [mainTask(u,"U40-cut","中途打断演练",240,60),mainTask(u,"U40","完整两分钟压缩版",120,10)];
 if(u.id===38)return [mainTask(u,"U38-expert","面向专家",120,20,u.task+"\n本轮面向评审专家。"),mainTask(u,"U38-public","面向大众",120,20,u.task+"\n本轮面向本科新生。")];
 if([31,35].includes(u.id))return [mainTask(u,"U"+pad(u.id)+"-A","第一种路径"),mainTask(u,"U"+pad(u.id)+"-B","第二种路径")];
 return [mainTask(u)];
}
function startSession(){
 if(session&&!confirm("当前训练尚未结束。返回新训练会结束本轮内存回放；请先保存需要的录像。继续？"))return;
 clearAux();stopTracks();if(session)session.records.forEach(x=>{if(x.url)URL.revokeObjectURL(x.url)});
 const u=U();
 session={id:Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7),unit,mode,started:Date.now(),plan:makePlan(u,mode),at:0,records:[],firsts:[],selected:0,unlocked:false,revisionDone:false,transferDone:false,weak:"",real:false,feedback:"",warmDone:0,warmups:[],finished:false};
 if(u.week===5&&mode!=="mini"){view="warm";renderWarm(0)}else if(u.id===44){view="precase";renderCasePrep()}else if(u.id===48){view="premaint";renderMaintenancePrep()}else launch(session.plan[0]);
}
function renderWarm(step){
 clearAux();view="warm";const u=U(),instruction=u.schedule[step]||"按本课熟段要求练习。";
 show(`<section class="card"><p class="kicker">第5周 · 熟段孤立训练 ${step+1}/2</p><h2>${step===0?"2分钟舒适热身":"6分钟单一动作练习"}</h2><div class="prompt">${E(warmText)}</div><p>${E(instruction)}</p>${unit===29?`<p class="warning">自然呼吸即可，不憋气、不追求吸满；不适立即停止。先松肩、舒适呼吸，再感受脚掌支撑，最后说清第一句。</p>${secondary("可选60秒上台前准备","breath")}`:""}<div class="timer" id="aux-clock">${step===0?"02:00":"06:00"}</div><div class="track"><div id="aux-track" style="width:0"></div></div><div class="actions">${secondary("开始阶段计时","warm-timer",`data-step="${step}"`)}${primary(step===0?"热身完成":"录制熟段两遍","warm-next",`data-step="${step}"`)}</div><p class="small">该阶段不显示正式新题；只练本课的一个动作。</p><p id="message"></p></section>`);
}
function renderCasePrep(){show(`<section class="card"><p class="kicker">U44 · 素材积累</p><h2>先整理可核实的案例</h2><p>在原有10分钟整理槽中编辑8—10个候选案例。没有真实材料就留空。</p>${secondary("打开案例卡","open-assets")}<div class="actions">${primary("进入60秒口述","launch-main")}</div></section>`)}
function renderMaintenancePrep(){show(`<section class="card"><p class="kicker">U48 · 复盘</p><h2>先核对自己的实际记录</h2><p>查看原始录像和自评，确定一项保持、一项待改，再制定90天维持计划。</p>${secondary("打开成长与维护","open-assets")}<div class="actions">${primary("开始口述计划","launch-main")}</div></section>`)}
function launch(task){
 clearAux();clearClock();stopTracks();current={...task,shown:!task.sealed,send:pref.auto&&aiReady()&&unit!==42,source:session.captureMode||"video",video:(session.captureMode||"video")==="video",frames:[],frameChoice:pref.frames,kind:task.kind||"first",deviceError:""};view="task";phase="ready";renderTask()
}
function steps(k){return `<div class="steps">${["准备","首录","复盘","重录 / 迁移"].map((x,i)=>`<div class="step ${i===k?"on":i<k?"past":""}">${i+1} ${x}</div>`).join("")}</div>`}
function renderTask(){
 const t=current,u=U(),idx=t.kind==="first"?1:t.kind==="warm"?0:3,external=t.source==="external";
 let question=t.shown?`<div class="prompt" id="prompt-text">${E(t.task)}</div>`:`<div class="panel" style="text-align:center;padding:32px"><p>本张题卡未揭示</p>${primary("翻牌读题","reveal-card")}</div>`;
 let visible=t.shown;
 show(steps(idx)+`<section class="card"><div class="row"><span class="pill">U${pad(unit)} · ${E(t.label)}</span><span class="pill">${t.prep}秒准备 / ${t.seconds}秒发言</span></div><h2 style="margin-top:12px">${E(u.title)}</h2>${question}${visible?`<div class="camera ${external?"timer-only":t.source==="audio"?"audio":""}" id="camera"><video id="preview" muted playsinline autoplay hidden></video><span class="placeholder" id="preview-hint">${external?"独立计时 · 手机或其他设备录音":"可连接设备，也可直接开始计时"}</span></div>${unit===27?'<label class="check"><input id="gaze-guide" type="checkbox">显示左、中、右目光提示点</label>':""}<div id="media-controls" class="row" style="margin-top:12px"><label><input type="radio" name="media" value="video" ${t.source==="video"?"checked":""}> 视频</label><label><input type="radio" name="media" value="audio" ${t.source==="audio"?"checked":""}> 纯音频（体态未测）</label><label class="external-option"><input type="radio" name="media" value="external" ${external?"checked":""}> 仅计时 / 手机录音</label></div>${external?'<p class="small preflight">准备结束后用手机开始录音或录像；发言结束后导入本地文件。</p>':""}${t.deviceError?`<p class="warning preflight">${E(t.deviceError)}<br>Windows：设置 → 隐私和安全性 → 麦克风／摄像头。也可直接使用系统 Chrome 或 Edge。</p>`:""}<label class="check preflight"><input type="checkbox" id="send-ai" ${t.send?"checked":""} ${!aiReady()||external?"disabled":""}>本轮发送音频至已配置AI ${!aiReady()?"（未配置本轮凭证，保持本地）":""}</label>${pref.mode!=="local"?`<label class="check preflight"><input type="checkbox" id="send-frames" ${t.frameChoice&&unit!==42?"checked":""}>另行同意发送最多3张低清画面（可选）</label>`:""}${t.sealed?`<label class="check preflight"><input type="checkbox" id="familiar" ${t.familiar?"checked":""}>以前已接触过这道题（如实记录）</label>`:""}<div class="timer" id="clock">${clock(t.prep)}</div><p class="timer-label" id="clock-label">读完题后再开始准备</p><div class="track"><div id="count-track" style="width:0"></div></div><div id="special-note" class="status" hidden></div><div class="actions" id="record-actions">${!external?secondary("连接设备","device")+secondary("检测设备","detect-device"):""}${primary("开始准备","start-prep",'id="begin"')}</div>`:""}<div class="actions" id="task-back">${secondary("暂停本轮并返回","cancel")}</div><p id="message"></p></section>`);
 if(stream&&visible&&!external)attachPreview();
}
function attachPreview(){let v=$("preview");if(v){v.hidden=!current.video;v.srcObject=stream;v.play().catch(()=>{});$("preview-hint").hidden=current.video;if(!current.video)$("preview-hint").textContent="麦克风已连接 · 纯音频"}}
function supportedType(video){let choices=video?["video/webm;codecs=vp8,opus","video/webm","video/mp4"]:["audio/webm;codecs=opus","audio/ogg;codecs=opus","audio/mp4","audio/webm"];return choices.find(x=>MediaRecorder.isTypeSupported(x))||""}
function captureSource(){return document.querySelector('input[name="media"]:checked')?.value||current?.source||"video"}
function deviceMessage(e){let n=e?.name||"",m=String(e?.message||"");if(n==="NotFoundError"||n==="DevicesNotFoundError"||/device not found|no device/i.test(m))return "浏览器没有找到所需麦克风或摄像头，可能是设备未接入、系统未识别或内置浏览器无法访问。";if(n==="NotAllowedError"||n==="SecurityError"||n==="PermissionDeniedError")return "浏览器或系统没有授予录音权限。";if(n==="NotReadableError"||n==="TrackStartError")return "设备无法读取，可能被其他应用占用。";if(n==="OverconstrainedError")return "设备参数不受支持，请选择系统默认设备。";return "无法连接设备："+(m||n||"当前浏览器不支持录制")}
async function detectDevices(){if(busy())return;try{if(!navigator.mediaDevices?.enumerateDevices)throw Error("当前浏览器不支持设备检测");const d=await navigator.mediaDevices.enumerateDevices();notice("浏览器可见 "+d.filter(x=>x.kind==="audioinput").length+" 个麦克风、"+d.filter(x=>x.kind==="videoinput").length+" 个摄像头。未授权时清单可能不完整。","status")}catch(e){notice(deviceMessage(e),"warning")}}
function rememberFamiliar(){if(current&&$("familiar"))current.familiar=$("familiar").checked}
async function getDevice(){
 if(preparing||busy()||!current)return;rememberFamiliar();preparing=true;const mine=++epoch;try{
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw Error("当前浏览器不支持录制，请用支持MediaRecorder的HTTPS浏览器。");
  stopTracks();current.source=captureSource();current.video=current.source==="video";if(current.source==="external")return;
  const s=await navigator.mediaDevices.getUserMedia({audio:true,video:current.video?{width:{ideal:720},height:{ideal:480},facingMode:"user"}:false});
  if(mine!==epoch||view!=="task"){s.getTracks().forEach(t=>t.stop());return}stream=s;session.captureMode=current.source;current.deviceError="";attachPreview();if(!current.video)$("camera").classList.add("audio");
  try{beeper??=new (window.AudioContext||window.webkitAudioContext)();await beeper.resume()}catch{}
 }catch(e){if(mine===epoch&&view==="task"){stopTracks();current.deviceError=deviceMessage(e);current.source="external";current.video=false;current.send=false;session.captureMode="external";renderTask();notice("已切换到独立计时，直接点击开始准备即可。","status")}}finally{preparing=false;syncNav()}
}
function beep(){try{if(!beeper)return;let o=beeper.createOscillator(),g=beeper.createGain();o.frequency.value=660;g.gain.setValueAtTime(.06,beeper.currentTime);g.gain.exponentialRampToValueAtTime(.0001,beeper.currentTime+.13);o.connect(g).connect(beeper.destination);o.start();o.stop(beeper.currentTime+.15)}catch{}}
function tickCountdown(seconds,label,onDone,onTick){clearClock();const start=performance.now(),end=start+seconds*1000;function draw(){const elapsed=Math.max(0,(performance.now()-start)/1000),left=Math.max(0,Math.ceil((end-performance.now())/1000));if($("clock"))$("clock").textContent=clock(left);if($("clock-label"))$("clock-label").textContent=label;if($("count-track"))$("count-track").style.width=Math.min(100,elapsed/Math.max(1,seconds)*100)+"%";if(onTick)onTick(elapsed);if(!left){clearClock();onDone()}}if(seconds<=0){onDone();return}ticker=setInterval(draw,100);draw()}
function startPrep(){
 if(busy()||!current?.shown)return;rememberFamiliar();current.source=captureSource();if(!stream&&current.source!=="external"){if(!confirm("未连接录音设备。是否使用独立计时，并在结束后导入手机录音？"))return;current.source="external"}if(current.source==="external"){stopTracks();current.video=false;current.send=false;current.frameChoice=false;renderTask()}else{current.send=!!$("send-ai")?.checked&&aiReady();current.frameChoice=current.video&&current.send&&!!$("send-frames")?.checked}session.captureMode=current.source;
 phase="prepare";document.body.classList.add("recording");$("record-actions").innerHTML=secondary("取消准备","cancel-prep");$("task-back").hidden=true;
 try{beeper??=new (window.AudioContext||window.webkitAudioContext)();beeper.resume().catch(()=>{})}catch{}
 tickCountdown(current.prep,"准备倒计时",()=>{beep();if(current.source==="external"||!stream)beginExternal();else beginRecord()})
}
function beginExternal(){
 if(!current||phase!=="prepare")return;current.source="external";current.video=false;current.send=false;current.frameChoice=false;session.captureMode="external";
 phase="record";startedAt=performance.now();lastFlags={};$("record-actions").innerHTML='<button class="danger" data-action="stop-record">结束发言</button>';
 $("special-note").hidden=false;$("special-note").textContent="现在开始说话 · 同时开启手机录音/录像";
 tickCountdown(current.seconds,"发言倒计时 · 仅计时",()=>endExternal(),elapsed=>{
 if(unit===5&&current.kind==="first"&&elapsed>=35&&!lastFlags.pause){lastFlags.pause=true;$("special-note").textContent="主动停顿2秒，然后接续"}
 if(unit===23&&current.kind==="revision"&&elapsed>=60&&!lastFlags.close){lastFlags.close=true;beep();$("special-note").textContent="只剩30秒，请收束"}
 if(current.key==="U40-cut"&&elapsed>=120&&!lastFlags.cut){lastFlags.cut=true;beep();$("special-note").textContent="模拟投影中断 · 脱屏收束"}
 });
}
function endExternal(){if(phase!=="record"||current?.source!=="external")return;clearClock();beep();current.timerSeconds=Math.max(0,Math.round((performance.now()-startedAt)/100)/10);phase="";view="external";document.body.classList.remove("recording");renderExternal()}
function renderExternal(){const t=current;show(steps(t.kind==="first"?2:3)+`<section class="card"><p class="kicker">独立计时完成 · ${E(t.label)}</p><h2>${clock(Math.round(t.timerSeconds))} · 保存本轮发言</h2><div class="panel"><h3>导入本轮的真实音视频</h3><p>在手机或其他软件停止录制，把文件传到当前设备。选择文件仅用于本机回放，不会自动上传。</p><label class="check"><input type="checkbox" id="external-attest">这是按本题计时录下的原始发言，未拼接或重做。</label><div class="actions">${primary("选择本地录音 / 录像","external-pick")}</div><input id="external-file" type="file" accept="audio/*,video/*,.mp3,.m4a,.wav,.webm,.ogg,.aac,.flac,.mp4,.mov" hidden><p class="small">支持浏览器可解码的文件；读取不到准确时长时记为未核验。</p></div><div class="actions">${secondary("没有录音 · 仅保留计时","timer-only-save")}${secondary("返回本轮题目","external-retry")}</div><p class="small">仅计时不计为完整AM或有效基线；声音、体态未测。</p><p id="message"></p></section>`)}
function inspectMedia(file){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(file),v=document.createElement("video");let settled=false;const done=(err)=>{if(settled)return false;settled=true;clearTimeout(deadline);v.removeAttribute("src");try{v.load()}catch{}if(err){URL.revokeObjectURL(url);reject(err)}return true};const deadline=setTimeout(()=>done(Error("无法读取媒体信息，请试用MP3、M4A、WAV或MP4")),8000);v.preload="metadata";v.onloadedmetadata=()=>{let seconds=Number.isFinite(v.duration)&&v.duration>0?Math.round(v.duration*10)/10:null,video=v.videoWidth>0&&v.videoHeight>0;if(done())resolve({url,seconds,video})};v.onerror=()=>done(Error("浏览器无法解码此文件"));v.src=url})}
async function importExternal(file){if(view!=="external"||!current||!file)return;const t=current;if(!$("external-attest")?.checked){notice("请先确认这是本轮原始发言。");return}if(file.size<=0||file.size>300*1024*1024||!(/^(audio|video)\//.test(file.type)||/\.(mp3|m4a|wav|webm|ogg|aac|flac|mp4|mov)$/i.test(file.name))){notice("请选择可播放的音视频文件（最大300MB）。");return}notice("正在读取本地文件……","status");try{let info=await inspectMedia(file);if(current!==t||view!=="external"){URL.revokeObjectURL(info.url);return}let known=info.seconds!==null,seconds=known?info.seconds:t.timerSeconds;saveCapture(t,{blob:file,url:info.url,seconds,video:info.video,source:"external",name:file.name,downloaded:true,verified:known,attested:true,timerSeconds:t.timerSeconds,noMedia:false,short:!known||Math.abs(seconds-t.seconds)>3||Math.abs(t.timerSeconds-t.seconds)>3})}catch(e){notice(e.message)}}
function saveTimerOnly(){if(view!=="external"||!current)return;if(!confirm("本轮没有真实录音，只记录实际计时与自我回忆，不计完整训练或有效录像测评。继续？"))return;let t=current;saveCapture(t,{seconds:t.timerSeconds,video:false,source:"timer",name:"仅计时",downloaded:true,verified:false,noMedia:true,short:true,timerSeconds:t.timerSeconds})}
function newRecorder(s,isVideo){const mime=supportedType(isVideo),options=mime?{mimeType:mime}:{};if(!isVideo)options.audioBitsPerSecond=24000;try{return new MediaRecorder(s,options)}catch{return new MediaRecorder(s)}}
function collect(r){let chunks=[];let done=new Promise((resolve,reject)=>{r.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};r.onstop=()=>resolve(new Blob(chunks,{type:r.mimeType||chunks[0]?.type}));r.onerror=e=>reject(e.error||Error("录制失败"))});return done}
let capturedPromise,audioPromise,startedAt,frameMarks=[],lastFlags={};
function beginRecord(){
 if(phase!=="prepare")return;if(!stream){beginExternal();return}
 try{
  phase="record";lastFlags={};current.frames=[];rec=newRecorder(stream,current.video);capturedPromise=collect(rec);
  audioRec=null;audioPromise=null;
  if(current.video&&current.send&&stream.getAudioTracks().length){try{audioRec=newRecorder(new MediaStream(stream.getAudioTracks()),false);audioPromise=collect(audioRec);audioRec.start(1000)}catch{audioRec=null;audioPromise=null}}
  rec.start(1000);startedAt=performance.now();
  frameMarks=current.frameChoice?[5,current.seconds/2,Math.max(6,current.seconds-10)].filter((v,i,a)=>v<current.seconds&&a.indexOf(v)===i):[];
  $("record-actions").innerHTML=`<button class="danger" data-action="stop-record">结束录制</button>`;
  $("special-note").hidden=false;$("special-note").textContent="正在本地录制 · 自然表达";
  tickCountdown(current.seconds,"发言倒计时",()=>stopRecord(),elapsed=>{
    if(current.kind==="first"&&unit===5&&elapsed>=35&&!lastFlags.pause){lastFlags.pause=true;$("special-note").textContent="主动停顿2秒，然后接续";$("special-note").classList.add("flash")}
    if(current.kind==="revision"&&unit===23&&elapsed>=60&&!lastFlags.close){lastFlags.close=true;beep();$("special-note").textContent="只剩30秒，请收束"}
    if(current.key==="U40-cut"&&elapsed>=120&&!lastFlags.cut){lastFlags.cut=true;beep();$("camera").classList.add("black");$("special-note").textContent="投影中断 · 只剩2分钟，脱屏收束"}
    if(current.frameChoice)frameMarks.forEach((m,i)=>{if(elapsed>=m&&!lastFlags["f"+i]){lastFlags["f"+i]=true;const v=$("preview");if(v?.videoWidth){let c=document.createElement("canvas");c.width=320;c.height=Math.round(v.videoHeight*320/v.videoWidth);c.getContext("2d").drawImage(v,0,0,c.width,c.height);current.frames.push(c.toDataURL("image/jpeg",.55))}}});
  })
 }catch(e){clearClock();try{if(rec&&rec.state!=="inactive")rec.stop();if(audioRec&&audioRec.state!=="inactive")audioRec.stop()}catch{}stopTracks();current.deviceError="网页录制未启动："+(e.message||"设备异常");current.source="external";phase="prepare";beginExternal();$("special-note").textContent="录制设备不可用，已改为独立计时；请用手机录音。"}
}
function saveCapture(t,meta,audio=null,frames=[]){
 const date=new Date(),blob=meta.blob||null,seconds=meta.seconds,video=!!meta.video,noMedia=!!meta.noMedia;
 let ext=blob?.type?.includes("mp4")?(video?"mp4":"m4a"):blob?.type?.includes("ogg")?"ogg":"webm";
 const name=meta.name||("W"+U().week+"_U"+pad(unit)+"_"+t.label.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g,"")+"_"+date.toISOString().slice(0,10).replace(/-/g,"")+"_"+Date.now()+"."+ext);
 const r={id:session.id+"-"+session.records.length,key:t.key,kind:t.kind,label:t.label,task:t.task,prep:t.prep,target:t.seconds,seconds,video,blob,url:meta.url||(blob?URL.createObjectURL(blob):null),name,source:meta.source||"browser",verified:meta.verified!==false,noMedia,timerSeconds:meta.timerSeconds??null,attested:meta.attested??null,scoreDraft:[undefined,undefined,undefined,undefined,noMedia?null:undefined,video?undefined:null],seen:!!t.familiar,oral:undefined,locked:false,downloaded:!!meta.downloaded,short:!!meta.short,aiStatus:t.send&&audio?"分析中":"本地自评 / 免费AI网页",ai:null,aiShown:false,fix:"",weak:""};
 session.records.push(r);state.records.push({id:r.id,session:session.id,unit,key:r.key,kind:r.kind,label:r.label,prep:r.prep,target:r.target,seconds:r.seconds,video:r.video,name,date:date.toISOString(),source:r.source,verified:r.verified,noMedia:r.noMedia,timerSeconds:r.timerSeconds,attested:r.attested,short:r.short,familiar:r.seen,score:null,oral:null,ai:null,downloaded:r.downloaded,mode:session.mode});persist();
 stopTracks();document.body.classList.remove("recording");phase="";view="captured";current=null;stopping=false;
 if(t.kind==="first")session.firsts.push(r);if(t.kind==="warm")session.warmups.push(r);if(t.kind==="revision")session.revisionDone=true;if(t.kind==="transfer")session.transferDone=true;
 if(t.send&&audio&&t.kind!=="warm"&&r.source==="browser")runAI(r,audio,frames);else if(t.send&&!audio)r.aiStatus="未取得独立音频，请用免费AI网页或本地自评";
 renderCaptured(r)
}
async function stopRecord(){
 if(current?.source==="external"){endExternal();return}
 if(stopping||phase!=="record")return;stopping=true;clearClock();
 const t=current,seconds=Math.max(0,Math.round((performance.now()-startedAt)/100)/10);$("record-actions").innerHTML='<span class="muted">正在封存录制……</span>';
 try{
  if(rec?.state!=="inactive")rec.stop();if(audioRec&&audioRec.state!=="inactive")audioRec.stop();let blob=await capturedPromise;let audio=t.video?(audioPromise?await audioPromise.catch(()=>null):null):blob;
  if(!blob.size)throw Error("录制为空，请检查权限后重试");
  saveCapture(t,{blob,seconds,video:t.video,source:"browser",short:seconds<t.seconds-2||seconds>t.seconds+3},audio,t.frames);
 }catch(e){stopTracks();document.body.classList.remove("recording");phase="";stopping=false;t.source="external";t.send=false;t.video=false;t.timerSeconds=seconds;view="external";renderExternal();notice("网页录制未成功："+e.message+"。可导入本轮外部文件或只保留计时。","warning")}
}
async function runAI(r,audio,frames){
 try{
  const ctx={title:U().title,task:r.task,focus:U().assessment?"独立测评":U().fix,seconds:r.seconds,week:U().week,round:r.kind};
  r.ai=await CoachAI.review(audio,frames,ctx,{...pref,...credential});
  r.aiStatus="AI评审已就绪";if(pref.reveal==="fast"&&!U().assessment)r.aiShown=true;
  updateMeta(r,{ai:r.ai});
 }catch(e){r.aiStatus="评审未返回："+(e.name==="AbortError"?"15秒超时":e.message||"接口故障")+"；继续本地自评"}
 if(view==="review"&&session?.records.includes(r))refreshAI(r);if(view==="captured"&&$("capture-ai"))$("capture-ai").textContent=r.aiStatus;
}
function player(r){if(r.noMedia||!r.url)return '<div class="panel"><h3>仅计时 · 无录音</h3><p>本轮没有可回放材料。声音、体态未测，只记录实际计时及自我回忆。</p></div>';if(!r.video)return `<div class="audio-player"><p class="kicker">音频回听</p><audio id="playback" src="${E(r.url)}" controls preload="metadata"></audio></div><div class="actions">${secondary("下载录音","download",`data-rid="${E(r.id)}"`)}</div>`;return `<div class="camera ${!r.video?"audio":""}" id="play-box"><video id="playback" src="${E(r.url)}" playsinline controls preload="metadata"></video></div><div class="actions">${r.video?secondary("静音看体态","mute"):""}${secondary("黑屏只听声","listen")}${secondary("下载存档","download",`data-rid="${E(r.id)}"`)}</div>`}
function lastRecord(){return session.records.at(-1)}
function renderCaptured(r){
 view="captured";show(steps(r.kind==="first"?1:3)+`<section class="card"><p class="kicker">${E(r.label)} · 已保存到本轮内存</p><h2>本次 ${clock(Math.round(r.seconds))}</h2>${r.short?'<p class="warning">没有录音、时长不符或无法核验，已如实保留；不计完整训练或有效测评。</p>':""}${player(r)}<p class="status" id="capture-ai">${E(r.aiStatus)}</p><p class="small">视频文件仅在当前页面内存；点击下载保存原件，进度和评分另存本机。刷新后无法恢复未下载视频。</p><div class="actions">${primary(r.noMedia?"继续（仅计时记录）":r.source==="external"?"继续下一步":"下载后继续下一步","after-capture")}${secondary("退出本轮","cancel")}</div><p id="message"></p></section>`)
}
function doDownload(id){let r=session?.records.find(x=>x.id===id);if(!r||!r.url)return;let a=document.createElement("a");a.href=r.url;a.download=r.name;document.body.append(a);a.click();a.remove();r.downloaded=true;updateMeta(r,{downloaded:true})}
function afterCapture(){
 const r=lastRecord();if(!r.downloaded){doDownload(r.id);if(!confirm("已触发本地下载。请确认文件已保存，再继续。"))return;}
 if(r.kind==="warm"){
  if(session.warmups.length<2)launch({key:"warm-2",label:"固定熟段第二遍",task:warmText+"\n只重复本课动作，不另构思。",prep:0,seconds:30,kind:"warm",sealed:false});
  else launch(session.plan[0]);return;
 }
 if(r.kind==="first"){session.at++;if(session.at<session.plan.length){launch(session.plan[session.at]);return}activeReview=0;view="review";renderReview(session.firsts[0]);return}
 if(r.kind==="revision"){renderPracticeReview(r,"revision");return}
 renderPracticeReview(r,"transfer")
}
function scoreTotal(a){return Array.isArray(a)&&a.length===6&&a.every(x=>[0,1,2].includes(x))?a.reduce((s,x)=>s+x,0):null}
function renderReview(r){
 view="review";activeReview=session.firsts.indexOf(r);const u=U();let choices=labels.map((l,i)=>`<div class="score-row"><span>${E(l)}</span><div class="row">${[0,1,2,null].map(v=>`<button class="${r.scoreDraft[i]===v?"selected ":""}${v===null?"na":""}" data-action="score" data-i="${i}" data-value="${v===null?"na":v}" ${r.locked||i===5&&!r.video||i===4&&r.noMedia?"disabled":""}>${v===null?"未测":v}</button>`).join("")}</div></div>`).join("");
 show(steps(2)+`<section class="card"><p class="kicker">独立首录 · ${activeReview+1}/${session.firsts.length}</p><h2>先自己观察，再看AI</h2><div class="review-grid"><div>${player(r)}<div class="panel" style="margin-top:15px"><h3>先自评 · 6维12分</h3><p class="small">0未做到 / 1部分做到 / 2清楚做到。无法观察可保留未测。</p>${choices}${u.week>=5?`<div class="score-row"><span>口语活度（独立）</span><div class="row">${[0,1,2,null].map(v=>`<button class="${r.oral===v?"selected":""}" data-action="oral" data-value="${v===null?"na":v}" ${r.locked?"disabled":""}>${v===null?"未测":v}</button>`).join("")}</div></div>`:""}${details("本地指标（未测可留空）",`<label class="field">实质首句耗时（秒）<input id="manual-opening" type="number" min="0" max="${r.seconds}" step="0.1" value="${E(r.manual?.opening??"")}" ${r.locked?"disabled":""}></label><label class="field">全段无意义口癖次数<input id="manual-filler" type="number" min="0" step="1" value="${E(r.manual?.filler??"")}" ${r.locked?"disabled":""}></label><label class="field">全段转写净字数<input id="manual-chars" type="number" min="0" step="1" value="${E(r.manual?.chars??"")}" ${r.locked?"disabled":""}></label><p class="small">仅在实际回听或计数后填写；留空为未测。</p>`)}<div class="section-title" style="margin-top:13px"><b>自评总分</b><b>${scoreTotal(r.scoreDraft)??"—"} / 12</b></div><label class="field">个人快记（只选一项最弱表现）<select id="weak" ${r.locked?"disabled":""}><option value="">未选择</option>${weakLabels.map(v=>`<option ${r.weak===v?"selected":""}>${E(v)}</option>`).join("")}</select></label><label class="field">时间戳 / 原句 / 一个修订点<textarea id="fix-draft" ${r.locked?"disabled":""} placeholder="例如：00:14开头重复，下一遍直接回应">${E(r.fix)}</textarea></label>${r.locked?'<p class="status">原始自评已封存，不被重录或AI建议覆盖。</p>':primary("封存独立自评","lock-score")}</div></div><div><div id="ai-panel"></div><div class="panel" style="margin-top:12px"><h3>本课训练焦点</h3>${r.locked?`<p>${E(u.fix)}</p>`:'<p class="muted">封存原始自评后显示。</p>'}</div></div></div><div class="actions">${activeReview>0?secondary("上一段首录","prev-review"):""}${primary(activeReview<session.firsts.length-1?"下一段首录":"进入单点重录","next-review",r.locked?"":"disabled")} ${secondary("退出本轮","cancel")}</div><p id="message"></p></section>`);
 refreshAI(r)
}
function refreshAI(r){
 if(view!=="review"||session.firsts[activeReview]!==r||!$("ai-panel"))return;
 let html=`<div class="panel"><h3>AI评审</h3><p class="status">${E(r.aiStatus)}</p>`;
 const visible=r.ai&&r.aiShown&&(r.locked||pref.reveal==="fast"&&!U().assessment);
 if(r.ai&&!visible)html+=`<p class="muted">分析已经完成，先保存独立判断。</p>${primary("揭晓AI评审","reveal-ai",r.locked?"":"disabled")}`;
 else if(visible){
  let v=r.ai,f=v.single_fix,m=v.metrics;
  html+=`<div class="metric-grid"><div class="metric"><strong>${m.opening_sec??"—"}</strong><span>破题秒数（估计）</span></div><div class="metric"><strong>${m.speed_cpm??"—"}</strong><span>转写字/分</span></div><div class="metric"><strong>${m.filler_per_min??"—"}</strong><span>口癖次/分（估计）</span></div></div><div class="fix"><p class="small">本轮唯一必改项</p><h3>${E(f.issue_label)}</h3><p>原句：${E(f.original_quote)}</p><p>${E(f.why_it_hurts)}</p><p><b>口语改法</b>　${E(f.better_spoken)}</p></div>${keys.map((k,i)=>`<div class="score-row"><span>${labels[i]}</span><b>${v.scores[k].score??"未测"}</b></div>`).join("")}${U().week>=5?`<p class="small">口语活度建议：${v.oral_liveliness.score??"未测"} / 2</p>`:""}${primary("采纳为本轮修订目标","adopt-ai")}${details("转写与各维说明",textBlock(v.transcript+"\\n"+keys.map((k,i)=>labels[i]+"："+v.scores[k].note).join("\\n")+"\\n"+v.de_jargon_rewrite))}`
 }else html+=`<p class="muted">未配置、未同意发送或接口不可用时，按本地录像独立复盘。</p>${secondary("复制带题干的评审提示词","copy-prompt")}`;
 html+="<p class='small'>AI建议不是标准化测评结果；无连续视频不自动给体态总分。</p></div>";$("ai-panel").innerHTML=html
}
function readManual(r){const val=id=>{let v=$(id)?.value;return v===undefined||v.trim()===""?null:Number(v)};let opening=val("manual-opening"),filler=val("manual-filler"),chars=val("manual-chars");return {opening:opening!==null&&Number.isFinite(opening)&&opening>=0&&opening<=r.seconds?opening:null,filler:Number.isInteger(filler)&&filler>=0?filler:null,chars:Number.isInteger(chars)&&chars>=0?chars:null};}
function lockScore(){
 let r=session.firsts[activeReview];r.weak=$("weak")?.value||"";r.fix=$("fix-draft")?.value||"";
 if(r.scoreDraft.some(v=>v===undefined)||U().week>=5&&r.oral===undefined){notice("请逐项选择0、1、2或明确标为未测；纯音频的体态已自动标为未测。");return}if(!r.weak&&!r.fix){notice("请先选择一个弱项或记下一处可观察的问题。");return}r.manual=readManual(r);
 r.locked=true;if(!r.video)r.scoreDraft[5]=null;if(r.noMedia)r.scoreDraft[4]=null;
 updateMeta(r,{score:[...r.scoreDraft],oral:r.oral??null,weak:r.weak,fix:r.fix,manual:r.manual,total:scoreTotal(r.scoreDraft),independent:!(r.aiShown&&pref.reveal==="fast"&&!U().assessment)});
 renderReview(r)
}
function revisionTask(){
 const u=U(),r=session.firsts[session.selected]??session.firsts[0],normal=u.duration;
 let seconds=normal>=180?60:normal,prep=Math.min(15,u.prepare);
 if([1,6,18,43,45,46,47,30].includes(unit))seconds=60;
 if(unit===12)seconds=90;if(unit===24)seconds=60;if(unit===23)seconds=90;if(unit===38||unit===40)seconds=60;
 if(session.mode==="mini")seconds=60;
 return {key:r.key,label:"单点重录",task:r.task+"\n本轮只修一处："+(r.adopted||r.fix||r.weak||u.fix),prep,seconds,kind:"revision",sealed:false}
}
function renderRevisionChoice(){
 view="choose-revision";let r=session.firsts[session.selected]??session.firsts[0];show(steps(3)+`<section class="card"><p class="kicker">单点修订</p><h2>只改一个最影响理解的地方</h2>${session.firsts.length>1?`<label class="field">选择本轮最弱首录<select id="revision-choice">${session.firsts.map((x,i)=>`<option value="${i}" ${i===session.selected?"selected":""}>${E(x.label)}</option>`).join("")}</select></label>`:""}<div class="fix">${E(r.adopted||r.fix||r.weak||U().fix)}</div><p class="small">首录与原始分已保存。重说使用相同题意，只改一个问题。</p><div class="actions">${primary("按此建议重录","revision-start")}${secondary("返回独立自评","back-review")}</div></section>`)
}
function transferTask(){
 let u=U(),txt=u.transfer,prep=5,seconds=u.week===5||[31,35,40].includes(unit)?30:60;
 let matches=[...txt.matchAll(/准备\s*(\d+)\s*秒/g),...txt.matchAll(/(\d+)\s*秒准备/g)];if(matches.length)prep=+matches.at(-1)[1];
 if(unit===1||unit===46)prep=15;if(unit===47)prep=10;
 if(unit===12||unit===24)seconds=30;if(unit===43)seconds=30;
 return {key:"T"+pad(unit),label:"换题迁移",task:txt,prep,seconds,kind:"transfer",sealed:true};
}
function renderPracticeReview(r,kind){
 view="practice-review";show(steps(3)+`<section class="card"><p class="kicker">${kind==="revision"?"重录对照":"迁移检查"}</p><h2>${kind==="revision"?"这一处是否改变？":"新题能否独立展开？"}</h2>${player(r)}<p class="small">回看目标片段，记录实际变化，原始首录和自评分保持不变。</p><label class="field">一条具体观察<textarea id="practice-note" placeholder="只记发生了什么，不作笼统评价"></textarea></label><div class="actions">${primary(kind==="revision"?(session.mode==="mini"?"完成保底记录":"进入换题迁移"):"完成练习，解锁参考","practice-next",`data-kind="${kind}"`)}${secondary("退出本轮","cancel")}</div><p id="message"></p></section>`)
}
function completePractice(kind){
 let r=lastRecord();let note=$("practice-note")?.value||"";updateMeta(r,{observation:note});
 if(kind==="revision"){
  if(session.mode==="mini"){R(unit).mini=true;R(unit).lastSession=session.id;persist();session.finished=true;renderDone(true);return}
  if(unit===47){session.transferDone=true;showReferences();return}launch(transferTask());return;
 }
 showReferences()
}
function refKeys(){let u=U();let k=session.firsts.map(r=>r.key).filter(x=>data.refs[x]);let normal=pad(unit);if(data.refs[normal])k.unshift(normal);return [...new Set(k)]}
function showReferences(){
 if(!session.firsts.every(r=>r.locked)||!session.revisionDone||!session.transferDone){notice("先完成独立首录、自评、重录及迁移。");return}
 session.unlocked=true;view="refs";
 let ref=refKeys().map(k=>details(k===pad(unit)?"同题双示范、关键词与自评依据":"题卡 "+k+" 双示范、关键词与自评依据",data.refs[k].map(x=>`<div class="ref-title">${E(x.title)}</div><div class="example">${E(x.body)}</div>`).join(""))).join("");
 let ext=data.extensions[pad(unit)]?details("八分钟扩展 · 休整日另练",data.extensions[pad(unit)].map(x=>`<h3>${E(x.title)}</h3>${textBlock(x.body)}`).join("")):"";
 show(steps(3)+`<section class="card"><p class="kicker">练后对照 · U${pad(unit)}</p><h2>只带走一个可迁移的方法</h2>${ref}${ext}<p class="small">${E(U().record)}</p><label class="field">下一次只改什么？<textarea id="final-note" placeholder="记录一句可执行的改进"></textarea></label><label class="check"><input id="real" type="checkbox">本次确有真实听众或真实场合应用</label><label class="field">听众原话或主旨复述（没有就留空）<textarea id="feedback" placeholder="仅本人保存，不公开"></textarea></label><div class="actions">${primary("保存本单元记录","finish")}${secondary("返回首页（待补）","cancel")}</div><p id="message"></p></section>`)
}
function finish(){
 let u=R(unit),full=session.firsts.every(r=>!r.short&&r.locked)&&session.records.filter(r=>r.kind==="revision"||r.kind==="transfer"||r.kind==="warm").every(r=>!r.short);
 let real=!!$("real")?.checked,feedback=$("feedback")?.value.trim()||"";
 u.lastSession=session.id;u.complete=u.complete||full;u.partial=!full;u.real=u.real||real;u.feedback=feedback;u.note=$("final-note")?.value||"";u.date=new Date().toISOString();session.finished=true;persist();renderDone(false,full)
}
function renderDone(mini=false,full=true){
 view="done";show(`<section class="card hero"><p class="kicker">U${pad(unit)} · 训练记录已保存</p><h1>${mini?"5分钟保底已记录":full?"本单元训练已完成":"已保存部分训练"}</h1><p>${mini?"保底不替代完整AM。休整日再补原任务。":full?"原始首录、自评、修订与迁移记录分别保留。":"有录制未达原定时长或条件不完整，保留实际记录，不记作完整AM。"}</p>${U().day===6?'<p class="warning">本周结束：第7天可休整或补练，建议导出JSON备份。</p>':""}<div class="actions">${primary("继续下一未完成单元","next-unit")}${secondary("返回课程首页","home")}${secondary("导出JSON备份","export")}</div></section>`)
}
function cancelPrep(){clearClock();phase="ready";document.body.classList.remove("recording");renderTask()}
function endSession(force=false){
 if(phase==="record"){if(!confirm("先结束并保存当前录制？"))return;stopRecord();return}
 if(!force&&session&&!session.finished&&!confirm("退出后本轮未下载的录像将丢失，已保存的本地记录保留。确定退出？"))return;
 epoch++;clearClock();clearAux();stopTracks();document.body.classList.remove("recording");phase="";if(session){session.records.forEach(r=>r.url&&URL.revokeObjectURL(r.url));session=null}current=null;renderHome()
}
function openSettings(){
 drawer("AI评审与本机设置",`<p class="muted">默认不上传音频。配置成功并主动开启后，停止录制时自动发往所选服务；第42单元默认不发送。第三方处理和计费按所选服务条款执行。</p><label class="field">评审路径<select id="cfg-mode"><option value="local" ${pref.mode==="local"?"selected":""}>仅本地自评</option><option value="worker" ${pref.mode==="worker"?"selected":""}>Cloudflare Worker 代理</option><option value="gemini" ${pref.mode==="gemini"?"selected":""}>Gemini API 直连（BYOK）</option></select></label><label class="field">Worker HTTPS地址<input id="cfg-endpoint" type="url" value="${E(pref.endpoint)}" placeholder="https://…workers.dev"></label><label class="field">代理访问口令（当前会话）<input id="cfg-token" type="password" autocomplete="off" value="${E(credential.token||"")}"></label><label class="field">Gemini模型ID（需支持原生音频和JSON Schema）<input id="cfg-model" type="text" value="${E(pref.model)}" placeholder="按账号实际可用模型填写"></label><label class="field">API Key（当前会话）<input id="cfg-key" type="password" autocomplete="off" value="${E(credential.key||"")}"></label><label class="check"><input type="checkbox" id="cfg-auto" ${pref.auto?"checked":""}>已知悉音频将发送到配置服务，启用录后自动评审</label><label class="check"><input type="checkbox" id="cfg-frames" ${pref.frames?"checked":""}>允许默认勾选附带低清关键帧；每轮可关闭</label><label class="field">揭示方式<select id="cfg-reveal"><option value="strict" ${pref.reveal==="strict"?"selected":""}>严谨：自评后揭晓</option><option value="fast" ${pref.reveal==="fast"?"selected":""}>极速：普通练习自动展开（测评仍门禁）</option></select></label><div class="actions">${primary("保存设置","save-settings")}${secondary("清除会话凭证","clear-secret")}</div><p class="small">不把密钥写入仓库、永久本地存储或JSON备份。直接连接受跨域和模型权限影响，代理未部署前不会调用。15秒超时后不阻断本地训练。不要把未公开研究、真实学生身份或他人录音上传。</p><p><a href="worker/README.md">代理配置说明</a></p><hr><h3>进度备份</h3><div class="actions">${secondary("导出JSON","export")}${secondary("导入恢复","import")}</div><input type="file" id="import-file" accept=".json,application/json" hidden><p id="settings-message" class="status"></p>`)
}
function settingsSave(){
 const m=$("cfg-mode").value,endpoint=$("cfg-endpoint").value.trim(),model=$("cfg-model").value.trim(),token=$("cfg-token").value.trim(),key=$("cfg-key").value.trim();
 try{if(m==="worker"){let url=new URL(endpoint);if(url.protocol!=="https:"||url.search||url.hash||url.username||url.password||!token)throw Error("请输入可信HTTPS代理地址和口令")}if(m==="gemini"&&(!key||!/^[-\w.]+$/.test(model)))throw Error("请输入模型ID与API Key");
 pref={mode:m,endpoint,model,auto:m!=="local"&&$("cfg-auto").checked,frames:$("cfg-frames").checked,reveal:$("cfg-reveal").value};credential=m==="worker"?{token}:m==="gemini"?{key}:{};
 try{sessionStorage.setItem(SECRET,JSON.stringify(credential))}catch{}savePref();$("settings-message").textContent="已保存。接口尚未经过真实音频请求验证。";
 }catch(e){$("settings-message").textContent=e.message}
}
function exportBackup(){const blob=new Blob([JSON.stringify({schema:"speaking-coach-8w-v1",exported:new Date().toISOString(),data:state},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="speaking-coach-8w-backup-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function validateBackup(obj){let d=obj?.data;if(obj?.schema!=="speaking-coach-8w-v1"||!d||d.version!==1||!d.units||typeof d.units!=="object"||!Array.isArray(d.records)||!Array.isArray(d.cases)||!Array.isArray(d.maintenance))throw Error("不是本版备份");if(Object.keys(d.units).some(k=>!/^\d+$/.test(k)||+k<1||+k>48)||d.records.length>10000||d.records.some(r=>!r||typeof r.id!=="string"||!Number.isInteger(r.unit)||r.unit<1||r.unit>48||r.score!==null&&(!Array.isArray(r.score)||r.score.length!==6||r.score.some(x=>x!==null&&![0,1,2].includes(x)))))throw Error("备份数据结构无效");return d}
function extractGuide(a,b){let g=data.guide,i=g.indexOf(a);if(i<0)return "";let j=b?g.indexOf(b,i+a.length):-1;return g.slice(i,j<0?undefined:j).trim()}
function openFramework(){if(!baselineOK()||U().assessment&&!session?.unlocked)return;drawer("八大框架与个人工具",textBlock(extractGuide("八大高频框架：1—4","6 维 12 分：统一操作量表"))+details("五种内容生成方向、句式与辨音",textBlock(data.personal)))}
function openRules(){
 let u=U();let safe=!u.assessment||session?.firsts.every(r=>r.locked)&&session.firsts.length===session.plan.length;
 drawer("操作规则",`<p>完整课为前晚10分钟与次晨${u.minutes}分钟；一站式5分钟建模加同样AM；保底不是完整训练。题卡在界面按顺序揭示，静态网站不是加密考试环境。个人录制与评分仅保存当前设备，未经同意不发送；不要录制未经同意的他人。</p><p>请先保存首录与独立自评，再看参考。旧版学习记录不混入新版。</p>${safe?details("本单元原教材时间安排",textBlock(u.schedule.join("\n"))):"<p class='small'>测评期间不显示会提示解题的课程说明。</p>"}${baselineOK()&&safe?details("AI实时语音陪练四套指令",textBlock(extractGuide("脚本 1｜盲抽考官","口语活度与听众钩子"))):""}<p><a href="../dual-track-2026/">9周63天旧版</a> · <a href="../legacy-18week.html">18周126课旧版</a></p>`)
}
function radar(scores,title){if(!Array.isArray(scores)||scores.length!==6||scores.some(x=>![0,1,2].includes(x)))return `<p class="small">${E(title)}：数据不全，不绘制满分雷达。</p>`;const pts=v=>v.map((r,i)=>{const a=-Math.PI/2+i*Math.PI/3;return (130+80*r/2*Math.cos(a)).toFixed(1)+","+(130+80*r/2*Math.sin(a)).toFixed(1)}).join(" ");return `<h3>${E(title)}</h3><svg class="radar" viewBox="0 0 260 260" role="img" aria-label="${E(title)}"><polygon points="${pts([2,2,2,2,2,2])}" fill="#f5f8fa" stroke="#a8bac9"/><polygon points="${pts([1,1,1,1,1,1])}" fill="none" stroke="#cbd8e1"/><polygon points="${pts(scores)}" fill="#0f766e44" stroke="#0f766e" stroke-width="2"/>${labels.map((s,i)=>{let a=-Math.PI/2+i*Math.PI/3;return `<text x="${130+109*Math.cos(a)}" y="${134+109*Math.sin(a)}" font-size="10" fill="#1b365d" text-anchor="middle">${E(s.slice(0,2))}</text>`}).join("")}</svg>`}
function latest(n,k){return [...state.records].reverse().find(r=>r.unit===n&&r.key===k&&r.kind==="first"&&r.score&& !r.short)}
function growthTable(){let records=state.records.filter(r=>r.kind==="first"&&r.score).slice(-24).reverse();return `<div class="table-wrap"><table><thead><tr><th>单元 / 题卡</th><th>时长</th><th>独立总分</th><th>破题估计</th><th>字/分</th><th>口癖/分</th></tr></thead><tbody>${records.map(r=>`<tr><td>U${pad(r.unit)} ${E(r.key)}</td><td>${E(r.seconds)}秒</td><td>${scoreTotal(r.score)??"未测"}</td><td>${E(r.manual?.opening??r.ai?.metrics?.opening_sec??"—")}</td><td>${E(r.manual?.chars!=null&&r.seconds>0?Math.round(r.manual.chars*60/r.seconds):r.ai?.metrics?.speed_cpm??"—")}</td><td>${E(r.manual?.filler!=null&&r.seconds>0?Math.round(r.manual.filler*600/r.seconds)/10:r.ai?.metrics?.filler_per_min??"—")}</td></tr>`).join("")||'<tr><td colspan="6">尚无独立首录记录</td></tr>'}</tbody></table></div>`}
function openAssets(){
 if(U().assessment&&!session?.unlocked)return;
 let pair=["B1","B2"].map(k=>{let a=latest(1,k),b=latest(46,k);return `<div class="score-row"><b>${k} 同题</b><span>01：${scoreTotal(a?.score)??"—"} / 12　46：${scoreTotal(b?.score)??"—"} / 12</span></div>`}).join("");
 let showLater=unit>=44||state.units[44]?.complete;
 drawer("成长与个人资产",`<h3>最近独立首录</h3>${growthTable()}${unit>=46||state.units[46]?.complete?details("01 / 46 固定条件纵向比较",pair+"<p class='small'>同题熟练、设备或评分者变化会影响比较，不解释为因果效果。</p>"):""}${unit>=47||state.units[47]?.complete?details("47终测双雷达",radar(latest(47,"F1")?.score,"90秒即兴")+radar(latest(47,"F2")?.score,"5分钟演讲")):""}${showLater?`<h3 style="margin-top:22px">个人案例卡</h3><p class="small">仅记真实可核实内容，未核实留空；这些卡片只在本机存储。</p>${state.cases.map((c,i)=>details("案例 "+(i+1)+" · "+(c.title||"待填写"),`<label class="field">标题<input type="text" data-case="${i}" data-field="title" value="${E(c.title)}"></label><label class="field">事实、卡点、行动、结果、启发<textarea data-case="${i}" data-field="text">${E(c.text)}</textarea></label>${secondary("删除该卡","case-delete",`data-i="${i}"`)}`)).join("")}${secondary("新增案例卡","case-add")}`:""}${unit>=48||state.units[48]?.complete?`<h3 style="margin-top:24px">90天维护</h3><p>每周一次真实应用，每月一次录像体检。</p><label class="field">日期<input id="maint-date" type="date" value="${new Date().toISOString().slice(0,10)}"></label><label class="field">真实场合及下一步<textarea id="maint-text"></textarea></label>${primary("记录一次真实应用","maint-add")}${state.maintenance.map(x=>`<p class="small">${E(x.date)} · ${E(x.text)}</p>`).join("")}`:""}<p class="small">进度、案例与评语都在本机。导出备份时请自行妥善保管。</p>${secondary("导出JSON","export")}`)
}
async function copyPrompt(){let r=session?.firsts[activeReview];if(!r)return;const prompt=CoachAI.prompt({title:U().title,task:r.task,focus:U().fix,seconds:r.seconds,week:U().week},false)+"\n请根据我随后提供的真实音频或转写判断；纯文本不得推断实际声音、停顿和体态。";try{await navigator.clipboard.writeText(prompt);notice("提示词已复制，可自行选择是否发送。","status")}catch{drawer("复制评审提示词",`<textarea readonly rows="12">${E(prompt)}</textarea>`)}}
function activeRecording(){return view==="review"?session.firsts[activeReview]:lastRecord()}
document.addEventListener("click",async ev=>{
 const btn=ev.target.closest("button[data-action]");if(!btn||btn.disabled)return;let act=btn.dataset.action;
 switch(act){
 case "unit":chooseUnit(+btn.dataset.n);break;
 case "mode":mode=btn.dataset.mode;renderHome();break;
 case "home":if(session)endSession(session.finished);else{clearAux();renderHome()}break;
 case "pm":renderPM();break;
 case "pm-timer":startAux(mode==="combined"?120:240,()=>beep());break;
 case "pm-done":if(U().assessment&&!$("device-check")?.checked){notice("请先完成设备检查。");break}clearAux();R(unit).pm=true;persist();if(mode==="combined")startSession();else renderHome();break;
 case "am":if(mode==="combined"&&!R(unit).pm){renderPM();break}startSession();break;
 case "warm-timer":startAux(+btn.dataset.step===0?120:360,()=>beep());break;
 case "warm-next":if(+btn.dataset.step===0)renderWarm(1);else launch({key:"warm-1",label:"固定熟段第一遍",task:warmText+"\n"+U().schedule[1],prep:0,seconds:30,kind:"warm",sealed:false});break;
 case "breath":startAux(60,()=>beep());break;
 case "launch-main":launch(session.plan[0]);break;
 case "reveal-card":current.shown=true;renderTask();break;
 case "device":await getDevice();break;
 case "detect-device":await detectDevices();break;
 case "external-pick":if(!$("external-attest")?.checked){notice("请先确认本轮原始发言。");break}$("external-file")?.click();break;
 case "timer-only-save":saveTimerOnly();break;
 case "external-retry":if(current){current.timerSeconds=null;phase="ready";view="task";renderTask()}break;
 case "start-prep":startPrep();break;
 case "cancel-prep":cancelPrep();break;
 case "stop-record":await stopRecord();break;
 case "cancel":endSession();break;
 case "mute":{let v=$("playback");if(v){$("play-box").classList.remove("black");v.muted=!v.muted;v.play().catch(()=>{})}}break;
 case "listen":{let v=$("playback");if(v){$("play-box").classList.toggle("black");v.muted=false;v.play().catch(()=>{})}}break;
 case "download":doDownload(btn.dataset.rid);break;
 case "after-capture":afterCapture();break;
 case "score":case "oral":{let r=session.firsts[activeReview];if(r.locked)break;r.fix=$("fix-draft")?.value||r.fix;r.weak=$("weak")?.value||r.weak;r.manual=readManual(r);let v=btn.dataset.value==="na"?null:+btn.dataset.value;if(act==="score")r.scoreDraft[+btn.dataset.i]=v;else r.oral=v;renderReview(r);break}
 case "lock-score":lockScore();break;
 case "reveal-ai":{let r=session.firsts[activeReview];if(r.locked){r.aiShown=true;refreshAI(r)}break}
 case "adopt-ai":{let r=session.firsts[activeReview];if(r.aiShown&&r.ai){r.adopted=r.ai.single_fix.issue_label+"："+r.ai.single_fix.better_spoken;updateMeta(r,{adopted:r.adopted});notice("已采纳为重录目标，原始自评分不变。","status")}break}
 case "copy-prompt":await copyPrompt();break;
 case "prev-review":renderReview(session.firsts[Math.max(0,activeReview-1)]);break;
 case "next-review":if(!session.firsts[activeReview].locked)break;if(activeReview<session.firsts.length-1)renderReview(session.firsts[activeReview+1]);else{let rated=session.firsts.map((r,i)=>[scoreTotal(r.scoreDraft)??99,i]).sort((a,b)=>a[0]-b[0]);session.selected=rated[0][1];renderRevisionChoice()}break;
 case "back-review":renderReview(session.firsts[session.selected]);break;
 case "revision-start":if($("revision-choice"))session.selected=+$("revision-choice").value;launch(revisionTask());break;
 case "practice-next":completePractice(btn.dataset.kind);break;
 case "finish":finish();break;
 case "next-unit":{let next=data.units.find(x=>!state.units[x.id]?.complete&&x.id>unit)||data.units.find(x=>!state.units[x.id]?.complete);endSession(true);chooseUnit(next?.id??unit);break}
 case "open-assets":openAssets();break;
 case "save-settings":settingsSave();break;
 case "clear-secret":credential={};pref.auto=false;savePref();try{sessionStorage.removeItem(SECRET)}catch{}closeDrawer();openSettings();break;
 case "export":exportBackup();break;
 case "import":$("import-file")?.click();break;
 case "case-add":state.cases.push({title:"",text:""});persist();closeDrawer();openAssets();break;
 case "case-delete":if(confirm("删除这张本机案例卡？")){state.cases.splice(+btn.dataset.i,1);persist();closeDrawer();openAssets()}break;
 case "maint-add":{let date=$("maint-date").value,txt=$("maint-text").value.trim();if(date&&txt){state.maintenance.push({date,text:txt});persist();closeDrawer();openAssets()}break}
 }
});
document.addEventListener("change",async ev=>{
 let e=ev.target;
 if(e.name==="media"&&!busy()&&current&&view==="task"){rememberFamiliar();stopTracks();current.source=e.value;current.video=e.value==="video";current.deviceError="";session.captureMode=e.value;renderTask()}
 if(e.id==="external-file"&&e.files?.[0])await importExternal(e.files[0]);
 if(e.id==="gaze-guide"&&$("camera")){$("camera").style.boxShadow=e.checked?"inset 0 0 0 4px #6ab5ae":"none";$("special-note").hidden=!e.checked;$("special-note").textContent=e.checked?"左 · 中 · 右　按意群缓慢转移目光":""}
 if(e.id==="revision-choice"){session.selected=+e.value;renderRevisionChoice()}
 if(e.dataset.case!==undefined&&state.cases[+e.dataset.case]&&["title","text"].includes(e.dataset.field)){state.cases[+e.dataset.case][e.dataset.field]=e.value;persist()}
 if(e.id==="import-file"&&e.files[0]){try{if(e.files[0].size>20*1024*1024)throw Error("备份太大");let incoming=validateBackup(JSON.parse(await e.files[0].text()));if(!confirm("导入将替换本浏览器新版课程的进度与案例。建议先导出现有备份。确认？"))return;state=incoming;persist();closeDrawer();if(!session)chooseUnit(state.current||1);else notice("已恢复本地记录，建议结束本轮后重新进入。","status")}catch(err){$("settings-message").textContent="导入失败："+err.message}}
});
$("close-drawer").onclick=closeDrawer;$("framework").onclick=openFramework;$("assets").onclick=openAssets;$("settings").onclick=openSettings;$("rules").onclick=openRules;
setInterval(()=>{let el=$("session-elapsed");if(el&&session?.started)el.textContent=clock(Math.floor((Date.now()-session.started)/1000));},1000);
window.addEventListener("beforeunload",e=>{if(busy()||session?.records.some(r=>!r.downloaded)){e.preventDefault();e.returnValue=""}});
window.addEventListener("pagehide",()=>{stopTracks();clearClock();clearAux()});
fetch("data/curriculum.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(v=>{if(v.units.length!==48||Object.keys(v.cards).length!==22)throw Error("课程数据不完整");data=v;unit=Math.max(1,Math.min(48,+state.current||1));renderHome()}).catch(e=>{show(`<section class="card"><h2>课程数据暂未载入</h2><p>${E(e.message)}</p><p>请刷新页面。<a href="../dual-track-2026/">旧版入口</a></p></section>`)});
})();
