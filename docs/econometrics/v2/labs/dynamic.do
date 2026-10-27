version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 1000
gen long id=_n
gen double a=rnormal()
expand 8
bysort id: gen long t=_n
xtset id t
gen double y=a/(1-.6)+rnormal() if t==1
forvalues j=2/8 {
    replace y=.6*L.y+a+rnormal() if t==`j'
}
xtreg y L.y, fe vce(cluster id)
* Genuine Arellano-Bond difference GMM, restricted instrument lags.
xtabond y, lags(1) maxldep(2) vce(robust)
estat abond
* This is not system GMM. Do not invent a Hansen statistic if not available.
