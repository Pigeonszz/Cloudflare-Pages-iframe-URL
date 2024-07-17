# Cloudflare Pages Iframe URL

基于 Cloudflare Pages 渲染嵌入的 iframe 内容。

## 如何使用

1. **Fork 此项目**到您自己的 GitHub 仓库。
2. **登录 Cloudflare 控制面板**并部署项目。

### 设置环境变量

在 Cloudflare Pages 设置中，配置以下环境变量：

| 名称 | 描述 | 格式 | 默认值 |
|------|------|------|--------|
| LOG_LEVEL | 日志等级 (可选) | off, fatal, error, warn, info, debug, trace | info |
| IFRAME_URL | iframe 要加载的 URL，支持多个 URL，服务名称用作站点标题 | URL1;服务名称1, URL2;服务名称2, ... | N/A |
| FAVICON_URL | 站点图标 URL | 服务名称1;Favicon_URL1, 服务名称2;Favicon_URL2, ... | N/A |
| TURNSTILE_ENABLED | Turnstile 人机验证开关 | true / false | false |
| TURNSTILE_SITE_KEY | Cloudflare Turnstile 人机验证站点密钥 | N/A | N/A |
| TURNSTILE_SECRET_KEY | Cloudflare Turnstile 人机验证密钥 | N/A | N/A |
| TURNSTILE_TIME | Turnstile 人机验证通过后的有效时间（单位：秒） | N/A | 14400 |
| M_POST_LOAD | 移动端后加载自定义 CSS/JS (试验性) | N/A | N/A |
| M_PRELOAD | 移动端预加载自定义 CSS/JS (试验性) | N/A | N/A |
| POST_LOAD | 桌面端后加载自定义 CSS/JS (试验性) | N/A | N/A |
| PRELOAD | 桌面端预加载自定义 CSS/JS (试验性) | N/A | N/A |

### 数据库配置

#### D1 数据库

- 前往**设置** -> **函数**并绑定一个 D1 数据库，变量名称为 **D1**。

### 部署

### 享受

## 注意事项

部分站点可能拒绝被嵌入进 iframe。

## 免责声明

本项目仅供学习和研究使用，不保证所有嵌入的网站都能正常工作。使用本项目时，请确保遵守相关网站的使用条款和法律法规。对于因使用本项目而导致的任何问题，本项目作者和贡献者不承担任何责任。

---

由 ChatGPT、DeepSeek 和 Cloudflare Pages 提供支持。
