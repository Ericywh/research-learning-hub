# 摄影素材来源与使用说明

本轮课程封面使用真实摄影素材，页面直接引用摄影平台的图片 CDN，不使用 AI 生成图或人物肖像。来源页标注为 Unsplash License 或 Pexels Free / Free to use。为便于后续核验与替换，记录摄影者、原始页面和当前用途。

| 用途 | 摄影者 | 原始图片页面 | 使用位置 |
|---|---|---|---|
| 学习中心主横幅：绿色阅读灯与图书馆 | Ilya Semenov | https://unsplash.com/photos/a-green-desk-lamp-in-a-library-B8HRcng8Ibg | `study/index.html` 主横幅 |
| 激励语录：绿叶与打开的书 | Gülru Sude | https://www.pexels.com/photo/green-dried-plants-on-the-book-page-13933559/ | 首页激励语录背景 |
| 公众表达：空剧场与话筒 | Allie Reefer | https://www.pexels.com/photo/black-microphone-in-close-up-photography-9547593/ | 公众表达课程卡片与主页封面 |
| 英语表达：学术教材 | Anete Lusina | https://www.pexels.com/photo/stack-of-textbooks-on-wooden-table-5239563/ | 英语表达课程卡片与主页封面 |
| 计量经济学：电脑与数据图表 | Nataliya Vaitkevich | https://www.pexels.com/photo/a-notebook-beside-a-laptop-with-graphs-6120209/ | 计量经济学课程卡片与主页封面 |
| PSM-DID：数据图表与实证桌面 | Gustavo Fring | https://www.pexels.com/photo/charts-on-a-desk-6285258/ | PSM-DID课程卡片与主页封面 |
| 数学微课程：黑板公式 | Vitaly Gariev | https://www.pexels.com/photo/close-up-of-complicated-equations-written-on-a-blackboard-22690750/ | 数学课程卡片与主页封面 |
| 研究前沿：图书馆与开放书籍 | Sami Türk | https://www.pexels.com/photo/cozy-library-interior-with-open-books-on-table-34084875/ | 研究前沿课程卡片与主页封面 |
| CSSCI论文精读：笔记本与文具 | Katerina Holmes | https://www.pexels.com/photo/opened-copybook-on-desk-with-stationery-5905439/ | CSSCI课程卡片与主页封面 |
| 经济学经典：皮革装帧旧书 | Antonio Mena | https://www.pexels.com/photo/vintage-leather-bound-books-on-wooden-desk-33352856/ | 经济学经典课程卡片与主页封面 |

## 技术说明

- 页面图片由 Unsplash / Pexels 原始 CDN 提供，仓库保存的是页面引用、样式和来源记录，不是摄影图片的二进制副本。
- 课程中心首页和对应课程主页共用同一张课程主题照片；不同课程之间不重复使用照片。
- 图片使用 `cover` 裁切，保留各页面原有目录、学习进度、按钮和交互脚本。
- 如果将来要将图片迁移到仓库本地，应先按平台许可与署名要求下载原图，再统一压缩为 WebP 并更新路径。
