export async function onRequest(request) {
  const url = new URL(request.url);

  if (url.pathname === '/Turnstile') {
    // 返回环境变量 TURNSTILE_ENABLED 的值
    const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED || 'false';
    return new Response(
      JSON.stringify({ TURNSTILE_ENABLED }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } else if (url.pathname === '/iframe-url') {
    // 返回环境变量 IFRAME_URL 的值
    return new Response(context.env.IFRAME_URL, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } else if (url.pathname === '/turnstile-keys') {
    // 返回 Turnstile 的 keys
    const keys = {
      siteKey: context.env.TURNSTILE_SITE_KEY,
      secretKey: context.env.TURNSTILE_SECRET_KEY,
    };
    return new Response(JSON.stringify(keys), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    // 处理未知请求路径
    return new Response('Not Found', { status: 404 });
  }
}
