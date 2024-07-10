export async function onRequest(context) {
  // 获取环境变量 IFRAME_URL 和 FAVICON_URL
  const IFRAME_URL = context.env.IFRAME_URL;
  const FAVICON_URL = context.env.FAVICON_URL;

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

  // 如果环境变量 IFRAME_URL 和 FAVICON_URL 存在
  if (IFRAME_URL && FAVICON_URL) {
    // 将 IFRAME_URL 环境变量按照指定格式分割成数组
    const urls = IFRAME_URL.split(',').map(item => {
      const [url, service] = item.split(';'); // 按分号分割成 URL 和服务名称
      return { url, service }; // 返回对象包含 URL 和服务名称
    });

    // 将 FAVICON_URL 环境变量按照指定格式分割成数组
    const favicons = FAVICON_URL.split(',').map(item => {
      const [service, faviconUrl] = item.split(';'); // 按分号分割成服务名称和 favicon URL
      return { service, faviconUrl }; // 返回对象包含服务名称和 favicon URL
    });

    // 构建返回的 favicon 数组
    const faviconUrls = await Promise.all(urls.map(async urlObj => {
      const faviconObj = favicons.find(fav => fav.service === urlObj.service); // 查找匹配的 favicon 对象
      if (faviconObj) {
        const response = await fetch(faviconObj.faviconUrl);
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);
        return {
          service: urlObj.service,
          base64: base64 // 返回 base64 编码的 favicon
        };
      } else {
        return {
          service: urlObj.service,
          base64: '' // 如果没有匹配的 favicon 对象，则返回空字符串
        };
      }
    }));

    // 返回 JSON 格式的响应
    return new Response(JSON.stringify(faviconUrls), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    // 如果环境变量不存在，则返回空响应或错误信息
    return new Response(JSON.stringify({ error: 'Environment variables IFRAME_URL or FAVICON_URL not found.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 辅助函数：将 Blob 转换为 Base64
async function blobToBase64(blob) {
  const response = new Response(blob);
  const buffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
  return base64;
}