// /functions/api/init.js
"use strict";

const LOG_LEVEL_MAP = {
  'off': 0,
  'fatal': 1,
  'error': 2,
  'warn': 3,
  'info': 4,
  'debug': 5,
  'trace': 6
};

function log(level, message, context) {
  const logLevel = context.env.LOG_LEVEL || 'info';
  const currentLogLevel = LOG_LEVEL_MAP[logLevel] || LOG_LEVEL_MAP['info'];
  if (LOG_LEVEL_MAP[level] <= currentLogLevel) {
    console[level](message);
  }
}

export async function onRequest(context) {
  const requestPath = new URL(context.request.url).pathname;
  if (requestPath.toLowerCase() !== '/api/init') {
    return new Response('Not Found', { status: 404 });
  }

  const envVars = context.env;
  const hasKVNamespace = envVars.KV !== undefined;
  const hasD1Database = envVars.D1 !== undefined;

  if (!hasKVNamespace) {
    log('warn', 'KV environment variable not found, skipping KV operations', context);
  }

  if (!hasD1Database) {
    log('warn', 'D1 environment variable not found, skipping D1 operations', context);
  }

  if (!hasKVNamespace && !hasD1Database) {
    return new Response(JSON.stringify({ error: 'No KV or D1 environment variables found' }), {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      status: 500,
    });
  }

  const db = envVars.D1;

  try {
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

    log('info', 'Checking captcha_token table', context);
    const tableCheckCaptchaToken = await db.prepare('SELECT name FROM sqlite_master WHERE type="table" AND name="captcha_token"').first();
    if (!tableCheckCaptchaToken) {
      log('info', 'Creating captcha_token table', context);
      await db.prepare('CREATE TABLE captcha_token (uuid TEXT PRIMARY KEY, token TEXT, timestamp INTEGER, ip TEXT)').run();
      log('info', 'captcha_token table created', context);
    }

    log('info', 'Checking env table', context);
    const tableCheckEnv = await db.prepare('SELECT name FROM sqlite_master WHERE type="table" AND name="env"').first();
    if (!tableCheckEnv) {
      log('info', 'Creating env table', context);
      await db.prepare('CREATE TABLE env (key TEXT PRIMARY KEY, value TEXT)').run();
      log('info', 'env table created', context);
    }

    // 再次检查 env 表是否成功创建
    log('info', 'Verifying env table creation', context);
    const tableCheckEnvConfirm = await db.prepare('SELECT name FROM sqlite_master WHERE type="table" AND name="env"').first();
    if (!tableCheckEnvConfirm) {
      throw new Error('Failed to create env table');
    }

    const kvNamespace = envVars.KV;

    for (const key in envVars) {
      if (key.startsWith('KV_') && hasKVNamespace) {
        await kvNamespace.put(key, envVars[key]);
        log('debug', `Stored ${key} in KV`, context);
      } else if (key.startsWith('D1_') && hasD1Database) {
        await db.prepare('INSERT OR REPLACE INTO env (key, value) VALUES (?, ?)').bind(key, envVars[key]).run();
        log('debug', `Stored ${key} in D1 env table`, context);
      }
    }

    if (hasKVNamespace) {
      await kvNamespace.put('initialized', 'true');
      log('info', 'Added initialized:true to KV', context);
    }

    if (hasD1Database) {
      await db.prepare('INSERT OR REPLACE INTO env (key, value) VALUES (?, ?)').bind('initialized', 'true').run();
      log('info', 'Added initialized:true to D1 env table', context);
    }

    return new Response(JSON.stringify({ message: 'Database and environment variables initialized successfully' }), {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      status: 200,
    });
  } catch (error) {
    log('error', `Error initializing: ${error.message}`, context);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      status: 500,
    });
  }
}
