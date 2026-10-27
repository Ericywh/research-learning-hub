# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
rng=np.random.default_rng(20261027);N=160;T=8
id=np.repeat(np.arange(N),T);time=np.tile(np.arange(T),N)
treated=(id<N//2).astype(int);post=(time>=4).astype(int)
tau=np.maximum(time-3,0)*.5
y=np.repeat(rng.normal(size=N),T)+.2*time+treated*tau+rng.normal(size=N*T)
df=pd.DataFrame(dict(y=y,id=id,t=time,treated=treated,post=post))
static=smf.ols('y ~ treated:post+C(id)+C(t)',df).fit(cov_type='cluster',cov_kwds={'groups':id})
names=[]
for k in range(-4,4):
    if k==-1:continue
    name='event_'+('m'+str(-k) if k<0 else 'p'+str(k));names.append(name)
    df[name]=((time-4==k)&(treated==1)).astype(int)
event=smf.ols('y ~ C(id)+C(t)+'+'+'.join(names),df).fit(cov_type='cluster',cov_kwds={'groups':id})
print('static DID',static.params['treated:post'])
for name in names:print(name,event.params[name],event.bse[name])
print('pre joint',event.wald_test('event_m4=event_m3=event_m2=0',scalar=True))
