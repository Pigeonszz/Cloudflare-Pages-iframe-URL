import { onRequest as verifyTurnstile } from './verify-turnstile.js';

export async function onRequest(context) {
  // 从环境变量中获取 IFRAME_URL 和 TURNSTILE_ENABLED
  const IFRAME_URL = context.env.IFRAME_URL;
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED === 'true';

  // 如果 TURNSTILE_ENABLED 为 false，直接返回 IFRAME_URL
  if (!TURNSTILE_ENABLED) {
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

  // 解析请求体中的 JSON 数据
  const body = await context.request.json();

  // 从请求体中提取 token、uuid 和 ip
  const token = body.token;
  const uuid = body.uuid;
  const ip = body.ip;

  // 检查 token、uuid 和 ip 是否存在
  if (!token || !uuid || !ip) {
    return new Response(JSON.stringify({ error: 'Token, UUID, or IP missing.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 调用 verifyTurnstile 函数验证 token、uuid 和 ip
  const verificationResponse = await verifyTurnstile({
    ...context,
    request: new Request('https://dummy.url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, uuid, ip })
    })
  });

  // 解析验证结果
  const verificationResult = await verificationResponse.json();

  // 如果验证失败，返回错误信息
  if (!verificationResult.success) {
    return new Response(JSON.stringify({ error: verificationResult.error }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 如果 IFRAME_URL 存在，解析并返回 URL 列表
  if (IFRAME_URL) {
    const urls = IFRAME_URL.split(',').map(item => {
      const [url, service] = item.split(';');
      return { url, service };
    });

    return new Response(JSON.stringify(urls), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    // 如果 IFRAME_URL 环境变量不存在，返回错误信息
    return new Response(JSON.stringify({ error: 'IFRAME_URL environment variable not found.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}