# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
import pandas as pd
import statsmodels.api as sm
rng=np.random.default_rng(20261027);N=200;T=8
id=np.repeat(np.arange(N),T);t=np.tile(np.arange(T),N)
a=rng.normal(size=N);x=np.repeat(.5*a,T)+rng.normal(size=N*T)
y=2*x+np.repeat(a,T)+.2*t+rng.normal(size=N*T)
df=pd.DataFrame({'id':id,'t':t,'x':x,'y':y})
dm=df[['x','y']]-df.groupby('id')[['x','y']].transform('mean')
# Balanced panel: demeaned time controls remove the shared deterministic trend.
fit=sm.OLS(dm.y,np.column_stack([dm.x,t-(T-1)/2])).fit(cov_type='cluster',cov_kwds={'groups':id})
print('FE slope',fit.params.iloc[0],'cluster SE',fit.bse.iloc[0])
