export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  if (pathname === '/Turnstile') {
    // 处理 /Turnstile 请求
    const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED || 'false';
    return new Response(
      JSON.stringify({ TURNSTILE_ENABLED }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } else if (pathname === '/iframe-url') {
    // 处理 /iframe-url 请求
    return new Response(context.env.IFRAME_URL, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } else if (pathname === '/turnstile-keys') {
    // 处理 /turnstile-keys 请求
    const keys = {
      siteKey: context.env.TURNSTILE_SITE_KEY,
      secretKey: context.env.TURNSTILE_SECRET_KEY,
    };
    return new Response(JSON.stringify(keys), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    // 对于其他路径，返回 404
    return new Response('Not Found', { status: 404 });
  }
}
