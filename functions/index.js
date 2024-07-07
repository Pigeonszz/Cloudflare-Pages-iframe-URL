export async function onRequest(context) {
  // 获取请求的URL对象
  const url = new URL(context.request.url);
  // 获取请求路径
  const path = url.pathname;

  // 根据请求路径调用相应的处理函数
  if (path === '/Turnstile') {
    return handleTurnstile(context);
  } else if (path === '/getSiteTitle') {
    return handleGetSiteTitle(context);
  } else if (path === '/iframe-url') {
    return handleIframeUrl(context);
  } else if (path === '/turnstile-keys') {
    return handleTurnstileKeys(context);
  }
}

/**
 * 处理 /Turnstile 请求，返回 Turnstile 验证的启用状态
 * @param {object} context - 请求上下文对象
 * @returns {Response} 包含 Turnstile 验证启用状态的响应
 */
async function handleTurnstile(context) {
  // 从环境变量中读取 TURNSTILE_ENABLED 的值
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED || 'false';
  // 返回包含 TURNSTILE_ENABLED 的 JSON 响应
  return new Response(
    JSON.stringify({ TURNSTILE_ENABLED }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * 处理 /getSiteTitle 请求，返回站点标题
 * @param {object} context - 请求上下文对象
 * @returns {Response} 包含站点标题的响应
 */
async function handleGetSiteTitle(context) {
  // 从环境变量中读取 SITE_TITLE 的值并返回
  return new Response(context.env.SITE_TITLE, {
    headers: { 'Content-Type': 'text/plain' }
  });
}

/**
 * 处理 /iframe-url 请求，返回 iframe 的 URL
 * @param {object} context - 请求上下文对象
 * @returns {Response} 包含 iframe URL 的响应
 */
async function handleIframeUrl(context) {
  // 从环境变量中读取 IFRAME_URL 的值并返回
  return new Response(context.env.IFRAME_URL, {
    headers: { 'Content-Type': 'text/plain' }
  });
}

/**
 * 处理 /turnstile-keys 请求，返回 Turnstile 的 siteKey 和 secretKey
 * @param {object} context - 请求上下文对象
 * @returns {Response} 包含 Turnstile keys 的响应
 */
async function handleTurnstileKeys(context) {
  // 从环境变量中读取 Turnstile 的 siteKey 和 secretKey
  const keys = {
    siteKey: context.env.TURNSTILE_SITE_KEY,
    secretKey: context.env.TURNSTILE_SECRET_KEY,
  };
  // 返回包含 siteKey 和 secretKey 的 JSON 响应
  return new Response(JSON.stringify(keys), {
    headers: { 'Content-Type': 'application/json' },
  });
}
