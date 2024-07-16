// index.js

// 国际化支持
const i18n = {
  'zh-cn': {
    'redirect_mobile': '正在重定向到移动版页面',
    'fetching_ip': '正在获取 IP 地址',
    'error_fetching_ip': '获取 IP 地址时出错',
    'fetching_turnstile_status': '正在获取 Turnstile 状态',
    'error_fetching_turnstile_status': '获取 Turnstile 状态时出错',
    'turnstile_redirect': 'Turnstile 验证失败，正在重定向',
    'showing_iframe': '正在显示 iframe 内容',
    'error_fetching_iframe_favicon': '获取 iframe 或 favicon URL 时出错',
    'setting_title': '设置页面标题',
    'moving_select_to_top': '将选择框移动到顶部'
  },
  'zh-tw': {
    'redirect_mobile': '正在重定向到移動版頁面',
    'fetching_ip': '正在獲取 IP 地址',
    'error_fetching_ip': '獲取 IP 地址時出錯',
    'fetching_turnstile_status': '正在獲取 Turnstile 狀態',
    'error_fetching_turnstile_status': '獲取 Turnstile 狀態時出錯',
    'turnstile_redirect': 'Turnstile 驗證失敗，正在重定向',
    'showing_iframe': '正在顯示 iframe 內容',
    'error_fetching_iframe_favicon': '獲取 iframe 或 favicon URL 時出錯',
    'setting_title': '設置頁面標題',
    'moving_select_to_top': '將選擇框移動到頂部'
  },
  'en-us': {
    'redirect_mobile': 'Redirecting to mobile version',
    'fetching_ip': 'Fetching IP address',
    'error_fetching_ip': 'Error fetching IP address',
    'fetching_turnstile_status': 'Fetching Turnstile status',
    'error_fetching_turnstile_status': 'Error fetching Turnstile status',
    'turnstile_redirect': 'Turnstile verification failed, redirecting',
    'showing_iframe': 'Showing iframe content',
    'error_fetching_iframe_favicon': 'Error fetching iframe or favicon URL',
    'setting_title': 'Setting page title',
    'moving_select_to_top': 'Moving select box to top'
  },
  'jp': {
    'redirect_mobile': 'モバイルバージョンにリダイレクト中',
    'fetching_ip': 'IPアドレスを取得中',
    'error_fetching_ip': 'IPアドレスの取得中にエラーが発生しました',
    'fetching_turnstile_status': 'Turnstileのステータスを取得中',
    'error_fetching_turnstile_status': 'Turnstileのステータスの取得中にエラーが発生しました',
    'turnstile_redirect': 'Turnstileの検証に失敗しました、リダイレクト中',
    'showing_iframe': 'iframeの内容を表示中',
    'error_fetching_iframe_favicon': 'iframeまたはfaviconのURLの取得中にエラーが発生しました',
    'setting_title': 'ページタイトルを設定中',
    'moving_select_to_top': '選択ボックスを上部に移動中'
  },
  'kr': {
    'redirect_mobile': '모바일 버전으로 리디렉션 중',
    'fetching_ip': 'IP 주소 가져오는 중',
    'error_fetching_ip': 'IP 주소 가져오는 중 오류 발생',
    'fetching_turnstile_status': 'Turnstile 상태 가져오는 중',
    'error_fetching_turnstile_status': 'Turnstile 상태 가져오는 중 오류 발생',
    'turnstile_redirect': 'Turnstile 검증 실패, 리디렉션 중',
    'showing_iframe': 'iframe 내용 표시 중',
    'error_fetching_iframe_favicon': 'iframe 또는 favicon URL 가져오는 중 오류 발생',
    'setting_title': '페이지 제목 설정 중',
    'moving_select_to_top': '선택 상자를 상단으로 이동 중'
  }
};

function getLocale() {
  const userLang = navigator.language || navigator.userLanguage;
  return i18n[userLang] ? userLang : 'en-us';
}

function translate(key) {
  const locale = getLocale();
  return i18n[locale][key] || i18n['en-us'][key];
}

// 检查用户代理是否为移动设备，如果是则重定向到移动版页面
function isMobileDevice() {
  console.log(translate('redirect_mobile'));
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(navigator.userAgent);
}

if (isMobileDevice()) {
  window.location.href = 'mobile.html';
}

// 获取 IP 地址
async function getClientIP() {
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
function showIframe(token, uuid, ip) {
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
    .catch(error => console.error(`${translate('error_fetching_iframe_favicon')}:`, error));
}

// 设置页面标题
function setTitle(title) {
  console.log(translate('setting_title'));
  document.title = title || '主内容';
}

// 将选择框移动到顶部
function moveSelectToTop() {
  console.log(translate('moving_select_to_top'));
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