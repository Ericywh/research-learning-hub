(function gardenApp(){
"use strict";
const $=id=>document.getElementById(id), E=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])), pad=n=>String(n).padStart(2,"0");
const KEY="speaking-coach-8w:personal:v1", GKEY="speaking-coach-8w:garden:v1", MKEY="speaking-coach-8w:garden-motion";
const oldDefault=()=>({version:1,current:1,units:{},records:[],cases:[],maintenance:[]}),newDefault=()=>({version:1,notes:{},marks:{},assessments:[],cases:[],maintenance:[]});
function read(k,f){try{let v=JSON.parse(localStorage.getItem(k)||"null");return v&&typeof v==="object"?v:f()}catch{return f()}}
let old=read(KEY,oldDefault),garden=read(GKEY,newDefault),data,transfers,unit=0,uid=0,storageOK=true,selection=null;
if(!old.units||!Array.isArray(old.records))old=oldDefault();
if(!garden.notes||!garden.marks||!Array.isArray(garden.assessments)||!Array.isArray(garden.cases)||!Array.isArray(garden.maintenance))garden=newDefault();
const labels=["破题贴题","逻辑骨架","例证画面","情境适配","声音节奏","体态目光"], weaknesses=["开口启动","思路形成","内容展开","卡壳恢复","脱稿程度"];
const weekNames=["快速启动与逻辑","故事、科普与内容展开","会议与礼仪","学术评议与高压问答","声音、节奏与体态","演讲结构与互动","五至八分钟脱稿","综合实战与终测"];
const dailyTakeaways=[["无提示基线｜从首录找问题","直接回应→给出理由→具体例子→自然收束","首录不使用预设提纲；练后回听第一句出现的时刻。","标记一次卡住的位置以及自己怎样接续；B1、B2原录像分开保存。","如果只能选一个重点，我认为……","这是练后观察路径，不是基线前必须套用的框架。"],["PREP黄金立论","观点（P）→理由（R）→例子（E）→重申或行动（P）","第一句先表明支持或反对；理由要与观点直接相关。","说完观点后从原因、例子、影响、对比、行动中选一项尚未展开的信息。","我支持……，主要因为……。举个例子……","换成项目评议时，给出数据获取条件等可核查依据。"],["黄金三点法","总领判断→维度一→维度二→维度三","三个抓手必须不同，不能把同一个意思换三种说法。","用对象或流程划分；每点说清一个具体动作。自然只有两点时，不硬凑第三点。","如果只抓三件事，我会从……、……和……入手。","回听时写出三个点的标题，检查是否重叠。"],["时间轴与空间视角","过去→现在→未来；或个人→团队→学校","过去一句交代起点，现在说明具体变化，未来说清计划而非成效。","空间视角适合分清不同主体的职责；卡住时用前后对比展开。","过去我们……，现在……，下一步准备……。","生活故事保持真实时间顺序，计划不可当成已经发生。"],["卡壳急救｜停、复位、接续","停1—2秒→回到当前主旨→新增信息→继续","忘词就换普通说法；不反复道歉、不从开头重讲。","从例子、影响、行动中选未说过的一项；事实说错直接更正。","我换一个更具体的说法……","约35秒主动停顿后，检查接上的内容有没有增加新信息。"],["第一周｜观点、三点与时间轴","先辨任务→选合适组织方式→展开→收束","盲抽三题各5秒准备、60秒首录，先保存再看框架。","观点题先立场，建议题分不同维度，进展题说来路与下一步。","如果只保留一个重点，我想说的是……","各题独立评议，只重录最弱的一题；不提前背示范。"],["SCQA｜把问题带出来","背景（S）→冲突（C）→问题（Q）→答案（A）","用听众熟悉的共同背景切入，再给具体冲突。","前30秒说清为什么值得听及你的主张，避免重复背景。","我们希望……，但现在……。怎样解决？我的建议是……","换题时先明确谁遇到什么困难，再给一项行动。"],["STAR微故事","场景（S）→卡点（T）→动作（A）→结果与启发（R）","用一件具体物品、动作或画面让听众看见事情。","突出改变结果的关键动作；明确模拟或真实，未知结果不补造。","真正的转折发生在……","故事结尾给听众可以借鉴的一项小行动。"],["术语降维｜用途、类比、边界","概念用途→熟悉情境→相似机制→适用边界","用普通人能理解的关系解释术语，类比必须解释机制。","补一句实际条件；保险风险汇聚不等同于任意损失都能赔。","可以把它想成……，但实际还要看……。","遇到陌生概念，换具体场景，而非换另一组术语。"],["数字表达｜口径、变化、意义","说明分母和口径→给绝对变化→给相对或百分点变化→解释","40/100到60/100：多20人、提高20个百分点、相对增幅50%。","只报告材料支持的变化；不因为通知时间变化就断言原因。","换成每100个人来看，就是……","迁移题24/80到32/80：多8人、占比提高10个百分点。"],["三个功能词脱稿","引入→举例→推荐","关键词是提醒下一步的路标，不是逐字稿缩写。","选一个具体画面并解释值得分享的原因；重录时撤掉纸条。","我推荐它，主要是因为……。有一个画面……","换题只保留三个功能词，使用新的材料而非背原句。"],["第二周｜观点加故事","主张→具体过程→关键转折→启发","随机抽取一题，15秒准备、120秒首录，练后才总结。","用一个真实或明确模拟的动作支撑观点，故事必须服务主线。","这个过程最值得注意的一步是……","与前周只比可观察行为；不直接比较不同条件的总分。"],["会议点名｜承—点—落","承接前一位→补一个新角度→给例子或行动","首句接住前一位的具体关切，不以没准备、自贬或空泛赞同开场。","只贡献一项新信息，最后落到共同目标或具体建议。","刚才谈到了……，我想补充一个……的角度。","练习5—10秒找方向，而不是先想一段完整稿。"],["一分钟工作汇报","状态→卡点→选项及推荐→待决事项","第一句可先报需要负责人决定的事；之后用已知事实解释。","推荐要有理由，未确认的场地、时间或人员不能提前承诺。","目前……已落实，唯一需要您决定的是……。","结尾听众应能复述今天到底要拍板什么。"],["建设性分歧","共同目标→具体分歧→可承担的替代方案","认同真正合理的目标，不虚假恭维；反对具体方案而非个人。","清楚说自己能承担什么、哪些需要共同分工，语气平稳。","我赞成……这个目标，但建议把具体做法调整为……。","把拒绝转化为边界明确的合作办法。"],["礼仪答谢｜感谢、肯定、展望","具体感谢→共同价值→贴合场合的祝愿","从讲者或同事实际做过的一件事出发，不念履历、不编成绩。","以正常谈话语调表达感谢，祝愿具体；聚餐饮品不限。","特别感谢您今天把……讲得很清楚，让我们……。","练后检查感谢对象和事件是否能够被听众准确识别。"],["教师寄语｜画面与行动","欢迎或共同情境→具体画面→鼓励→行动提醒","从学生能感受到的小事进入；没有亲历素材就用一般情境。","给可执行的小建议，不把寄语变成训话，也不保证成功。","当你第一次遇到……时，可以先……。","最后留一句学生能够记住并使用的话。"],["第三周｜场景切换","辨明场合→选择结构→直接展开→对应收束","会议强调新观点；礼仪强调真诚具体；汇报强调待决事项。","三张题卡各10秒准备、60秒首录；不把同一种语气照搬所有场合。","我想从大家现在最关心的……说起。","三题独立保存，只修最弱的一题。"],["主持与串场","邀请缘由→主题关联→听众收获→明确交接","只介绍材料提供的相关背景，不编头衔或奖项。","交接时眼神转向嘉宾；问答串场明确剩余时间和提问方式。","接下来有请……，围绕……为我们作分享。","迁移时用一句承接报告主线，再自然引导问答。"],["亮—核—建｜学术点评","真实亮点→唯一核心问题→具体改进建议","亮点要能从材料核查；问题聚焦证据与主张是否匹配。","两班均分82与76只说明观察差异；核查分班、起点及教学条件。","这项研究值得肯定的是……，我最希望作者澄清的是……，建议先……。","迁移到银行等待时间时，抓日期时段代表性及同口径观察。"],["相关与因果｜表达证据边界","已知发现→能否作因果判断→替代解释→检验方向","直接说观察数据支持关联，不保证培训造成生产率提升。","把混杂解释成生活语言，如原有能力或自选择；不否认描述信息的价值。","目前看到的是……之间的关联，要判断是否由……造成，还需……。","对答疑成绩差异，先核查参与机制与学习起点。"],["接—定—推｜面对质疑","接住问题→界定已知与未知→提出下一步","第一句正面回应，不先解释自己多努力。","明确尚未确认的口径或原因；承诺核查动作，不承诺未知结果。","目前能确认的是……，还需要核实……。下一步我会……。","重录时把一处自辩换成可核查的行动。"],["连环追问｜排序与压缩","先保紧急事项→处理待决事项→明确责任→收束","把嘉宾调序、预算压缩、宣传稿审核三问分组，逐一回应。","首录120秒不打断；重录60秒提醒后用30秒收束，不靠加速。","我按紧急程度分三件事回应，第一……","核对三问均有对应动作，待确认的事项不说成已确定。"],["第四周｜主答与追问","主答价值→实施→评价；追问直答→条件→行动","主答120秒；追问各45秒，先独立录制后再读参考。","直接回答质疑，区别计划、实施与证据，不以满意度替代有效性判断。","对于您问的这一点，目前我们能做到的是……","抽查最弱的45—60秒，不用补录替换原测评。"],["呼吸、语速与停顿","承接情绪→分清意见与自我价值→给下一步","一句一个意思，关键处自然停1—2秒，呼吸以舒适为准。","只修一处赶句或吞字，避免机械数秒。先熟段，再新题。","先不用急着给这件事下结论。〔停〕我们可以……","鼓励失利学生时先承接失落，再给一个可执行动作。"],["核心词重音","说明条件→对比实际支出→给选择依据","重读真正体现差异的词，不靠喊或每字加重。","第二件半价与七五折买两件都150元；只买一件分别100元、75元。","同样是优惠，关键是你原本打算买几件。","满200减50情境重读原计划与实际支付；按需求比较。"],["目光连接｜按意群扫视","主张→具体例子→行动建议","独练镜头与眼睛接近同高；左、中、右各讲完一个意思再移动。","静音回看首尾15秒，只改一种游离行为；不机械数秒或强迫直视。","比如我们把一周的时间……，就能看到……。","按身体条件调整视线，目光服务听众理解。"],["稳定站姿与功能性手势","家庭→社区→保险；分别说明能托住什么","自然站稳或坐稳；切分、对比、收拢只在有内容功能时使用。","三个层次不能互相完全替代；保险责任按合同。静音检查动作同步。","可以从三个层次理解这个问题……","每次只修一个多余动作，不要求使用手势。"],["紧张中的上台行动","走到位置→站定→自然呼气→看向听众→停顿开口","60秒舒适安顿，感觉不适即暂停；先练最小可承受的真实场景。","记录从上台到首句的时长和主观紧张度，不作诊断。","我今天想讲的重点是……","即使紧张，也只专注说清第一句，不急着道歉。"],["第五周｜声画分离复盘","静音看画面→只听声音→结合内容→只修一处","同一段分别观察站姿、目光与停连、重音，避免评判外貌。","先熟段两遍再新题120秒；从声或画中选一个最影响理解的问题。","我下一次只调整……这一处。","真实课堂导入只试一种停顿或手势，记录实际表现。"],["四类强开场","设问／反差／微故事／数字→共同冲突→主旨→后文","入口必须通向主旨，不能为了吸睛转入无关内容。","四种各15秒，任选两种扩展45秒；假设数字不能说成调查结果。","明明只想……，为什么最后反而……？","回看前30秒，判断听众是否已知道为何值得听。"],["一条主线贯穿三分钟","问题→三道筛子（来源、比较口径、解释边界）→核查行动","先确定听众只记住的一句话，每段提供支持主张的新信息。","没有基数、对照或来源的宣传不能直接得出因果结论。","转发之前，我建议先过三道筛子……","删除一个不服务核心主旨的材料。"],["自然过渡与听众路标","任务设计→实施→评价；用有信息的过渡连接","用因果承接、设问或小结引下，说明为何从一段进入下一段。","至少两次有信息的过渡；只替换一个空洞的“接下来”。","目标明确以后，我们还要问：怎样知道学生做到了？","听众应能复述两段之间的逻辑关系。"],["有说服力的正文","判断→具体案例→解释机制→凝练句","例子中要有可见的动作；把提问、协作各自的价值解释出来。","不虚构实施效果，不用空泛口号或绝对判断。","工具能生成方案，但我们仍需要先弄清……。","迁移时用自动排班与真实时间冲突的具体动作支撑主张。"],["结尾｜呼应或行动号召","回扣开场画面→核心主旨→短句收束；或具体行动→结束","不新增论点；末句短而有落点，停顿后结束。","分别试45秒呼应版和行动版，不要求听众人人消费或分享隐私。","下次不妨先做一件事：……。","迁移到读书会或家庭聚会，给一个今晚或下次可做的动作。"],["第六周｜三分钟完整演讲","主旨→案例起点→具体尝试→行动号召","用三格记路标而非全文；至少两次有意义的自然停顿。","从首尾和转折各抽看30秒，只重说薄弱片段。","下一堂课，我想请大家先改变一个具体动作……","有真实听众请其复述；无反馈时只记模拟。"],["四格脑图与空间记忆","入口→问题→例证→行动","每格只留物件与一两个词；可用手机、账单、安全网、合同串联。","围绕家庭承受能力与合同条件，说明保险用途；不许诺产品效果。","先别问能拿回多少钱，先问自己最担心哪种损失。","抽查四个节点，重说最弱衔接；8分钟扩展另约。"],["同骨异肉｜跨受众改编","同一主张→专家版证据与设计／大众版场景与用途→共通边界","专家版解释分组、起点与识别；新生版用自选择的生活情境。","两版各120秒，主张一致；通俗化不能删掉关键条件。","我们看到的是差异；要解释差异来自哪里，还需要……。","迁移向管理者时说明下一步怎样收集和比较资料。"],["现场互动与重新聚焦","低负担提问→等待→承接真实回应→回到主线","给听众10秒思考，可不举手；无人回应时给备用过渡。","不施压、不假装有人回应；用机会成本例子说明取舍。","大家可以先在心里选一种做法，不一定要举手。","检查等待时间和回应是否真实，单练标模拟。"],["突发压缩｜保主线删枝节","区分必讲与可删→中断后直达核心→一个例子→行动","第2分钟提示黑屏后最多再讲2分钟；再独立录120秒压缩版。","删重复背景和枝节，不加快语速硬讲所有内容。","我直接说核心结论和下一步做法……","两分钟稿保留需求、风险与合同边界；长稿参见第37单元。"],["五至八分钟代表作","日常选择→基数误判→独立性误判→样本选择→核查行动","筛查假设：9个真阳性和99个假阳性，共108个阳性，9/108约8.3%。","公平独立硬币前次结果不改变下次概率；中奖宣传未展示完整样本。","看到一个数字，先问它的分母是谁，再问没有被看到的人是谁。","例子只作概率科普，不作个人医疗判断；8分钟另约。"],["真实微舞台｜两条叙事路线","真实任务→具体卡点→实际动作→真实结果→一项启发","也可先给真实启发，再倒回场景和转折；用本人事实填支架。","请听众复述一个主张和一个画面，征得同意后才录他人。","这件事让我真正意识到……，以后我会……。","未知结果照实说；没有真实听众或反馈时标待补。"],["三秒极速破题","读懂题→找一句判断→给一条具体信息→收束","五题各3秒准备、60秒首录，三秒从读懂题后起算。","观点、会议、礼仪、科普、反转分别适配；不为速度牺牲理解。","我先说最重要的一点……","先保留五题原录，只重说最弱一题，迁移换新例。"],["个人案例库","事实→卡点→动作→结果→可迁移启发","一张卡只留一条价值主张，记录事实来源及可核实程度。","同一案例面对教师与学生改变启发方向；模拟不计真实案例。","这个故事对我们现在的任务有什么启发？","有几张真实案例就存几张，剩余槽位待补。"],["长演讲与高压问答","需求→方案→资源→评估；答问直答→条件→下一步","两场讲座为未试点方案；用已知场地、师资与经费约束说明可行性。","匿名情境答题只能提供当次表现信息，不证明未来一定不会被骗。","我们先说明能怎样实施，再用实际反馈决定如何改进。","保留5分钟主演讲及两次90秒追问；仅重说最薄弱片段。"],["同题基线复测｜保留可比性","同题同限时首录→独立自评→对照旧录→单点修订","B1、B2各30秒准备、90秒发言，站坐方式、镜头和评分尽量一致。","先完成新首录和自评，再打开旧录像；标记题目熟悉、设备和评分者变化。","与第一天相比，我能从录像中观察到的变化是……。","共享课程资源迁移单列，不能把同题分差解释为训练因果效果。"],["终测｜即兴与五分钟演讲","短题直接回应并展开；长题四格主线→例证→行动","F1为15秒准备、90秒；F2为60秒画图、300秒，各自保留首录。","两类任务分别记六维、口语活度与可观察指标，缺测不折算总分。","我希望听众最后能记住的是……","如已见题标熟悉或另取同类题；重说不替换终测视频。"],["结业与90天维持","一项有证据的变化→一项待改→下一场合→复查安排","仅依据自己的真实记录总结，不凭阅读数量推断能力。","每周一次真实应用，每月一次录像体检；没有机会就标待补。","下一次我将在……使用……，之后观察……。","把维护计划写成可核查的时间、场合、技巧和行为。"]];
const weekColors=[["#dff7d6","#c1e4b2"],["#fff4ce","#eddc93"],["#dbf5ec","#b9e7d6"],["#e4f0ff","#c6dff6"],["#ffe8de","#f2cfc5"],["#ecf3ce","#d4e2a5"],["#eee5fb","#d9ccf1"],["#dcf4df","#bfe5c9"]];
const iconPaths={brand:"<path d='M12 20V10M12 13C6 13 3 9 3 4c5 0 9 3 9 8M12 11c0-6 4-9 9-9 0 6-3 10-9 10M6 21h12'/>",case:"<rect x='4' y='3' width='16' height='18' rx='2'/><path d='M8 8h8M8 12h8M8 16h5'/>",method:"<path d='M8 15a7 7 0 1 1 8 0v2H8zm1 5h6M12 8v5'/>",timer:"<circle cx='12' cy='13' r='8'/><path d='M12 8v5l3 2M9 2h6'/>",refs:"<path d='M3 5h6l3 2 3-2h6v14h-6l-3 2-3-2H3zM12 7v14'/>",transfer:"<path d='M3 8h17m-4-4 4 4-4 4M21 16H4m4-4-4 4 4 4'/>",notes:"<rect x='4' y='3' width='14' height='18' rx='2'/><path d='M8 7h6M8 11h6M8 15h3M15 17l6-6'/>",week:"<rect x='3' y='5' width='18' height='16' rx='3'/><path d='M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 18h2'/>",ai:"<path d='M12 2 14.5 9.5 22 12 14.5 14.5 12 22 9.5 14.5 2 12 9.5 9.5Z'/>"};
const icon=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[k]||iconPaths.case}</svg>`;
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch{storageOK=false;return false}}
function persist(){let a=write(KEY,old),b=write(GKEY,garden);storageOK=a&&b;try{window.dispatchEvent(new Event("speaking:progress-applied"))}catch{}return storageOK}
function status(message,id="page-status"){let node=$(id);if(node){node.textContent=message;node.className=storageOK?"status":"error"}}
function metaFor(n){return old.units[n]??(old.units[n]={})}
function markFor(n){return garden.marks[n]??(garden.marks[n]={})}
function current(){return data?.units[unit-1]}
const fold=(label,html,open=false)=>`<details ${open?"open":""}><summary>${E(label)}</summary><div class="detailbody">${html}</div></details>`;
const panel=(key,title,en,tone,html,ic=key)=>`<section id="g-${key}" class="panel ${tone}"><div class="phead"><span class="picon">${icon(ic)}</span><div><small>${E(en)}</small><h2>${E(title)}</h2></div></div><div class="pbody">${html}</div></section>`;
const btn=(txt,act,attr="",cl="")=>`<button type="button" class="${cl}" data-act="${act}" ${attr}>${E(txt)}</button>`;
function sourceText(s){return String(s??"").replace(/\r/g,"").replace(/([\u3400-\u9fff，。！？；：、])\n(?=[\u3400-\u9fff，。！？；：、])/g,"$1").replace(/ *\n *(?=[（(])/g,"").trim()}
const text=s=>`<div class="text">${E(sourceText(s))}</div>`;
function cleanNav(s){return String(s).split("\n").filter(x=>!/^返回(?:题卡|训练单元|课程目录|单元|完整)/.test(x.trim())&&!/^继续查看同题参考二/.test(x.trim())).join("\n")}
function sliceGuide(a,b){let g=data.guide,i=g.indexOf(a);if(i<0)return"";let j=b?g.indexOf(b,i+a.length):-1;return g.slice(i,j<0?undefined:j)}
function art(w,small=false){
 const id="g-art-"+(++uid),k=(w-1)%8;
 const palette=[["#82dcb6","#f4d768"],["#f6c974","#78ceb3"],["#79c7cd","#efb9a1"],["#85b8e6","#bce16f"],["#f0b0a0","#84dcb9"],["#b1d968","#87cbe0"],["#b9b0ed","#80d8b5"],["#70d3ab","#f7d980"]][k];
 const [c1,c2]=palette;
 const star=(x,y,r)=>`<path class="glint" d="M${x} ${y-r}Q${x+2} ${y-2} ${x+r} ${y}Q${x+2} ${y+2} ${x} ${y+r}Q${x-2} ${y+2} ${x-r} ${y}Q${x-2} ${y-2} ${x} ${y-r}" fill="#fffdea"/>`;
 const leaf=(x,y,a)=>`<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 26Q-24 2 0-23Q25 2 0 26Z" fill="url(#${id}leaf)" stroke="#faffd7" stroke-width="1"/><path d="M0 24V-18" stroke="#74ae53" stroke-width="1.2" opacity=".65"/></g>`;
 let obj;
 if([0,4,6].includes(k)){
 obj=`<g class="float" filter="url(#${id}s)"><circle cx="172" cy="113" r="66" fill="url(#${id}pearl)" stroke="#fff" stroke-width="2"/><circle cx="172" cy="113" r="54" fill="url(#${id}color)" opacity=".8"/><rect x="154" y="56" width="36" height="73" rx="18" fill="url(#${id}pearl)" stroke="#fff"/><path d="M163 69h18M163 80h18M163 91h18" stroke="#88ba8b" stroke-width="2" stroke-linecap="round"/><path d="M144 105v8a28 28 0 0 0 56 0v-8M172 141v25M152 166h40" fill="none" stroke="#4aa578" stroke-width="4" stroke-linecap="round"/></g>`;
 }else if([1,5].includes(k)){
 obj=`<g class="float" filter="url(#${id}s)"><path d="M69 82Q122 66 172 98Q222 66 275 82v88q-55-16-103 14-48-30-103-14Z" fill="url(#${id}pearl)" stroke="#fff" stroke-width="2"/><path d="M172 98v86M78 176q48-11 94 14 46-25 94-14" stroke="#80bd8b" fill="none" stroke-width="3"/><g stroke="#8eaa8a" stroke-width="2" opacity=".6">${Array.from({length:4},(_,j)=>`<path d="M87 ${100+j*14}Q124 ${94+j*14} 158 ${111+j*14}M186 ${111+j*14}Q220 ${94+j*14} 257 ${100+j*14}" fill="none"/>`).join("")}</g></g>`;
 }else if([2,3].includes(k)){
 obj=`<g class="float" filter="url(#${id}s)"><rect x="96" y="55" width="145" height="137" rx="16" fill="url(#${id}pearl)" transform="rotate(-7 96 55)" stroke="#fff"/><rect x="120" y="43" width="146" height="136" rx="15" fill="#fafff6" stroke="#fff"/><rect x="136" y="60" width="114" height="16" rx="5" fill="${c1}"/><path d="M139 91h90M139 104h70" stroke="#93bea1" stroke-width="3" stroke-linecap="round"/><circle cx="155" cy="140" r="13" fill="#83d4ac"/><path d="M149 140l4 4 8-10" fill="none" stroke="#fff" stroke-width="2"/><rect x="177" y="130" width="62" height="8" rx="3" fill="${c2}"/><rect x="177" y="145" width="48" height="8" rx="3" fill="${c1}"/></g>`;
 }else{
 obj=`<g class="float" filter="url(#${id}s)"><rect x="98" y="44" width="148" height="151" rx="18" fill="url(#${id}pearl)" stroke="#fff"/><g transform="translate(118 68)"><rect width="110" height="20" rx="6" fill="${c1}"/><rect y="34" width="28" height="61" rx="6" fill="#b6dc74"/><rect x="40" y="21" width="28" height="74" rx="6" fill="${c1}"/><rect x="80" y="6" width="28" height="89" rx="6" fill="${c2}"/><path d="M0 102h110" stroke="#89a88b" stroke-width="2"/></g></g>`;
 }
 return `<svg viewBox="0 0 340 235" aria-hidden="true"><defs><linearGradient id="${id}pearl" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset=".52" stop-color="#f2f9e2"/><stop offset="1" stop-color="#d4edd0"/></linearGradient><linearGradient id="${id}color" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff6b5"/><stop offset=".45" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><linearGradient id="${id}leaf" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dded9e"/><stop offset=".6" stop-color="#8bd27f"/><stop offset="1" stop-color="#4fb98c"/></linearGradient><filter id="${id}s"><feDropShadow dx="2" dy="7" stdDeviation="4" flood-color="#387b53" flood-opacity=".25"/></filter></defs><circle cx="172" cy="116" r="98" fill="#fff4" stroke="#fff8"/><circle cx="172" cy="116" r="85" fill="none" stroke="#fff8"/><ellipse cx="172" cy="116" rx="144" ry="67" transform="rotate(-23 172 116)" stroke="#ffffff9c" stroke-width="1.5" fill="none"/>${leaf(77,56,-36)}${leaf(278,167,48)}${leaf(72,185,-61)}${obj}<g class="float" filter="url(#${id}s)"><rect x="239" y="28" width="75" height="41" rx="12" fill="url(#${id}pearl)" stroke="#fff"/><path d="M251 68v12l18-12" fill="#e9f6dc"/><g fill="#6db889"><circle cx="257" cy="48" r="3.5"/><circle cx="277" cy="48" r="3.5"/><circle cx="296" cy="48" r="3.5"/></g></g>${star(46,86,9)}${star(307,105,10)}${star(125,211,7)}<circle cx="302" cy="195" r="6" fill="#ffe695" stroke="#fff"/></svg>`
}
const caseArt=()=>`<svg viewBox="0 0 140 136" aria-hidden="true"><rect x="22" y="13" width="96" height="109" rx="10" fill="#fffef4" stroke="#fff"/><rect x="31" y="26" width="78" height="13" rx="4" fill="#71cba2"/><path d="M34 51h59M34 61h44" stroke="#9fc4a7" stroke-width="3" stroke-linecap="round"/><circle cx="46" cy="87" r="14" fill="#84d7b2"/><path d="M39 87l5 5 9-11" stroke="#fff" stroke-width="2.5" fill="none"/><circle cx="94" cy="87" r="14" fill="#efcc72"/><path d="M94 80v10m0 4v1" stroke="#8d7134" stroke-width="2.5"/><path d="M34 110h70" stroke="#d6e9c7" stroke-width="3" stroke-linecap="round"/></svg>`;
function hero(title,sub,w,eyebrow,meta,actions=""){
 return `<header class="hero"><div class="hero-copy"><p class="eyebrow">${E(eyebrow)}</p><h1>${E(title)}</h1><p>${E(sub)}</p><div class="meta">${meta.map(x=>`<span class="pill">${E(x)}</span>`).join("")}</div>${actions?`<div class="hero-actions">${actions}</div>`:""}</div><div class="hero-art">${art(w)}</div></header>`
}
function countDone(){return data.units.filter(u=>old.units[u.id]?.complete===true).length}
function tile(u){const r=old.units[u.id]||{},m=garden.marks[u.id]||{},c=[r.complete?"done":r.mini?"mini":r.pm?"pm":"",r.real?"real":"",u.id===old.current?"current":""].filter(Boolean).join(" ");return `<a class="tile ${c}" href="#u${pad(u.id)}" title="${E(u.title)}" aria-label="第${u.id}单元 ${E(u.title)}">${pad(u.id)}</a>`}
function renderHome(){
 unit=0;selection=null;let n=countDone(),next=data.units.find(u=>old.units[u.id]?.complete!==true)||data.units[47],resume=data.units[(Number(old.current)||1)-1]||next;
 $("app").innerHTML=hero("让思路发光，让表达清晰","高校教师即兴发言与脱稿演讲 · 8周48单元个性化开放式研习",resume.week,"QINGNING GARDEN · 青柠花园",["手机自主录音录像","全程自由阅读","每题双示范"],`<a href="#u${pad(resume.id)}">继续第${pad(resume.id)}单元</a>${resume.id!==next.id?`<a href="#u${pad(next.id)}">下一未完成单元</a>`:""}`)
 +panel("weeks","八周课程地图","YOUR LEARNING PATH","lime",`<div class="home-info"><div><h3>${n} / 48 单元</h3><p class="small">仅依据本人确认的实际训练标记</p></div><span class="pill gold">${Math.round(n/48*100)}%</span></div><div class="progressline"><span style="width:${100*n/48}%"></span></div><div class="week-list" style="margin-top:12px">${weekNames.map((name,i)=>{let w=i+1,us=data.units.filter(u=>u.week===w),c=weekColors[i];return `<article class="week-card" style="--wbg:${c[0]};--wedge:${c[1]}"><div class="week-top"><div><p class="week-no">WEEK ${pad(w)}</p><h3>${E(name)}</h3></div><div class="week-art">${art(w,true)}</div></div><div class="tiles">${us.map(tile).join("")}</div>${fold("查看本周六个单元",us.map(u=>`<a class="lesson-link" href="#u${pad(u.id)}"><span>${pad(u.id)}</span><span>${E(u.title)}</span></a>`).join(""))}</article>`}).join("")}</div><div class="facts"><span>绿色：已完成今日练习</span><span style="background:#dbeafd">蓝色：原PM记录</span><span style="background:#ffe7a3">黄色：原保底记录</span><span>右下绿点：原真实应用记录</span></div><p class="small" style="margin-top:9px">每周第7天休整或补练；进度与9周、18周历史版本相互独立。</p>`,"week")
 +panel("tools","学习工具与历史版本","STUDY RESOURCES","blue",`<div class="actions" style="margin-top:0">${btn("56天开练指南","guide","",'primary')}${btn("成长与备份","assets")}${btn("个人训练导航","personal")}${btn("八大框架","framework")}</div><p class="small" style="margin-top:10px">首次基线请直接进入第01单元，先不阅读框架与答案。</p><hr><p><a href="../dual-track-2026/">9周63天126课旧版</a> · <a href="../legacy-18week.html">18周126课旧版</a> · <a href="../../study/#courses">研究学习中心</a></p>`,"refs");
 syncHeader();status(""); 
}
function refParts(key){
 const arr=data.refs[key];if(!arr?.length)return null;
 const marker=/\n(?:练后核对[^\n]*|练后自评依据[^\n]*)(?:\n|$)/;
 let models=[],checks=[];
 const splitOne=(body,title)=>{let raw=cleanNav(body),m=raw.match(marker),before=m?raw.slice(0,m.index):raw;if(m)checks.push(raw.slice(m.index+m[0].length).trim());let k=before.indexOf("关键词及作用");return {title,text:(k>=0?before.slice(0,k):before).trim(),keywords:k>=0?before.slice(k+"关键词及作用".length).trim():""}};
 if(arr.length===1){let b=arr[0].body,idx=b.indexOf("\n参考二\n");if(idx<0)return {raw:arr.map(x=>x.title+"\n"+x.body).join("\n\n")};models.push(splitOne(b.slice(0,idx).replace(/^参考一\s*/,""),"参考一"));models.push(splitOne(b.slice(idx+"\n参考二\n".length),"参考二"))}
 else{arr.forEach((x,i)=>models.push(splitOne(x.body,i===0?"参考一":"参考二")))}
 return {models,checks:checks.join("\n")};
}
function modelCards(models){return models.map((m,i)=>`<article class="answer ${i===1?"b":""}"><h3><span class="answer-tag">${i===0?"A":"B"}</span>${E(m.title||("参考"+(i===0?"一":"二")))}</h3><div class="spoken">${E(sourceText(m.text))}</div><div class="keywords"><b>对应关键词及作用</b>${E(sourceText(m.keywords))}</div></article>`).join("")}
function references(key,label="展开两份标准参考答案"){
 let r=refParts(key);if(!r)return "";
 if(r.raw)return fold(label,text(r.raw));
 return fold(label,modelCards(r.models)+(r.checks?`<div class="rubric"><b>练后自评依据</b>${E(sourceText(r.checks))}</div>`:""));
}
function transferRefs(t){return fold("展开本案例两份完整参考答案",modelCards(t.models)+`<div class="rubric"><b>练后自评依据</b>${E(t.checks.map((x,i)=>(i+1)+"．"+x).join("\n"))}</div>`)}
function times(prep,sec){return `<div class="time-tags"><span class="pill">${prep>0?"准备 "+prep+" 秒":"准备时间按原任务"}</span><span class="pill gold">发言 ${sec>=60&&sec%60===0?sec/60+" 分钟":sec+" 秒"}</span></div>`}
function timerButtons(task){return `<div class="timer-inline"><div><b>${task.prepare>0?task.prepare+"s ＋ ":""}${task.duration}s</b><p class="small">${E(task.label)} · 可选计时</p></div><div class="actions">${btn(task.prepare>0?"准备＋发言":"发言计时","timer",`data-key="${E(task.key)}" data-mode="both"`,"primary smallbtn")}${task.prepare>0?btn("只计发言","timer",`data-key="${E(task.key)}" data-mode="speech"`,"smallbtn"):""}</div></div>`}
function pmModule(u){
 const p=u.pm,idx=p.indexOf("反例"),j=p.indexOf("正例",idx+2);
 let html;
 if(!u.assessment&&idx>=0&&j>idx){let prefix=p.slice(0,idx).trim(),bad=p.slice(idx+2,j).replace(/^[:：]\s*/,""),pos=p.slice(j+2).replace(/^[:：]\s*/,"");html=`<p class="method-text">${E(prefix)}</p><div class="contrast"><div><b>反面表达</b>${E(bad)}</div><div><b>正面表达与静默预演</b>${E(pos)}</div></div>`}
 else html=text(p);
 const special=!u.assessment&&u.id===20?`<div class="method-grid"><div class="method-tile"><b>亮</b><small>材料中真实优点</small></div><div class="method-tile"><b>核</b><small>最重要问题</small></div><div class="method-tile"><b>建</b><small>具体改进建议</small></div></div>`:"";
 const extra=!u.assessment&&[2,4,7,9,13,14,19,22].includes(u.id)?fold("可选2分钟普通话辨音",`<p>慢读词组、短句，再自然改述；只选一组，不追求速度。</p><p class="small">完整练习见个人训练导航，正式测评不使用。</p>`+btn("个人训练工具","personal","","smallbtn")):"";
 return panel("pm","前晚 PM · 方法建模","10 MIN · EVENING","gold",fold(u.assessment?"展开设备准备（不含题目）":"展开本课思维方法与正反例",special+html+extra+`<div class="actions">${btn("可选4分钟静默预演","timer",'data-key="pm" data-mode="speech"',"smallbtn")}</div>`), "method")
}
function planCards(u){
 if(!u.cards.length)return [];
 if(selection?.unit===u.id)return selection.order;
 let order=[...u.cards];
 if([6,18,43].includes(u.id)){for(let i=order.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}}
 if(u.id===12)order=[order[Math.random()<.5?0:1]];
 selection={unit:u.id,order,index:-1};return order
}
function specialTask(u){
 let s="";
 if(u.id===31)s=`<div class="actions">${btn("15秒入口试说","timer",'data-key="entry" data-mode="speech"',"smallbtn")}${btn("45秒第一路线","timer",'data-key="main" data-mode="both"',"smallbtn")}${btn("45秒第二路线","timer",'data-key="main" data-mode="both"',"smallbtn")}</div>`;
 if(u.id===35)s=`<div class="actions">${btn("45秒首尾呼应","timer",'data-key="main" data-mode="both"',"smallbtn")}${btn("45秒行动号召","timer",'data-key="main" data-mode="both"',"smallbtn")}</div>`;
 if(u.id===38)s=`<div class="actions">${btn("专家版 20＋120秒","timer",'data-key="main" data-mode="both"',"smallbtn")}${btn("大众版 20＋120秒","timer",'data-key="main" data-mode="both"',"smallbtn")}</div>`;
 if(u.id===40)s=`<div class="actions">${btn("60秒准备＋4分钟中断演练","timer",'data-key="cut" data-mode="both"',"primary")}${btn("10秒准备＋2分钟压缩版","timer",'data-key="compressed" data-mode="both"',"smallbtn")}</div><p class="small">第2分钟响铃提示“只剩2分钟”；长稿见第37单元。</p>`;
 if(u.id===23)s=`<div class="actions">${btn("重录90秒（60秒提醒收束）","timer",'data-key="short23" data-mode="speech"',"smallbtn")}</div>`;
 return s
}
function primaryModule(u){
 let hasMain=!u.assessment||u.id===45;
 const main={key:"main",prepare:u.prepare,duration:u.duration,label:"正式题"};
 let contents=hasMain?`<div class="case-layout"><div class="case-art">${caseArt()}</div><div class="case-text"><p class="eyebrow">正式题 · 原教材</p>${text(u.task)}</div></div>${times(u.prepare,u.duration)}${u.id===40?"":timerButtons(main)}${specialTask(u)}`: `<p class="warning">按原测评规则先独立开口，再看示范。题卡逐张主动揭开，首录与复测的固定条件不变。</p>${text(u.task)}`;
 if(u.id===45)contents+="<p class='small'>主演讲完成后再看以下追问题卡。</p>";
 if(u.cards.length)contents+=`<div style="margin-top:12px" id="card-tray">${cardTray(u)}</div>`;
 return panel("case","次晨 AM · 正式案例","SPEAKING PRACTICE","",contents,"case")
}
function cardTray(u){
 let order=planCards(u),idx=selection.index;
 let txt=idx<0?`<div class="task-card"><div class="cardhead"><h3>独立题卡</h3><span class="pill gold">${order.length} 题</span></div><p class="muted" style="margin-top:8px">${u.id===12?"已随机抽取本次一题。":([1,24,45,46,47].includes(u.id)?"按原题固定顺序逐张展示。":"编号顺序已随机排列。")}点击揭题，尚不显示题目或答案。</p><div class="actions">${btn("揭开第一张题卡","card","data-index=\"0\"","primary")}${u.id===12?btn("重新抽取（未揭题时）","reshuffle","","smallbtn"):""}</div></div>`:(()=>{let k=order[idx],c=data.cards[k];return `<div class="task-card"><div class="cardhead"><h3>题卡 ${E(k)} · ${idx+1} / ${order.length}</h3><span class="pill">${c.prepare}秒 / ${c.duration}秒</span></div><div class="task">${E(c.task)}</div>${timerButtons({key:k,label:"题卡 "+k,prepare:c.prepare,duration:c.duration})}<div class="actions">${idx>0?btn("上一张","card",`data-index="${idx-1}"`,"smallbtn"):""}${idx+1<order.length?btn("下一张题卡","card",`data-index="${idx+1}"`,"primary smallbtn"):""}${btn("收起题卡","card",'data-index="-1"',"smallbtn")}</div>${references(k,"本题双示范与自评依据")}</div>`})();
 return txt
}
function warmModule(u){if(u.week!==5)return"";let w=sliceGuide("第 5 周固定熟段","第 29 单元｜上台前 60 秒");let pre= u.id===29?fold("上台前60秒与五级真实场景阶梯",text(sliceGuide("第 29 单元｜上台前 60 秒","三项可观察目标"))+btn("60秒舒适准备","timer",'data-key="breath" data-mode="speech"',"smallbtn")):"";
 return panel("warm","声音与体态专项 · 先熟段","WEEK 05 · WARM-UP","coral",text(w)+`<div class="actions">${btn("2分钟舒适热身","timer",'data-key="warm2" data-mode="speech"',"smallbtn")}${btn("6分钟单一动作","timer",'data-key="warm6" data-mode="speech"',"smallbtn")}${btn("30秒熟段","timer",'data-key="warm30" data-mode="speech"',"primary smallbtn")}</div>`+pre,"timer")}
function referenceModule(u){
 let k=pad(u.id),main=data.refs[k]?references(k):"";
 let title=u.assessment?"测评题双示范":"同题双示范";
 let extra=data.extensions[k]?fold("8分钟扩展（W7D7 / W8D7 自选）",data.extensions[k].map(v=>`<h3>${E(v.title)}</h3>${text(v.body)}`).join("")+`<div class="actions">${btn("8分钟独立演讲计时","timer",'data-key="extension" data-mode="speech"',"smallbtn")}</div>`):"";
 let cards=u.cards.length?fold("按题卡编号查看练后参考（建议首录后）",u.cards.map(id=>references(id,"题卡 "+id+" · 两份参考")).join("")):"";
 let fallback=u.id===40?`<p><a href="#u37">打开第37单元五分钟原稿与双示范</a></p>`:"";
 return panel("refs",title,"TWO MODEL ANSWERS","blue",`<div class="refbanner"><div><b>同题，两条优秀表达路线</b><small>完整口语参考 · 对应关键词 · 练后核对</small></div><div class="reficon"><span>A</span><span>B</span></div></div><p class="small">建议独立发言后再看；参考答案为训练示范，不是唯一正确表达。${u.id===42?"本课仅提供两套真实经历口述支架。":""}</p>${main}${cards}${fallback}${extra}`,"refs")
}
function transferModule(u){let arr=transfers.cases[u.id]||[];return panel("transfer","陌生情境迁移与真实应用","TRANSFER PRACTICE","lime",`<div class="stack">${arr.map(t=>`<article class="task-card"><div class="cardhead"><h3>${E(t.label)}</h3><span class="pill gold">${t.duration} 秒</span></div><div class="task">${E(t.task)}</div>${t.conditionNote?`<p class="small" style="margin-top:7px">${E(t.conditionNote)}</p>`:""}${timerButtons(t)}${transferRefs(t)}</article>`).join("")}</div>`,"transfer")}
function reviewModule(u){
 let n=garden.notes[u.id]||{};
 return panel("review","单点复盘 · 自主记录","REFLECTION & PROGRESS","coral",`<div class="task"><p class="eyebrow">本课只修一处</p>${text(u.fix)}</div>${fold("20 / 25分钟建议安排（可自由调整）",`<div class="schedule">${u.schedule.map(s=>{let a=s.match(/^(\d\d:\d\d—\d\d:\d\d)\s*(.*)$/s);return `<div class="schedule-row"><b>${E(a?a[1]:"步骤")}</b><span>${E(a?a[2]:s)}</span></div>`}).join("")}</div><div class="rubric"><b>完成记录</b>${E(u.record)}</div>`)}<label class="field">一条真实观察（可选）<textarea id="lesson-note" placeholder="例如：首句重复了两次；下次直接回应问题。">${E(n.note||"")}</textarea></label><div class="actions">${btn("保存复盘","save-note","","smallbtn")}${btn("可选六维独立自评","assessment","","smallbtn")}</div><label class="field">听众真实反馈（没有留空）<textarea id="real-feedback" placeholder="听众复述的主旨或一条具体建议">${E(n.feedback||"")}</textarea></label><div class="actions">${btn("保存反馈","save-note","","smallbtn")}${btn("成长与备份","assets","","smallbtn")}</div><p class="small" id="page-status">可选记录只保存在本浏览器。</p>`,"notes")
}

function takeawayModule(u){
 const [title,outline,tip1,tip2,phrase,carry]=dailyTakeaways[u.id-1];
 const steps=outline.split("→").map(v=>v.trim());
 const content=`<h3 class="takeaway-title">${E(title)}</h3><div class="takeaway-label">01 · 表达提纲</div><div class="takeaway-flow">${steps.map((v,i)=>`<span><b>${pad(i+1)}</b>${E(v)}</span>`).join("")}</div><div class="takeaway-label">02 · 表达技巧</div><div class="takeaway-tips"><p>${E(tip1)}</p><p>${E(tip2)}</p></div><div class="takeaway-label">03 · 可调用句式</div><div class="takeaway-phrase">“${E(phrase)}”</div><div class="takeaway-label">04 · 迁移与复盘要点</div><p>${E(carry)}</p>`;
 return panel("takeaway","今日表达提纲与技巧总结","DAILY TAKEAWAYS","lime",u.assessment?'<p class="small">先完成独立首录，再阅读以下归纳；不设强制门禁。</p>'+fold("展开今日练后总结",content):content,"method")
}
function completionModule(u){
 const done=old.units[u.id]?.complete===true;
 return `<section class="completion-box" aria-label="今日练习完成记录"><div class="completion-art">${icon("brand")}</div><div class="completion-text"><h3>今日练习</h3><p class="small" id="completion-status" aria-live="polite">${done?"已记录完成 · 再次点击可取消标记":"实际完成练习后，点击下方按钮即可记录。"}${u.assessment?" 测评请先保存规定首录。":""}</p></div><button type="button" id="complete-today" class="complete-btn ${done?"is-done":""}" data-act="complete-today" aria-pressed="${done}" title="${done?"再次点击取消完成标记":"标记今日练习已完成"}">${done?"✓ 已完成今日练习":"完成今日练习"}</button></section>`
}
function toggleCompletion(){
 if(!unit)return;const r=metaFor(unit),before=r.complete===true,previousDate=r.date,previousNotes=garden.notes[unit],next=!before;
 r.complete=next;if(next)r.date=new Date().toISOString();else delete r.date;
 const note=$("lesson-note"),feedback=$("real-feedback");
 if(note||feedback)garden.notes[unit]={...(previousNotes||{}),note:note?.value??previousNotes?.note??"",feedback:feedback?.value??previousNotes?.feedback??"",updated:new Date().toISOString()};
 if(!write(KEY,old)){r.complete=before;if(previousDate===undefined)delete r.date;else r.date=previousDate;if(previousNotes===undefined)delete garden.notes[unit];else garden.notes[unit]=previousNotes;status("存储不可用，未能确认保存。","completion-status");return}const notesOK=write(GKEY,garden);storageOK=notesOK;try{window.dispatchEvent(new Event("speaking:progress-applied"))}catch{}
 const b=$("complete-today");if(b){b.textContent=next?"✓ 已完成今日练习":"完成今日练习";b.classList.toggle("is-done",next);b.setAttribute("aria-pressed",String(next));b.title=next?"再次点击取消完成标记":"标记今日练习已完成"}
 status((next?"已记录完成 · 课程目录将同步显示。再次点击可取消标记。":"已取消完成标记。")+(notesOK?"":" 复盘文字未能保存，请另行复制。"),"completion-status");
}

function syncHeader(){let a=!!current()?.assessment;$("nav-frames").hidden=a;$("nav-personal").hidden=a;try{let off=localStorage.getItem(MKEY)==="off";document.body.classList.toggle("no-motion",off);$("motion-toggle").textContent=off?"动效关":"动效开";$("motion-toggle").setAttribute("aria-pressed",String(!off))}catch{}}
function renderUnit(n){
 unit=Math.max(1,Math.min(48,n));const u=current();old.current=unit;persist();if(selection?.unit!==unit)selection=null;if(u.cards.length)planCards(u);
 const meta=[`W${pad(u.week)} · D${u.day}`,`PM 10分钟 · AM ${u.minutes}分钟`,"自主手机录音","双示范"];
 $("app").innerHTML=hero(u.title,"第"+u.week+"周 · "+weekNames[u.week-1]+"；按自己的节奏阅读与训练。",u.week,"UNIT "+pad(unit)+" / 48",meta,`<a href="#courses">课程目录</a>${u.assessment?'<a href="#g-case" data-jump="case">打开独立题卡</a>':btn("可选独立计时","timer",'data-key="main" data-mode="both"',"primary")}`)

 +pmModule(u)+warmModule(u)+primaryModule(u)+referenceModule(u)+transferModule(u)+reviewModule(u)+takeawayModule(u)+completionModule(u)
 +`<div class="lesson-bottom">${unit>1?`<a href="#u${pad(unit-1)}">← 上一单元</a>`:'<a href="#courses">返回课程目录</a>'}${unit<48?`<a href="#u${pad(unit+1)}">下一单元 →</a>`:'<a href="#courses">返回课程目录</a>'}</div>`;
 syncHeader()
}
function route(){
 const hash=location.hash, m=hash.match(/^#u(\d{1,2})$/);if(m&&+m[1]>=1&&+m[1]<=48){renderUnit(+m[1]);window.scrollTo(0,0)}else if(!hash||hash==="#courses"||!hash.startsWith("#g-")){renderHome();window.scrollTo(0,0)}
}
function taskByKey(key){
 if(!current())return null;const u=current();
 let t=transfers.cases[u.id]?.find(x=>x.key===key);if(t)return t;
 if(data.cards[key]&&u.cards.includes(key))return {...data.cards[key],key,label:"题卡 "+key};
 const fixed={pm:[0,240,"静默预演"],warm2:[0,120,"舒适热身"],warm6:[0,360,"熟段孤立动作"],warm30:[0,30,"固定熟段"],breath:[0,60,"上台前舒适准备"],entry:[0,15,"开场入口"],cut:[60,240,"中途压缩演练"],compressed:[10,120,"完整压缩版"],short23:[0,90,"90秒收束重说"],extension:[0,480,"8分钟扩展"],revision:[0,60,"单点重说"]};
 if(fixed[key]){let [prepare,duration,label]=fixed[key];return {key,prepare,duration,label,task:u.task}}
 if(u.assessment){let k=selection?.order[selection.index];return k?taskByKey(k):null}
 return {key:"main",prepare:u.prepare,duration:u.duration,label:"U"+pad(unit)+" 正式题",task:u.task}
}
let timer=null,interval=null,sound=null;
const clock=s=>pad(Math.floor(Math.max(0,s)/60))+":"+pad(Math.max(0,s)%60);
function beep(){try{if(!sound)return;let o=sound.createOscillator(),g=sound.createGain();o.frequency.value=660;g.gain.setValueAtTime(.06,sound.currentTime);g.gain.exponentialRampToValueAtTime(.0001,sound.currentTime+.18);o.connect(g).connect(sound.destination);o.start();o.stop(sound.currentTime+.2)}catch{}}
function paint(){
 if(!timer)return;const t=timer,remaining=Math.max(0,t.remaining);$("dock").hidden=false;$("dock-clock").textContent=clock(remaining);$("dock-title").textContent="U"+pad(t.unit)+" · "+t.label;$("dock-phase").textContent=t.phase==="done"?"计时结束":(t.phase==="prep"?"准备": "发言")+(t.running?" · 计时中":" · 已暂停");$("dock-ring").setAttribute("stroke-dashoffset",175.9*(1-remaining/Math.max(1,t.total)));$("dock-pause").textContent=t.running?"暂停":"继续";$("dock-pause").disabled=t.phase==="done";$("dock-cue").textContent=t.cue||"";
}
function beginPhase(phase,seconds){if(interval)clearInterval(interval);timer.phase=phase;timer.total=timer.remaining=seconds;timer.deadline=Date.now()+seconds*1000;timer.running=true;timer.cue="";timer.cued=false;interval=setInterval(tick,160);paint()}
function startTimer(key,mode){
 let t=taskByKey(key);if(!t){status("请先揭开一张题卡，再启动计时。");let el=$("g-case");el?.scrollIntoView({behavior:"smooth"});return}
 try{sound??=new (window.AudioContext||window.webkitAudioContext)();sound.resume().catch(()=>{})}catch{}
 timer={...t,unit,initialMode:mode,phase:"",remaining:0,total:0,running:false,cue:""};beginPhase(mode==="both"&&t.prepare>0?"prep":"speech",mode==="both"&&t.prepare>0?t.prepare:t.duration)
}
function tick(){if(!timer?.running)return;let t=timer;t.remaining=Math.max(0,Math.ceil((t.deadline-Date.now())/1000));let elapsed=t.total-t.remaining;if(t.phase==="speech"&&!t.cued){if(t.unit===5&&t.key==="main"&&elapsed>=35){t.cue="主动停顿2秒，再接续";t.cued=true;beep()}if(t.key==="short23"&&elapsed>=60){t.cue="剩余30秒，收束";t.cued=true;beep()}if(t.key==="cut"&&elapsed>=120){t.cue="模拟投影中断：只剩2分钟";t.cued=true;beep()}}
 if(!t.remaining){clearInterval(interval);beep();if(t.phase==="prep"){beginPhase("speech",t.duration);return}t.running=false;t.phase="done"}paint()
}
function pauseTimer(){if(!timer||timer.phase==="done")return;if(timer.running){timer.remaining=Math.max(0,Math.ceil((timer.deadline-Date.now())/1000));timer.running=false;clearInterval(interval)}else{timer.running=true;timer.deadline=Date.now()+timer.remaining*1000;interval=setInterval(tick,160)}paint()}
function resetTimer(){if(!timer)return;clearInterval(interval);let p=timer.initialMode==="both"&&timer.prepare>0?"prep":"speech";timer.phase=p;timer.total=timer.remaining=p==="prep"?timer.prepare:timer.duration;timer.running=false;timer.cue="";timer.cued=false;paint()}
function closeTimer(){clearInterval(interval);timer=null;$("dock").hidden=true}
function openDialog(title,html){$("dialog-title").textContent=title;$("dialog-body").innerHTML=html;$("dialog").showModal()}
function closeDialog(){if($("dialog").open)$("dialog").close()}
function guideDialog(which){
 if(which==="guide")openDialog("56天开练与使用说明",text(data.guide.slice(0,data.guide.indexOf("思维框架库")))+`<p class="small">网页版采用自由阅读和手机独立录制。Word中的跳转说明以网页操作为准。</p>`);
 else if(which==="personal")openDialog("个人训练导航",text(data.personal));
 else if(which==="framework")openDialog("八大高频思维框架",text(sliceGuide("八大高频框架：1—4","6 维 12 分：统一操作量表")));
 else openDialog("课程工具 · 复盘与反馈",text(data.tools)+fold("六维量表与反馈方法",text(sliceGuide("6 维 12 分：统一操作量表","二轮精修工具：独立题卡")))+fold("四套AI陪练脚本",text(sliceGuide("脚本 1｜盲抽考官","第 5 周固定熟段"))))
}
function saveNote(){if(!unit)return;garden.notes[unit]={note:$("lesson-note")?.value||"",feedback:$("real-feedback")?.value||"",updated:new Date().toISOString()};persist();status(storageOK?"已保存到本浏览器。":"存储不可用，请复制记录或导出备份。")}
function scoringTotal(scores){return scores.length===6&&scores.every(v=>[0,1,2].includes(v))?scores.reduce((a,b)=>a+b,0):null}
function scoreDialog(){
 const u=current();if(!u)return;
 const ids=u.cards.length?u.cards:[pad(unit)];const opts=ids.map(x=>`<option value="${E(x)}">${E(x)}</option>`).join("");
 openDialog("可选六维独立自评",`<p class="muted">请在手机回看原始首录后填写。每次保存均新增独立记录，不覆盖以前的首录。</p><label class="field">记录题号<select id="score-key">${!u.assessment&&u.cards.length?`<option value="${pad(unit)}">主演讲</option>`:""}${opts}${(transfers.cases[u.id]||[]).map(t=>`<option value="${E(t.key)}">${E(t.label)} ${E(t.key)}</option>`).join("")}</select></label><label class="field">录制方式<select id="score-media"><option value="video">手机视频</option><option value="audio">手机音频</option><option value="none">无录音，仅回忆</option></select></label><div class="score-grid" style="margin-top:12px">${labels.map((v,i)=>`<label class="field">${E(v)}<select id="score-${i}"><option value="">未测</option><option value="0">0 · 未做到</option><option value="1">1 · 部分做到</option><option value="2">2 · 清楚做到</option></select></label>`).join("")}</div><p class="status" id="score-total">独立总分：未测 / 12</p>${u.week>=5?'<label class="field">口语活度（独立，不并入总分）<select id="score-oral"><option value="">未测</option><option>0</option><option>1</option><option>2</option></select></label>':""}<label class="field">最弱表现<select id="score-weak"><option value="">未选择</option>${weaknesses.map(x=>`<option>${E(x)}</option>`).join("")}</select></label><label class="field">首句实质回应耗时（秒，可空）<input type="number" min="0" step=".1" id="score-opening"></label><label class="field">实际发言时长（秒，可空）<input type="number" min="1" id="score-seconds"></label><label class="field">全段填充词次数（可空）<input type="number" min="0" id="score-filler"></label><label class="field">全段转写净字数（可空）<input type="number" min="0" id="score-chars"></label><label class="check"><input type="checkbox" id="score-familiar"> 以前接触过这道题</label><label class="field">轮次<select id="score-round"><option>首录</option><option>重录</option><option>迁移</option></select></label><label class="field">实际时间戳 / 原句 / 单点修订<textarea id="score-note"></textarea></label>${btn("保存本次独立记录","save-score","","primary")}${fold("展开原六维12分评分标准",text(sliceGuide("6 维 12 分：统一操作量表","评估与反馈")))}<p id="score-msg" class="small"></p>`)
}
function scoreValues(){let mode=$("score-media")?.value||"none";const a=labels.map((_,i)=>{let v=$("score-"+i)?.value;return v===""||v===undefined?null:+v});if(mode!=="video")a[5]=null;if(mode==="none")a[4]=null;return a}
function updateScore(){let mode=$("score-media")?.value;if(!mode)return;if(mode!=="video")$("score-5").value="";$("score-5").disabled=mode!=="video";if(mode==="none")$("score-4").value="";$("score-4").disabled=mode==="none";$("score-total").textContent="独立总分："+(scoringTotal(scoreValues())??"未测")+" / 12"}
function saveScore(){
 let v=scoreValues(),media=$("score-media").value,round=$("score-round").value,key=$("score-key").value;
 const num=id=>{let v=$(id)?.value;return v!==undefined&&v!==""&&Number.isFinite(+v)&&+v>=0?+v:null};
 let s=num("score-seconds"),o=num("score-opening"),f=num("score-filler"),c=num("score-chars");if(s===0)s=null;if(s!==null&&o!==null&&o>s){$("score-msg").textContent="启动时间不能超过实际时长。";return}
 if(media==="none"){o=f=c=null}
 let entry={id:Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7),unit,key,round,media,score:v,total:scoringTotal(v),oral:current().week>=5&&$("score-oral")?.value!==""?+($("score-oral")?.value??0):null,weak:$("score-weak").value,opening:o,seconds:s,fillerPerMin:s&&f!==null?Math.round(600*f/s)/10:null,speed:s&&c!==null?Math.round(60*c/s):null,familiar:!!$("score-familiar").checked,note:$("score-note").value,date:new Date().toISOString()};
 garden.assessments.push(entry);persist();closeDialog();status(storageOK?"独立记录已新增，原有评分未覆盖。":"未能保存，请导出备份。")
}
const providers={qwen:["千问","https://www.qianwen.com/"],deepseek:["DeepSeek","https://chat.deepseek.com/"],ima:["ima","https://ima.tencent.com/"]};
function aiDialog(key){
 if(!unit)return;let t=taskByKey(key);if(!t&&current().assessment){openDialog("免费AI评审",`<p>请先揭开需要评审的题卡，或从对应迁移题打开诊断工具。独立发言后再使用AI。</p>`);return}
 if(!t)return;
 openDialog("免费AI评审 · 自愿使用",`<p class="muted">无需API Key，不调用网页录音设备，不向任何服务自动发送内容。使用自己的已有账号，按实际支持的功能上传录音或粘贴本人核对的转写。先独立复盘，再看AI建议。</p><div class="actions">${Object.values(providers).map(([name,url])=>`<a class="link-button" href="${url}" target="_blank" rel="noopener noreferrer">${E(name)}</a>`).join("")}</div><label class="field">实际发言秒数（不确定可留空）<input type="number" min="1" id="ai-seconds"></label><label class="field">原始转写（可选；去除身份和敏感信息）<textarea id="ai-transcript" rows="5" placeholder="已有转写就粘贴，没有则在支持录音的AI里自行附上原件。"></textarea></label><label class="check"><input type="checkbox" id="ai-audio"> 我将另行提供AI确实能读取的原始声音；否则按纯文本评价。</label>${btn("生成并复制本题评审提示词","ai-copy",`data-key="${E(t.key)}"`,"primary")}<label class="field">可复制提示词<textarea readonly id="ai-prompt" rows="7"></textarea></label><p class="small" id="ai-status">禁止虚构时间戳、语速或体态。不要发送未公开研究资料、学生身份或他人录像。</p>`)
}
async function copyText(s,where){try{await navigator.clipboard.writeText(s);$(where).textContent="已复制。"}catch{if($("ai-prompt")){$("ai-prompt").focus();$("ai-prompt").select()}$(where).textContent="请手动复制。"}}
async function aiCopy(key){let t=taskByKey(key);if(!t)return;let u=current(),tr=$("ai-transcript").value.trim(),audio=$("ai-audio").checked,secs=$("ai-seconds").value;let prompt=`你是高校教师即兴发言训练教练。单元：${u.title}。\n实际题干：${t.task}\n实际发言时长：${secs?secs+"秒":"未提供"}。请只依据我提供的原始发言材料，不编造原句、数据或个人经历。${audio?"我会另附录音；只有能真正读取原声音时，才分析声音、节奏及填充词。":"只依据文字评价主旨、内容展开、逻辑、例证与情境。不能据此推断实际声音、停顿位置、破题秒数或体态。"}\n先给一个可核查的亮点，再指出唯一最影响听众理解的问题，引用实际原句并提供一句自然口语改写。按0/1/2分给六维建议（破题、结构、例证、情境、声音、体态），未测项留空；无连续视频不能评体态。没有真实材料先请我补充，不评分。不要把相关说成因果。${u.week>=5?"独立评价口语活度0—2分，不计入六维总分。":""}\n${tr?"原始转写：\n"+tr:"原始材料将由我另行提供。"}\n最后给一项可执行的重录动作。`;
 $("ai-prompt").value=prompt;await copyText(prompt,"ai-status")
}
function assetsDialog(){
 const records=garden.assessments.slice(-25).reverse(),oldCount=Array.isArray(old.records)?old.records.length:0;
 const rows=records.map(r=>`<tr><td>U${pad(r.unit)} ${E(r.key)}</td><td>${E(r.round)}</td><td>${E(r.media==="video"?"视频":r.media==="audio"?"音频":"无录音")}</td><td>${E(r.total??"未测")}</td><td>${E(r.opening??"—")}</td><td>${E(r.fillerPerMin??"—")}</td></tr>`).join("");
 const baseline=["B1","B2"].map(k=>{const v=n=>[...garden.assessments].reverse().find(r=>r.unit===n&&r.key===k&&r.round==="首录"&&r.media!=="none");let a=v(1),b=v(46);return `<p>${k}：01 ${E(a?.total??"未测")} / 12；46 ${E(b?.total??"未测")} / 12</p>`}).join("");
 openDialog("成长记录与备份",`<p class="muted">旧版互动训练的本地记录仍保留（${oldCount} 条）；本版新增独立记录 ${garden.assessments.length} 条。新旧记录不覆盖、不自动判定进步。</p><div class="table-wrap"><table><thead><tr><th>题目</th><th>轮次</th><th>媒介</th><th>总分/12</th><th>启动秒</th><th>口癖/分</th></tr></thead><tbody>${rows||'<tr><td colspan="6">暂无本版自评</td></tr>'}</tbody></table></div>${fold("01 / 46 基线同题记录",baseline+"<p class='small'>只有条件相近的有效录像才适合描述性比较；同题熟练、评分者和设备变化需另记。</p>")}${fold("个人案例库",`<p class="small">只保存去标识、本人核实的经历。</p>${garden.cases.map((c,i)=>fold("案例 "+(i+1)+" · "+(c.title||"待填写"),`<label class="field">标题<input data-case="${i}" data-field="title" value="${E(c.title)}"></label><label class="field">事实、卡点、动作、结果、启发<textarea data-case="${i}" data-field="text">${E(c.text)}</textarea></label>${btn("删除","case-delete",`data-i="${i}"`,"smallbtn")}`)).join("")}${btn("新增案例卡","case-add","","smallbtn")}`)}${fold("90天维持计划",`<p>每周一次真实应用，每月一次录像检查。没有真实场合时留待补。</p><label class="field">日期<input id="maint-date" type="date" value="${new Date().toISOString().slice(0,10)}"></label><label class="field">真实场合 / 下一次行动<textarea id="maint-text"></textarea></label>${btn("新增维护记录","maint-add","","smallbtn")}${garden.maintenance.map(x=>`<p class="small">${E(x.date)} · ${E(x.text)}</p>`).join("")}`)}<div class="actions">${btn("导出本机JSON备份","export","","primary")}${btn("导入恢复","import","","smallbtn")}${btn("完整复盘工具","tools","","smallbtn")}</div><input id="backup-file" type="file" accept=".json,application/json" hidden><p id="asset-msg" class="small">备份可能包含个人记录，仅本人保管。不含录音录像和API凭证。</p>`)
}
function exportBackup(){let file=new Blob([JSON.stringify({schema:"speaking-garden-v1",exported:new Date().toISOString(),legacy:old,garden},null,2)],{type:"application/json"}),url=URL.createObjectURL(file),a=document.createElement("a");a.href=url;a.download="speaking-garden-"+new Date().toISOString().slice(0,10)+".json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function importBackup(file){try{if(file.size>20*1024*1024)throw Error("备份文件过大");let p=JSON.parse(await file.text());if(p.schema!=="speaking-garden-v1"||!p.legacy?.units||!Array.isArray(p.legacy.records)||!p.garden?.notes||!p.garden?.marks||!Array.isArray(p.garden.assessments)||!Array.isArray(p.garden.cases)||!Array.isArray(p.garden.maintenance))throw Error("不是青柠花园备份");if(Object.keys(p.legacy.units).some(k=>!/^\d+$/.test(k)||+k<1||+k>48)||p.garden.assessments.some(x=>!x||!Number.isInteger(x.unit)||x.unit<1||x.unit>48||!Array.isArray(x.score)||x.score.length!==6||x.score.some(v=>v!==null&&![0,1,2].includes(v)))||p.garden.cases.some(x=>!x||typeof x.title!=="string"||typeof x.text!=="string")||p.garden.maintenance.some(x=>!x||typeof x.date!=="string"||typeof x.text!=="string"))throw Error("备份记录结构不正确");if(!confirm("恢复会替换此浏览器的新版记录。建议先备份当前记录，确定继续？"))return;old=p.legacy;garden=p.garden;persist();closeDialog();route()}catch(e){$("asset-msg").textContent="导入失败："+e.message}}
document.addEventListener("click",async e=>{
 const jump=e.target.closest("[data-jump]");if(jump){e.preventDefault();$("g-"+jump.dataset.jump)?.scrollIntoView({behavior:document.body.classList.contains("no-motion")?"auto":"smooth",block:"start"});return}
 const b=e.target.closest("[data-act]");if(!b||b.disabled)return;
 const act=b.dataset.act;
 if(act==="card"&&selection){selection.index=+b.dataset.index;$("card-tray").innerHTML=cardTray(current());return}
 if(act==="reshuffle"&&current()?.id===12&&selection?.index===-1){selection=null;planCards(current());$("card-tray").innerHTML=cardTray(current());return}
 switch(act){
 case "timer":startTimer(b.dataset.key,b.dataset.mode);break;
 case "pause":pauseTimer();break;case "reset":resetTimer();break;case "close-timer":closeTimer();break;
 
 case "complete-today":toggleCompletion();break;
 case "save-note":saveNote();break;case "guide":case "personal":case "framework":case "tools":guideDialog(act);break;
 case "assessment":scoreDialog();break;case "save-score":saveScore();break;case "ai":aiDialog(b.dataset.key||"main");break;case "ai-copy":await aiCopy(b.dataset.key);break;
 case "assets":assetsDialog();break;case "close-dialog":closeDialog();break;
 case "case-add":garden.cases.push({title:"",text:""});persist();closeDialog();assetsDialog();break;
 case "case-delete":if(confirm("删除这张本机案例卡？")){garden.cases.splice(+b.dataset.i,1);persist();closeDialog();assetsDialog()}break;
 case "maint-add":{let d=$("maint-date").value,t=$("maint-text").value.trim();if(d&&t){garden.maintenance.push({date:d,text:t});persist();closeDialog();assetsDialog()}}break;
 case "export":exportBackup();break;case "import":$("backup-file")?.click();break;
 case "motion":{let off=document.body.classList.toggle("no-motion");b.textContent=off?"动效关":"动效开";b.setAttribute("aria-pressed",String(!off));try{localStorage.setItem(MKEY,off?"off":"on")}catch{}}break;
 }
});
document.addEventListener("change",async e=>{
 let el=e.target;if(el.id?.startsWith("score-"))updateScore();

 if(el.dataset.case!==undefined&&garden.cases[+el.dataset.case]&&["title","text"].includes(el.dataset.field)){garden.cases[+el.dataset.case][el.dataset.field]=el.value;persist()}
 if(el.id==="backup-file"&&el.files?.[0])await importBackup(el.files[0])
});
window.addEventListener("hashchange",route);
Promise.all([fetch("data/curriculum.json",{cache:"no-cache"}),fetch("data/transfer-references.json",{cache:"no-cache"})]).then(async res=>{if(res.some(x=>!x.ok))throw Error("课程数据加载失败");return Promise.all(res.map(x=>x.json()))}).then(([d,t])=>{if(d.units.length!==48||Object.keys(d.cards).length!==22||Object.keys(d.refs).length!==62||Object.keys(t.cases).length!==48||Object.values(t.cases).flat().length!==54)throw Error("课程数据不完整");data=d;transfers=t;route()}).catch(e=>{$("app").innerHTML=`<section class="panel"><div class="pbody"><h2>课程暂未载入</h2><p>${E(e.message)}</p><p>请刷新页面，或打开 <a href="../dual-track-2026/">历史课程</a>。</p></div></section>`});
})();
