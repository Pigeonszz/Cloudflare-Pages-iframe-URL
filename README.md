Cloudflare Pages iframe URL

这是一个使用 Cloudflare Pages 部署的项目，用于显示一个包含 Turnstile 验证的 iframe。

使用 Cloudflare 的 Turnstile API 进行人机验证,
在验证成功后加载指定的 iframe 内容。

如何使用

Fork一份此项目，登录Cloudflare dashboard —— Workers and Pages —— 创建 —— pages —— 连接到Git，选择刚刚Fork的仓库

设置三个变量

IFRAME_URL (iframe所要展示的URL)

TURNSTILE_ENABLED (Turnstile 验证的开关)

TURNSTILE_SITE_KEY (Cloudflare Turnstile 站点密钥)

部署

享受

powered by ChatGPT and Cloudflare Pages
