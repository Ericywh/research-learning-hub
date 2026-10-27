# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
from scipy.optimize import minimize
rng=np.random.default_rng(20261027);T0=20;T=35;J=8
f=rng.normal(size=(T,3)).cumsum(axis=0)
donors=f@rng.normal(size=(3,J))+rng.normal(scale=.05,size=(T,J))
truew=np.array([.2,.5,.3,0,0,0,0,0]);treated=donors@truew+rng.normal(scale=.03,size=T)
treated[T0:]+=2
def fit(target,pool):
    A=pool[:T0];b=target[:T0];j=A.shape[1]
    opt=minimize(lambda w:np.mean((b-A@w)**2),np.ones(j)/j,
        bounds=[(0,1)]*j,constraints={'type':'eq','fun':lambda w:w.sum()-1},method='SLSQP',options={'ftol':1e-12,'maxiter':3000})
    assert opt.success
    assert abs(opt.x.sum()-1)<1e-6 and opt.x.min()>-1e-8
    gap=target-pool@opt.x
    ratio=np.sqrt(np.mean(gap[T0:]**2))/max(np.sqrt(np.mean(gap[:T0]**2)),1e-10)
    return opt.x,gap,ratio
w,gap,ratio=fit(treated,donors)
placebos=[fit(donors[:,j],np.delete(donors,j,axis=1))[2] for j in range(J)]
print('convex weights',w,'post mean gap',gap[T0:].mean(),'RMSPE ratio',ratio)
print('spatial placebo ratios',placebos,'rank fraction',(1+sum(p>=ratio for p in placebos))/(J+1))
print('Synthetic factor data; rank fraction is not a universally exact p-value')
