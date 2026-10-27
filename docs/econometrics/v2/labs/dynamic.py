# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
from scipy.linalg import block_diag
rng=np.random.default_rng(20261027);N=1000;T=7;rho=.6
a=rng.normal(size=N);y=np.zeros((N,T+1))
y[:,0]=a/(1-rho)+rng.normal(size=N)
for t in range(1,T+1):y[:,t]=rho*y[:,t-1]+a+rng.normal(size=N)
# Restricted lag-2 level instruments, collapsed across time: one moment per unit.
# Educational one-step difference GMM; NOT full Arellano-Bond diagnostics/system GMM.
dx=[];dy=[];zs=[]
for i in range(N):
    dx.append(np.diff(y[i])[0:T-1]);dy.append(np.diff(y[i])[1:T]);zs.append(y[i,0:T-1])
dx=np.array(dx);dy=np.array(dy);zs=np.array(zs)
A=np.mean(np.sum(zs*dx,axis=1));B=np.mean(np.sum(zs*dy,axis=1));b=B/A
score=np.sum(zs*(dy-b*dx),axis=1)
se=np.sqrt(np.mean(score**2)/N)/abs(A)
print('Restricted difference GMM',b,'cluster sandwich SE',se,'true rho',rho)
print('No overidentification df, AR test or system moments supplied; see Stata xtabond lab')
