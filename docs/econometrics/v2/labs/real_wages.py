"""Observed-data teaching extract, not a causal education-return estimate.
The provider warns example datasets can be altered; not publication evidence.
Network required. Save checksum and complete-case exclusions for reproducibility.
"""
from io import BytesIO
from urllib.request import Request,urlopen
from pathlib import Path
import hashlib,json
import numpy as np
import pandas as pd
import statsmodels.api as sm
URL='https://www.stata-press.com/data/r19/nlsw88.dta'
with urlopen(Request(URL,headers={'User-Agent':'Mozilla/5.0'}),timeout=60) as response:raw=response.read()
df=pd.read_stata(BytesIO(raw),convert_categoricals=False)
cols=['wage','grade','ttl_exp','tenure'];sample=df[cols].dropna()
sample=sample.loc[sample.wage>0].copy()
sample['lnwage']=np.log(sample.wage)
X=sm.add_constant(sample[['grade','ttl_exp','tenure']])
fit=sm.OLS(sample.lnwage,X).fit(cov_type='HC1')
result={'source':URL,'sha256':hashlib.sha256(raw).hexdigest(),
        'raw_n':len(df),'analysis_n':len(sample),'excluded_n':len(df)-len(sample),
        'parameters':fit.params.to_dict(),'HC1_SE':fit.bse.to_dict(),
        'interpretation':'Observed-data teaching association; not a causal education effect or representative NLS estimate.'}
print(json.dumps(result,indent=2))
out=Path(__file__).resolve().parent/'results';out.mkdir(exist_ok=True)
(out/'real-wages.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
