version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
capture program drop experiment
program define experiment, rclass
    syntax, N(integer)
    drop _all
    quietly set obs `n'
    gen double x=runiform(0,4)
    gen double u=x*(rexponential(1)-1)
    gen double y=1+2*x+u
    quietly regress y x, vce(robust)
    return scalar b=_b[x]
    return scalar t=(_b[x]-2)/_se[x]
end
foreach n in 30 200 2000 {
    simulate b=r(b) t=r(t), reps(1000) nodots: experiment, n(`n')
    gen double covered=abs(t)<=1.96
    summarize b t covered
    histogram t, normal name(n`n', replace) title("n=`n', R=1000")
}
