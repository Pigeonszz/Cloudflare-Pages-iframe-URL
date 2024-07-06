export async function onRequest(context) {
  const keys = {
    siteKey: context.env.TURNSTILE_SITE_KEY,
    secretKey: context.env.TURNSTILE_SECRET_KEY,
  };
  return new Response(JSON.stringify(keys), {
    headers: { 'Content-Type': 'application/json' },
  });
}
