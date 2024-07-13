# Cloudflare Pages Iframe URL

基于 Cloudflare Pages 渲染嵌入的 iframe 内容

## 如何使用

1. **Fork 此项目**到您自己的 GitHub 仓库。
2. **登录 Cloudflare 控制面板**并部署项目。

### 设置环境变量

在 Cloudflare Pages 设置中，配置以下环境变量：

```
|—— 基本配置
|    |—— IFRAME_URL
|    |    |—— 描述: iframe 要加载的 URL，支持多个 URL，服务名称用作站点标题。
|    |    |—— 格式:
|    |    |    ```
|    |    |    URL1;服务名称1,
|    |    |    URL2;Service_Name2,
|    |    |    ```
|    |    |
|    |    |—— FAVICON_URL
|    |    |    |—— 描述: 站点图标，填写 URL。
|    |    |    |—— 格式:
|    |    |    |    ```
|    |    |    |    服务名称1;Favicon_URL1,
|    |    |    |    Service_Name2;Favicon_URL2,
|    |    |    |    ```
|—— 人机验证
|    |—— TURNSTILE_ENABLED
|    |    |—— 描述: Turnstile 人机验证的开关，true / false。
|    |    |—— 默认值: `false`
|    |    |
|    |    |—— TURNSTILE_SITE_KEY
|    |    |    |—— 描述: Cloudflare Turnstile 人机验证的站点密钥。
|    |    |
|    |    |—— TURNSTILE_SECRET_KEY
|    |    |    |—— 描述: Cloudflare Turnstile 人机验证的密钥。
|    |    |
|    |    |—— TURNSTILE_TIME
|    |    |    |—— 描述: Cloudflare Turnstile 人机验证通过后的有效时间，单位为秒，默认 14400s=4h。
|    |    |    |—— 默认值: `14400`
```

### 数据库配置

#### D1 数据库

- 前往**设置** —— **函数** 绑定一个 D1 数据库，变量名称为 **D1**。

### 部署

### 享受

## 注意事项

部分站点可能拒绝被嵌入进 iframe。

## 免责声明

本项目仅供学习和研究使用，不保证所有嵌入的网站都能正常工作。使用本项目时，请确保遵守相关网站的使用条款和法律法规。对于因使用本项目而导致的任何问题，本项目作者和贡献者不承担任何责任。

---

Powered by ChatGPT, DeepSeek, and Cloudflare Pages