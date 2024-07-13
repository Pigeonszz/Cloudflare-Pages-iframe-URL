// injectScript.js

// 函数：从 /extra 获取脚本并注入到 HTML 中
async function injectScript(token, uuid, ip) {
    try {
        const response = await fetch('/extra', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, uuid, ip })
        });

        if (!response.ok) {
            throw new Error('网络响应不正常 ' + response.statusText);
        }

        const text = await response.text();

        // 创建一个新的 DOM 元素来保存响应内容
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;

        // 从临时 div 中提取所有的 <style> 和 <script> 元素
        const styleElements = tempDiv.querySelectorAll('style');
        const scriptElements = tempDiv.querySelectorAll('script');

        // 将所有的 <style> 元素附加到 head
        styleElements.forEach(styleElement => {
            document.head.appendChild(styleElement);
        });

        // 将所有的 <script> 元素附加到 body
        scriptElements.forEach(scriptElement => {
            document.body.appendChild(scriptElement);
        });
    } catch (error) {
        console.error('获取操作出现问题:', error);
    }
}

// 函数：验证 Turnstile 令牌
async function verifyToken(token, uuid, ip) {
    const response = await fetch('/verify-turnstile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, uuid, ip })
    });

    const result = await response.json();
    return result.success;
}

// 函数：获取客户端 IP 地址
async function getClientIP() {
    return fetch('https://www.cloudflare.com/cdn-cgi/trace')
        .then(response => response.text())
        .then(data => {
            const ipMatch = data.match(/ip=([0-9a-fA-F:\.]+)/);
            return ipMatch ? ipMatch[1] : null;
        })
        .catch(error => {
            console.error('获取 IP 地址时出错:', error);
            return null;
        });
}

// 函数：检查 Turnstile 状态并注入脚本
async function checkTurnstileAndInjectScript() {
    const turnstileToken = localStorage.getItem('turnstileToken');
    const turnstileUUID = localStorage.getItem('turnstileUUID');

    if (turnstileToken && turnstileUUID) {
        const ip = await getClientIP();
        const isValid = await verifyToken(turnstileToken, turnstileUUID, ip);

        if (isValid) {
            injectScript(turnstileToken, turnstileUUID, ip);
        } else {
            window.location.href = 'turnstile.html';
        }
    } else {
        window.location.href = 'turnstile.html';
    }
}

// 当窗口加载时调用函数
window.addEventListener('load', checkTurnstileAndInjectScript);