# Cloudflare Pages Iframe URL

Render embedded iframe content based on Cloudflare Pages.

## Other Languages

- [简体中文](README.zh-CN.md)
- [繁體中文](README.zh-TW.md)

## How to Use

1. **Fork this project** to your own GitHub repository.
2. **Log in to the Cloudflare dashboard** and deploy the project.

### Setting Environment Variables

In the Cloudflare Pages settings, configure the following environment variables:

| Name | Description | Format | Default Value |
|------|------|------|--------|
| LOG_LEVEL | Log level (optional) | off, fatal, error, warn, info, debug, trace | info |
| IFRAME_URL | URL to be loaded by the iframe, supports multiple URLs, service names are used as site titles | URL1;ServiceName1, URL2;ServiceName2, ... |  |
| FAVICON_URL | Site icon URL | ServiceName1;Favicon_URL1, ServiceName2;Favicon_URL2, ... |  |
| TURNSTILE_ENABLED | Turnstile CAPTCHA switch | true / false | false |
| TURNSTILE_SITE_KEY | Cloudflare Turnstile CAPTCHA site key |  |  |
| TURNSTILE_SECRET_KEY | Cloudflare Turnstile CAPTCHA secret key |  |  |
| TURNSTILE_TIME | Valid time after passing Turnstile CAPTCHA (in seconds) |  | 14400 |
| M_POST_LOAD | Custom CSS/JS for mobile post-load (experimental) |  |  |
| M_PRELOAD | Custom CSS/JS for mobile pre-load (experimental) |  |  |
| POST_LOAD | Custom CSS/JS for desktop post-load (experimental) |  |  |
| PRELOAD | Custom CSS/JS for desktop pre-load (experimental) |  |  |

Environment variables with prefixes (currently "KV_" and "D1_") will be loaded into the corresponding KV or D1 when accessing the https://${domain}/api/init endpoint.

### Database Configuration

#### D1 Database

- The variable name is **D1**.

#### KV Namespace

- The variable name is **KV**.

### Deployment

After deployment, manually visit https://${domain}/api/init to initialize the database (if there is a database).

### Enjoy

## Notes

Some sites may refuse to be embedded in an iframe.

## Disclaimer

This project is for learning and research purposes only and does not guarantee that all embedded websites will work properly. When using this project, please ensure compliance with the terms of use of the relevant websites and laws and regulations. The authors and contributors of this project are not responsible for any issues arising from the use of this project.

---

Powered by ChatGPT, DeepSeek, and Cloudflare Pages.