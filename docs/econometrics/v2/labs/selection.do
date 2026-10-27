version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 6000
gen double x=rnormal()
gen double z=rnormal()
gen double v=rnormal()
gen double u=.6*v+.8*rnormal()
gen double latent_y=1+2*x+u
gen byte observed=(.3+.4*x+.8*z+v>0)
gen double y=latent_y if observed
heckman y x, select(observed=x z) twostep
qreg latent_y x, quantile(.25)
