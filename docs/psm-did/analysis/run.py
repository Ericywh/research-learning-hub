"""Auditable teaching estimators. No network access; demo and real outputs separated."""
from pathlib import Path
import argparse, json, hashlib
import numpy as np
import pandas as pd
import statsmodels.api as sm
from scipy.special import expit
from scipy.optimize import root
from scipy.stats import chi2
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

DATA=Path(__file__).resolve().parents[1]/'data'

def demo(seed=20261028,n=240):
    rng=np.random.default_rng(seed)
    x=rng.normal(size=(n,3)); g=rng.choice([0,2014,2015,2016],n,p=[.45,.2,.2,.15])
    a=rng.normal(size=n); rows=[]
    for i in range(n):
        for t in range(2010,2019):
            effect=0 if g[i]==0 or t<g[i] else .06+.02*(t-g[i])
            y=10+a[i]+.02*(t-2010)+x[i,0]*.01*(t-2010)+effect+rng.normal(scale=.08)
            rows.append([f'demo{i:03}',t,np.exp(y),np.exp(7+x[i,0]),np.exp(2+x[i,1]),40+5*x[i,2],g[i]])
    return pd.DataFrame(rows,columns=['city_key','year','wage','gdp','population','tertiary_pct','g'])

def prepare(raw,mode):
    required=['city_key','year','wage','gdp','population','tertiary_pct']
    if not set(required)<=set(raw): raise ValueError('Missing required columns')
    if raw.duplicated(['city_key','year']).any(): raise ValueError('Duplicate city-year key')
    audit={'mode':mode,'raw_rows':len(raw),'raw_cities':raw.city_key.nunique()}
    d=raw[raw.year.between(2010,2018)].copy()
    if mode=='real':
        u=pd.read_csv(DATA/'policy_units.csv'); excluded=set(u.loc[u.mapping.eq('exclude_partial'),'city_key'])
        d=d[~d.city_key.isin(excluded)].copy()
        mapping=u[~u.mapping.eq('exclude_partial')].groupby('city_key').first_year.min()
        d['g']=d.city_key.map(mapping).fillna(0).astype(int)
        audit['partial_exposure_excluded']=sorted(excluded)
        audit['policy_units_absent_from_panel']=sorted(set(u.city_key)-set(raw.city_key))
        audit['panel_sha256']=hashlib.sha256((DATA/'panel.csv').read_bytes()).hexdigest()
    valid=d.wage.notna() & d.wage.gt(0)
    counts=d[valid].groupby('city_key').year.nunique()
    base=d[d.year.eq(2013)].set_index('city_key')
    goodbase=base.index[base[['gdp','population','tertiary_pct']].notna().all(axis=1)&base.gdp.gt(0)&base.population.gt(0)]
    keep=counts[counts.eq(9)].index.intersection(goodbase)
    d=d[d.city_key.isin(keep)].copy();d['y']=np.log(d.wage)
    if len(d)==0: raise ValueError('No complete analysis cities')
    audit.update(analysis_rows=len(d),analysis_cities=len(keep),cohorts=d.drop_duplicates('city_key').g.value_counts().to_dict())
    return d.sort_values(['city_key','year']),audit

def twfe(d,terms):
    # Exact only for the balanced panel enforced by prepare().
    cols=['y']+terms
    v=d[cols]-d.groupby('city_key')[cols].transform('mean')-d.groupby('year')[cols].transform('mean')+d[cols].mean()
    return sm.OLS(v.y,v[terms]).fit(cov_type='cluster',cov_kwds={'groups':d.city_key,'use_correction':True})

def wide(d):
    w=d.pivot(index='city_key',columns='year',values='y')
    g=d.drop_duplicates('city_key').set_index('city_key').g.reindex(w.index)
    return w,g

def group_time(d):
    w,g=wide(d); n=len(w); records=[]; influence=[]
    for cohort in sorted(set(g)-{0}):
        T=g.eq(cohort).to_numpy(); C=g.eq(0).to_numpy()
        if min(T.sum(),C.sum())<2: raise ValueError('Insufficient cohort/control cities')
        for t in range(cohort,2019):
            dy=(w[t]-w[cohort-1]).to_numpy();att=dy[T].mean()-dy[C].mean()
            # Contributions already divided by group sample size.
            inf=T*(dy-dy[T].mean())/T.sum()-C*(dy-dy[C].mean())/C.sum()
            se=np.sqrt(np.sum(inf**2)*n/(n-1))
            records.append(dict(g=int(cohort),t=t,k=t-int(cohort),att=att,se=se,n_treated=int(T.sum())))
            influence.append(inf)
    tab=pd.DataFrame(records); I=np.asarray(influence); aggregate=[]
    for k,sub in tab.groupby('k'):
        weights=sub.n_treated.to_numpy()/sub.n_treated.sum(); ids=sub.index.to_numpy()
        att=weights@sub.att.to_numpy();se=np.sqrt(np.sum((weights@I[ids])**2)*n/(n-1))
        aggregate.append(dict(k=int(k),att=att,se=se,cohorts=len(sub),n_treated=int(sub.n_treated.sum())))
    return tab,pd.DataFrame(aggregate)

def covariates(d):
    w,g=wide(d); b=d[d.year.eq(2013)].set_index('city_key').reindex(w.index)
    x=np.column_stack([np.log(b.gdp),np.log(b.population),b.tertiary_pct])
    x=(x-x.mean(axis=0))/x.std(axis=0,ddof=1)
    return w,g,x

def design(x,rich=False):
    return np.column_stack([np.ones(len(x)),x,x**2,x[:,0]*x[:,1]]) if rich else sm.add_constant(x)

def dr(dy,D,X):
    Z=X; a=X.shape[1]; ps=sm.Logit(D,X).fit(disp=False)
    if not ps.mle_retvals['converged']:raise ValueError('PS failed to converge')
    prob=ps.predict(X)
    if prob.min()<1e-5 or prob.max()>1-1e-5:raise ValueError('Extreme PS: revise target/design')
    gamma=np.linalg.lstsq(Z[D==0],dy[D==0],rcond=None)[0]
    q=(1-D)*prob/(1-prob);res=dy-Z@gamma
    tau=np.mean(D*res)/D.mean()-np.mean(q*res)/q.mean()
    # Include prevalence score: tau moment's D.mean() variation is accounted
    # by rewriting q normalization using rho, estimated in a separate moment.
    def moments(v):
        beta=v[:a];gamma=v[a:2*a];norm,rho,tau=v[-3:]
        p=expit(X@beta);q=(1-D)*np.exp(X@beta);r=dy-Z@gamma
        return np.column_stack([X*(D-p)[:,None],Z*((1-D)*r)[:,None],q-norm,D-rho,D*(r-tau)-rho*q*r/norm])
    theta=np.r_[ps.params,gamma,q.mean(),D.mean(),tau]
    sol=root(lambda v:moments(v).mean(axis=0),theta)
    if not sol.success and np.max(np.abs(sol.fun))>1e-7:raise ValueError('M equations failed')
    theta=sol.x;h=1e-5;eye=np.eye(len(theta))
    A=np.column_stack([(moments(theta+h*e).mean(0)-moments(theta-h*e).mean(0))/(2*h) for e in eye])
    if np.linalg.cond(A)>1e12:raise ValueError('Ill-conditioned M Jacobian')
    score=moments(theta);IF=-score@np.linalg.inv(A).T
    se=np.std(IF[:,-1],ddof=1)/np.sqrt(len(D))
    return float(theta[-1]),float(se)

def balance_and_dr(d,out):
    w,g,x=covariates(d); keep=g.isin([0,2014]).to_numpy();x=x[keep];D=g[keep].eq(2014).to_numpy().astype(float)
    dy=(w[2016]-w[2013]).to_numpy()[keep]; records=[]; estimates=[]
    scale=np.sqrt((x[D==1].var(0,ddof=1)+x[D==0].var(0,ddof=1))/2)
    for rich in [False,True]:
        X=design(x,rich);p=sm.Logit(D,X).fit(disp=False).predict(X)
        if p.min()<1e-5 or p.max()>1-1e-5:raise ValueError('Extreme PS')
        score=np.log(p/(1-p));T=np.where(D==1)[0];C=np.where(D==0)[0]
        pairs=[];cw=np.zeros(len(D));cal=.2*score.std(ddof=1)
        for i in T:
            j=C[np.argmin(abs(score[C]-score[i]))]
            if score[C].min()<=score[i]<=score[C].max() and abs(score[i]-score[j])<=cal:pairs.append((i,j));cw[j]+=1
        pairs=np.array(pairs,dtype=int).reshape(-1,2)
        pt=pd.DataFrame(pairs,columns=['treated_row','control_row'])
        ids=w.index.to_numpy()[keep]
        pt['treated_city']=ids[pairs[:,0]];pt['control_city']=ids[pairs[:,1]]
        pt.to_csv(out/f'pairs_{rich}.csv',index=False)
        # Gaussian kernel on logit PS; bandwidth is explicit, no balance promise.
        bandwidth=.2*score.std(ddof=1);kw=np.zeros(len(D))
        for i in T:
            z=-.5*((score[C]-score[i])/bandwidth)**2
            weights=np.exp(z-z.max());kw[C]+=weights/weights.sum()
        for method,tw,cc in [('raw',D,1-D),('ipw',D,(1-D)*p/(1-p)),('nearest',np.bincount(pairs[:,0],minlength=len(D)),cw),('kernel',D,kw)]:
            if min(tw.sum(),cc.sum())==0:continue
            smd=(np.average(x,weights=tw,axis=0)-np.average(x,weights=cc,axis=0))/scale
            vt=np.average((x-np.average(x,weights=tw,axis=0))**2,weights=tw,axis=0)
            vc=np.average((x-np.average(x,weights=cc,axis=0))**2,weights=cc,axis=0)
            for j,name in enumerate(['ln_gdp13','ln_pop13','tertiary13']):records.append(dict(model='rich' if rich else 'linear',method=method,variable=name,smd=smd[j],variance_ratio=vt[j]/vc[j],ess_control=cc.sum()**2/(cc@cc),treated_retained=int((tw>0).sum())))
        att,se=dr(dy,D,X);estimates.append(dict(estimator='DR-rich' if rich else 'DR-linear',att=att,se=se,lower=att-1.96*se,upper=att+1.96*se,target='2014 cohort vs window-unlisted, 2013-2016',n=len(D)))
    bal=pd.DataFrame(records);bal.to_csv(out/'balance.csv',index=False)
    gates=bal.groupby(['model','method']).smd.apply(lambda x:bool(x.abs().max()<=.1))
    gates.rename('all_abs_smd_le_0_1').to_csv(out/'balance_gate.csv')
    fig,ax=plt.subplots()
    for key,sub in bal.groupby(['model','method']):ax.scatter(sub.smd,sub.variable,label='/'.join(key))
    ax.axvline(.1,color='grey');ax.axvline(-.1,color='grey');ax.legend(fontsize=6);fig.tight_layout();fig.savefig(out/'love.png');plt.close(fig)
    return estimates

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--mode',choices=['demo','real'],default='demo');ap.add_argument('--out',type=Path,default=Path('results/demo'));ap.add_argument('--seed',type=int,default=20261028);ap.add_argument('--permutations',type=int,default=500);args=ap.parse_args()
    out=args.out;out.mkdir(parents=True,exist_ok=True)
    raw=demo(args.seed) if args.mode=='demo' else pd.read_csv(DATA/'panel.csv')
    d,audit=prepare(raw,args.mode);d.to_csv(out/'analysis_panel.csv',index=False)
    s=d[d.g.isin([0,2014])].copy();s['did']=(s.g.eq(2014)&s.year.ge(2014)).astype(int)
    fit=twfe(s,['did']);est=[dict(estimator='common-cohort TWFE',att=fit.params['did'],se=fit.bse['did'],lower=fit.conf_int().loc['did',0],upper=fit.conf_int().loc['did',1],target='2014 cohort vs window-unlisted, 2010-2018',n=s.city_key.nunique())]
    terms=[]
    for k in [-4,-3,-2,0,1,2,3,4]:
        name='pre'+str(-k) if k<0 else 'post'+str(k);terms.append(name);s[name]=(s.g.eq(2014)&s.year.eq(2014+k)).astype(int)
    fit=twfe(s,terms);ev=pd.DataFrame({'k':[-4,-3,-2,0,1,2,3,4],'att':fit.params,'se':fit.bse});ev.to_csv(out/'event.csv',index=False)
    beta=fit.params.iloc[:3].to_numpy();V=fit.cov_params().iloc[:3,:3].to_numpy();audit['pretrend_chi2_p']=float(chi2.sf(beta@np.linalg.solve(V,beta),3))
    fig,ax=plt.subplots();ax.errorbar(ev.k,ev.att,yerr=1.96*ev.se,fmt='o');ax.axhline(0,color='grey');ax.set(xlabel='Event time (base -1)',ylabel='Log wage effect; pointwise 95% CI');fig.tight_layout();fig.savefig(out/'event.png');plt.close(fig)
    gt,agg=group_time(d);gt.to_csv(out/'att_gt.csv',index=False);agg.to_csv(out/'att_event_aggregate.csv',index=False)
    est+=balance_and_dr(d,out);pd.DataFrame(est).to_csv(out/'estimates.csv',index=False)
    w,g=wide(s);dy=(w[2016]-w[2013]).to_numpy();D=g.eq(2014).to_numpy();obs=dy[D].mean()-dy[~D].mean();rng=np.random.default_rng(args.seed);perm=[]
    for _ in range(args.permutations):
        z=rng.permutation(D);perm.append(dy[z].mean()-dy[~z].mean())
    pd.DataFrame({'coefficient':perm}).to_csv(out/'permutations.csv',index=False)
    audit['permutation_reference_tail']=(1+sum(abs(v)>=abs(obs) for v in perm))/(len(perm)+1)
    placebo=(w[2013]-w[2011]).to_numpy();audit['time_placebo_2011_2013']=float(placebo[D].mean()-placebo[~D].mean())
    audit.update(seed=args.seed,permutations=args.permutations,interpretation='Teaching output, not validated causal evidence',python_dependencies={'numpy':np.__version__,'pandas':pd.__version__,'statsmodels':sm.__version__})
    fig,ax=plt.subplots();ax.hist(perm,bins=30);ax.axvline(obs,color='red');ax.set_title('City-label permutation reference (not randomization p-value)');fig.tight_layout();fig.savefig(out/'permutation.png');plt.close(fig)
    (out/'audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(audit,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
