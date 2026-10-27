# Teaching experiment, synthetic data unless explicitly stated. Seed 20261027.
import numpy as np
import csv
from pathlib import Path
rng=np.random.default_rng(20261027)
R=1000; rows=[]; hist=[]
for n in [30,200,2000]:
    bs=[]; ts=[]
    for r in range(R):
        x=rng.uniform(0,4,n)
        u=x*(rng.exponential(size=n)-1) # E[u|x]=0; heteroskedastic, skewed
        y=1+2*x+u
        xc=x-x.mean(); den=xc@xc
        b=xc@y/den; e=y-(y.mean()-b*x.mean())-b*x
        se=np.sqrt(n/(n-2)*np.sum(xc**2*e**2))/den
        bs.append(b);ts.append((b-2)/se)
    bs=np.array(bs);ts=np.array(ts)
    cover=np.mean(np.abs(ts)<=1.96)
    row=dict(n=n,bias=float(bs.mean()-2),sd=float(bs.std(ddof=1)),
             rmse=float(np.sqrt(np.mean((bs-2)**2))),coverage=float(cover),
             mcse=float(np.sqrt(cover*(1-cover)/R)))
    rows.append(row);print(row)
    counts,edges=np.histogram(ts,bins=np.linspace(-4,4,33))
    hist.append((n,counts))
out=Path(__file__).resolve().parent/'results';out.mkdir(exist_ok=True)
with (out/'asymptotics.csv').open('w',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
# Actual Monte Carlo histograms; no hand-drawn density presented as results.
svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 330" role="img" aria-label="Monte Carlo studentized statistics">','<rect width="960" height="330" fill="#f8fafb"/>']
for panel,(n,counts) in enumerate(hist):
    for j,c in enumerate(counts):
        h=220*c/max(counts)
        svg.append(f'<rect x="{panel*320+15+j*9}" y="{270-h}" width="8" height="{h}" fill="#247c80"/>')
    svg.append(f'<text x="{panel*320+18}" y="30">n={n}, R={R}</text><text x="{panel*320+18}" y="302">t scale: -4 to 4</text>')
svg.append('</svg>');(out/'clt.svg').write_text(''.join(svg),encoding='utf-8')
