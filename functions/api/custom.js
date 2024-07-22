// /functions/api/custom.js
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
    try {
      const d1Value = await context.env.D1.prepare('SELECT value FROM env WHERE key = ?').bind(`D1_${key}`).first();
      if (d1Value && d1Value.value !== undefined) {
        return d1Value.value;
      }
    } catch (error) {
      log('error', `Error fetching from D1: ${error.message}`, context);
      // 可以返回默认值或抛出错误
      throw error;
    }
  }

  // 从 KV 中获取
  if (context.env.KV !== undefined) {
    try {
      const kvValue = await context.env.KV.get(`KV_${key}`);
      if (kvValue !== null) {
        return kvValue;
      }
    } catch (error) {
      log('error', `Error fetching from KV: ${error.message}`, context);
      // 可以返回默认值或抛出错误
      throw error;
    }
  }

  return undefined;
}

export async function onRequest(context) {
  const { env } = context;

  // 记录请求信息
  log('info', 'Processing request for custom scripts', context);

  const response = {
    M_POST_LOAD: await getEnvValue('M_POST_LOAD', context) || '',
    M_PRELOAD: await getEnvValue('M_PRELOAD', context) || '',
    POST_LOAD: await getEnvValue('POST_LOAD', context) || '',
    PRELOAD: await getEnvValue('PRELOAD', context) || '',
    LOG_LEVEL: await getEnvValue('LOG_LEVEL', context) || 'info'
  };

  // 记录响应信息
  log('debug', `Response: ${JSON.stringify(response)}`, context);

  // 记录环境变量信息
  log('trace', `Environment variables: ${JSON.stringify(env)}`, context);

  // 记录请求头信息
  log('trace', `Request headers: ${JSON.stringify(context.request.headers)}`, context);

  // 记录请求方法和URL
  log('trace', `Request method and URL: ${context.request.method} ${context.request.url}`, context);

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json;charset=UTF-8' }
  });
}