import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
from sklearn.neighbors import NearestNeighbors

# 真实中国公开城市年鉴整理数据；仅用2013年政策前特征
url = "https://raw.githubusercontent.com/Cause-114/CityEdu-Eco/main/data/panel.csv"
df = pd.read_csv(url)
df = df.loc[df["year"] == 2013].copy()
assert not df["city_key"].duplicated().any()
# 与Stata一致的地级市教学映射；自治州及县级口径待审核
pilots = """北京 天津 上海 长沙 株洲 湘潭 石家庄 大连 本溪
哈尔滨 大庆 南京 苏州 镇江 金华 芜湖 安庆 福州 厦门 泉州
南昌 上饶 青岛 淄博 威海 临沂 郑州 洛阳 武汉 广州
深圳 中山 成都 攀枝花 贵阳 银川 吴忠""".split()
df["treat"] = df["city_key"].isin(pilots).astype(int)
cols = ["gdp", "population", "tertiary_pct", "wage"]
df = df.dropna(subset=cols).copy()
df = df.loc[(df[["gdp", "population", "wage"]] > 0).all(axis=1)].copy()
df["ln_gdp"] = np.log(df["gdp"])
df["ln_pop"] = np.log(df["population"])
df["ln_wage"] = np.log(df["wage"])
formula = "treat ~ ln_gdp + ln_pop + tertiary_pct + ln_wage"
# Logit和Probit都产生0到1之间的预测概率
logit = smf.logit(formula, data=df).fit(disp=False)
probit = smf.probit(formula, data=df).fit(disp=False)
df["p_logit"] = logit.predict(df)
df["p_probit"] = probit.predict(df)
print(df.groupby("treat")[["p_logit", "p_probit"]].agg(["count", "mean", "min", "max"]))
# 使用Logit分数；只保留共同支持范围内的处理组城市
ctrl = df.loc[df["treat"] == 0].copy().reset_index(drop=True)
trt = df.loc[df["treat"] == 1].copy().reset_index(drop=True)
assert not ctrl.empty and not trt.empty, "处理组或候选对照组为空"
lo, hi = ctrl["p_logit"].min(), ctrl["p_logit"].max()
trt = trt.loc[trt["p_logit"].between(lo, hi)].copy().reset_index(drop=True)
assert not trt.empty, "共同支持区间内没有处理组城市"
# 一对三最近邻、有放回；第一个最近邻用于一对一和卡尺匹配
assert len(ctrl) >= 3, "对照城市少于3个，不能做一对三"
nn = NearestNeighbors(n_neighbors=3, metric="euclidean")
nn.fit(ctrl[["p_logit"]])
dist, loc = nn.kneighbors(trt[["p_logit"]])

def make_pairs(k: int, caliper: float | None = None) -> pd.DataFrame:
    rows = []
    for i in range(len(trt)):
        for rank in range(k):
            distance = float(dist[i, rank])
            if caliper is not None and distance > caliper:
                continue
            j = int(loc[i, rank])
            rows.append({"试点城市": trt.loc[i, "city_key"],
                         "对照城市": ctrl.loc[j, "city_key"],
                         "试点倾向得分": float(trt.loc[i, "p_logit"]),
                         "对照倾向得分": float(ctrl.loc[j, "p_logit"]),
                         "倾向得分距离": distance,
                         "匹配顺位": rank + 1})
    return pd.DataFrame(rows, columns=["试点城市", "对照城市",
           "试点倾向得分", "对照倾向得分", "倾向得分距离", "匹配顺位"])

pairs_1 = make_pairs(1)              # 最近邻，一对一，有放回
pairs_cal = make_pairs(1, 0.05)       # 一对一卡尺匹配（概率尺度）
pairs_3 = make_pairs(3)              # 一对三最近邻，有放回
for title, frame, path in [
    ("一对一最近邻", pairs_1, "中国城市_一对一最近邻匹配.csv"),
    ("卡尺0.05", pairs_cal, "中国城市_卡尺005匹配.csv"),
    ("一对三最近邻", pairs_3, "中国城市_一对三最近邻匹配.csv"),
]:
    print(title, "成功匹配的试点城市数：", frame["试点城市"].nunique())
    frame.to_csv(path, index=False, encoding="utf-8-sig")
# 输出匹配关系，不估计DID/ATT；下节检查协变量平衡。