// onRequest 函数处理来自客户端的请求
export async function onRequest(context) {
  // 获取 IFRAME_URL 环境变量
  const iframeUrl = context.env.IFRAME_URL;

  // 将环境变量值按逗号分隔并转换为数组
  const urls = iframeUrl.split(',');

  // 创建一个 JSON 响应，包含格式化的数组
  const jsonResponse = JSON.stringify({ urls });

  // 返回 JSON 响应
  return new Response(jsonResponse, {
    headers: { 'Content-Type': 'application/json' }
  });
}
