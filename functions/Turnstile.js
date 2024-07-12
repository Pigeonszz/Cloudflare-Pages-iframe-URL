// onRequest 函数处理来自客户端的请求
export async function onRequest(context) {
  // 从环境变量中获取 TURNSTILE_SITE_KEY、TURNSTILE_SECRET_KEY 和 TURNSTILE_ENABLED 的值
  const keys = {
    siteKey: context.env.TURNSTILE_SITE_KEY,
    secretKey: context.env.TURNSTILE_SECRET_KEY,
  };
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED || 'false';

  // 返回 JSON 格式的响应，包含 TURNSTILE_SITE_KEY、TURNSTILE_SECRET_KEY 和 TURNSTILE_ENABLED 的值
  return new Response(JSON.stringify({ ...keys, TURNSTILE_ENABLED }), {
    headers: { 'Content-Type': 'application/json' },
  });
}