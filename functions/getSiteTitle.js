addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 从 Cloudflare 环境变量中读取 SITE_TITLE
  const siteTitle = await getEnvVariable('SITE_TITLE')

  // 返回 SITE_TITLE 变量作为 JSON 格式
  return new Response(JSON.stringify({ siteTitle }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

async function getEnvVariable(name) {
  const envResponse = await fetch(`https://cloudflareworkers.com/env/${name}`)
  const { value } = await envResponse.json()
  return value
}
