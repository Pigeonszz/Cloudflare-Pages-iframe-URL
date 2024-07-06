export async function onRequest(context) {
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED || 'false';

  return new Response(
    JSON.stringify({ TURNSTILE_ENABLED }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
