export async function onRequest(context) {
    // 从环境变量中获取 Turnstile 的密钥
    const TURNSTILE_SECRET_KEY = context.env.TURNSTILE_SECRET_KEY;
    
    // 从环境变量中获取 Turnstile 的有效时间，默认为 4 小时（以秒为单位）
    const TURNSTILE_TIME = context.env.TURNSTILE_TIME || 14400;
    
    // 解析请求体中的 JSON 数据
    const body = await context.request.json();
    
    // 从请求体中提取 token、uuid 和 ip
    const token = body.token;
    const uuid = body.uuid;
    const ip = body.ip;

    // 检查 token、uuid 和 ip 是否存在
    if (!token || !uuid || !ip) {
        return new Response(JSON.stringify({ error: 'Token, UUID, or IP missing.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 使用 Cloudflare D1 数据库
    const db = context.env.D1;

    // 检查是否存在 uuid_store 表，若不存在则创建
    const tableCheck = await db.prepare('SELECT name FROM sqlite_master WHERE type="table" AND name="uuid_store"').first();
    if (!tableCheck) {
        await db.prepare('CREATE TABLE uuid_store (uuid TEXT PRIMARY KEY, timestamp INTEGER, ip TEXT)').run();
    }

    // 清理过期的 UUID 记录
    const currentTime = Math.floor(Date.now() / 1000);
    await db.prepare('DELETE FROM uuid_store WHERE timestamp < ?').bind(currentTime - TURNSTILE_TIME).run();

    // 检查 UUID 和 IP 是否有变化
    const storedResult = await db.prepare('SELECT timestamp, ip FROM uuid_store WHERE uuid = ?').bind(uuid).first();
    if (storedResult) {
        const storedTime = storedResult.timestamp;
        const storedIp = storedResult.ip;

        // 如果 UUID 和 IP 都没有变化，并且 UUID 没有过期
        if (storedIp === ip && currentTime - storedTime < TURNSTILE_TIME) {
            return new Response(JSON.stringify({ success: true }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // 向 Cloudflare Turnstile 验证服务发送验证请求
    const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `secret=${TURNSTILE_SECRET_KEY}&response=${token}&remoteip=${ip}`
    });

    // 解析验证结果
    const verificationResult = await verificationResponse.json();

    // 如果验证成功，存储 UUID 和当前时间以及IP地址
    if (verificationResult.success) {
        const currentTime = Math.floor(Date.now() / 1000);
        await db.prepare('INSERT OR REPLACE INTO uuid_store (uuid, timestamp, ip) VALUES (?, ?, ?)').bind(uuid, currentTime, ip).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } else {
        // 如果验证失败，返回错误信息
        return new Response(JSON.stringify({ success: false, error: verificationResult['error-codes'] }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}