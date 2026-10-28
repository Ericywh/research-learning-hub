version 17.0
clear all
set more off
args mode
if "`mode'" == "" local mode demo
* Run from docs/psm-did/analysis. First generate results/<mode>/analysis_panel.csv
* using run.py. This ensures exactly the same cohort and missing-value audit.
import delimited "results/`mode'/analysis_panel.csv", clear encoding(utf8)
isid city_key year
egen cityid=group(city_key)
xtset cityid year
capture mkdir "results/`mode'/stata"
log using "results/`mode'/stata/estimation.log", text replace
preserve
keep if inlist(g,0,2014)
gen byte did=(g==2014 & year>=2014)
areg y did i.year, absorb(cityid) vce(cluster cityid)
estimates store twfe
forvalues m=4(-1)2 {
    gen byte pre`m'=(g==2014 & year==2014-`m')
}
forvalues k=0/4 {
    gen byte post`k'=(g==2014 & year==2014+`k')
}
areg y pre4 pre3 pre2 post0-post4 i.year, absorb(cityid) vce(cluster cityid)
test pre4 pre3 pre2
restore
* Official two-period matching and smooth IPWRA on outcome changes.
preserve
keep if inlist(g,0,2014) & inlist(year,2013,2016)
keep cityid g year y gdp population tertiary_pct
reshape wide y gdp population tertiary_pct, i(cityid g) j(year)
gen double dy=y2016-y2013
gen byte treat=(g==2014)
gen double lngdp=ln(gdp2013)
gen double lnpop=ln(population2013)
teffects psmatch (dy) (treat c.lngdp##c.lnpop tertiary_pct2013), atet nneighbor(1)
tebalance summarize
teffects ipwra (dy lngdp lnpop tertiary_pct2013) ///
    (treat c.lngdp##c.lnpop tertiary_pct2013), atet
restore
* Freeze covariates at the baseline; no contemporaneous policy mediators.
bys cityid: egen double gdp13=max(cond(year==2013,ln(gdp),.))
bys cityid: egen double pop13=max(cond(year==2013,ln(population),.))
bys cityid: egen double tertiary13=max(cond(year==2013,tertiary_pct,.))
capture which csdid
if _rc {
    display "Optional csdid not installed. Install csdid and drdid from SSC, then rerun."
}
else {
    csdid y gdp13 pop13 tertiary13, ivar(cityid) time(year) gvar(g) method(dripw)
    estat simple
    estat event
}
* Time placebo uses genuinely pre-treatment years only.
keep if inlist(g,0,2014) & inrange(year,2011,2013)
gen byte pseudo=(g==2014 & year>=2012)
areg y pseudo i.year, absorb(cityid) vce(cluster cityid)
log close
