version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 2500
gen double x1=rnormal()
gen double x2=rnormal()
gen byte y=runiform()<invlogit(-.4+.8*x1-.5*x2)
capture program drop logistic_ll
program define logistic_ll
    args lnf xb
    * Stable log(1+exp(xb)): max(xb,0)+ln(1+exp(-abs(xb)))
    quietly replace `lnf'=$ML_y1*`xb'-(max(`xb',0)+ln(1+exp(-abs(`xb'))))
end
ml model lf logistic_ll (y=x1 x2), vce(robust)
ml maximize
matrix handmade=e(b)
logit y x1 x2, vce(robust)
matrix builtin=e(b)
matrix list handmade
matrix list builtin
margins, dydx(x1 x2)
