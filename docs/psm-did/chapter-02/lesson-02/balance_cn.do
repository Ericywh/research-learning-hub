* PSM-DID系统课程第5课：中文Stata协变量平衡诊断
* Stata 17+；只检查2013年政策前协变量，不估计政策因果效应。
clear all
set more off
import delimited "https://raw.githubusercontent.com/Cause-114/CityEdu-Eco/main/data/panel.csv", clear varnames(1) encoding("UTF-8")
keep if year == 2013
isid city_key
* 延续第4课的地级市教学映射；自治州及县级城市尚未审计
local pilots "北京 天津 上海 长沙 株洲 湘潭 石家庄 大连 本溪 哈尔滨 大庆 南京 苏州 镇江"
local pilots "`pilots' 金华 芜湖 安庆 福州 厦门 泉州 南昌 上饶 青岛 淄博 威海 临沂"
local pilots "`pilots' 郑州 洛阳 武汉 广州 深圳 中山 成都 攀枝花 贵阳 银川 吴忠"
gen byte treat = 0
foreach city of local pilots {
    replace treat = 1 if city_key == "`city'"
}
label data "中国城市2013年匹配质量与协变量平衡性教学数据"
label variable city_key "城市名称"
label variable treat "是否为2014首批宽带示范城市（教学映射）"
label variable gdp "2013年GDP（亿元）"
label variable population "2013年人口（百万人）"
label variable wage "2013年在岗职工平均工资（元）"
label variable tertiary_pct "2013年第三产业比重（%）"
label define treat_zh 0 "非首批试点" 1 "首批试点"
label values treat treat_zh
keep if !missing(gdp,population,tertiary_pct,wage)
keep if gdp>0 & population>0 & wage>0
egen cityid = group(city_key), label
label variable cityid "城市编号（中文城市名）"
gen double ln_gdp = ln(gdp)
gen double ln_pop = ln(population)
gen double ln_wage = ln(wage)
label variable ln_gdp "2013年GDP自然对数"
label variable ln_pop "2013年人口自然对数"
label variable ln_wage "2013年工资自然对数"

* 第4课Logit设定完全一致
logit treat ln_gdp ln_pop tertiary_pct ln_wage
predict double pscore if e(sample), pr
label variable pscore "入选2014首批试点预测概率"
quietly summarize pscore if treat==0, meanonly
local lo = r(min)
local hi = r(max)
count if treat==1 & !inrange(pscore,`lo',`hi')
drop if treat==1 & !inrange(pscore,`lo',`hi')

* 先保存所有合格的候选对照城市并记录其协变量分布
local xlist "ln_gdp ln_pop tertiary_pct ln_wage"
foreach v of local xlist {
    quietly summarize `v' if treat==0
    scalar control_mean_`v' = r(mean)
    scalar control_sd_`v'   = r(sd)
}
preserve
    keep if treat==0
    keep cityid pscore `xlist'
    rename cityid control_id
    rename pscore control_score
    foreach v of local xlist {
        rename `v' c_`v'
    }
    tempfile controls
    save `controls'
restore

* 处理组与每一个对照城市组成候选配对，并选择最近邻
keep if treat==1
keep cityid pscore `xlist'
cross using `controls'
gen double distance=abs(pscore-control_score)
bysort cityid (distance control_id): keep if _n==1
keep if distance<=0.05
count
label variable distance "试点与对照倾向得分概率差"
save "中国城市_第5课匹配对_教学.dta", replace

* 固定分母：匹配处理组与全体原始对照城市的合并标准差
* 对照城市可多次被匹配，重复行不能在匹配后删去
* 输出每个协变量匹配前后有符号SMD和匹配后方差比
tempfile diagnostics
tempname ph
postfile `ph' str32 xname double smd_before smd_after vr_after using `diagnostics', replace
foreach v of local xlist {
    quietly summarize `v'
    local mt=r(mean)
    local st=r(sd)
    quietly summarize c_`v'
    local mc=r(mean)
    local sc=r(sd)
    local d=sqrt((`st'^2+control_sd_`v'^2)/2)
    local smd0=(`mt'-control_mean_`v')/`d'
    local smd1=(`mt'-`mc')/`d'
    local ratio=(`st'^2)/(`sc'^2)
    post `ph' ("`v'") (`smd0') (`smd1') (`ratio')
}
postclose `ph'
use `diagnostics', clear
label data "中国城市2013年匹配前后协变量平衡诊断"
label variable xname "2013年协变量（英文编码）"
label variable smd_before "匹配前标准化均差"
label variable smd_after "匹配后标准化均差"
label variable vr_after "匹配后方差比"
gen double abs_before = abs(smd_before)
gen double abs_after = abs(smd_after)
label variable abs_before "匹配前绝对标准化均差"
label variable abs_after "匹配后绝对标准化均差"
list, noobs
save "中国城市_第5课协变量平衡诊断_中文标签.dta", replace
* 若abs_after仍显著偏离0，须修改匹配方案；不自动宣称通过检验