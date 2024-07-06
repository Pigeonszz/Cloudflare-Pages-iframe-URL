document.addEventListener('DOMContentLoaded', function() {
  // 检查环境变量 ENABLE_TURNSTILE 是否为 true
  const enableTurnstile = process.env.ENABLE_TURNSTILE || window.env.ENABLE_TURNSTILE;
  
  if (enableTurnstile === 'true') {
    // 启用了 Turnstile
    console.log('Turnstile is enabled.');

    // 进行 Turnstile 验证
    fetch('/api/getTurnstileKeys') // 替换为实际的获取 Turnstile keys 的 API 路径
      .then(response => response.json())
      .then(keys => {
        const siteKey = keys.TURNSTILE_SITE_KEY;
        const container = document.getElementById('turnstile-container');
        container.innerHTML = `<div class="cf-turnstile" data-sitekey="${siteKey}" data-callback="onTurnstileSuccess"></div>`;
        document.getElementById('turnstile-wrapper').style.display = 'flex'; // 显示 Turnstile 容器
      })
      .catch(error => console.error('Error fetching Turnstile keys:', error));
  } else {
    // 没有启用 Turnstile，直接加载 iframe
    console.log('Turnstile is not enabled.');

    loadIframe();
  }

  // Turnstile 验证成功的回调函数
  window.onTurnstileSuccess = function(token) {
    // 存储验证状态有效期为 4 小时
    const validUntil = new Date().getTime() + 4 * 60 * 60 * 1000; // 4小时后的时间戳
    sessionStorage.setItem('turnstileValidUntil', validUntil);

    // 隐藏 Turnstile 验证框
    document.getElementById('turnstile-wrapper').style.display = 'none';

    // 显示 iframe
    loadIframe();
  };

  // 加载 iframe
  function loadIframe() {
    fetch('/api/getIframeUrl') // 替换为实际的获取 iframe URL 的 API 路径
      .then(response => response.text())
      .then(iframeUrl => {
        const iframe = document.getElementById('dynamic-iframe');
        iframe.src = iframeUrl;
        iframe.style.display = 'block'; // 显示 iframe
      })
      .catch(error => console.error('Error fetching iframe URL:', error));
  }
});
