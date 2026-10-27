version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 600
gen long t=_n
tsset t
gen double x=rnormal()
gen double z=x+.1*rnormal()
gen double u=rnormal() in 1
replace u=.6*u[_n-1]+rnormal() if _n>1
gen double y=1+2*x+u
regress y x z
estat vif
predict double leverage, hat
summarize leverage
newey y x z, lag(4)
