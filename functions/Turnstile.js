// /functions/Turnstile.js

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

  // 从环境变量中获取 Turnstile 的站点密钥
  const keys = {
    siteKey: context.env.TURNSTILE_SITE_KEY,
  };
  
  // 从环境变量中获取 Turnstile 是否启用的标志，默认为 'false'
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED || 'false';

  // 记录日志
  log('debug', `Turnstile enabled: ${TURNSTILE_ENABLED}`, context);
  log('debug', `Site key: ${keys.siteKey}`, context);

  // 返回一个 JSON 响应，包含站点密钥和 Turnstile 启用状态
  return new Response(JSON.stringify({ ...keys, TURNSTILE_ENABLED }), {
    headers: { 'Content-Type': 'application/json' }, // 设置响应头为 JSON 类型
  });
}