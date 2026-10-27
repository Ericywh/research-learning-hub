version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 4000
gen double x=rnormal()
gen byte d=runiform()<invlogit(.2+.6*x)
gen double y=1+2*d+x+rnormal()
teffects psmatch (y) (d x, logit), atet nneighbor(1) caliper(.05)
tebalance summarize
teffects ipw (y) (d x, logit), ate
teffects aipw (y x) (d x, logit), ate
* Official teffects target/options differ from the hand-written clipped Python example.
