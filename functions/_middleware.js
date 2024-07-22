// /functions/_middleware.js

export async function onRequest(context) {
    const { request, env } = context;
  
    // 获取安全入口环境变量
    const secureEntry = env.SECURE_ENTRY;
  
    // 如果没有设置安全入口环境变量，直接继续处理请求
    if (!secureEntry) {
      return await context.next();
    }
  
    // 获取请求路径
    const url = new URL(request.url);
    const requestPath = url.pathname;
  
    // 检查请求路径是否匹配安全入口
    if (requestPath.startsWith(secureEntry)) {
      return await context.next();
    } else {
      // 如果不匹配安全入口，返回 404 404 Not found
      return new Response('404 Not found', { status: 404 });
    }
  }