# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor
rng=np.random.default_rng(20261027);n=600
x=rng.normal(size=n);z=x+.1*rng.normal(size=n)
u=np.zeros(n)
for t in range(1,n):u[t]=.6*u[t-1]+rng.normal()
X=np.column_stack([np.ones(n),x,z]);y=1+2*x+u
fit=sm.OLS(y,X).fit()
print('VIF x',variance_inflation_factor(X,1))
print('Max leverage',fit.get_influence().hat_matrix_diag.max())
print('HC1',fit.get_robustcov_results(cov_type='HC1').bse)
print('HAC lag4',fit.get_robustcov_results(cov_type='HAC',maxlags=4).bse)
