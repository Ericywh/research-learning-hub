# 第1章·第3节｜PSM与DID为什么可以结合？

全课程第3/10课（2026-10-13）。第一章三节已全部实际交付。

- `index.html`：完整中文零基础教学文章，讲条件平行趋势、共同支持、匹配后ATT、案例及恰好两道自测题和答案。
- `psm_did_demo.do`：Stata 17+示例，同一城市2013/2014工资变化，一对一有放回最近邻、用2013年政策前协变量Logit估计得分；变量标签和处理组标签中文。
- `psm_did_demo.py`：Python（需pandas/numpy/statsmodels/scikit-learn），同一数据和政策前特征，按概率距离最近邻匹配并计算配对工资变化差额。

数据：https://github.com/Cause-114/CityEdu-Eco/blob/main/data/panel.csv

政策公告：https://www.miit.gov.cn/zwgk/zcwj/wjfb/gg/art/2020/art_4dab04091bea459e9cc45e0046be3fe9.html

**限定**：2014年名单于10月公布、工资为全年数据；2013宽带中国国家战略及2015/2016后续试点带来预期与污染风险；首批含城市群、县级市和自治州需单独审核数据映射。两端代码尚未实际运行核验；此处仅用于估计量计算教学，不将点估计当作已识别的因果效应，不报告不可靠的匹配后标准误或显著性。