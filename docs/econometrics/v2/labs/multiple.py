# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
from statsmodels.stats.multitest import multipletests
p=np.array([.01,.04,.2])
reject,adjusted,_,_=multipletests(p,alpha=.05,method='fdr_bh')
assert reject.tolist()==[True,False,False]
print('BH reject',reject,'adjusted p',adjusted)
print('Assume independent or suitable positive dependence; not posterior false probabilities')
