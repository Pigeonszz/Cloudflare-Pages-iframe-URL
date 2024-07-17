// /functions/api/iframe-url.js
"use strict";

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
  // 检查请求方法是否为 POST
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 记录日志
  log('info', 'Processing request', context);

  // 从环境变量中获取 IFRAME_URL 和 TURNSTILE_ENABLED
  const IFRAME_URL = context.env.IFRAME_URL;
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED === 'true';
  const LOG_LEVEL = context.env.LOG_LEVEL || 'info';

  // 如果 TURNSTILE_ENABLED 为 false，直接返回 IFRAME_URL
  if (!TURNSTILE_ENABLED) {
    log('debug', 'TURNSTILE_ENABLED is false, skipping verification', context);
    if (IFRAME_URL) {
      log('debug', 'IFRAME_URL found, processing URLs', context);
      const urls = IFRAME_URL.split(',').map(item => {
        const [url, service] = item.split(';');
        return { url, service };
      });

      return new Response(JSON.stringify({ urls, LOG_LEVEL }), {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });
    } else {
      log('error', 'IFRAME_URL environment variable not found.', context);
      return new Response(JSON.stringify({ error: 'IFRAME_URL environment variable not found.', LOG_LEVEL }), {
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

  // 如果 IFRAME_URL 存在，解析并返回 URL 列表
  if (IFRAME_URL) {
    log('debug', 'IFRAME_URL found, processing URLs', context);
    const urls = IFRAME_URL.split(',').map(item => {
      const [url, service] = item.split(';');
      return { url, service };
    });

    return new Response(JSON.stringify({ urls, LOG_LEVEL }), {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    });
  } else {
    // 如果 IFRAME_URL 环境变量不存在，返回错误信息
    log('error', 'IFRAME_URL environment variable not found.', context);
    return new Response(JSON.stringify({ error: 'IFRAME_URL environment variable not found.', LOG_LEVEL }), {
      status: 500,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    });
  }
}