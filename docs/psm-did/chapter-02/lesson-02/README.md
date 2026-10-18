# 第2章·第2节｜匹配质量与协变量平衡性检验

课程正式交付：2026-10-18（全课程5/10课；第2章结束）。

- `index.html`：完整中文课程与平衡性图、真实公开CSV初步匹配诊断数据、手算案例、两道练习和答案、可展开双软件完整源码。
- `balance_cn.do`：Stata 17+使用中文变量与处理组类别标签，处理2013年政策前协变量、一对一有放回最近邻匹配、0.05原始概率卡尺；计算固定分母SMD和匹配后方差比，保存中文标签的.dta。
- `balance_cn.py`：Python pandas/statsmodels/scikit-learn/matplotlib，同一教学政策样本和匹配规则，导出中文CSV与Love plot。
- `lesson05.md`：完整中文讲义原文。

数据：[CityEdu-Eco城市统计年鉴整理CSV](https://github.com/Cause-114/CityEdu-Eco/blob/main/data/panel.csv)。政策：[2014年首批“宽带中国”示范城市公告](https://wap.miit.gov.cn/zwgk/zcwj/wjfb/gg/art/2020/art_4dab04091bea459e9cc45e0046be3fe9.html)。平衡诊断文献：Austin (2009), https://doi.org/10.1002/sim.3697 。

## 方法与审计说明
2013年完整样本289城市，初步地级市映射试点37、候选对照252；共同支持及0.05卡尺后匹配试点31。匹配后四项绝对SMD为0.1199、0.2985、0.2645、0.1225，未全部达到0.1的经验参考值。上述数字由连接的公开CSV初步核算，尚未与Stata/Python两个软件的实跑结果交叉核验；政策名单涉及城市群、自治州、县级城市等口径问题。不得把匹配诊断当作因果政策估计或完整研究结论。
