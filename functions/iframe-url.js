// onRequest 函数处理来自客户端的请求
export async function onRequest(context) {
  // 返回包含 IFRAME_URL 环境变量值的纯文本响应
  return new Response(context.env.IFRAME_URL, {
    headers: { 'Content-Type': 'text/plain' }
  });
}
