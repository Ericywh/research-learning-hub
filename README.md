# 研究学习中心 · Research Learning Hub

这是八门长期课程的**公开展示仓库**，所有公开课文均保留独立目录，并通过统一入口导航。

**网站首页**：https://ericywh.github.io/research-learning-hub/  
**八门课程索引**：https://ericywh.github.io/research-learning-hub/study/#courses

## 八门公开课程

| 课程 | 目录 | 说明 |
|---|---|---|
| 每日10分钟数学微课程 | `docs/math/` | 六章73节，按实际交付标记进度 |
| 计量经济学120天系统课程 | `docs/econometrics/` | 十章120节，Stata与Python |
| 统计与实证研究前沿日报 | `docs/frontier/` | 研究前沿与文献分析 |
| CSSCI实证论文复现精读库 | `docs/cssci/` | 公开书目与复现方法索引 |
| 每日经济学经典精读 | `docs/economic-classics/` | 以《国富论》重新开始的新序列 |
| PSM-DID系统精讲课程 | `docs/psm-did/` | 四章十节已重构；TWFE、事件研究、交错DID、匹配与DR；Stata与Python |

## 公众表达课程归档

现行课程：[高校教师即兴发言与脱稿演讲·8周48单元个性化训练台](docs/speaking/coach-8w/)。默认入口：[学习中心](docs/study/#courses)。历史课程仅保留入口：[9周63天126课](docs/speaking/dual-track-2026/) · [18周126课](docs/speaking/legacy-18week.html)。各版本的个人完成记录独立保存；新版录制与自评默认在本机进行，AI评审需要本人配置并授权，不将个人录像或密钥提交到仓库。

## 网站结构

- `docs/index.html`：公开学习中心首页
- `docs/study/index.html`：八门课程的卡片式分类与检索入口
- `docs/assets/hub.css`、`hub.js`：共享的学习中心样式及进度展示逻辑
- 各课程目录分别提供独立的课程主页、已交付全文、章节规划和检索功能

## 发布规则

GitHub Pages：`Settings → Pages → Deploy from a branch → main → /docs`。

课程的“已归档”状态只依据真实交付并存在于此仓库的完整网页，不得按照日历自动推测进度。私人主档案仓库 `research-learning-archive` 作为独立备份保留，不直接镜像或推送其全部 Git 历史。后续只发布经核查、明确可公开的文档；勿上传私人笔记、付费全文或受限数据。

## 仓库名称与发布目标

本公开仓库现名为 `Ericywh/research-learning-hub`，正式站点为 https://ericywh.github.io/research-learning-hub/ 。后续八门课程的公开课文均在此仓库 `main` 分支的 `docs/` 中按既有目录发布、维护对应索引和导航；保留独立私人备份仓库 `Ericywh/research-learning-archive`，不将私人笔记、受限论文或数据公开上传。项目网址更名后，旧的 `/math-microcourse/` GitHub Pages 地址不应再被当成正式发布入口。


## DID课程复现

[课程目录](docs/psm-did/index.html) · [运行说明](docs/psm-did/analysis/README.md) · [评审修正](docs/psm-did/REVIEW_RESPONSE.md) · [验证记录](docs/psm-did/VALIDATION.md)
