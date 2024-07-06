export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === '/Turnstile') {
    const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED || 'false';
    return new Response(
      JSON.stringify({ TURNSTILE_ENABLED }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } else if (pathname === '/iframe-url') {
    return new Response(context.env.IFRAME_URL, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } else if (pathname === '/turnstile-keys') {
    const keys = {
      siteKey: context.env.TURNSTILE_SITE_KEY,
      secretKey: context.env.TURNSTILE_SECRET_KEY,
    };
    return new Response(JSON.stringify(keys), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    return new Response('Not Found', { status: 404 });
  }
}
