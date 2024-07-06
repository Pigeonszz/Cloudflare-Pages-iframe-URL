// 添加事件监听器来处理请求
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    // 检查请求的路径是否为 /getSiteTitle
    if (new URL(request.url).pathname === '/getSiteTitle') {
      // 从 Cloudflare 环境变量中读取 SITE_TITLE
      const siteTitle = await getEnvVariable('SITE_TITLE')

      // 返回 SITE_TITLE 变量作为 JSON 格式
      return new Response(JSON.stringify({ siteTitle }), {
        headers: { 'Content-Type': 'application/json' },
      })
    } else {
      // 如果请求的路径不匹配 /getSiteTitle，返回 404 Not Found
      return new Response('Not Found', { status: 404 })
    }
  } catch (error) {
    console.error('Error handling request:', error)
    // 返回一个适当的错误响应
    return new Response(JSON.stringify({ error: 'Failed to handle request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// 获取 Cloudflare 环境变量的值
async function getEnvVariable(name) {
  const envResponse = await fetch(`https://cloudflareworkers.com/env/${name}`)
  if (!envResponse.ok) {
    throw new Error(`Failed to fetch environment variable ${name}: ${envResponse.status} ${envResponse.statusText}`)
  }
  const { value } = await envResponse.json()
  return value
}
