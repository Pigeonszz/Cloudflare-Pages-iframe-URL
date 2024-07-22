// /functions/api/env.js
"use strict";

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

async function getEnvValue(key, context) {
  // 从环境变量中获取
  if (context.env[key] !== undefined) {
    return context.env[key];
  }

  // 从 D1 数据库中获取
  if (context.env.D1 !== undefined) {
    const d1Value = await context.env.D1.prepare('SELECT value FROM env WHERE key = ?').bind(key).first();
    if (d1Value && d1Value.value !== undefined) {
      return d1Value.value;
    }
  }

  // 从 KV 中获取
  if (context.env.KV !== undefined) {
    const kvValue = await context.env.KV.get(key);
    if (kvValue !== null) {
      return kvValue;
    }
  }

  return undefined;
}

export async function onRequest(context) {
  // 检查请求路径是否为 /api/env
  const requestPath = new URL(context.request.url).pathname;
  if (requestPath.toLowerCase() !== '/api/env') {
    return new Response('Not Found', { status: 404 });
  }

  // 记录日志
  log('info', 'Processing request', context);

  // 从环境变量中获取 Turnstile 的站点密钥
  const siteKey = await getEnvValue('TURNSTILE_SITE_KEY', context);
  const keys = {
    siteKey: siteKey,
  };

  // 从环境变量中获取 Turnstile 是否启用的标志，默认为 'false'
  const TURNSTILE_ENABLED = await getEnvValue('TURNSTILE_ENABLED', context) || 'false';

  // 从环境变量中获取 LOG_LEVEL
  const LOG_LEVEL = await getEnvValue('LOG_LEVEL', context) || 'info';

  // 记录日志
  log('debug', `Turnstile enabled: ${TURNSTILE_ENABLED}`, context);
  log('debug', `Site key: ${keys.siteKey}`, context);
  log('debug', `Log level: ${LOG_LEVEL}`, context);

  // 记录请求头信息
  log('trace', `Request headers: ${JSON.stringify(context.request.headers)}`, context);

  // 记录请求方法和URL
  log('trace', `Request method and URL: ${context.request.method} ${context.request.url}`, context);

  // 返回一个 JSON 响应，包含站点密钥、Turnstile 启用状态和日志级别
  return new Response(JSON.stringify({ ...keys, TURNSTILE_ENABLED, LOG_LEVEL }), {
    headers: { 'Content-Type': 'application/json;charset=UTF-8' }, // 设置响应头为 JSON 类型
  });
}