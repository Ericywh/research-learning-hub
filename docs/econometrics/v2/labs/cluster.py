# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
import statsmodels.api as sm
rng=np.random.default_rng(20261027);G=80;m=20
group=np.repeat(np.arange(G),m)
x=np.repeat(rng.normal(size=G),m)+rng.normal(size=G*m)
y=1+2*x+np.repeat(rng.normal(size=G),m)+rng.normal(size=G*m)
X=sm.add_constant(x)
hc=sm.OLS(y,X).fit(cov_type='HC1')
cl=sm.OLS(y,X).fit(cov_type='cluster',cov_kwds={'groups':group,'use_correction':True})
assert np.allclose(hc.params,cl.params)
print('G=',G,'HC1 SE',hc.bse,'cluster SE',cl.bse)
