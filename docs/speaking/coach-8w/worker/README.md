# 可选 AI 音频评审代理

网页未配置时默认在本地训练，不影响录制、计时、自评或进度。代理未随 GitHub Pages 自动部署。

## 配置

1. 在自己的 Cloudflare Workers 账户创建 Worker，把本目录的 `ai-proxy.js` 作为模块入口。保留默认导出，不在公开仓库填写任何密钥。
2. 在 Worker 的 Secrets 配置 `GEMINI_API_KEY`（个人 Gemini API 密钥）、`COACH_TOKEN`（自行生成的高强度随机访问口令）。变量 `MODEL` 填账户实际可用、同时支持原生音频输入和 JSON Schema 结构化输出的 Gemini 模型 ID。先在服务商控制台核实权限、价格和格式支持。
3. 绑定 Workers Rate Limiting，名称 `RATE_LIMIT`。可使用 Wrangler 配置示例（按账户支持情况调整唯一 namespace_id）：

```toml
name = "speaking-coach-review"
main = "ai-proxy.js"
compatibility_date = "2026-11-27"

[[ratelimits]]
name = "RATE_LIMIT"
namespace_id = "1001"
simple = { limit = 6, period = 60 }
```

4. 部署后，在训练台“设置”中选 Worker，填自己的 HTTPS 端点和访问口令，勾选自动评审。只将本轮录音发送给配置的服务。口令存当前标签页的会话存储，不随 JSON 备份导出。
5. 使用一段不含私人信息的短录音测试；成功后才用于真实练习。网络、格式、权限、额度或超时失败时使用本地自评。

## 安全与限制

- 仅接受来自 `https://ericywh.github.io` 的浏览器请求，校验口令、速率限制、请求长度与格式。没有 RATE_LIMIT 绑定时拒绝请求，而非无约束开放。
- API 密钥仅在服务器 Secret；不要提交至 GitHub、放在 URL、截图或公开录音。CORS 不是身份验证；仍须妥善保管口令，定期更换，并监控账户用量和预算。
- 速率限制不是绝对消费上限。应在模型服务商侧配置适用的额度和预算；请求可能产生费用。
- 不发送完整视频。默认不发送图片；如启用可选关键帧，必须在当轮明确授权。仅凭零散画面不能给连续体态评分。
- 直连模式仅使用 Google 官方 Gemini API，密钥存当前会话，浏览器及同源脚本可能读取它；优先使用自己的可信 Worker。暂不接入任意自定义 Base URL，也不假设其他模型支持原生音频。
- 评审依赖模型和网络实际表现，不保证固定耗时、准确率或费用。客户端15秒超时会降级为本地流程；服务端已接收的请求仍可能计费。
- 不上传、公开或同步个人录像、评分、研究材料及案例记录。GitHub 只保存课程内容和程序。若录音包含他人身份或未公开研究信息，请选择本地模式。
