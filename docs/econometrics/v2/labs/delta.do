version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 1600
gen double x=runiform(0,6)
gen double y=1+2*x-.3*x*x+rnormal()*(1+.2*x)
regress y c.x##c.x, vce(robust)
nlcom (stationary: -_b[x]/(2*_b[c.x#c.x]))
* Stationary point, not an inflection. Check x support and denominator.
