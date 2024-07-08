Cloudflare Pages iframe URL

这是一个使用 Cloudflare Pages 部署的项目，用于显示一个包含 Turnstile 验证的 iframe。

使用 Cloudflare 的 Turnstile API 进行人机验证(可选功能),
在验证成功后加载指定的 iframe 内容。

如何使用

Fork一份此项目，登录Cloudflare dashboard —— Workers and Pages —— 创建 —— pages —— 连接到Git，选择刚刚Fork的仓库

设置四个环境变量

1, IFRAME_URL (iframe所要加载的URL，支持多URL，)

格式为:   

        URL1;名称1,
        URL2;Name2,

示例:   

        https://example.com;example,
        https://default.com;default,

2, TURNSTILE_ENABLED (Turnstile 人机验证的开关 , true/false )

3, TURNSTILE_SITE_KEY (Cloudflare Turnstile 人机验证的站点密钥 )

#在Cloudflare dashboard —— Turnstile —— 添加站点 —— 根据需要配置 —— 创建

4, SITE_TITLE (站点标题，默认会从iframe中获取，获取不到时回退到此变量)

部署

享受

部分站点可能不接受被嵌入在iframe里

Powered by ChatGPT and Cloudflare Pages
