/* Week-scoped, optional local micro-goals for the study overview. */
(function(){
  "use strict";
  function isoWeek(d){
    var dt=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
    dt.setUTCDate(dt.getUTCDate()+4-(dt.getUTCDay()||7));
    var year=dt.getUTCFullYear();
    var start=new Date(Date.UTC(year,0,1));
    var week=Math.ceil((((dt-start)/86400000)+1)/7);
    return year+"-W"+String(week).padStart(2,"0");
  }
  function init(){
    var items=[].slice.call(document.querySelectorAll("[data-study-goal]"));
    var counter=document.querySelector("[data-goals-count]");
    if(!items.length||!counter)return;
    var key="rlh.study.weekly-goals."+isoWeek(new Date());
    var stored={};
    try{var parsed=JSON.parse(localStorage.getItem(key)||"{}");if(parsed&&typeof parsed==="object")stored=parsed;}catch(e){}
    function render(){
      var done=items.filter(function(el){return el.checked;}).length;
      counter.textContent=done+" / "+items.length+" 已完成";
    }
    items.forEach(function(el){
      el.checked=stored[el.dataset.studyGoal]===true;
      el.addEventListener("change",function(){
        stored[el.dataset.studyGoal]=el.checked;
        try{localStorage.setItem(key,JSON.stringify(stored));}catch(e){}
        render();
      });
    });
    render();
  }
  if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init,{once:true});}else{init();}
})();
