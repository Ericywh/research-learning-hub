version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 12000
gen double r=runiform(-1,1)
gen byte above=r>=0
gen byte d=runiform()<(.2+.5*above)
gen double y=1+2*d+.6*r+.3*above*r+rnormal()
foreach h in .2 .4 .6 {
    gen double w=1-abs(r)/`h' if abs(r)<`h'
    regress y i.above##c.r [aw=w] if abs(r)<`h', vce(robust)
    scalar jump_y=_b[1.above]
    regress d i.above##c.r [aw=w] if abs(r)<`h', vce(robust)
    display "Fuzzy local Wald = " jump_y/_b[1.above]
    drop w
}
* Point-estimate demonstration, not CCT intervals or density manipulation test.
* For a separate formal analysis install rdrobust and rddensity, record versions.
