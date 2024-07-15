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

  // 页面加载完成后加载后加载的资源
  document.addEventListener('DOMContentLoaded', () => {
    loadResourceGroup(deviceResources.postload, document.body);
  });
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
    console.log('Preload JS:', resourceGroup.js); // 调试输出
    const scriptElement = document.createElement('script');
    scriptElement.innerHTML = resourceGroup.js;
    targetElement.appendChild(scriptElement);
  }

  // 预先加载其他资源
  if (resourceGroup.other) {
    console.log('Preload Other:', resourceGroup.other); // 调试输出
    const otherElement = document.createElement('div');
    otherElement.innerHTML = resourceGroup.other;
    targetElement.appendChild(otherElement);
  }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', loadResources);
