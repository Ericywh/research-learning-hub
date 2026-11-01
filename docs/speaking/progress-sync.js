/* Speaking course: account-scoped cloud sync (optional) + manual progress transfer.
   A static GitHub Pages site cannot synchronize devices without a configured backend.
   Cloud sync is disabled until a Supabase project with RLS is configured.
   No microphone, answers, scores or other private materials are uploaded. */
(()=>{"use strict";
if(window.SpeakingProgressSync)return;
const PREFIX="speaking:lesson-complete:v1:";
const SETTINGS="speaking:sync:public-config:v1",SESSION="speaking:sync:session:v1";
const LAST_USER="speaking:sync:last-user:v1",GUEST_PENDING="speaking:sync:pending:v1:guest";
const POLL_MS=30000;
const valid=id=>/^legacy:0[1-6]-(?:0[1-9]|1[0-9]|2[01])$/.test(id)||/^(?:am|pm):day-(?:0[1-9]|[1-5][0-9]|6[0-3])$/.test(id);
function get(k){try{return localStorage.getItem(k)}catch{return null}}
function set(k,v){try{localStorage.setItem(k,v);return true}catch{return false}}
function del(k){try{localStorage.removeItem(k)}catch{}}
function json(k,otherwise){try{return JSON.parse(get(k)||"null")||otherwise}catch{return otherwise}}
function allLocal(){
 const found={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);
 if(k&&k.startsWith(PREFIX)){const id=k.slice(PREFIX.length);if(valid(id)&&localStorage.getItem(k)==="1")found[id]=true;}}}catch{}return found;
}
function migrateOld(){
 try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);
 if(!k||!k.startsWith("speaking-course-complete:v1:")||localStorage.getItem(k)!=="yes")continue;
 const p=k.slice("speaking-course-complete:v1:".length);
 let m=p.match(/\/speaking\/lessons\/(\d{2})-(\d{2})\.html$/),id=m?"legacy:"+m[1]+"-"+m[2]:null;
 if(!id){m=p.match(/\/speaking\/dual-track-2026\/(am|pm)\/day-(\d{2})\.html$/);if(m)id=m[1]+":day-"+m[2];}
 if(id&&valid(id)&&get(PREFIX+id)!=="1")set(PREFIX+id,"1");
 }}catch{}
}
function changed(){window.dispatchEvent(new Event("speaking:progress-applied"))}
function pendingKey(user){return "speaking:sync:pending:v1:"+(user||"guest")}
function pending(user){return json(pendingKey(user),{})}
function savePending(user,data){set(pendingKey(user),JSON.stringify(data))}
function publicConfig(){const fixed=window.SPEAKING_SYNC_CONFIG||{},local=json(SETTINGS,{});
 return {url:String(fixed.url||local.url||"").trim().replace(/\/+$/,""),
 key:String(fixed.publishableKey||local.key||"").trim()}}
function checkConfig(u,k){
 const url=new URL(u);if(url.protocol!=="https:"||(!url.hostname.endsWith(".supabase.co")&&url.hostname!=="supabase.co"))throw Error("请填写 HTTPS 的 Supabase 项目网址（*.supabase.co）。");
 if(!k||k.startsWith("sb_secret_")||k.length<16)throw Error("只能填写 publishable key 或 anon key，不得填写 secret/service_role key。");
 if(k.split(".").length===3){try{const payload=JSON.parse(atob(k.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));if(payload.role==="service_role")throw Error("禁止使用 service_role 密钥。");}catch(e){if(/禁止使用/.test(e.message))throw e;}}
 return true;
}
const conf=publicConfig();let configured=false,session=json(SESSION,null),syncing=false,rerun=false,lastPull=0,offline=false,ui=null;
try{configured=checkConfig(conf.url,conf.key)}catch{configured=false}
function status(text){if(ui){const n=ui.querySelector("[data-sync-status]");if(n)n.textContent=text}}
function label(){if(!ui)return;const tag=ui.querySelector("[data-sync-badge]"),account=ui.querySelector("[data-sync-account]");
 if(tag)tag.textContent=!configured?"未配置云端":session?.user?.id?"已登录 · 进度自动同步":"云端待登录";
 if(account)account.textContent=session?.user?.email||"";
 const inArea=ui.querySelector("[data-sync-signin]"),out=ui.querySelector("[data-sync-signout]");
 if(inArea)inArea.hidden=!!session?.user?.id;if(out)out.hidden=!session?.user?.id;
}
async function request(path,opts={}){
 const c=new AbortController(),timer=setTimeout(()=>c.abort(),13000);
 try{const headers={"apikey":conf.key,"Content-Type":"application/json",...opts.headers};
 const res=await fetch(conf.url+path,{...opts,headers,signal:c.signal});
 const raw=await res.text();let data=null;try{data=raw?JSON.parse(raw):null}catch{}
 if(!res.ok){const msg=data?.msg||data?.message||data?.error_description||data?.error||("HTTP "+res.status);throw Error(String(msg));}
 return data;
 }finally{clearTimeout(timer)}
}
function remember(s){
 if(s&&s.access_token&&s.refresh_token&&s.user?.id){s.expires_at=s.expires_at||(Math.floor(Date.now()/1000)+(s.expires_in||3600));session=s;set(SESSION,JSON.stringify(s));}
}
async function access(){
 if(!session?.user?.id)return null;
 if((session.expires_at||0)>Math.floor(Date.now()/1000)+75)return session.access_token;
 try{const fresh=await request("/auth/v1/token?grant_type=refresh_token",{method:"POST",body:JSON.stringify({refresh_token:session.refresh_token})});remember(fresh);return session.access_token;}
 catch(e){if(/invalid|refresh_token|expired|not found/i.test(e.message)){session=null;del(SESSION);label();status("登录已失效，请重新获取邮箱验证码。");}throw e;}
}
function saveLocally(id,done){if(done)set(PREFIX+id,"1");else del(PREFIX+id)}
async function sync(reason){
 if(!configured||!session?.user?.id)return;
 if(syncing){rerun=true;return}
 syncing=true;let success=false;
 try{
  const token=await access(),user=session.user.id;
  const remote=await request("/rest/v1/speaking_read_status?select=lesson_id,completed,updated_at",{headers:{Authorization:"Bearer "+token}});
  if(!Array.isArray(remote))throw Error("云端返回格式异常");
  const cloud=new Map(remote.filter(x=>valid(x.lesson_id)).map(x=>[x.lesson_id,x]));
  const sameUser=!get(LAST_USER)||get(LAST_USER)===user;
  const edits=pending(user),guest=sameUser?pending("guest"):{};
  const active={...guest,...edits};const conflicts={};const upload=[];
  for(const [id,value] of Object.entries(active)){
   if(!valid(id))continue;
   const old=cloud.get(id),stamp=Number(value.at)||0;
   if(!old||stamp>=Date.parse(old.updated_at||"1970-01-01"))upload.push({user_id:user,lesson_id:id,completed:!!value.done});
   else{conflicts[id]=value.at;delete active[id];} // later cloud write wins
  }
  if(sameUser){const local=allLocal();for(const id of Object.keys(local)){
   if(!cloud.has(id)&&!active[id]&&!upload.some(x=>x.lesson_id===id))upload.push({user_id:user,lesson_id:id,completed:true});
  }}
  if(upload.length){
   await request("/rest/v1/speaking_read_status?on_conflict=user_id,lesson_id",{
    method:"POST",headers:{Authorization:"Bearer "+token,Prefer:"resolution=merge-duplicates,return=representation"},
    body:JSON.stringify(upload)});
   for(const item of upload)cloud.set(item.lesson_id,{lesson_id:item.lesson_id,completed:item.completed,updated_at:new Date().toISOString()});
  }
  // Only overwrite local state after a successful read AND any requested writes.
  const latest=pending(user);
  for(const [id,row] of cloud){
   // Don't overwrite a more recent local click made while the request was in flight.
   if(latest[id] && latest[id].at!==active[id]?.at && latest[id].at!==conflicts[id])continue;
   saveLocally(id,row.completed);
  }
  // On account switching, do not leak another account's local marks into this account.
  if(!sameUser){for(const id of Object.keys(allLocal()))if(!cloud.has(id))saveLocally(id,false)}
  const saved=pending(user);
  for(const id of Object.keys(active))if(saved[id]?.at===active[id].at)delete saved[id];
  for(const id of Object.keys(conflicts))if(saved[id]?.at===conflicts[id])delete saved[id];
  savePending(user,saved);
  if(sameUser)savePending("guest",{});
  set(LAST_USER,user);lastPull=Date.now();offline=false;success=true;changed();
  status("已从云端同步 · "+Object.values(allLocal()).length+" 节标记 · 可在其他设备以同一邮箱登录");
 }catch(e){offline=true;status("云端同步暂不可用，本机标记仍保留。"+(e.message?"（"+e.message+"）":""))}
 finally{syncing=false;if(rerun){rerun=false;setTimeout(()=>sync("retry"),0)}}
 return success;
}
function recordChange(detail){
 if(!detail||!valid(detail.id))return;
 const who=session?.user?.id||"guest",edits=pending(who);
 edits[detail.id]={done:!!detail.completed,at:Date.now()};savePending(who,edits);
 status(session?.user?.id?"本机已记录，正在同步云端……":"已保存到本机。登录同一邮箱后可同步。");
 if(session?.user?.id)sync("local-click");
}
function exportCode(){
 const ids=Object.keys(allLocal()).sort();return "SPK1:"+btoa(JSON.stringify({version:1,lessons:ids}));
}
function importCode(value){
 const code=String(value||"").trim();if(!code.startsWith("SPK1:"))throw Error("进度码格式不正确。");
 let d;try{d=JSON.parse(atob(code.slice(5)))}catch{throw Error("进度码无法解码。")}
 if(d.version!==1||!Array.isArray(d.lessons)||d.lessons.length>500||!d.lessons.every(valid))throw Error("进度码内容不符合课程格式。");
 let count=0;const who=session?.user?.id||"guest",edits=pending(who),when=Date.now();
 for(const id of d.lessons){if(get(PREFIX+id)!=="1"){saveLocally(id,true);edits[id]={done:true,at:when};count++}}
 savePending(who,edits);changed();if(count&&session?.user?.id)sync("manual-import");return count;
}
function render(){
 if(document.querySelector("[data-speaking-sync]"))return;
 const node=document.createElement("section");node.className="speaking-sync";node.setAttribute("data-speaking-sync","");
 node.innerHTML='<details class="speaking-sync-details"><summary>跨设备阅读进度 <span data-sync-badge>仅本机</span></summary>'+
 '<div class="speaking-sync-body"><p data-sync-status role="status">准备检查同步设置……</p>'+
 '<div class="speaking-sync-cloud"><p class="speaking-sync-explain">在手机和电脑使用同一个邮箱登录后，可同步早课、晚课和旧版已完成标记；支持撤销。仅同步标记，不上传录音与评分。</p>'+
 '<div data-sync-signin><label>邮箱地址 <input data-sync-email type="email" autocomplete="email" placeholder="用于多设备登录的邮箱"></label>'+
 '<div class="speaking-sync-actions"><button data-sync-send type="button">发送邮箱验证码</button></div>'+
 '<label>收到的六位验证码 <input data-sync-code inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="输入邮件中的验证码"></label>'+
 '<div class="speaking-sync-actions"><button data-sync-verify type="button">登录并同步</button></div></div>'+
 '<div data-sync-signout hidden><p>当前邮箱：<strong data-sync-account></strong></p>'+
 '<div class="speaking-sync-actions"><button data-sync-now type="button">立即同步</button><button data-sync-logout type="button">退出云端账户</button></div></div>'+
 '<details class="speaking-sync-setup"><summary>配置云端服务（仅首次使用）</summary><p>需要拥有一个启用行级访问控制的 Supabase 项目。只能填写公开的 publishable key，绝不能使用 secret/service_role 密钥。未配置时不具备自动跨设备同步能力。</p>'+
 '<label>Supabase Project URL <input data-sync-url type="url" autocomplete="off" placeholder="https://your-project.supabase.co"></label>'+
 '<label>Publishable key <input data-sync-key autocomplete="off" placeholder="sb_publishable_…"></label>'+
 '<div class="speaking-sync-actions"><button data-sync-save-config type="button">保存此设备的公开配置</button></div></details></div>'+
 '<details class="speaking-sync-transfer"><summary>手动迁移已有标记（无需云端账户）</summary><p>在原设备复制进度码，在另一设备粘贴导入。只合并已完成标记，不能自动同步撤销。</p>'+
 '<div class="speaking-sync-actions"><button data-sync-export type="button">复制本机进度码</button></div>'+
 '<textarea data-sync-transfer rows="3" placeholder="进度码会显示在这里，也可以粘贴另一设备的进度码"></textarea>'+
 '<div class="speaking-sync-actions"><button data-sync-import type="button">导入并合并进度</button></div></details>'+
 '</div></details>';
 const target=document.querySelector(".rv-hero,.hero,main,.wrap")||document.body;
 if(target.matches(".rv-hero,.hero"))target.insertAdjacentElement("afterend",node);
 else target.insertAdjacentElement("afterbegin",node);
 ui=node;
 const $=s=>node.querySelector(s);
 $("[data-sync-url]").value=conf.url;$("[data-sync-key]").value=conf.key;
 $("[data-sync-save-config]").addEventListener("click",()=>{
  try{const url=$("[data-sync-url]").value.trim(),key=$("[data-sync-key]").value.trim();checkConfig(url,key);
   if(!set(SETTINGS,JSON.stringify({url,key})))throw Error("当前浏览器不允许保存设置。");
   del(SESSION);status("配置已保存，重新打开页面后可用邮箱登录。");location.reload();
  }catch(e){status(e.message)}
 });
 $("[data-sync-export]").addEventListener("click",async()=>{
  const v=exportCode();$("[data-sync-transfer]").value=v;
  try{await navigator.clipboard.writeText(v);status("已复制进度码，可粘贴到其他设备导入。");}catch{status("进度码已显示在文本框中，请长按复制。")}
 });
 $("[data-sync-import]").addEventListener("click",()=>{
  try{const n=importCode($("[data-sync-transfer]").value);status("已导入 "+n+" 个新完成标记。"+(session?.user?.id?"正在同步到云端。":"其他设备仍需手动导入。"))}
  catch(e){status(e.message)}
 });
 $("[data-sync-send]").addEventListener("click",async()=>{
  if(!configured){status("云端尚未配置。请先展开“配置云端服务”。");return}
  const email=$("[data-sync-email]").value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status("请填写有效邮箱地址。");return}
  try{$("[data-sync-send]").disabled=true;await request("/auth/v1/otp",{method:"POST",body:JSON.stringify({email,create_user:true})});status("验证码邮件已发送；请查看邮箱，输入六位数字验证码。");}
  catch(e){status("发送失败："+e.message)}finally{$("[data-sync-send]").disabled=false}
 });
 $("[data-sync-verify]").addEventListener("click",async()=>{
  const email=$("[data-sync-email]").value.trim(),token=$("[data-sync-code]").value.trim();
  if(!email||!/^[0-9]{6,8}$/.test(token)){status("请先填写邮箱与邮件中的六位验证码。");return}
  try{$("[data-sync-verify]").disabled=true;const s=await request("/auth/v1/verify",{method:"POST",body:JSON.stringify({email,token,type:"email"})});
   if(!s?.user?.id||!s.access_token)throw Error("登录结果无效");
   remember(s);label();status("登录成功，正在合并本机与云端阅读记录……");await sync("sign-in");
  }catch(e){status("登录失败："+e.message)}finally{$("[data-sync-verify]").disabled=false}
 });
 $("[data-sync-now]").addEventListener("click",()=>sync("manual"));
 $("[data-sync-logout]").addEventListener("click",async()=>{
  const old=session;session=null;del(SESSION);label();status("已退出云端账号。本机缓存仍在，公共设备请清理浏览器数据。");
  if(old?.access_token){try{await request("/auth/v1/logout",{method:"POST",headers:{Authorization:"Bearer "+old.access_token}})}catch{}}
 });
 label();
 status(!configured?"云端同步未配置：当前标记仅保存在本机，可使用下方进度码手动迁移。":
  session?.user?.id?"正在读取云端进度……":"云端已配置，请在所有设备用同一个邮箱登录。");
 if(configured&&session?.user?.id)sync("init");
}
window.SpeakingProgressSync={sync,exportCode,importCode};
window.addEventListener("speaking:completion-local-change",e=>recordChange(e.detail));
window.addEventListener("storage",e=>{if(e.key===SESSION){session=json(SESSION,null);label();if(session?.user?.id)sync("auth-tab");}
 if(e.key?.startsWith(PREFIX))changed()});
window.addEventListener("online",()=>{if(session?.user?.id)sync("online")});
window.addEventListener("focus",()=>{if(session?.user?.id&&Date.now()-lastPull>12000)sync("focus")});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&session?.user?.id&&Date.now()-lastPull>12000)sync("visible")});
setInterval(()=>{if(!document.hidden&&session?.user?.id&&Date.now()-lastPull>POLL_MS)sync("poll")},POLL_MS);
migrateOld();
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();
})();