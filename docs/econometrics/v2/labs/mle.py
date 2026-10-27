# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
import statsmodels.api as sm
from scipy.optimize import minimize
from scipy.special import expit
rng=np.random.default_rng(20261027);n=2500
X=np.column_stack([np.ones(n),rng.normal(size=(n,2))])
y=rng.binomial(1,expit(X@np.array([-.4,.8,-.5])))
def loss(b):return np.sum(np.logaddexp(0,X@b)-y*(X@b))
def grad(b):return X.T@(expit(X@b)-y)
def hess(b):
    p=expit(X@b);return (X.T*(p*(1-p)))@X
opt=minimize(loss,np.zeros(3),jac=grad,hess=hess,method='Newton-CG',options={'xtol':1e-10})
assert np.max(abs(grad(opt.x)))/n<1e-7
fit=sm.Logit(y,X).fit(disp=False)
assert np.allclose(opt.x,fit.params,atol=1e-6)
p=expit(X@opt.x);A=hess(opt.x)/n;s=X*(y-p)[:,None];B=s.T@s/n
V=np.linalg.solve(A,B)@np.linalg.inv(A)/n
def ame(b):
    p=expit(X@b);return np.mean(b[1]*p*(1-p))
step=1e-5;G=np.array([(ame(opt.x+np.eye(3)[j]*step)-ame(opt.x-np.eye(3)[j]*step))/(2*step) for j in range(3)])
print('MLE',opt.x,'score norm',np.linalg.norm(grad(opt.x)))
print('sandwich HC0 SE',np.sqrt(np.diag(V)))
print('AME x1 fixed-X',ame(opt.x),'Delta SE',np.sqrt(G@V@G))
