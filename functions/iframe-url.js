export async function onRequest(context) {
  const IFRAME_URL = context.env.IFRAME_URL;
  const turnstileEnabled = context.env.TURNSTILE_ENABLED === 'true';
  const turnstileValidUntil = context.request.headers.get('turnstileValidUntil');
  const currentTime = new Date().getTime();

  if (turnstileEnabled && (!turnstileValidUntil || currentTime > parseInt(turnstileValidUntil))) {
    return new Response(JSON.stringify({ error: 'Verification required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (IFRAME_URL) {
    const urls = IFRAME_URL.split(',').map(item => {
      const [url, service] = item.split(';');
      return { url, service };
    });

    return new Response(JSON.stringify(urls), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    return new Response(JSON.stringify({ error: 'IFRAME_URL environment variable not found.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}