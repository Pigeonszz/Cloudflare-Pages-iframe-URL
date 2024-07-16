import { onRequest as verifyTurnstile } from './verify-turnstile.js';

// 定义日志级别映射
const LOG_LEVEL_MAP = {
  'off': 0,
  'fatal': 1,
  'error': 2,
  'warn': 3,
  'info': 4,
  'debug': 5,
  'trace': 6
};

// 获取日志级别
function getLogLevel(env) {
  const logLevel = env.LOG_LEVEL || 'info';
  return LOG_LEVEL_MAP[logLevel] || LOG_LEVEL_MAP['info'];
}

// 日志记录函数
function log(level, message, context) {
  const logLevel = getLogLevel(context.env);
  if (LOG_LEVEL_MAP[level] <= logLevel) {
    console[level](message);
  }
}

export async function onRequest(context) {
  // 记录日志
  log('info', 'Processing request', context);

  // 从环境变量中获取 IFRAME_URL、FAVICON_URL 和 TURNSTILE_ENABLED
  const IFRAME_URL = context.env.IFRAME_URL;
  const FAVICON_URL = context.env.FAVICON_URL;
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED === 'true';
  const LOG_LEVEL = context.env.LOG_LEVEL || 'info';

  // 如果 TURNSTILE_ENABLED 为 false，直接返回 FAVICON_URL
  if (!TURNSTILE_ENABLED) {
    log('debug', 'TURNSTILE_ENABLED is false, skipping verification', context);
    if (FAVICON_URL) {
      log('debug', 'FAVICON_URL found, processing favicons', context);
      const favicons = FAVICON_URL.split(',').map(item => {
        const [service, faviconUrl] = item.split(';');
        return { service, faviconUrl };
      });

      const faviconUrls = await Promise.all(favicons.map(async faviconObj => {
        let faviconUrl = faviconObj.faviconUrl;
        if (isGithubUrl(faviconUrl)) {
          faviconUrl = convertToJsdelivrUrl(faviconUrl);
          log('debug', `Converted GitHub URL to jsDelivr URL: ${faviconUrl}`, context);
        }
        try {
          log('debug', `Fetching favicon from URL: ${faviconUrl}`, context);
          const response = await fetch(faviconUrl);
          if (!response.ok) throw new Error('Failed to fetch favicon');
          const blob = await response.blob();
          const base64 = await blobToBase64(blob);
          const contentType = response.headers.get('content-type');
          log('debug', `Favicon fetched successfully for service ${faviconObj.service}`, context);
          return {
            service: faviconObj.service,
            base64: base64,
            contentType: contentType
          };
        } catch (error) {
          log('error', `Failed to fetch favicon for service ${faviconObj.service}: ${error}`, context);
          return {
            service: faviconObj.service,
            base64: '',
            contentType: 'image/svg+xml'
          };
        }
      }));

      return new Response(JSON.stringify({ faviconUrls, LOG_LEVEL }), {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });
    } else {
      log('error', 'FAVICON_URL environment variable not found.', context);
      return new Response(JSON.stringify({ error: 'FAVICON_URL environment variable not found.', LOG_LEVEL }), {
        status: 500,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });
    }
  }

  // 解析请求体中的 JSON 数据
  log('debug', 'Parsing request body', context);
  const body = await context.request.json();

  // 从请求体中提取 token、uuid 和 ip
  const token = body.token;
  const uuid = body.uuid;
  const ip = body.ip;

  // 检查 token、uuid 和 ip 是否存在
  if (!token || !uuid || !ip) {
    log('warn', 'Token, UUID, or IP missing.', context);
    return new Response(JSON.stringify({ error: 'Token, UUID, or IP missing.', LOG_LEVEL }), {
      status: 400,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    });
  }

  // 调用 verifyTurnstile 函数验证 token、uuid 和 ip
  log('debug', 'Verifying token, UUID, and IP', context);
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
    log('error', `Verification failed: ${verificationResult.error}`, context);
    return new Response(JSON.stringify({ error: verificationResult.error, LOG_LEVEL }), {
      status: 403,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    });
  }

  // 如果 IFRAME_URL 和 FAVICON_URL 存在，解析并返回 URL 列表和 favicon 信息
  if (IFRAME_URL && FAVICON_URL) {
    log('debug', 'IFRAME_URL and FAVICON_URL found, processing URLs and favicons', context);
    const urls = IFRAME_URL.split(',').map(item => {
      const [url, service] = item.split(';');
      return { url, service };
    });

    const favicons = FAVICON_URL.split(',').map(item => {
      const [service, faviconUrl] = item.split(';');
      return { service, faviconUrl };
    });

    const faviconUrls = await Promise.all(urls.map(async urlObj => {
      const faviconObj = favicons.find(fav => fav.service === urlObj.service);
      if (faviconObj) {
        let faviconUrl = faviconObj.faviconUrl;
        if (isGithubUrl(faviconUrl)) {
          faviconUrl = convertToJsdelivrUrl(faviconUrl);
          log('debug', `Converted GitHub URL to jsDelivr URL: ${faviconUrl}`, context);
        }
        try {
          log('debug', `Fetching favicon from URL: ${faviconUrl}`, context);
          const response = await fetch(faviconUrl);
          if (!response.ok) throw new Error('Failed to fetch favicon');
          const blob = await response.blob();
          const base64 = await blobToBase64(blob);
          const contentType = response.headers.get('content-type');
          log('debug', `Favicon fetched successfully for service ${urlObj.service}`, context);
          return {
            service: urlObj.service,
            base64: base64,
            contentType: contentType
          };
        } catch (error) {
          log('error', `Failed to fetch favicon for service ${urlObj.service}: ${error}`, context);
          return {
            service: urlObj.service,
            base64: '',
            contentType: 'image/svg+xml'
          };
        }
      } else {
        log('warn', `Favicon not found for service ${urlObj.service}`, context);
        return {
          service: urlObj.service,
          base64: '',
          contentType: 'image/svg+xml'
        };
      }
    }));

    return new Response(JSON.stringify({ faviconUrls, LOG_LEVEL }), {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    });
  } else {
    // 如果 IFRAME_URL 或 FAVICON_URL 环境变量不存在，返回错误信息
    log('error', 'Environment variables IFRAME_URL or FAVICON_URL not found.', context);
    return new Response(JSON.stringify({ error: 'Environment variables IFRAME_URL or FAVICON_URL not found.', LOG_LEVEL }), {
      status: 500,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    });
  }
}

// 将 Blob 对象转换为 Base64 编码的字符串
async function blobToBase64(blob) {
  const response = new Response(blob);
  const buffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
  return base64;
}

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
