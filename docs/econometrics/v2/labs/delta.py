# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
import statsmodels.api as sm
rng=np.random.default_rng(20261027);n=1600
x=rng.uniform(0,6,n)
y=1+2*x-.3*x*x+rng.normal(size=n)*(1+.2*x)
X=np.column_stack([np.ones(n),x,x*x])
fit=sm.OLS(y,X).fit(cov_type='HC1')
b=fit.params;V=fit.cov_params()
g=-b[1]/(2*b[2]);G=np.array([0,-1/(2*b[2]),b[1]/(2*b[2]**2)])
se=np.sqrt(G@V@G)
def target(b):return -b[1]/(2*b[2])
h=1e-5
fd=np.array([(target(b+np.eye(3)[j]*h)-target(b-np.eye(3)[j]*h))/(2*h) for j in range(3)])
assert np.max(abs(G-fd))<1e-5
print('Stationary point, not inflection:',g,'Delta SE:',se,'support:',(x.min(),x.max()))
