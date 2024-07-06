// 获取环境变量并初始化 Turnstile 验证
fetch('/Turnstile')
  .then(response => response.json())
  .then(env => {
    if (env.TURNSTILE_ENABLED === 'true') {
      const siteKey = env.TURNSTILE_SITE_KEY;
      initializeTurnstile(siteKey);
    }
  })
  .catch(error => console.error('Error fetching Turnstile keys:', error));

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
  // 存储验证状态有效期为 4 小时
  const validUntil = new Date().getTime() + 4 * 60 * 60 * 1000;
  localStorage.setItem('turnstileValidUntil', validUntil);

  // 跳转回主内容页面
  window.location.href = 'index.html';
}
