export async function onRequest(context) {
  const keys = {
    siteKey: context.env.TURNSTILE_SITE_KEY,
  };
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED || 'false';

  return new Response(JSON.stringify({ ...keys, TURNSTILE_ENABLED }), {
    headers: { 'Content-Type': 'application/json' },
  });
}