version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 200
gen long id=_n
gen double a=rnormal()
expand 8
bysort id: gen long t=_n
gen double x=.5*a+rnormal()
gen double y=2*x+a+.2*t+rnormal()
xtset id t
xtreg y x i.t, fe vce(cluster id)
