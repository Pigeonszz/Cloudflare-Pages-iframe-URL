// 检查用户代理是否为移动设备，如果是则重定向到移动版页面
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(navigator.userAgent);
}

if (isMobileDevice()) {
  window.location.href = 'mobile.html';
}

// 获取 IP 地址
async function getClientIP() {
  const currentDomain = window.location.hostname;
  try {
    const response = await fetch(`https://${currentDomain}/cdn-cgi/trace`);
    const data = await response.text();
    const ipMatch = data.match(/ip=([0-9a-fA-F:\.]+)/);
    return ipMatch ? ipMatch[1] : null;
  } catch (error) {
    console.error('Error fetching IP address via /cdn-cgi/trace:', error);
    try {
      const response = await fetch(`https://${currentDomain}/IP`);
      const ip = await response.text();
      return ip;
    } catch (fallbackError) {
      console.error('Error fetching IP address via /IP:', fallbackError);
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
    if (env.TURNSTILE_ENABLED === 'true') {
      const turnstileToken = localStorage.getItem('turnstileToken');
      const turnstileUUID = localStorage.getItem('turnstileUUID');
      if (turnstileToken && turnstileUUID) {
        getClientIP().then(ip => {
          verifyToken(turnstileToken, turnstileUUID, ip).then(isValid => {
            if (isValid) {
              showIframe(turnstileToken, turnstileUUID, ip);
            } else {
              window.location.href = 'turnstile.html';
            }
          });
        });
      } else {
        window.location.href = 'turnstile.html';
      }
    } else {
      showIframe();
    }
  })
  .catch(error => console.error('Error fetching Turnstile status:', error));

// 显示 iframe 内容
function showIframe(token, uuid, ip) {
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

      const select = document.getElementById('siteSelection');
      const iframe = document.getElementById('dynamic-iframe');
      const favicon = document.getElementById('dynamic-favicon');
      const faviconMap = {};

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
          moveSelectToTop();
          const faviconData = faviconMap[selectedOption] || { base64: '/favicon.svg', contentType: 'image/svg+xml' };
          favicon.href = `data:${faviconData.contentType};base64,${faviconData.base64}`;
        }
      });

      const lastSelectedSite = sessionStorage.getItem('selectedSite');
      if (lastSelectedSite) {
        iframe.src = lastSelectedSite;
        select.value = lastSelectedSite;
        const lastSelectedOption = select.options[select.selectedIndex].textContent;
        setTitle(lastSelectedOption);
        moveSelectToTop();
        const faviconData = faviconMap[lastSelectedOption] || { base64: '/favicon.svg', contentType: 'image/svg+xml' };
        favicon.href = `data:${faviconData.contentType};base64,${faviconData.base64}`;
      }
    })
    .catch(error => console.error('Error fetching iframe or favicon URL:', error));
}

// 设置页面标题
function setTitle(title) {
  document.title = title || '主内容';
}

// 将选择框移动到顶部
function moveSelectToTop() {
  const select = document.getElementById('siteSelection');
  select.classList.add('top');
  select.addEventListener('mouseenter', function () {
    select.classList.add('expanded');
  });
  select.addEventListener('mouseleave', function () {
    select.classList.remove('expanded');
  });
}

// 验证 Turnstile 令牌
async function verifyToken(token, uuid, ip) {
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
  }
  return result.success;
}