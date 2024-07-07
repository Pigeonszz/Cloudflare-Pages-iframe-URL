// 主处理函数，根据请求路径选择对应的处理函数
export async function onRequest(context) {
  // 解析请求的 URL
  const url = new URL(context.request.url);
  const path = url.pathname;

  console.log(`Request received for path: ${path}`);

  // 根据请求路径选择对应的处理函数
  if (path === '/') {
    return new Response('Welcome to Cloudflare Pages!', { status: 200 });
  } else if (path === '/Turnstile') {
    return handleTurnstile(context);
  } else if (path === '/getSiteTitle') {
    return handleGetSiteTitle(context);
  } else if (path === '/iframe-url') {
    return handleIframeUrl(context);
  } else if (path === '/turnstile-keys') {
    return handleTurnstileKeys(context);
  } else {
    console.log(`No matching route found for path: ${path}`);
    // 如果路径不匹配任何处理函数，返回 404 Not Found
    return new Response('Not Found', { status: 404 });
  }
}

// 处理 /Turnstile 请求，返回 TURNSTILE_ENABLED 的值
async function handleTurnstile(context) {
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED || 'false';
  console.log(`TURNSTILE_ENABLED: ${TURNSTILE_ENABLED}`);
  
  // 构造 JSON 响应
  const jsonResponse = JSON.stringify({ TURNSTILE_ENABLED });
  
  // 返回 JSON 响应
  return new Response(jsonResponse, {
    headers: { 'Content-Type': 'application/json' },
  });
}

// 处理 /getSiteTitle 请求，返回 SITE_TITLE 的值
async function handleGetSiteTitle(context) {
  console.log(`SITE_TITLE: ${context.env.SITE_TITLE}`);
  return new Response(context.env.SITE_TITLE, {
    headers: { 'Content-Type': 'text/plain' } // 设置响应头为纯文本格式
  });
}

// 处理 /iframe-url 请求，返回 IFRAME_URL 的值
async function handleIframeUrl(context) {
  console.log(`IFRAME_URL: ${context.env.IFRAME_URL}`);
  return new Response(context.env.IFRAME_URL, {
    headers: { 'Content-Type': 'text/plain' } // 设置响应头为纯文本格式
  });
}

// 处理 /turnstile-keys 请求，返回 Turnstile 的 siteKey 和 secretKey
async function handleTurnstileKeys(context) {
  const keys = {
    siteKey: context.env.TURNSTILE_SITE_KEY,
    secretKey: context.env.TURNSTILE_SECRET_KEY,
  };
  console.log(`Turnstile Keys: ${JSON.stringify(keys)}`);
  return new Response(JSON.stringify(keys), {
    headers: { 'Content-Type': 'application/json' } // 设置响应头为 JSON 格式
  });
}
