* 第10课为失败即停止的政策映射审计，不能以教学名单直接运行DID
clear all
capture confirm file "policy_cohorts_verified.csv"
if _rc {
    di as error "缺少人工核验的policy_cohorts_verified.csv，停止正式回归。"
    capture log close
    exit 601
}
import delimited "policy_cohorts_verified.csv", clear varnames(1) encoding("UTF-8")
confirm variable city_key
confirm variable first_year
confirm variable source_url
isid city_key
count if !missing(first_year) & !inlist(first_year,2014,2015,2016)
if r(N)>0 {
    di as error "首次批次年份不在2014—2016核验范围，请复核"
    capture log close
    exit 459
}
label data "宽带中国2014—2016批次核验表（未完成因果估计）"
label variable first_year "首次入选宽带示范城市年份"
save "第10课_政策批次审计表.dta",replace
noi di "已通过政策批次文件结构检查；尚未开展因果效应估计。"
capture log close
