// /functions/favicon.js 文件

// onRequest 函数处理来自客户端的请求
export async function onRequest(context) {
  // 获取环境变量 IFRAME_URL
  const IFRAME_URL = context.env.IFRAME_URL;

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

  // 如果环境变量存在
  if (IFRAME_URL) {
    // 将环境变量按照指定格式分割成数组
    const urls = IFRAME_URL.split(',').map(item => {
      const [url, service] = item.split(';'); // 按分号分割成 URL 和服务名称
      return { url, service }; // 返回对象包含 URL 和服务名称
    });

    // 获取 SITE_FAVICON 环境变量并解析
    const siteFavicons = context.env.SITE_FAVICON ? context.env.SITE_FAVICON.split(',').map(item => {
      const [service, faviconUrl] = item.split(';'); // 按分号分割成服务名称和 favicon URL
      return { service, faviconUrl }; // 返回对象包含服务名称和 favicon URL
    }) : [];

    // 构建返回的 favicon 数组
    const faviconUrls = urls.map(urlObj => {
      const faviconObj = siteFavicons.find(fav => fav.service === urlObj.service); // 查找匹配的 favicon 对象
      return {
        url: urlObj.url,
        favicon: faviconObj ? faviconObj.faviconUrl : '/favicon.svg' // 如果没有匹配的 favicon 对象，则使用默认的 /favicon.svg
      };
    });

    // 返回 JSON 格式的响应
    return new Response(JSON.stringify(faviconUrls), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    // 如果环境变量不存在，则返回空响应或错误信息，视情况而定
    return new Response(JSON.stringify({ error: 'IFRAME_URL environment variable not found.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
