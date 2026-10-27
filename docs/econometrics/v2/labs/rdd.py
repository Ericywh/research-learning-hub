# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
import statsmodels.api as sm
rng=np.random.default_rng(20261027);n=12000
r=rng.uniform(-1,1,n);above=(r>=0).astype(int)
d=rng.binomial(1,.2+.5*above)
y=1+2*d+.6*r+.3*above*r+rng.normal(size=n)
for h in [.2,.4,.6]:
    keep=abs(r)<h;rr=r[keep];aa=above[keep]
    X=np.column_stack([np.ones(keep.sum()),aa,rr,aa*rr]);w=1-abs(rr)/h
    fy=sm.WLS(y[keep],X,weights=w).fit(cov_type='HC1')
    fd=sm.WLS(d[keep],X,weights=w).fit(cov_type='HC1')
    print('h',h,'n',keep.sum(),'outcome jump',fy.params[1],'treatment jump',fd.params[1],'fuzzy ratio',fy.params[1]/fd.params[1])
print('Local-linear point estimates; not CCT robust bias-corrected intervals or density tests')
