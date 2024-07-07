// combinedFunctions.js

// 处理 Turnstile 验证状态请求
export async function handleTurnstileRequest(context) {
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
export async function handleSiteTitleRequest(context) {
  // 从环境变量中获取站点标题并返回纯文本响应
  return new Response(context.env.SITE_TITLE, {
    headers: { 'Content-Type': 'text/plain' }
  });
}

// 处理获取 iframe URL 的请求
export async function handleIframeUrlRequest(context) {
  // 从环境变量中获取 iframe URL 并返回纯文本响应
  return new Response(context.env.IFRAME_URL, {
    headers: { 'Content-Type': 'text/plain' }
  });
}

// 处理 Turnstile 密钥的请求
export async function handleTurnstileKeysRequest(context) {
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
  } else {
    // 如果请求路径不匹配，返回 404 响应
    return new Response('Not Found', { status: 404 });
  }
}
