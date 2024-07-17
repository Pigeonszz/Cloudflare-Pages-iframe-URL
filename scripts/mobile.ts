// mobile.ts
"use strict";

import { translate } from './i18n.ts';

// 检测桌面端 UA 并重定向到 index.html
function isDesktopDevice(): boolean {
  console.log(translate('redirect_desktop'));
  return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(navigator.userAgent);
}

if (isDesktopDevice()) {
  window.location.href = 'index.html';
}

// 获取 IP 地址
async function getClientIP(): Promise<string | null> {
  console.log(translate('fetching_ip'));
  const currentDomain = window.location.hostname;
  try {
    const response = await fetch(`https://${currentDomain}/cdn-cgi/trace`);
    const data = await response.text();
    const ipMatch = data.match(/ip=([0-9a-fA-F:\.]+)/);
    return ipMatch ? ipMatch[1] : null;
  } catch (error) {
    console.error(`${translate('error_fetching_ip')}:`, error);
    try {
      const response = await fetch(`https://${currentDomain}/IP`);
      const ip = await response.text();
      return ip;
    } catch (fallbackError) {
      console.error(`${translate('error_fetching_ip')}:`, fallbackError);
      return null;
    }
  }
}

// 获取 Turnstile 状态
fetch('/Turnstile', {
  headers: {
    'Accept': 'application/json;charset=UTF-8'
  }
})
  .then(response => response.json())
  .then(env => {
    console.log(translate('fetching_turnstile_status'));
    if (env.TURNSTILE_ENABLED === 'true') {
      const turnstileToken = localStorage.getItem('turnstileToken');
      const turnstileUUID = localStorage.getItem('turnstileUUID');
      if (turnstileToken && turnstileUUID) {
        getClientIP().then(ip => {
          verifyToken(turnstileToken, turnstileUUID, ip).then(isValid => {
            if (isValid) {
              showIframe(turnstileToken, turnstileUUID, ip);
            } else {
              console.log(translate('turnstile_redirect'));
              window.location.href = 'turnstile.html';
            }
          });
        });
      } else {
        console.log(translate('turnstile_redirect'));
        window.location.href = 'turnstile.html';
      }
    } else {
      showIframe();
    }
  })
  .catch(error => console.error(`${translate('error_fetching_turnstile_status')}:`, error));

// 显示 iframe 内容
function showIframe(token?: string, uuid?: string, ip?: string): void {
  console.log(translate('showing_iframe'));
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({ token, uuid, ip })
  };

  Promise.all([
    fetch('/iframe-url', fetchOptions),
    fetch('/favicon', fetchOptions)
  ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
      const urls = data[0].urls;
      const favUrls = data[1].faviconUrls;

      const select = document.getElementById('siteSelection') as HTMLSelectElement;
      const iframe = document.getElementById('dynamic-iframe') as HTMLIFrameElement;
      const favicon = document.getElementById('dynamic-favicon') as HTMLLinkElement;
      const faviconMap: { [key: string]: { base64: string, contentType: string } } = {};

      if (Array.isArray(favUrls)) {
        favUrls.forEach(favUrl => {
          if (typeof favUrl === 'object' && favUrl.hasOwnProperty('service') && favUrl.hasOwnProperty('base64') && favUrl.hasOwnProperty('contentType')) {
            faviconMap[favUrl.service] = { base64: favUrl.base64, contentType: favUrl.contentType };
          } else {
            console.error('Invalid favUrl:', favUrl);
          }
        });
      } else {
        console.error('Invalid favUrls format:', favUrls);
      }

      if (Array.isArray(urls)) {
        urls.forEach(urlObj => {
          if (typeof urlObj === 'object' && urlObj.hasOwnProperty('url') && urlObj.hasOwnProperty('service')) {
            const iframeUrl = urlObj.url;
            const service = urlObj.service;
            const faviconData = faviconMap[service] || { base64: '/favicon.svg', contentType: 'image/svg+xml' };
            const option = document.createElement('option');
            option.value = iframeUrl;
            option.textContent = service;
            select.appendChild(option);
          } else {
            console.error('Invalid urlObj:', urlObj);
          }
        });
      } else {
        console.error('Invalid urls format:', urls);
      }

      select.addEventListener('change', function () {
        const selectedUrl = select.value;
        const selectedOption = select.options[select.selectedIndex].textContent;
        if (selectedUrl) {
          iframe.src = selectedUrl;
          sessionStorage.setItem('selectedSite', selectedUrl);
          setTitle(selectedOption);
          setFavicon(selectedOption, faviconMap);
          select.classList.add('selected');
        }
      });

      const lastSelectedSite = sessionStorage.getItem('selectedSite');
      if (lastSelectedSite) {
        iframe.src = lastSelectedSite;
        select.value = lastSelectedSite;
        const lastSelectedOption = select.options[select.selectedIndex].textContent;
        setTitle(lastSelectedOption);
        setFavicon(lastSelectedOption, faviconMap);
      }

      const selectContainer = document.getElementById('selectContainer') as HTMLElement;
      selectContainer.addEventListener('touchstart', function (e) {
        const startY = e.touches[0].clientY;
        selectContainer.addEventListener('touchmove', function (e) {
          const moveY = e.touches[0].clientY;
          if (moveY - startY > 50) {
            selectContainer.style.top = '50%';
            selectContainer.style.left = '50%';
            selectContainer.style.transform = 'translate(-50%, -50%)';
            setTimeout(() => {
              selectContainer.style.top = '20px';
              selectContainer.style.left = '20px';
              selectContainer.style.transform = 'translate(0)';
            }, 5000);
          }
        });
      });

      select.addEventListener('click', function () {
        select.classList.remove('selected');
        setTimeout(() => {
          select.classList.add('selected');
        }, 5000);
      });
    })
    .catch(error => console.error(`${translate('error_fetching_iframe_favicon')}:`, error));
}

// 设置页面标题
function setTitle(title?: string): void {
  console.log(translate('setting_title'));
  document.title = title || '主内容';
}

// 设置 favicon
function setFavicon(selectedOption: string, faviconMap: { [key: string]: { base64: string, contentType: string } }): void {
  console.log(translate('setting_favicon'));
  const favicon = document.getElementById('dynamic-favicon') as HTMLLinkElement;
  const faviconData = faviconMap[selectedOption] || { base64: '/favicon.svg', contentType: 'image/svg+xml' };
  favicon.href = `data:${faviconData.contentType};base64,${faviconData.base64}`;
}

// 验证 Turnstile 令牌
async function verifyToken(token: string, uuid: string, ip: string | null): Promise<boolean> {
  const response = await fetch('/verify-turnstile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({ token, uuid, ip })
  });

  const result = await response.json();
  if (result.LOG_LEVEL) {
    console.log('Current log level:', result.LOG_LEVEL);
    localStorage.setItem('LOG_LEVEL', result.LOG_LEVEL);
  }
  return result.success;
}