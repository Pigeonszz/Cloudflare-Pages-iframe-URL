// scripts/custom.js

// 检测设备类型的函数
function detectDeviceType() {
  const ua = navigator.userAgent;
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// 根据设备类型和顺序加载资源的函数
async function loadResources() {
  try {
    const deviceType = detectDeviceType();
    const response = await fetch('/custom');
    
    if (!response.ok) {
      throw new Error('Failed to fetch resources from /custom');
    }

    const jsonResponse = await response.json();

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

    const deviceResources = resources[deviceType] || resources.desktop;

    // 预加载资源
    loadResourceGroup(deviceResources.preload, document.head);

    // 检查 DOMContentLoaded 事件是否已经触发
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        loadResourceGroup(deviceResources.postload, document.body);
      });
    } else {
      loadResourceGroup(deviceResources.postload, document.body);
    }
  } catch (error) {
    console.error(error);
  }
}

// 加载资源组的函数
function loadResourceGroup(resourceGroup, targetElement) {
  // 预先加载 CSS 资源
  if (resourceGroup.css) {
    const preloadStyle = document.createElement('style');
    preloadStyle.innerHTML = resourceGroup.css; // 使用 innerHTML 替代 textContent
    targetElement.appendChild(preloadStyle);
  }

  // 预先加载 JS 资源
  if (resourceGroup.js) {
    const scriptParts = resourceGroup.js.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
    scriptParts.forEach(scriptPart => {
      const scriptElement = document.createElement('script');
      const asyncMatch = scriptPart.match(/<script[^>]*async/);
      const deferMatch = scriptPart.match(/<script[^>]*defer/);

      if (asyncMatch) {
        scriptElement.async = true;
      }
      if (deferMatch) {
        scriptElement.defer = true;
      }

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
