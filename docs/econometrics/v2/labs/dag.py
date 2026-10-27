# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
import statsmodels.api as sm
rng=np.random.default_rng(20261027);n=20000
d=rng.normal(size=n);y=rng.normal(size=n)
collider=d+y+rng.normal(size=n)
plain=sm.OLS(y,sm.add_constant(d)).fit().params[1]
bad=sm.OLS(y,np.column_stack([np.ones(n),d,collider])).fit().params[1]
print('D and Y generated independently; collider induces conditional association')
print('No control',plain,'controlling collider',bad)
