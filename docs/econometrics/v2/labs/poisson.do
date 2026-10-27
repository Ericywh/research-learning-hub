version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 4000
gen double x=rnormal()
gen double mu=exp(.3+.4*x)
gen double mix=rgamma(2,.5)
gen long y=rpoisson(mu*mix)
poisson y x, vce(robust)
estat gof
nbreg y x, vce(robust)
