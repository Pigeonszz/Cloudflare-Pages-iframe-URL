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
  const deviceType = detectDeviceType();
  const response = await fetch('/custom');
  
  if (!response.ok) {
    console.error('Failed to fetch resources from /custom');
    return;
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

  loadResourceGroup(deviceResources.preload, document.head);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadResourceGroup(deviceResources.postload, document.body);
    });
  } else {
    loadResourceGroup(deviceResources.postload, document.body);
  }
}

// 加载资源组的函数
function loadResourceGroup(resourceGroup, targetElement) {
  if (resourceGroup.css) {
    const preloadStyle = document.createElement('style');
    preloadStyle.innerHTML = resourceGroup.css;
    targetElement.appendChild(preloadStyle);
  }

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

  if (resourceGroup.other) {
    const preloadOther = document.createElement('div');
    preloadOther.innerHTML = resourceGroup.other;
    targetElement.appendChild(preloadOther);
  }
}

// 页面加载完成后执行
loadResources();
