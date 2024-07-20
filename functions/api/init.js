"use strict";

// /functions/api/init.js

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
});

async function handleRequest(request) {
  const url = new URL(request.url);
  if (url.pathname === '/api/init') {
    try {
      await initD1();
      await initKV();
      return new Response('D1 数据库和 KV 命名空间初始化成功', { status: 200 });
    } catch (error) {
      return new Response(`初始化失败: ${error.message}`, { status: 500 });
    }
  } else {
    return new Response('未找到', { status: 404 });
  }
}

async function initD1() {
  // 检查是否设置了 D1 环境变量
  if (!globalThis.D1_ENABLED) {
    console.log('D1 环境变量未设置，跳过初始化');
    return;
  }

  // 假设 D1 是环境提供的全局对象
  const { D1 } = globalThis;
  if (!D1) {
    throw new Error('D1 不可用');
  }

  // 示例：如果表不存在则创建表
  await D1.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
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
      const tableName = key.substring(3); // 去掉前缀 'D1_'
      await D1.exec(`INSERT OR REPLACE INTO ${tableName} (key, value) VALUES (?, ?)`, [key, value]);
    }
  }
}

async function initKV() {
  // 检查是否设置了 KV 环境变量
  if (!globalThis.KV_ENABLED) {
    console.log('KV 环境变量未设置，跳过初始化');
    return;
  }

  // 假设 KV 是环境提供的全局对象
  const { KV } = globalThis;
  if (!KV) {
    throw new Error('KV 不可用');
  }

  // 示例：初始化一些键值对
  await KV.put('exampleKey', 'exampleValue');

  // 覆写以 KV_ 开头的环境变量到 KV 空间
  const env = process.env;
  for (const key in env) {
    if (key.startsWith('KV_')) {
      const value = env[key];
      const kvKey = key.substring(3); // 去掉前缀 'KV_'
      await KV.put(kvKey, value);
    }
  }
}