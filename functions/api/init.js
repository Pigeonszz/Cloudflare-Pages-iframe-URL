"use strict";

// init.js

const LOG_LEVELS = {
  OFF: 0,
  FATAL: 1,
  ERROR: 2,
  WARN: 3,
  INFO: 4,
  DEBUG: 5,
  TRACE: 6
};

let logLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

function log(level, message) {
  if (LOG_LEVELS[level] <= logLevel) {
    console.log(`[${level}] ${message}`);
  }
}

async function initD1() {
  // 检查是否设置了 D1 环境变量
  if (!globalThis.D1_ENABLED) {
    log('INFO', 'D1 环境变量未设置，跳过初始化');
    return;
  }

  // 假设 D1 是环境提供的全局对象
  const { D1 } = globalThis;
  if (!D1) {
    throw new Error('D1 不可用');
  }

  // 检查是否已初始化
  const result = await D1.prepare('SELECT COUNT(*) AS count FROM environment_variables WHERE key = ?').bind('initialized').first();
  if (result && result.count > 0) {
    log('INFO', 'D1 数据库已初始化');
    return;
  }

  // 创建环境变量表
  await D1.exec(`
    CREATE TABLE IF NOT EXISTS environment_variables (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // 创建 CAPTCHA 表
  await D1.exec(`
    CREATE TABLE IF NOT EXISTS captcha (
      uuid TEXT PRIMARY KEY,
      timestamp INTEGER NOT NULL,
      ip TEXT NOT NULL
    )
  `);

  // 覆写以 D1_ 开头的环境变量到 D1 数据库
  const env = process.env;
  for (const key in env) {
    if (key.startsWith('D1_')) {
      const value = env[key];
      await D1.exec(`INSERT OR REPLACE INTO environment_variables (key, value) VALUES (?, ?)`, [key, value]);
    }
  }

  // 标记已初始化
  await D1.exec(`INSERT OR REPLACE INTO environment_variables (key, value) VALUES (?, ?)`, ['initialized', 'true']);
}

async function initKV() {
  // 检查是否设置了 KV 环境变量
  if (!globalThis.KV_ENABLED) {
    log('INFO', 'KV 环境变量未设置，跳过初始化');
    return;
  }

  // 假设 KV 是环境提供的全局对象
  const { KV } = globalThis;
  if (!KV) {
    throw new Error('KV 不可用');
  }

  // 检查是否已初始化
  const initialized = await KV.get('initialized');
  if (initialized) {
    log('INFO', 'KV 命名空间已初始化');
    return;
  }

  // 覆写以 KV_ 开头的环境变量到 KV 空间
  const env = process.env;
  for (const key in env) {
    if (key.startsWith('KV_')) {
      const value = env[key];
      const kvKey = `env:${key.substring(3)}`; // 去掉前缀 'KV_' 并添加 'env:'
      await KV.put(kvKey, value);
    }
  }

  // 标记已初始化
  await KV.put('initialized', 'true');
}

export async function onRequest(context) {
  // 检查请求路径是否为 /api/ip
  const requestPath = new URL(context.request.url).pathname;
  if (requestPath.toLowerCase() !== '/api/ip') {
    return new Response('Not Found', { status: 404 });
  }

  try {
    await initD1();
    await initKV();
    return new Response('D1 数据库和 KV 命名空间初始化成功', { status: 200 });
  } catch (error) {
    return new Response(`初始化失败: ${error.message}`, { status: 500 });
  }
}