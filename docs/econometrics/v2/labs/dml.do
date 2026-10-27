version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 3000
gen double x1=rnormal()
gen double x2=rnormal()
gen double x3=rnormal()
gen double x1sq=x1*x1
gen double x2sq=x2*x2
gen double x3sq=x3*x3
gen double cross=x1*x2
gen double d=.5*x1+x2sq+rnormal()
gen double y=2*d+x1sq+.4*x3+rnormal()
gen double shuffle=runiform()
sort shuffle
gen byte fold=mod(_n,5)
gen double rd=.
gen double ry=.
forvalues k=0/4 {
    quietly regress d x1 x2 x3 x1sq x2sq x3sq cross if fold!=`k'
    predict double pd, xb
    replace rd=d-pd if fold==`k'
    drop pd
    quietly regress y x1 x2 x3 x1sq x2sq x3sq cross if fold!=`k'
    predict double py, xb
    replace ry=y-py if fold==`k'
    drop py
}
regress ry rd, noconstant vce(robust)
* Polynomial nuisance demonstration. Orthogonal-score inference needs regularity.
