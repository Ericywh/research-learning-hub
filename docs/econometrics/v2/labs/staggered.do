version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 900
gen long id=_n
gen int g=cond(id<=300,3,cond(id<=600,5,99))
gen double a=rnormal()
expand 9
bysort id: gen long t=_n-1
gen double y=a+.3*t+cond(t>=g,1+.4*(t-g),0)+rnormal()
xtset id t
foreach cohort in 3 5 {
    local base=`cohort'-1
    by id: egen double ybase=max(cond(t==`base',y,.))
    gen double change=y-ybase
    forvalues period=`cohort'/8 {
        regress change i.g if t==`period' & (g==`cohort' | g==99), vce(robust)
    }
    drop ybase change
}
* Simple ATT(g,t) with never-treated controls, not full CS-DID inference.
