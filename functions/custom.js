// functions/custom.js

// 处理请求的主函数
export async function onRequest(context) {
    const request = context.request; // 获取请求对象
    const url = new URL(request.url); // 解析请求的URL

    // 检查请求路径是否为 /custom
    if (url.pathname === '/custom') {
        return handleCustomRequest(context); // 处理自定义请求
    }

    // 如果不是 /custom 路径，返回 404 响应
    return new Response('Not Found', { status: 404 });
}

// 处理自定义请求的函数
async function handleCustomRequest(context) {
    const env = context.env; // 获取环境变量对象

    // 定义需要处理的环境变量名称
    const envVariables = ['M_POST_LOAD', 'M_PRELOAD', 'POST_LOAD', 'PRELOAD'];
    const processedEnv = {}; // 存储处理后的环境变量

    // 遍历并处理每个环境变量
    for (const variable of envVariables) {
        processedEnv[variable] = processEnvVariable(env[variable]);
    }

    // 构建 JSON 响应
    const responseBody = JSON.stringify({
        M_POST_LOAD: separateJsCss(processedEnv.M_POST_LOAD),
        M_PRELOAD: separateJsCss(processedEnv.M_PRELOAD),
        POST_LOAD: separateJsCss(processedEnv.POST_LOAD),
        PRELOAD: separateJsCss(processedEnv.PRELOAD)
    }, null, 2);

    // 返回 JSON 响应
    return new Response(responseBody, {
        headers: { 'content-type': 'application/json' },
    });
}

// 处理环境变量的函数
function processEnvVariable(variable) {
    if (!variable) return []; // 如果环境变量为空，返回空数组

    // 使用正则表达式分割包含 URL 和代码片段的字符串
    const parts = variable.split(/(?=https?:\/\/)|(?=<script)|(?=<style)|(?=<link)|(?=<!--)|(?=\/\*)|(?=\{)|(?=\()|(?=\[)|(?=\|)|(?=;)|(?=,)|(?=:)|(?=\s)|(?=\n)|(?=-->)|(?=\*\/)|(?=})|(?=\))|(?=\])|(?=\|)/).filter(Boolean);

    // 检测重复项并合并
    const uniqueParts = [];
    const seen = new Set();
    for (const part of parts) {
        if (!seen.has(part)) {
            seen.add(part);
            uniqueParts.push(part);
        }
    }

    return uniqueParts;
}

// 分离 JS、CSS 和其他资源的函数
function separateJsCss(parts) {
    const js = []; // 存储 JS 资源
    const css = []; // 存储 CSS 资源
    const other = []; // 存储其他资源

    let scriptBuffer = ''; // 用于缓存不完整的 <script> 标签
    let inScript = false; // 标记是否在处理 <script> 标签

    let styleBuffer = ''; // 用于缓存不完整的 <style> 标签
    let inStyle = false; // 标记是否在处理 <style> 标签

    // 遍历并分类每个部分
    parts.forEach(part => {
        if (part.startsWith('<script')) {
            if (inScript) {
                // 如果已经在处理 <script> 标签，说明之前的部分不完整，补全并添加到 js 数组
                js.push(scriptBuffer + '</script>');
                scriptBuffer = '';
            }
            inScript = true;
            scriptBuffer += part;
        } else if (inScript && part.endsWith('</script>')) {
            scriptBuffer += part;
            js.push(scriptBuffer);
            scriptBuffer = '';
            inScript = false;
        } else if (inScript) {
            scriptBuffer += part;
        } else if (part.startsWith('<style')) {
            if (inStyle) {
                // 如果已经在处理 <style> 标签，说明之前的部分不完整，补全并添加到 css 数组
                css.push(styleBuffer + '</style>');
                styleBuffer = '';
            }
            inStyle = true;
            styleBuffer += part;
        } else if (inStyle && part.endsWith('</style>')) {
            styleBuffer += part;
            css.push(styleBuffer);
            styleBuffer = '';
            inStyle = false;
        } else if (inStyle) {
            styleBuffer += part;
        } else if (part.startsWith('<!--') && part.endsWith('-->')) {
            other.push(part);
        } else if (part.match(/^\s*\(.*\)\s*$/) || part.match(/^\s*\[.*\]\s*$/) || part.match(/^\s*\|.*\|\s*$/) || part.match(/^\s*;.*;\s*$/) || part.match(/^\s*,.*,\s*$/)) {
            js.push(part);
        } else if (part.match(/^\s*:.*:\s*$/)) {
            css.push(part);
        } else if (part.match(/^https?:\/\/[^\s]+$/)) {
            // 如果部分是一个独立的URL，生成相应的标签
            if (part.match(/\.js$/)) {
                js.push(`<script src="${part}"></script>`);
            } else if (part.match(/\.css$/)) {
                css.push(`<link rel="stylesheet" href="${part}">`);
            } else {
                other.push(part);
            }
        } else {
            other.push(part);
        }
    });

    // 检查是否有未完成的 <script> 标签
    if (scriptBuffer) {
        js.push(scriptBuffer + '</script>'); // 自动补齐 </script> 标签
    }

    // 检查是否有未完成的 <style> 标签
    if (styleBuffer) {
        css.push(styleBuffer + '</style>'); // 自动补齐 </style> 标签
    }

    // 修复 JS 和 CSS 的语法错误
    const fixJsSyntax = (jsCode) => {
        // 修复缺少分号
        jsCode = jsCode.replace(/([^;}])\s*$/g, '$1;');
        // 修复括号不匹配
        jsCode = jsCode.replace(/\s*([{}])\s*/g, ' $1 ');
        // 修复引号不匹配
        jsCode = jsCode.replace(/(['"])(\s*[^'"]*)\1/g, '$1$2$1');
        return jsCode;
    };

    const fixCssSyntax = (cssCode) => {
        // 修复缺少分号
        cssCode = cssCode.replace(/([^;}])\s*$/g, '$1;');
        // 修复括号不匹配
        cssCode = cssCode.replace(/\s*([{}])\s*/g, ' $1 ');
        // 修复引号不匹配
        cssCode = cssCode.replace(/(['"])(\s*[^'"]*)\1/g, '$1$2$1');
        return cssCode;
    };

    const fixedJs = js.map(fixJsSyntax).join('\n');
    const fixedCss = css.map(fixCssSyntax).join('\n');

    // 返回分类后的资源
    return {
        js: fixedJs,
        css: fixedCss,
        other: other.join('\n')
    };
}