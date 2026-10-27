# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
import statsmodels.api as sm
rng=np.random.default_rng(20261027)
n=800
z=rng.normal(size=n); x=.6*z+rng.normal(size=n)
y=1+2*x+.8*z+rng.normal(size=n)
X=np.column_stack([np.ones(n),x,z])
b=np.linalg.lstsq(X,y,rcond=None)[0]
Z=np.column_stack([np.ones(n),z])
rx=x-Z@np.linalg.lstsq(Z,x,rcond=None)[0]
ry=y-Z@np.linalg.lstsq(Z,y,rcond=None)[0]
fwl=rx@ry/(rx@rx)
P=X@np.linalg.solve(X.T@X,X.T)
assert abs(fwl-b[1])<1e-10
assert np.max(np.abs(P@P-P))<1e-10
assert np.max(np.abs(X.T@(y-X@b)))<1e-8
fit=sm.OLS(y,X).fit(cov_type='HC1')
print('OLS',b,'FWL',fwl,'HC1 SE',fit.bse)
print('Joint Wald',fit.wald_test(np.array([[0,1,0],[0,0,1]]),scalar=True))
