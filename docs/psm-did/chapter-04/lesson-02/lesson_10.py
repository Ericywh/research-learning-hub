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

# 此脚本用于政策批次核验及样本审计，不把教学首批名单直接当正式政策变量。
if __name__ == '__main__':
    raw=load_raw()
    verified=OUT/'policy_cohorts_verified.csv'
    if not verified.exists():
        raise FileNotFoundError(
           '必须先建立经过政府公告逐条核验的policy_cohorts_verified.csv：'
           '至少包括city_key、first_year、source_url三列。禁止以猜测批次继续估计。')
    cohorts=pd.read_csv(verified)
    must={'city_key','first_year','source_url'}
    if not must.issubset(cohorts.columns):
        raise ValueError('政策映射缺失必要列：'+str(must-set(cohorts.columns)))
    if cohorts.city_key.duplicated().any():
        raise ValueError('政策城市映射出现重复城市')
    years=cohorts.first_year.dropna()
    if not years.isin([2014,2015,2016]).all():
        raise ValueError('首次批次仅接受核验的2014/2015/2016或未入选空值')
    dat=raw.loc[raw.year.between(2011,2017),['city_key','year','wage']].copy()
    dat=dat.merge(cohorts,on='city_key',how='left',validate='many_to_one',indicator=True)
    # 所有未在映射表列出的城市身份未知；必须直接停止。表内first_year空值表示已核实从未处理。
    if (dat['_merge'] != 'both').any():
        raise ValueError('政策映射未覆盖全部分析城市，请逐城核对后再继续。')
    dat = dat.drop(columns=['_merge'])
    dat['阶段']=np.select([dat.year.le(2013),dat.year.eq(2014),dat.year.ge(2015)],
                          ['政策前','2014过渡','政策后'],default='其他')
    sample=dat.groupby(['阶段','year'],dropna=False).agg(
                   城市记录数=('city_key','count'),工资有效数=('wage','count')).reset_index()
    sample.to_csv(OUT/'第10课_政策窗口样本审计.csv',index=False,encoding='utf-8-sig')
    dat.to_csv(OUT/'第10课_核验后审计长表.csv',index=False,encoding='utf-8-sig')
    print(sample.to_string(index=False))
    print('仅生成审计数据；正式ATT估计需明确处理批次、对照状态、平行趋势与标准误。')
