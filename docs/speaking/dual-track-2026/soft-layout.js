/* Local completion summary only. Teaching text, timing, gates and saved scores
   remain owned by the existing reviewed pages and completion control. */
(function(){
  'use strict';
  function start(){
    const panels=Array.from(document.querySelectorAll('[data-soft-progress]'));
    if(!panels.length)return;
    const prefix='speaking:lesson-complete:v1:';
    function update(){
      let completed=0,available=true;
      try{
        for(let day=1;day<=63;day++){
          const serial=String(day).padStart(2,'0');
          for(const mode of ['am','pm'])if(localStorage.getItem(prefix+mode+':day-'+serial)==='1')completed++;
        }
      }catch(_){available=false;}
      panels.forEach(panel=>{
        const value=panel.querySelector('[data-soft-completed]');
        const track=panel.querySelector('[data-soft-progress-track]');
        const fill=panel.querySelector('[data-soft-progress-fill]');
        const status=panel.querySelector('[data-soft-progress-status]');
        panel.dataset.storageAvailable=String(available);
        if(value)value.textContent=available?String(completed):'—';
        if(track){
          if(available){track.setAttribute('aria-valuenow',String(completed));track.setAttribute('aria-valuetext','本浏览器已标记'+completed+'课，共126课');}
          else{track.removeAttribute('aria-valuenow');track.setAttribute('aria-valuetext','当前浏览器无法读取完成标记');}
        }
        if(fill)fill.style.width=available?(completed/126*100).toFixed(4)+'%':'0%';
        if(status)status.textContent=available?'仅统计本浏览器保存的完成标记。':'当前浏览器无法读取完成标记，进度未统计。';
      });
    }
    update();
    window.addEventListener('storage',event=>{if(event.key===null||event.key.startsWith(prefix))update();});
    window.addEventListener('pageshow',update);
    document.addEventListener('click',event=>{if(event.target.closest&&event.target.closest('.course-completion-button'))queueMicrotask(update);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
