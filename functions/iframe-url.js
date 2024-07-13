export async function onRequest(context) {
  const IFRAME_URL = context.env.IFRAME_URL;
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED === 'true';
  const TURNSTILE_SECRET_KEY = context.env.TURNSTILE_SECRET_KEY;
  const turnstileToken = context.request.headers.get('Authorization')?.split(' ')[1];

  if (TURNSTILE_ENABLED) {
    if (!turnstileToken) {
      return new Response(JSON.stringify({ error: 'Token missing.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `secret=${TURNSTILE_SECRET_KEY}&response=${turnstileToken}`
    });

    const verificationResult = await verificationResponse.json();

    if (!verificationResult.success) {
      return new Response(JSON.stringify({ error: 'Verification failed.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
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