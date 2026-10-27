# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
import statsmodels.api as sm
rng=np.random.default_rng(20261027);n=4000
x=rng.normal(size=n);X=sm.add_constant(x);mu=np.exp(.3+.4*x)
mix=rng.gamma(shape=2,scale=.5,size=n) # mean 1, extra conditional variance
y=rng.poisson(mu*mix)
fit=sm.GLM(y,X,family=sm.families.Poisson()).fit(cov_type='HC0')
print('Poisson QMLE under overdispersion',fit.params,'robust SE',fit.bse)
print('True slope .4, conditional mean correctly specified; not empirical data')
