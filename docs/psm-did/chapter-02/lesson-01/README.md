# 第2章·第1节｜倾向得分估计与匹配算法

正式交付：2026-10-18；全课程第4/10课。国内2014年首批“宽带中国”示范城市（城市群）政策、真实公开城市年鉴整理面板。

## 文件
- `index.html`：中文版完整讲义。依次解释倾向得分、Logit/Probit、最近邻（1:1、1:3）、0.05卡尺（概率差尺度）、有放回/无放回、共同支持与研究限制、两道自测题及答案。
- `psm_match_cn.do`：Stata官方Logit与Probit，`label variable`、`label define`和`label values`输出中文标签；一对一、一对三和卡尺教学匹配；匹配关系导出为.dta。
- `psm_match_cn.py`：Python pandas、numpy、statsmodels和scikit-learn，采用相同2013年协变量和国内城市名单，输出中文列名的CSV匹配表。

## 来源
- 2014年首批官方公告：https://wap.miit.gov.cn/zwgk/zcwj/wjfb/gg/art/2020/art_4dab04091bea459e9cc45e0046be3fe9.html
- 第三方整理中国城市公开CSV：https://github.com/Cause-114/CityEdu-Eco/blob/main/data/panel.csv
- 中文变量说明：https://github.com/Cause-114/CityEdu-Eco/blob/main/data/DATA_NOTES.md
- Austin (2011) 卡尺设定讨论：https://doi.org/10.1002/pst.433

## 方法与数据边界
本课按2013年政策前特征计算试点概率，只演示匹配，不估计政策效果。2014年首批公告含自治州、长株潭城市群、昆山、阿拉尔等不易直接与地级市年鉴样本对应的单元；教学处理组仅暂映射可明确对应的部分地级市，不得当作论文最终政策变量。需要审计城市行政层级和名单；2013年已有国家战略和可能的政策预期，2014年试点名单在10月发布，不能将2014全年结果简单当作全年政策暴露后的结果。

软件源代码经过Python静态语法编译检查，但未声称在Stata和Python两端使用真实数据完成运行与一致性验证；并列倾向得分最近邻时两软件的匹配对象可能存在差异。固定0.05卡尺基于原始概率差，不能等同于Austin建议的0.2×倾向得分logit变换值标准差。后续须做匹配平衡检验。
