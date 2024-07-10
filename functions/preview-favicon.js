// /functions/preview-favicon.js

export async function onRequest(context) {
  // 获取环境变量 FAVICON_URL
  const FAVICON_URL = context.env.FAVICON_URL;

  // 获取人机验证开关状态
  const turnstileEnabled = true; // 在 Cloudflare Pages 环境中已设置为 true

  // 检查请求头中是否有验证状态
  const turnstileValidUntil = context.request.headers.get('turnstileValidUntil');
  const currentTime = new Date().getTime();

  // 如果启用了人机验证且验证状态不存在或已过期，则返回错误响应
  if (turnstileEnabled && (!turnstileValidUntil || currentTime > parseInt(turnstileValidUntil))) {
    return new Response(JSON.stringify({ error: 'Verification required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 如果环境变量 FAVICON_URL 存在
  if (FAVICON_URL) {
    // 将 FAVICON_URL 环境变量按照指定格式分割成数组
    const favicons = FAVICON_URL.split(',').map(item => {
      const [service, faviconUrl] = item.split(';'); // 按分号分割成服务名称和 favicon URL
      return { service, faviconUrl }; // 返回对象包含服务名称和 favicon URL
    });

    // 返回 JSON 格式的响应
    return new Response(JSON.stringify(favicons), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    // 如果环境变量不存在，则返回空响应或错误信息
    return new Response(JSON.stringify({ error: 'Environment variable FAVICON_URL not found.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}