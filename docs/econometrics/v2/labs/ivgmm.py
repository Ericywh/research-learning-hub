# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
from scipy.stats import chi2
rng=np.random.default_rng(20261027);n=3000
z1,z2,c=rng.normal(size=(3,n))
x=.5+.6*z1+.4*z2+.7*c+rng.normal(scale=.5,size=n)
u=(.7*c+rng.normal(scale=.5,size=n))*(1+.5*abs(z1))
y=1+1.5*x+u
X=np.column_stack([np.ones(n),x]);Z=np.column_stack([np.ones(n),z1,z2])
D=Z.T@X/n;q=Z.T@y/n
def estimate(W):return np.linalg.solve(D.T@W@D,D.T@W@q)
W1=np.linalg.inv(Z.T@Z/n);b1=estimate(W1)
mom1=Z*(y-X@b1)[:,None];S1=mom1.T@mom1/n
W2=np.linalg.inv(S1);b2=estimate(W2)
mom2=Z*(y-X@b2)[:,None];S2=mom2.T@mom2/n
A=np.linalg.inv(D.T@W2@D)
V=A@D.T@W2@S2@W2@D@A/n
g=mom2.mean(axis=0);J=n*g@W2@g
print('2SLS',b1,'two-step GMM',b2,'robust SE',np.sqrt(np.diag(V)))
print('J',J,'df',Z.shape[1]-X.shape[1],'p',chi2.sf(J,1))
assert Z.shape[1]-X.shape[1]==1
# Independent projection formula confirms the 2SLS point estimate.
Xp=Z@np.linalg.lstsq(Z,X,rcond=None)[0]
check=np.linalg.solve(Xp.T@X,Xp.T@y)
assert np.allclose(check,b1)
