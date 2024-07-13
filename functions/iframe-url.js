import { onRequest as verifyTurnstile } from './verify-turnstile.js';

export async function onRequest(context) {
  // 从环境变量中获取 IFRAME_URL
  const IFRAME_URL = context.env.IFRAME_URL;
  
  // 解析请求体中的 JSON 数据
  const body = await context.request.json();
  
  // 从请求体中提取 token 和 uuid
  const token = body.token;
  const uuid = body.uuid;

  // 检查 token 和 uuid 是否存在
  if (!token || !uuid) {
    return new Response(JSON.stringify({ error: 'Token or UUID missing.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 调用 verifyTurnstile 函数验证 token 和 uuid
  const verificationResponse = await verifyTurnstile({
    ...context,
    request: new Request('https://dummy.url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, uuid })
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