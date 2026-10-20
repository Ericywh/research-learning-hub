# -*- coding: utf-8 -*-
'''中国城市公开面板：PSM-DID教学流水线。不将教学估计解释为因果效应。'''
import json
from pathlib import Path
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
from sklearn.neighbors import NearestNeighbors

DATA_URL = 'https://raw.githubusercontent.com/Cause-114/CityEdu-Eco/main/data/panel.csv'
PILOTS = '''北京 天津 上海 长沙 株洲 湘潭 石家庄 大连 本溪 哈尔滨 大庆
南京 苏州 镇江 金华 芜湖 安庆 福州 厦门 泉州 南昌 上饶 青岛
淄博 威海 临沂 郑州 洛阳 武汉 广州 深圳 中山 成都 攀枝花
贵阳 银川 吴忠'''.split()
COLS = ['ln_gdp','ln_pop','tertiary_pct2013','ln_wage']
OUT = Path(__file__).resolve().parent


def load_raw():
    local = OUT / 'panel.csv'
    if local.exists():
        data = pd.read_csv(local)
    else:
        try:
            data = pd.read_csv(DATA_URL)
        except Exception as exc:
            raise RuntimeError('请从数据原仓库下载panel.csv并放入程序目录。') from exc
    assert not data.duplicated(['city_key','year']).any(), '城市—年份重复，请检查数据'
    return data


def prepare_and_match(caliper=0.05):
    raw = load_raw()
    pre = raw.loc[raw.year.eq(2013), ['city_key','wage','gdp','population','tertiary_pct']].copy()
    pre = pre.rename(columns={'wage':'wage2013','gdp':'gdp2013',
                              'population':'population2013','tertiary_pct':'tertiary_pct2013'})
    post = raw.loc[raw.year.eq(2014), ['city_key','wage']].rename(columns={'wage':'wage2014'})
    panel = pre.merge(post,on='city_key',validate='one_to_one',how='inner')
    panel['treat'] = panel.city_key.isin(PILOTS).astype(int)
    panel = panel.dropna(subset=['wage2013','wage2014','gdp2013','population2013',
                                 'tertiary_pct2013']).copy()
    panel = panel.loc[(panel[['gdp2013','population2013','wage2013']]>0).all(axis=1)].copy()
    panel['ln_gdp'] = np.log(panel.gdp2013)
    panel['ln_pop'] = np.log(panel.population2013)
    panel['ln_wage'] = np.log(panel.wage2013)
    panel['d_wage'] = panel.wage2014-panel.wage2013
    model = smf.logit('treat ~ ln_gdp + ln_pop + tertiary_pct2013 + ln_wage',
                      data=panel).fit(disp=False)
    panel['pscore'] = model.predict(panel)
    control_pool = panel.loc[panel.treat.eq(0)].sort_values('city_key').reset_index(drop=True)
    treated_all = panel.loc[panel.treat.eq(1)].sort_values('city_key').reset_index(drop=True)
    assert len(control_pool)>1 and len(treated_all)>1, '处理组或对照组数量不足'
    lo,hi = control_pool.pscore.min(),control_pool.pscore.max()
    treated_support = treated_all.loc[treated_all.pscore.between(lo,hi)].copy().reset_index(drop=True)
    if treated_support.empty:
        raise ValueError('无符合共同支持的试点城市')
    nn = NearestNeighbors(n_neighbors=1).fit(control_pool[['pscore']])
    dist, loc = nn.kneighbors(treated_support[['pscore']])
    ok = dist[:,0] <= caliper
    trt = treated_support.loc[ok].copy().reset_index(drop=True)
    ctrl = control_pool.iloc[loc[:,0][ok]].copy().reset_index(drop=True)
    if trt.empty:
        raise ValueError('卡尺后没有成功匹配的试点城市')
    pairs = pd.DataFrame({
        '试点城市':trt.city_key,'对照城市':ctrl.city_key,
        '试点概率':trt.pscore,'对照概率':ctrl.pscore,
        '匹配距离':dist[:,0][ok],
        '试点工资2013':trt.wage2013,'试点工资2014':trt.wage2014,
        '对照工资2013':ctrl.wage2013,'对照工资2014':ctrl.wage2014,
        '配对DID':trt.d_wage-ctrl.d_wage
    })
    def smd(x_t,x_c_before,x_c_after):
        scale=np.sqrt((x_t.var(ddof=1)+x_c_before.var(ddof=1))/2)
        return (x_t.mean()-x_c_before.mean())/scale,(x_t.mean()-x_c_after.mean())/scale
    bal=[]
    for x in COLS:
        before,after=smd(trt[x],control_pool[x],ctrl[x])
        bal.append({'变量':x,'匹配前SMD':before,'匹配后SMD':after,
                    '匹配后绝对SMD':abs(after)})
    balance=pd.DataFrame(bal)
    n={
      '2013_2014完整城市':len(panel),'初步试点数':len(treated_all),
      '候选对照数':len(control_pool),'共同支持内试点数':len(treated_support),
      '成功匹配试点数':len(trt),'对照城市去重数':ctrl.city_key.nunique(),
      '卡尺概率差':caliper}
    return raw,panel,trt,ctrl,pairs,balance,n


def save_audit(prefix, pairs, balance, n, out=OUT):
    pairs.to_csv(out/f'{prefix}_匹配对.csv',index=False,encoding='utf-8-sig')
    balance.to_csv(out/f'{prefix}_平衡诊断.csv',index=False,encoding='utf-8-sig')
    with (out/f'{prefix}_样本流转.json').open('w',encoding='utf-8') as f:
        json.dump(n,f,ensure_ascii=False,indent=2)
    print('匹配样本数:',n['成功匹配试点数'])
    print('匹配后四项绝对SMD:',balance['匹配后绝对SMD'].round(3).tolist())
    print('教学版配对DID平均（元）:',pairs['配对DID'].mean())
    print('提醒：匹配与代码复现不等于可信的政策因果识别。')

if __name__ == '__main__':
    raw,panel,trt,ctrl,pairs,balance,n=prepare_and_match(0.05)
    save_audit('第6课',pairs,balance,n)
    print('ATT的点估计是匹配对变化差的均值，不附未经证成的标准误。')
