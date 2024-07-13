export async function onRequest(context) {
  // 从环境变量中获取 Turnstile 的站点密钥
  const keys = {
    siteKey: context.env.TURNSTILE_SITE_KEY,
  };
  
  // 从环境变量中获取 Turnstile 是否启用的标志，默认为 'false'
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED || 'false';

  // 返回一个 JSON 响应，包含站点密钥和 Turnstile 启用状态
  return new Response(JSON.stringify({ ...keys, TURNSTILE_ENABLED }), {
    headers: { 'Content-Type': 'application/json' }, // 设置响应头为 JSON 类型
  });
}