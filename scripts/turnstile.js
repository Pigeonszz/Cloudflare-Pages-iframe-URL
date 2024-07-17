// /scripts/turnstile.js
'use strict';

import { getTranslation } from './i18n.js';

// 获取人机验证开关状态
fetch('/api/Turnstile')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(async env => {
    const turnstileEnabled = env.TURNSTILE_ENABLED === 'true';
    const siteKey = env.siteKey;

    // 检查 localStorage 中是否有验证状态
    const turnstileToken = localStorage.getItem('turnstileToken');
    const turnstileUUID = localStorage.getItem('turnstileUUID');

    if (turnstileToken && turnstileUUID) {
      // 获取客户端 IP 地址
      const ip = await getClientIP();
      if (ip) {
        // 验证 turnstileToken 和 turnstileUUID
        verifyToken(turnstileToken, turnstileUUID, ip).then(isValid => {
          if (isValid) {
            // 验证成功后将新的UUID和Token保存到localStorage
            localStorage.setItem('turnstileToken', turnstileToken);
            localStorage.setItem('turnstileUUID', turnstileUUID);
            // 重定向回原来的页面
            window.location.href = document.referrer || 'index.html';
          } else {
            // 验证失败或不存在，初始化Turnstile
            initializeTurnstile(siteKey);
          }
        }).catch(error => console.error(getTranslation('error_verifying_turnstile_token'), error));
      } else {
        console.error(getTranslation('error_fetching_ip'));
      }
    } else {
      // 不存在UUID和Token，初始化Turnstile
      initializeTurnstile(siteKey);
    }
  })
  .catch(error => console.error(getTranslation('error_fetching_turnstile_status'), error));

// 动态加载 Turnstile 脚本
function loadTurnstileScript() {
  const script = document.createElement('script');
  script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// 初始化 Turnstile 验证组件
function initializeTurnstile(siteKey) {
  const newTurnstileUUID = generateUUID();
  localStorage.setItem('turnstileUUID', newTurnstileUUID);
  loadTurnstileScript();
  const container = document.getElementById('turnstile-container');
  if (container) {
    container.innerHTML = `<div class="cf-turnstile" data-sitekey="${siteKey}" data-callback="onTurnstileSuccess"></div>`;
  } else {
    console.error(getTranslation('turnstile_container_not_found'));
  }
}

// Turnstile 验证成功的回调函数
function onTurnstileSuccess(token) {
  const turnstileUUID = localStorage.getItem('turnstileUUID');
  localStorage.setItem('turnstileToken', token);
  localStorage.setItem('turnstileUUID', turnstileUUID);
  // 重定向回原来的页面
  window.location.href = document.referrer || 'index.html';
}

// 验证 token 和 UUID 的函数
async function verifyToken(token, uuid, ip) {
  const response = await fetch('/api/verify-turnstile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({ token, uuid, ip })
  });

  const result = await response.json();
  if (result.LOG_LEVEL) {
    localStorage.setItem('LOG_LEVEL', result.LOG_LEVEL);
    console.log(getTranslation('current_log_level'), result.LOG_LEVEL);
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
  const currentDomain = window.location.hostname;
  try {
    const response = await fetch(`https://${currentDomain}/api/IP`);
    if (!response.ok) {
      throw new Error(getTranslation('http_error', { status: response.status }));
    }
    const data = await response.text();
    const ipInfo = parseIPInfo(data);
    return ipInfo.IP;
  } catch (error) {
    console.error(getTranslation('error_fetching_ip'), error);
    return null;
  }
}

// 解析纯文本响应
function parseIPInfo(text) {
  const lines = text.split('\n');
  const ipInfo = {};
  lines.forEach(line => {
    const [key, value] = line.split(': ');
    if (key && value) {
      ipInfo[key] = value;
    }
  });
  return ipInfo;
}