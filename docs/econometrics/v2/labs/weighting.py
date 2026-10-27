# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
import statsmodels.api as sm
from scipy.special import expit
from scipy.spatial import cKDTree
rng=np.random.default_rng(20261027);n=4000
x=rng.normal(size=n);X=sm.add_constant(x)
d=rng.binomial(1,expit(.2+.6*x));y=1+2*d+x+rng.normal(size=n)
e=sm.Logit(d,X).fit(disp=False).predict(X)
e=np.clip(e,.02,.98) # explicit clipping, check sensitivity in exercise
m0=sm.OLS(y[d==0],X[d==0]).fit().predict(X)
m1=sm.OLS(y[d==1],X[d==1]).fit().predict(X)
ipw=np.mean(d*y/e-(1-d)*y/(1-e))
psi=m1-m0+d*(y-m1)/e-(1-d)*(y-m0)/(1-e)
# Actual nearest propensity match, with replacement, ATT, explicit caliper .05.
treated=np.flatnonzero(d==1);controls=np.flatnonzero(d==0)
dist,idx=cKDTree(e[controls,None]).query(e[treated,None],k=1)
keep=dist<=.05;ti=treated[keep];ci=controls[idx[keep]]
att=np.mean(y[ti]-y[ci])
before=(x[d==1].mean()-x[d==0].mean())/np.sqrt((x[d==1].var()+x[d==0].var())/2)
after=(x[ti].mean()-x[ci].mean())/np.sqrt((x[ti].var()+x[ci].var())/2)
print('IPW ATE',ipw,'AIPW ATE',psi.mean(),'matched ATT',att)
print('Matched',len(ti),'of',len(treated),'SMD before/after',before,after)
print('Point estimates, not valid matching SE; no claim of unobserved-confounding correction')
