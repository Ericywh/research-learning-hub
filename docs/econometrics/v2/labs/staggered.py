# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
rng=np.random.default_rng(20261027);N=900;T=9
cohort=np.repeat([3,5,99],N//3);a=rng.normal(size=N)
y=np.zeros((N,T))
for t in range(T):y[:,t]=a+.3*t+np.where(t>=cohort,1+.4*(t-cohort),0)+rng.normal(size=N)
rows=[]
for g in [3,5]:
    for t in range(g,T):
        delta=y[:,t]-y[:,g-1]
        att=delta[cohort==g].mean()-delta[cohort==99].mean()
        rows.append((g,t,att,1+.4*(t-g)));print('g,t,ATT,true',rows[-1])
print('Never-treated control, no covariates. Educational ATT(g,t), not full CS-DID inference.')
