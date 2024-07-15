// functions/custom.js

// 处理请求的主函数
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

    const envVariables = ['M_POST_LOAD', 'M_PRELOAD', 'POST_LOAD', 'PRELOAD'];
    const processedEnv = {};

    for (const variable of envVariables) {
        processedEnv[variable] = processEnvVariable(env[variable]);
    }

    const responseBody = JSON.stringify({
        M_POST_LOAD: separateJsCss(processedEnv.M_POST_LOAD),
        M_PRELOAD: separateJsCss(processedEnv.M_PRELOAD),
        POST_LOAD: separateJsCss(processedEnv.POST_LOAD),
        PRELOAD: separateJsCss(processedEnv.PRELOAD)
    }, null, 2);

    return new Response(responseBody, {
        headers: { 'content-type': 'application/json' },
    });
}

function processEnvVariable(variable) {
    if (!variable) return [];

    const parts = variable.split(/(?=https?:\/\/)|(?=<script)|(?=<style)|(?=<link)|(?=<!--)|(?=-->)|(?=\/\*)|(?=\*\/)|(?={)|(?=})|(?=\()|(?=\))|(?=\[)|(?=\])|(?=\|)|(?=;)|(?=,)|(?=:)|(?=\s)|(?=\n)/).filter(Boolean);
    return parts;
}

function separateJsCss(parts) {
    const js = [];
    const css = [];
    const other = [];

    let scriptBuffer = '';
    let inScript = false;

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
        } else if (part.startsWith('<style') || part.startsWith('<link')) {
            css.push(part);
        } else if (part.match(/^\s*\{.*\}\s*$/) || part.match(/^\s*;.*;\s*$/)) {
            css.push(part);
        } else {
            other.push(part);
        }
    });

    if (scriptBuffer) {
        js.push(scriptBuffer);
    }

    return {
        js: js.join(''),
        css: css.join(''),
        other: other.join('')
    };
}
