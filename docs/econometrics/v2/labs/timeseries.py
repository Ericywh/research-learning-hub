# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
from statsmodels.tsa.stattools import adfuller,coint
import statsmodels.api as sm
rng=np.random.default_rng(20261027);n=800
x=rng.normal(size=n).cumsum();e=np.zeros(n)
for t in range(1,n):e[t]=.5*e[t-1]+rng.normal()
y=2*x+e
print('ADF x',adfuller(x,regression='c',autolag='AIC')[:2])
print('EG cointegration',coint(y,x,trend='c',autolag='aic')[:2])
long=sm.OLS(y,sm.add_constant(x)).fit();ec=long.resid[:-1]
fit=sm.OLS(np.diff(y),np.column_stack([np.ones(n-1),ec,np.diff(x)])).fit(cov_type='HAC',cov_kwds={'maxlags':4})
print('ECM const, adjustment, short-run',fit.params)
