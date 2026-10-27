# 计量经济学：36模块核心讲义v1

入口 index.html，完整映射 mapping.json / mapping.html，修订审查 review.html。
36个旧课正文实质修订，84个保留原稿；不是120课全部独立重写。
archive-manifest.json记录原120课的SHA-256，archive/2026-10-27保留原始HTML。

## 运行
Python 3.13：`python -m pip install -r requirements.txt`，再运行labs/*.py。
相同脚本、版本和seed可复现；Stata和Python相同seed不产生同一随机序列。
所有模拟使用seed 20261027；real_wages.py读取公开观察数据，需要网络。
Stata 17+：运行labs/*.do。Stata脚本未经实际执行，不能把Python通过视为Stata通过。
validation.json记录实际Python运行输出及限制。

高级实验标明简化范围：简化ATT(g,t)不是完整CS-DID；局部WLS不是CCT区间；
受限差分矩不是系统GMM。毕业论文复现是作业，尚无已完成论文结果。
