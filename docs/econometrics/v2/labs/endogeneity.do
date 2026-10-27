version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 20000
gen double ability=rnormal()
gen double education=12+.6*ability+rnormal()
gen double logwage=1+.08*education+.3*ability+rnormal()
regress logwage education, vce(robust)
regress logwage education ability, vce(robust)
gen double measured=education+rnormal()
regress logwage measured, vce(robust)
