* PSM-DID课程：公开中国城市数据，Stata 17+，教学并非已识别政策效果
version 17.0
clear all
set more off
capture log close
log using "psmdid_stata_教学.log", text replace

import delimited "https://raw.githubusercontent.com/Cause-114/CityEdu-Eco/main/data/panel.csv", clear varnames(1) encoding("UTF-8")
keep if inlist(year,2013,2014)
isid city_key year
* 当前仅为部分地级市的教学级映射，不能当正式政策识别表
local pilots "北京 天津 上海 长沙 株洲 湘潭 石家庄 大连 本溪 哈尔滨 大庆 南京 苏州 镇江"
local pilots "`pilots' 金华 芜湖 安庆 福州 厦门 泉州 南昌 上饶 青岛 淄博 威海 临沂"
local pilots "`pilots' 郑州 洛阳 武汉 广州 深圳 中山 成都 攀枝花 贵阳 银川 吴忠"
gen byte treat=0
foreach city of local pilots {
    replace treat=1 if city_key=="`city'"
}
label define treat_zh 0 "非首批试点" 1 "首批示范城市"
label values treat treat_zh
label variable treat "是否为2014年首批宽带试点（教学映射）"
label variable wage "在岗职工平均工资（元）"
egen cityid=group(city_key),label
label variable cityid "城市编号（中文城市名）"
keep cityid city_key year treat wage gdp population tertiary_pct
reshape wide wage gdp population tertiary_pct, i(cityid) j(year)
keep if !missing(wage2013,wage2014,gdp2013,population2013,tertiary_pct2013)
keep if gdp2013>0 & population2013>0 & wage2013>0
gen double ln_gdp=ln(gdp2013)
gen double ln_pop=ln(population2013)
gen double ln_wage=ln(wage2013)
gen double d_wage=wage2014-wage2013
label variable d_wage "2013—2014工资变化（元）"
label variable ln_gdp "2013年GDP自然对数"
label variable ln_pop "2013年人口自然对数"
label variable ln_wage "2013年工资自然对数"
logit treat ln_gdp ln_pop tertiary_pct2013 ln_wage
predict double pscore if e(sample),pr
label variable pscore "政策入选预测概率"
qui su pscore if treat==0,meanonly
local minc=r(min)
local maxc=r(max)
count if treat==1
local nt0=r(N)
drop if treat==1 & !inrange(pscore,`minc',`maxc')
count if treat==1
local nts=r(N)
local vars "ln_gdp ln_pop tertiary_pct2013 ln_wage"
preserve
    keep if treat==0
    keep cityid pscore d_wage `vars'
    rename cityid control_id
    rename pscore control_score
    rename d_wage control_change
    foreach v of local vars {
        rename `v' c_`v'
    }
    tempfile controls
    save `controls'
restore
keep if treat==1
keep cityid city_key pscore d_wage `vars'
cross using `controls'
gen double distance=abs(pscore-control_score)
bysort cityid (distance control_id): keep if _n==1
keep if distance<=0.05
gen double pair_did=d_wage-control_change
label variable distance "配对倾向得分距离"
label variable pair_did "匹配对工资变化双重差分（元）"
count
local nmatch=r(N)
noi di "匹配前试点数：" `nt0' "；共同支持后试点数：" `nts' "；卡尺后：" `nmatch'
noi su pair_did
save "中国城市_匹配后配对教学数据.dta",replace
* 匹配后平衡性仍不合格，不提供未经论证的显著性或因果声明
noi di "第7课：导出中文标记后的匹配对以便核对。"
export delimited using "第7课_Stata匹配对.csv",replace
log close
