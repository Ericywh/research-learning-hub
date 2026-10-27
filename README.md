# 研究学习中心 · Research Learning Hub

这是六门长期课程的**公开展示仓库**，所有公开课文均保留独立目录，并通过统一入口导航。

**网站首页**：https://ericywh.github.io/research-learning-hub/  
**六门课程索引**：https://ericywh.github.io/research-learning-hub/study/#courses

## 六门公开课程

| 课程 | 目录 | 说明 |
|---|---|---|
| 每日10分钟数学微课程 | `docs/math/` | 六章73节，按实际交付标记进度 |
| 计量经济学120天系统课程 | `docs/econometrics/` | 十章120节，Stata与Python |
| 统计与实证研究前沿日报 | `docs/frontier/` | 研究前沿与文献分析 |
| CSSCI实证论文复现精读库 | `docs/cssci/` | 公开书目与复现方法索引 |
| 每日经济学经典精读 | `docs/economic-classics/` | 以《国富论》重新开始的新序列 |
| PSM-DID系统精讲课程 | `docs/psm-did/` | 四章十节；现已交付第1章第1节；Stata与Python |

## 公众表达课程归档

《公众表达与脱稿演讲系统训练｜18周126课》的[六章目录](docs/speaking/legacy-18week.html)与[课程说明](docs/speaking/README.md)独立保留。真实已交付第001—025课，下一课为第026课；第026—126课仅列目录规划。旧课的课时、参考区及排版修订不计为新课，学员个人练习进度由本人在浏览器中标记。现行9周早晚双轨版仍使用原入口。

## 网站结构

- `docs/index.html`：公开学习中心首页
- `docs/study/index.html`：六门课程的卡片式分类与检索入口
- `docs/assets/hub.css`、`hub.js`：共享的学习中心样式及进度展示逻辑
- 各课程目录分别提供独立的课程主页、已交付全文、章节规划和检索功能

## 发布规则

GitHub Pages：`Settings → Pages → Deploy from a branch → main → /docs`。

课程的“已归档”状态只依据真实交付并存在于此仓库的完整网页，不得按照日历自动推测进度。私人主档案仓库 `research-learning-archive` 作为独立备份保留，不直接镜像或推送其全部 Git 历史。后续只发布经核查、明确可公开的文档；勿上传私人笔记、付费全文或受限数据。

## 仓库名称与发布目标

本公开仓库现名为 `Ericywh/research-learning-hub`，正式站点为 https://ericywh.github.io/research-learning-hub/ 。后续六门课程的公开课文均在此仓库 `main` 分支的 `docs/` 中按既有目录发布、维护对应索引和导航；保留独立私人备份仓库 `Ericywh/research-learning-archive`，不将私人笔记、受限论文或数据公开上传。项目网址更名后，旧的 `/math-microcourse/` GitHub Pages 地址不应再被当成正式发布入口。

