// onRequest 函数处理来自客户端的请求
export async function onRequest(context) {
  // 获取环境变量 IFRAME_URL
  const IFRAME_URL = context.env.IFRAME_URL;

  // 如果环境变量存在
  if (IFRAME_URL) {
    // 将环境变量按照指定格式分割成数组
    const urls = IFRAME_URL.split(',').map(item => {
      const [url, service] = item.split(';'); // 按分号分割成 URL 和服务名称
      return { url, service }; // 返回对象包含 URL 和服务名称
    });

    // 返回 JSON 格式的响应
    return new Response(JSON.stringify(urls), {
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
