"""Deterministic identification/implementation checks; python -m unittest."""
import unittest
import numpy as np
import pandas as pd
from run import demo,prepare,group_time,twfe,dr,design

class Estimators(unittest.TestCase):
    def test_duplicate_rejected(self):
        d=demo(n=80)
        with self.assertRaises(ValueError):prepare(pd.concat([d,d.iloc[:1]]),'demo')

    def test_exact_effect_and_aggregation(self):
        d,_=prepare(demo(n=100),'demo')
        d['y']=.03*(d.year-2010)+np.where((d.g>0)&(d.year>=d.g),.2,0)
        gt,agg=group_time(d)
        np.testing.assert_allclose(gt.att,.2,atol=1e-10)
        np.testing.assert_allclose(agg.att,.2,atol=1e-10)
        s=d[d.g.isin([0,2014])].copy()
        s['did']=((s.g==2014)&(s.year>=2014)).astype(int)
        self.assertAlmostEqual(twfe(s,['did']).params['did'],.2,places=10)

    def test_dr_recovers_known_effect(self):
        rng=np.random.default_rng(2026)
        X=design(rng.normal(size=(3000,3)));D=rng.binomial(1,.4,size=3000)
        dy=X@np.array([.1,.2,.3,.1])+.25*D+rng.normal(scale=.2,size=3000)
        att,se=dr(dy,D,X)
        self.assertGreater(se,0)
        self.assertLess(abs(att-.25),4*se)

if __name__=='__main__':unittest.main()
