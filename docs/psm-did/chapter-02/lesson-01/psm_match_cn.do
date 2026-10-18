clear all
set more off
* 2014首批示范城市；仅取政策前2013年特征
import delimited "https://raw.githubusercontent.com/Cause-114/CityEdu-Eco/main/data/panel.csv", clear varnames(1) encoding("UTF-8")
keep if year == 2013
isid city_key
* 与官方名单对应的城市名称初步映射；城市群和自治州须进一步审计
gen byte treat=0
local pilots "北京 天津 上海 长沙 株洲 湘潭 石家庄 大连 本溪 哈尔滨 大庆 南京 苏州 镇江"
local pilots "`pilots' 金华 芜湖 安庆 福州 厦门 泉州 南昌 上饶 青岛 淄博 威海 临沂"
local pilots "`pilots' 郑州 洛阳 武汉 广州 深圳 中山 成都 攀枝花 贵阳 银川 吴忠"
* 自治州和新疆县级/兵团城市的统计口径未审核，当前教学映射暂不强行合并
foreach c of local pilots {
    replace treat = 1 if city_key == "`c'"
}
label data "中国城市2013年倾向得分与匹配教学样本"
label variable city_key "城市名称"
label variable treat "2014年是否属于首批示范城市（教学映射）"
label variable gdp "2013年地区生产总值（亿元）"
label variable population "2013年人口（百万人）"
label variable tertiary_pct "2013年第三产业增加值占比（%）"
label variable wage "2013年在岗职工平均工资（元）"
label define treat_zh 0 "非首批示范城市" 1 "首批示范城市"
label values treat treat_zh
* 缺失值和零值不能直接取自然对数
keep if !missing(gdp,population,tertiary_pct,wage)
keep if gdp>0 & population>0 & wage>0
egen cityid = group(city_key), label
label variable cityid "城市编号（对应中文城市名）"
gen double ln_gdp=ln(gdp)
gen double ln_pop=ln(population)
gen double ln_wage=ln(wage)
label variable ln_gdp "2013年GDP自然对数"
label variable ln_pop "2013年人口自然对数"
label variable ln_wage "2013年工资自然对数"
* 分别计算Logit与Probit得分，仅采用Logit结果匹配
logit treat ln_gdp ln_pop tertiary_pct ln_wage
predict double p_logit if e(sample), pr
probit treat ln_gdp ln_pop tertiary_pct ln_wage
predict double p_probit if e(sample), pr
label variable p_logit "Logit倾向得分（预测概率）"
label variable p_probit "Probit倾向得分（预测概率）"
bysort treat: summarize p_logit p_probit
* 在候选对照组倾向得分范围内保留处理组
quietly summarize p_logit if treat==0, meanonly
local lo=r(min)
local hi=r(max)
count if treat==1 & !inrange(p_logit,`lo',`hi')
drop if treat==1 & !inrange(p_logit,`lo',`hi')
save "中国城市_2013年倾向得分_中文标签.dta", replace
* 构造所有试点与候选非试点的距离（演示样本规模较小）
preserve
    keep if treat==0
    keep cityid city_key p_logit
    rename cityid control_id
    rename city_key control_city
    rename p_logit control_score
    tempfile pool
    save `pool'
restore
keep if treat==1
keep cityid city_key p_logit
rename cityid treated_id
rename city_key treated_city
rename p_logit treated_score
cross using `pool'
gen double distance=abs(treated_score-control_score)
label variable distance "两个城市的倾向得分绝对距离"
bysort treated_id (distance control_id): gen int match_rank=_n
label variable match_rank "候选对照城市距离排名"
tempfile allpairs
save `allpairs'
* 方法一：一对一最近邻，有放回
preserve
    keep if match_rank==1
    count
    save "中国城市_一对一最近邻匹配.dta", replace
restore
* 方法二：一对一卡尺匹配，概率距离不超过0.05
preserve
    keep if match_rank==1 & distance<=0.05
    count
    save "中国城市_卡尺005匹配.dta", replace
restore
* 方法三：一对三最近邻，有放回
keep if match_rank<=3
bysort treated_id: gen byte matches_in_set=_N
label variable matches_in_set "每个试点对应的对照城市数量"
save "中国城市_一对三最近邻匹配.dta", replace
* 本课仅进行匹配，不报告政策效果或匹配后显著性。