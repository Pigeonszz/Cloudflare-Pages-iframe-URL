import { onRequest as verifyTurnstile } from './verify-turnstile.js';

export default {
  async fetch(request, env, ctx) {
    // 从环境变量中获取 TURNSTILE_ENABLED
    const TURNSTILE_ENABLED = env.TURNSTILE_ENABLED === 'true';

    // 如果 TURNSTILE_ENABLED 为 false，直接返回脚本列表
    if (!TURNSTILE_ENABLED) {
      return new Response(JSON.stringify(getScripts(env)), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 解析请求体中的 JSON 数据
    const body = await request.json();

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
      ...ctx,
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

    // 返回脚本列表
    return new Response(JSON.stringify(getScripts(env)), {
      headers: { 'Content-Type': 'application/json' }
    });
  },
};

function getScripts(env) {
  // 从环境变量中获取脚本URL和名称
  const PRELOAD_SCRIPT = env.PRELOAD_SCRIPT;
  const M_PRELOAD_SCRIPT = env.M_PRELOAD_SCRIPT;
  const POST_LOAD_SCRIPT = env.POST_LOAD_SCRIPT;
  const M_POST_LOAD_SCRIPT = env.M_POST_LOAD_SCRIPT;

  // 解析脚本URL和名称
  function parseAndSortScripts(scriptString) {
    if (!scriptString) return [];
    return scriptString.split(',').map(script => {
      const [url, name] = script.split(';');
      return { url, name };
    }).sort((a, b) => a.url.localeCompare(b.url));
  }

  // 获取并排序所有脚本
  const preloadScripts = parseAndSortScripts(PRELOAD_SCRIPT);
  const mPreloadScripts = parseAndSortScripts(M_PRELOAD_SCRIPT);
  const postLoadScripts = parseAndSortScripts(POST_LOAD_SCRIPT);
  const mPostLoadScripts = parseAndSortScripts(M_POST_LOAD_SCRIPT);

  // 构建响应的JSON对象
  return {
    preloadScripts,
    mPreloadScripts,
    postLoadScripts,
    mPostLoadScripts
  };
}