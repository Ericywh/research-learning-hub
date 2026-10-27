version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 80
gen long id=_n
gen double a=rnormal()
gen double c=rnormal()
expand 20
gen double x=c+rnormal()
gen double y=1+2*x+a+rnormal()
regress y x, vce(robust)
regress y x, vce(cluster id)
