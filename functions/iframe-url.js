import { onRequest as verifyTurnstile } from '/functions/verify-turnstile.js';

export async function onRequest(context) {
  const IFRAME_URL = context.env.IFRAME_URL;
  const body = await context.request.json();
  const token = body.token;
  const uuid = body.uuid;

  if (!token || !uuid) {
    return new Response(JSON.stringify({ error: 'Token or UUID missing.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const verificationResponse = await verifyTurnstile({
    ...context,
    request: new Request('https://dummy.url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, uuid })
    })
  });

  const verificationResult = await verificationResponse.json();

  if (!verificationResult.success) {
    return new Response(JSON.stringify({ error: verificationResult.error }), {
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