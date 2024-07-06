export async function onRequest(context) {
  return new Response(context.env.IFRAME_URL);
}
