export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (path === '/Turnstile') {
    return handleTurnstile(context);
  } else if (path === '/getSiteTitle') {
    return handleGetSiteTitle(context);
  } else if (path === '/iframe-url') {
    return handleIframeUrl(context);
  } else if (path === '/turnstile-keys') {
    return handleTurnstileKeys(context);
  } else {
    return new Response('Not Found', { status: 404 });
  }
}

async function handleTurnstile(context) {
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED || 'false';
  return new Response(
    JSON.stringify({ TURNSTILE_ENABLED }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

async function handleGetSiteTitle(context) {
  return new Response(context.env.SITE_TITLE, {
    headers: { 'Content-Type': 'text/plain' }
  });
}

async function handleIframeUrl(context) {
  return new Response(context.env.IFRAME_URL, {
    headers: { 'Content-Type': 'text/plain' }
  });
}

async function handleTurnstileKeys(context) {
  const keys = {
    siteKey: context.env.TURNSTILE_SITE_KEY,
    secretKey: context.env.TURNSTILE_SECRET_KEY,
  };
  return new Response(JSON.stringify(keys), {
    headers: { 'Content-Type': 'application/json' },
  });
}
