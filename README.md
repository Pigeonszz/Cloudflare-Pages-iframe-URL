# Cloudflare Pages Iframe URL

Render embedded iframe content using Cloudflare Pages.

## Other Languages

- [简体中文](README.zh-cn.md)
- [繁體中文](README.zh-tw.md)

## How to Use

1. **Fork this project** to your own GitHub repository.
2. **Login to the Cloudflare dashboard** and deploy the project.

### Environment Variables

Configure the following environment variables in the Cloudflare Pages settings:

| Name | Description | Format | Default Value |
|------|-------------|--------|---------------|
| LOG_LEVEL | Logging level (optional) | off, fatal, error, warn, info, debug, trace | info |
| IFRAME_URL | URL to load in the iframe, supports multiple URLs, service name used as site title | URL1;Service_Name1, URL2;Service_Name2, ... | N/A |
| FAVICON_URL | URL of the site favicon | Service_Name1;Favicon_URL1, Service_Name2;Favicon_URL2, ... | N/A |
| TURNSTILE_ENABLED | Enable Turnstile CAPTCHA | true / false | false |
| TURNSTILE_SITE_KEY | Site key for Cloudflare Turnstile CAPTCHA | N/A | N/A |
| TURNSTILE_SECRET_KEY | Secret key for Cloudflare Turnstile CAPTCHA | N/A | N/A |
| TURNSTILE_TIME | Validity time for Turnstile CAPTCHA in seconds | N/A | 14400 |
| M_POST_LOAD | Mobile post-load custom CSS/JS (experimental) | N/A | N/A |
| M_PRELOAD | Mobile preload custom CSS/JS (experimental) | N/A | N/A |
| POST_LOAD | Desktop post-load custom CSS/JS (experimental) | N/A | N/A |
| PRELOAD | Desktop preload custom CSS/JS (experimental) | N/A | N/A |

### Database Configuration

#### D1 Database

- Go to **Settings** -> **Functions** and bind a D1 database with the variable name **D1**.

### Deployment

### Enjoy

## Notes

Some sites may refuse to be embedded in an iframe.

## Disclaimer

This project is for educational and research purposes only. There is no guarantee that all embedded websites will work properly. Ensure you comply with the terms of use and legal regulations of the websites you embed. The author and contributors of this project are not responsible for any issues arising from the use of this project.

---

Powered by ChatGPT, DeepSeek, and Cloudflare Pages.
