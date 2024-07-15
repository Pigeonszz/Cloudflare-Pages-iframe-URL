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
    return parts;
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
      } else {
        other.push(part);
      }
    });
  
    // 检查是否有未完成的 <script> 标签
    if (scriptBuffer) {
      js.push(scriptBuffer);
    }
  
    // 检查是否有未完成的 <style> 标签
    if (styleBuffer) {
      css.push(styleBuffer);
    }
  
    // 返回分类后的资源
    return {
      js: js.join(''),
      css: css.join(''),
      other: other.join('')
    };
  }
