// /scripts/turnstile.js
"use strict";

// 获取人机验证开关状态
async function fetchTurnstileStatus() {
  try {
    const response = await fetch('/api/Turnstile');
    const env = await response.json();
    const turnstileEnabled = env.TURNSTILE_ENABLED === 'true';
    const siteKey = env.siteKey;

    if (turnstileEnabled) {
      await handleTurnstile(siteKey);
    } else {
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Error fetching turnstile status:', error.message);
  }
}

// 处理 Turnstile 验证
async function handleTurnstile(siteKey) {
  const turnstileToken = localStorage.getItem('turnstileToken');
  const turnstileUUID = localStorage.getItem('turnstileUUID');

  if (turnstileToken && turnstileUUID) {
    const clientIP = await getClientIP();
    if (clientIP) {
      const isValid = await verifyToken(turnstileToken, turnstileUUID, clientIP);
      if (isValid) {
        window.location.href = 'index.html';
      } else {
        setupTurnstile(siteKey);
      }
    } else {
      console.error('Failed to fetch client IP address');
    }
  } else {
    setupTurnstile(siteKey);
  }
}

// 设置 Turnstile
function setupTurnstile(siteKey) {
  const newTurnstileUUID = generateUUID();
  localStorage.setItem('turnstileUUID', newTurnstileUUID);
  loadTurnstileScript();
  initializeTurnstile(siteKey);
  checkTurnstileStatus(20000);
}

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
    console.error('Turnstile container element not found');
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
  const check = () => {
    const container = document.querySelector('.cf-turnstile iframe');
    if (container) {
      return;
    } else if (Date.now() - startTime >= timeout) {
      console.error('Turnstile component not loaded, clearing cache and refreshing');
      clearCacheAndRefresh();
    } else {
      requestAnimationFrame(check);
    }
  };
  requestAnimationFrame(check);
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

// 验证 token、UUID 和 IP 的函数
async function verifyToken(token, uuid, ip) {
  const response = await fetch('/api/verify-turnstile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token, uuid, ip })
  });

  const result = await response.json();
  return result.success;
}

// 生成 UUID 的函数
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 获取 IP 地址
async function getClientIP() {
  const currentDomain = window.location.hostname;
  try {
    const response = await fetch(`https://${currentDomain}/api/IP`);
    const data = await response.json();
    return data.IP.IP; // 直接返回 IP 地址
  } catch (error) {
    console.error('Error fetching IP address via API IP:', error.message);
    return null;
  }
}

// 在 DOMContentLoaded 事件中调用 fetchTurnstileStatus
document.addEventListener('DOMContentLoaded', () => {
  fetchTurnstileStatus();
});