// scripts/custom.js

// 检测设备类型的函数
function detectDeviceType() {
  const ua = navigator.userAgent; // 获取用户代理字符串
  // 通过用户代理字符串检测设备类型
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'; // 返回移动设备类型
  }
  return 'desktop'; // 返回桌面设备类型
}

// 根据设备类型和顺序加载资源的函数
async function loadResources() {
  const deviceType = detectDeviceType(); // 检测设备类型
  const response = await fetch('/custom'); // 从 /custom 端点获取资源信息
  
  // 检查响应是否成功
  if (!response.ok) {
    console.error('Failed to fetch resources from /custom');
    return;
  }

  const jsonResponse = await response.json(); // 解析 JSON 响应

  // 根据设备类型获取相应的资源
  const resources = {
    mobile: {
      preload: jsonResponse.M_PRELOAD,
      postload: jsonResponse.M_POST_LOAD
    },
    desktop: {
      preload: jsonResponse.PRELOAD,
      postload: jsonResponse.POST_LOAD
    }
  };

  const deviceResources = resources[deviceType] || resources.desktop; // 获取设备对应的资源，如果没有则使用桌面资源

  // 预先加载资源
  loadResourceGroup(deviceResources.preload, document.head);

  // 检查 DOMContentLoaded 事件是否已经触发
  if (document.readyState === 'loading') {
    // 如果 DOM 仍在加载，等待 DOMContentLoaded 事件
    document.addEventListener('DOMContentLoaded', () => {
      loadResourceGroup(deviceResources.postload, document.body);
    });
  } else {
    // 如果 DOM 已经加载完成，直接加载后加载的资源
    loadResourceGroup(deviceResources.postload, document.body);
  }
}

// 加载资源组的函数
function loadResourceGroup(resourceGroup, targetElement) {
  // 预先加载 CSS 资源
  if (resourceGroup.css) {
    const preloadStyle = document.createElement('style');
    preloadStyle.textContent = resourceGroup.css;
    targetElement.appendChild(preloadStyle);
  }

  // 预先加载 JS 资源
  if (resourceGroup.js) {
    const scriptParts = resourceGroup.js.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
    scriptParts.forEach(scriptPart => {
      const scriptElement = document.createElement('script');
      scriptElement.async = /async/.test(scriptPart);
      scriptElement.defer = /defer/.test(scriptPart);

      const srcMatch = scriptPart.match(/src="([^"]+)"/);
      if (srcMatch) {
        scriptElement.src = srcMatch[1];
      } else {
        const contentMatch = scriptPart.match(/<script[^>]*>([\s\S]*?)<\/script>/);
        if (contentMatch) {
          scriptElement.textContent = contentMatch[1];
        }
      }

      targetElement.appendChild(scriptElement);
    });
  }

  // 预先加载其他资源
  if (resourceGroup.other) {
    const preloadOther = document.createElement('div');
    preloadOther.innerHTML = resourceGroup.other; // 使用 innerHTML
    targetElement.appendChild(preloadOther);
  }
}

// 页面加载完成后执行
loadResources();