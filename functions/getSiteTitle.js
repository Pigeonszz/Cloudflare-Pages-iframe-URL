addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    // 从 Cloudflare 环境变量中读取 SITE_TITLE
    const siteTitle = await getEnvVariable('SITE_TITLE')

    // 返回 SITE_TITLE 变量作为 JSON 格式
    return new Response(JSON.stringify({ siteTitle }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching SITE_TITLE:', error)
    // 返回一个适当的错误响应
    return new Response(JSON.stringify({ error: 'Failed to fetch SITE_TITLE' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function getEnvVariable(name) {
  const envResponse = await fetch(`https://cloudflareworkers.com/env/${name}`)
  if (!envResponse.ok) {
    throw new Error(`Failed to fetch environment variable ${name}: ${envResponse.status} ${envResponse.statusText}`)
  }
  const { value } = await envResponse.json()
  return value
}
