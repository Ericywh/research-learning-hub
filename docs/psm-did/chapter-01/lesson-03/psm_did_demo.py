import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
from sklearn.neighbors import NearestNeighbors

# 两期中国城市真实公开面板
url = "https://raw.githubusercontent.com/Cause-114/CityEdu-Eco/main/data/panel.csv"
df = pd.read_csv(url)
df = df.loc[df["year"].isin([2013, 2014])].copy()
assert not df.duplicated(["city_key", "year"]).any()
pilots = '''
北京 天津 上海 长沙 株洲 湘潭 石家庄 大连 本溪 延边朝鲜族自治州
哈尔滨 大庆 南京 苏州 镇江 金华 芜湖 安庆 福州 厦门 泉州
南昌 上饶 青岛 淄博 威海 临沂 郑州 洛阳 武汉 广州 深圳
中山 成都 攀枝花 阿坝藏族羌族自治州 贵阳 银川 吴忠 阿拉尔
'''.split()
# 2013协变量与2014结果按城市合并
pre = df.loc[df["year"] == 2013, ["city_key","wage","gdp","population","tertiary_pct"]]
pre = pre.rename(columns={"wage":"wage2013","gdp":"gdp2013",
                          "population":"population2013",
                          "tertiary_pct":"tertiary_pct2013"})
post = df.loc[df["year"] == 2014, ["city_key","wage"]]
post = post.rename(columns={"wage":"wage2014"})
panel = pre.merge(post, on="city_key", how="inner", validate="one_to_one")
panel["treat"] = panel["city_key"].isin(pilots).astype(int)
needed = ["wage2013","wage2014","gdp2013","population2013","tertiary_pct2013"]
panel = panel.dropna(subset=needed).copy()
panel = panel.loc[(panel[["gdp2013","population2013","wage2013"]]>0).all(axis=1)].copy()
panel["d_wage"] = panel["wage2014"] - panel["wage2013"]
panel["ln_gdp"] = np.log(panel["gdp2013"])
panel["ln_pop"] = np.log(panel["population2013"])
panel["ln_wage"] = np.log(panel["wage2013"])
# 与Stata同一Logit模型；模型本身并不解决选择偏差
model = smf.logit("treat ~ ln_gdp + ln_pop + tertiary_pct2013 + ln_wage",
                  data=panel).fit(disp=False)
panel["pscore"] = model.predict(panel)
controls = panel.loc[panel["treat"] == 0].copy()
treated = panel.loc[panel["treat"] == 1].copy()
# 仅在对照组倾向得分支持范围内保留处理组
lo, hi = controls["pscore"].min(), controls["pscore"].max()
treated = treated.loc[treated["pscore"].between(lo, hi)].copy()
assert len(treated) > 0 and len(controls) > 0, "缺少共同支持，停止匹配"
# 一对一最近邻匹配，有放回；本课不设卡尺
nn = NearestNeighbors(n_neighbors=1)
nn.fit(controls[["pscore"]])
distance, idx = nn.kneighbors(treated[["pscore"]])
matched_controls = controls.iloc[idx.ravel()].reset_index(drop=True)
matched_treated = treated.reset_index(drop=True)
pairs = pd.DataFrame({
    "试点城市": matched_treated["city_key"],
    "对照城市": matched_controls["city_key"],
    "倾向得分距离": distance.ravel(),
    "试点组工资变化": matched_treated["d_wage"],
    "对照组工资变化": matched_controls["d_wage"]
})
pairs["配对DID"] = pairs["试点组工资变化"] - pairs["对照组工资变化"]
print("教学版匹配后DID点估计（元）：", pairs["配对DID"].mean())
print("成功匹配的处理城市数：", len(pairs))
pairs.to_csv("中国城市_PSM-DID_匹配对教学数据.csv", index=False, encoding="utf-8-sig")
# 不把匹配后简单标准误或该点估计当作可靠因果结论
