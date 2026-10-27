version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 3
gen double p=cond(_n==1,.01,cond(_n==2,.04,.2))
sort p
gen double threshold=_n*.05/_N
gen long passed=cond(p<=threshold,_n,0)
egen long k=max(passed)
gen byte reject=_n<=k
list p threshold reject, noobs
