// /functions/extra.js
import { onRequest as verifyTurnstile } from './verify-turnstile.js';

export async function onRequest(context) {
    // 获取环境变量
    const getEnvVar = (name) => context.env[name] || '';

    // 检查 URL 是否是 GitHub 的 URL
    function isGithubUrl(url) {
        const githubRegex = /^https?:\/\/(?:www\.)?(?:github\.com|gist\.github\.com|raw\.githubusercontent\.com)\/.*\/.*\/(?:raw|blob)\/.*\/.*$/;
        return githubRegex.test(url);
    }

    // 将 GitHub URL 转换为 jsDelivr URL
    function convertToJsdelivrUrl(githubUrl) {
        const jsdelivrUrl = githubUrl.replace(
            /^https?:\/\/(?:www\.)?(?:github\.com|gist\.github\.com|raw\.githubusercontent\.com)\/(.*?)\/(.*?)\/(?:raw|blob)\/(.*)$/,
            'https://cdn.jsdelivr.net/gh/$1/$2@$3'
        );
        return jsdelivrUrl;
    }

    // 处理用户输入的代码片段和URL
    function processUserInput(input) {
        const items = input.split(/[\n,;]+/).map(item => item.trim()).filter(item => item.length > 0);
        const result = [];

        for (const item of items) {
            if (isGithubUrl(item)) {
                result.push(convertToJsdelivrUrl(item));
            } else {
                result.push(item);
            }
        }

        return result.join('|||');
    }

    // 获取请求的来源
    const referer = context.request.headers.get('referer') || '';
    const isMobile = referer.includes('mobile.html');

    // 获取不同环境变量的值
    let mPreload = getEnvVar(isMobile ? 'M_PRELOAD' : 'PRELOAD');
    let mPostLoad = getEnvVar(isMobile ? 'M_POST_LOAD' : 'POST_LOAD');

    // 处理用户输入
    mPreload = processUserInput(mPreload);
    mPostLoad = processUserInput(mPostLoad);

    // 处理预加载和后加载
    async function processLoad(loadStr) {
        if (loadStr) {
            const items = loadStr.split('|||');
            const cssContents = [];
            const jsContents = [];

            for (const item of items) {
                const [css, js] = item.split('|').map(str => str.trim());
                if (css) {
                    const response = await fetch(css);
                    cssContents.push(await response.text());
                }
                if (js) {
                    const response = await fetch(js);
                    jsContents.push(await response.text());
                }
            }

            return { cssContents, jsContents };
        }
        return { cssContents: [], jsContents: [] };
    }

    // 获取 TURNSTILE_ENABLED 环境变量
    const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED === 'true';

    // 如果 TURNSTILE_ENABLED 为 false，直接处理并返回响应
    if (!TURNSTILE_ENABLED) {
        const { cssContents: preloadCssContents, jsContents: preloadJsContents } = await processLoad(mPreload);
        const { cssContents: postloadCssContents, jsContents: postloadJsContents } = await processLoad(mPostLoad);

        // 构建响应内容
        const responseContent = `
            ${preloadCssContents.map(css => `<style>${css}</style>`).join('\n')}
            ${preloadJsContents.map(js => `<script>${js}</script>`).join('\n')}
            ${postloadCssContents.map(css => `<style>${css}</style>`).join('\n')}
            ${postloadJsContents.map(js => `<script>${js}</script>`).join('\n')}
        `;

        // 返回响应
        return new Response(responseContent, {
            headers: { 'Content-Type': 'text/html' }
        });
    }

    // 解析请求体中的 JSON 数据
    const body = await context.request.json();

    // 从请求体中提取 token、uuid 和 ip
    const token = body.token;
    const uuid = body.uuid;
    const ip = body.ip;

    // 检查 token、uuid 和 ip 是否存在
    if (!token || !uuid || !ip) {
        return new Response(JSON.stringify({ error: 'Token, UUID, or IP missing.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 调用 verifyTurnstile 函数验证 token、uuid 和 ip
    const verificationResponse = await verifyTurnstile({
        ...context,
        request: new Request('https://dummy.url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, uuid, ip })
        })
    });

    // 解析验证结果
    const verificationResult = await verificationResponse.json();

    // 如果验证失败，返回错误信息
    if (!verificationResult.success) {
        return new Response(JSON.stringify({ error: verificationResult.error }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 处理并返回响应
    const { cssContents: preloadCssContents, jsContents: preloadJsContents } = await processLoad(mPreload);
    const { cssContents: postloadCssContents, jsContents: postloadJsContents } = await processLoad(mPostLoad);

    // 构建响应内容
    const responseContent = `
        ${preloadCssContents.map(css => `<style>${css}</style>`).join('\n')}
        ${preloadJsContents.map(js => `<script>${js}</script>`).join('\n')}
        ${postloadCssContents.map(css => `<style>${css}</style>`).join('\n')}
        ${postloadJsContents.map(js => `<script>${js}</script>`).join('\n')}
    `;

    // 返回响应
    return new Response(responseContent, {
        headers: { 'Content-Type': 'text/html' }
    });
}