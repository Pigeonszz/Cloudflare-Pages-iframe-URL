Cloudflare Pages iframe URL

这是一个使用 Cloudflare Pages 部署的项目，用于显示一个包含 Turnstile 验证的 iframe。

使用 Cloudflare 的 Turnstile API 进行人机验证(可选功能),
在验证成功后加载指定的 iframe 内容。

如何使用

Fork此项目，登录 Cloudflare dashboard 部署

设置四个环境变量

1, IFRAME_URL (iframe所要加载的URL，支持多URL，;后的服务名称用作站点标题)

格式为:

        URL1;服务名称1,
        URL2;Service_Name2,

2, FAVICON_URL (站点图标, 填写URL, 目前仅测试过.svg文件, 其它的没有测试)

格式为:

        服务名称1;Favicon_URL1,
        Service_Name2;Favicon_URL2,

3, TURNSTILE_ENABLED (Turnstile 人机验证的开关 , true/false )

4, TURNSTILE_SITE_KEY (Cloudflare Turnstile 人机验证的站点密钥 )

Cloudflare dashboard —— Turnstile —— 添加站点 —— 根据需要配置 —— 创建

部署

享受

部分站点可能不接受被嵌入在iframe里

Powered by ChatGPT , DeepSeek and Cloudflare Pages
