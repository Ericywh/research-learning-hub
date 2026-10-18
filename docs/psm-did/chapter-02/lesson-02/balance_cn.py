"""PSM-DID第5课：2013中国城市数据匹配质量与平衡性（教学用途）。
数据源：https://github.com/Cause-114/CityEdu-Eco/blob/main/data/panel.csv
仅用政策前协变量；不计算或声称政策因果效应。
安装：pip install numpy pandas statsmodels scikit-learn matplotlib
"""
from pathlib import Path
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
from sklearn.neighbors import NearestNeighbors
import matplotlib.pyplot as plt

URL = 'https://raw.githubusercontent.com/Cause-114/CityEdu-Eco/main/data/panel.csv'
OUT = Path(__file__).resolve().parent
PILOTS = '''北京 天津 上海 长沙 株洲 湘潭 石家庄 大连 本溪 哈尔滨 大庆 南京 苏州 镇江
金华 芜湖 安庆 福州 厦门 泉州 南昌 上饶 青岛 淄博 威海 临沂 郑州 洛阳 武汉
广州 深圳 中山 成都 攀枝花 贵阳 银川 吴忠'''.split()
FEATURES = ['ln_gdp', 'ln_pop', 'tertiary_pct', 'ln_wage']
ZH = {'ln_gdp':'2013年GDP自然对数', 'ln_pop':'2013年人口自然对数',
      'tertiary_pct':'2013年第三产业比重', 'ln_wage':'2013年工资自然对数'}
CALIPER = 0.05  # 原始概率差的教学卡尺，非0.2×logit(PS)标准差

# 1. 仅选取2013年政策前资料
try:
    df = pd.read_csv(URL)
except Exception as err:
    raise RuntimeError('无法下载CSV；请先到原仓库下载panel.csv，并把URL改为本地路径。') from err
df = df.loc[df['year'].eq(2013)].copy()
assert not df.city_key.duplicated().any(), '城市-年键不唯一'
df['treat'] = df.city_key.isin(PILOTS).astype(int)
cols = ['gdp','population','tertiary_pct','wage']
df = df.dropna(subset=cols).copy()
df = df.loc[(df[['gdp','population','wage']] > 0).all(axis=1)].copy()
df['ln_gdp'] = np.log(df.gdp)
df['ln_pop'] = np.log(df.population)
df['ln_wage'] = np.log(df.wage)

# 2. 与第4课保持一致的Logit模型
model = smf.logit('treat ~ ln_gdp + ln_pop + tertiary_pct + ln_wage', data=df).fit(disp=False)
df['pscore'] = model.predict(df)
control_pool = df.loc[df.treat.eq(0)].copy().reset_index(drop=True)
trt_all = df.loc[df.treat.eq(1)].copy().reset_index(drop=True)
assert len(control_pool)>1 and len(trt_all)>1, '没有足够的两组城市'
lo, hi = control_pool.pscore.min(), control_pool.pscore.max()
trt_support = trt_all.loc[trt_all.pscore.between(lo,hi)].copy().reset_index(drop=True)
assert len(trt_support)>1, '共同支持范围内不足2个处理城市'

# 3. 一对一最近邻、有放回；再执行原始概率卡尺0.05
nn = NearestNeighbors(n_neighbors=1,metric='euclidean').fit(control_pool[['pscore']])
distance,idx = nn.kneighbors(trt_support[['pscore']])
mask = distance[:,0] <= CALIPER
trt = trt_support.loc[mask].copy().reset_index(drop=True)
ctrl = control_pool.iloc[idx[:,0][mask]].copy().reset_index(drop=True)
assert len(trt)>1, '卡尺后不足2个有效匹配城市'
pairs = pd.DataFrame({'试点城市':trt.city_key, '对照城市':ctrl.city_key,
                      '试点倾向得分':trt.pscore, '对照倾向得分':ctrl.pscore,
                      '匹配距离':distance[:,0][mask]})
pairs.to_csv(OUT/'中国城市_一对一匹配结果_第5课.csv',index=False,encoding='utf-8-sig')

# 4. 使用固定的“匹配处理组 + 匹配前所有候选对照”的合并标准差为分母
# 由于对照城市可被重复匹配，ctrl中的重复行要保留，其出现次数就是匹配权重。
results=[]
for var in FEATURES:
    tx=trt[var].to_numpy()
    cx_before=control_pool[var].to_numpy()
    cx_after=ctrl[var].to_numpy()
    pooled=np.sqrt((np.var(tx,ddof=1)+np.var(cx_before,ddof=1))/2)
    smd_before=(tx.mean()-cx_before.mean())/pooled
    smd_after=(tx.mean()-cx_after.mean())/pooled
    ratio=np.var(tx,ddof=1)/np.var(cx_after,ddof=1)
    results.append({'协变量':ZH[var], '变量名':var,
                    '匹配前SMD':smd_before,'匹配后SMD':smd_after,
                    '匹配前绝对SMD':abs(smd_before),'匹配后绝对SMD':abs(smd_after),
                    '匹配后方差比':ratio})
balance=pd.DataFrame(results)
balance.to_csv(OUT/'中国城市_协变量平衡诊断_第5课.csv',index=False,encoding='utf-8-sig')

# 5. Love plot：不因匹配程序成功就自动声称协变量合格
fig,ax=plt.subplots(figsize=(8.1,4.4))
y=np.arange(len(balance))
ax.scatter(balance['匹配前绝对SMD'],y,label='Before matching',marker='o',s=52)
ax.scatter(balance['匹配后绝对SMD'],y,label='After matching',marker='D',s=48)
ax.axvline(0.1,linestyle='--',linewidth=1.1,label='Reference |SMD| = 0.1')
ax.set_yticks(y,labels=FEATURES)
ax.invert_yaxis()
ax.set_xlabel('Absolute standardized mean difference')
ax.set_title('Covariate balance: 2013 Chinese city sample (illustrative policy mapping)')
ax.grid(alpha=.18,axis='x')
ax.legend(fontsize=8)
fig.tight_layout()
fig.savefig(OUT/'love_plot_balance.png',dpi=170)
plt.close(fig)
print('2013年协变量完整城市数：',len(df))
print('匹配前试点数：',len(trt_all),'对照数：',len(control_pool))
print('共同支持后试点数：',len(trt_support))
print('卡尺成功匹配试点数：',len(trt))
print(balance.to_string(index=False, float_format=lambda x:f'{x:.4f}'))
print('提示：试点城市与年鉴城市口径为初步教学映射。匹配不等于因果识别。')