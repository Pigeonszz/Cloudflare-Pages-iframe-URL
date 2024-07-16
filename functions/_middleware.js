export async function onRequest(context) {
    // 定义一个函数来生成早期提示
    function generateEarlyHints(routePath) {
        switch (routePath) {
            case '/custom':
                return [
                    ['link', '</custom-styles.css>; rel=preload; as=style'],
                    ['link', '</custom-script.js>; rel=preload; as=script']
                ];
            case '/favicon':
                return [
                    ['link', '</favicon.ico>; rel=preload; as=image']
                ];
            case '/iframe-url':
                return [
                    ['link', '</iframe-styles.css>; rel=preload; as=style'],
                    ['link', '</iframe-script.js>; rel=preload; as=script']
                ];
            case '/IP':
                return []; // 没有特定的资源需要预加载
            case '/Turnstile':
                return [
                    ['link', '</turnstile-styles.css>; rel=preload; as=style'],
                    ['link', '</turnstile-script.js>; rel=preload; as=script']
                ];
            case '/verify-turnstile':
                return [
                    ['link', '</verify-turnstile-styles.css>; rel=preload; as=style'],
                    ['link', '</verify-turnstile-script.js>; rel=preload; as=script']
                ];
            default:
                return [];
        }
    }

    // 获取当前请求的路径
    const routePath = new URL(context.request.url).pathname;

    // 生成早期提示
    const earlyHints = generateEarlyHints(routePath);

    // 等待下一个中间件或请求处理程序处理请求
    const response = await context.next();

    // 创建一个新的响应对象，使用原响应的主体和其他属性
    const earlyHintResponse = new Response(response.body, response);

    // 设置 Link 头部，包含所有早期提示资源的信息
    if (earlyHints.length > 0) {
        earlyHintResponse.headers.set('Link', earlyHints.map(([key, value]) => `${key}=${value}`).join(', '));
    }

    // 返回修改后的响应对象
    return earlyHintResponse;
}