version 17.0
clear all
set more off
set seed 20261027
* Synthetic teaching data. Stata and NumPy RNG streams differ.
set obs 160
gen long id=_n
gen double a=rnormal()
gen byte treated=id<=80
expand 8
bysort id: gen long t=_n-1
gen byte post=t>=4
gen double y=a+.2*t+treated*max(t-3,0)*.5+rnormal()
xtset id t
xtreg y i.t c.treated#c.post, fe vce(cluster id)
local events
forvalues j=0/7 {
    if `j'!=3 {
        gen byte ev`j'=(t==`j')*treated
        local events `events' ev`j'
    }
}
xtreg y i.t `events', fe vce(cluster id)
test ev0 ev1 ev2
* ev3 omitted = relative time -1. Coefficients now form an actual dynamic path.
