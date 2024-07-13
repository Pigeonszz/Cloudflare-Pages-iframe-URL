export async function onRequest(context) {
    const TURNSTILE_SECRET_KEY = context.env.TURNSTILE_SECRET_KEY;
    const body = await context.request.json();
    const token = body.token;
  
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token missing.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
    const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `secret=${TURNSTILE_SECRET_KEY}&response=${token}`
    });
  
    const verificationResult = await verificationResponse.json();
  
    if (verificationResult.success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ success: false, error: verificationResult['error-codes'] }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }