version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 3000
gen double z1=rnormal()
gen double z2=rnormal()
gen double c=rnormal()
gen double x=.5+.6*z1+.4*z2+.7*c+rnormal(0,.5)
gen double u=(.7*c+rnormal(0,.5))*(1+.5*abs(z1))
gen double y=1+1.5*x+u
ivregress 2sls y (x=z1 z2), vce(robust)
estat firststage
estat endogenous
ivregress gmm y (x=z1 z2), wmatrix(robust) vce(robust)
estat overid
* J nonrejection is not proof of validity; constant included: L=3 K=2.
