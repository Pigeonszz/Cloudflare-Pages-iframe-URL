export async function onRequest(context) {
  const turnstileEnabled = context.env.TURNSTILE_ENABLED || 'false';

  return new Response(
    JSON.stringify({ TURNSTILE_ENABLED: turnstileEnabled }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
