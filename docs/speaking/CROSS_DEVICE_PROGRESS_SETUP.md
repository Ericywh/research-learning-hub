# 课程“已完成”跨设备同步：一次性配置

网站采用 GitHub Pages 静态托管。原有阅读完成标记存储于浏览器 localStorage，设备之间本身不互通。

## 立即可用：手动迁移

进入新版课程目录，打开“跨设备阅读进度”。在已标记的手机上选择“复制进度码”，将文本安全发送给自己；在电脑/其他浏览器打开相同面板，粘贴进度码、点击“导入并合并”。手动导入只增加已完成标记，不会清除目标设备现有标记，不能自动同步取消标记。

## 自动同步：一次性配置 Supabase

1. 在 [Supabase](https://supabase.com/dashboard) 创建一个项目。此步骤必须由项目拥有者授权完成。
2. 在 SQL Editor 执行本目录的 `progress-sync.sql`，确认 public.speaking_read_status 启用了 RLS，权限仅允许登录用户访问自己的记录。
3. Authentication → Providers → Email 启用邮箱登录；Authentication → Email Templates → Magic Link：将模板修改成包含 `{{ .Token }}` 的六位数字验证码邮件（而非默认魔法链接）。例如邮件正文：`Your login code: {{ .Token }}`。配置邮件发送方；正式高频使用时建议自有 SMTP。
4. 在 Supabase 项目的 API/Connect 页面复制 **Project URL** 和 **publishable key**（旧版 anon key 也可，但推荐 publishable key）。它们不是私密服务端密钥。严禁使用 secret/service_role key。
5. 可将这两项填入 `progress-sync-config.js` 并提交到 GitHub Pages，让全部设备直接看到相同的云端服务；也可以只在网站的“跨设备阅读进度 → 配置云端服务”中填入，设备各配置一次。
6. 在手机和电脑上打开同一课程网址，分别输入**相同邮箱**，获取六位验证码并登录。首次登录会保留已有本地“已完成”标记；未在云端出现过的标记会合并上传。之后点击“标记本课已完成／撤销”会自动同步，刷新、打开其他设备或间隔约30秒会拉取最新状态。

## 数据安全与边界

- 云端仅保存用户 ID、课程 ID、完成状态、修改时间。**不上传录音、自评成绩或正文。**
- 新版早课 (`am:day-XX`)、晚课 (`pm:day-XX`) 和旧版 (`legacy:XX-XX`) 互不串课。
- 离线或云端故障时，本机照常可标记，待恢复网络后尝试提交。
- 反复修改同一课程时以较新的修改为准；离线设备时钟错误可能造成冲突，重新打开以云端结果核对。
- 使用同一浏览器切换不同邮箱账号时，务必先备份重要离线标记；不要在多人共用设备上留存登录会话。
- 没有配置 Supabase 时，页面必须继续明确显示“仅本地保存”；手动导入/导出可以使用，但**绝不是自动同步**。
- 该方案不是 GitHub 或 ChatGPT 登录；相同邮箱验证码身份由 Supabase 提供。

官方参考：
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/database/postgres/row-level-security
