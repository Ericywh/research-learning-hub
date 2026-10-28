# 可复现运行

需要 Python 3.11+，先 `pip install -r requirements.txt`。从本目录执行：

```sh
python run.py --mode demo --out results/demo
python run.py --mode real --out results/real
```

默认500次城市标签置换，种子20261028。所有输出目录会显式记录mode。demo是已知数据生成机制的模拟教学，不是真实政策结果；real使用随课快照及公告映射。无需下载网络数据。课程兼容入口也可传相同参数，但默认执行完整公共流程，避免复制估计代码。

输出 analysis_panel.csv、audit.json、estimates.csv、event.csv/png、att_gt.csv、att_event_aggregate.csv、balance.csv、love.png、pairs_*.csv、permutations.csv及permutation.png。DR采用Logit/线性结果模型联合M估计sandwich，包含PS、结果回归、权重归一化和处理比例的估计影响；不使用评审的简化IF。城市被视为独立抽样单位。TWFE和事件研究是共同2014批次设计，排除其他处理批次；组别—时间估计使用全部三批及固定窗口内未入选对照。

Stata 17+在本目录运行 `do run.do demo` 或 `do run.do real`，先由Python生成对应的分析CSV。官方areg/teffects无需插件；交错条件DR需要另行安装 `ssc install drdid` 和 `ssc install csdid`。Stata输出单独文本日志；没有Stata环境时不能声称该部分已运行。Python置换图是参照分布，不具有自动成立的随机化推断解释。

样本固定为2010—2018工资完整且2013协变量有效的平衡面板。该选择可能产生选择性，需要在正式研究中研究缺失机制。匹配使用logit尺度0.2SD卡尺，允许有放回，保存行索引及频次；其均值不报告普通bootstrap区间。balance.csv不达诊断阈值时，不允许把匹配结果作为已完成识别的证据。IPW也不保证平衡。

数值sandwich为渐近推断，不适用于少数城市、空间依赖或极端重叠失败；事件图和组别—时间聚合区间均为点态，聚合条件于观察队列权重。没有提供同时置信带、完整Bacon数值分解或HonestDiD敏感性区间。不同目标的估计不能直接互称稳健性复现。
