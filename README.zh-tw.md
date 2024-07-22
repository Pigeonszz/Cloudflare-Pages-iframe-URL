# Cloudflare Pages Iframe URL

基於 Cloudflare Pages 渲染嵌入的 iframe 內容。

## 如何使用

1. **Fork 此專案**到您自己的 GitHub 倉庫。
2. **登入 Cloudflare 控制面板**並部署專案。

### 設置環境變量

在 Cloudflare Pages 設置中，配置以下環境變量：

| 名稱 | 描述 | 格式 | 默認值 |
|------|------|------|--------|
| LOG_LEVEL | 日誌等級 (可選) | off, fatal, error, warn, info, debug, trace | info |
| IFRAME_URL | iframe 要加載的 URL，支持多個 URL，服務名稱用作站點標題 | URL1;服務名稱1, URL2;服務名稱2, ... |  |
| FAVICON_URL | 站點圖標 URL | 服務名稱1;Favicon_URL1, 服務名稱2;Favicon_URL2, ... |  |
| TURNSTILE_ENABLED | Turnstile 人機驗證開關 | true / false | false |
| TURNSTILE_SITE_KEY | Cloudflare Turnstile 人機驗證站點密鑰 |  |  |
| TURNSTILE_SECRET_KEY | Cloudflare Turnstile 人機驗證密鑰 |  |  |
| TURNSTILE_TIME | Turnstile 人機驗證通過後的有效時間（單位：秒） |  | 14400 |
| M_POST_LOAD | 移動端後加載自定義 CSS/JS (試驗性) |  |  |
| M_PRELOAD | 移動端預加載自定義 CSS/JS (試驗性) |  |  |
| POST_LOAD | 桌面端後加載自定義 CSS/JS (試驗性) |  |  |
| PRELOAD | 桌面端預加載自定義 CSS/JS (試驗性) |  |  |

加入前綴的環境變量(目前有)："KV_" "D1_" 將在訪問 https://${域名}/api/init 端點時載入到相應的 KV 或 D1 中 

### 數據庫配置

#### D1 數據庫

- 變量名稱為 **D1**。

#### KV 命名空間

- 變量名稱為 **KV**。

### 部署

 部署完成後手動訪問 https://${域名}/api/init 進行數據庫(若有數據庫)初始化

### 享受

## 注意事項

部分站點可能拒絕被嵌入進 iframe。

## 免責聲明

本專案僅供學習和研究使用，不保證所有嵌入的網站都能正常工作。使用本專案時，請確保遵守相關網站的使用條款和法律法規。對於因使用本專案而導致的任何問題，本專案作者和貢獻者不承擔任何責任。

---

由 ChatGPT、DeepSeek 和 Cloudflare Pages 提供支持。