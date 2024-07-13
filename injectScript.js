// injectScript.js

// 函数：从 /extra 获取脚本并注入到 HTML 中
async function injectScript() {
    const token = localStorage.getItem('turnstileToken');
    const uuid = localStorage.getItem('turnstileUUID');

    if (!token || !uuid) {
        console.error('Token or UUID not found in localStorage');
        return;
    }

    // 获取客户端 IP 地址
    let ip = null;
    try {
        const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
        const text = await response.text();
        const ipMatch = text.match(/ip=([0-9a-fA-F:\.]+)/);
        if (ipMatch) {
            ip = ipMatch[1];
        } else {
            console.error('IP address not found in trace response');
            return;
        }
    } catch (error) {
        console.error('Error fetching IP address:', error);
        return;
    }

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

// 当窗口加载时调用函数
window.addEventListener('load', injectScript);