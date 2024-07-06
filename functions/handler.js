// 返回 TURNSTILE_ENABLED 环境变量的值
export async function onTurnstileRequest(context) {
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED || 'false';

  return new Response(
    JSON.stringify({ TURNSTILE_ENABLED }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// 返回 iframe 的 URL
export async function onIframeUrlRequest(context) {
  return new Response(context.env.IFRAME_URL, {
    headers: { 'Content-Type': 'application/json' }
  });
}

// 返回 Turnstile 的 siteKey 和 secretKey
export async function onTurnstileKeysRequest(context) {
  const keys = {
    siteKey: context.env.TURNSTILE_SITE_KEY,
    secretKey: context.env.TURNSTILE_SECRET_KEY,
  };
  return new Response(JSON.stringify(keys), {
    headers: { 'Content-Type': 'application/json' },
  });
}
