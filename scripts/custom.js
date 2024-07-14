// scripts/custom.js

// 检测设备类型
function detectDeviceType() {
  const ua = navigator.userAgent;
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// 根据设备类型和顺序加载资源
async function loadResources() {
  const deviceType = detectDeviceType();
  const response = await fetch('/custom');
  const html = await response.text();

  // 创建一个临时容器来解析 HTML
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = html;

  // 获取所有的 <style> 和 <script> 标签
  const styles = tempContainer.querySelectorAll('style');
  const scripts = tempContainer.querySelectorAll('script');

  // 根据设备类型和顺序加载资源
  const loadOrder = {
    mobile: ['M_PRELOAD', 'M_POST_LOAD'],
    desktop: ['PRELOAD', 'POST_LOAD']
  };

  const order = loadOrder[deviceType] || loadOrder.desktop;

  order.forEach(key => {
    styles.forEach(style => {
      if (style.textContent.includes(`<!-- ${key}_CONTENT -->`)) {
        const newStyle = document.createElement('style');
        newStyle.textContent = style.textContent.replace(`<!-- ${key}_CONTENT -->`, '').replace(`<!-- /${key}_CONTENT -->`, '');
        document.head.appendChild(newStyle);
      }
    });
    scripts.forEach(script => {
      if (script.textContent.includes(`<!-- ${key}_CONTENT -->`)) {
        const newScript = document.createElement('script');
        newScript.textContent = script.textContent.replace(`<!-- ${key}_CONTENT -->`, '').replace(`<!-- /${key}_CONTENT -->`, '');
        document.body.appendChild(newScript);
      }
    });
  });
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', loadResources);