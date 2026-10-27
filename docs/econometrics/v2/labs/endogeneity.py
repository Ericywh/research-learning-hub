# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
import statsmodels.api as sm
rng=np.random.default_rng(20261027);n=20000
ability=rng.normal(size=n);education=12+.6*ability+rng.normal(size=n)
logwage=1+.08*education+.3*ability+rng.normal(size=n)
short=sm.OLS(logwage,sm.add_constant(education)).fit()
full=sm.OLS(logwage,np.column_stack([np.ones(n),education,ability])).fit()
predicted=.3*np.cov(education,ability,ddof=0)[0,1]/np.var(education)
print('Education included in both equations')
print('short,full, predicted OVB',short.params[1],full.params[1],predicted)
measured=education+rng.normal(size=n)
print('Measurement error slope',sm.OLS(logwage,sm.add_constant(measured)).fit().params[1])
