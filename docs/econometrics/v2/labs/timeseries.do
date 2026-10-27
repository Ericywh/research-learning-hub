version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 800
gen long t=_n
tsset t
gen double x=rnormal()
replace x=x[_n-1]+rnormal() if _n>1
gen double e=rnormal() in 1
replace e=.5*e[_n-1]+rnormal() if _n>1
gen double y=2*x+e
dfuller x, lags(4)
regress y x
predict double ec, residuals
newey D.y L.ec D.x, lag(4)
* Do NOT use ordinary dfuller ec critical values as an Engle-Granger test.
* Python companion uses coint() with residual-based cointegration critical values.
