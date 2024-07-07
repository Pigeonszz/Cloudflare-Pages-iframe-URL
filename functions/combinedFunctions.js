// combinedFunctions.js

// 处理 Turnstile 验证状态请求
async function handleTurnstileRequest(context) {
  // 获取环境变量 TURNSTILE_ENABLED，默认为 'false'
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED || 'false';

  // 返回 JSON 格式的响应，包含 TURNSTILE_ENABLED 状态
  return new Response(
    JSON.stringify({ TURNSTILE_ENABLED }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// 处理获取站点标题的请求
async function handleSiteTitleRequest(context) {
  // 从环境变量中获取站点标题并返回纯文本响应
  return new Response(context.env.SITE_TITLE, {
    headers: { 'Content-Type': 'text/plain' }
  });
}

// 处理获取 iframe URL 的请求
async function handleIframeUrlRequest(context) {
  // 从环境变量中获取 iframe URL 并返回纯文本响应
  return new Response(context.env.IFRAME_URL, {
    headers: { 'Content-Type': 'text/plain' }
  });
}

// 处理 Turnstile 密钥的请求
async function handleTurnstileKeysRequest(context) {
  // 从环境变量中获取 Turnstile 的 siteKey 和 secretKey
  const keys = {
    siteKey: context.env.TURNSTILE_SITE_KEY,
    secretKey: context.env.TURNSTILE_SECRET_KEY,
  };

  // 返回 JSON 格式的响应，包含 siteKey 和 secretKey
  return new Response(JSON.stringify(keys), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// 处理根路径的请求，返回 index.html 的内容
async function handleIndexRequest(context) {
  const html = `
<!DOCTYPE html>
<html lang="zh-cn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <title>Loading...</title>
  <style>
    body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      font-family: Arial, sans-serif;
      text-align: center;
      overflow: hidden; /* 防止 iframe 溢出 */
    }
    iframe {
      width: 100vw; /* 占据整个视口宽度 */
      height: 100vh; /* 占据整个视口高度 */
      border: none;
    }
  </style>
</head>
<body>
  <iframe id="dynamic-iframe"></iframe>

  <script>
    // 获取 Turnstile 验证状态
    fetch('/Turnstile')
      .then(response => response.json())
      .then(env => {
        if (env.TURNSTILE_ENABLED === 'true') {
          // 检查 localStorage 中是否有验证状态
          const turnstileValidUntil = localStorage.getItem('turnstileValidUntil');
          const currentTime = new Date().getTime();

          if (turnstileValidUntil && currentTime < turnstileValidUntil) {
            // 如果验证状态仍有效，则直接显示 iframe
            showIframe();
          } else {
            // 否则，跳转到 Turnstile 验证页面
            window.location.href = 'turnstile.html';
          }
        } else {
          // TURNSTILE_ENABLED 为 false，直接显示 iframe
          showIframe();
        }
      })
      .catch(error => console.error('Error fetching Turnstile status:', error));

    // 显示 iframe
    function showIframe() {
      fetch('/iframe-url')
        .then(response => response.text())
        .then(iframeUrl => {
          // 显示 iframe 并设置 src
          const iframe = document.getElementById('dynamic-iframe');
          iframe.src = iframeUrl;
          iframe.style.display = 'block';

          // 尝试从 iframe 获取 favicon 和 title
          try {
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            const iframeTitle = iframeDocument.querySelector('title').textContent;
            setTitle(iframeTitle); // 设置页面标题
          } catch (error) {
            console.error('Error accessing iframe content:', error);
            fetch('/getSiteTitle') // 获取 Cloudflare SITE_TITLE 变量
              .then(response => response.text()) // 注意此处修改为 text() 方法
              .then(siteTitle => {
                setTitle(siteTitle); // 设置页面标题
              })
              .catch(error => {
                console.error('Error fetching SITE_TITLE:', error);
                // 不设置默认标题，保持页面加载中...
              });
          }
        })
        .catch(error => console.error('Error fetching iframe URL:', error));
    }

    // 设置页面标题的函数
    function setTitle(title) {
      document.title = title;
    }
  </script>
</body>
</html>
`;

  // 返回包含 index.html 内容的响应
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// 处理 /turnstile 路径的请求，返回 turnstile.html 的内容
async function handleTurnstileHtmlRequest(context) {
  const html = `
<!DOCTYPE html>
<html lang="zh-cn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <title>Turnstile Verification</title>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  <style>
    body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      font-family: Arial, sans-serif;
      text-align: center;
      background-color: rgba(0, 0, 0, 0.8); /* 半透明背景 */
    }
    #turnstile-container {
      margin-top: 20px; /* 调整 Turnstile 与文本的间距 */
    }
  </style>
</head>
<body>
  <h1 style="color: white;">在继续前，需要验证你是否为人类</h1>
  <div id="turnstile-container"></div>

  <script>
    // 通过检查 sessionStorage 中的标志确保只进行一次硬性刷新
    const hasRefreshed = sessionStorage.getItem('hasRefreshed');
    if (!hasRefreshed) {
      sessionStorage.setItem('hasRefreshed', 'true');
      window.location.reload(true); // 强制从服务器加载页面，忽略缓存
    }

    // 获取人机验证开关状态
    const turnstileEnabled = true; // 在 Cloudflare Pages 环境中已设置为 true

    // 检查 localStorage 中是否有验证状态
    const turnstileValidUntil = localStorage.getItem('turnstileValidUntil');
    const currentTime = new Date().getTime();

    if (turnstileValidUntil && currentTime < turnstileValidUntil) {
      // 如果验证状态仍有效，则跳转回主内容页面
      window.location.href = 'index.html';
    } else if (turnstileEnabled) {
      // 否则，进行 Turnstile 验证
      fetch('/turnstile-keys') // 获取 Turnstile 的 siteKey
        .then(response => response.json())
        .then(keys => {
          const siteKey = keys.siteKey; // 从返回的 JSON 中获取 siteKey
          initializeTurnstile(siteKey); // 初始化 Turnstile 验证
        })
        .catch(error => console.error('Error fetching Turnstile keys:', error));
    } else {
      console.error('Turnstile verification is not enabled.');
      // 处理错误：例如显示错误信息或者允许继续，具体情况取决于您的需求
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
      // 存储验证状态有效期为 4 小时
      const validUntil = new Date().getTime() + 4 * 60 * 60 * 1000; // 4小时后的时间戳
      localStorage.setItem('turnstileValidUntil', validUntil.toString());

      // 返回主内容页面
      window.location.href = 'index.html';
    }
  </script>
</body>
</html>
`;

  // 返回包含 turnstile.html 内容的响应
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// 导出主要处理请求的函数
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // 根据请求的路径决定调用哪个处理函数
  if (url.pathname === '/Turnstile') {
    return handleTurnstileRequest(context);
  } else if (url.pathname === '/getSiteTitle') {
    return handleSiteTitleRequest(context);
  } else if (url.pathname === '/iframe-url') {
    return handleIframeUrlRequest(context);
  } else if (url.pathname === '/turnstile-keys') {
    return handleTurnstileKeysRequest(context);
  } else if (url.pathname === '/') {
    // 处理根路径请求，返回 index.html
    return handleIndexRequest(context);
  } else if (url.pathname === '/turnstile') {
    // 处理 /turnstile 路径请求，返回 turnstile.html
    return handleTurnstileHtmlRequest(context);
  } else {
    // 如果请求路径不匹配，返回 404 响应
    return new Response('Not Found', { status: 404 });
  }
}
