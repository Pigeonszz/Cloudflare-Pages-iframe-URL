// 监听请求
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// 处理请求
async function handleRequest(request) {
  // 从 Cloudflare 环境变量中读取 SITE_TITLE
  const siteTitle = await getEnvVariable('SITE_TITLE');

  // 如果是 /getSiteTitle 路径请求，返回 SITE_TITLE 的 JSON 格式
  if (new URL(request.url).pathname === '/getSiteTitle') {
    return new Response(JSON.stringify({ siteTitle }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 默认情况下返回 SITE_TITLE 的纯文本值
  return new Response(siteTitle || 'Main Content', {
    headers: { 'Content-Type': 'text/plain' },
  });
}

// 获取 Cloudflare 环境变量的值
async function getEnvVariable(name) {
  const envResponse = await fetch(`https://cloudflareworkers.com/env/${name}`);
  const { value } = await envResponse.json();
  return value;
}
