Cloudflare Pages iframe URL

这是一个使用 Cloudflare Pages 部署的项目，用于显示一个包含 Turnstile 验证的 iframe。

使用 Cloudflare 的 Turnstile API 进行人机验证(可选功能),
在验证成功后加载指定的 iframe 内容。

如何使用

Fork一份此项目，登录Cloudflare dashboard —— Workers and Pages —— 创建 —— pages —— 连接到Git，选择刚刚Fork的仓库

设置三个环境变量

1, IFRAME_URL (iframe所要加载的URL，支持多URL，;后面用作站点标题)

格式为:   

        URL1;服务名称1,
        URL2;Service_Name2,

2, SITE_FAVICON (站点图标，支持URL/路径形式)

格式为:

        服务名称1;Favicon_URL1,
        Service_Name2;Favicon_URL2,

3, TURNSTILE_ENABLED (Turnstile 人机验证的开关 , true/false )

4, TURNSTILE_SITE_KEY (Cloudflare Turnstile 人机验证的站点密钥 )

#在Cloudflare dashboard —— Turnstile —— 添加站点 —— 根据需要配置 —— 创建

部署

享受

部分站点可能不接受被嵌入在iframe里

Powered by ChatGPT and Cloudflare Pages
