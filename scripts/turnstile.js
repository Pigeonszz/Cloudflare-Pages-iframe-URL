import { translate } from './i18n.js';

document.getElementById('verification-message').innerText = translate('verification_message');
document.getElementById('noscript-message').innerText = translate('noscript_message');

// 获取人机验证开关状态
fetch('/Turnstile')
  .then(response => response.json())
  .then(env => {
    const turnstileEnabled = env.TURNSTILE_ENABLED === 'true';
    const siteKey = env.siteKey;

    // 检查 localStorage 中是否有验证状态
    const turnstileToken = localStorage.getItem('turnstileToken');
    const turnstileUUID = localStorage.getItem('turnstileUUID');

    if (turnstileToken && turnstileUUID) {
      // 获取 IP 地址
      getClientIP().then(ip => {
        if (ip) {
          // 验证 turnstileToken 和 turnstileUUID
          verifyToken(turnstileToken, turnstileUUID, ip).then(isValid => {
            if (isValid) {
              window.location.href = 'index.html';
            } else {
              // 生成新的 turnstileUUID
              const newTurnstileUUID = generateUUID();
              localStorage.setItem('turnstileUUID', newTurnstileUUID);
              loadTurnstileScript();
              initializeTurnstile(siteKey);
              checkTurnstileStatus(20000);
            }
          });
        } else {
          console.error('Failed to get client IP address.');
        }
      });
    } else {
      // 生成新的 turnstileUUID
      const newTurnstileUUID = generateUUID();
      localStorage.setItem('turnstileUUID', newTurnstileUUID);
      loadTurnstileScript();
      initializeTurnstile(siteKey);
      checkTurnstileStatus(20000);
    }
  })
  .catch(error => console.error('Error fetching Turnstile status:', error));

// 动态加载 Turnstile 脚本
function loadTurnstileScript() {
  const script = document.createElement('script');
  script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?_=${new Date().getTime()}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// 初始化 Turnstile 验证组件
function initializeTurnstile(siteKey) {
  const container = document.getElementById('turnstile-container');
  if (container) {
    container.innerHTML = `<div class="cf-turnstile" data-sitekey="${siteKey}" data-callback="onTurnstileSuccess"></div>`;
  } else {
    console.error('Turnstile container element not found.');
  }
}

// Turnstile 验证成功的回调函数
function onTurnstileSuccess(token) {
  const turnstileUUID = localStorage.getItem('turnstileUUID');
  localStorage.setItem('turnstileToken', token);
  localStorage.setItem('turnstileUUID', turnstileUUID);
  window.location.href = 'index.html';
}

// 检测 Turnstile 状态的函数，超时为 20 秒
function checkTurnstileStatus(timeout) {
  const startTime = Date.now();
  const interval = setInterval(() => {
    const container = document.querySelector('.cf-turnstile iframe');
    if (container) {
      clearInterval(interval);
    } else if (Date.now() - startTime >= timeout) {
      clearInterval(interval);
      console.error('Turnstile component not loaded, clearing cache and refreshing the page.');
      clearCacheAndRefresh();
    }
  }, 100);
}

// 清除缓存并硬性刷新页面
function clearCacheAndRefresh() {
  if ('caches' in window) {
    caches.keys().then(names => {
      for (let name of names) caches.delete(name);
    });
  }
  sessionStorage.clear();
  localStorage.clear();
  window.location.reload(true);
}

// 验证 token 和 UUID 的函数
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

// 生成 UUID 的函数
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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