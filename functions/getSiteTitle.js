// onRequest 函数处理来自客户端的请求
export async function onRequest(context) {
  // 返回包含 SITE_TITLE 环境变量值的纯文本响应
  return new Response(context.env.SITE_TITLE, {
    headers: { 'Content-Type': 'text/plain' }
  });
}
