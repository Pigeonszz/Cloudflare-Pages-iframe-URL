// onRequest 函数处理来自客户端的请求
export async function onRequest(context) {
  // 获取环境变量 SITE_FAVICON
  const SITE_FAVICON = context.env.SITE_FAVICON;

  // 获取人机验证开关状态
  const turnstileEnabled = context.env.TURNSTILE_ENABLED === 'true';

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

  // 检查环境变量是否存在
  if (!SITE_FAVICON) {
    return new Response(JSON.stringify({ error: 'SITE_FAVICON environment variable not found.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 获取环境变量 IFRAME_URL
  const IFRAME_URL = context.env.IFRAME_URL;

  // 如果环境变量不存在
  if (!IFRAME_URL) {
    return new Response(JSON.stringify({ error: 'IFRAME_URL environment variable not found.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 将环境变量按照指定格式分割成数组
  const iframeUrls = IFRAME_URL.split(',').map(item => {
    const [url, service] = item.split(';'); // 按分号分割成 URL 和服务名称
    return { url, service }; // 返回对象包含 URL 和服务名称
  });

  // 将环境变量 SITE_FAVICON 按照指定格式分割成数组
  const faviconUrls = SITE_FAVICON.split(',').map(item => {
    const [url, favicon] = item.split(';'); // 按分号分割成 URL 和 Favicon URL
    return { url, favicon }; // 返回对象包含 URL 和 Favicon URL
  });

  // 创建一个空数组用于存储结果
  const results = [];

  // 遍历 iframeUrls 数组
  iframeUrls.forEach(iframeUrl => {
    // 查找对应的 favicon
    const faviconObj = faviconUrls.find(faviconUrl => faviconUrl.url === iframeUrl.url);

    // 如果找到对应的 favicon，则将其加入结果数组
    if (faviconObj) {
      results.push(`${iframeUrl.url};${faviconObj.favicon}`);
    }
  });

  // 返回 JSON 格式的响应
  return new Response(results.join(','), {
    headers: { 'Content-Type': 'application/json' }
  });
}
