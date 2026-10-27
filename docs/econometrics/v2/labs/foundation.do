version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 800
gen double z=rnormal()
gen double x=.6*z+rnormal()
gen double y=1+2*x+.8*z+rnormal()
regress y x z, vce(robust)
scalar full_b=_b[x]
test x z
regress x z
predict double rx, residuals
regress y z
predict double ry, residuals
regress ry rx, noconstant
assert abs(_b[rx]-full_b)<1e-8
* Coefficient identity only: final default SE is not full-model HC1.
