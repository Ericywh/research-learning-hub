# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
rng=np.random.default_rng(20261027);n=3000
x=rng.normal(size=(n,3));B=np.column_stack([np.ones(n),x,x*x,x[:,0]*x[:,1]])
d=.5*x[:,0]+x[:,1]**2+rng.normal(size=n)
y=2*d+x[:,0]**2+.4*x[:,2]+rng.normal(size=n)
fold=np.empty(n,int);fold[rng.permutation(n)]=np.arange(n)%5
rd=np.zeros(n);ry=np.zeros(n)
for k in range(5):
    train=fold!=k;test=~train
    bd=np.linalg.lstsq(B[train],d[train],rcond=None)[0]
    by=np.linalg.lstsq(B[train],y[train],rcond=None)[0]
    rd[test]=d[test]-B[test]@bd;ry[test]=y[test]-B[test]@by
b=rd@ry/(rd@rd);psi=rd*(ry-b*rd)
se=np.sqrt(np.mean(psi**2)/n)/np.mean(rd**2)
print('Cross-fit polynomial nuisance PLR',b,'SE',se,'true theta 2')
