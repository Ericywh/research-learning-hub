version 17.0
clear all
set more off
* Observed-data teaching extract. Provider example data may be altered.
* This is a conditional association, NOT an identified causal return to schooling.
use "https://www.stata-press.com/data/r19/nlsw88.dta", clear
count
keep if !missing(wage,grade,ttl_exp,tenure) & wage>0
count
generate double lnwage=ln(wage)
regress lnwage grade ttl_exp tenure, vce(robust)
