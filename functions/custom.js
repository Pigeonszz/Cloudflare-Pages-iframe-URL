export async function onRequest(context) {
    const request = context.request;
    const url = new URL(request.url);

    if (url.pathname === '/custom') {
        return handleCustomRequest(context);
    }

    return new Response('Not Found', { status: 404 });
}

async function handleCustomRequest(context) {
    const env = context.env;

    // 读取环境变量
    const M_POST_LOAD = processEnvVariable(env.M_POST_LOAD);
    const M_PRELOAD = processEnvVariable(env.M_PRELOAD);
    const POST_LOAD = processEnvVariable(env.POST_LOAD);
    const PRELOAD = processEnvVariable(env.PRELOAD);

    // 构建 JSON 响应
    const responseBody = JSON.stringify({
        M_POST_LOAD: separateJsCss(M_POST_LOAD),
        M_PRELOAD: separateJsCss(M_PRELOAD),
        POST_LOAD: separateJsCss(POST_LOAD),
        PRELOAD: separateJsCss(PRELOAD)
    }, null, 2);

    return new Response(responseBody, {
        headers: { 'content-type': 'application/json' },
    });
}

function processEnvVariable(variable) {
    if (!variable) return [];

    // 使用正则表达式分割包含 URL 的字符串
    const parts = variable.split(/(?=https?:\/\/)|(?=<script)|(?=<style)/).filter(Boolean);
    return parts;
}

function separateJsCss(parts) {
    const js = [];
    const css = [];
    const other = [];

    parts.forEach(part => {
        if (part.startsWith('http') || part.match(/\.js$/)) {
            // 处理 URL 和 JS 文件
            js.push(part.match(/^https?:\/\//) ? `<script src="${part}"></script>` : `<script src="${part}"></script>`);
        } else if (part.match(/\.css$/)) {
            // 处理 CSS 文件
            css.push(`<link rel="stylesheet" href="${part}">`);
        } else if (part.startsWith('<script')) {
            // 处理内联 JS
            js.push(part);
        } else if (part.startsWith('<style')) {
            // 处理内联 CSS
            css.push(part);
        } else {
            // 处理其他代码片段
            other.push(part);
        }
    });

    return {
        js: js.join(''),
        css: css.join(''),
        other: other.join('')
    };
}