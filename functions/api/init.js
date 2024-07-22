// /functions/api/init.js
"use strict";

// 日志级别映射
const LOG_LEVEL_MAP = {
  'off': 0,
  'fatal': 1,
  'error': 2,
  'warn': 3,
  'info': 4,
  'debug': 5,
  'trace': 6
};

// 日志记录函数
function log(level, message, context) {
  const logLevel = context.env.LOG_LEVEL || 'info';
  const currentLogLevel = LOG_LEVEL_MAP[logLevel] || LOG_LEVEL_MAP['info'];
  if (LOG_LEVEL_MAP[level] <= currentLogLevel) {
    console[level](message);
  }
}

// onRequest函数是Cloudflare Worker的入口点
export async function onRequest(context) {
  // 检查请求路径是否为 /api/init
  const requestPath = new URL(context.request.url).pathname;
  if (requestPath.toLowerCase() !== '/api/init') {
    return new Response('Not Found', { status: 404 });
  }

  // 获取环境变量
  const envVars = context.env;

  // 检查是否有 KV 或 D1 环境变量
  const hasKVNamespace = envVars.KV !== undefined;
  const hasD1Database = envVars.D1 !== undefined;

  if (!hasKVNamespace) {
    log('warn', 'KV environment variable not found, skipping KV operations', context);
  }

  if (!hasD1Database) {
    log('warn', 'D1 environment variable not found, skipping D1 operations', context);
  }

  // 如果没有任何环境变量，返回错误响应
  if (!hasKVNamespace && !hasD1Database) {
    return new Response(JSON.stringify({ error: 'No KV or D1 environment variables found' }), {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      status: 500,
    });
  }

  // 获取数据库实例
  const db = envVars.D1;

  try {
    // 先创建表，以避免 SQL 错误
    // 检查并创建 captcha_token 表
    const tableCheckCaptchaToken = await db.prepare('SELECT name FROM sqlite_master WHERE type="table" AND name="captcha_token"').first();
    if (!tableCheckCaptchaToken) {
      await db.prepare('CREATE TABLE captcha_token (uuid TEXT PRIMARY KEY, token TEXT, timestamp INTEGER, ip TEXT)').run();
      log('info', 'captcha_token table created', context);
    }

    // 检查并创建 env 表
    const tableCheckEnv = await db.prepare('SELECT name FROM sqlite_master WHERE type="table" AND name="env"').first();
    if (!tableCheckEnv) {
      await db.prepare('CREATE TABLE env (key TEXT PRIMARY KEY, value TEXT)').run();
      log('info', 'env table created', context);
    }

    // 检查是否已经初始化
    let isInitialized = false;

    if (hasKVNamespace) {
      const kvInitialized = await envVars.KV.get('initialized');
      if (kvInitialized === 'true') {
        isInitialized = true;
        log('info', 'KV already initialized', context);
      }
    }

    if (hasD1Database) {
      const d1Initialized = await db.prepare('SELECT value FROM env WHERE key = ?').bind('initialized').first();
      if (d1Initialized && d1Initialized.value === 'true') {
        isInitialized = true;
        log('info', 'D1 already initialized', context);
      }
    }

    if (isInitialized) {
      return new Response(JSON.stringify({ message: 'Already initialized' }), {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        status: 200,
      });
    }

    // 获取 KV 和 D1 数据库实例
    const kvNamespace = envVars.KV;

    // 遍历环境变量并将以 KV_ 和 D1_ 开头的环境变量存入相应的数据库
    for (const key in envVars) {
      if (key.startsWith('KV_') && hasKVNamespace) {
        await kvNamespace.put(key, envVars[key]);
        log('debug', `Stored ${key} in KV`, context);
      } else if (key.startsWith('D1_') && hasD1Database) {
        // 将环境变量存入 env 表
        await db.prepare('INSERT OR REPLACE INTO env (key, value) VALUES (?, ?)').bind(key, envVars[key]).run();
        log('debug', `Stored ${key} in D1 env table`, context);
      }
    }

    // 在 KV 和 D1 的 env 表中添加 initialized:true
    if (hasKVNamespace) {
      await kvNamespace.put('initialized', 'true');
      log('info', 'Added initialized:true to KV', context);
    }

    if (hasD1Database) {
      await db.prepare('INSERT OR REPLACE INTO env (key, value) VALUES (?, ?)').bind('initialized', 'true').run();
      log('info', 'Added initialized:true to D1 env table', context);
    }

    // 返回成功响应
    return new Response(JSON.stringify({ message: 'Database and environment variables initialized successfully' }), {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      status: 200,
    });
  } catch (error) {
    log('error', `Error initializing: ${error.message}`, context);
    // 返回错误响应
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      status: 500,
    });
  }
}
