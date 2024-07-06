// 监听请求
export async function onRequest(event) {
  // 从 Cloudflare 环境变量中读取 SITE_TITLE
  const siteTitle = await getEnvVariable('SITE_TITLE');

  // 构建 JSON 响应体
  const responseBody = {
    siteTitle: siteTitle || 'Main Content'
  };

  // 返回 JSON 格式的响应
  return new Response(JSON.stringify(responseBody), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// 获取 Cloudflare 环境变量的值
async function getEnvVariable(name) {
  const envResponse = await fetch(`https://cloudflareworkers.com/env/${name}`);
  const { value } = await envResponse.json();
  return value;
}
