export async function onRequest(context) {
    const TURNSTILE_SECRET_KEY = context.env.TURNSTILE_SECRET_KEY;
    const TURNSTILE_TIME = context.env.TURNSTILE_TIME || 14400; // 默认4小时（以秒为单位）
    const body = await context.request.json();
    const token = body.token;
    const uuid = body.uuid;

    if (!token || !uuid) {
        return new Response(JSON.stringify({ error: 'Token or UUID missing.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 使用 Cloudflare D1 数据库
    const db = context.env.D1;

    // 检查UUID是否过期
    const storedTimeResult = await db.prepare('SELECT timestamp FROM uuid_store WHERE uuid = ?').bind(uuid).first();
    if (storedTimeResult) {
        const storedTime = storedTimeResult.timestamp;
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - storedTime < TURNSTILE_TIME) {
            return new Response(JSON.stringify({ success: true }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `secret=${TURNSTILE_SECRET_KEY}&response=${token}`
    });

    const verificationResult = await verificationResponse.json();

    if (verificationResult.success) {
        // 存储UUID和当前时间
        const currentTime = Math.floor(Date.now() / 1000);
        await db.prepare('INSERT OR REPLACE INTO uuid_store (uuid, timestamp) VALUES (?, ?)').bind(uuid, currentTime).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } else {
        return new Response(JSON.stringify({ success: false, error: verificationResult['error-codes'] }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}