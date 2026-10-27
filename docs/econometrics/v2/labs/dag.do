version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 20000
gen double d=rnormal()
gen double y=rnormal()
gen double collider=d+y+rnormal()
regress y d
regress y d collider
