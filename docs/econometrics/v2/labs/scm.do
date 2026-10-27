version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 35
gen long t=_n
gen double y0=0
forvalues j=1/8 {
    gen double d`j'=rnormal()
    replace d`j'=d`j'[_n-1]+rnormal() if _n>1
}
replace y0=.2*d1+.5*d2+.3*d3+rnormal(0,.03)+2*(t>20)
* Mata projected gradient solves the actual simplex-constrained pre-period fit.
mata:
A=st_data((1::20),tokens("d1 d2 d3 d4 d5 d6 d7 d8"))
b=st_data((1::20),"y0")
w=J(8,1,1/8)
step=1/(2*trace(A'*A))
for (iter=1;iter<=30000;iter++) {
    v=w-step*2*A'*(A*w-b)
    u=sort(v,-1); css=run_sum(u)
    rho=1
    for (j=1;j<=8;j++) if (u[j]-(css[j]-1)/j>0) rho=j
    theta=(css[rho]-1)/rho
    w=rowmax((v:-theta,J(8,1,0)))
}
st_matrix("weights",w')
st_matrix("pre_rmse",sqrt(mean((b-A*w):^2)))
end
matrix list weights
matrix list pre_rmse
* Optimization demo only; Python companion also runs spatial placebo refits.
