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
  const jsonResponse = await response.json();

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

  const deviceResources = resources[deviceType] || resources.desktop;

  // 注入 CSS 资源
  if (deviceResources.preload.css) {
    const preloadStyle = document.createElement('style');
    preloadStyle.textContent = deviceResources.preload.css;
    document.head.appendChild(preloadStyle);
  }
  if (deviceResources.postload.css) {
    const postloadStyle = document.createElement('style');
    postloadStyle.textContent = deviceResources.postload.css;
    document.head.appendChild(postloadStyle);
  }

  // 注入 JS 资源
  if (deviceResources.preload.js) {
    const preloadScript = document.createElement('script');
    preloadScript.textContent = deviceResources.preload.js;
    document.body.appendChild(preloadScript);
  }
  if (deviceResources.postload.js) {
    const postloadScript = document.createElement('script');
    postloadScript.textContent = deviceResources.postload.js;
    document.body.appendChild(postloadScript);
  }

  // 注入其他资源
  if (deviceResources.preload.other) {
    const preloadOther = document.createElement('div');
    preloadOther.innerHTML = deviceResources.preload.other;
    document.body.appendChild(preloadOther);
  }
  if (deviceResources.postload.other) {
    const postloadOther = document.createElement('div');
    postloadOther.innerHTML = deviceResources.postload.other;
    document.body.appendChild(postloadOther);
  }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', loadResources);
