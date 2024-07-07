export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 根据请求路径处理不同的功能
  if (pathname === '/Turnstile') {
    const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED || 'false';
    return new Response(JSON.stringify({ TURNSTILE_ENABLED }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (pathname === '/getSiteTitle') {
    return new Response(context.env.SITE_TITLE, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } else if (pathname === '/iframe-url') {
    return new Response(context.env.IFRAME_URL, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } else if (pathname === '/turnstile-keys') {
    const keys = {
      siteKey: context.env.TURNSTILE_SITE_KEY,
      secretKey: context.env.TURNSTILE_SECRET_KEY,
    };
    return new Response(JSON.stringify(keys), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (pathname === '/' || pathname === '/index.html') {
    // 返回 index.html 文件的内容
    return fetch('https://test.cloudflare-pages-iframe-url.pages.dev/index.html');
  } else {
    // 返回 404 错误
    return new Response('Not Found', { status: 404 });
  }
}
