# 第6课｜匹配后DID估计量与模型设定

- 课程位置：第3章第1节；全课程第6/10课，2026-10-20生成。
- `index.html`：该课独立中文讲义全文、代码示例、自测题及答案。
- `lesson_6.do`：对应Stata示例，适用于教学和核对估计方法。
- `lesson_6.py`：对应Python示例；正式结果须记录依赖环境和运行日志。

**实证边界：** 中国2014年首批“宽带中国”示范城市政策及CityEdu-Eco公开城市年鉴整理数据。目前城市群、县级市、自治州政策编码映射未经过完整审计，2014年秋季名单公布导致全年工资不能视为完整暴露，前期匹配中仍存在SMD失衡；因此这里是教学复现流程，不能把匹配DID数值、示例置信区间或软件顺利运行表述成可信的因果政策结论。

数据：https://github.com/Cause-114/CityEdu-Eco/blob/main/data/panel.csv

官方2014年政策名单：https://wap.miit.gov.cn/zwgk/zcwj/wjfb/gg/art/2020/art_4dab04091bea459e9cc45e0046be3fe9.html
