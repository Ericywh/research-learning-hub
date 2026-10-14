# 计量经济学120课｜一次授权后自动发布

## 工作方式
ChatGPT在普通聊天中授课 → 私人Notion分章子页面归档 → GitHub Actions从专用课程目录只读拉取新课 → 在构建目录 _site/econometrics/lessons/ 生成HTML → 自动更新课程索引 → Pages部署与公网HTTPS核验。

不要求ChatGPT每天成功向GitHub提交HTML，不会覆盖仓库已存的前7课。

## 仅一次的授权配置
1. 打开 https://www.notion.so/my-integrations ，新建内部集成，例如“Econometrics Pages Read Only”；仅开启 Read content 读取能力。复制Internal Integration Secret，不要发送到聊天。
2. 在Notion中打开《计量经济学120天系统课程》根页面，通过右上角 ··· → Connections / 添加连接，将该内部集成连接到**此课程根页面**，不要授权整个私人学习工作区。根页面下应包含正式的十章目录及授课子页面。
3. 打开 https://github.com/Ericywh/research-learning-hub/settings/secrets/actions ，新建Repository secret；Name必须为 ECON_NOTION_READ_TOKEN，Value填写上述Notion集成密钥。密钥存入GitHub加密Secrets，不能写入代码或聊天。
4. 打开 https://github.com/Ericywh/research-learning-hub/settings/pages ，确认 Build and deployment → Source 为 GitHub Actions。
5. 在 https://github.com/Ericywh/research-learning-hub/actions/workflows/pages.yml 选择 Run workflow 做一次首次授权验证。之后该工作流在main提交时触发，也安排了每4小时一次的兜底计划；定时运行可能延迟。

## 各文件职责
- scripts/sync-econometrics-notion.cjs：只读取指定课程根目录内与既定120课章节、节次及标题完全对应的课程页面，验证七模块、日期、双软件代码和参考答案，仅在GitHub构建产物生成公开HTML。不访问或公开其他课程的页面，也不复制私人附件。
- scripts/build-econometrics-public.cjs：从已有仓库课程和新生成课程HTML建立完整公开目录，保持10章120节的原大纲。
- .github/workflows/pages.yml：部署网站后，通过构建时实际生成的最新课次核验公网首页、目录和正文。

若没有配置 ECON_NOTION_READ_TOKEN，新导入步骤安全跳过，旧网站仍可从仓库内容正常构建。不能用其他名称的Secret替代。

Notion原课程保持私人访问；**通过校验的完整授课讲义会发布为公开网页**，因此只应把允许公开的课程正文放在专用目录，绝不混入未授权PDF、个人研究笔记或其他私人材料。

失败排查：Notion HTTP 401意味着密钥无效；403/404通常提示课程根目录授权不足；课程校验未通过时修复Notion原文；Pages失败则查看Actions的build、deploy、verify-public-econometrics三个状态。没有平台能保证永远零故障，但此架构排除了每天通过ChatGPT插件上传HTML这一单点依赖。
