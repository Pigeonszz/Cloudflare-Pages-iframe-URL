// /functions/custom.js

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
  const { env } = context;

  // 记录请求信息
  log('info', 'Processing request for custom scripts', context);

  const response = {
      M_POST_LOAD: env.M_POST_LOAD || '',
      M_PRELOAD: env.M_PRELOAD || '',
      POST_LOAD: env.POST_LOAD || '',
      PRELOAD: env.PRELOAD || '',
      LOG_LEVEL: env.LOG_LEVEL || 'info'
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