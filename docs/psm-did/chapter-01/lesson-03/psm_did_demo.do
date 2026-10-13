clear all
set more off
* 2013=处理前，2014=名单公布年；仅用于两期教学
import delimited "https://raw.githubusercontent.com/Cause-114/CityEdu-Eco/main/data/panel.csv", clear varnames(1) encoding("UTF-8")
keep if inlist(year, 2013, 2014)
isid city_key year
* 定义首批试点（城市群及县级城市口径有待逐项审计）
gen byte treat = 0
local pilots "北京 天津 上海 长沙 株洲 湘潭 石家庄 大连 本溪 延边朝鲜族自治州 哈尔滨 大庆 南京 苏州 镇江 金华 芜湖 安庆 福州 厦门 泉州 南昌 上饶 青岛 淄博 威海 临沂 郑州 洛阳 武汉 广州 深圳 中山 成都 攀枝花 阿坝藏族羌族自治州 贵阳 银川 吴忠 阿拉尔"
foreach c of local pilots {
    replace treat = 1 if city_key == "`c'"
}
label define treated_zh 0 "非2014首批试点" 1 "2014首批试点"
label values treat treated_zh
label variable treat "是否属于2014首批宽带示范城市"
label variable wage "城市在岗职工平均工资（元）"
egen cityid = group(city_key), label
label variable cityid "城市编号（中文城市名）"
* 将城市-年份长表变为每城市一行的宽表
keep cityid city_key year treat wage gdp population tertiary_pct
reshape wide wage gdp population tertiary_pct, i(cityid) j(year)
* 只匹配两年工资完整、2013年协变量完整的城市
keep if !missing(wage2013,wage2014,gdp2013,population2013,tertiary_pct2013)
keep if gdp2013>0 & population2013>0 & wage2013>0
gen double d_wage = wage2014 - wage2013
label variable d_wage "城市2013至2014年工资变化（元）"
gen double ln_gdp = ln(gdp2013)
gen double ln_pop = ln(population2013)
gen double ln_wage = ln(wage2013)
label variable ln_gdp "2013年GDP自然对数"
label variable ln_pop "2013年人口自然对数"
label variable ln_wage "2013年工资自然对数"
* 仅根据政策前特征估计倾向得分
logit treat ln_gdp ln_pop tertiary_pct2013 ln_wage
predict double pscore if e(sample), pr
label variable pscore "2014首批入选倾向得分"
* ATT共同支持：处理城市分数须处于对照城市的范围内
quietly summarize pscore if treat == 0, meanonly
local lo = r(min)
local hi = r(max)
keep if treat==0 | inrange(pscore, `lo', `hi')
* 形成对照城市候选库：将每个对照城市与试点城市配对
preserve
    keep if treat==0
    keep cityid pscore d_wage
    rename cityid control_id
    rename pscore control_pscore
    rename d_wage control_change
    tempfile controls
    save `controls'
restore
keep if treat==1
keep cityid pscore d_wage
cross using `controls'
gen double distance = abs(pscore - control_pscore)
bysort cityid (distance control_id): keep if _n==1
* 一对一最近邻匹配、有放回；计算匹配对的DID
gen double pair_did = d_wage - control_change
label variable pair_did "每对城市的匹配后工资双重差分（元）"
quietly summarize pair_did
display "教学版匹配后DID点估计（元） = " %12.3f r(mean)
save "中国城市_PSM-DID_匹配对教学数据.dta", replace
* 不进行显著性检验：匹配后的常规标准误不可靠
