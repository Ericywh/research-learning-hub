# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
import statsmodels.api as sm
from scipy.special import ndtr
from scipy.stats import norm
rng=np.random.default_rng(20261027);n=6000
x,z=rng.normal(size=(2,n));v=rng.normal(size=n)
u=.6*v+.8*rng.normal(size=n);y=1+2*x+u
d=(.3+.4*x+.8*z+v>0) # z excluded from outcome by construction
sel=sm.Probit(d,np.column_stack([np.ones(n),x,z])).fit(disp=False)
eta=np.column_stack([np.ones(n),x,z])@sel.params
lam=norm.pdf(eta)/np.clip(ndtr(eta),1e-10,1)
X=sm.add_constant(x)
naive=sm.OLS(y[d],X[d]).fit()
two=sm.OLS(y[d],np.column_stack([X[d],lam[d]])).fit()
qr=sm.QuantReg(y,X).fit(q=.25)
print('naive slope',naive.params[1],'Heckman two-step slope',two.params[1])
print('Point estimates only: second-step OLS default SE is not Heckman-corrected')
print('conditional quantile .25',qr.params)
