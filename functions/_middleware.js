export async function onRequest(context) {
    // 定义一个包含早期提示的数组，这些提示告诉浏览器预加载资源
    const earlyHints = [
        ['link', '</styles.css>; rel=preload; as=style'],  // 预加载样式表
        ['link', '</script.js>; rel=preload; as=script']   // 预加载脚本文件
    ];

    // 等待获取下一个中间件或请求处理的响应
    const response = await context.next();
    
    // 创建一个新的响应对象，使用原响应的主体和其他属性
    const earlyHintResponse = new Response(response.body, response);
    
    // 设置 Link 头部，包含所有早期提示资源的信息
    earlyHintResponse.headers.set('Link', earlyHints.map(([key, value]) => `${key}=${value}`).join(', '));

    // 返回修改后的响应对象
    return earlyHintResponse;
}
